# PROMPT — paste this into Claude Code in the BACKEND workspace

---

## Context

You are working on the backend API that serves the **Shampay admin portal**
(React/TypeScript frontend, separate repo). The frontend has already been
optimised as far as it can be. Four performance problems remain and **all of
them are inside this backend**.

The frontend team could not measure anything: the API was reachable on
`localhost:3010` but every request returned
`{"responseCode":411,"responseMessage":"No token provided."}` and no credentials
were available. So the analysis below is derived from reading the frontend's
request path — which endpoint is called, in what order, how many times, on which
state changes. **The shape of each problem is established. The magnitude is
not.**

Your first job is therefore to **measure before you change anything.**

---

## Ground rules

1. **Measure first.** For each issue below, capture real timings and an
   execution plan before touching code. Do not optimise on a hunch.
2. **Do not break the API contract** unless a step explicitly says to add a new
   endpoint. The frontend is deployed and depends on the current response
   shapes. Additive changes only — new optional query params, new endpoints —
   unless you and I agree otherwise.
3. **Do not report an issue as fixed unless you measured it before and after**
   and can show both numbers.
4. **Do not invent numbers.** If you could not measure something, say so.
5. Work through the issues in priority order: A, C, B, then D.
6. If a problem turns out **not** to reproduce, say that clearly — that is a
   valid and useful outcome. Do not manufacture an optimisation to look busy.

---

## THE RESPONSE CONTRACT IS FROZEN

This is the most important rule in this document. A deployed React frontend
reads these responses. **If you change a response shape, the admin portal
breaks in production.**

### You may NOT, under any circumstances:

- remove a field from a response
- rename a field
- change a field's type (string → number, object → array, null → absent)
- change the response envelope (e.g. array → `{ data, total }`)
- change the meaning of an existing field
- change the **default** behaviour of an existing endpoint — a request with no
  new parameters must return **byte-identical** output to today
- change status codes, the `code` / `responseCode` convention, or error shapes

### You MAY:

- add a brand-new endpoint
- add a new **optional** request parameter, where omitting it preserves today's
  exact behaviour
- add a new field to a response (additive is safe — the frontend ignores what it
  does not read)
- change anything at all *behind* the response: queries, indexes, pipeline
  stages, caching, joins — as long as the bytes out are the same

### Where a fix seems to require a breaking change

**Propose it. Do not apply it.** Write it up under a heading
"Proposed breaking changes — NOT APPLIED", with the field(s) involved and the
reason. I will check each one against the frontend source and tell you which are
safe. Removing a field that "looks unused" is exactly how this goes wrong — you
cannot see the frontend from where you are sitting.

---

## Step 0 — Before any code change

Do these and report back:

1. Identify the framework, ORM/driver and database (Mongo? Postgres?), and
   confirm which service owns each endpoint below.
2. Get a working admin credential for a non-production environment and confirm
   you can call the endpoints.
3. Establish **dataset size**: row/document counts for the users, transactions,
   products and vendor-routing collections/tables. These problems will not
   reproduce against a near-empty database — if the dev data is tiny, say so and
   tell me what you need (an anonymised production-sized dump, or a seed
   script).
4. Turn on slow-query logging / profiling for the session.
5. For each of the four endpoints, record a **baseline**: p50 and p95 response
   time, response payload size in KB, and the query execution plan.

Report the baseline table before starting Issue A.

---

## Issue A — `get-users-by-parent` is slow (Priority: HIGH)

**Endpoint:** `POST admin/API_User_Management/get-users-by-parent/:parentId`
**Body:** `{ roleLevel }`
**Screen it serves:** Permissions / role management

### What the frontend does

Exactly **one** request on mount, then renders the entire screen from it. There
is no waterfall, no fan-out, no duplicate call and no retry loop. The frontend
has already been made resilient (skeletons, stale-data-on-refresh, retry), but
none of that makes the endpoint faster.

The response carries the **full user list with no paging parameter**, so the
payload grows linearly with the estate and the client has no way to ask for
less.

### Investigate

- Execution time and full execution plan for the main query.
- How the parent → descendants relationship is resolved. **Specifically check
  for a recursive walk or a per-user lookup inside a loop** — that is the most
  likely cause of the reported slowness.
- Indexes on `parentId` and on `roleLevel` if it is filtered on.
- Any joins / `$lookup` stages, and whether their output is actually used in the
  response.
- Response payload size, and which returned fields the list screen actually
  renders (the frontend shows: name, email, role, roleLevel, modules, isActive).
- Whether sorting happens before or after filtering.

### Likely fixes, in order of expected value

1. Index the parent/user relation to match the real query shape.
2. Replace any N+1 hierarchy walk with a single set-based query (recursive CTE
   on Postgres; `$graphLookup` on Mongo) or a denormalised descendant table.
3. **Add optional server-side pagination** — new optional `page` / `pageSize`
   params. **A request without them must return exactly what it returns
   today**, same envelope, same fields, same order. Return the total count in a
   new additive field. I will then wire the frontend to opt in.
4. Add optional server-side `search` and role filtering — again, opt-in only.
5. Field projection: **propose, do not apply.** Tell me which returned fields
   you believe are unused and how much payload they cost. I will verify against
   the frontend source before anything is removed. The list screen renders
   name, email, role, roleLevel, modules and isActive, but other fields may
   feed the profile drawer, and you cannot see that from the backend.

### Definition of done

Before/after p95 for a realistic estate size, plus the execution plan showing
the index being used.

---

## Issue B — `dashboard/getTransaction` aggregation (Priority: HIGH)

**Endpoint:** `POST dashboard/getTransaction`
**Screen it serves:** Transaction Centre — the status/category summary band

### Important context

The transaction **list** on the same screen
(`POST adminTransaction/get_transaction`) is **already correct** — it is
server-paged via `pageInitData: { pageSize, currentPage }`, defaults to 25 rows,
and returns `totalNumberOfRecords`. **Do not "fix" it. It was never pulling
thousands of rows.**

The slow call is the aggregation that produces the summary counts. The frontend
sends a small body (`dateFilter`, or a date range) and re-runs it whenever the
date filter changes.

### Investigate

- The aggregation pipeline **stage by stage**, with `explain()` / `EXPLAIN
  ANALYZE`.
- Transaction collection/table size and growth rate.
- **Whether the date-range `$match` is the first stage and index-backed.** If a
  `$sort`, `$group` or `$lookup` runs before the match, that is almost certainly
  the whole problem.
- Index coverage for the date field plus whatever is grouped on.
- Any `$lookup` whose joined data does not appear in the response.
- Response payload size and unused fields.

### Likely fixes

1. Move the date-range `$match` to the first stage; add a compound index
   covering it plus the group key. **Pure internal change — safe.**
2. Remove `$lookup` stages whose joined data does not appear in the **response
   output**. Safe only if the output is unchanged; verify by diffing the
   response before and after against the same input. If removing a lookup
   changes even one byte of output, stop and propose it instead.
3. If the same windows are requested repeatedly (today / this week / this
   month), pre-aggregate period rollups and serve those — **the response shape
   must stay identical**, this is a change of how the numbers are computed, not
   of what is returned.
4. Consider a short-TTL cache keyed on the date window — the summary does not
   need to be second-accurate. Again, same shape out.

### Definition of done

Before/after p95 for each date window the UI offers, plus the execution plan.

---

## Issue C — Vendor routing N+1: no batch endpoint (Priority: HIGH)

**Endpoint:** `GET product/getUserVendorSwitch/?userId=<id>&productId=<id>`
**Screen it serves:** People → Vendor Routing

### The problem

The endpoint accepts **exactly one** `userId` and **one** `productId`. A service
with N products therefore costs **N HTTP requests**:

```
products ──> request 1  (product A)
         ──> request 2  (product B)
         ──> request 3  (product C)
         ──> ... N
```

This is an **API design gap, not a frontend defect**. The frontend cannot fix
it — it has already added caching, in-flight de-duplication, a concurrency cap
of 6 and progressive rendering, which reduce *how often* and *when* the cost is
paid but not the request count on a cold load.

### What to build

A batch variant that accepts many product ids in one call. Conceptually:

```
POST product/getUserVendorSwitches
{ "userId": "...", "productIds": ["...", "...", "..."] }

->
{
  "code": 200,
  "data": {
    "<productId>": {
      "neoNetworkVendor":   { "vendorId": "...", "vendorName": "..." },
      "directAgentVendor":  { "vendorId": "...", "vendorName": "..." },
      "apiUserVendor":      { "vendorId": "...", "vendorName": "..." },
      "createdBy":          { "email": "...", "date": "..." }
    },
    ...
  }
}
```

**Use whatever naming and response convention this API already follows — the
above is illustrative, not a requirement.** Tell me the final contract and I
will wire the frontend to it.

Requirements:
- Keep the existing single-product endpoint; the edit dialog still uses it.
- Resolve all products in **one** database round trip, not a server-side loop
  that just moves the N+1 behind the API.
- Cap or document the maximum `productIds` length.
- Products with no routing configured must appear in the response (as null or
  omitted — your choice, just tell me which).

### Same problem, second location

`GET product/getActiveVendor/:productId` — used by **Providers → Provider
Routing**, also one call per product. Give it the same batch treatment.

### Definition of done

The new endpoint, its contract documented, and a measurement showing one batch
call for N products versus N individual calls.

---

## Issue D — List endpoints return the whole estate (Priority: MEDIUM)

These return every record with no paging parameter, so the frontend must
download everything and page in memory:

| Endpoint | Screen |
|---|---|
| `GET admin/API_User_Management/list_API_users` | Ecosystem, Vendor Routing user picker |
| `GET vendor/get_VendorList` | Transaction filters, Provider Directory |
| `GET product/getAllUsersTransactionLimits` | Limits (every user × every product) |
| `POST admin/API_User_Management/get-users-by-parent/:parentId` | see Issue A |

`getAllUsersTransactionLimits` is the worst shape — it is a full cross product.

### What to do

Add **optional** `page` / `pageSize` and an optional server-side `search`.
**A request with none of those params must behave exactly as it does today** —
same envelope, same fields, same ordering. Report the new contracts and I will
migrate the frontend screen by screen.

Field projection here is **propose-only**, same as Issue A — list which fields
look unused and what they cost, and I will confirm against the frontend before
anything is dropped.

**Priority: Medium — becomes High as the estate grows.**

---

## What to report back

1. **Baseline table** — endpoint, p50, p95, payload size, dataset size.
2. **Per issue** — what you found, what you changed, before/after numbers,
   execution plan evidence.
3. **New endpoint contracts** for Issue C (and D if you add params), so I can
   wire the frontend.
4. **Proposed breaking changes — NOT APPLIED.** Anything you wanted to remove
   or reshape but did not, with the reason and the payload saving. I will check
   each against the frontend.
5. **Anything that did not reproduce**, stated plainly.
6. **Anything you could not do** and what you need to unblock it.
7. **Confirmation that every existing endpoint still returns its current shape**
   for a request with no new parameters — and how you verified that (a
   before/after response diff, ideally).

Do not tell me an issue is fixed without before/after numbers. If you could not
measure, say "not measured" — that is fine and expected for some of this.
