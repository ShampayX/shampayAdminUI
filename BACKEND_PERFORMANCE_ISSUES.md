# Backend performance issues — for the API workspace

**Status: open. None of these are fixed.**

This file records work that **cannot be done from the frontend repo**. The
backend source is not in this workspace — `adminFree/` contains only
`shampayAdminUI` — so no query, index, aggregation or payload change has been
made or attempted.

Everything the frontend *could* do has been done and is listed under
"Frontend mitigation" per issue. Those mitigations reduce how often a slow
endpoint is called and stop a slow endpoint from freezing the UI. **They do not
make the endpoint faster.**

> ### How these conclusions were reached
>
> By reading the request path in the frontend source — which component calls
> which endpoint, in what order, how many times, and on which state changes.
>
> **Not** by authenticated runtime profiling. See [Issue E](#issue-e--no-authenticated-performance-measurement).
> No latency figure in this file is measured, because none could be. There are
> deliberately no millisecond numbers anywhere in this document.

---

## Summary

| # | Issue | API | Priority | FE mitigation |
|---|---|---|---|---|
| [A](#issue-a--permission-based-access-is-slow) | Permission Based Access slow | `get-users-by-parent` | High | Partial |
| [B](#issue-b--transaction-centre-aggregation) | Transaction Centre aggregation | `dashboard/getTransaction` | High | Partial |
| [C](#issue-c--vendor-routing-n1-no-batch-endpoint) | Vendor Routing N+1 | `product/getUserVendorSwitch` | **High** | Partial |
| [D](#issue-d--endpoints-that-return-the-whole-estate) | Whole-estate list endpoints | several | Medium | Partial |
| [E](#issue-e--no-authenticated-performance-measurement) | No authenticated profiling | — | High | None possible |

---

## Issue A — Permission Based Access is slow

**Screen** Permissions (`src/sections/RoleManagent/RoleManagement.tsx`)

**API** `POST admin/API_User_Management/get-users-by-parent/:parentId`
body `{ roleLevel }`

### Current frontend request pattern

**One** request on mount. That is the whole initial load — there is no second
call, no waterfall, no fan-out, and no duplicate.

```
mount ──> get-users-by-parent/:parentId  ──> renders the entire screen
```

Opening a user's profile then makes two more calls, which now run in parallel
(`admin/info/:parentId` and `getAdminUserDetailsModulePermission/:id`), and the
permissions call is skipped entirely for roleLevel 0/1.

### Why this is backend-dependent

Because the frontend does exactly one thing and then waits. There is no
frontend-side waterfall left to remove — **if the screen is slow, the time is
being spent inside that endpoint.** No amount of React work changes that.

The response also carries the full user list with no paging parameter, so the
payload grows linearly with the estate and the frontend has no way to ask for
less.

### What to investigate in the backend

- query execution time and the execution plan for `get-users-by-parent`
- indexes on the parent/user relationship (`parentId`, and `roleLevel` if it is
  filtered on)
- how the parent → descendants relationship is resolved — a recursive walk or a
  per-user lookup inside a loop would explain the latency
- unnecessary joins / `$lookup` stages
- response size, and which returned fields the screen actually renders
- whether sorting happens before or after filtering

### Suggested backend fix

- server-side pagination (`page`, `pageSize`) with a total count
- server-side search and role filtering, so the client stops receiving rows it
  will immediately hide
- project only the fields the list needs; move the rest behind the existing
  per-user detail endpoint
- indexes to match the actual query shape
- consider a materialised/denormalised descendant relation if the hierarchy walk
  is the cost

**Priority: High**

### Frontend mitigation — done, and what it does not do

| Done | Effect |
|---|---|
| Skeleton table on first load | Structure is visible immediately instead of a spinner |
| Refresh keeps existing rows on screen | A refresh no longer blanks the table |
| Failed refresh keeps last-good data + non-blocking warning bar | A transient 5xx no longer wipes the screen |
| Failure with no prior data → error state + Retry | Failure no longer looks like "no users exist" |
| Stale-response guard (`usersRequestRef`) | A superseded response cannot overwrite newer state |
| Profile calls parallelised, permissions call skipped for roleLevel 0/1 | Opening a profile costs one round trip, not two |

**None of this makes `get-users-by-parent` return faster.** The first load still
waits for that one request. Pagination cannot be added client-side in any
meaningful way, because the endpoint returns everything regardless.

---

## Issue B — Transaction Centre aggregation

**Screen** Transaction Centre (`src/sections/reports/AllTransactionRecords.tsx`)

**API** `POST dashboard/getTransaction` — the status/category summary band

Also on this screen, and **already efficient**:
`POST adminTransaction/get_transaction` is properly server-paged
(`pageInitData: { pageSize, currentPage }`, default 25) and returns
`totalNumberOfRecords`. **The screen was never pulling thousands of rows to show
the first page.**

### Current frontend request pattern

After the frontend changes, on mount:

```
mount ──> category/get_CategoryList          (filter row)
     ├──> adminTransaction/get_transaction   (page 1, 25 rows — server-paged)
     └──> dashboard/getTransaction           (aggregation)   <-- the slow one
```

`vendor/get_VendorList` and `adminTransaction/transactionTypes` used to fire
here too; they are now deferred to the first open of the advanced-filter modal.

`dashboard/getTransaction` re-runs whenever the date filter changes.

### Why this is backend-dependent

It is a server-side aggregation over the transaction set. Its cost is a function
of collection size, index coverage and pipeline shape — all of which live in the
backend. The frontend sends a small body (`dateFilter`, or a date range) and can
only wait.

### What to investigate in the backend

- the aggregation pipeline stage by stage, with `explain()`
- transaction collection size and growth
- index coverage for the date-range match, and whether `$match` runs **before**
  `$group` / `$sort` / `$lookup`
- `$lookup` stages — whether the joined data is used in the output at all
- whether the summary is recomputed per request or could be pre-aggregated
- response payload size and unused fields

### Suggested backend fix

- ensure `$match` on the date range is the first stage and index-backed
- compound index covering the date field plus whatever is grouped on
- drop `$lookup`s whose results are not used in the response
- pre-aggregate daily/period rollups if the same windows are requested
  repeatedly (today / this week / this month)
- keep `adminTransaction/get_transaction` as it is — it is already paged

**Priority: High**

### Frontend mitigation — done, and what it does not do

| Done | Effect |
|---|---|
| Two lookup requests deferred to the advanced-filter modal | Two fewer requests competing on mount, one of them large |
| Skeleton table with the real column headers | Structure visible immediately; no layout shift on load |
| `tableLabels` hoisted to module scope | Stable identity; the array is not rebuilt every render |
| Rows are `React.memo` | Parent re-renders (filter typing, modal open/close) do not re-render rows |
| Real error state + Retry when the fetch fails | Failure no longer renders as an empty table |

**The aggregation itself is untouched and is still the slowest call on the page.**
The list was already correctly paged, so there was no client-side over-fetch to
remove.

---

## Issue C — Vendor Routing N+1, no batch endpoint

**Screen** People → Vendor Routing
(`src/sections/tools/NewUserwiseVendor/VendorConfigContainer.tsx`)

**API** `GET product/getUserVendorSwitch/?userId=<id>&productId=<id>`

### Current frontend request pattern

The endpoint accepts **exactly one** `userId` + **one** `productId`. A service
with N products therefore costs N requests:

```
products ──> request 1  (product A)
         ──> request 2  (product B)
         ──> request 3  (product C)
         ──> ...
         ──> request N
```

what it should be:

```
products ──> one batch request ──> routing for all N products
```

### Why this is backend-dependent

There is no batch endpoint. The frontend cannot create one, and inventing a URL
the server does not serve would just break the screen. **This is an API design
gap, not a frontend defect.**

### Suggested backend fix

A batch variant that accepts many product ids in one call and returns routing
for all of them — conceptually:

```
POST product/getUserVendorSwitches
{ "userId": "...", "productIds": ["...", "...", "..."] }

-> { "data": { "<productId>": { neoNetworkVendor, directAgentVendor,
                                apiUserVendor, createdBy }, ... } }
```

**Use whatever naming and shape the API team's existing conventions call for** —
the name above is illustrative, not a requirement. The single-product endpoint
should stay for the edit dialog.

The same N+1 shape exists on **Providers → Provider Routing**
(`product/getActiveVendor/:productId`, one call per product) and would benefit
from the same batch treatment.

**Priority: High** — this is the largest single win available on this screen.

### Frontend mitigation — done, and what it does not do

Implemented in `src/sections/tools/NewUserwiseVendor/routingCache.ts`:

| Done | Effect |
|---|---|
| Per-service reference cache (vendor catalogue + product list) | These depend on the service, not the user — switching user no longer refetches either |
| Per `userId+productId` routing cache | Revisiting a user or flipping back to a service costs **zero** requests |
| In-flight de-duplication | Two components asking for the same key share one request |
| Concurrency pool, 6 at a time | N requests no longer saturate the browser connection limit and starve the rest of the page |
| Progressive render | Rows appear as soon as the product list lands and fill in individually; one slow product no longer blocks the whole table |
| Stale-request guard | Switching user/service mid-flight discards the superseded results |
| Targeted invalidation on save | Saving one product drops only that product's cache entry |

**It is still N requests on a cold load.** Caching, pooling and progressive
rendering change *when* the cost is paid and *how often*, not the request count
for a service the admin has not opened before. Only a batch endpoint fixes that.

---

## Issue D — Endpoints that return the whole estate

Several list endpoints return every record with no paging parameter, so the
frontend has no way to ask for less and must page in memory.

| Endpoint | Used by | Note |
|---|---|---|
| `admin/API_User_Management/list_API_users` | Ecosystem, Vendor Routing user picker | whole API-user estate in one response |
| `vendor/get_VendorList` | Transaction filters, Provider Directory | whole vendor estate incl. profile fields |
| `product/getAllUsersTransactionLimits` | Limits | every user × every product limit |
| `get-users-by-parent` | Permissions | see [Issue A](#issue-a--permission-based-access-is-slow) |

### Suggested backend fix

Add `page` / `pageSize` (plus a server-side `search`) and field projection to
these list endpoints, keeping the current unpaged behaviour as the default so
existing clients do not break.

**Priority: Medium** — becomes High as the estate grows.

### Frontend mitigation — done

Client-side paging, sorting and search over the already-loaded set
(`useDataTable`), so the browser renders 25 rows rather than all of them, and
`vendor/get_VendorList` is no longer requested on the Transaction Centre's
critical path. **The full payload is still downloaded and parsed.**

---

## Issue E — No authenticated performance measurement

**This is an environment/testing blocker, not a frontend defect.**

- `localhost:3010` is reachable and responds.
- Every endpoint returns `{"responseCode":411,"responseMessage":"No token provided."}`.
- No credentials are available in this workspace.
- The login flow cannot be completed, so no authenticated request has ever been
  made from here.

### Consequence

> **Every performance conclusion in this document is based on static
> request-path and code inspection, not on authenticated runtime profiling.**
>
> No API latency has been measured. No network trace, flame chart or slow-query
> log has been captured. No screen has been visually verified against live data.

### What is needed to close this

1. A working admin login for the target environment.
2. A network trace (DevTools → Network, "Disable cache", hard reload) for each
   slow screen, capturing per-request timing and payload size.
3. Server-side slow-query logging / `explain()` output for issues A and B.
4. Ideally a dataset of production-like size — these problems will not reproduce
   against a near-empty database.

**Priority: High** — until this is done, issues A and B are diagnosed by
inference. The *shape* of the problem is established from the code; the
magnitude is not.
