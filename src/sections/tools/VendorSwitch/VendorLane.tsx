import { ReactNode } from "react";
import { Box, Stack, Divider, Typography } from "@mui/material";

// ----------------------------------------------------------------------
// Shared row for the vendor switch cards: a routing lane on the left, the
// active vendor (read-only text, or a select while editing) on the right.
// Keeps every category tab looking the same without touching their API calls.
// ----------------------------------------------------------------------

export function VendorLane({
  label,
  hint,
  children,
  divider = true,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  /** Hide the separator on the last lane of a card. */
  divider?: boolean;
}) {
  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2 }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ py: 1.75 }}
      >
        <Box>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{label}</Typography>
          {hint && (
            <Typography sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}>
              {hint}
            </Typography>
          )}
        </Box>

        <Box sx={{ minWidth: { sm: 250 } }}>{children}</Box>
      </Stack>

      {divider && <Divider />}
    </>
  );
}

/** Read-only vendor name, shown when the card is not in edit mode. */
export function VendorValue({ value }: { value?: string }) {
  if (!value) {
    return (
      <Typography sx={{ fontSize: 14, color: "text.disabled" }}>Not set</Typography>
    );
  }

  return (
    <Typography sx={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>
      {value}
    </Typography>
  );
}
