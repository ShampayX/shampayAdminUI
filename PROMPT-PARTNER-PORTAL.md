# PROMPT — paste this into Claude Code in the PARTNER PORTAL workspace

---

## Context

You are working on the **Shampay partner portal** — a React + TypeScript +
MUI v5 app built on the same Minimal / `material-kit-react` template as our
admin portal.

The **admin portal has already been through a full UI/UX turnover** across nine
phases. The partner portal has fewer screens, but every screen it does have must
end up looking and behaving like it came out of the same product. This is a
**complete visual and structural turnover**, not a re-skin.

You do not have access to the admin repo. Everything you need is specified
below — the shared component kit, the theme rules, the page patterns, and the
conventions that were learned the hard way. **Build the kit first, then convert
the screens onto it.**

---

## Non-negotiable rules

1. **Do not change functionality.** No API contract changes, no new endpoints,
   no altered request/response shapes, no changed business logic, validation,
   permissions or workflows. This is presentation only.
2. **Never invent a field.** Read the actual endpoint response before designing
   a column, card or badge. If the payload has no status field, there is no
   status column. If it has no timestamp, there is no "Last updated". This rule
   caused more rework in the admin portal than anything else — assume nothing.
3. **Never show a metric the API does not return.** Where a list endpoint pages
   server-side and returns no aggregate, any summary card computed from the
   current page must be captioned "on this page" — do not present it as a total.
4. **Build the shared kit once, reuse it everywhere.** Do not reimplement a
   table, filter bar or modal per screen. If a screen needs something new, add
   it to the kit.
5. **Do not delete components.** If a screen is being replaced, leave the old
   component on disk and remove it from the router/nav only, with a comment
   saying what replaced it.
6. **Inspect before you change.** For every screen: list its components, API
   calls, data model, filters, actions, validation, loading/empty/error states
   and permissions first. Report that inventory to me before redesigning.

---

## Step 1 — Inspect and report (do this before writing any UI)

Produce an inventory for me covering, for the whole app:

- Every route and the component behind it.
- Every sidebar/nav entry, and **which ones are dead** (path defined but no
  route registered, or a route that renders a static mock). In the admin portal
  we found three dead nav links and one nav entry whose route was never
  registered at all — expect the same here.
- Every API endpoint called, per screen.
- Which screens already use a shared component vs. bespoke markup.
- Every place a colour is hardcoded as a hex literal.
- The current loading component(s) and how many call sites each has.

Then tell me your conversion order, cheapest-and-safest first. **Wait for my go
before starting Step 3.**

---

## Step 2 — Build the shared component kit

Create `src/components/page-kit/` with a barrel `index.ts`. This is the exact
kit the admin portal runs on; replicate it.

### `PageChrome.tsx`
- `PageHeader({ title, subtitle, actions })` — 25px/700 title, 14.5px muted
  subtitle, action cluster right-aligned, wraps to a column on mobile.
- `PageActionButton({ children, startIcon, tone, onClick, type, disabled })` —
  the filled primary action. 42px tall, radius 1.5, 13px/700 uppercase,
  letter-spacing 0.6.
- `PageGhostButton(...)` — same metrics, outlined/quiet, `1px solid divider`,
  border darkens on hover.
- `FilterBar({ children })` — rounded card, `1px solid divider`, holds the
  filter row; wraps on small screens.
- `FilterSlot({ icon, children, grow, minWidth })` — one bordered 48px control
  slot inside the FilterBar, with a leading muted icon.
- `KitTabs({ value, onChange, children })` — scrollable tab rail, uppercase
  12.5px/700 labels, 3px indicator, bottom divider.
- `FilterIconButton({ children, onClick, title })` — 48×48 square icon button
  sized to sit in a FilterBar row.

### `DataTable.tsx`
- `DataTable({ columns, children, isEmpty, emptyMessage, minWidth, maxHeight, footer, sortBy, sortDir, onSort })`
  — bordered table card, **sticky tinted header**, horizontal scroll inside its
  own container, optional click-to-sort headers, `footer` slot for pagination.
- `KitRow` — styled `TableRow`: 1px divider between rows, tinted hover, no
  border on the last row.
- `KitHeadCell` — 11px/700 uppercase, letter-spacing 0.8, muted, sticky.
- `StatusPill({ status })` — soft uppercase pill. Map the status string to a
  semantic tone via a `STATUS_TONES` record. Seed it with:
  `success active approved enabled completed` → green;
  `pending in_process processing hold` → amber;
  `failed failure rejected reversed` → red;
  `initiated` → info; `inactive disabled queued refund refunded` → neutral.
  Add keys as you meet real statuses — **never invent one.**
- `StackedCell({ primary, secondary, bold })` — two-line cell, strong primary
  with a muted 11.5px caption.
- `ModeLabel({ mode })` — DEBIT red / CREDIT green.

### `FormKit.tsx`
- `FormCard({ title, subtitle, actions, children })` — bordered card with a
  titled header and divider.
- `FormGrid({ children, columns })` — responsive field grid, collapses to one
  column on mobile.
- `FormActions({ children })` — right-aligned footer row above a top border.
- `ModalShell({ title, subtitle, onClose, width, actions, children })` —
  centred panel with a sticky titled header, scrollable body, footer action row,
  `maxHeight: 90vh`, responsive width. **Every modal in the app uses this.**

### `SearchField.tsx`
- `SearchField({ value, onChange, placeholder, count, total, minWidth })` —
  instant in-memory search inside a FilterSlot, live match-count chip, clears on
  Esc, focuses on `/`.
- `CopyText({ value, children, size })` — inline copy-to-clipboard for IDs,
  codes, UTRs. Fires a toast on copy.

### `StatCard.tsx`
- `StatCard({ label, value, caption, icon, tone })` — one number, one uppercase
  label, one caption, a tinted icon tile. Tones:
  `primary | success | warning | error | neutral`.
- `StatGrid({ children, columns })` — 4 across desktop, 2 tablet, 1 mobile.
- `UsageMeter({ used, total, height })` — bar that turns amber past 75% and red
  past 90%.

### `States.tsx`
- `EmptyState({ title, description, icon, action, boxed })` — circular muted
  icon, title, one line of explanation, optional fixing action.
- `LoadingState({ label, height })` — centred spinner **for small inline
  regions only**. Full-screen loads use skeletons, below.

### `Skeletons.tsx` — this matters, do not skip it
- `HeaderSkeleton`, `FilterBarSkeleton`, `StatGridSkeleton`,
  `TableSkeleton({ columns, rows, minWidth })`, `CardListSkeleton`,
  `RecordListSkeleton`, `ListPageSkeleton`.
- **`TableSkeleton` takes the same `columns` array the real table uses**, so the
  real header renders immediately and only the rows swap in on load — the page
  never jumps.
- Keep them **quiet**: MUI `pulse`, bars tinted
  `rgba(145,158,171,0.16)` light / `0.20` dark. **No shimmer sweep, no staggered
  timing** — forty independently shimmering rows look broken.
- Column `id` type must be `string | number`; legacy tables use numeric ids.

### `useDataTable.ts`
- `useDataTable(rows, { searchKeys, rowsPerPage, storageKey })` → `{ query,
  setQuery, sortBy, sortDir, toggleSort, page, setPage, rowsPerPage,
  changeRowsPerPage, results, paged, total, grandTotal, isEmpty, isFiltered }`.
  Client-side search (precomputed lowercase haystacks), sort, page. Remembers
  rows-per-page under `storageKey`.
- `exportToExcel(rows, fileName, sheetName)` using the `xlsx` dep.
- `useSlashFocus()` — focuses an input on `/` unless already typing.

---

## Step 3 — Theme

The brand colour is **purple `#7635dc`** (light `#B985F4`, dark `#431A9E`,
lighter `#EBD6FD`, darker `#200A69`).

1. Find how the theme preset is selected. In the admin portal it was
   `presets[Number(process.env.REACT_APP_PRESET)]`, and the env var pointed at
   the **blue** preset — so every `primary` button, focus ring, link and selected
   state was blue while the sidebar was purple. **Check for exactly this bug.**
2. Export a single `brandPreset` and make it the fallback when the env var is
   unset or out of range. One purple, defined once.
3. Semantic colours everywhere: **purple** = primary/selected, **green** =
   success/active, **red** = error/destructive, **amber** = warning/pending,
   **neutral** = inactive/default.
4. **Replace hardcoded hexes with theme tokens** — but leave categorical data
   palettes alone (e.g. role chips where each role needs a distinct colour;
   flattening those to brand purple makes two roles unreadable). Chrome gets
   tokens; data encoding keeps its palette.
5. Set `CalendarMonthRoundedIcon` as the default `OpenPickerIcon` in the
   DatePicker theme override so every picker in the app matches.

### Toasts
If the app uses notistack, **do not touch the call sites** — restyle the shared
component only: paper card, 12px radius, dropdown shadow, a 4px coloured rail
and wash on the leading edge per variant, 14px/700 message, 34px icon tile.
Scope the styles under `#root .SnackbarContent-root` — that specificity is what
beats notistack's own variant colours.

---

## Step 4 — Page patterns

Every list screen follows the same skeleton:

```
PageHeader (title, subtitle, actions: Refresh / Export / primary action)
StatGrid   (only if the data genuinely supports it)
KitTabs    (only if the screen has real sub-views)
FilterBar  (SearchField + FilterSlots)
DataTable  (KitRow rows, footer={<TablePagination/>})
```

with the four states handled explicitly:

- **Loading** → skeleton matching that exact layout. Never a bare spinner for
  main content, never a blank screen.
- **Empty** → `EmptyState`, with different copy for "nothing exists yet" vs
  "nothing matches your filter", and the fixing action where one exists.
- **Error** → `EmptyState` with a **Retry** button. A failed request must never
  render as an empty table — that reads as "no data" and is a lie.
- **Loaded** → the table.

### Detail screens
Header + identity strip + `KitTabs` for sections + `FormCard` per section.
Prefer a **detail route or a right-hand `Drawer`** over cramming everything into
one giant form.

### Records over cards
For anything operational — lists of entities, transactions, requests, users —
use a **dense record table**, not a grid of tall cards. In the admin portal one
screen rendered a two-column grid of ~900-line cards, about two records per
screen; it became a sortable table with the full per-record panel moved into a
drawer. Do the same wherever you find card grids over operational data.

---

## Step 5 — Frontend performance (do this as you convert)

Check each screen for these, all of which were real in the admin portal:

1. **Sequential independent requests.** If A and B do not depend on each other,
   `Promise.all` them.
2. **Requests on the critical path that the first view does not need.** Filter
   dropdown lookups, reference data for a modal — defer those until the filter
   or modal is opened, guarded by a `useRef` so they load once.
3. **Effects keyed on the wrong dependency.** We found a category list refetched
   on every user change even though it did not depend on the user — *and* the
   refetch reset the user's service selection. Both a perf bug and a
   correctness bug.
4. **N+1 fan-out.** If the API forces one request per item and there is no batch
   endpoint: cache by key, de-duplicate in-flight requests, cap concurrency
   (~6 — unbounded `Promise.all` saturates the browser's connection limit), and
   **render progressively** so one slow item does not block the whole table.
   Then document the missing batch endpoint rather than faking one.
5. **`setState` inside a `forEach` of requests** — batch into one `Promise.all`
   and one `setState`.
6. **Stale responses.** A monotonic `useRef` counter per request; drop a
   response whose id is no longer current.
7. **Array literals in the render body** passed as props — hoist to module
   scope so identity is stable.
8. **Check whether `<React.StrictMode>` is on.** If it is, effects
   double-invoke in dev and you will chase phantom duplicate requests.
9. **Refresh must not blank the screen** — keep existing rows while refetching;
   only the first load shows a skeleton.
10. **A failed refresh must keep the last-good data** and show a non-blocking
    warning bar, not wipe the table.

**Do not claim a backend-caused slowness is fixed.** If a screen makes one
request and waits, the time is in the endpoint — record it for the backend team
and say so plainly.

---

## Step 6 — Navigation

- Audit the sidebar for **dead entries** — nav item + path defined but no route
  registered. Remove those from nav only; leave the components on disk.
- Where role/module-based nav filtering exists, **find out what it matches on
  before renaming anything.** In the admin portal the filter matched on the raw
  `title` strings in the nav config (several with trailing spaces), so renaming
  a title silently hid menu items for whole roles. Display names went into a
  separate label map instead. Check for the same trap here.
- Consolidate aggressively: if several nav entries differ only by which endpoint
  they call, they are one screen with a selector. In the admin portal fifteen
  provider entries — thirteen of them near-identical slab editors — became four
  screens driven by a registry, with the service in the URL (`?service=dmt1`) so
  deep links still work and every legacy path redirects to its successor.

---

## Step 7 — Responsive & accessibility

Every converted screen must work on desktop, tablet and phone.
- Wide tables scroll inside their own container; the page body never scrolls
  horizontally.
- Filters wrap; forms collapse to one column; modals are width-capped and
  height-capped with an internal scroll.
- Do not shrink a dense table until it is unreadable — scroll it, or move
  secondary fields into a detail drawer.

---

## Step 8 — Validate

Run whatever the project has: `tsc --noEmit`, `eslint`, the test suite, and a
production build. **Fix every error you introduce.** Pre-existing warnings can
stay — say how many there were before and after so it is clear you added none.

Then verify per screen: navigation, API data, actions, search, filters,
pagination, forms, modals, confirmations, toasts, loading/empty/error states,
responsive behaviour, and no new console errors.

---

## What to report back

1. The Step 1 inventory (routes, dead nav, endpoints, hardcoded colours).
2. Which screens you converted and what changed structurally on each.
3. Kit components created, and anything you added beyond the list above.
4. Fields you deliberately did **not** show because the API does not return
   them.
5. Performance issues found, split into **fixed in frontend** vs
   **backend-dependent** — with the backend ones written to a
   `BACKEND_PERFORMANCE_ISSUES.md` file, not buried in chat.
6. Validation results.
7. **Anything still broken or unfinished, at the very end, stated plainly.** Do
   not tell me everything is done if it is not.

Do not stop to ask me which design to pick — use your judgement and the spec
above. Do ask if you find something that would change functionality.
