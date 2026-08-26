import { useEffect, useState } from "react";
// @mui
import {
  Stack,
  Grid,
  IconButton,
  Paper,
  Button,
  Modal,
  MenuItem,
  Box,
  Table,
  TableRow,
  TableBody,
  TableHead,
  Tooltip,
  Chip,
  Card,
  TableCell,
  Typography,
  TableContainer,
  Avatar,
  TextField,
  Link,
  tableCellClasses,
  styled,
  useTheme,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import Iconify from "src/components/iconify";
import React from "react";
import Label from "src/components/label";

import Scrollbar from "src/components/scrollbar/Scrollbar";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { FileFilterButton } from "./file";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { fIndianCurrency } from "src/utils/formatNumber";
import { sentenceCase } from "change-case";
import { TableHeadCustom } from "src/components/table";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { PATH_DASHBOARD } from "src/routes/paths";
import {
  ReportHeader,
  ReportFilterBar,
  FilterSlot,
  ReportActionButton,
  ReportHeadCell,
  ReportRow,
} from "./components/ReportUI";
import { LoadingButton } from "@mui/lab";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
import dayjs from "dayjs";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CustomAvatar } from "src/components/custom-avatar";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type FormValuesProps = {
  searchBy: string;
  usersearchby: string;
  User: string;
  agentId: string;
  distributorId: string;
  masterDistributorId: string;
  partnerId: string;
  date: string;
  clientRefId: string;
  walletId: string;
  walletType: string;
  startDate: Date | null;
  endDate: Date | null;
  formattedEndDate: Date | null;
  formattedStartDate: Date | null;
};

export default function AllTransactionRecords() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [ladgerData, setLadgerData] = useState<any>([]);
  const [userList, setUserList] = useState([]);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [verifyLoding, setVerifyLoading] = useState(false);
  const [WalletCount, setWalletCount] = useState(0);

  /* Action first - the operator opens the entry before reading the rest. */
  const tableLabels = [
    { id: "action", label: "Action" },
    { id: "date", label: "Date & Time" },
    { id: "reference", label: "Reference" },
    { id: "from", label: "From" },
    { id: "to", label: "To" },
    { id: "wallet", label: "Wallet" },
    { id: "amount", label: "Amount" },
    { id: "frombalance", label: "From Balance" },
    { id: "tobalance", label: "To Balance" },
    { id: "reason", label: "Reason" },
  ];

  // Form Controller
  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    searchBy: "",
    usersearchby: "",
    User: "",
    agentId: "",
    distributorId: "",
    masterDistributorId: "",
    partnerId: "",
    date: "",
    clientRefId: "",
    walletId: "",
    walletType: "",
    startDate: null,
    endDate: null,
    formattedEndDate: null,
    formattedStartDate: null,
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    // defaultValues,
    defaultValues : {
      searchBy: "partnerId"
    }
  });
  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    getTransactional();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (getValues("User")?.length > 2) searchFromUser(getValues("User"));
  }, [watch("User")]);

  const getTransactional = () => {
    setVerifyLoading(true);
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      userId:
        getValues("agentId") ||
        getValues("distributorId") ||
        getValues("masterDistributorId") ||
        getValues("partnerId") ||
        "",
      clientRefId: getValues("clientRefId") || "",
      walletType: getValues("walletType") || "",
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };
    let token = localStorage.getItem("token");
    Api(`admin/wallet_ledger`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        setLadgerData(Response?.data?.data?.data);
        setWalletCount(Response?.data?.data?.totalNumberOfRecords);
        // enqueueSnackbar(Response?.data?.message);
        setVerifyLoading(false);
      } else {
        setVerifyLoading(false);
        enqueueSnackbar(Response?.data?.message);
      }
    });
  };

  const searchFromUser = (val: string) => {
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
    val.length > 2 &&
      Api(`admin/search_user`, "POST", body, "").then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          }
        }
      });
  };

  const formattedStartDate =
    startDate && dayjs(startDate).isValid()
      ? dayjs(startDate)
          .subtract(5, "hour")
          .subtract(30, "minute")
          .format("YYYY/MM/DD HH:mm")
      : "";
  const formattedEndDate =
    endDate && dayjs(endDate).isValid()
      ? dayjs(endDate)
          .subtract(5, "hour")
          .subtract(30, "minute")
          .format("YYYY/MM/DD HH:mm")
      : "";

  const exportRows = () => {
    if (!ladgerData?.length) {
      enqueueSnackbar("Nothing to export on this page", { variant: "warning" });
      return;
    }

    const rows = ladgerData.map((row: any) => ({
      "Date & Time": fDateTime(row?.createdAt || row?.transaction?.createdAt),
      Reference: row?.transaction?.clientRefId || "",
      "Wallet ID": row?.walletId || "",
      From: `${row?.from?.id?.firstName || "ADMIN"} ${
        row?.from?.id?.lastName || ""
      }`.trim(),
      "From Wallet": row?.from?.walletType || "",
      To: `${row?.to?.id?.firstName || "ADMIN"} ${
        row?.to?.id?.lastName || ""
      }`.trim(),
      "To Wallet": row?.to?.walletType || "",
      Amount: Number(row?.to?.amount ?? row?.from?.amount) || 0,
      Reason: row?.reason || "",
      Remarks: row?.remarks || "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Account Ledger");
    XLSX.writeFile(book, `wallet-ledger-page-${currentPage}.xlsx`);
  };

  const searchTxnFilterData = (data: FormValuesProps) => {
    setVerifyLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      userId:
        data.agentId ||
        data.distributorId ||
        data.masterDistributorId ||
        data.partnerId,
      clientRefId: data.clientRefId,
      walletId: data.walletId,
      walletType: data.walletType,
      startDate: formattedStartDate || "",
      endDate: formattedEndDate || "",
    };
    Api(`admin/wallet_ledger`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          if (Response?.data?.data) {
            setLadgerData(Response?.data?.data?.data);
            setWalletCount(Response?.data?.data?.totalNumberOfRecords);
          }
          setVerifyLoading(false);
        } else {
          enqueueSnackbar(Response.data.message);
        }
        setVerifyLoading(false);
      } else {
        setVerifyLoading(false);
        enqueueSnackbar("Failed");
      }
    });
  };

  return (
    <>
      <Helmet>
        <title> Account Ledger | Shampay Admin </title>
      </Helmet>

      <ReportHeader
        title="Account Ledger"
        subtitle="Detailed history of all wallet movements."
        actions={
          <>
            <ReportActionButton
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={exportRows}
            >
              Export
            </ReportActionButton>
            <ReportActionButton
              tone="alt"
              startIcon={<Inventory2OutlinedIcon />}
              onClick={() => navigate(PATH_DASHBOARD.reports.HistoricalDataExport)}
            >
              Export Archive
            </ReportActionButton>
          </>
        }
      />

      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(searchTxnFilterData)}
      >
        <ReportFilterBar>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={360}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DateTimePicker
                  value={watch("startDate")}
                  inputFormat="DD/MM/YYYY HH:mm"
                  maxDate={new Date()}
                  onChange={(newValue: Date | null) => setValue("startDate", newValue)}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="From"
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      sx={{ width: 150 }}
                    />
                  )}
                />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled" }}>
                  TO
                </Typography>
                <DateTimePicker
                  value={watch("endDate")}
                  inputFormat="DD/MM/YYYY HH:mm"
                  minDate={watch("startDate") || undefined}
                  maxDate={new Date()}
                  onChange={(newValue: Date | null) => setValue("endDate", newValue)}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="To"
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      sx={{ width: 150 }}
                    />
                  )}
                />
              </Stack>
            </FilterSlot>
          </LocalizationProvider>

          <FilterSlot icon={<AccountBalanceWalletOutlinedIcon />}>
            <TextField
              select
              fullWidth
              variant="standard"
              value={watch("walletType") || ""}
              onChange={(event) => setValue("walletType", event.target.value)}
              InputProps={{ disableUnderline: true }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">All Wallets</MenuItem>
              <MenuItem value="MAIN">Main</MenuItem>
              <MenuItem value="AEPS">AEPS</MenuItem>
            </TextField>
          </FilterSlot>

          <FilterSlot icon={<PersonSearchOutlinedIcon />} minWidth={220}>
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search user"
                value={watch("User") || ""}
                onChange={(event) => setValue("User", event.target.value)}
                InputProps={{ disableUnderline: true }}
              />
              {userList.length > 0 && (
                <Stack
                  sx={{
                    position: "absolute",
                    top: 34,
                    left: -12,
                    zIndex: 200,
                    width: 260,
                    bgcolor: "background.paper",
                    border: (t) => `1px solid ${t.palette.divider}`,
                    borderRadius: 1.5,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                  }}
                >
                  <Scrollbar sx={{ maxHeight: 320 }}>
                    {userList.map((item: any) => (
                      <Typography
                        key={item._id}
                        sx={{
                          p: 1,
                          fontSize: 13,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => {
                          item.role == "agent"
                            ? setValue("agentId", item._id)
                            : item.role == "distributor"
                            ? setValue("distributorId", item._id)
                            : item.role == "m_distributor"
                            ? setValue("masterDistributorId", item._id)
                            : setValue("partnerId", item._id);
                          setUserList([]);
                          setValue("User", `${item.firstName} ${item.lastName}`);
                        }}
                      >
                        {item.userCode
                          ? `${item.firstName} ${item.lastName} (${item.userCode})`
                          : `${item.firstName} ${item.lastName}`}
                      </Typography>
                    ))}
                  </Scrollbar>
                </Stack>
              )}
            </Box>
          </FilterSlot>

          <FilterSlot icon={<SearchIcon />} grow minWidth={220}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search Txn ID or Wallet ID"
              value={watch("clientRefId") || ""}
              onChange={(event) => setValue("clientRefId", event.target.value)}
              InputProps={{ disableUnderline: true }}
            />
          </FilterSlot>

          <LoadingButton
            variant="contained"
            type="submit"
            loading={isSubmitting}
            sx={{ height: 48, px: 4, borderRadius: 1.5, fontWeight: 700 }}
          >
            Search
          </LoadingButton>

          <Tooltip title="Reset filters">
            <IconButton
              onClick={() => {
                reset(defaultValues);
                getTransactional();
              }}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ReportFilterBar>
      </FormProvider>

      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        {verifyLoding ? (
          <ApiDataLoading variant="table" columns={tableLabels} />
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) =>
                t.palette.mode === "light" ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
            }}
          >
            <Scrollbar sx={{ overflow: "auto", maxHeight: 620 }}>
              <Table stickyHeader size="small" sx={{ minWidth: 1180 }}>
                <TableHead>
                  <TableRow>
                    {tableLabels.map((column: any) => (
                      <ReportHeadCell key={column.id}>{column.label}</ReportHeadCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ladgerData?.length
                    ? ladgerData.map((row: any) => (
                        <WalletRow key={row._id} row={row} />
                      ))
                    : null}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        <CustomPagination
          page={currentPage - 1}
          count={WalletCount}
          onPageChange={(
            event: React.MouseEvent<HTMLButtonElement> | null,
            newPage: number
          ) => setCurrentPage(newPage + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            setPageSize(parseInt(event.target.value));
            setCurrentPage(1);
          }}
        />
      </Grid>

      {/* <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        {verifyLoding ? (
          <ApiDataLoading variant="table" columns={tableLabels} />
        ) : (
          <TableContainer component={Paper}>
            <Scrollbar sx={{ height: "fit-content" }}>
              <Table
                stickyHeader
                aria-label="sticky table"
                sx={{ minWidth: 720 }}
                size="small"
              >
                <TableHeadCustom headLabel={tableLabels} />
                <TableBody>
                  {ladgerData?.length &&
                    ladgerData.map((row: any) => (
                      <WalletRow key={row._id} row={row} />
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        <CustomPagination
          page={currentPage - 1}
          count={WalletCount}
          onPageChange={(
            event: React.MouseEvent<HTMLButtonElement> | null,
            newPage: number
          ) => setCurrentPage(newPage + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            setPageSize(parseInt(event.target.value));
            setCurrentPage(1);
          }}
        />
      </Grid> */}
      {/* </Container> */}
    </>
  );
}

const WalletRow = React.memo(({ row }: any) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setModal] = React.useState(false);
  const handleOpen = () => setModal(true);
  const handleClose = () => setModal(false);

  const { copy } = useCopyToClipboard();
  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const tableLabels = [
    { id: "Product/TransactionType", label: "Product/TransactionType " },
    { id: "Agent Details", label: "Agent Details" },
    { id: "Distributor Details", label: "Distributor Details " },
    { id: "Master Distributor Details", label: "Master Distributor Details " },
    { id: "BeneficiaryDetails", label: "BeneficiaryDetails" },
    { id: "credit", label: "Credit/Debit " },
    { id: "GST/TDS", label: "GST/TDS " },
    { id: "mobileNumber", label: "MobileNumber " },
    { id: "status", label: "Status " },
  ];

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "100%", sm: "90%" },
    bgcolor: "background.paper",
    border: "2px ",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[200],
    },
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  return (
    <>
    
    <ReportRow>
      {/* ---- ACTION ---- */}
      <TableCell>
        <Tooltip title="View transaction details">
          <IconButton
            size="small"
            onClick={handleOpen}
            sx={{
              border: (t) => `1px solid ${t.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Iconify icon="solar:document-text-outline" width={17} />
          </IconButton>
        </Tooltip>
      </TableCell>

      {/* ---- DATE & TIME ---- */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: 13.5 }}>
          {fDateTime(row?.createdAt || row?.transaction?.createdAt)}
        </Typography>
      </TableCell>

      {/* ---- REFERENCE ---- */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {row?.transaction?.clientRefId ? (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Link
              component="button"
              onClick={handleOpen}
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              {row?.transaction?.clientRefId}
            </Link>
            <IconButton
              sx={{ p: 0.25 }}
              onClick={() => onCopy(row?.transaction?.clientRefId)}
            >
              <Iconify icon="eva:copy-fill" width={15} />
            </IconButton>
          </Stack>
        ) : (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            No Ref ID
          </Typography>
        )}
        {row?.walletId && (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            Wallet {row?.walletId}
          </Typography>
        )}
      </TableCell>

      {/* ---- FROM ---- */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CustomAvatar
            name={row?.from?.id?.firstName || row?.from?.id?.email}
            alt={row?.from?.id?.firstName}
            src={row?.from?.id?.selfie?.[0]}
            sx={{ width: 30, height: 30, fontSize: 12 }}
          />
          <Stack sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
              {row?.from?.id?.firstName || "ADMIN"} {row?.from?.id?.lastName}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {row?.from?.id?.role ? sentenceCase(row?.from?.id?.role) : "Admin"}
              {row?.from?.id?.userCode && ` (${row?.from?.id?.userCode})`}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* ---- TO ---- */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CustomAvatar
            name={row?.to?.id?.firstName || row?.to?.id?.email}
            alt={row?.to?.id?.firstName}
            src={row?.to?.id?.selfie?.[0]}
            sx={{ width: 30, height: 30, fontSize: 12 }}
          />
          <Stack sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
              {row?.to?.id?.firstName || "ADMIN"} {row?.to?.id?.lastName}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {row?.to?.id?.role === "agent"
                ? "Agent"
                : row?.to?.id?.role === "distributor"
                ? "Distributor"
                : row?.to?.id?.role === "m_distributor"
                ? "Master Distributor"
                : row?.to?.id?.role === "API_User"
                ? "API User"
                : "Admin"}
              {row?.to?.id?.userCode && ` (${row?.to?.id?.userCode})`}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* ---- WALLET ---- */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Chip
          label={row?.to?.walletType || row?.from?.walletType || "-"}
          size="small"
          sx={{
            height: 22,
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 0.75,
          }}
        />
      </TableCell>

      {/* ---- AMOUNT ---- */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          {fIndianCurrency(row?.to?.amount ?? row?.from?.amount) || "0"}
        </Typography>
      </TableCell>

      {/* ---- FROM BALANCE ---- */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: 12.5, color: "error.main", fontWeight: 600 }}>
          -{fIndianCurrency(row?.from?.amount) || "0"}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
          {fIndianCurrency(
            row?.to?.walletType === "MAIN"
              ? row?.from?.oldMainWalletBalance
              : row?.from?.oldAepsWalletBalance
          ) || "0"}
          {" / "}
          {fIndianCurrency(
            row?.to?.walletType === "MAIN"
              ? row?.from?.newMainWalletBalance
              : row?.from?.newAepsWalletBalance
          ) || "0"}
        </Typography>
      </TableCell>

      {/* ---- TO BALANCE ---- */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: 12.5, color: "success.main", fontWeight: 600 }}>
          +{fIndianCurrency(row?.to?.amount) || "0"}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
          {fIndianCurrency(
            row?.to?.walletType === "MAIN"
              ? row?.to?.oldMainWalletBalance
              : row?.to?.oldAepsWalletBalance
          ) || "0"}
          {" / "}
          {fIndianCurrency(
            row?.to?.walletType === "MAIN"
              ? row?.to?.newMainWalletBalance
              : row?.to?.newAepsWalletBalance
          ) || "0"}
        </Typography>
      </TableCell>

      {/* ---- REASON ---- */}
      <TableCell sx={{ maxWidth: 240 }}>
        <Typography sx={{ fontSize: 13 }}>{row?.reason || "-"}</Typography>
        {row?.remarks && (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            {row?.remarks}
          </Typography>
        )}
      </TableCell>
    </ReportRow>

      {/* Modal unchanged */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Scrollbar sx={{ minWidth: 720 }}>
            <Table size="small">
              <TableHeadCustom headLabel={tableLabels} />
              <TableBody>
                <TableRow key={row?._id}>
        <StyledTableCell>
          {row?.transaction?.clientRefId && (
            <Stack flexDirection={"row"}>
              <Link
                variant="body2"
                noWrap
                component="button"
                onClick={handleOpen}
              >
                {row?.transaction?.clientRefId}
              </Link>
              <IconButton
                sx={{ p: 0.5 }}
                onClick={() => onCopy(row?.transaction?.clientRefId)}
              >
                <Iconify icon="eva:copy-fill" />
              </IconButton>
            </Stack>
          )}

          <Typography variant="body2">
            Wallet Id : {row?.walletId}
            <IconButton sx={{ p: 0.5 }} onClick={() => onCopy(row?.walletId)}>
              <Iconify icon="eva:copy-fill" />
            </IconButton>
          </Typography>

          <Typography variant="body2" color={"text.secondary"}>
            {row?.createdAt
              ? fDateTime(row?.createdAt)
              : fDateTime(row?.transaction?.createdAt)}
          </Typography>
        </StyledTableCell>

        {/* From detail */}
        <StyledTableCell>
          <Stack flexDirection={"row"} gap={1}>
            <CustomAvatar
              name={
                row?.from?.id?.firstName
                  ? row?.from?.id?.firstName
                  : row?.from?.id?.email
              }
              alt={row?.from?.id?.firstName}
              src={row?.from?.id?.selfie && row?.from?.id?.selfie[0]}
            />
            <Stack>
              <Typography noWrap variant="body2">
                {row?.from?.id?.firstName || "ADMIN"} {row?.from?.id?.lastName}
              </Typography>
              <Typography noWrap variant="body2" color={"text.secondary"}>
                {sentenceCase(row?.from?.id?.role)}
                {row?.from?.id?.userCode && `(${row?.from?.id?.userCode})`}
              </Typography>
              <Label
                variant="soft"
                color={row?.from?.walletType == "MAIN" ? "primary" : "warning"}
                width={"fit-content"}
              >
                Wallet : {row?.from?.walletType}
              </Label>
            </Stack>
          </Stack>
        </StyledTableCell>

        {/* From Opening Closing */}
        <StyledTableCell>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="body2">Opening:</Typography>
            <Typography variant="body2">
              {fIndianCurrency(
                row?.to?.walletType == "MAIN"
                  ? row?.from?.oldMainWalletBalance
                  : row?.from?.oldAepsWalletBalance
              ) || ""}
            </Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="body2">Amount :</Typography>
            <Typography variant="body2" color={"error"}>
              -{fIndianCurrency(row?.from?.amount) || "0"}
            </Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="body2">Closing :</Typography>
            <Typography variant="body2">
              {fIndianCurrency(
                row?.to?.walletType == "MAIN"
                  ? row?.from?.newMainWalletBalance
                  : row?.from?.newAepsWalletBalance
              ) || "0"}
            </Typography>
          </Stack>
        </StyledTableCell>

        {/* to user */}
        <StyledTableCell>
          <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
            <CustomAvatar
              name={
                row?.to?.id?.firstName
                  ? row?.to?.id?.firstName
                  : row?.to?.id?.email
              }
              alt={row?.to?.id?.firstName}
              src={row?.to?.id?.selfie && row?.to?.id?.selfie[0]}
            />
            <Stack>
              <Typography noWrap variant="body2">
                {row?.to?.id?.firstName} {row?.to?.id?.lastName}
              </Typography>
              <Typography noWrap variant="body2">
                {row?.to?.id?.role === "agent"
                  ? "Agent"
                  : row?.to?.id?.role === "distributor"
                  ? "Distributor"
                  : row?.to?.id?.role === "m_distributor"
                  ? "Master Distributor"
                  : row?.to?.id?.role === "API_User"
                  ? "API User"
                  : "ADMIN"}
              </Typography>
              <Typography noWrap variant="body2">
                {row?.to?.id?.userCode}
              </Typography>
              <Label
                variant="soft"
                color={row?.to?.walletType == "MAIN" ? "primary" : "warning"}
                width={"fit-content"}
              >
                Wallet : {row?.to?.walletType}
              </Label>
            </Stack>
          </Stack>
        </StyledTableCell>

        {/* to opening closing */}
        <StyledTableCell>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="body2">Opening:</Typography>
            <Typography variant="body2">
              {fIndianCurrency(
                row?.to?.walletType == "MAIN"
                  ? row?.to?.oldMainWalletBalance
                  : row?.to?.oldAepsWalletBalance
              ) || "0"}
            </Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="body2">Amount :</Typography>
            <Typography variant="body2" color={"success.main"}>
              +{fIndianCurrency(row?.to?.amount) || "0"}
            </Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="body2">Closing :</Typography>
            <Typography variant="body2">
              {fIndianCurrency(
                row?.to?.walletType == "MAIN"
                  ? row?.to?.newMainWalletBalance
                  : row?.to?.newAepsWalletBalance
              ) || "0"}
            </Typography>
          </Stack>
        </StyledTableCell>

        <StyledTableCell>
          <Typography>Reason: {row?.reason || "-"}</Typography>
          <Typography>Remarks: {row?.remarks || "-"}</Typography>
        </StyledTableCell>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Scrollbar sx={{ minWidth: 720 }}>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  <TableRow key={row._id}>
                    <TableCell>
                      <Typography noWrap variant="body2">
                        <strong> Product:</strong>
                        {row?.transaction?.productName || "-"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Transaction Type: </strong>
                        {row?.transaction?.transactionType || "0"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap variant="body2">
                        <strong> Opening: </strong>
                        {fIndianCurrency(
                          row?.transaction?.agentDetails?.oldMainWalletBalance
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Closing: </strong>
                        {fIndianCurrency(
                          row?.transaction?.agentDetails?.newMainWalletBalance
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Commission: </strong>
                        {fIndianCurrency(
                          row?.transaction?.agentDetails?.commissionAmount
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Credit: </strong>
                        {fIndianCurrency(
                          row?.transaction?.agentDetails?.creditedAmount
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> TDS: </strong>
                        {fIndianCurrency(
                          row?.transaction?.agentDetails?.TDSAmount
                        ) || "0"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap variant="body2">
                        <strong> Opening: </strong>
                        {fIndianCurrency(
                          row?.transaction?.distributorDetails
                            ?.oldMainWalletBalance
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Closing: </strong>
                        {fIndianCurrency(
                          row?.transaction?.distributorDetails
                            ?.newMainWalletBalance
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Commission: </strong>
                        {fIndianCurrency(
                          row?.transaction?.distributorDetails?.commissionAmount
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Credit: </strong>
                        {fIndianCurrency(
                          row?.transaction?.distributorDetails?.creditedAmount
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> TDS: </strong>
                        {fIndianCurrency(
                          row?.transaction?.distributorDetails?.TDSAmount
                        ) || "0"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap variant="body2">
                        <strong> Opening: </strong>
                        {fIndianCurrency(
                          row?.transaction?.masterDistributorDetails
                            ?.oldMainWalletBalance
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Closing: </strong>
                        {fIndianCurrency(
                          row?.transaction?.masterDistributorDetails
                            ?.newMainWalletBalance
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Commission: </strong>
                        {fIndianCurrency(
                          row?.transaction?.masterDistributorDetails
                            ?.commissionAmount
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Credit: </strong>
                        {fIndianCurrency(
                          row?.transaction?.masterDistributorDetails
                            ?.creditedAmount
                        ) || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> TDS: </strong>
                        {fIndianCurrency(
                          row?.transaction?.masterDistributorDetails?.TDSAmount
                        ) || "0"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography noWrap variant="body2">
                        <strong> Bank: </strong>
                        {row?.transaction?.moneyTransferBeneficiaryDetails
                          ?.bankName || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Account Number: </strong>
                        {row?.transaction?.moneyTransferBeneficiaryDetails
                          ?.accountNumber || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> Beneficiary Name: </strong>
                        {row?.transaction?.moneyTransferBeneficiaryDetails
                          ?.beneName || "0"}
                      </Typography>
                      <Typography noWrap variant="body2">
                        <strong> IFSC: </strong>
                        {row?.transaction?.moneyTransferBeneficiaryDetails
                          ?.ifsc || "0"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        <strong> Credit: </strong> {row?.transaction?.credit}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        <strong> Debit: </strong> {row?.transaction?.debit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2"> GST: </Typography>
                        <Typography variant="body2">
                          {fIndianCurrency(row?.transaction?.GST || "0")}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2"> TDS: </Typography>
                        <Typography variant="body2">
                          {fIndianCurrency(row?.transaction?.TDS || "0")}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography>{row?.transaction?.mobileNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={
                          (row?.transaction?.status === "failed" && "error") ||
                          ((row?.transaction?.status === "pending" ||
                            row?.transaction?.status === "in_process") &&
                            "warning") ||
                          "success"
                        }
                        sx={{ textTransform: "capitalize" }}
                      >
                        {row?.transaction?.status
                          ? sentenceCase(row?.transaction?.status)
                          : ""}
                      </Label>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scrollbar>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                mt: 5,
                ml: 1,
              }}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </TableRow>
              </TableBody>
            </Table>
          </Scrollbar>
          <Button variant="contained" onClick={handleClose} sx={{ mt: 5, ml: 1 }}>
            Close
          </Button>
        </Box>
      </Modal>

 
   
      
    </>
  );
});
