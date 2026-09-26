// ----------------------------------------------------------------------
// Shared reading of an `Api()` response.
//
// `Api()` (auth/JwtContext.tsx) resolves to either
//   { status: <http status>, data: <parsed json body> }
// or the string "error" when the request never produced JSON (network down,
// CORS refusal). Everything in this file is written against those two shapes.
//
// The backend contract is now uniform: EVERY response body is `{ code, message }`
// and the HTTP status matches `code`. There is no HTML error page any more, so
// "did this parse as JSON?" defences are dead code.
//
// Item 1b: a 200 status is NOT success on its own. The endpoints that used to
// answer `{ code: 200, message: "...updated successfully.", data: { acknowledged:
// false } }` when nothing matched now answer `{ code: 404, message: "Product not
// found." }`. A screen that toasts on `status == 200` alone keeps reporting a
// save that never happened, so every mutation must go through `isOk`.
//
// Item 1c: 4xx messages are written for an operator to read, so show them
// verbatim. 5xx messages are deliberately non-specific, so show our own copy.
// ----------------------------------------------------------------------

/** What `Api()` resolves to. `"error"` means the request never returned JSON. */
export type ApiResponse =
  | { status: number; data: any }
  | "error"
  | undefined
  | null;

/** Shown instead of a 5xx `message`, which is deliberately non-specific. */
export const GENERIC_ERROR =
  "Something went wrong at our end. Please try again, and tell an administrator if it keeps happening.";

/** 500 from an admin screen has one specific cause - see `isPlatformConfigError`. */
export const PLATFORM_CONFIG_ERROR =
  "The platform is missing a product, category or slab configuration for this action. " +
  "This needs an administrator to fix - retrying will not help.";

/** 501 is the designed answer on ~18 endpoints, not a failure to retry. */
export const NOT_INTEGRATED_MESSAGE = "No vendor is integrated for this yet.";

/** True when the request never produced a JSON body at all. */
export function isTransportFailure(res: ApiResponse): boolean {
  return res === "error" || res === undefined || res === null;
}

function body(res: ApiResponse): any {
  return isTransportFailure(res) ? undefined : (res as any).data;
}

function httpStatus(res: ApiResponse): number | undefined {
  return isTransportFailure(res) ? undefined : (res as any).status;
}

/**
 * The only correct success test. Requires BOTH a 200 transport status and
 * `code === 200` in the body (item 1b).
 */
export function isOk(res: ApiResponse): boolean {
  return httpStatus(res) === 200 && Number(body(res)?.code) === 200;
}

/**
 * The effective status code. Prefers the body's `code` because it is what the
 * backend guarantees; falls back to the HTTP status line.
 */
export function statusOf(res: ApiResponse): number | undefined {
  const code = Number(body(res)?.code);
  if (Number.isFinite(code) && code > 0) return code;
  return httpStatus(res);
}

/**
 * A missing or invalid token now answers 401. It used to answer HTTP 411, which
 * was this backend's internal "no token" value leaking into the status line - so
 * no portal handler for 401 could ever have fired. The body still carries
 * `responseCode: 411`, so both are accepted here (item 3d / context).
 */
export function isAuthFailure(res: ApiResponse): boolean {
  const b = body(res);
  return (
    httpStatus(res) === 401 ||
    Number(b?.code) === 401 ||
    Number(b?.responseCode) === 411 ||
    Number(b?.responseCode) === 410 ||
    Number(b?.code) === 410
  );
}

/** 501 means "no vendor integrated yet". Never retry it (context). */
export function isNotIntegrated(res: ApiResponse): boolean {
  return statusOf(res) === 501;
}

/**
 * A 500 from an admin screen means the platform is missing a product, category
 * or slab configuration. That is ours to fix and is worth surfacing distinctly
 * rather than retrying (item 1c).
 */
export function isPlatformConfigError(res: ApiResponse): boolean {
  return statusOf(res) === 500;
}

/**
 * The message to put in front of the operator.
 *  - 4xx  -> the backend `message`, verbatim. These are written to be read, and
 *            48 validation messages moved from 500 to 400 so they land here now.
 *  - 501  -> "no vendor integrated".
 *  - 500  -> the platform-configuration copy.
 *  - else -> our own generic copy.
 */
export function failureMessage(res: ApiResponse): string {
  if (isTransportFailure(res)) return GENERIC_ERROR;

  const status = statusOf(res);
  const message = body(res)?.message;

  if (status === 501) return NOT_INTEGRATED_MESSAGE;
  if (status === 500) return PLATFORM_CONFIG_ERROR;
  if (
    status &&
    status >= 400 &&
    status < 500 &&
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }
  return GENERIC_ERROR;
}

/** The backend `message` on a success, or a caller-supplied fallback. */
export function successMessage(res: ApiResponse, fallback = "Saved."): string {
  const message = body(res)?.message;
  return typeof message === "string" && message.trim()
    ? message.trim()
    : fallback;
}

/**
 * Large reports are capped at `rowCeiling` (1000) rows and flagged with
 * `truncated: true`. Returns a sentence to show the user, or "" when the result
 * is complete (context).
 */
export function truncationNotice(res: ApiResponse): string {
  const b = body(res);
  if (!b?.truncated) return "";
  const ceiling = b?.rowCeiling;
  return ceiling
    ? `Showing the first ${ceiling} rows only. Narrow the filters to see the rest.`
    : "This is a partial result. Narrow the filters to see the rest.";
}

/** True when the response says it was capped. */
export function isTruncated(res: ApiResponse): boolean {
  return Boolean(body(res)?.truncated);
}

type Enqueue = (message: string, options?: any) => any;

/** Toast the backend's success message (or `fallback`) with a success variant. */
export function notifyOk(
  enqueueSnackbar: Enqueue,
  res: ApiResponse,
  fallback = "Saved."
) {
  enqueueSnackbar(successMessage(res, fallback), { variant: "success" });
}

/**
 * Toast a failure with an error variant, so a 404 "Product not found." can no
 * longer be mistaken for a save (item 1b). Logs 5xx, which is ours to fix.
 */
export function notifyFailure(enqueueSnackbar: Enqueue, res: ApiResponse) {
  if (isPlatformConfigError(res)) {
    // eslint-disable-next-line no-console
    console.error(
      "[platform config] missing product/category/slab configuration",
      res
    );
  }
  enqueueSnackbar(failureMessage(res), { variant: "error" });
}

/**
 * The whole success/failure decision in one call. Returns whether it succeeded
 * so the caller can close a dialog, refetch, etc.
 */
export function notifyResult(
  enqueueSnackbar: Enqueue,
  res: ApiResponse,
  fallback = "Saved."
): boolean {
  if (isOk(res)) {
    notifyOk(enqueueSnackbar, res, fallback);
    return true;
  }
  notifyFailure(enqueueSnackbar, res);
  return false;
}

// ----------------------------------------------------------------------
// Item 3a: the readiness endpoints answer on a DIFFERENT shape.
//
// `/admin/readiness/*` handlers return a plain object and rely on an envelope
// middleware to wrap it. That middleware is not on the mount the routes now use
// (`router.use('/admin/readiness', adminOnly, ...)` — no `v2Envelope`), so a
// success arrives bare:
//
//   { partnerId, name, email, ready, blocking, warnings, checks }
//   { total, notReady, partners: [...] }
//   { total, notRoutable, vendors: [...] }
//
// Failures still arrive as `{ code, message }` with a matching status.
//
// `isOk` therefore does NOT apply to these, because there is no `code` on a
// success. This reader accepts the bare shape and the enveloped one, so the
// screens keep working whichever way that mount ends up.
// ----------------------------------------------------------------------

export type ReadinessCheck = {
  name: string;
  ok: boolean;
  severity: "blocking" | "warning";
  detail: string;
};

export type ReadinessReport = {
  ready: boolean;
  blocking: string[];
  warnings: string[];
  checks: ReadinessCheck[];
  [key: string]: any;
};

/** Unwrap a readiness response, bare or enveloped. Returns null if it is neither. */
export function readReadiness(res: ApiResponse): any | null {
  if (isTransportFailure(res)) return null;
  const b = (res as any).data;
  if (!b || typeof b !== "object") return null;
  // A failure body is `{ code, message }` with no payload of its own.
  if (b.code && Number(b.code) !== 200) return null;
  // Enveloped: the report sits under `data`.
  if (b.data && typeof b.data === "object") return b.data;
  return b;
}

/** A single entity's readiness report, or null. */
export function readReadinessReport(res: ApiResponse): ReadinessReport | null {
  const body = readReadiness(res);
  if (!body || typeof body.ready !== "boolean") return null;
  return body as ReadinessReport;
}
