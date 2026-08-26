// ----------------------------------------------------------------------
// The lead list columns, in one place.
//
// Four screens render the same nine columns - pages/NewLeads.tsx and the
// Approved / Pending / Rejected tabs - and each carried its own copy inline in
// JSX. Two of those copies had drifted (one ended in a stray comma, leaving a
// hole in the array). Hoisting them also stops a fresh array literal being
// built on every render and handed to both the header and the skeleton.
// ----------------------------------------------------------------------

export type LeadColumn = {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
};

/** The nine columns every lead list shows. */
export const LEAD_COLUMNS: LeadColumn[] = [
  { id: "firstName", label: "Name" },
  { id: "commission", label: "City/State" },
  { id: "constitutionType", label: "Constitution Type" },
  { id: "Type", label: "User Type" },
  { id: "maxComm", label: "OTP Verification" },
  { id: "pver", label: "Personal Verification" },
  { id: "docs", label: "Documents Upload" },
  { id: "mobileNumber", label: "Mobile Number" },
  { id: "consentagreed", label: "Consent Agreed" },
];

/** Plus the row-action column, on the tabs whose rows can be acted on. */
export const LEAD_COLUMNS_WITH_ACTION: LeadColumn[] = [
  ...LEAD_COLUMNS,
  { id: "action", label: "Action" },
];
