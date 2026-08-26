// ----------------------------------------------------------------------
// Which services can be routed per user, and which vendor list backs each.
//
// `category/get_CategoryList` returns every category on the platform, but only
// these have a per-user vendor switch behind them - the rest have no routing
// endpoint, so they are filtered out rather than shown as empty.
// ----------------------------------------------------------------------

export type Service = {
  _id: string;
  category_name: string;
};

export const ALLOWED_CATEGORIES = [
  "payout payments",
  "transfer",
  "admt",
  "aeps",
  "money transfer",
];

/** Categories that actually support routing, in the order the API returned. */
export function routableServices(services: Service[]): Service[] {
  return (services || []).filter((service) =>
    ALLOWED_CATEGORIES.includes(String(service.category_name).toLowerCase())
  );
}

/**
 * Vendor catalogue endpoint for a service. Matching is by name and order
 * matters: "money transfer" has to be tested before the looser "transfer".
 */
export function vendorListUrl(categoryName: string): string {
  const name = String(categoryName || "").toLowerCase();

  if (name.includes("money transfer") || name.includes("moneytransfer")) {
    return "product/moneyTransfer_vendor_list";
  }
  if (name.includes("aeps")) {
    return "product/aeps_vendor_list";
  }
  if (name.includes("transfer")) {
    return "product/transfer_vendor_list";
  }
  return "product/payout_payment_vendor_list";
}
