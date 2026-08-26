// ----------------------------------------------------------------------
// Providers - shared catalogue.
//
// The Providers category used to be fifteen sidebar entries. Thirteen of them
// were amount-slab editors that differed ONLY in which two endpoints they
// called, so they are described here as data and rendered by one screen
// (Service Configuration) instead of thirteen near-identical files.
//
// Nothing in this file talks to the network. Every endpoint string below is
// copied verbatim from the screen it replaces - see the `replaces` field for
// which one - so the backend contract is unchanged.
//
// IMPORTANT: several of the original screens built their POST url with a
// trailing space (`${cond ? "a" : "b"} `). The URL parser strips trailing
// whitespace, so the request was always sent to the trimmed path; the strings
// here are the trimmed ones.
// ----------------------------------------------------------------------

/** How the read endpoint wraps its slabs. */
export type SlotShape =
  /** `data[0].slots` - ten of the eleven flat services. */
  | "wrapped"
  /** `data` is the slab array itself - BBPS only. */
  | "flat";

export type SlotService = {
  /** Stable key used in the url (`?service=dmt1`) and as the React key. */
  key: string;
  label: string;
  /** One-line description shown under the selector. */
  hint: string;
  /** Which editor renders it. */
  editor: "slab" | "vendorPayment" | "aeps";
  /** GET - current slabs. */
  read?: string;
  /** POST - used when nothing is configured yet. */
  create?: string;
  /** POST - used when slabs already exist. */
  update?: string;
  shape?: SlotShape;
  /** Body key the slab array is sent under. */
  payloadKey?: "slots" | "bbpsSlotData";
  /** Legacy route this replaces, kept for the redirect map. */
  replaces: string;
};

/**
 * Every service that has slab configuration, in the order the old sidebar
 * listed them. Adding a service is one entry here - no new screen, no new
 * route, no new nav item.
 */
export const SLOT_SERVICES: SlotService[] = [
  {
    key: "credit-card",
    label: "Credit Card",
    hint: "Amount slabs for credit card bill payments.",
    editor: "slab",
    read: "vendor/get/credit_card_payment_slots",
    create: "vendor/add/credit_card_payment_slots",
    update: "vendor/edit/credit_card_payment_slots",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "creditcardslots",
  },
  {
    key: "money-transfer",
    label: "Money Transfer",
    hint: "Amount slabs for domestic money transfer.",
    editor: "slab",
    read: "vendor/payoutSlots",
    create: "vendor/payoutSlot",
    update: "vendor/edit_payout_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "moneytransferslots",
  },
  {
    key: "vendor-payments",
    label: "Vendor Payments",
    hint: "Per-product slabs, bounded by each product's own ceiling.",
    editor: "vendorPayment",
    replaces: "vendorpaymentslots",
  },
  {
    key: "dmt1",
    label: "DMT1",
    hint: "Amount slabs for the DMT1 rail.",
    editor: "slab",
    read: "vendor/dmtSlot",
    create: "vendor/dmtSlot",
    update: "vendor/edit_dmt_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "dmtslots",
  },
  {
    key: "dmt2",
    label: "DMT2",
    hint: "Amount slabs for the DMT2 rail.",
    editor: "slab",
    read: "vendor/dmt2Slot",
    create: "vendor/dmt2Slot",
    update: "vendor/edit_dmt2_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "dmt2slots",
  },
  {
    key: "payin",
    label: "Payin",
    hint: "Amount slabs for collections.",
    editor: "slab",
    read: "vendor/showPayInPaymentSlots",
    create: "vendor/addPayInPaymentSlot",
    update: "vendor/edit_payIn_payment_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "payinslots",
  },
  {
    key: "aeps",
    label: "AEPS",
    hint: "Per-product slabs for Aadhaar enabled payments.",
    editor: "aeps",
    replaces: "newaepsslots",
  },
  {
    key: "pbps",
    label: "PBPS",
    hint: "Amount slabs for Bharat postpaid bill payments.",
    editor: "slab",
    read: "vendor/show_pbps_slots",
    create: "vendor/add_pbps_slot",
    update: "vendor/edit_pbps_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "pbpsslots",
  },
  {
    key: "bbps",
    label: "BBPS",
    hint: "Amount slabs for Bharat bill payments.",
    editor: "slab",
    read: "vendor/show_bbps_slots",
    create: "vendor/add_bbps_slot",
    update: "vendor/edit_bbps_slot",
    /* This one returns the slab array directly and takes a different body
       key - the only flat service that differs. */
    shape: "flat",
    payloadKey: "bbpsSlotData",
    replaces: "bbpslots",
  },
  {
    key: "transfer",
    label: "Transfer",
    hint: "Amount slabs for account transfers.",
    editor: "slab",
    read: "vendor/transferSlots",
    create: "vendor/transferSlot",
    update: "vendor/edit_transfer_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "transferslots",
  },
  {
    key: "payout",
    label: "Payout",
    hint: "Amount slabs for payouts.",
    editor: "slab",
    read: "vendor/payoutPaymentSlots",
    create: "vendor/payoutPaymentSlot",
    update: "vendor/edit_payout_payment_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "payoutslots",
  },
  {
    key: "payout-upi",
    label: "Payout UPI",
    hint: "Amount slabs for UPI payouts.",
    editor: "slab",
    read: "vendor/payoutPaymentSlots_UPI",
    create: "vendor/payoutPaymentSlot_UPI",
    update: "vendor/edit_payout_payment_slot_UPI",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "payoutupislots",
  },
  {
    key: "admt",
    label: "ADMT",
    hint: "Amount slabs for the ADMT rail.",
    editor: "slab",
    read: "vendor/admtSlot",
    create: "vendor/admtSlot",
    update: "vendor/edit_admt_slot",
    shape: "wrapped",
    payloadKey: "slots",
    replaces: "admtslots",
  },
];

export const slotServiceByKey = (key: string): SlotService | undefined =>
  SLOT_SERVICES.find((service) => service.key === key);

/** Legacy `/vendor/<segment>` -> service key, for the redirect routes. */
export const LEGACY_SLOT_ROUTES: Record<string, string> = SLOT_SERVICES.reduce(
  (map, service) => ({ ...map, [service.replaces]: service.key }),
  {}
);

// ----------------------------------------------------------------------
// Provider -> service coverage
// ----------------------------------------------------------------------

/**
 * The per-service vendor catalogues. These are the only endpoints that say
 * which providers are published for which service, so they are what the
 * "Services" badges in the directory are built from.
 *
 * All six are plain GETs already used by the routing screens.
 */
export const SERVICE_VENDOR_LISTS: { label: string; url: string }[] = [
  { label: "Money Transfer", url: "product/moneyTransfer_vendor_list" },
  { label: "AEPS", url: "product/aeps_vendor_list" },
  { label: "Transfer", url: "product/transfer_vendor_list" },
  { label: "Payout", url: "product/payout_payment_vendor_list" },
  { label: "DMT2", url: "product/dmt2_vendor_list" },
  { label: "Mobile UPI", url: "product/mobile_upi_vendor_list" },
];

// ----------------------------------------------------------------------
// Provider profile - the field vocabulary `vendor/add_Vendor` accepts
// ----------------------------------------------------------------------

export type Provider = {
  _id: string;
  vendorName?: string;
  vendor_gst?: string;
  vendorContactName?: string;
  vendorContact?: string;
  vendor_email?: string;
  commissionType?: string;
  vendortransactionType?: string;
  vendorAvailableFor?: string;
  paymentTerms?: string;
  remindVia?: string;
  reminderSubject?: string;
  reminderMessage?: string;
  vendorApiDocument?: string;
  vendorAgreementFile?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Commission structures `add_Vendor` recognises. */
export const COMMISSION_TYPES = [
  { value: "percentage", label: "Percentage" },
  { value: "flat", label: "Flat" },
  { value: "changeAtValue", label: "Change at value" },
];

/** Transaction types `add_Vendor` recognises. */
export const TRANSACTION_TYPES = [
  { value: "commission", label: "Commission" },
  { value: "surcharge", label: "Surcharge" },
];

/** Which downstream channel a provider is published to. */
export const AVAILABLE_FOR = [
  { value: "directagent", label: "Direct Agent" },
  { value: "neonetwork", label: "Neo Network" },
  { value: "apiuser", label: "API User" },
  { value: "everyone", label: "Everyone" },
];

/** Reminder delivery channels `add_Vendor` recognises. */
export const REMIND_VIA = [
  { value: "automailer", label: "Automailer" },
  { value: "sms", label: "SMS" },
];

const labelFrom = (options: { value: string; label: string }[], value?: string) =>
  options.find((option) => option.value === value)?.label || value || "";

export const availableForLabel = (value?: string) =>
  labelFrom(AVAILABLE_FOR, value);
export const commissionLabel = (value?: string) =>
  labelFrom(COMMISSION_TYPES, value);
export const transactionTypeLabel = (value?: string) =>
  labelFrom(TRANSACTION_TYPES, value);
export const remindViaLabel = (value?: string) => labelFrom(REMIND_VIA, value);

/** Display name with a fallback, so a nameless row never renders blank. */
export const providerName = (provider?: Provider) =>
  provider?.vendorName?.trim() || "Unnamed provider";
