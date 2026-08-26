import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Grid,
  Chip,
  Modal,
  Stack,
  Divider,
  MenuItem,
  TableCell,
  TextField,
  Typography,
  Autocomplete,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { alpha, useTheme } from "@mui/material/styles";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form";
// components
import { useSnackbar } from "notistack";
import { CustomAvatar } from "src/components/custom-avatar";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// utils
import { fDateTime, fDateFormatForApi } from "src/utils/formatTime";
import { fIndianCurrency } from "src/utils/formatNumber";
import { sentenceCase } from "change-case";
// page kit
import {
  PageHeader,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  DataTable,
  KitRow,
  StatusPill,
  StackedCell,
  CopyText,
  StatCard,
  StatGrid,
  ModalShell,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Money Movement.
//
// `adminTransaction/fund_flow_transaction` returns wallet movements: who sent,
// who received, how much, the narration and the network metadata. It filters on
// clientRefId / status / amount / date range / partnerId and pages server-side.
//
// There is no admin-relative direction field, so this screen shows From -> To
// rather than inventing inflow/outflow totals. Amount and status counts in the
// summary are page-scoped and captioned as such - the endpoint returns no
// aggregate.
// ----------------------------------------------------------------------

type FormValuesProps = {
  searchBy: string;
  clientRefId: string;
  status: string;
  User: string;
  agentId: string;
  distributorId: string;
  masterDistributorId: string;
  partnerId: string;
  amount: string;
  usersearchby: string;
  startDate: Date | null;
  endDate: Date | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "in_process", label: "In process" },
  { value: "hold", label: "Hold" },
  { value: "initiated", label: "Initiated" },
];

/** Every party shape the payload can carry, checked in this order. */
const PARTY_KEYS = [
  "agentDetails",
  "adminDetails",
  "distributorDetails",
  "masterDistributorDetails",
  "partnerDetails",
];

type Party = {
  name: string;
  role?: string;
  userCode?: string;
  selfie?: string;
};

/** Reads a party out of a row by matching the wallet-ledger id against each
 *  *Details block - the same matching the old five repeated blocks did. */
function partyFor(row: any, targetId?: string): Party | null {
  if (!targetId) return null;

  for (const key of PARTY_KEYS) {
    const party = row?.[key]?.id;
    if (!party || party._id !== targetId) continue;

    return {
      name:
        `${party.firstName || ""} ${party.lastName || ""}`.trim() ||
        party.email ||
        "—",
      role: party.role,
      userCode: party.userCode,
      selfie: party.selfie?.[0],
    };
  }

  return null;
}

/** The acting user for a non-fund-flow row: the agent, else the API partner. */
function actingParty(row: any): Party | null {
  const party = row?.agentDetails?.id || row?.partnerDetails?.id;
  if (!party) return null;

  return {
    name:
      `${party.firstName || ""} ${party.lastName || ""}`.trim() ||
      party.email ||
      "—",
    role: party.role,
    userCode: party.userCode,
    selfie: party.selfie?.[0],
  };
}

const isFundFlow = (row: any) =>
  String(row?.transactionType || "").toLowerCase() === "fund flow";

export default function FundFlow() {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [sdata, setSdata] = useState<any[]>([]);
  const [txnCount, setTxnCount] = useState(0);
  const [searchLoading, isSearchLoading] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalTxnAmount, setTotalTxnAmount] = useState(0);

  const [detailRow, setDetailRow] = useState<any>(null);
  const [historyRow, setHistoryRow] = useState<any>(null);

  // Form Controller
  const FilterSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
    amount: Yup.string(),
  });
  const defaultValues = {
    searchBy: "partnerId",
    clientRefId: "",
    status: "",
    agentId: "",
    distributorId: "",
    masterDistributorId: "",
    partnerId: "",
    amount: "",
    usersearchby: "",
    User: "",
    startDate: null,
    endDate: null,
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  //Transaction List
  useEffect(() => {
    fundFlowTxn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    const term = getValues("User");
    if (term && term.length > 2) searchFromUser(term);
    else setUserList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("User")]);

  /* ================= API - unchanged contracts ================= */

  const searchFromUser = (val: string) => {
    const token = localStorage.getItem("token");
    let body = {
      searchBy: watch("usersearchby"),
      role:
        getValues("searchBy") == "agentId"
          ? "agent"
          : getValues("searchBy") == "distributorId"
          ? "distributor"
          : getValues("searchBy") == "masterDistributorId"
          ? "m_distributor"
          : "API_User",
      searchInput: val,
      finalStatus: watch("searchBy") !== "partnerId" ? "approved" : "",
    };
    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200 && Response.data.code == 200) {
        setUserList(Response.data.data || []);
      }
    });
  };

  const applyResponse = (Response: any) => {
    setSdata(Response.data.data.data || []);
    setTxnCount(Response.data.data.totalNumberOfRecords || 0);
    setTotalTxnAmount(
      (Response.data.data.data || []).reduce(
        (accumulator: number, currentValue: any) =>
          accumulator + Number(currentValue.amount || 0),
        0
      )
    );
  };

  /** Reads the live form values, so paging keeps whatever filter is applied. */
  const fundFlowTxn = () => {
    setLoading(true);
    setError("");
    setSdata([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: getValues("clientRefId") || "",
      status: getValues("status") || "",
      agentId: getValues("agentId") || "",
      distributorId: getValues("distributorId") || "",
      masterDistributorId: getValues("masterDistributorId") || "",
      partnerId: getValues("partnerId") || "",
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
      amount: getValues("amount") || "",
    };
    Api(`adminTransaction/fund_flow_transaction`, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          applyResponse(Response);
        } else {
          const message =
            Response?.data?.message || "Could not load money movement.";
          setError(message);
          enqueueSnackbar(message, { variant: "error" });
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err?.message || "Could not load money movement.");
        setLoading(false);
      });
  };

  //get Transaction by using Filter
  const searchTxnFilterData = async (data: FormValuesProps) => {
    setCurrentPage(1);
    isSearchLoading(true);
    setError("");
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: 1,
      },
      clientRefId: data.clientRefId,
      status: data.status,
      agentId: data.agentId,
      distributorId: data.distributorId,
      masterDistributorId: data.masterDistributorId,
      partnerId: data.partnerId,
      startDate: fDateFormatForApi(data.startDate),
      endDate: fDateFormatForApi(data.endDate),
      amount: data.amount,
    };
    await Api(`adminTransaction/fund_flow_transaction`, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            applyResponse(Response);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
        }
        isSearchLoading(false);
      })
      .catch(() => {
        enqueueSnackbar("Failed", { variant: "error" });
        isSearchLoading(false);
      });
  };

  const onClear = () => {
    reset(defaultValues);
    setUserList([]);
    setCurrentPage(1);
    /* Values are read inside fundFlowTxn, so reset first then refetch. */
    setTimeout(fundFlowTxn, 0);
  };

  /* ================= DERIVED (page-scoped) ================= */

  const pageStates = useMemo(() => {
    let completed = 0;
    let inFlight = 0;
    let failed = 0;

    sdata.forEach((row) => {
      const status = String(row?.status || "").toLowerCase();
      if (status === "failed") failed += 1;
      else if (
        status === "pending" ||
        status === "in_process" ||
        status === "hold" ||
        status === "initiated"
      )
        inFlight += 1;
      else completed += 1;
    });

    return { completed, inFlight, failed };
  }, [sdata]);

  const hasFilter = Boolean(
    watch("clientRefId") ||
      watch("status") ||
      watch("amount") ||
      watch("partnerId") ||
      watch("startDate") ||
      watch("endDate")
  );

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Money Movement | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Money Movement"
          subtitle="Wallet movements across the platform - who sent, who received, and how each settled."
        />

        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(searchTxnFilterData)}
        >
          <FilterBar>
            <FilterSlot icon={<PersonSearchOutlinedIcon />} grow minWidth={250}>
              <Autocomplete
                fullWidth
                freeSolo
                options={userList}
                filterOptions={(options) => options}
                getOptionLabel={(option: any) =>
                  typeof option === "string"
                    ? option
                    : `${option.firstName || ""} ${option.lastName || ""}`.trim()
                }
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    setValue("User", value);
                    setValue("partnerId", "");
                    setValue("agentId", "");
                    setValue("distributorId", "");
                    setValue("masterDistributorId", "");
                  }
                }}
                onChange={(_, value: any) => {
                  if (!value || typeof value === "string") return;
                  if (value.role == "agent") setValue("agentId", value._id);
                  else if (value.role == "distributor")
                    setValue("distributorId", value._id);
                  else if (value.role == "m_distributor")
                    setValue("masterDistributorId", value._id);
                  else setValue("partnerId", value._id);

                  setValue(
                    "User",
                    `${value.firstName || ""} ${value.lastName || ""}`.trim()
                  );
                  setUserList([]);
                }}
                renderOption={(props, option: any) => (
                  <li {...props} key={option._id}>
                    <Box sx={{ py: 0.25 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                        {`${option.firstName || ""} ${
                          option.lastName || ""
                        }`.trim() || "Unnamed"}
                      </Typography>
                      {option.userCode && (
                        <Typography
                          sx={{ fontSize: 11.5, color: "text.secondary" }}
                        >
                          {option.userCode}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Search API user"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                    }}
                  />
                )}
              />
            </FilterSlot>

            <FilterSlot icon={<MonitorHeartOutlinedIcon />} minWidth={175}>
              <TextField
                select
                fullWidth
                variant="standard"
                value={watch("status") || ""}
                onChange={(event) => setValue("status", event.target.value)}
                InputProps={{ disableUnderline: true }}
                SelectProps={{ displayEmpty: true }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FilterSlot>

            <FilterSlot icon={<ReceiptLongOutlinedIcon />} minWidth={200}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Transaction ID"
                value={watch("clientRefId") || ""}
                onChange={(event) =>
                  setValue("clientRefId", event.target.value)
                }
                InputProps={{ disableUnderline: true }}
              />
            </FilterSlot>

            <FilterSlot icon={<CurrencyRupeeOutlinedIcon />} minWidth={140}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Amount"
                value={watch("amount") || ""}
                onChange={(event) => setValue("amount", event.target.value)}
                InputProps={{ disableUnderline: true }}
              />
            </FilterSlot>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={310}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DatePicker
                    value={watch("startDate")}
                    inputFormat="DD/MM/YYYY"
                    maxDate={new Date()}
                    onChange={(newValue: any) =>
                      setValue("startDate", newValue)
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
                        sx={{ width: 125 }}
                      />
                    )}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "text.disabled",
                    }}
                  >
                    TO
                  </Typography>
                  <DatePicker
                    value={watch("endDate")}
                    inputFormat="DD/MM/YYYY"
                    minDate={watch("startDate") || undefined}
                    maxDate={new Date()}
                    onChange={(newValue: any) => setValue("endDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="To"
                        InputProps={{
                          ...params.InputProps,
                          disableUnderline: true,
                        }}
                        sx={{ width: 125 }}
                      />
                    )}
                  />
                </Stack>
              </FilterSlot>
            </LocalizationProvider>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={searchLoading || isSubmitting}
              startIcon={<SearchIcon />}
              sx={{ height: 48, px: 3, borderRadius: 1.5, fontWeight: 700 }}
            >
              Search
            </LoadingButton>

            <PageGhostButton startIcon={<RestartAltIcon />} onClick={onClear}>
              Reset
            </PageGhostButton>
          </FilterBar>
        </FormProvider>

        <StatGrid>
          <StatCard
            label="Movements"
            value={txnCount}
            caption={hasFilter ? "For the active filter" : "Across all pages"}
            icon={<SwapHorizOutlinedIcon />}
          />
          <StatCard
            label="Amount On Page"
            value={fIndianCurrency(totalTxnAmount) || "₹0"}
            caption={`${sdata.length} movements shown`}
            tone="primary"
            icon={<PaymentsOutlinedIcon />}
          />
          <StatCard
            label="Completed"
            value={pageStates.completed}
            caption="On this page"
            tone="success"
            icon={<TaskAltOutlinedIcon />}
          />
          <StatCard
            label="In Flight / Failed"
            value={`${pageStates.inFlight} / ${pageStates.failed}`}
            caption="Pending or held, then failed"
            tone={pageStates.failed > 0 ? "error" : "warning"}
            icon={<HourglassTopOutlinedIcon />}
          />
        </StatGrid>

        {loading ? (
          <LoadingState label="Loading money movement..." height={320} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load movements"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RestartAltIcon />}
                onClick={fundFlowTxn}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : sdata.length === 0 ? (
          <EmptyState
            icon={<SwapHorizOutlinedIcon />}
            title={hasFilter ? "No movements match" : "No money movement yet"}
            description={
              hasFilter
                ? "Nothing matches these filters. Widen the date range or clear them."
                : "No wallet movement has been recorded."
            }
            action={
              hasFilter ? (
                <PageGhostButton
                  startIcon={<RestartAltIcon />}
                  onClick={onClear}
                >
                  Clear filters
                </PageGhostButton>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            minWidth={1220}
            columns={[
              { id: "when", label: "Date & Time" },
              { id: "reference", label: "Reference" },
              { id: "from", label: "From" },
              { id: "to", label: "To" },
              { id: "amount", label: "Amount", align: "right" },
              { id: "narration", label: "Narration" },
              { id: "status", label: "Status", align: "center" },
              { id: "doneby", label: "Done By" },
              { id: "action", label: "Action", align: "center" },
            ]}
            footer={
              <TablePagination
                component="div"
                count={txnCount}
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
            {sdata.map((row: any) => (
              <MovementRow
                key={row._id}
                row={row}
                onDetail={setDetailRow}
                onHistory={setHistoryRow}
              />
            ))}
          </DataTable>
        )}

        {/* ── Movement detail (metadata + narration) ─────────────────── */}
        <Modal open={Boolean(detailRow)} onClose={() => setDetailRow(null)}>
          <ModalShell
            title="Movement Detail"
            subtitle={
              detailRow
                ? `${detailRow.clientRefId || "-"} • ${fDateTime(
                    detailRow.createdAt
                  )}`
                : undefined
            }
            onClose={() => setDetailRow(null)}
            width={720}
          >
            {detailRow && (
              <>
                <SectionLabel>Movement</SectionLabel>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="Transaction ID"
                      value={detailRow.clientRefId}
                      copy
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile label="Type" value={detailRow.transactionType} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="Amount"
                      value={fIndianCurrency(+detailRow.amount) || "₹0"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile label="Status" value={detailRow.status} />
                  </Grid>
                </Grid>

                {!isFundFlow(detailRow) && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <SectionLabel>Vendor</SectionLabel>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <Tile label="Vendor" value={detailRow.vendorName} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Tile
                          label="Vendor Txn ID"
                          value={detailRow.transactionId}
                          copy
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Tile
                          label="UTR Number"
                          value={detailRow.vendorUtrNumber}
                          copy
                        />
                      </Grid>
                    </Grid>
                  </>
                )}

                <Divider sx={{ my: 2.5 }} />
                <SectionLabel>Narration</SectionLabel>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="Reason"
                      value={detailRow?.walletLedgerData?.reason}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="Remarks"
                      value={detailRow?.walletLedgerData?.remarks}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />
                <SectionLabel>Device & Location</SectionLabel>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="Device Type"
                      value={detailRow?.metaData?.deviceType}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="IMEI"
                      value={detailRow?.metaData?.imeiNumber || "NA"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="IP Address"
                      value={detailRow?.metaData?.ipAddress}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Tile
                      label="Latitude / Longitude"
                      value={
                        detailRow?.metaData?.lat || detailRow?.metaData?.long
                          ? `${detailRow?.metaData?.lat}, ${detailRow?.metaData?.long}`
                          : undefined
                      }
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </ModalShell>
        </Modal>

        {/* ── Status-check history ───────────────────────────────────── */}
        <Modal open={Boolean(historyRow)} onClose={() => setHistoryRow(null)}>
          <ModalShell
            title="Status History"
            subtitle={
              historyRow
                ? `${historyRow.clientRefId || "-"} • ${
                    historyRow?.checkStatus?.length || 0
                  } event(s)`
                : undefined
            }
            onClose={() => setHistoryRow(null)}
            width={900}
          >
            {historyRow?.checkStatus?.length ? (
              <Stack spacing={2}>
                {historyRow.checkStatus.map((item: any, index: number) => (
                  <Box
                    key={item._id || index}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <Chip
                        size="small"
                        color={index === 0 ? "primary" : "default"}
                        label={index === 0 ? "Transaction" : "Check Status"}
                        sx={{ fontSize: 11, fontWeight: 700 }}
                      />
                      <Typography
                        sx={{ fontSize: 12.5, color: "text.secondary" }}
                      >
                        {fDateTime(item.date)}
                      </Typography>
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <Tile label="Device" value={item?.deviceType} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Tile label="IP" value={item?.ipAddress} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Tile
                          label="Latitude / Longitude"
                          value={
                            item?.lat || item?.long
                              ? `${item?.lat}, ${item?.long}`
                              : undefined
                          }
                        />
                      </Grid>
                      {index !== 0 && item?.checkStatusDoneBy && (
                        <Grid item xs={12} sm={6}>
                          <Tile
                            label="Checked By"
                            value={`${
                              item.checkStatusDoneBy.firstName || ""
                            } ${item.checkStatusDoneBy.lastName || ""} ${
                              item.checkStatusDoneBy.userCode
                                ? `(${item.checkStatusDoneBy.userCode})`
                                : ""
                            }`.trim()}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Tile label="Request" value={item?.vendorApiRequest} />
                      </Grid>
                      <Grid item xs={12}>
                        <Tile
                          label="API Response"
                          value={item?.vendorApiResponse}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
                No status-check events recorded for this movement.
              </Typography>
            )}
          </ModalShell>
        </Modal>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

const MovementRow = React.memo(({ row, onDetail, onHistory }: any) => {
  const theme = useTheme();

  const fundFlow = isFundFlow(row);

  /* Fund flow moves value between two platform accounts; everything else moves
     it between a user and a vendor. */
  const from = fundFlow
    ? partyFor(row, row?.walletLedgerData?.from?.id)
    : actingParty(row);
  const to = fundFlow ? partyFor(row, row?.walletLedgerData?.to?.id) : null;

  const hasHistory = Boolean(row?.checkStatus?.length);

  return (
    <KitRow>
      {/* When */}
      <TableCell>
        <StackedCell
          primary={fDateTime(row.createdAt)}
          secondary={row?.transactionType}
        />
      </TableCell>

      {/* Reference */}
      <TableCell>
        <CopyText value={row?.clientRefId}>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}
          >
            {row?.clientRefId || "-"}
          </Typography>
        </CopyText>
      </TableCell>

      {/* From */}
      <TableCell>
        <PartyCell party={from} />
      </TableCell>

      {/* To */}
      <TableCell>
        {fundFlow ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <EastRoundedIcon
              sx={{ fontSize: 16, color: theme.palette.text.disabled }}
            />
            <PartyCell party={to} />
          </Stack>
        ) : (
          <StackedCell
            primary={row?.vendorName || "-"}
            secondary={
              row?.vendorUtrNumber
                ? `UTR ${row.vendorUtrNumber}`
                : row?.transactionId || undefined
            }
          />
        )}
      </TableCell>

      {/* Amount */}
      <TableCell align="right">
        <Typography sx={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>
          {fIndianCurrency(+row?.amount) || "₹0"}
        </Typography>
      </TableCell>

      {/* Narration */}
      <TableCell sx={{ maxWidth: 220 }}>
        <StackedCell
          primary={row?.walletLedgerData?.reason || "-"}
          secondary={row?.walletLedgerData?.remarks || undefined}
        />
      </TableCell>

      {/* Status */}
      <TableCell align="center">
        <StatusPill status={row?.status} />
      </TableCell>

      {/* Done by */}
      <TableCell>
        <StackedCell
          primary={row?.operator?.key1 || "-"}
          secondary={row?.operator?.key2 || undefined}
        />
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <PageGhostButton onClick={() => onDetail(row)}>Detail</PageGhostButton>
          {hasHistory && (
            <PageGhostButton
              startIcon={<HistoryOutlinedIcon />}
              onClick={() => onHistory(row)}
            >
              History
            </PageGhostButton>
          )}
        </Stack>
      </TableCell>
    </KitRow>
  );
});

/** Avatar + name + role/code for one side of a movement. */
function PartyCell({ party }: { party: Party | null }) {
  if (!party) {
    return (
      <Typography sx={{ fontSize: 13, color: "text.disabled" }}>—</Typography>
    );
  }

  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <CustomAvatar
        name={party.name}
        alt={party.name}
        src={party.selfie}
        sx={{ width: 30, height: 30 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }} noWrap>
          {party.name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }} noWrap>
          {[party.role ? sentenceCase(party.role) : "", party.userCode]
            .filter(Boolean)
            .join(" • ") || "-"}
        </Typography>
      </Box>
    </Stack>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </Typography>
  );
}

function Tile({
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
