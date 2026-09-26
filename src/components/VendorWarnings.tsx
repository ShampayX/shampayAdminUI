import { Stack, Tooltip, Typography } from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

// ----------------------------------------------------------------------
// Item 3b: the six vendor dropdowns return `{ data, warnings }`.
//
//   product/moneyTransfer_vendor_list      product/transfer_vendor_list
//   product/payout_payment_vendor_list     product/aeps_vendor_list
//   product/dmt2_vendor_list               product/mobile_upi_vendor_list
//
// `warnings` is a `string[]` at the TOP LEVEL of the body (beside `data`, not
// inside it), e.g. "DECENTRO is named in the code but has no vendor record".
//
// It exists because an empty dropdown used to be indistinguishable from a broken
// one: a vendor named in the code with no matching record simply did not appear,
// and the operator had no way to tell "nothing is configured" from "the list
// failed to load". `data` is unchanged, so this is purely additive.
// ----------------------------------------------------------------------

/** Pull `warnings` off an `Api()` response body. Safe on any shape. */
export function vendorWarningsOf(Response: any): string[] {
  const w = Response?.data?.warnings;
  return Array.isArray(w) ? w.filter((x: any) => typeof x === "string") : [];
}

/**
 * A single quiet line under a vendor dropdown. Renders nothing when there is
 * nothing to say, so it can be dropped in unconditionally.
 */
export default function VendorWarnings({
  warnings,
  sx,
}: {
  warnings?: string[];
  sx?: any;
}) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <Tooltip title={warnings.join(" | ")}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ mt: 0.5, ...sx }}
      >
        <WarningAmberOutlinedIcon
          sx={{ fontSize: 15, color: "warning.main" }}
        />
        <Typography sx={{ fontSize: 11.5, color: "warning.dark" }}>
          {warnings.length === 1
            ? warnings[0]
            : `${warnings.length} vendors not configured`}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
