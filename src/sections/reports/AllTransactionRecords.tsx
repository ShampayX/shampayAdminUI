import { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { subDays } from "date-fns";
import {
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  Stack,
  Grid,
  TableHead,
  styled,
  Paper,
  Button,
  Modal,
  MenuItem,
  tooltipClasses,
  Tooltip,
  TooltipProps,
  Zoom,
  useTheme,
  Divider,
  Chip,
  TextField,
  IconButton,
  Card,
  tableCellClasses,
  Alert,
} from "@mui/material";
import Iconify from "src/components/iconify/Iconify";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import React from "react";

import Scrollbar from "src/components/scrollbar/Scrollbar";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import {
  TableSkeleton,
  EmptyState,
  LoadingState,
  PageGhostButton,
  ModalShell,
  FormActions,
} from "src/components/page-kit";
import { alpha } from "@mui/material/styles";
import {
  isOk,
  failureMessage,
  notifyFailure,
  truncationNotice,
} from "src/utils/apiResult";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { fIndianCurrency, fPercent } from "src/utils/formatNumber";
import useResponsive from "src/hooks/useResponsive";
import { TableNoData } from "src/components/table";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
//date picker
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CustomAvatar } from "src/components/custom-avatar";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import numWords from "num-words";
import { Height, WidthFull } from "@mui/icons-material";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";
import { status } from "nprogress";
import { isTemplateExpression } from "typescript";
import { position } from "stylis";
import { Instance } from "@popperjs/core";
import { stat } from "fs";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import TuneIcon from "@mui/icons-material/Tune";
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
  StatusPill,
  ModeLabel,
} from "./components/ReportUI";
import {
  TRANSACTION_RANGE_MONTHS,
  transactionMinDate,
  transactionMaxDate,
  transactionEndMinDate,
  transactionEndMaxDate,
  clampToTransactionWindow,
} from "./components/transactionDateRange";
// ----------------------------------------------------------------------

type FormValuesProps = {
  //txn row
  updatedstatus: string;
  vendorutr: string;
  remarks: string;
  vendortxnid: string;
  vendorName: string;
  //filter txn
  searchBy: string;
  clientRefId: string;
  status: string;
  category: {
    categoryName: string;
    categoryId: string;
  };
  transactionId: string;
  transactionType: string;
  User: string;
  agentId: string;
  distributorId: string;
  masterDistributorId: string;
  partnerId: string;
  product: {
    productId: string;
    productName: string;
  };
  vendorUtrNumber: string;
  amount: string;
  usersearchby: string;
  partnerTransactionId: string;
  operator: string;
  key1: string;
  key2: string;
  key3: string;
  startDate: Date | null;
  endDate: Date | null;
  dateFilter: string;
  // downline: object;
};

type DashboardProps = {
  label: string;
  totalPercentage: number;
  count: number;
  amount: number;
  color: string[];
};

type CategoryProps = {
  categoryName: string;
  percentage: number;
  totalCount: number;
  totalAmount: number;
  color: string[];
};

/* Action first - the operator acts on a row before reading the rest of it.
   Module scope so the array identity is stable: it is passed straight to
   <TableSkeleton columns=...> and mapped for the real header, and a fresh
   literal every render would defeat that. */
const tableLabels = [
  { id: "action", label: "Action" },
  { id: "datetime", label: "Date & Time" },
  { id: "user", label: "User" },
  { id: "txnid", label: "Txn ID" },
  { id: "apitxnid", label: "API Txn ID" },
  { id: "amount", label: "Amount" },
  { id: "transaction", label: "Transaction" },
  { id: "charges", label: "Charges" },
  { id: "service", label: "Service" },
  { id: "status", label: "Status" },
  { id: "mode", label: "Mode" },
];

/* Same shape, precomputed for the skeleton so it is not rebuilt per render. */
const SKELETON_COLUMNS = tableLabels.map((column) => ({
  id: column.id,
  label: column.label,
}));

export default function AllTransactionRecords() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { Api } = useAuthContext();
  const isDesktop = useResponsive("up", "sm");
  const { enqueueSnackbar } = useSnackbar();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [sdata, setSdata] = useState([]);
  const [isTxnFound, setIsTxnFound] = useState(false);
  /* Distinguishes "the request failed" from "there are no transactions". */
  const [loadFailed, setLoadFailed] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  /** Non-empty when the backend capped this result set. */
  const [truncation, setTruncation] = useState("");
  const [productList, setProductList] = useState([]);
  const [txnType, setTxnType] = useState([]);
  const [userList, setUserList] = useState([]);
  const [filterdValue, setFilterdValue] = useState<any>([]);
  const [expand, setExpand] = React.useState(false);
  //filter modal
  const [open, setOpen] = React.useState(false);
  /* Guards the one-off lazy load of the advanced-filter lookups. */
  const filterLookupsLoaded = useRef(false);
  const handleOpen = () => {
    if (!filterLookupsLoaded.current) {
      filterLookupsLoaded.current = true;
      getVendorList();
      getTxnType();
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const modalStyle: any = {
    display: "flex",
    flexDirection: "column",
    // responsive width
    width: { xs: "100%", sm: "92%", md: 820 },
    maxWidth: "100%",
    // important: cap height to viewport so it doesn't overflow the screen
    maxHeight: "90vh",
    // allow internal scrolling; outer box itself won't overflow the viewport
    borderRadius: 2,
    p: { xs: 1, sm: 2 },
    boxSizing: "border-box",
    // use a background/paper look if you want
    bgcolor: "background.paper",
    // elevation-like shadow if you prefer:
    // boxShadow: 24,
  };

  // Form Controller
  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    searchBy: "partnerId",
    clientRefId: "",
    status: "",
    category: {
      categoryName: "",
      categoryId: "",
    },
    transactionId: "",
    transactionType: "",
    agentId: "",
    vendorName: "",
    distributorId: "",
    masterDistributorId: "",
    partnerId: "",
    product: {
      productId: "",
      productName: "",
    },
    vendorUtrNumber: "",
    amount: "",
    usersearchby: "",
    partnerTransactionId: "",
    User: "",
    operator: "",
    key1: "",
    key2: "",
    key3: "",
    startDate: null,
    endDate: null,
    dateFilter: "today",
    // downline: []
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
    resetField,
    formState: { errors, isSubmitting },
  } = methods;

  /**
   * Only the category list feeds the always-visible filter row, so only it is
   * fetched on mount.
   *
   * `vendor/get_VendorList` (the whole vendor estate) and
   * `adminTransaction/transactionTypes` are used exclusively inside the
   * advanced-filter modal further down this file, so they now load the first
   * time that modal is opened. That takes two requests - one of them large -
   * off the critical path, where they were competing with the transaction page
   * itself and the dashboard/getTransaction aggregation.
   */
  useEffect(() => {
    getCategoryList();
  }, []);

  //handle transactions
  useEffect(() => {
    getTransaction();
  }, [currentPage, pageSize]);

  useEffect(() => {
    // if (getValues("searchBy") == "agentId") searchFromUser(getValues("User"));
    // if (getValues("searchBy") == "distributorId")
    //   searchFromUser(getValues("User"));
    // if (getValues("searchBy") == "masterDistributorId")
    //   searchFromUser(getValues("User"));
    if (getValues("searchBy") == "partnerId") searchFromUser(getValues("User"));
  }, [watch("User")]);

  const getProductlist = useCallback(
    (val: string) => {
      let token = localStorage.getItem("token");
      Api(`product/get_ProductList/${val}`, "GET", "", token).then(
        (Response: any) => {
          if (isOk(Response)) {
            setProductList(Response.data.data);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    },
    [watch("category.categoryId")]
  );

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setCategoryList(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getVendorList = () => {
    let token = localStorage.getItem("token");
    Api(`vendor/get_VendorList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setVendorList(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getTxnType = () => {
    let token = localStorage.getItem("token");
    Api(`adminTransaction/transactionTypes`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setTxnType(
            Response.data.data.filter((item: string) => item != "Fund Flow")
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

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
    val.length > 2 &&
      Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
        if (isOk(Response)) {
          setUserList(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      });
  };

  //Get All Transaction Once
  const getTransaction = () => {
    setIsTxnFound(true);
    setSdata([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: getValues("clientRefId") || "",
      status: getValues("status") || "",
      vendorName: getValues("vendorName") || "",
      categoryId: getValues("category.categoryId") || "",
      transactionId: getValues("transactionId") || "",
      transactionType: getValues("transactionType") || "",
      agentId: getValues("agentId") || "",
      distributorId: getValues("distributorId") || "",
      masterDistributorId: getValues("masterDistributorId") || "",
      partnerId: getValues("partnerId") || "",
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
      productId: getValues("product.productId") || "",
      vendorUtrNumber: getValues("vendorUtrNumber") || "",
      partnerTransactionId: getValues("partnerTransactionId") || "",
      amount: getValues("amount") || "",
      key1: getValues("key1") || "",
      key2: getValues("key2") || "",
      key3: getValues("key3") || "",
      // downline: getValues("downline") || {},
    };
    Api(`adminTransaction/get_transaction`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setTxnCount(Response.data.data.totalNumberOfRecords);
            setLoadFailed(false);
            // Context: large reports are capped at `rowCeiling` rows and flagged
            // with `truncated: true`. Saying so matters here - a silently capped
            // report reads as a complete one, and this is the screen an operator
            // reconciles from.
            setTruncation(truncationNotice(Response));
          } else {
            /* A rejected request is not "no transactions" - flag it so the
               table shows a retryable error instead of an empty result. */
            setLoadFailed(true);
            enqueueSnackbar(Response.data.message);
          }
          setIsTxnFound(false);
        } else {
          setIsTxnFound(false);
          setLoadFailed(true);
          enqueueSnackbar("Failed to Load");
        }
      }
    );
  };

  const StartDateNew = getValues("startDate");
  const EndDateNew = getValues("endDate");

  const formattedStart = StartDateNew
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(StartDateNew)
    : "";
  const formattedEndDate = EndDateNew
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(EndDateNew)
    : "";

  /* Transaction reports only cover a rolling 3-month window - see
     ./components/transactionDateRange. Recomputed on every render so an
     overnight session cannot keep yesterday's floor. */
  const txnMinDate = transactionMinDate();
  const txnMaxDate = transactionMaxDate();

  /**
   * Every date change goes through here: the value is pinned into the window
   * (typing bypasses the disabled calendar days) and a "to" date that no longer
   * makes sense against the new "from" is dropped rather than silently kept.
   */
  const onChangeStartDate = (newValue: Date | null) => {
    const start = clampToTransactionWindow(newValue);
    setValue("startDate", start);

    const end = getValues("endDate");
    if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
      setValue("endDate", null);
    }
  };

  const onChangeEndDate = (newValue: Date | null) => {
    setValue("endDate", clampToTransactionWindow(newValue));
  };

  //get Transaction by using Filter
  const searchTxnFilterData = async (data: FormValuesProps) => {
    setCurrentPage(1);
    try {
      let token = localStorage.getItem("token");
      let body = {
        pageInitData: {
          pageSize: pageSize,
          currentPage: currentPage,
        },
        partnerTransactionId: data.partnerTransactionId,
        clientRefId: data.clientRefId,
        status: data.status,
        categoryId: data.category.categoryId,
        transactionId: data.transactionId,
        transactionType: data.transactionType,
        vendorName: data.vendorName,
        agentId: data.agentId,
        distributorId: data.distributorId,
        masterDistributorId: data.masterDistributorId,
        partnerId: data.partnerId,
        startDate: fDateFormatForApi(data.startDate),
        endDate: fDateFormatForApi(data.endDate),
        productId: data.product.productId,
        vendorUtrNumber: data.vendorUtrNumber,
        amount: data.amount,
        key1: data.key1,
        key2: data.key2,
        key3: data.key3,
        // downline: data.downline,
      };
      await Api(`adminTransaction/get_transaction`, "POST", body, token).then(
        (Response: any) => {
          if (isOk(Response)) {
            setSdata(Response.data.data.data);

            setTxnCount(Response.data.data.totalNumberOfRecords);
            filterData(data);
            handleClose();
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (err) {}
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // responsive width
    width: { xs: "100%", sm: "90%", md: "50%" },
    // cap max height to viewport instead of forcing 100%
    maxHeight: { xs: "90vh", md: "80vh" },
    bgcolor: "#ffffff",
    borderRadius: 2,
    p: 2,
    display: "flex",
    flexDirection: "column",
  };

  const filterData = (val: any) => {
    let arr: any = [];
    const subFilterData = (obj: any) => {
      for (const subItem in obj) {
        !subItem.endsWith("Id") &&
          arr.push({ key: subItem, value: obj[subItem] });
      }
    };
    for (const elem in val) {
      if (Object.prototype.hasOwnProperty.call(val, elem)) {
        typeof val[elem] === "object" &&
        val[elem] !== null &&
        !Array.isArray(val[elem])
          ? elem.endsWith("Date")
            ? arr.push({ key: elem, value: fDate(val[elem]) })
            : subFilterData(val[elem])
          : !elem.endsWith("searchBy") &&
            !elem.endsWith("usersearchby") &&
            !elem.endsWith("Id") &&
            arr.push({
              key: elem,
              value: elem.endsWith("Date") ? fDate(val[elem]) : val[elem],
            });
      }
    }

    setFilterdValue(arr);
  };

  /* ---------------- exports ---------------- */

  const exportRows = () => {
    if (!sdata.length) {
      enqueueSnackbar("Nothing to export on this page", { variant: "warning" });
      return;
    }

    const rows = sdata.map((row: any) => ({
      "Date & Time": fDateTime(row?.createdAt),
      User: `${row?.partnerDetails?.id?.firstName || ""} ${
        row?.partnerDetails?.id?.lastName || ""
      }`.trim(),
      "User Code": row?.partnerDetails?.id?.userCode || "",
      "Txn ID": row?.clientRefId || "",
      "API Txn ID": row?.partnerTransactionId || "",
      "Vendor Txn ID": row?.transactionId || "",
      Amount: Number(row?.debit) || Number(row?.credit) || 0,
      Transaction: Number(row?.amount) || 0,
      TDS: Number(row?.TDS) || 0,
      GST: Number(row?.GST) || 0,
      Service: row?.categoryName || "",
      "Transaction Type": row?.transactionType || "",
      Status: row?.status || "",
      Mode: Number(row?.debit) > 0 ? "DEBIT" : "CREDIT",
      "Opening Balance": row?.partnerDetails?.oldMainWalletBalance ?? "",
      "Closing Balance": row?.partnerDetails?.newMainWalletBalance ?? "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Transactions");
    XLSX.writeFile(book, `transaction-report-page-${currentPage}.xlsx`);
  };

  const handleDelete = (val: string) => {
    setFilterdValue(
      filterdValue.filter((item: any) => {
        return val != item.key;
      })
    );
    if (val == "clientRefId") resetField("clientRefId");
    if (val == "status") resetField("status");
    if (val == "categoryName") {
      setValue("category.categoryName", "");
      resetField("category.categoryId");
    }
    if (val == "transactionId") resetField("transactionId");
    if (val == "transactionType") resetField("transactionType");
    if (val == "User") {
      setValue("User", "");
      setValue("agentId", "");
      setValue("distributorId", "");
      setValue("masterDistributorId", "");
      setValue("partnerId", "");
      setValue("searchBy", "");
      setValue("usersearchby", "");
    }
    if (val == "startDate") setValue("startDate", null);
    if (val == "endDate") setValue("endDate", null);
    if (val == "productName") {
      resetField("product.productId");
      setValue("product.productName", "");
    }
    if (val == "vendorUtrNumber") resetField("vendorUtrNumber");
    if (val == "amount") resetField("amount");
    if (val == "key1") resetField("key1");
    if (val == "key2") resetField("key2");
    if (val == "key3") resetField("key3");
    getTransaction();
  };

  const handleReset = () => {
    reset(defaultValues);
    setFilterdValue([]);
    getTransaction();
  };
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      padding: 6,
    },
  }));
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
      fontWeight: 600,
      fontSize: 14,
      backgroundColor: theme.palette.grey[400],
      // backgroundColor:'#f6f7f8',

      color: theme.palette.common.black,
      padding: 8,
    },
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [uiData, setUiData] = useState<DashboardProps[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryProps[]>([]);
  const [statusCount, setStatusCount] = useState({
    totalTransaction: {
      count: 0,
      amount: 0,
    },
    remarks: [],
  });

  const positionRef = React.useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const popperRef = React.useRef<Instance>(null);
  const areaRef = React.useRef<HTMLDivElement>(null);

  const customStartDate = subDays(new Date(), 30);
  const customEndDate = new Date();
  const isFirstLoad = useRef(true);

  const ViewTransaaction = () => {
    setIsLoading(true);

    // Build request body
    let body: any;

    if (isFirstLoad.current) {
      body = {
        dateFilter: "customDate",
        startDate: customStartDate,
        endDate: customEndDate,
      };
      // isFirstLoad.current = false;
    }
    // else if (getValues("dateFilter") === "customDate") {
    //   body = {
    //     dateFilter: "customDate",
    //     startDate: getValues("startDate"),
    //     endDate: getValues("endDate"),
    //   };
    // }
    else {
      body = {
        dateFilter: getValues("dateFilter"),
      };
    }

    const token = localStorage.getItem("token");

    Api("dashboard/getTransaction", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          setStatusCount(Response.data.data);

          setUiData([
            {
              label: "Pending",
              totalPercentage:
                Response.data.data.status.pending?.percentage || 0,
              count: Response.data.data.status.pending?.totalCount || 0,
              amount: Response.data.data.status.pending?.totalAmount || 0,
              color: [theme.palette.warning.light, theme.palette.warning.main],
            },
            {
              label: "In Process",
              totalPercentage:
                Response.data.data.status.in_process?.percentage || 0,
              count: Response.data.data.status.in_process?.totalCount || 0,
              amount: Response.data.data.status.in_process?.totalAmount || 0,
              color: [theme.palette.warning.light, theme.palette.warning.light],
            },
            {
              label: "Hold",
              totalPercentage: Response.data.data.status.hold?.percentage || 0,
              count: Response.data.data.status.hold?.totalCount || 0,
              amount: Response.data.data.status.hold?.totalAmount || 0,
              color: [
                theme.palette.warning.lighter,
                theme.palette.warning.lighter,
              ],
            },
          ]);

          const catData: CategoryProps[] = [];
          for (let x in Response.data.data.category) {
            if (Response.data.data.category[x].totalAmount) {
              catData.push(Response.data.data.category[x]);
            }
          }
          setCategoryData(catData);
        } else {
        }

        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    ViewTransaaction();
  }, [watch("dateFilter")]);

  return (
    <>
      <Helmet>
        <title> Transaction Center | Shampay Admin </title>
      </Helmet>

      {truncation && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {truncation}
        </Alert>
      )}

      <ReportHeader
        title="Transaction Center"
        subtitle="Every service transaction on the platform, searchable end to end."
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
              onClick={() =>
                navigate(PATH_DASHBOARD.reports.HistoricalDataExport)
              }
            >
              Export Archive
            </ReportActionButton>
          </>
        }
      />

      <ReportFilterBar>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={330}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DatePicker
                value={watch("startDate")}
                inputFormat="DD/MM/YYYY"
                minDate={txnMinDate}
                maxDate={txnMaxDate}
                components={{ OpenPickerIcon: CalendarMonthRoundedIcon }}
                onChange={onChangeStartDate}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="From"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                    }}
                    sx={{ width: 130 }}
                  />
                )}
              />
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled" }}
              >
                TO
              </Typography>
              <DatePicker
                value={watch("endDate")}
                inputFormat="DD/MM/YYYY"
                minDate={transactionEndMinDate(watch("startDate"))}
                maxDate={transactionEndMaxDate(watch("startDate"))}
                components={{ OpenPickerIcon: CalendarMonthRoundedIcon }}
                onChange={onChangeEndDate}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="To"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                    }}
                    sx={{ width: 130 }}
                  />
                )}
              />
            </Stack>
          </FilterSlot>
        </LocalizationProvider>

        <FilterSlot icon={<BusinessCenterOutlinedIcon />}>
          <TextField
            select
            fullWidth
            variant="standard"
            value={watch("category.categoryId") || ""}
            onChange={(event) => {
              const value = event.target.value;
              setValue("category.categoryId", value);
              const picked: any = categoryList.find(
                (item: any) => item._id === value
              );
              setValue("category.categoryName", picked?.category_name || "");
              if (value) getProductlist(value);
            }}
            InputProps={{ disableUnderline: true }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">All Services</MenuItem>
            {categoryList.map((item: any) => (
              <MenuItem key={item._id} value={item._id}>
                {item?.category_name}
              </MenuItem>
            ))}
          </TextField>
        </FilterSlot>

        <FilterSlot icon={<MonitorHeartOutlinedIcon />}>
          <TextField
            select
            fullWidth
            variant="standard"
            value={watch("status") || ""}
            onChange={(event) => setValue("status", event.target.value)}
            InputProps={{ disableUnderline: true }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_process">In process</MenuItem>
            <MenuItem value="hold">Hold</MenuItem>
            <MenuItem value="initiated">Initiated</MenuItem>
            <MenuItem value="queued">Queued</MenuItem>
          </TextField>
        </FilterSlot>

        <FilterSlot icon={<SearchIcon />} grow minWidth={240}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search Txn ID, API Txn ID, UTR"
            value={watch("clientRefId") || ""}
            onChange={(event) => setValue("clientRefId", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setCurrentPage(1);
                getTransaction();
              }
            }}
            InputProps={{ disableUnderline: true }}
          />
        </FilterSlot>

        <Button
          variant="contained"
          onClick={() => {
            setCurrentPage(1);
            getTransaction();
          }}
          sx={{ height: 48, px: 4, borderRadius: 1.5, fontWeight: 700 }}
        >
          Search
        </Button>

        <Tooltip title="More filters">
          <IconButton
            onClick={handleOpen}
            sx={{
              width: 48,
              height: 48,
              border: (t) => `1px solid ${t.palette.divider}`,
              borderRadius: 1.5,
            }}
          >
            <TuneIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset filters">
          <IconButton
            onClick={handleReset}
            sx={{
              width: 48,
              height: 48,
              border: (t) => `1px solid ${t.palette.divider}`,
              borderRadius: 1.5,
            }}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ReportFilterBar>

      {/* status mix strip */}
      {uiData.length > 0 && (
        <Stack
          direction="row"
          spacing={3}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2.5, px: 0.5 }}
        >
          {uiData.map((item: DashboardProps) => (
            <Stack
              key={item.label}
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  backgroundColor: item.color[1],
                }}
              />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {fIndianCurrency(item.amount)} ({item.count})
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(searchTxnFilterData)}
          >
            <Scrollbar sx={{ maxHeight: 570 }}>
              <Stack m={1} gap={1}>
                <Grid
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                  overflow={"auto"}
                >
                  <RHFSelect
                    name="category.categoryId"
                    label="Category"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {categoryList.map((item: any) => {
                      return (
                        <MenuItem
                          key={item._id}
                          value={item._id}
                          onClick={() => {
                            getProductlist(item._id);
                            setValue(
                              "category.categoryName",
                              item.category_name
                            );
                          }}
                        >
                          {item?.category_name}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>
                  <RHFSelect
                    name="vendorName"
                    label="Vendor"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {vendorList.map((item: any) => (
                      <MenuItem key={item._id} value={item.vendorName}>
                        {item.vendorName}
                      </MenuItem>
                    ))}
                  </RHFSelect>

                  <RHFSelect
                    name="product.productId"
                    label="Product"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {productList.map((item: any) => {
                      return (
                        <MenuItem
                          key={item._id}
                          value={item._id}
                          onClick={() =>
                            setValue("product.productName", item.productName)
                          }
                        >
                          {item?.productName}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>
                  {!!getValues("category.categoryId") && (
                    <>
                      <RHFTextField
                        name="key1"
                        label={
                          getValues("category.categoryName").toLowerCase() ==
                            "dmt2" ||
                          getValues("category.categoryName").toLowerCase() ==
                            "aeps" ||
                          getValues("category.categoryName").toLowerCase() ==
                            "money transfer"
                            ? "Account/Card Number"
                            : getValues(
                                "category.categoryName"
                              ).toLowerCase() == "recharges" ||
                              getValues(
                                "category.categoryName"
                              ).toLowerCase() == "bill payment"
                            ? "Operator Name"
                            : "Account/Card Number"
                        }
                      />
                      <RHFTextField
                        name="key2"
                        label={
                          getValues("category.categoryName").toLowerCase() ==
                            "money transfer" ||
                          getValues("category.categoryName").toLowerCase() ==
                            "dmt2"
                            ? "IFSC"
                            : getValues(
                                "category.categoryName"
                              ).toLowerCase() == "aeps"
                            ? "Aadhaar Number"
                            : getValues(
                                "category.categoryName"
                              ).toLowerCase() == "recharges" ||
                              getValues(
                                "category.categoryName"
                              ).toLowerCase() == "bill payment"
                            ? "Number"
                            : "UPI ID"
                        }
                      />
                      {/* {(getValues("category.categoryName").toLowerCase() !=
                        "recharges" ||
                        getValues("category.categoryName").toLowerCase() !=
                          "billpayment") && (
                        <RHFTextField
                          name="key3"
                          label={
                            getValues("category.categoryName").toLowerCase() ==
                              "dmt2" ||
                            getValues("category.categoryName").toLowerCase() ==
                              "money transfer"
                              ? "Account number"
                              : getValues(
                                  "category.categoryName"
                                ).toLowerCase() == "aeps"
                              ? "Mobile Number"
                              : "key3"
                          }
                        />
                      )} */}
                    </>
                  )}
                  <RHFSelect
                    name="status"
                    label="Status"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_process">In process</MenuItem>
                    <MenuItem value="hold">Hold</MenuItem>
                    <MenuItem value="initiated">Initiated</MenuItem>
                    <MenuItem value="queued">Queued</MenuItem>
                  </RHFSelect>
                  <RHFSelect
                    name="transactionType"
                    label="Select Transaction Type"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {txnType.map((item: any, index: number) => {
                      return (
                        <MenuItem key={index} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>
                </Grid>
                <Divider sx={{ my: 1 }}>
                  <Chip
                    label={`Date (last ${TRANSACTION_RANGE_MONTHS} months)`}
                    size="small"
                  />
                </Divider>
                <Grid
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  height={"80%"}
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                >
                  <Stack flexDirection={"row"} gap={1}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start date"
                        inputFormat="DD/MM/YYYY"
                        value={watch("startDate")}
                        minDate={txnMinDate}
                        maxDate={txnMaxDate}
                        components={{
                          OpenPickerIcon: CalendarMonthRoundedIcon,
                        }}
                        onChange={onChangeStartDate}
                        renderInput={(params: any) => (
                          <TextField
                            {...params}
                            size={"small"}
                            sx={{ width: 150 }}
                          />
                        )}
                      />

                      <DatePicker
                        label="End date"
                        inputFormat="DD/MM/YYYY"
                        value={watch("endDate")}
                        minDate={transactionEndMinDate(watch("startDate"))}
                        maxDate={transactionEndMaxDate(watch("startDate"))}
                        components={{
                          OpenPickerIcon: CalendarMonthRoundedIcon,
                        }}
                        onChange={onChangeEndDate}
                        renderInput={(params: any) => (
                          <TextField
                            {...params}
                            size={"small"}
                            sx={{ width: 150 }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Specific search" size="small" />
                </Divider>
                <Grid
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  height={"80%"}
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                >
                  <RHFTextField name="amount" label="Amount" />
                  <RHFTextField name="clientRefId" label="Transaction Id" />
                  <RHFTextField name="transactionId" label="Vendor Id" />
                  <RHFTextField
                    name="partnerTransactionId"
                    label="Client Ref Id"
                  />
                  {/* <RHFTextField name= "downline" label= "downline"/> */}
                  <RHFTextField
                    name="vendorUtrNumber"
                    label="Vendor UTR Number"
                  />
                </Grid>
                <Divider sx={{ my: 1 }}>
                  <Chip label="UserWise" size="small" />
                </Divider>
                <Grid
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  height={"80%"}
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                >
                  <RHFSelect
                    name="searchBy"
                    label="Search By"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {/* <MenuItem value="agentId">Agent</MenuItem>
                    <MenuItem value="distributorId">Distributor</MenuItem>
                    <MenuItem value="masterDistributorId">
                      Master Distributor
                    </MenuItem> */}
                    <MenuItem value="partnerId">Api User</MenuItem>
                  </RHFSelect>
                  {/* {watch("searchBy") && ( */}
                  <>
                    {/* <RHFSelect
                        fullWidth
                        name="usersearchby"
                        label="User"
                        size="small"
                        placeholder="User"
                        // InputLabelProps={{ shrink: true }}
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize" },
                        }}
                      >
                        <MenuItem value={"userCode"}>User Code</MenuItem>
                        <MenuItem value={"firstName"}>First Name</MenuItem>
                        <MenuItem value={"contact_no"}>Contact Number</MenuItem>
                        <MenuItem value={"email"}>Email</MenuItem>{" "}
                      </RHFSelect> */}
                    {watch("searchBy") && (
                      <Stack sx={{ position: "relative", minWidth: "200px" }}>
                        <RHFTextField
                          fullWidth
                          name="User"
                          placeholder={"Type here..."}
                        />
                        <Stack
                          sx={{
                            position: "absolute",
                            bottom: 40,
                            zIndex: 19900,
                            width: "100%",
                            bgcolor: "white",
                            border: "1px solid grey",
                            borderRadius: 2,
                          }}
                        >
                          <Scrollbar sx={{ maxHeight: 400 }}>
                            {userList.length > 0 &&
                              userList.map((item: any) => {
                                return (
                                  <Typography
                                    sx={{
                                      p: 1,
                                      cursor: "pointer",
                                      color: "grey",
                                      "&:hover": { color: "black" },
                                    }}
                                    onClick={() => {
                                      item.role == "agent"
                                        ? setValue("agentId", item._id)
                                        : item.role == "distributor"
                                        ? setValue("distributorId", item._id)
                                        : item.role == "m_distributor"
                                        ? setValue(
                                            "masterDistributorId",
                                            item._id
                                          )
                                        : setValue("partnerId", item._id);
                                      setUserList([]);
                                      setValue(
                                        "User",
                                        `${item.firstName} ${item.lastName}`
                                      );
                                    }}
                                    variant="subtitle2"
                                  >
                                    {" "}
                                    {item.userCode
                                      ? `${item.firstName} ${item.lastName} / (${item.userCode}) / ${item.company_name}`
                                      : `${item.firstName} ${item.lastName} / (${item.userCode}) / ${item.company_name}`}
                                  </Typography>
                                );
                              })}
                          </Scrollbar>
                        </Stack>
                      </Stack>
                    )}
                  </>
                  {/* )} */}
                </Grid>
              </Stack>
            </Scrollbar>
            <Stack flexDirection={"row"} gap={1} justifyContent={"end"}>
              <LoadingButton variant="contained" onClick={handleClose}>
                Cancel
              </LoadingButton>
              <LoadingButton variant="contained" onClick={handleReset}>
                <Iconify icon="bx:reset" color={"common.white"} mr={1} /> Reset
              </LoadingButton>
              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
              >
                Apply
              </LoadingButton>
            </Stack>
          </FormProvider>
        </Box>
      </Modal>

      {/* main conatin */}

      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        {isTxnFound ? (
          <TableSkeleton
            columns={SKELETON_COLUMNS}
            rows={pageSize > 10 ? 10 : pageSize}
            minWidth={1200}
          />
        ) : loadFailed && !sdata.length ? (
          /* Failure and "no results" used to look identical - an empty table.
             Only the request path knows the difference, so it says so here. */
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load transactions"
            description="The transaction request did not come back. Nothing was changed - try again."
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => getTransaction()}
              >
                Retry
              </PageGhostButton>
            }
          />
        ) : (
          // scroll bar here 964

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: (t) =>
                t.palette.mode === "light"
                  ? "0 2px 12px rgba(15,23,42,0.05)"
                  : "none",
            }}
          >
            <Scrollbar sx={{ overflow: "auto", maxHeight: 620 }}>
              <Table
                sx={{ minWidth: 1180 }}
                stickyHeader
                size="small"
                aria-label="transaction report"
              >
                {/* <TableHead>
                  <StyledTableRow>
                    {tableLabels.map((column: any) => (
                      <StyledTableCell key={column.id}>
                        {column.label}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                </TableHead> */}
                <TableHead>
                  <TableRow>
                    {tableLabels.map((column: any) => (
                      <ReportHeadCell key={column.id}>
                        {column.label}
                      </ReportHeadCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sdata.map((row: any, index: number) => (
                    // row?.partnerDetails?.id?._id ?

                    <ApiUserRow row={row} key={row._id} />
                  ))}
                </TableBody>

                <TableBody>
                  <StyledTableRow></StyledTableRow>
                </TableBody>

                <TableNoData isNotFound={!sdata.length} />
              </Table>
            </Scrollbar>
          </TableContainer>
        )}

        <CustomPagination
          page={currentPage - 1}
          count={txnCount}
          onPageChange={(
            event: React.MouseEvent<HTMLButtonElement> | null,
            newPage: number
          ) => {
            setCurrentPage(newPage + 1);
          }}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            setPageSize(parseInt(event.target.value));
            setCurrentPage(1);
          }}
        />
      </Grid>
    </>
  );
}

// end here main table

/**
 * Item 3c: `operation` on a vendor-call row. The old array had no such field -
 * the modal guessed "Transaction" for the first entry and "Check Status" for
 * every other one, which was wrong for callbacks, refunds and admin overrides.
 * `unknown` is what backfilled rows carry, because the old array never recorded it.
 */
const OPERATION_LABELS: Record<string, string> = {
  dispatch: "Transaction",
  checkStatus: "Check Status",
  callback: "Vendor Callback",
  manualUpdate: "Manual Update",
  refund: "Refund",
  unknown: "Not recorded",
};

/** Tone per operation, so a timeline row reads at a glance. */
const OPERATION_TONES: Record<
  string,
  "primary" | "info" | "success" | "warning" | "error"
> = {
  dispatch: "primary",
  checkStatus: "info",
  callback: "success",
  manualUpdate: "warning",
  refund: "error",
};

/**
 * Vendor request/response bodies arrive as JSON strings. Pretty-print when they
 * parse; otherwise show the raw text rather than hiding it.
 */
function prettyJson(value: any): string {
  if (value === null || value === undefined || value === "") return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

/**
 * One request or response body: a labelled, scrollable, monospaced panel with a
 * copy button. Replaces the old raw `<Typography>` wall with `wordBreak:
 * break-all`, which turned a 2 KB JWT into an unreadable brick.
 */
function PayloadPanel({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: any;
  onCopy: (text: string) => void;
}) {
  const text = prettyJson(value);

  return (
    <Stack sx={{ minWidth: 0, flex: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.75 }}
      >
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
        {text && (
          <Tooltip title={`Copy ${label.toLowerCase()}`}>
            <IconButton size="small" onClick={() => onCopy(text)}>
              <Iconify icon="eva:copy-fill" width={14} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {text ? (
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.25,
            maxHeight: 260,
            overflow: "auto",
            borderRadius: 1.5,
            bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
            border: (t) => `1px solid ${t.palette.divider}`,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 11.5,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </Box>
      ) : (
        <Typography
          sx={{ fontSize: 12, color: "text.disabled", fontStyle: "italic" }}
        >
          Nothing recorded
        </Typography>
      )}
    </Stack>
  );
}

/**
 * One entry in the vendor call history.
 *
 * The data comes from `adminTransaction/vendorCalls/:id` (backend A-014), an
 * insert-only log. Rows with `origin: "backfill"` were copied out of the old
 * `checkStatus[]` array, which rewrote its own history (A-012): each new write
 * overwrote the request and response of every earlier entry, so ~11% of
 * multi-entry transactions hold one exchange repeated. Those rows are labelled
 * rather than presented as a clean audit trail.
 */
function VendorCallEntry({
  item,
  onCopy,
}: {
  item: any;
  onCopy: (text: string) => void;
}) {
  const operation = item?.operation || "unknown";
  const tone = OPERATION_TONES[operation] || "primary";
  const isBackfill = item?.origin === "backfill";

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: 1.75,
          py: 1.25,
          bgcolor: (t) => alpha(t.palette[tone].main, 0.06),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={OPERATION_LABELS[operation] || operation}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 0.75,
              color: (t) => t.palette[tone].dark,
              bgcolor: (t) => alpha(t.palette[tone].main, 0.16),
            }}
          />
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {fDateTime(item?.createdAt)}
          </Typography>
          {isBackfill && (
            <Tooltip title="Copied from the old checkStatus array. Entries there could overwrite each other, so this request and response may be a later exchange rather than this one.">
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label="Archived record"
                sx={{ height: 22, fontSize: 11 }}
              />
            </Tooltip>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flexWrap="wrap"
        >
          {item?.vendorName && (
            <Typography sx={{ fontSize: 12 }}>
              <Box component="span" sx={{ color: "text.secondary" }}>
                Vendor{" "}
              </Box>
              <Box component="span" sx={{ fontWeight: 700 }}>
                {item.vendorName}
              </Box>
            </Typography>
          )}
          {item?.vendorTransactionId && (
            <Typography sx={{ fontSize: 12 }}>
              <Box component="span" sx={{ color: "text.secondary" }}>
                Vendor txn{" "}
              </Box>
              <Box component="span" sx={{ fontWeight: 700 }}>
                {item.vendorTransactionId}
              </Box>
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Who */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 1.75, py: 1 }}
      >
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          Performed by
        </Typography>
        {item?.performedBy ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CustomAvatar
              name={item?.performedBy?.firstName}
              alt={item?.performedBy?.selfie && item?.performedBy?.selfie[0]}
              src={item?.performedBy?.selfie && item?.performedBy?.selfie[0]}
              sx={{ width: 24, height: 24, fontSize: 11 }}
            />
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
              {item?.performedBy?.firstName} {item?.performedBy?.lastName}
            </Typography>
            {item?.performedBy?.userCode && (
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                ({item.performedBy.userCode})
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography
            sx={{ fontSize: 12.5, color: "text.disabled", fontStyle: "italic" }}
          >
            Vendor initiated
          </Typography>
        )}
      </Stack>

      {/* Bodies */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ px: 1.75, pb: 1.75 }}
      >
        <PayloadPanel
          label="Request"
          value={item?.request}
          onCopy={onCopy}
        />
        <PayloadPanel
          label="Response"
          value={item?.response}
          onCopy={onCopy}
        />
      </Stack>
    </Box>
  );
}

const TransactionRow = React.memo(({ row }: any) => {
  const { Api } = useAuthContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);
  const [expand, setExpand] = useState(false);

  // ------------------------------------------------------------------
  // Item 3c: the vendor call history has a real endpoint now.
  //
  //   GET adminTransaction/vendorCalls/:transactionId
  //     -> { code, data: { data: VendorCall[], totalNumberOfRecords }, message }
  //
  // This modal used to render the transaction's embedded `checkStatus[]` array.
  // That array was written with the all-positional operator, so every
  // check-status call overwrote the request and response of every earlier entry
  // - a transaction checked five times showed the same exchange five times. The
  // new collection is insert-only, so the history is real.
  //
  // Rows arrive oldest-first from the server, so nothing is sorted here.
  // ------------------------------------------------------------------
  const [vendorCalls, setVendorCalls] = useState<any[]>([]);
  const [vendorCallsLoading, setVendorCallsLoading] = useState(false);
  const [vendorCallsError, setVendorCallsError] = useState("");

  const loadVendorCalls = useCallback(() => {
    const id = newRow?._id;
    if (!id) return;
    setVendorCallsLoading(true);
    setVendorCallsError("");
    const token = localStorage.getItem("token");
    Api(`adminTransaction/vendorCalls/${id}`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setVendorCalls(Response.data?.data?.data || []);
        } else {
          setVendorCalls([]);
          setVendorCallsError(failureMessage(Response));
        }
        setVendorCallsLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRow?._id]);

  //modal for request response
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
    loadVendorCalls();
  };
  const handleClose = () => setOpen(false);

  const subTableLabels = [
    { id: "Opening", label: "Opening" },
    { id: "amount", label: "Amount" },
    { id: "Commission", label: "Commission" },
    { id: "GST", label: "GST/TDS" },
    { id: "Closing", label: "Closing" },
  ];

  //modal for update transaction
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
    reset(defaultValues);
  };
  const amountInWords = numWords(newRow.amount);
  // Table Data loading
  const [loading, setLoading] = useState(false);

  const accountValidate = Yup.object().shape({
    updatedstatus: Yup.string().required("Status is required field"),
    vendorutr: Yup.string().when("updatedstatus", {
      is: "success",
      then: Yup.string().required("Vendor UTR number is required field"),
    }),
    remarks: Yup.string().when("updatedstatus", {
      is: "failed",
      then: Yup.string().required("Remark is required field"),
    }),
    vendortxnid: Yup.string().when("updatedstatus", {
      is: "success",
      then: Yup.string().required("Vendor Transaction Id is required field"),
    }),
  });

  const defaultValues = {
    vendorutr: "",
    updatedstatus:
      newRow?.vendorName == "SETU" &&
      newRow?.transactionType == "Beneficiary Verification"
        ? "failed"
        : "",
    remarks: "",
    vendortxnid: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip
      {...props}
      classes={{ popper: className }}
      TransitionComponent={Zoom}
      placement="right"
      sx={{ cursor: "pointer" }}
    />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
      // fontSize: 14,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      fontSize: 10,
      border: "1px solid #dadde9",
    },
  });

  const checkStatus = async (val: any) => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let rowFor = val;
    await Api(
      rowFor.categoryName.toLowerCase() == "money transfer"
        ? `admin/moneyTransfer/transaction/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "recharges"
        ? `admin/rechargeControl/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "payout payments"
        ? `admin/payoutPayments/transaction/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "transfer"
        ? `admin/transfer/transaction/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "dmt1"
        ? `admin/dmt1/transaction/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "dmt2"
        ? `admin/dmt2/transaction/checkStatus/` + rowFor._id
        : rowFor.transactionType == "Wallet To Bank Account Settlement" &&
          `admin/settlement/checkStatus/` + rowFor._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setNewRow({ ...newRow, status: Response.data.data.status });
        } else {
          enqueueSnackbar(Response.data.message);
        }
        setLoading(false);
      } else {
        enqueueSnackbar("Failed");
        setLoading(false);
      }
    });
  };

  const updateTransaction = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let rowFor = newRow.categoryName.toLowerCase();
      let body = {
        transactionId: newRow._id, // _id (mongoid)
        status: data.updatedstatus,
        vendorUtr: data.vendorutr, // mandatory if status is success
        remarks: data.remarks, // mandatory if status is failed
        vendorTransactionId: data.vendortxnid, //mandatory if status is success
      };
      await Api(
        `${
          rowFor == "dmt2"
            ? "admin/dmt2/transaction/update"
            : rowFor == "dmt1"
            ? "admin/dmt1/transaction/update"
            : rowFor == "money transfer"
            ? "admin/moneytransfer/transaction/update"
            : rowFor == "payout payments"
            ? "admin/payoutPayments/transaction/update"
            : rowFor == "transfer"
            ? "admin/transfer/transaction/update"
            : rowFor == "payments"
            ? "admin/payments/transaction/update"
            : rowFor == "bill payment"
            ? "admin/bbps/transaction/update"
            : rowFor == "recharges" && "admin/rechargeControl/updateStatus"
        }`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            handleClose1();
            setNewRow({ ...newRow, ...Response.data.data });
          } else {
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar("Failed to Update");
        }
      });
    } catch (err) {}
  };

  const { copy } = useCopyToClipboard();
  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      padding: 6,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
      fontWeight: 600,
      fontSize: 14,
      backgroundColor: theme.palette.grey[400],
      color: theme.palette.common.black,
      padding: 8,
    },
  }));

  // const StyledTableRow = styled(TableRow)(({ theme }) => ({
  //   "&:nth-of-type(even)": {
  //     backgroundColor: theme.palette.grey[100], // Light grey for even rows
  //   },
  //   "&:nth-of-type(odd)": {
  //     backgroundColor: theme.palette.common.white, // White for odd rows
  //   },
  //   "&:hover": {
  //     backgroundColor: theme.palette.grey[200], // Slightly darker on hover
  //   },
  //   "&:last-child td, &:last-child th": {
  //     border: 0,
  //     fontWeight: 600,
  //     fontSize: 14,
  //     backgroundColor: theme.palette.grey[400],
  //     color: theme.palette.common.black,
  //     padding: 8,
  //   },
  // }));

  // not this table
  // let [downline,setDownLine]= useState(row)

  // const downlineRequest = () => {
  //   let token = localStorage.getItem("token");

  //   Api(`adminTransaction/downline`, "POST", "", token) . then((Response:any) => {
  //     if (Response.status == 200) {
  //       if (Response.data.data== 200) {
  //         console.log("downline data is ready to display")
  //         // setDownLine({...newRow, status: Response.data.data})
  //         // console.log("downline data is getting")
  //       }
  //       else{
  //         // console.log("downline data is not getting 1")
  //       }
  //     }
  //     else {
  //       // console.log("downline data is not getting 2")
  //     }
  //   })
  // }

  return (
    <>
      <StyledTableRow
        key={newRow._id}
        // sx={{ "& > *": { borderBottom: "unset" } }}
        // hover
      >
        <StyledTableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setExpand(!expand)}
          >
            {expand ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>
        <StyledTableCell>
          <Stack direction="row" alignItems="center" gap={1}>
            <CustomAvatar
              name={newRow?.agentDetails?.id?.firstName}
              alt={newRow?.agentDetails?.id?.firstName}
              src={newRow?.agentDetails?.id?.selfie[0] || ""}
            />
            <Stack>
              <Typography noWrap variant="body2">
                {sentenceCase(newRow?.agentDetails?.id?.firstName || "")}{" "}
                {sentenceCase(newRow?.agentDetails?.id?.lastName || "")}
              </Typography>

              <Typography noWrap variant="body2" color={"text.secondary"}>
                {sentenceCase(newRow?.agentDetails?.id?.role || "")}
              </Typography>
              <Typography noWrap variant="body2">
                Client Id : {newRow?.partnerTransactionId}{" "}
                <IconButton
                  sx={{ p: 0.5 }}
                  onClick={() => onCopy(newRow?.partnerTransactionId)}
                >
                  <Iconify icon="eva:copy-fill" width={20} />
                </IconButton>
              </Typography>
              <Typography noWrap variant="body2" color={"text.secondary"}>
                {fDateTime(newRow.createdAt)}
              </Typography>
              {/* <Typography>
               downline: {newRow.downline}
              </Typography> */}
            </Stack>
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          <Typography noWrap variant="body2">
            TID: {newRow?.clientRefId}{" "}
            <IconButton
              sx={{ p: 0.5 }}
              onClick={() => onCopy(`${newRow?.clientRefId}`)}
            >
              <Iconify icon="eva:copy-fill" width={20} />
            </IconButton>
          </Typography>
          <Typography noWrap variant="body2">
            VID : {newRow?.transactionId}
            <IconButton
              sx={{ p: 0.5 }}
              onClick={() => onCopy(`${newRow?.transactionId}`)}
            >
              <Iconify icon="eva:copy-fill" width={20} />
            </IconButton>
          </Typography>
          <Typography noWrap variant="body2">
            Vendor : {newRow?.vendorName}
          </Typography>
          <Typography noWrap variant="body2">
            UTR Number : {newRow?.vendorUtrNumber}
          </Typography>
          <Typography noWrap variant="body2">
            Mode : {newRow?.modeOfPayment}
          </Typography>
        </StyledTableCell>
        {/* Device Info */}
        <StyledTableCell>
          <Stack flexDirection={"row"} alignItems={"center"}>
            <Typography noWrap variant="body2" alignSelf={"center"}>
              Device : {sentenceCase(newRow?.metaData?.deviceType || "")}{" "}
            </Typography>
            {newRow?.metaData?.deviceType === "android" && (
              <Iconify
                width={12}
                ml={0.5}
                icon={"flat-color-icons:android-os"}
              />
            )}
            {newRow?.metaData?.deviceType === "windows" && (
              <Iconify width={12} ml={0.5} icon={"devicon:windows8"} />
            )}
            {newRow?.metaData?.deviceType === "macbook" && (
              <Iconify
                width={20}
                ml={0.5}
                icon={"vscode-icons:file-type-applescript"}
              />
            )}
          </Stack>
          <Typography noWrap variant="body2">
            {" "}
            {newRow?.metaData?.imeiNumber &&
              `IMEI : 
                ${newRow?.metaData?.imeiNumber}
              `}{" "}
          </Typography>
          <Typography noWrap variant="body2">
            {" "}
            IP : {newRow?.metaData?.ipAddress}{" "}
          </Typography>
          <Stack flexDirection={"row"} gap={0.5} alignItems={"center"}>
            <Stack>
              <Typography noWrap variant="body2">
                {" "}
                Latitude : {newRow?.metaData?.lat}{" "}
              </Typography>
              <Typography noWrap variant="body2">
                {" "}
                Longitude : {newRow?.metaData?.long}{" "}
              </Typography>
            </Stack>
            {newRow?.metaData?.lat && (
              <Iconify
                sx={{ width: 18, cursor: "pointer" }}
                icon={"line-md:my-location-loop"}
                onClick={() =>
                  window.open(
                    `https://maps.google.com/?q=${newRow?.metaData?.lat},${newRow?.metaData?.long}`
                  )
                }
              />
            )}
          </Stack>
        </StyledTableCell>
        {/* Transaction Type */}
        <StyledTableCell>
          <Typography noWrap variant="body2">
            Txn Type : {newRow?.transactionType}
          </Typography>
          <Typography noWrap variant="body2">
            Category : {newRow?.categoryName || "NA"}
          </Typography>
          <Typography noWrap variant="body2">
            Product : {newRow?.productName || "NA"}
          </Typography>
          <Typography noWrap variant="body2">
            Mobile Number : {newRow?.mobileNumber || "NA"}
          </Typography>
        </StyledTableCell>
        {/* Operator */}
        <StyledTableCell>
          <Typography noWrap variant="body2">
            {" "}
            {newRow?.operator?.key3}
          </Typography>
          <Typography noWrap variant="body2">
            {" "}
            {newRow?.operator?.key1}
          </Typography>
          <Typography noWrap variant="body2">
            {" "}
            {newRow?.operator?.key2}
          </Typography>
        </StyledTableCell>

        {/* Sender/Beneficiary detail */}
        <StyledTableCell>
          <Stack flexDirection={"row"} gap={1}>
            <Typography whiteSpace={"nowrap"} variant="body2">
              Sender : {newRow?.moneyTransferSenderId?.remitterFN || "NA"}{" "}
              {newRow?.moneyTransferSenderId?.remitterLN}
            </Typography>
            {newRow?.moneyTransferSenderId?.remitterFN && (
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferSenderId?.remitterFN}{" "}
                      {newRow?.moneyTransferSenderId?.remitterLN}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferSenderId?.remitterMobile}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferSenderId?.remitterEmail}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferSenderId?.remitterOccupation}
                    </Typography>
                  </Stack>
                }
              >
                <Icon
                  icon="ph:info-duotone"
                  width={20}
                  color={theme.palette.primary.main}
                />
              </CustomWidthTooltip>
            )}
          </Stack>
          <Stack flexDirection={"row"} gap={1}>
            <Typography noWrap variant="body2">
              Beneficiary:{" "}
              {newRow?.moneyTransferBeneficiaryDetails?.accountNumber || "NA"}
            </Typography>
            {newRow?.moneyTransferBeneficiaryDetails?.accountNumber && (
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography noWrap>
                      {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                    </Typography>
                    <Typography noWrap>
                      {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                    </Typography>
                    <Typography noWrap>
                      {newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                    </Typography>
                    <Typography noWrap>
                      {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                    </Typography>
                    <Typography noWrap>
                      {newRow?.moneyTransferBeneficiaryDetails?.mobileNumber}
                    </Typography>
                    <Typography noWrap>
                      {newRow?.moneyTransferBeneficiaryDetails?.beneEmail}
                    </Typography>
                  </Stack>
                }
              >
                <Icon
                  icon="ph:info-duotone"
                  width={20}
                  color={theme.palette.primary.main}
                />
              </CustomWidthTooltip>
            )}
          </Stack>
        </StyledTableCell>
        <StyledTableCell sx={{ textAlign: "end", whiteSpace: "nowrap" }}>
          <Typography noWrap variant="body2">
            Txn Amt: {newRow.amount}
          </Typography>
        </StyledTableCell>
        {/* Debit/Credit */}
        <StyledTableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            Debit : {newRow?.debit}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            Credit : {newRow?.credit}
          </Typography>
        </StyledTableCell>
        {/* Status */}
        <StyledTableCell
          sx={{
            textTransform: "capitalize",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          <Label
            variant="soft"
            color={
              (newRow.status === "failed" && "error") ||
              ((newRow.status === "pending" ||
                newRow.status === "in_process") &&
                "warning") ||
              "success"
            }
            sx={{ textTransform: "capitalize" }}
          >
            {newRow.status ? sentenceCase(newRow.status) : ""}
          </Label>
        </StyledTableCell>
        <StyledTableCell>
          <Stack gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpen}
              sx={{ whiteSpace: "nowrap", textAlign: "center" }}
            >
              Response / Request
            </Button>
            {newRow.status !== "success" && newRow.status !== "failed" && (
              <LoadingButton
                loading={loading}
                variant="outlined"
                size="small"
                onClick={() => checkStatus(newRow)}
                sx={{ whiteSpace: "nowrap", textAlign: "center" }}
              >
                Check Status
              </LoadingButton>
            )}
            {newRow.status !== "success" &&
              newRow.status !== "failed" &&
              newRow.transactionType !== "Beneficiary Verification" &&
              (newRow.categoryName.toLowerCase() == "recharges" ||
                newRow.categoryName.toLowerCase() == "money transfer" ||
                newRow.categoryName.toLowerCase() == "payout payments" ||
                newRow.categoryName.toLowerCase() == "transfer" ||
                newRow.categoryName.toLowerCase() == "dmt1" ||
                newRow.categoryName.toLowerCase() == "dmt2") && (
                <Button
                  variant="outlined"
                  onClick={handleOpen1}
                  size="small"
                  sx={{ whiteSpace: "nowrap", textAlign: "center" }}
                >
                  Update Transaction
                </Button>
              )}

            {newRow.status !== "failed" &&
              newRow.categoryName.toLowerCase() == "bill payment" && (
                <LoadingButton
                  variant="outlined"
                  loading={isSubmitting}
                  onClick={handleOpen1}
                  size="small"
                  sx={{ whiteSpace: "nowrap", textAlign: "center" }}
                >
                  Update Transaction
                </LoadingButton>
              )}
          </Stack>
        </StyledTableCell>
      </StyledTableRow>

      <StyledTableRow key={newRow._id}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expand} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6">Transaction Detail.</Typography>
              <Card>
                <Table size="medium" sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography>Role</Typography>
                      </TableCell>
                      {subTableLabels.map((column: any) => (
                        <TableCell key={column.id}>{column.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      "agentDetails",
                      "distributorDetails",
                      "masterDistributorDetails",
                    ]?.map((item: any) => (
                      <TableRow key={item}>
                        <TableCell>
                          <Typography>
                            {sentenceCase(newRow[item]?.id?.role || "")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {fIndianCurrency(
                              newRow[item]?.oldMainWalletBalance || "0"
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {fIndianCurrency(newRow?.amount || "0")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {fIndianCurrency(
                              newRow[item]?.commissionAmount || "0"
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {fIndianCurrency(newRow[item]?.TDSAmount || "0")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {fIndianCurrency(
                              newRow[item]?.newMainWalletBalance || "0"
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </Box>
          </Collapse>
        </TableCell>
      </StyledTableRow>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            borderRadius: "10px",
            p: {
              xs: 1,
              sm: 4,
            },
            width: {
              xs: "97%",
              sm: "80%",
            },
          }}
        >
          <Scrollbar sx={{ maxHeight: 500 }}>
            {vendorCallsLoading ? (
              <LoadingState label="Loading vendor call history..." />
            ) : vendorCallsError ? (
              <EmptyState
                icon={<ErrorOutlineOutlinedIcon />}
                title="Could not load the vendor call history"
                description={vendorCallsError}
                action={
                  <PageGhostButton
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={loadVendorCalls}
                  >
                    Try again
                  </PageGhostButton>
                }
              />
            ) : vendorCalls.length === 0 ? (
              <EmptyState
                title="No vendor calls recorded"
                description="Nothing was exchanged with a vendor for this transaction."
              />
            ) : (
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: "solid #000" }}>Date</TableCell>
                    <TableCell sx={{ border: "solid #000" }}>
                      Operation
                    </TableCell>
                    <TableCell
                      sx={{ border: "solid #000", whiteSpace: "nowrap" }}
                    >
                      Performed By
                    </TableCell>
                    <TableCell align="left" sx={{ border: " solid #000" }}>
                      Request
                    </TableCell>
                    <TableCell align="left" sx={{ border: " solid #000" }}>
                      Api Response
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendorCalls.map((item: any) => {
                    const performedBy = item?.performedBy;
                    return (
                      <TableRow key={item._id}>
                        <TableCell align="left" sx={{ border: " solid #000" }}>
                          <Typography color={"text.secondary"} variant="body2">
                            {fDateTime(item.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ border: " solid #000", whiteSpace: "nowrap" }}
                        >
                          <Typography variant="subtitle1">
                            {OPERATION_LABELS[item?.operation] ||
                              item?.operation ||
                              "Unknown"}
                          </Typography>
                          {item?.vendorName && (
                            <Typography variant="body2">
                              Vendor : {item.vendorName}
                            </Typography>
                          )}
                          {item?.vendorTransactionId && (
                            <Typography variant="body2">
                              Vendor Txn : {item.vendorTransactionId}
                            </Typography>
                          )}
                          {item?.requestId && (
                            <Typography variant="body2">
                              Request ID : {item.requestId}
                            </Typography>
                          )}
                          {/* A backfill row was copied out of the old array and
                              inherits its damage, so it must not be presented as
                              a trustworthy record of the exchange. */}
                          {item?.origin === "backfill" && (
                            <Tooltip
                              title="Copied from the legacy checkStatus array. Its request and response may have been overwritten by the old append bug, and the operation was not recorded."
                              TransitionComponent={Zoom}
                            >
                              <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                label="Archived record"
                                sx={{ mt: 0.5 }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ border: " solid #000", whiteSpace: "nowrap" }}
                        >
                          {performedBy ? (
                            <Stack direction="row" alignItems="center" gap={2}>
                              <CustomAvatar
                                name={performedBy?.firstName}
                                alt={
                                  performedBy?.selfie && performedBy?.selfie[0]
                                }
                                src={
                                  performedBy?.selfie && performedBy?.selfie[0]
                                }
                              />
                              <Stack>
                                <Typography variant="body2">
                                  {performedBy?.firstName}{" "}
                                  {performedBy?.lastName}
                                </Typography>
                                <Typography variant="body2">
                                  {performedBy?.role === "API_User"
                                    ? "API User"
                                    : performedBy?.role || null}
                                </Typography>
                                <Typography variant="body2">
                                  {performedBy?.userCode}
                                </Typography>
                                <Typography variant="body2">
                                  {performedBy?.email}
                                </Typography>
                              </Stack>
                            </Stack>
                          ) : (
                            /* Absent for vendor-initiated callbacks - say so
                               rather than leaving the cell blank. */
                            <Typography
                              variant="body2"
                              color="text.disabled"
                              fontStyle="italic"
                            >
                              Vendor initiated
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell align="left" sx={{ border: "solid #000" }}>
                          <Typography
                            sx={{
                              cursor: "pointer",
                              overflow: "hidden",
                              wordBreak: "break-all",
                            }}
                          >
                            {item?.request}
                            <Icon
                              style={{
                                fontSize: "20px",
                                float: "right",
                                cursor: "pointer",
                              }}
                              icon="uil:copy"
                              onClick={(e) => {
                                onCopy(item?.request);
                              }}
                            />
                          </Typography>
                        </TableCell>
                        <TableCell align="left" sx={{ border: "solid #000" }}>
                          <Typography
                            sx={{
                              cursor: "pointer",
                              overflow: "hidden",
                              wordBreak: "break-all",
                            }}
                          >
                            {item?.response}
                            <Icon
                              style={{
                                fontSize: "20px",
                                float: "right",
                                cursor: "pointer",
                              }}
                              icon="uil:copy"
                              onClick={(e) => {
                                onCopy(item?.response);
                              }}
                            />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Scrollbar>
          <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
            close
          </Button>
        </Box>
      </Modal>

      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            borderRadius: 2,
            p: 4,
            width: {
              xs: "100%",
              sm: 450,
            },
          }}
        >
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(updateTransaction)}
          >
            <Stack gap={2}>
              <RHFSelect
                name="updatedstatus"
                label="Status"
                placeholder="Status"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </RHFSelect>
              <RHFTextField name="vendorutr" label="Vendor UTR" />
              <RHFTextField name="remarks" label="Remarks" />
              <RHFTextField name="vendortxnid" label="Vendor Transaction Id" />
              <Stack flexDirection={"row"} gap={1}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isValid}
                >
                  Update
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  onClick={() => {
                    handleClose1();
                    reset(defaultValues);
                  }}
                >
                  Cancel
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        </Box>
      </Modal>
    </>
  );
});

const ApiUserRow = React.memo(({ row }: any) => {
  const { Api } = useAuthContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);
  const [expand, setExpand] = useState(false);

  // Item 3c: same switch as TransactionRow above - this is the API-user variant
  // of the same timeline, and it rendered the same embedded `checkStatus[]`.
  const [vendorCalls, setVendorCalls] = useState<any[]>([]);
  const [vendorCallsLoading, setVendorCallsLoading] = useState(false);
  const [vendorCallsError, setVendorCallsError] = useState("");

  const loadVendorCalls = useCallback(() => {
    const id = newRow?._id;
    if (!id) return;
    setVendorCallsLoading(true);
    setVendorCallsError("");
    const token = localStorage.getItem("token");
    Api(`adminTransaction/vendorCalls/${id}`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setVendorCalls(Response.data?.data?.data || []);
        } else {
          setVendorCalls([]);
          setVendorCallsError(failureMessage(Response));
        }
        setVendorCallsLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRow?._id]);

  //modal for request response
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
    loadVendorCalls();
  };
  const handleClose = () => setOpen(false);

  const subTableLabels = [
    { id: "Opening", label: "Opening" },
    { id: "amount", label: "Amount" },
    { id: "Commission", label: "Commission" },
    { id: "GST", label: "GST/TDS" },
    { id: "Closing", label: "Closing" },
  ];
  //modal for update transaction
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
    reset(defaultValues);
  };

  // Table Data loading
  const [loading, setLoading] = useState(false);

  const accountValidate = Yup.object().shape({
    updatedstatus: Yup.string().required("Status is required field"),
    vendorutr: Yup.string().when("updatedstatus", {
      is: "success",
      then: Yup.string().required("Vendor UTR number is required field"),
    }),
    remarks: Yup.string().when("updatedstatus", {
      is: "failed",
      then: Yup.string().required("Remark is required field"),
    }),
    vendortxnid: Yup.string().when("updatedstatus", {
      is: "success",
      then: Yup.string().required("Vendor Transaction Id is required field"),
    }),
  });

  const defaultValues = {
    vendorutr: "",
    status:
      newRow.transactionType === "Beneficiary Verification" &&
      newRow.vendorName.toLowerCase() === "setu"
        ? "failed"
        : "",
    updatedstatus: "",
    remarks: "",
    vendortxnid: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip
      {...props}
      classes={{ popper: className }}
      TransitionComponent={Zoom}
      placement="right"
      sx={{ cursor: "pointer" }}
    />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,

      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      fontSize: 10,
      border: "1px solid #dadde9",
    },
  });

  const isButtonDisabled = (id: string): boolean => {
    const savedTime = localStorage.getItem(`check_disabled_${id}`);
    if (!savedTime) return false;
    const elapsed = Date.now() - parseInt(savedTime);
    return elapsed < 5 * 60 * 1000; // 5 minutes
  };

  const checkStatus = async (val: any) => {
    const currentTime = Date.now();
    const rowKey = `check_disabled_${val._id}`;
    localStorage.setItem(rowKey, currentTime.toString());

    setLoading(true);
    let token = localStorage.getItem("token");

    await Api(
      val.categoryName.toLowerCase() == "transfer"
        ? `admin/transfer/transaction/checkStatus/` + val._id
        : val?.vendorName == "SETU" &&
          val?.transactionType == "Beneficiary Verification"
        ? `admin/penny_drop/check_status/` + val?._id
        : val.categoryName.toLowerCase() == "money transfer" &&
          val?.transactionType == "Product/Service"
        ? `admin/moneyTransfer/transaction/checkStatus/` + val._id
        : val.categoryName.toLowerCase() == "payout payments"
        ? `admin/payoutPayments/transaction/checkStatus/` + val._id
        : val.categoryName.toLowerCase() == "recharges"
        ? `admin/rechargeControl/checkStatus/` + val._id
        : val.categoryName.toLowerCase() == "payments"
        ? `admin/payments/transaction/checkStatus/` + val._id
        : val.categoryName.toLowerCase() == "dmt1"
        ? `admin/dmt1/transaction/checkStatus/` + val._id
        : val.categoryName.toLowerCase() == "dmt2" &&
          val?.transactionType == "Product/Service"
        ? `admin/dmt2/transaction/checkStatus/` + val._id
        : val.transactionType == "Wallet To Bank Account Settlement" &&
          `admin/settlement/checkStatus/` + val._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setNewRow({ ...newRow, status: Response.data.data.status });
        } else {
          enqueueSnackbar(Response.data.message);
        }
        setLoading(false);
      } else {
        enqueueSnackbar("Failed");
        setLoading(false);
      }
    });
  };

  const updateTransaction = async () => {
    try {
      let token = localStorage.getItem("token");
      let rowFor = newRow.categoryName.toLowerCase();
      let body = {
        transactionId: newRow._id, // _id (mongoid)
        status: getValues("updatedstatus") || "",
        vendorUtr: getValues("vendorutr") || "", // mandatory if status is success
        remarks: getValues("remarks") || "", // mandatory if status is failed
        vendorTransactionId: getValues("vendortxnid") || "", //mandatory if status is success
      };
      await Api(
        `${
          rowFor == "dmt2"
            ? "admin/dmt2/transaction/update"
            : newRow.transactionType === "Beneficiary Verification"
            ? // newRow.vendorName.toLowerCase() === "setu"
              "admin/beneVerification/setu/status/update"
            : rowFor == "payout payments"
            ? "admin/payoutPayments/transaction/update"
            : rowFor == "dmt1"
            ? "admin/dmt1/transaction/update"
            : rowFor == "payments"
            ? "admin/payments/transaction/update"
            : rowFor == "money transfer"
            ? "admin/moneytransfer/transaction/update"
            : rowFor == "transfer"
            ? "admin/transfer/transaction/update"
            : rowFor == "bill payment"
            ? "admin/bbps/transaction/update"
            : rowFor == "recharges" && "admin/rechargeControl/updateStatus"
        }`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            handleClose1();
            setNewRow({ ...newRow, ...Response.data.data });
          } else {
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar("Failed to Update");
        }
      });
    } catch (err) {}
  };

  const { copy } = useCopyToClipboard();
  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      padding: 6,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border

    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[200],
    },

    // "&:last-child td, &:last-child th": {
    //   border: 0,
    //   fontWeight: 600,
    //   fontSize: 14,
    //   backgroundColor: theme.palette.grey[400],
    //   color: theme.palette.common.black,
    //   padding: 8,
    // },
  }));

  // const downlineRequest = () => {
  //   let token = localStorage.getItem("token");

  //   Api(`admin/downline`, "POST", "", token) . then((Response:any) => {
  //     if (Response.status == 200) {
  //       if (Response.data.data== 200) {
  //         console.log("downline data is ready to display")
  //         // setDownLine({...newRow, status: Response.data.data})
  //         setDownLine("data is displayed")
  //         console.log(downline)
  //         // console.log("downline data is getting")
  //       }
  //       else{
  //         console.log("downline data is not getting 1")
  //       }
  //     }
  //     else {
  //       console.log("downline data is not getting 2")
  //     }
  //   })
  // }

  // define the body structure

  // interface DownlineBody {
  //   clientRefId: string;
  //   partnerTransactionId: string;
  //   status: string;
  //   utr: string;
  //   remarks: string;
  // }

  //   let [downlineData,setDownLineData]= useState<DownlineBody[]>([])

  //   const downline = () => {
  //     let token = localStorage.getItem("token");

  //     Api(`admin/downline/${newRow.clientRefId}`, "GET", "", token).then((Response:any) => {
  //         if (Response.data.code === 200) {
  //           if (Array.isArray(Response.data.data)) {
  //
  //             setDownLineData( Response.data.data.map(( item:any) => item.body))
  //             //
  //           } else {
  //
  //           }
  //         } else {
  //
  //         }
  //       })
  //       .catch((error:any) => {
  //         console.error("API error:", error);
  //       });
  //   };

  // useEffect(() => {
  //   downline();
  // }, []);

  // console.log(downlineData)

  // bhu
  // real table structure this one

  return (
    <>
      <ReportRow key={newRow._id}>
        {/* ---- ACTION (kept first so operators act before reading) ---- */}
        <StyledTableCell>
          <Stack direction="row" gap={0.75} alignItems="center">
            <Tooltip title="Request / response logs">
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

            {newRow.status !== "success" &&
              newRow.status !== "failed" &&
              newRow.status !== "queued" &&
              (newRow.categoryName.toLowerCase() == "transfer" ||
                (newRow?.vendorName == "SETU" &&
                  newRow?.transactionType == "Beneficiary Verification") ||
                (newRow.categoryName.toLowerCase() == "money transfer" &&
                  newRow?.transactionType == "Product/Service") ||
                newRow.categoryName.toLowerCase() == "payout payments" ||
                newRow.categoryName.toLowerCase() == "recharges" ||
                (newRow.categoryName.toLowerCase() == "dmt1" &&
                  newRow?.transactionType == "Product/Service") ||
                (newRow.categoryName.toLowerCase() == "dmt2" &&
                  newRow?.transactionType == "Product/Service") ||
                newRow?.categoryName.toLowerCase() == "payments" ||
                newRow.transactionType ==
                  "Wallet To Bank Account Settlement") && (
                <LoadingButton
                  loading={loading}
                  variant="outlined"
                  size="small"
                  onClick={() => checkStatus(newRow)}
                  disabled={isButtonDisabled(newRow._id)}
                  sx={{
                    px: 1.25,
                    minWidth: 0,
                    fontSize: 11.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Check Status
                </LoadingButton>
              )}

            {newRow.status !== "success" &&
              newRow.status !== "failed" &&
              (newRow.categoryName.toLowerCase() == "recharges" ||
                (newRow.categoryName.toLowerCase() == "money transfer" &&
                  newRow.transactionType !== "Beneficiary Verification") ||
                newRow.transactionType === "Beneficiary Verification" ||
                newRow.categoryName.toLowerCase() == "transfer" ||
                (newRow.categoryName.toLowerCase() == "dmt1" &&
                  newRow?.transactionType == "Product/Service") ||
                newRow.categoryName.toLowerCase() == "payments" ||
                newRow.categoryName.toLowerCase() == "payout payments" ||
                newRow.categoryName.toLowerCase() == "dmt2") && (
                <LoadingButton
                  variant="outlined"
                  loading={isSubmitting}
                  onClick={handleOpen1}
                  size="small"
                  sx={{
                    px: 1.25,
                    minWidth: 0,
                    fontSize: 11.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Update
                </LoadingButton>
              )}

            {newRow.status !== "failed" &&
              newRow.categoryName.toLowerCase() == "bill payment" && (
                <LoadingButton
                  variant="outlined"
                  loading={isSubmitting}
                  onClick={handleOpen1}
                  size="small"
                  sx={{
                    px: 1.25,
                    minWidth: 0,
                    fontSize: 11.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Update
                </LoadingButton>
              )}
          </Stack>
        </StyledTableCell>

        {/* ---- DATE & TIME ---- */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 13.5 }}>
            {fDate(newRow?.createdAt)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {fDateTime(newRow?.createdAt)}
          </Typography>
        </StyledTableCell>

        {/* ---- USER ---- */}
        <StyledTableCell>
          <Stack direction="row" alignItems="center" gap={1}>
            <CustomAvatar
              name={newRow?.partnerDetails?.id?.firstName}
              alt={newRow?.partnerDetails?.id?.firstName}
              src={""}
              sx={{ width: 30, height: 30 }}
            />
            <Stack sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600 }}>
                {sentenceCase(newRow?.partnerDetails?.id?.firstName || "")}{" "}
                {sentenceCase(newRow?.partnerDetails?.id?.lastName || "")}
              </Typography>
              <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                {(newRow?.partnerDetails?.id?.userCode || "").toUpperCase()}
              </Typography>
            </Stack>
          </Stack>
        </StyledTableCell>

        {/* ---- TXN ID ---- */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography sx={{ fontSize: 13 }}>
              {newRow?.clientRefId || "-"}
            </Typography>
            {newRow?.clientRefId && (
              <IconButton
                sx={{ p: 0.25 }}
                onClick={() => onCopy(`${newRow?.clientRefId}`)}
              >
                <Iconify icon="eva:copy-fill" width={15} />
              </IconButton>
            )}
          </Stack>
          {newRow?.vendorUtrNumber && (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              UTR {newRow?.vendorUtrNumber}
            </Typography>
          )}
        </StyledTableCell>

        {/* ---- API TXN ID ---- */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography sx={{ fontSize: 13 }}>
              {newRow?.partnerTransactionId || "-"}
            </Typography>
            {newRow?.partnerTransactionId && (
              <IconButton
                sx={{ p: 0.25 }}
                onClick={() => onCopy(`${newRow?.partnerTransactionId}`)}
              >
                <Iconify icon="eva:copy-fill" width={15} />
              </IconButton>
            )}
          </Stack>
          {newRow?.transactionId && (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              VID {newRow?.transactionId}
            </Typography>
          )}
        </StyledTableCell>

        {/* ---- AMOUNT (actual wallet movement) ---- */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {fIndianCurrency(
              Number(newRow?.debit) || Number(newRow?.credit) || 0
            )}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            Bal{" "}
            {newRow?.partnerDetails?.oldMainWalletBalance !== undefined &&
            newRow?.partnerDetails?.oldMainWalletBalance !== null
              ? Number(newRow.partnerDetails.oldMainWalletBalance).toFixed(2)
              : "N/A"}
            {" - "}
            {newRow?.partnerDetails?.newMainWalletBalance !== undefined &&
            newRow?.partnerDetails?.newMainWalletBalance !== null
              ? Number(newRow.partnerDetails.newMainWalletBalance).toFixed(2)
              : "N/A"}
          </Typography>
        </StyledTableCell>

        {/* ---- TRANSACTION ---- */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 13.5 }}>
            {fIndianCurrency(Number(newRow?.amount) || 0)}
          </Typography>
        </StyledTableCell>

        {/* ---- CHARGES (TDS + GST as recorded) ---- */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 13.5 }}>
            {fIndianCurrency(
              (Number(newRow?.TDS) || 0) + (Number(newRow?.GST) || 0)
            )}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            TDS {Number(newRow?.TDS) || 0} / GST{" "}
            {Number(newRow?.GST) ? Number(newRow.GST).toFixed(2) : 0}
          </Typography>
        </StyledTableCell>

        {/* ---- SERVICE ---- */}
        <StyledTableCell>
          <Typography sx={{ fontSize: 13.5, textTransform: "capitalize" }}>
            {newRow?.categoryName || "-"}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            {newRow?.transactionType}
          </Typography>
          {(newRow?.operator?.key1 || newRow?.vendorName) && (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {newRow?.operator?.key1 || newRow?.vendorName}
            </Typography>
          )}
        </StyledTableCell>

        {/* ---- STATUS ---- */}
        <StyledTableCell>
          <StatusPill status={newRow.status} />
        </StyledTableCell>

        {/* ---- MODE ---- */}
        <StyledTableCell>
          <ModeLabel mode={Number(newRow?.debit) > 0 ? "Debit" : "Credit"} />
        </StyledTableCell>
      </ReportRow>

      {/* real dropdown  */}

      {/*       
      <TableRow key={newRow._id}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expand} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6">Transaction Detail.</Typography>
              <Card>
                <Table size="medium" sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography>Role</Typography>
                      </TableCell>
                      {subTableLabels.map((column: any) => (
                        <TableCell key={column.id}>{column.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography>
                          {sentenceCase(newRow?.partnerDetails?.id?.role || "")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {fIndianCurrency(
                            newRow?.partnerDetails?.oldMainWalletBalance || "0"
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {fIndianCurrency(newRow?.amount || "0")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {fIndianCurrency(
                            newRow?.partnerDetails?.commissionAmount || "0"
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {fIndianCurrency(
                            newRow?.partnerDetails?.TDSAmount || "0"
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {fIndianCurrency(
                            newRow?.partnerDetails?.newMainWalletBalance || "0"
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}

      {/* popup of logs button */}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="vendor-call-history-title"
      >
        <ModalShell
          title="Vendor call history"
          subtitle={
            newRow?.clientRefId
              ? `Every exchange recorded for ${newRow.clientRefId}`
              : "Every exchange recorded for this transaction"
          }
          onClose={handleClose}
          width={1100}
          actions={
            <Button variant="outlined" color="inherit" onClick={handleClose}>
              Close
            </Button>
          }
        >
          {vendorCallsLoading ? (
            <LoadingState label="Loading vendor call history..." />
          ) : vendorCallsError ? (
            <EmptyState
              icon={<ErrorOutlineOutlinedIcon />}
              title="Could not load the vendor call history"
              description={vendorCallsError}
              action={
                <PageGhostButton
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={loadVendorCalls}
                >
                  Try again
                </PageGhostButton>
              }
            />
          ) : vendorCalls.length === 0 ? (
            <EmptyState
              title="No vendor calls recorded"
              description="Nothing was exchanged with a vendor for this transaction."
            />
          ) : (
            <Stack spacing={2}>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {vendorCalls.length}{" "}
                {vendorCalls.length === 1 ? "exchange" : "exchanges"}, oldest
                first.
              </Typography>

              {vendorCalls.map((item: any, index: number) => (
                <VendorCallEntry
                  key={item._id || index}
                  item={item}
                  onCopy={onCopy}
                />
              ))}
            </Stack>
          )}
        </ModalShell>
      </Modal>

      {/* end logs modal popup here*/}

      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="update-transaction-title"
      >
        <ModalShell
          title="Update transaction status"
          subtitle={
            newRow?.clientRefId
              ? `Manual override for ${newRow.clientRefId}`
              : "Manual override"
          }
          onClose={() => {
            handleClose1();
            reset(defaultValues);
          }}
          width={520}
        >
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(updateTransaction)}
          >
            {/* This writes the outcome by hand rather than asking the vendor.
                It lands in the vendor call history as a `manualUpdate` row, and
                unlike the payout check-status path it is deliberately NOT
                guarded against a concurrent settlement (backend A-013) - an
                admin override is where refusing a change is most likely to be
                wrong. Say so rather than letting it look like a status read. */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{
                mb: 2.5,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.warning.main, 0.08),
                border: (t) =>
                  `1px solid ${alpha(t.palette.warning.main, 0.28)}`,
              }}
            >
              <Iconify
                icon="eva:alert-triangle-fill"
                width={16}
                sx={{ color: "warning.dark", mt: 0.2, flexShrink: 0 }}
              />
              <Typography sx={{ fontSize: 12.5, color: "warning.darker" }}>
                This sets the outcome by hand instead of asking the vendor. It
                is recorded against your account in the vendor call history and
                cannot be undone from this screen.
              </Typography>
            </Stack>

            <Stack gap={2.5}>
              <RHFSelect
                name="updatedstatus"
                label="Status"
                placeholder="Status"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </RHFSelect>

              <RHFTextField
                name="vendorutr"
                label="Vendor UTR"
                helperText="The bank reference the vendor settled against."
              />
              <RHFTextField
                name="vendortxnid"
                label="Vendor transaction ID"
                helperText="The vendor's own ID for this transaction."
              />
              <RHFTextField
                name="remarks"
                label="Remarks"
                multiline
                rows={2}
                helperText="Why this is being set by hand. Kept with the record."
              />
            </Stack>

            <FormActions>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  handleClose1();
                  reset(defaultValues);
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
                disabled={!isValid}
              >
                Update transaction
              </LoadingButton>
            </FormActions>
          </FormProvider>
        </ModalShell>
      </Modal>
    </>
  );
});
