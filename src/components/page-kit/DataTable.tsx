import { ReactNode } from "react";
// @mui
import {
  Box,
  Table,
  Paper,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from "@mui/material";
import { TableSortLabel } from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
// components
import Scrollbar from "../scrollbar";

// ----------------------------------------------------------------------
// Table chrome: tinted sticky header, quiet separators, tinted hover.
// ----------------------------------------------------------------------

export const KitHeadCell = styled(TableCell)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  color: theme.palette.text.secondary,
  backgroundColor:
    theme.palette.mode === "light"
      ? "#F4F6FA"
      : alpha(theme.palette.common.white, 0.06),
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.75, 2),
  position: "sticky",
  top: 0,
  zIndex: 2,
}));

export const KitRow = styled(TableRow)(({ theme }) => ({
  "& > td": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5, 2),
    verticalAlign: "middle",
  },
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha(theme.palette.grey[500], 0.06)
        : alpha(theme.palette.common.white, 0.04),
  },
  "&:last-of-type > td": { borderBottom: "none" },
}));

// ----------------------------------------------------------------------

type Column = {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  /** Field to sort by. Omit to make the column unsortable. */
  sortKey?: string;
};

type DataTableProps = {
  columns: Column[];
  children: ReactNode;
  /** Show the empty state instead of rows. */
  isEmpty?: boolean;
  emptyMessage?: string;
  minWidth?: number;
  maxHeight?: number;
  /** Rendered under the table - typically pagination. */
  footer?: ReactNode;
  /** Wire these to useDataTable() to get click-to-sort headers. */
  sortBy?: string | null;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
};

/**
 * Bordered table card. Pass rows as children (use <KitRow><TableCell>...).
 * Keeps every page's table identical without touching row logic.
 */
export function DataTable({
  columns,
  children,
  isEmpty,
  emptyMessage = "No records found.",
  minWidth = 900,
  maxHeight = 620,
  footer,
  sortBy,
  sortDir = "asc",
  onSort,
}: DataTableProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: isLight ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
        }}
      >
        <Scrollbar sx={{ overflow: "auto", maxHeight }}>
          <Table stickyHeader size="small" sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => {
                  const key = column.sortKey;
                  const sortable = Boolean(key && onSort);

                  return (
                    <KitHeadCell key={column.id} align={column.align || "left"}>
                      {sortable ? (
                        <TableSortLabel
                          active={sortBy === key}
                          direction={sortBy === key ? sortDir : "asc"}
                          onClick={() => onSort!(key as string)}
                          sx={{ "& .MuiTableSortLabel-icon": { fontSize: 16 } }}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </KitHeadCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ border: "none" }}>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
                        {emptyMessage}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                children
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {footer}
    </>
  );
}

// ----------------------------------------------------------------------

const STATUS_TONES: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  success: "success",
  active: "success",
  approved: "success",
  enabled: "success",
  completed: "success",
  refund: "default",
  refunded: "default",
  inactive: "default",
  disabled: "default",
  queued: "default",
  failed: "error",
  failure: "error",
  rejected: "error",
  reversed: "error",
  pending: "warning",
  in_process: "warning",
  processing: "warning",
  hold: "warning",
  initiated: "info",
  /* export generation */
  generated: "success",
  /* utilisation of a configured limit */
  healthy: "success",
  "near limit": "warning",
  exhausted: "error",
  unused: "default",
  /* vendor routing */
  routed: "success",
  unrouted: "default",
  partial: "warning",
};

/** Soft status pill (SUCCESS / PENDING / FAILED / ACTIVE ...). */
export function StatusPill({ status }: { status?: string | boolean }) {
  const theme = useTheme();

  const text =
    typeof status === "boolean" ? (status ? "Active" : "Inactive") : status || "-";
  const tone = STATUS_TONES[String(text).toLowerCase()] || "default";
  const color =
    tone === "default" ? theme.palette.text.secondary : theme.palette[tone].main;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.25,
        py: 0.4,
        borderRadius: 0.75,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        color,
        backgroundColor: alpha(color, theme.palette.mode === "light" ? 0.14 : 0.24),
      }}
    >
      {String(text).replace(/_/g, " ")}
    </Box>
  );
}

/** DEBIT / CREDIT label - red out, green in. */
export function ModeLabel({ mode }: { mode: string }) {
  const theme = useTheme();
  const isCredit = String(mode).toLowerCase() === "credit";

  return (
    <Typography
      component="span"
      sx={{
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color: isCredit ? theme.palette.success.main : theme.palette.error.main,
      }}
    >
      {mode}
    </Typography>
  );
}

/** Two-line cell: strong primary line with a muted caption under it. */
export function StackedCell({
  primary,
  secondary,
  bold,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  bold?: boolean;
}) {
  return (
    <>
      <Typography sx={{ fontSize: bold ? 14 : 13.5, fontWeight: bold ? 700 : 400 }}>
        {primary}
      </Typography>
      {secondary != null && secondary !== "" && (
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
          {secondary}
        </Typography>
      )}
    </>
  );
}
