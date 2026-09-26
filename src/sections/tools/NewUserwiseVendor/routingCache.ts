// ----------------------------------------------------------------------
// Vendor routing - request cache, in-flight de-duplication and a concurrency
// pool.
//
// WHY THIS EXISTS
//
// `product/getUserVendorSwitch` takes exactly one userId + one productId, so a
// service with N products costs N requests.
//
// **There is a batch endpoint now** (Stage 3): `POST product/getUserVendorSwitches`
// takes `{ userId, productIds[] }` and resolves the lot in two database round
// trips. `prefetchRouting` below calls it once and seeds the same cache the
// per-product path reads, so the existing loop turns into N cache hits and the
// machinery below stays as the fallback for anything the batch did not cover.
//
// What the frontend CAN do is stop making the same request twice and stop
// firing all N at once:
//
//   * the vendor catalogue and product list depend only on the SERVICE, not on
//     the selected user, so switching user no longer refetches them
//   * a routing response is cached per user+product until something writes to
//     it, so revisiting a user or flipping back to a service is free
//   * two components asking for the same key at the same time share one request
//   * requests run through a small pool instead of N-wide, so a service with
//     forty products does not saturate the browser's connection limit and
//     leave the rest of the page unable to load
//
// Module-level rather than React state on purpose: it has to survive the
// unmount/remount that happens every time the user or service selector changes.
// ----------------------------------------------------------------------

type ApiFn = (
  url: string,
  method: string,
  body: any,
  token: any
) => Promise<any>;

/** Per-service reference data. Keyed by category id. */
const referenceCache = new Map<
  string,
  { catalogue: any[]; products: any[]; warnings: string[] }
>();

/** Per user+product routing payload. Keyed by `userId|productId`. */
const routingCache = new Map<string, any>();

/** Requests currently in flight, so identical keys share one promise. */
const inFlight = new Map<string, Promise<any>>();

const routingKey = (userId: string, productId: string) =>
  `${userId}|${productId}`;

/**
 * Runs `worker` over `items` with at most `limit` in flight at once, preserving
 * input order in the result. Keeps a forty-product service from opening forty
 * sockets and starving everything else on the page.
 */
export async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index], index);
      }
    })()
  );

  await Promise.all(runners);
  return results;
}

/**
 * Vendor catalogue + product list for a service.
 *
 * Neither depends on the selected user, so this is cached for the session. The
 * two requests go out together because they are independent of each other too.
 */
export async function getServiceReference(
  Api: ApiFn,
  categoryId: string,
  vendorListEndpoint: string
): Promise<{ catalogue: any[]; products: any[]; warnings: string[] }> {
  const cached = referenceCache.get(categoryId);
  if (cached) return cached;

  const key = `ref|${categoryId}`;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const token = localStorage.getItem("token");

    const [listRes, productsRes]: any[] = await Promise.all([
      Api(vendorListEndpoint, "GET", "", token),
      Api(`product/get_ProductList/${categoryId}`, "GET", "", token),
    ]);

    const catalogue: any[] =
      listRes?.status === 200 &&
      (listRes.data?.code === 200 || listRes.data?.success === true)
        ? listRes.data.data || []
        : [];

    const products: any[] =
      productsRes?.status === 200 && productsRes.data?.code === 200
        ? productsRes.data.data || []
        : [];

    // Item 3b: the vendor dropdown endpoints report what they could not
    // resolve. Carried through the cache so the caller can say "1 vendor not
    // configured" instead of showing a silently short list.
    const warnings: string[] = Array.isArray(listRes?.data?.warnings)
      ? listRes.data.warnings
      : [];

    const value = { catalogue, products, warnings };

    /* Only cache a genuine answer. Caching an empty list because the request
       failed would make the failure permanent for the session. */
    if (catalogue.length || products.length)
      referenceCache.set(categoryId, value);

    return value;
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

/** Current routing for one user + product, cached and de-duplicated. */
/** The batch endpoint's cap on `productIds` - the backend answers 400 above this. */
const MAX_BATCH_PRODUCT_IDS = 200;

/**
 * Stage 3: resolve routing for many products in one request and seed the cache.
 *
 * `POST product/getUserVendorSwitches` -> `{ success, message, data }` where
 * `data` is keyed by productId and a product with no routing configured is
 * present with the value `null`. Note the envelope is `success`, NOT `code`.
 *
 * Best-effort by design: anything this does not manage to cache simply falls
 * through to the per-product `getRouting` below, so a failure here costs speed
 * and nothing else.
 */
export async function prefetchRouting(
  Api: ApiFn,
  userId: string,
  productIds: string[]
): Promise<void> {
  const wanted = Array.from(
    new Set(productIds.filter(Boolean).map(String))
  ).filter((id) => !routingCache.has(routingKey(userId, id)));

  if (!userId || wanted.length === 0) return;

  const token = localStorage.getItem("token");

  for (let i = 0; i < wanted.length; i += MAX_BATCH_PRODUCT_IDS) {
    const chunk = wanted.slice(i, i + MAX_BATCH_PRODUCT_IDS);
    try {
      const res: any = await Api(
        "product/getUserVendorSwitches",
        "POST",
        { userId, productIds: chunk },
        token
      );

      const ok =
        res?.status === 200 &&
        (res.data?.success === true || Number(res.data?.code) === 200);
      if (!ok || !res.data?.data) continue;

      const map = res.data.data;
      for (const pid of chunk) {
        // `null` is a real answer - "no routing configured" - and caching it
        // stops the per-product path asking again for the same nothing.
        if (Object.prototype.hasOwnProperty.call(map, pid)) {
          routingCache.set(routingKey(userId, pid), map[pid]);
        }
      }
    } catch {
      /* Speed only. The per-product path still works. */
    }
  }
}

export async function getRouting(
  Api: ApiFn,
  userId: string,
  productId: string
): Promise<any> {
  const key = routingKey(userId, productId);

  if (routingCache.has(key)) return routingCache.get(key);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const token = localStorage.getItem("token");

    const res: any = await Api(
      `product/getUserVendorSwitch/?userId=${userId}&productId=${productId}`,
      "GET",
      "",
      token
    );

    const ok =
      res?.status === 200 &&
      (res.data?.code === 200 || res.data?.success === true);

    const data = ok ? res.data.data : null;

    /* A failed lookup is not cached - it should be retried, not remembered. */
    if (ok) routingCache.set(key, data);

    return data;
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

/**
 * Drops cached routing after a write.
 *
 * Called with a productId after saving that product's routing; called with just
 * a userId to clear everything held for that user.
 */
export function invalidateRouting(userId: string, productId?: string) {
  if (productId) {
    routingCache.delete(routingKey(userId, productId));
    return;
  }

  Array.from(routingCache.keys()).forEach((key) => {
    if (key.startsWith(`${userId}|`)) routingCache.delete(key);
  });
}

/** Test / debug helper - clears everything held for the session. */
export function clearRoutingCaches() {
  referenceCache.clear();
  routingCache.clear();
  inFlight.clear();
}
