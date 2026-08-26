import { CircularProgress, Stack, useTheme } from "@mui/material";
import { varFade } from "../animate";
import { m } from "framer-motion";
import { TableSkeleton, CardListSkeleton } from "../page-kit/Skeletons";

// ----------------------------------------------------------------------
// The loading indicator the whole portal calls, backed by the skeleton system
// in components/page-kit. It takes OPTIONAL props:
//
//   <ApiDataLoading />                                  -> spinner
//   <ApiDataLoading variant="table" columns={COLS} />   -> skeleton table
//   <ApiDataLoading variant="cards" />                  -> skeleton cards
//
// Keeping the spinner as the default is what made the migration safe to do a
// screen at a time: converting a screen is one added prop, no import change
// and no structural edit.
//
// The rollout is finished - 38 of the 41 call sites pass a `variant`. The
// three that do not are deliberate and carry a comment saying why:
//   - tools/DocuSignUpdate.tsx     submit-button busy state, not a data load
//   - ournetwork/UserDetail.tsx    sits inside <Table>, where a nested table
//                                  element is invalid
//   - TEST/AllTransactionRecordsTest.tsx   scratch file, not a shipped screen
//
// New code should import the skeletons from page-kit directly; this shim
// exists for the screens that already call ApiDataLoading.
// ----------------------------------------------------------------------

type Props = {
  /** Omit for the original spinner. */
  variant?: "spinner" | "table" | "cards";
  /** Required by `variant="table"` - the same columns the real table renders. */
  columns?: { id: string | number; label: string; align?: "left" | "center" | "right" }[];
  rows?: number;
  minWidth?: number;
};

function ApiDataLoading({ variant = "spinner", columns, rows, minWidth }: Props) {
  const theme = useTheme();

  if (variant === "table" && columns?.length) {
    return <TableSkeleton columns={columns} rows={rows ?? 8} minWidth={minWidth} />;
  }

  if (variant === "cards") {
    return <CardListSkeleton cards={rows ?? 3} />;
  }

  return (
    <Stack flexDirection={"row"} justifyContent={"center"} my={2}>
      <m.div variants={varFade().in}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </m.div>
    </Stack>
  );
}

export default ApiDataLoading;
