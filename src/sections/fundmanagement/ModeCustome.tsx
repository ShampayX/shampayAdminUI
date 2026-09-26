import { Box, Chip, Stack, Tooltip, Typography, alpha } from "@mui/material";
import React from "react";

// ----------------------------------------------------------------------
// One mode of transfer (IMPS / NEFT / RTGS / Fund Transfer / Cash deposit).
//
// The old card laid this out as three sibling <Stack> columns - labels, fee
// types, fee values - each rendering its own rows. The label column skipped a
// role whose value was empty while the two value columns always rendered all
// four, so the rows drifted out of step: a value could sit beside a label it
// did not belong to. The three `noWrap` headings also ran together into
// "Trans. FeeFee Type Fee Value" as soon as the card narrowed.
//
// This renders one labelled row per fact instead, so nothing can misalign, and
// the mode name is free to wrap rather than being clipped mid-word.
//
// Only the API User fee is shown. Agent, Distributor and Master Distributor are
// gone from ShampayX - the roles collapsed to { Admin, API_User } - so those
// three fields are legacy data on the bank document and are not rendered.
// ----------------------------------------------------------------------

type ModeData = {
  modeName?: string;
  transactionFeeType?: string;
  transactionFeeOption?: { for_API_user?: string };
  transactionFeeValue?: { for_API_user?: string };
};

/** Reads as a real value; the payload uses "" for "not configured". */
const isSet = (value?: string | number | null) =>
  value !== undefined && value !== null && String(value).trim() !== "";

/** "flat" -> ₹250, "percentage" -> 2.5%. */
function formatFee(option?: string, value?: string) {
  if (!isSet(value)) return null;
  const kind = String(option || "").toLowerCase();
  if (kind.startsWith("perc")) return `${value}%`;
  return `₹${value}`;
}

function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{ py: 0.75 }}
    >
      <Typography
        sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 700,
          color: "text.primary",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function ModeCustome(props: { modeData?: ModeData }) {
  const mode = props?.modeData ?? {};

  const feeType = mode.transactionFeeType; // "Charge" or "Commission"
  const option = mode.transactionFeeOption?.for_API_user;
  const fee = formatFee(option, mode.transactionFeeValue?.for_API_user);

  const isCommission = String(feeType || "").toLowerCase() === "commission";

  return (
    <Box
      sx={{
        height: "100%",
        p: 1.75,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Tooltip title={mode.modeName || ""} placement="top">
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "text.primary",
            }}
          >
            {mode.modeName || "Unnamed mode"}
          </Typography>
        </Tooltip>

        {isSet(feeType) && (
          <Chip
            size="small"
            label={feeType}
            sx={{
              flexShrink: 0,
              height: 20,
              fontSize: 10.5,
              fontWeight: 700,
              borderRadius: 0.75,
              color: (theme) =>
                isCommission
                  ? theme.palette.success.dark
                  : theme.palette.primary.main,
              bgcolor: (theme) =>
                alpha(
                  isCommission
                    ? theme.palette.success.main
                    : theme.palette.primary.main,
                  0.12
                ),
            }}
          />
        )}
      </Stack>

      <Box
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          pt: 0.5,
          "& > *:not(:last-of-type)": {
            borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
          },
        }}
      >
        {fee ? (
          <>
            <FactRow
              label="Fee type"
              value={
                isSet(option)
                  ? String(option).replace(/^./, (c) => c.toUpperCase())
                  : "—"
              }
            />
            <FactRow label="Fee value" value={fee} />
          </>
        ) : (
          <Typography
            sx={{
              fontSize: 12,
              color: "text.disabled",
              fontStyle: "italic",
              py: 0.75,
            }}
          >
            No fee configured
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default ModeCustome;
