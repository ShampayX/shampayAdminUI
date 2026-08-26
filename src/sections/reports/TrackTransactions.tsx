import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Card,
  Chip,
  Grid,
  Modal,
  Stack,
  Divider,
  MenuItem,
  TableCell,
  Typography,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { alpha, useTheme } from "@mui/material/styles";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// utils
import { fDateTime } from "src/utils/formatTime";
// page kit
import {
  PageHeader,
  PageGhostButton,
  DataTable,
  KitRow,
  StackedCell,
  CopyText,
  StatCard,
  StatGrid,
  ModalShell,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Transaction Tracker.
//
// `admin/track_transactions` is the only endpoint behind this screen. It takes
// `clientRefId` and `beneName` as the searchable identifiers and returns
// `createdAt`, `clientRefId`, `beneName` and a `rawData` payload per row.
//
// There is NO status field, NO amount and NO status-history on this payload, so
// this screen deliberately has no status badge, no financial block and no
// timeline. The detail panel surfaces whatever `rawData` actually carries
// instead of naming fields the API may not send.
// ----------------------------------------------------------------------

type FormValuesProps = {
  searchBy: string;
  User: string;
};

/** The two identifiers `admin/track_transactions` accepts as filters. */
const SEARCH_FIELDS = [
  { value: "clientRefId", label: "Transaction ID (ClientRef)" },
  { value: "beneName", label: "Beneficiary Name" },
];

/** Named fields the remarks payload is known to carry, in reading order. */
const RAW_FIELDS: { key: string; label: string; copy?: boolean }[] = [
  { key: "refId", label: "Reference ID", copy: true },
  { key: "beneName", label: "Beneficiary" },
  { key: "bankName", label: "Bank" },
  { key: "accountNumber", label: "Account Number", copy: true },
  { key: "ifsc", label: "IFSC", copy: true },
  { key: "mode", label: "Mode" },
];

const prettyLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

export default function Tracktransactions() {
  const theme = useTheme();
  const { Api } = useAuthContext();
  let token = localStorage.getItem("token");

  const [rows, setRows] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** The filter the current result set was fetched with, so paging keeps it. */
  const [activeFilter, setActiveFilter] = useState<{
    field: string;
    value: string;
  } | null>(null);

  const [selectedRow, setSelectedRow] = useState<any>(null);

  const FilterSchema = Yup.object().shape({
    searchBy: Yup.string().required("Select a field to search by"),
    User: Yup.string().trim().required("Enter a value to search"),
  });

  const defaultValues = { searchBy: "", User: "" };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    resetField,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    resetField("User");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("searchBy")]);

  useEffect(() => {
    fetchTransactions(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  /* ================= API - unchanged contract ================= */

  /**
   * One fetch for both the unfiltered list and a search, so changing page never
   * drops the active filter. The endpoint pages server-side, so the response is
   * rendered as-is (the old code re-sliced it client-side, which left page 2+
   * blank).
   */
  const fetchTransactions = (
    filter: { field: string; value: string } | null
  ) => {
    setLoading(true);
    setError("");

    const body: any = {
      pageInitData: { pageSize, currentPage },
      clientRefId: "",
      beneName: "",
    };
    if (filter?.field) body[filter.field] = filter.value;

    Api("admin/track_transactions", "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200) {
          setRows(Response.data.data || []);
          setCount(Response.data.count || 0);
        } else {
          setRows([]);
          setError("Could not reach the tracking service.");
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setRows([]);
        setError(err?.message || "Could not reach the tracking service.");
        setLoading(false);
      });
  };

  const onSubmit = (data: FormValuesProps) => {
    const filter = { field: data.searchBy, value: data.User.trim() };
    setActiveFilter(filter);
    setCurrentPage(1);
    fetchTransactions(filter);
  };

  const onClear = () => {
    reset(defaultValues);
    setActiveFilter(null);
    setCurrentPage(1);
    fetchTransactions(null);
  };

  /* ================= DERIVED ================= */

  const namedRaw = useMemo(() => {
    if (!selectedRow?.rawData) return [];
    return RAW_FIELDS.filter(
      (field) => selectedRow.rawData[field.key] != null &&
        selectedRow.rawData[field.key] !== ""
    ).map((field) => ({ ...field, value: selectedRow.rawData[field.key] }));
  }, [selectedRow]);

  /* Anything else the payload carried - shown so nothing is silently hidden. */
  const extraRaw = useMemo(() => {
    if (!selectedRow?.rawData) return [];
    const known = new Set(RAW_FIELDS.map((f) => f.key));
    return Object.entries(selectedRow.rawData)
      .filter(
        ([key, value]) =>
          !known.has(key) &&
          value != null &&
          value !== "" &&
          typeof value !== "object"
      )
      .map(([key, value]) => ({ key, label: prettyLabel(key), value }));
  }, [selectedRow]);

  const searchLabel =
    SEARCH_FIELDS.find((field) => field.value === watch("searchBy"))?.label ||
    "value";

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Transaction Tracker | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Transaction Tracker"
          subtitle="Look up an individual transaction by reference or beneficiary and inspect what the network returned."
        />

        {/* ── Search card ─────────────────────────────────────────────── */}
        <Card
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 2.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === "light"
                ? "0 2px 12px rgba(15,23,42,0.05)"
                : "none",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <TravelExploreOutlinedIcon
              sx={{ fontSize: 20, color: "primary.main" }}
            />
            <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
              Find a transaction
            </Typography>
          </Stack>

          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "flex-start" }}
            >
              <RHFSelect
                name="searchBy"
                label="Search by"
                size="small"
                sx={{ minWidth: { xs: "100%", md: 260 } }}
                SelectProps={{ native: false }}
              >
                {SEARCH_FIELDS.map((field) => (
                  <MenuItem key={field.value} value={field.value}>
                    {field.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField
                name="User"
                size="small"
                label={`Enter ${searchLabel}`}
                placeholder="Paste or type the value"
                sx={{ flexGrow: 1 }}
              />

              <Stack direction="row" spacing={1.5}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={isSubmitting}
                  startIcon={<SearchIcon />}
                  sx={{ height: 40, px: 3 }}
                >
                  Search
                </LoadingButton>
                <PageGhostButton
                  startIcon={<RestartAltIcon />}
                  onClick={onClear}
                >
                  Reset
                </PageGhostButton>
              </Stack>
            </Stack>
          </FormProvider>

          {activeFilter && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Filtered by
              </Typography>
              <Chip
                size="small"
                onDelete={onClear}
                label={`${
                  SEARCH_FIELDS.find((f) => f.value === activeFilter.field)
                    ?.label || activeFilter.field
                }: ${activeFilter.value}`}
                sx={{ fontSize: 11.5, fontWeight: 600 }}
              />
            </Stack>
          )}
        </Card>

        {/* ── Result summary ──────────────────────────────────────────── */}
        <StatGrid columns={2}>
          <StatCard
            label={activeFilter ? "Matching Transactions" : "Tracked Transactions"}
            value={count}
            caption={activeFilter ? "For the active filter" : "Across all pages"}
            icon={<ReceiptLongOutlinedIcon />}
          />
          <StatCard
            label="Shown On This Page"
            value={rows.length}
            caption={`Page ${currentPage} • ${pageSize} per page`}
            tone="neutral"
            icon={<AccountBalanceOutlinedIcon />}
          />
        </StatGrid>

        {/* ── Results ─────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingState label="Searching transactions..." height={300} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Search failed"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RestartAltIcon />}
                onClick={() => fetchTransactions(activeFilter)}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<TravelExploreOutlinedIcon />}
            title={activeFilter ? "No transaction found" : "Nothing tracked yet"}
            description={
              activeFilter
                ? `No transaction matches ${activeFilter.value}. Check the identifier and the field you searched by.`
                : "No tracked transactions have been recorded."
            }
            action={
              activeFilter ? (
                <PageGhostButton
                  startIcon={<RestartAltIcon />}
                  onClick={onClear}
                >
                  Clear search
                </PageGhostButton>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            minWidth={820}
            columns={[
              { id: "createdAt", label: "Date & Time" },
              { id: "clientRefId", label: "Transaction ID" },
              { id: "beneName", label: "Beneficiary" },
              { id: "action", label: "Action", align: "center" },
            ]}
            footer={
              <TablePagination
                component="div"
                count={count}
                page={currentPage - 1}
                rowsPerPage={pageSize}
                onPageChange={(_, page) => setCurrentPage(page + 1)}
                onRowsPerPageChange={(event) => {
                  setPageSize(parseInt(event.target.value));
                  setCurrentPage(1);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            }
          >
            {rows.map((row: any) => (
              <KitRow key={row._id}>
                <TableCell>
                  <StackedCell
                    primary={fDateTime(row.createdAt)}
                    secondary={new Date(row.createdAt).toLocaleTimeString()}
                  />
                </TableCell>

                <TableCell>
                  <CopyText value={row.clientRefId}>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {row.clientRefId || "-"}
                    </Typography>
                  </CopyText>
                </TableCell>

                <TableCell>
                  <CopyText value={row.beneName}>
                    <Typography sx={{ fontSize: 13.5 }}>
                      {row.beneName || "-"}
                    </Typography>
                  </CopyText>
                </TableCell>

                <TableCell align="center">
                  <PageGhostButton onClick={() => setSelectedRow(row)}>
                    Details
                  </PageGhostButton>
                </TableCell>
              </KitRow>
            ))}
          </DataTable>
        )}

        {/* ── Detail panel ────────────────────────────────────────────── */}
        <Modal open={Boolean(selectedRow)} onClose={() => setSelectedRow(null)}>
          <ModalShell
            title="Transaction Detail"
            subtitle={
              selectedRow
                ? `${selectedRow.clientRefId || "-"} • ${fDateTime(
                    selectedRow.createdAt
                  )}`
                : undefined
            }
            onClose={() => setSelectedRow(null)}
            width={680}
          >
            {selectedRow && (
              <>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.7,
                    textTransform: "uppercase",
                    color: "text.secondary",
                  }}
                >
                  Transaction Information
                </Typography>

                <Grid container spacing={1.5}>
                  {[
                    { label: "Transaction ID", value: selectedRow.clientRefId, copy: true },
                    { label: "Beneficiary", value: selectedRow.beneName },
                    {
                      label: "Recorded At",
                      value: fDateTime(selectedRow.createdAt),
                    },
                  ].map((field) => (
                    <Grid item xs={12} sm={6} key={field.label}>
                      <DetailTile
                        label={field.label}
                        value={field.value}
                        copy={field.copy}
                      />
                    </Grid>
                  ))}
                </Grid>

                {namedRaw.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography
                      sx={{
                        mb: 1.5,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.7,
                        textTransform: "uppercase",
                        color: "text.secondary",
                      }}
                    >
                      Beneficiary & Routing
                    </Typography>
                    <Grid container spacing={1.5}>
                      {namedRaw.map((field) => (
                        <Grid item xs={12} sm={6} key={field.key}>
                          <DetailTile
                            label={field.label}
                            value={String(field.value)}
                            copy={field.copy}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {extraRaw.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography
                      sx={{
                        mb: 1.5,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.7,
                        textTransform: "uppercase",
                        color: "text.secondary",
                      }}
                    >
                      Other Fields Returned
                    </Typography>
                    <Grid container spacing={1.5}>
                      {extraRaw.map((field) => (
                        <Grid item xs={12} sm={6} key={field.key}>
                          <DetailTile
                            label={field.label}
                            value={String(field.value)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {namedRaw.length === 0 && extraRaw.length === 0 && (
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: alpha(theme.palette.grey[500], 0.04),
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      This transaction carries no additional payload.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </ModalShell>
        </Modal>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

/** Labelled read-only field used throughout the detail panel. */
function DetailTile({
  label,
  value,
  copy,
}: {
  label: string;
  value?: string;
  copy?: boolean;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1.5,
        height: "100%",
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <Typography
        sx={{
          mb: 0.25,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

      {copy && value ? (
        <CopyText value={value}>
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 600, wordBreak: "break-word" }}
          >
            {value}
          </Typography>
        </CopyText>
      ) : (
        <Typography
          sx={{ fontSize: 13.5, fontWeight: 600, wordBreak: "break-word" }}
        >
          {value || "-"}
        </Typography>
      )}
    </Box>
  );
}
