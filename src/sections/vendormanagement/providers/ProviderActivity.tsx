import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Modal,
  Stack,
  MenuItem,
  TableCell,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import { CustomAvatar } from "src/components/custom-avatar";
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  DataTable,
  KitRow,
  StatusPill,
  StackedCell,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
  ModalShell,
  CopyText,
} from "src/components/page-kit";
// utils
import { fDateTime } from "src/utils/formatTime";

// ----------------------------------------------------------------------
// Providers > Provider Activity.
//
// The old "Plan Fetch Records" screen, rebuilt on the page kit. Same endpoint,
// same filters, same payload:
//
//   rows       POST admin/vendorAuxiliaryRecord/fetch
//              { pageInitData: { pageSize, currentPage }, type, operator,
//                startDate, endDate, categoryName, vendorName, clientRefId,
//                partnerTransactionId }
//   plan types GET  admin/vendoriliaryRecord/type      (array of strings)
//   providers  GET  admin/vendorAuxiliaryRecord/vendor_list  (array of strings)
//   services   GET  category/get_CategoryList
//
// Dates go to the API as dd/mm/yyyy, unchanged.
//
// Two fixes carried over from the earlier report passes:
//
//   - the filter is now held in state and re-sent on every page change. The
//     old screen called the unfiltered fetch whenever the page changed, so
//     paging silently reverted to the full list.
//   - the request/response viewer is a page-kit modal that can be dismissed;
//     the old one had its `onClose` commented out and only the button closed it.
//
// The endpoint pages server-side and returns no aggregate beyond
// `totalNumberOfRecords`, so the success/failure cards are captioned "on this
// page" and only Total Records is a true total. Processing time is not on the
// payload, so there is no duration column.
// ----------------------------------------------------------------------

const PAGE_SIZES = [10, 25, 50, 100];

type Filters = {
  clientRefId: string;
  partnerTransactionId: string;
  type: string;
  vendorName: string;
  categoryName: string;
  operator: string;
  startDate: Date | null;
  endDate: Date | null;
};

const EMPTY_FILTERS: Filters = {
  clientRefId: "",
  partnerTransactionId: "",
  type: "",
  vendorName: "",
  categoryName: "",
  operator: "",
  startDate: null,
  endDate: null,
};

/** dd/mm/yyyy - the format the endpoint has always been sent. */
const apiDate = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(value)
    : "";

export default function ProviderActivity() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  /* `draft` is what the filter bar edits; `applied` is what the API has been
     asked for. Paging re-sends `applied`, so a page change keeps the filter. */
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  const [planTypes, setPlanTypes] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [detail, setDetail] = useState<any>(null);

  /* ---------------- lookups ---------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");

    Api("admin/vendoriliaryRecord/type", "GET", "", token).then((res: any) => {
      if (res?.status === 200 && res.data.code === 200)
        setPlanTypes(res.data.data || []);
    });

    Api("admin/vendorAuxiliaryRecord/vendor_list", "GET", "", token).then(
      (res: any) => {
        if (res?.status === 200 && res.data.code === 200)
          setProviders(res.data.data || []);
      }
    );

    Api("category/get_CategoryList", "GET", "", token).then((res: any) => {
      if (res?.status === 200 && res.data.code === 200)
        setServices(res.data.data || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- rows ---------------- */

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);

    const token = localStorage.getItem("token");

    const body = {
      pageInitData: { pageSize, currentPage: page + 1 },
      type: applied.type,
      operator: applied.operator,
      startDate: apiDate(applied.startDate),
      endDate: apiDate(applied.endDate),
      categoryName: applied.categoryName,
      vendorName: applied.vendorName,
      clientRefId: applied.clientRefId,
      partnerTransactionId: applied.partnerTransactionId,
    };

    const response: any = await Api(
      "admin/vendorAuxiliaryRecord/fetch",
      "POST",
      body,
      token
    );

    if (response?.status === 200 && response.data.code === 200) {
      setRows(response.data.data || []);
      setTotal(response.data.totalNumberOfRecords || 0);
    } else {
      setRows([]);
      setTotal(0);
      setFailed(true);
      if (response?.data?.message) {
        enqueueSnackbar(response.data.message, { variant: "error" });
      }
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, applied]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = () => {
    setPage(0);
    setApplied(draft);
  };

  const clearFilters = () => {
    setPage(0);
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  const hasFilter = useMemo(
    () =>
      Object.values(applied).some((value) =>
        value instanceof Date ? true : Boolean(value)
      ),
    [applied]
  );

  /* Page-scoped counts - the endpoint returns no aggregate. */
  const pageStats = useMemo(() => {
    const success = rows.filter(
      (row) => String(row?.status).toLowerCase() === "success"
    ).length;

    const vendors = new Set<string>();
    rows.forEach((row) => row?.vendorName && vendors.add(row.vendorName));

    return {
      success,
      failed: rows.length - success,
      vendors: vendors.size,
    };
  }, [rows]);

  const setDraftField = (patch: Partial<Filters>) =>
    setDraft((current) => ({ ...current, ...patch }));

  return (
    <>
      <Helmet>
        <title> Provider Activity | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Provider Activity"
          subtitle="Every plan-fetch call made to a provider, with the request and response the provider returned."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={load}
              >
                Refresh
              </PageGhostButton>
              {hasFilter && (
                <PageGhostButton
                  startIcon={<FilterAltOffOutlinedIcon />}
                  onClick={clearFilters}
                >
                  Clear
                </PageGhostButton>
              )}
              <PageActionButton
                startIcon={<SearchOutlinedIcon />}
                onClick={applyFilters}
              >
                Search
              </PageActionButton>
            </>
          }
        />

        <StatGrid>
          <StatCard
            label="Total Records"
            value={total.toLocaleString("en-IN")}
            caption={hasFilter ? "Matching the filter" : "All activity"}
            icon={<ReceiptLongOutlinedIcon />}
          />
          <StatCard
            label="Successful"
            value={pageStats.success}
            caption="On this page"
            tone="success"
            icon={<CheckCircleOutlineOutlinedIcon />}
          />
          <StatCard
            label="Not Successful"
            value={pageStats.failed}
            caption="On this page"
            tone={pageStats.failed > 0 ? "error" : "neutral"}
            icon={<ErrorOutlineOutlinedIcon />}
          />
          <StatCard
            label="Providers"
            value={pageStats.vendors}
            caption="On this page"
            tone="neutral"
            icon={<StorefrontOutlinedIcon />}
          />
        </StatGrid>

        <FilterBar>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={165}>
              <DatePicker
                label=""
                inputFormat="DD/MM/YYYY"
                value={draft.startDate}
                maxDate={new Date()}
                onChange={(value: any) =>
                  setDraftField({ startDate: value ? new Date(value) : null })
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="From"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                    }}
                  />
                )}
              />
            </FilterSlot>

            <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={165}>
              <DatePicker
                label=""
                inputFormat="DD/MM/YYYY"
                value={draft.endDate}
                minDate={draft.startDate || undefined}
                maxDate={new Date()}
                onChange={(value: any) =>
                  setDraftField({ endDate: value ? new Date(value) : null })
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="To"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                    }}
                  />
                )}
              />
            </FilterSlot>
          </LocalizationProvider>

          <FilterSlot minWidth={180}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Client ref ID"
              value={draft.clientRefId}
              onChange={(event) =>
                setDraftField({ clientRefId: event.target.value })
              }
              onKeyDown={(event) => event.key === "Enter" && applyFilters()}
              InputProps={{ disableUnderline: true }}
            />
          </FilterSlot>

          <FilterSlot minWidth={180}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Partner ID"
              value={draft.partnerTransactionId}
              onChange={(event) =>
                setDraftField({ partnerTransactionId: event.target.value })
              }
              onKeyDown={(event) => event.key === "Enter" && applyFilters()}
              InputProps={{ disableUnderline: true }}
            />
          </FilterSlot>

          <FilterSlot minWidth={160}>
            <TextField
              select
              fullWidth
              variant="standard"
              value={draft.type}
              onChange={(event) => setDraftField({ type: event.target.value })}
              InputProps={{ disableUnderline: true }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">All plan types</MenuItem>
              {planTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </FilterSlot>

          <FilterSlot minWidth={170}>
            <TextField
              select
              fullWidth
              variant="standard"
              value={draft.categoryName}
              onChange={(event) =>
                setDraftField({ categoryName: event.target.value })
              }
              InputProps={{ disableUnderline: true }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">All services</MenuItem>
              {services.map((service: any) => (
                <MenuItem key={service._id} value={service.category_name}>
                  {service.category_name}
                </MenuItem>
              ))}
            </TextField>
          </FilterSlot>

          <FilterSlot icon={<StorefrontOutlinedIcon />} minWidth={175}>
            <TextField
              select
              fullWidth
              variant="standard"
              value={draft.vendorName}
              onChange={(event) =>
                setDraftField({ vendorName: event.target.value })
              }
              InputProps={{ disableUnderline: true }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">All providers</MenuItem>
              {providers.map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </TextField>
          </FilterSlot>

          <FilterSlot minWidth={170}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Operator name"
              value={draft.operator}
              onChange={(event) =>
                setDraftField({ operator: event.target.value })
              }
              onKeyDown={(event) => event.key === "Enter" && applyFilters()}
              InputProps={{ disableUnderline: true }}
            />
          </FilterSlot>
        </FilterBar>

        {loading ? (
          <LoadingState label="Loading provider activity..." height={320} />
        ) : failed ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load activity"
            description="The activity feed did not come back. Try again."
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={load}
              >
                Retry
              </PageGhostButton>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ReceiptLongOutlinedIcon />}
            title={hasFilter ? "No matching activity" : "No activity recorded"}
            description={
              hasFilter
                ? "No provider call matches these filters. Widen the date range or clear the filter."
                : "No provider plan-fetch calls have been recorded yet."
            }
            action={
              hasFilter ? (
                <PageGhostButton
                  startIcon={<FilterAltOffOutlinedIcon />}
                  onClick={clearFilters}
                >
                  Clear filters
                </PageGhostButton>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            minWidth={1180}
            columns={[
              { id: "when", label: "When" },
              { id: "user", label: "User" },
              { id: "service", label: "Service" },
              { id: "operator", label: "Operator" },
              { id: "type", label: "Type" },
              { id: "provider", label: "Provider" },
              { id: "status", label: "Status", align: "center" },
              { id: "action", label: "", align: "right" },
            ]}
            footer={
              <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={pageSize}
                rowsPerPageOptions={PAGE_SIZES}
                onPageChange={(_, next) => setPage(next)}
                onRowsPerPageChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(0);
                }}
              />
            }
          >
            {rows.map((row: any) => (
              <KitRow key={row._id}>
                <TableCell>
                  <Typography sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {row?.createdAt ? fDateTime(row.createdAt) : "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CustomAvatar
                      name={row?.userId?.firstName || ""}
                      alt={row?.userId?.firstName}
                      src={row?.userId?.selfie && row.userId.selfie[0]}
                      sx={{ width: 32, height: 32 }}
                    />
                    <StackedCell
                      primary={
                        `${row?.userId?.firstName || ""} ${
                          row?.userId?.lastName || ""
                        }`.trim() || "-"
                      }
                      secondary={
                        [row?.userId?.role, row?.userId?.userCode]
                          .filter(Boolean)
                          .join(" • ") || undefined
                      }
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13.5 }}>
                    {row?.categoryName || "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <StackedCell
                    primary={row?.operatorDetails?.key1 || "-"}
                    secondary={
                      [
                        row?.operatorDetails?.key2,
                        row?.operatorDetails?.key3,
                      ]
                        .filter(Boolean)
                        .join(" • ") || undefined
                    }
                  />
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13.5 }}>
                    {row?.type || "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    {row?.vendorName || "-"}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  {row?.status ? <StatusPill status={row.status} /> : "-"}
                </TableCell>

                <TableCell align="right">
                  <PageGhostButton
                    startIcon={<CodeOutlinedIcon />}
                    onClick={() => setDetail(row)}
                  >
                    Details
                  </PageGhostButton>
                </TableCell>
              </KitRow>
            ))}
          </DataTable>
        )}
      </Box>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)}>
        <Box>
          <ModalShell
            title="Provider call"
            subtitle={
              detail
                ? [detail.vendorName, detail.type].filter(Boolean).join(" • ")
                : undefined
            }
            width={860}
            onClose={() => setDetail(null)}
          >
            {detail && <ActivityDetail row={detail} />}
          </ModalShell>
        </Box>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------

/** Request / response plus the device metadata that used to be a tooltip. */
function ActivityDetail({ row }: { row: any }) {
  const theme = useTheme();

  const meta = row?.metaData || {};

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "grid",
          rowGap: 2,
          columnGap: 2,
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        <Tile label="When" value={row?.createdAt ? fDateTime(row.createdAt) : ""} />
        <Tile label="Service" value={row?.categoryName} />
        <Tile label="Provider" value={row?.vendorName} />
        <Tile label="Plan type" value={row?.type} />
        <Tile label="Status" value={row?.status} />
        <Tile label="Operator" value={row?.operatorDetails?.key1} />
      </Box>

      <Box>
        <SectionLabel icon={<InfoOutlinedIcon />}>Device</SectionLabel>
        <Box
          sx={{
            mt: 1.25,
            display: "grid",
            rowGap: 2,
            columnGap: 2,
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          <Tile label="Device type" value={meta.deviceType} />
          <Tile label="IP address" value={meta.ipAddress} />
          <Tile label="IMEI" value={meta.imeiNumber} />
          <Tile label="MAC address" value={meta.macAddress} />
          <Tile
            label="Location"
            value={
              meta.lat || meta.long
                ? `${meta.lat ?? "-"}, ${meta.long ?? "-"}`
                : ""
            }
          />
        </Box>
      </Box>

      <Box>
        <SectionLabel icon={<CodeOutlinedIcon />}>Request</SectionLabel>
        <Payload theme={theme} value={row?.request} />
      </Box>

      <Box>
        <SectionLabel icon={<CodeOutlinedIcon />}>Response</SectionLabel>
        <Payload theme={theme} value={row?.response} />
      </Box>
    </Stack>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        sx={{
          display: "flex",
          color: "text.disabled",
          "& svg": { fontSize: 16 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.7,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

function Tile({ label, value }: { label: string; value?: string }) {
  const text = value ? String(value) : "";

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.7,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 0.4,
          fontSize: 13.5,
          wordBreak: "break-word",
          color: text ? "text.primary" : "text.disabled",
        }}
      >
        {text || "-"}
      </Typography>
    </Box>
  );
}

/** Raw provider payload, pretty-printed when it happens to be JSON. */
function Payload({ theme, value }: { theme: any; value?: string }) {
  if (!value) {
    return (
      <Typography sx={{ mt: 1, fontSize: 13, color: "text.disabled" }}>
        Nothing recorded.
      </Typography>
    );
  }

  let text = String(value);
  try {
    text = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    /* Not JSON - the provider sent a plain string. Show it as it came. */
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 0.5 }}>
        <CopyText value={String(value)} size={14}>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            Copy
          </Typography>
        </CopyText>
      </Stack>

      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          fontSize: 12,
          maxHeight: 260,
          overflow: "auto",
          borderRadius: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          backgroundColor: alpha(theme.palette.grey[500], 0.1),
        }}
      >
        {text}
      </Box>
    </Box>
  );
}
