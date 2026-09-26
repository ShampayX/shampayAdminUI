import React from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Tab,
  Modal,
  Stack,
  MenuItem,
  TextField,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AddchartOutlinedIcon from "@mui/icons-material/AddchartOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "notistack";
// utils
import { fDateFormatForApi } from "src/utils/formatTime";
import { fetchLocation } from "src/utils/fetchLocation";
import AWS from "aws-sdk";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form/FormProvider";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomUserAutocomplete from "src/components/CustomFunction/CustomUserAutocomplete";
import dayjs from "dayjs";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  SearchField,
  KitTabs,
  DataTable,
  StatCard,
  StatGrid,
  ModalShell,
  FormGrid,
  EmptyState,
  LoadingState,
  useDataTable,
} from "src/components/page-kit";
//
import HistoricalDataTable from "./HistoricalDataTable";

// ----------------------------------------------------------------------
// Export Archive - every report generation request and its outcome.
//
// `adminTransaction/transaction_record_history/:type` is paginated server-side
// and takes no search or status parameter, so the search box and status filter
// here narrow the CURRENT PAGE only. Both say so on screen; do not relabel them
// as global filters unless the endpoint grows those params.
// ----------------------------------------------------------------------

type FormValuesProps = {
  fromDate: Date | null;
  toDate: Date | null;
  user_id: string;
  type_of_report: string;
  role: string;
  email: string;
  searchby: string;
  users: any;
  userDetail: any;
};

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

/**
 * Report types the archive can be filtered by. `value` is the API path segment;
 * two entries deliberately share `walletLedger`, so the tab strip is keyed by
 * label instead - keying by value highlighted both at once.
 */
const TabsData = [
  { label: "Master Transaction Report", value: "transactionRecords" },
  { label: "Fund Request", value: "fundRequest" },
  { label: "Money Movement", value: "fundFlow" },
  { label: "Account Statement", value: "walletLedger" },
  { label: "GST & TDS Report", value: "gstTDSReport" },
  { label: "Account Ledger", value: "walletLedger" },
  { label: "Member Export", value: "memberExport" },
  { label: "Main Wallet Summary", value: "Admin Main Wallet Summary Report " },
  /* "AEPS Wallet Summary" (value "Admin AEPS Wallet Summary Report ") was
     removed - the AEPS wallet is not surfaced in this console. */
];

/**
 * Report types the report Lambda can actually generate. The other tabs still
 * show their archive, but requesting one would be refused (400) or end Failed.
 */
const EXPORTABLE = ["transactionRecords", "fundRequest", "fundFlow", "walletLedger"];

/** These run per user only; the Lambda rejects them platform-wide. */
const USER_SCOPED_ONLY = ["fundFlow", "walletLedger"];

/** How often the archive re-reads itself while an export is still pending. */
const POLL_MS = 15000;

/** Buckets the raw `status` strings into the four states operators care about. */
const STATE_OF = (status: string) => {
  const value = String(status || "").toLowerCase();
  if (value === "generated") return "completed";
  if (value === "failed") return "failed";
  if (value === "in_process" || value === "processing") return "processing";
  return "pending";
};

const STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export default function HistoricalData() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [reportData, setReportData] = React.useState<{
    isLoading: boolean;
    error: string;
    data: any[];
    pageSize: number;
    currentPage: number;
    pageCount: number;
  }>({
    isLoading: false,
    error: "",
    data: [],
    pageSize: 25,
    currentPage: 1,
    pageCount: 0,
  });

  const [currentTab, setCurrentTab] = React.useState(TabsData[0]);
  const [statusFilter, setStatusFilter] = React.useState("");

  //modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const tableLabels = [
    { id: "requested", label: "Requested At" },
    { id: "reportFor", label: "Report For" },
    { id: "range", label: "Covered Range" },
    { id: "meta", label: "Requested From" },
    { id: "status", label: "Status", align: "center" as const },
    { id: "action", label: "Action", align: "center" as const },
  ];

  const reportSchema = Yup.object().shape({
    fromDate: Yup.date().required("Start date is required"),
    toDate: Yup.date().required("End date is required"),
    role: Yup.string().required("Role is required"),
  });

  const defaultValues = {
    fromDate: null,
    toDate: null,
    user_id: "",
    type_of_report: currentTab.value,
    role: "",
    email: "finance@shampay.pro",
    searchby: "",
    users: [],
    userDetail: {},
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(reportSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isValid },
  } = methods;

  React.useEffect(() => {
    getReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, reportData.currentPage, reportData.pageSize]);

  const hasPending = reportData.data.some((row) => {
    const state = STATE_OF(row?.status);
    return state === "pending" || state === "processing";
  });

  // Exports finish in the background. While any row on this page is still
  // pending, re-read quietly so it flips to Completed / Failed on its own.
  React.useEffect(() => {
    if (!hasPending || open) return;
    const timer = setTimeout(() => getReport(true), POLL_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPending, open, reportData.data]);

  const getReport = (silent = false) => {
    if (!silent) {
      setReportData((prevState) => ({ ...prevState, isLoading: true, error: "" }));
    }

    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: reportData.pageSize,
        currentPage: reportData.currentPage,
      },
    };

    /* Errors are handled inside the chain - a `throw` in the old `.then`
       escaped the surrounding try/catch and never reached the snackbar. */
    Api(
      `adminTransaction/transaction_record_history/${currentTab.value}`,
      "POST",
      body,
      token
    )
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setReportData((prevState) => ({
            ...prevState,
            data: Response.data.data.data || [],
            pageCount: Response.data.data.totalNumberOfRecords || 0,
            isLoading: false,
            error: "",
          }));
          return;
        }

        const message =
          Response?.data?.message || "Could not load the export archive.";
        setReportData((prevState) => ({
          ...prevState,
          data: [],
          isLoading: false,
          error: message,
        }));
        enqueueSnackbar(message, { variant: "error" });
      })
      .catch((err: any) => {
        const message = err?.message || "Server error";
        setReportData((prevState) => ({
          ...prevState,
          data: [],
          isLoading: false,
          error: message,
        }));
        enqueueSnackbar(message, { variant: "error" });
      });
  };

  const canExport = EXPORTABLE.includes(currentTab.value);
  const needsUser =
    watch("role") !== "admin" || USER_SCOPED_ONLY.includes(currentTab.value);
  const hasUser = Boolean(watch("userDetail")?._id);

  const submitReport = async (data: FormValuesProps) => {
    try {
      // Without a user_id the backend runs the report for the whole platform,
      // so a user role with no user picked must not reach the API.
      if (needsUser && !data.userDetail?._id) {
        throw new Error("Select a user for this export.");
      }
      let token = localStorage.getItem("token");
      let body = {
        from_date: fDateFormatForApi(data.fromDate),
        to_date: fDateFormatForApi(data.toDate),
        type_of_report: currentTab.value,
        user_id: data.role === "admin" ? undefined : data.userDetail?._id,
        role: data.role,
        email: "finance@shampay.pro",
      };
      await fetchLocation();
      await Api(
        `adminTransaction/download_transaction_report`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar("Export requested. It will appear once generated.");
            setTimeout(() => {
              handleClose();
              reset(defaultValues);
              getReport();
            }, 1000);
          } else {
            throw new Error(Response.data.message);
          }
        } else {
          throw new Error("Server Error");
        }
      });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  /* ================= DERIVED (current page only) ================= */

  const statusScoped = React.useMemo(
    () =>
      statusFilter
        ? reportData.data.filter((row) => STATE_OF(row?.status) === statusFilter)
        : reportData.data,
    [reportData.data, statusFilter]
  );

  const table = useDataTable<any>(statusScoped, {
    rowsPerPage: reportData.pageSize,
    searchKeys: ["status", "IP_address"],
  });

  const pageStates = React.useMemo(() => {
    const counts = { completed: 0, processing: 0, pending: 0, failed: 0 };
    reportData.data.forEach((row) => {
      counts[STATE_OF(row?.status) as keyof typeof counts] += 1;
    });
    return counts;
  }, [reportData.data]);

  const setPage = (page: number) =>
    setReportData((prevState) => ({ ...prevState, currentPage: page + 1 }));

  const setPageSize = (size: number) =>
    setReportData((prevState) => ({
      ...prevState,
      pageSize: size,
      currentPage: 1,
    }));

  /* ================= RENDER ================= */

  return (
    <React.Fragment>
      <Helmet>
        <title> Export Archive | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Export Archive"
          subtitle="Reports generated earlier, with the request that produced each one and its download."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => getReport()}
              >
                Refresh
              </PageGhostButton>
              <PageActionButton
                startIcon={<AddchartOutlinedIcon />}
                onClick={handleOpen}
                disabled={!canExport}
              >
                New Export
              </PageActionButton>
            </>
          }
        />

        <StatGrid>
          <StatCard
            label="Total Exports"
            value={reportData.pageCount}
            caption={currentTab.label}
            icon={<Inventory2OutlinedIcon />}
          />
          <StatCard
            label="Completed"
            value={pageStates.completed}
            caption="On this page"
            tone="success"
            icon={<TaskAltOutlinedIcon />}
          />
          <StatCard
            label="Processing"
            value={pageStates.processing + pageStates.pending}
            caption="Pending or in process, this page"
            tone="warning"
            icon={<HourglassTopOutlinedIcon />}
          />
          <StatCard
            label="Failed"
            value={pageStates.failed}
            caption="On this page"
            tone={pageStates.failed > 0 ? "error" : "neutral"}
            icon={<ErrorOutlineOutlinedIcon />}
          />
        </StatGrid>

        <KitTabs
          value={currentTab.label}
          onChange={(_, label) => {
            const tab = TabsData.find((item) => item.label === label);
            if (!tab) return;
            setReportData((prevState) => ({ ...prevState, currentPage: 1 }));
            setCurrentTab(tab);
          }}
        >
          {TabsData.map((tab) => (
            <Tab key={tab.label} value={tab.label} label={tab.label} />
          ))}
        </KitTabs>

        <FilterBar>
          <SearchField
            value={table.query}
            onChange={table.setQuery}
            placeholder="Search this page by status or IP"
            count={table.total}
            total={table.grandTotal}
          />

          <FilterSlot icon={<MonitorHeartOutlinedIcon />} minWidth={200}>
            <TextField
              select
              fullWidth
              variant="standard"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              InputProps={{ disableUnderline: true }}
              SelectProps={{ displayEmpty: true }}
            >
              {STATUS_FILTERS.map((option) => (
                <MenuItem key={option.value || "all"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FilterSlot>
        </FilterBar>

        {reportData.isLoading ? (
          <LoadingState label="Loading exports..." height={300} />
        ) : reportData.error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load the archive"
            description={reportData.error}
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => getReport()}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : reportData.data.length === 0 ? (
          <EmptyState
            icon={<Inventory2OutlinedIcon />}
            title="No exports yet"
            description={
              canExport
                ? `Nothing has been generated for ${currentTab.label}. Request one and it will show up here.`
                : `${currentTab.label} exports are not available yet.`
            }
            action={
              <PageActionButton
                startIcon={<AddchartOutlinedIcon />}
                onClick={handleOpen}
                disabled={!canExport}
              >
                New Export
              </PageActionButton>
            }
          />
        ) : (
          <DataTable
            minWidth={1000}
            columns={tableLabels}
            isEmpty={table.isEmpty}
            emptyMessage="No exports on this page match the search or status filter."
            footer={
              <TablePagination
                component="div"
                count={reportData.pageCount}
                page={reportData.currentPage - 1}
                rowsPerPage={reportData.pageSize}
                onPageChange={(_, page) => setPage(page)}
                onRowsPerPageChange={(event) =>
                  setPageSize(parseInt(event.target.value))
                }
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            }
          >
            {table.results.map((row: any) => (
              <HistoricalDataTable row={row} key={row?._id} />
            ))}
          </DataTable>
        )}

        {/* ── New export request ─────────────────────────────────────── */}
        {open && (
          <Modal open={open} aria-labelledby="modal-modal-title">
            <ModalShell
              title="New Export"
              subtitle={`${currentTab.label} • generated in the background; it appears in this archive when ready`}
              onClose={() => {
                handleClose();
                reset(defaultValues);
              }}
              width={720}
            >
              <FormProvider
                methods={methods}
                onSubmit={handleSubmit(submitReport)}
              >
                <FormGrid columns={2}>
                  <RHFTextField
                    name="type_of_report"
                    label="Type of Report"
                    value={currentTab.label}
                    disabled
                  />

                  <RHFTextField
                    name="email"
                    label="Email"
                    value={"finance@shampay.pro"}
                    disabled
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      inputFormat="DD/MM/YYYY"
                      value={watch("fromDate")}
                      maxDate={new Date()}
                      onChange={(newValue: any) =>
                        setValue("fromDate", newValue)
                      }
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          size={"small"}
                          sx={{ width: "100%" }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End date"
                      inputFormat="DD/MM/YYYY"
                      value={watch("toDate")}
                      minDate={dayjs(watch("fromDate")) || new Date()}
                      maxDate={
                        dayjs(watch("fromDate")).add(14, "day") || new Date()
                      }
                      onChange={(newValue: any) => setValue("toDate", newValue)}
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          size={"small"}
                          helperText="Maximum 14 days per export"
                          sx={{ width: "100%" }}
                        />
                      )}
                    />
                  </LocalizationProvider>

                  <RHFSelect
                    name="role"
                    label="User Role"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    <MenuItem value="API_User">API User</MenuItem>
                    {currentTab.label !== "GST & TDS Report" &&
                      !USER_SCOPED_ONLY.includes(currentTab.value) && (
                        <MenuItem value="admin">
                          {currentTab.value == "memberExport" ? "All" : "Admin (all users)"}
                        </MenuItem>
                      )}
                  </RHFSelect>

                  {watch("role") !== "admin" && (
                    <>
                      {currentTab.value !== "memberExport" &&
                        (watch("role") !== "agent" ||
                          "distributor" ||
                          "m_distributor" ||
                          "API_User") && (
                          <>
                            {watch("role") !== "" && (
                              <RHFSelect
                                fullWidth
                                name="searchby"
                                label="Search By"
                                size="small"
                                placeholder="From Search By"
                                SelectProps={{
                                  native: false,
                                  sx: { textTransform: "capitalize" },
                                }}
                              >
                                {watch("role") !== "API_User" && (
                                  <MenuItem value={"userCode"}>
                                    User Code
                                  </MenuItem>
                                )}
                                <MenuItem value={"firstName"}>
                                  First Name
                                </MenuItem>
                                <MenuItem value={"contact_no"}>
                                  Contact Number
                                </MenuItem>

                                <MenuItem value={"email"}>Email</MenuItem>
                                <MenuItem value={"company_name"}>
                                  Company Name
                                </MenuItem>
                              </RHFSelect>
                            )}
                            <CustomUserAutocomplete
                              payload={{
                                searchBy: watch("searchby"),
                                role: watch("role") || "",
                                finalStatus: "approved",
                              }}
                              onSelect={(value: any) => {
                                setValue("userDetail", value);
                              }}
                            />
                          </>
                        )}
                    </>
                  )}
                </FormGrid>

                <Stack
                  direction="row"
                  spacing={1.5}
                  justifyContent="flex-end"
                  sx={{
                    mt: 3,
                    pt: 2.5,
                    borderTop: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  {!isSubmitting && (
                    <LoadingButton
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        handleClose();
                        reset(defaultValues);
                      }}
                    >
                      Cancel
                    </LoadingButton>
                  )}
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    disabled={!isValid || (needsUser && !hasUser)}
                    loading={isSubmitting}
                  >
                    Request Export
                  </LoadingButton>
                </Stack>
              </FormProvider>
            </ModalShell>
          </Modal>
        )}
      </Box>
    </React.Fragment>
  );
}
