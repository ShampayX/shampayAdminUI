import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
// @mui
import {
  Container,
  Card,
  Stack,
  Grid,
  Tabs,
  Tab,
  Badge,
  Button,
  Link,
  MenuItem,
  TextField,
} from "@mui/material";

import { Link as RouterLink, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";

import {
  Box,
  CardProps,
  Pagination,
  CardHeader,
  Typography,
  TableContainer,
} from "@mui/material";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import Iconify from "src/components/iconify";
import React from "react";
import { useSettingsContext } from "src/components/settings";
import Label from "src/components/label";
import { PATH_DASHBOARD } from "src/routes/paths";
// import { Label } from '@mui/icons-material';

import FundRequestTable from "./FundRequestTable";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import { FileFilterButton } from "../reports/file";
// import DateRangePicker from "src/components/date-range-picker/DateRangePicker";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";

import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import { LoadingButton } from "@mui/lab";
import MotionModal from "src/components/animate/MotionModal";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  KitTabs,
} from "src/components/page-kit";

// ----------------------------------------------------------------------

/** Tab label: icon + name + live count, tinted per state. */
function TabLabel({
  icon,
  text,
  count,
  tone,
}: {
  icon: string;
  text: string;
  count: number | string;
  tone: "info" | "success" | "error";
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Iconify icon={icon} width={16} />
      <Box component="span">{text}</Box>
      <Box
        component="span"
        sx={{
          px: 0.85,
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 700,
          lineHeight: "18px",
          color: `${tone}.dark`,
          backgroundColor: (t) => alpha(t.palette[tone].main, 0.16),
        }}
      >
        {count ? count : "0"}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------
type RowProps = {
  amount: string;
  Amount?: string | number;
  avg_amount?: number;
  isMoreThanAvg?: boolean;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function GeneralFilePage() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();

  const { mailId = "" } = params;

  const [appdata, setAppdata] = useState([]);
  const [rejdata, setRejdata] = useState([]);
  const [pendata, setPendata] = useState([]);
  const [holddata, setHolddata] = useState([]);

  const [applen, setApplen] = useState(0);
  const [penlen, setPenlen] = useState(0);
  const [rejlen, setRejlen] = useState(0);

  const [pageSize, setPageSize] = useState<number>(100);
  const [pageSizeApprove, setPageSizeApprove] = useState<number>(100);
  const [userList, setUserList] = useState([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [currentPageApprove, setCurrentPageApprove] = useState<any>(1);
  const [pageSizeRej, setPageSizeRej] = useState<number>(100);
  const [txnType, setTxnType] = useState([]);
  const [currentPageRej, setCurrentPageRej] = useState<any>(1);
  const [valueTabs, setvalueTabs] = React.useState(0);
  const [pro, setPro] = useState("go");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [bankList, setBankList] = useState([]);

  type FormValuesProps = {
    searchBy: string;
    // UserName: string;
    transactionType: string;
    phoneNumber: string;
    utrNumber: string;
    amount: string;
    remarks: string;
    Paymentmode: string;
    request_type: string;
    fundRequestId: string;
    usersearchby: string;
    User: string;
    agentId: string;
    distributorId: string;
    masterDistributorId: string;
    partnerId: string;
    endDate: Date | null;
    startDate: Date | null;
    BankName: string;
  };

  const FilterSchema = Yup.object().shape({
    UserName: Yup.string(),
  });

  const defaultValues = {
    searchBy: "",
    // UserName: "",
    transactionType: "",
    phoneNumber: "",
    utrNumber: "",
    amount: "",
    remarks: "",
    Paymentmode: "",
    request_type: "",
    fundRequestId: "",
    usersearchby: "",
    agentId: "",
    distributorId: "",
    masterDistributorId: "",
    partnerId: "",
    startDate: null,
    endDate: null,
    BankName: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    // defaultValues,
    defaultValues: {
      searchBy: "partnerId",
    },
  });

  const {
    reset,
    setError,
    setValue,
    watch,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);

  useEffect(() => {
    setValue("fundRequestId", "");
    setValue("agentId", "");
    setValue("distributorId", "");
    setValue("masterDistributorId", "");
    setValue("partnerId", "");
    setValue("usersearchby", "");
    setValue("User", "");
  }, [watch("searchBy")]);

  useEffect(() => {
    PendingList();
  }, [currentPage, pageSize]);

  useEffect(() => {
    ApprovedList();
  }, [currentPageApprove, pageSizeApprove]);
  useEffect(() => {
    RejectedList();
  }, [currentPageRej, pageSizeRej]);

  // Function to format amount in international style with proper spacing
  const formatAmountInternational = (amount: any) => {
    if (!amount) return "0";

    let numericValue;

    if (typeof amount === "string") {
      numericValue = parseFloat(amount.replace(/,/g, ""));
    } else {
      numericValue = amount;
    }

    if (isNaN(numericValue)) return amount;

    // Format to international style (420,000 instead of 4,20,000)
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatTableData = (data: any) => {
    return data.map((item: any) => ({
      ...item,
      amount: formatAmountInternational(item.amount),
    }));
  };

  const PendingList = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };

    Api(
      `admin/fundManagement/get_pending_fund_requests`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======New Request==response=====>", Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setPendata(Response.data.data);
          setPenlen(Response?.data?.count);

          console.log(
            "======getUser===data.data udata====>",
            Response.data.data
          );
        } else {
          enqueueSnackbar(Response.data.err);
        }
      }
    });
  };

  const ApprovedList = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSizeApprove,
        currentPage: currentPageApprove,
      },
    };

    Api(
      `admin/fundManagement/get_approved_fund_requests`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setAppdata(Response.data.data);
          setApplen(Response?.data?.count);
          handleClose();
          console.log(
            "======ApprovedList===data.data udata====>",
            Response.data.data
          );
        } else {
          console.log("======ApprovedList=Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
  };

  const ApprovedListFiler = (data: FormValuesProps) => {
    setAppdata([]);

    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSizeApprove,
        currentPage: currentPageApprove,
      },
      bankName: "",
      bankId: "",
      userId:
        getValues("searchBy") == "agentId"
          ? getValues("agentId")
          : getValues("searchBy") == "distributorId"
          ? getValues("distributorId")
          : getValues("searchBy") == "masterDistributorId"
          ? getValues("masterDistributorId")
          : getValues("partnerId"),

      utr: data.utrNumber,
      modeName: data.Paymentmode,
      modeId: "",
      mobileNumber: data.phoneNumber,
      amount: data.amount,
      remarks: data.remarks,
      BankName: data.BankName,
      startDate: fDateFormatForApi(data.startDate),
      endDate: fDateFormatForApi(data.endDate),
      type: "",
    };

    Api(
      `admin/fundManagement/get_approved_fund_requests`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setAppdata(Response.data.data);
          setApplen(Response?.data?.count);
          handleClose();
          console.log(
            "======ApprovedList===data.data udata====>",
            Response.data.data
          );

          if (Response.data.code == 200 && Response?.data?.count == 0) {
            enqueueSnackbar("No Data Found");
          }
        } else {
          console.log("======ApprovedList=Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
  };

  const NewListFiler = (data: FormValuesProps) => {
    setPendata([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSizeApprove,
        currentPage: currentPageApprove,
      },
      bankName: "",
      bankId: "",
      userId:
        getValues("searchBy") == "agentId"
          ? getValues("agentId")
          : getValues("searchBy") == "distributorId"
          ? getValues("distributorId")
          : getValues("searchBy") == "masterDistributorId"
          ? getValues("masterDistributorId")
          : getValues("partnerId"),

      utr: data.utrNumber,
      modeName: data.Paymentmode,
      modeId: "",
      mobileNumber: data.phoneNumber,
      amount: data.amount,
      remarks: data.remarks,
      BankName: data.BankName,
      startDate: fDateFormatForApi(data.startDate),
      endDate: fDateFormatForApi(data.endDate),
      type: "",
    };

    Api(
      `admin/fundManagement/get_pending_fund_requests`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setPendata(Response.data.data);
          setPenlen(Response?.data?.count);
          handleClose();
          console.log(
            "======ApprovedList===data.data udata====>",
            Response.data.data
          );
          if (Response.data.code == 200 && Response?.data?.count == 0) {
            enqueueSnackbar("No Data Found");
          }
        } else {
          console.log("======ApprovedList=Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
  };

  const RejListFiler = (data: FormValuesProps) => {
    setRejdata([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSizeApprove,
        currentPage: currentPageApprove,
      },
      bankName: "",
      bankId: "",
      userId:
        getValues("searchBy") == "agentId"
          ? getValues("agentId")
          : getValues("searchBy") == "distributorId"
          ? getValues("distributorId")
          : getValues("searchBy") == "masterDistributorId"
          ? getValues("masterDistributorId")
          : getValues("searchBy") == "partnerId"
          ? getValues("partnerId")
          : "",

      utr: data.utrNumber,
      modeName: data.Paymentmode,
      modeId: "",
      mobileNumber: data.phoneNumber,
      amount: data.amount,
      remarks: data.remarks,
      BankName: data.BankName,
      startDate: fDateFormatForApi(data.startDate),
      endDate: fDateFormatForApi(data.endDate),
      type: "",
    };

    Api(
      `admin/fundManagement/get_rejected_fund_requests`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setRejdata(Response.data.data);
          setRejlen(Response?.data?.count);
          handleClose();
          console.log(
            "======ApprovedList===data.data udata====>",
            Response.data.data
          );
          if (Response.data.code == 200 && Response?.data?.count == 0) {
            enqueueSnackbar("No Data Found");
          }
        } else {
          console.log("======ApprovedList=Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
  };

  const RejectedList = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSizeRej,
        currentPage: currentPageRej,
      },
    };
    Api(
      `admin/fundManagement/get_rejected_fund_requests`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======RejectedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setRejdata(Response.data.data);
          setRejlen(Response?.data?.count);
          handleClose();

          // setWalletCount(Response?.data?.data?.count);
          console.log("======RejectedList===data.data udata====>", rejdata);
        } else {
          console.log("======RejectedList==Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
  };

  useEffect(() => {
    if (getValues("searchBy") == "agentId") searchFromUser(getValues("User"));
    if (getValues("searchBy") == "distributorId")
      searchFromUser(getValues("User"));
    if (getValues("searchBy") == "masterDistributorId")
      searchFromUser(getValues("User"));
    if (getValues("searchBy") == "partnerId") searchFromUser(getValues("User"));
  }, [watch("User")]);

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
          : getValues("searchBy") == "partnerId"
          ? "API_User"
          : "",
      searchInput: val,
      // finalStatus: "approved",
      finalStatus: watch("searchBy") !== "partnerId" ? "approved" : "",
    };
    {
      Api(`admin/search_user`, "POST", body, "").then((Response: any) => {
        console.log("======get_CategoryList==response=====>" + Response);
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          } else {
            console.log("======get_CategoryList=======>" + Response);
          }
        }
      });
    }
  };

  const getBankList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/fundManagement/get_banks` + "", "GET", "", token).then(
      (Response: any) => {
        console.log("======BankList==response=====>", Response);
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setBankList(Response.data.data);
            console.log(
              "======BankList===data.data 200====>",
              Response.data.data
            );
          } else {
            console.log("======BankList=======>" + Response);
          }
        }
      }
    );
  };

  useEffect(() => {
    getBankList();
  }, []);

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box style={{ padding: "24px 0" }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    reset();
    onChangeEndDate(null);
    onChangeStartDate(null);
    setvalueTabs(newValue);
    if (newValue == 0) {
      PendingList();
    } else if (newValue == 1) {
      ApprovedList();
    } else if (newValue == 2) {
      RejectedList();
    }
  };

  const updateDataTable = (status: any) => {
    if (status == "Rejected") {
      RejectedList();
    } else if (status == "Approved") {
      ApprovedList();
    }
  };

  const handleDataFromChild = (data: any, val: any) => {
    let filterdata = pendata.filter((item: any) => {
      return item._id !== data;
    });
    setPendata(filterdata);
    let arr: any = [];
    if (val == "approved") {
      arr = [...appdata];
      arr.push(data);
      setAppdata(arr);
      setApplen(applen + 1);
      setPenlen(penlen - 1);
    } else if (val == "rejected") {
      arr = [...rejdata];
      arr.push(data);
      setRejdata(arr);
      setRejlen(rejlen + 1);
      setPenlen(penlen - 1);
    } else {
    }
  };
  const handleReset = () => {
    reset();
    onChangeEndDate(null);
    onChangeStartDate(null);
    RejectedList();
    ApprovedList();
    PendingList();
  };

  return (
    <>
      <PageHeader
        title="Fund Requests"
        subtitle="Deposits raised by the network, waiting on approval."
        actions={
          <>
            <PageGhostButton
              startIcon={<Iconify icon="bx:reset" />}
              onClick={handleReset}
            >
              Reset
            </PageGhostButton>
            <PageActionButton
              startIcon={<Iconify icon="icon-park-outline:filter" />}
              onClick={handleOpen}
            >
              Filter
            </PageActionButton>
          </>
        }
      />

      <KitTabs value={valueTabs} onChange={handleChangePanels}>
        <Tab
          label={
            <TabLabel
              icon="eva:bell-fill"
              text="New Requests"
              count={penlen}
              tone="info"
            />
          }
          {...a11yProps(1)}
        />
        <Tab
          label={
            <TabLabel
              icon="eva:checkmark-circle-2-fill"
              text="Approved"
              count={applen}
              tone="success"
            />
          }
          {...a11yProps(2)}
        />
        <Tab
          label={
            <TabLabel
              icon="eva:close-circle-fill"
              text="Rejected"
              count={rejlen}
              tone="error"
            />
          }
          {...a11yProps(3)}
        />
      </KitTabs>
      <Scrollbar>
        <MotionModal
          open={open}
          onClose={handleClose}
          width={{ xs: "95%", sm: 500 }}
        >
          {/* <Box> */}
          <FormProvider
            methods={methods}
            onSubmit={
              valueTabs == 0
                ? handleSubmit(NewListFiler)
                : valueTabs == 1
                ? handleSubmit(ApprovedListFiler)
                : valueTabs == 2
                ? handleSubmit(RejListFiler)
                : handleSubmit(RejListFiler)
            }
          >
            <Stack gap={1}>
              <Stack direction={"row"} gap={1}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start date"
                    inputFormat="DD/MM/YYYY"
                    value={watch("startDate")}
                    maxDate={new Date()}
                    onChange={(newValue: any) =>
                      setValue("startDate", newValue)
                    }
                    renderInput={(params: any) => (
                      <TextField {...params} size={"small"} />
                    )}
                  />
                  <DatePicker
                    label="End date"
                    inputFormat="DD/MM/YYYY"
                    value={watch("endDate")}
                    minDate={watch("startDate")}
                    maxDate={new Date()}
                    onChange={(newValue: any) => setValue("endDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField {...params} size={"small"} />
                    )}
                  />
                </LocalizationProvider>
              </Stack>

              <RHFTextField
                name="phoneNumber"
                label="Mobile"
                placeholder="Mobile"
                size="small"
              />
              <RHFSelect
                name="Paymentmode"
                label="Mode "
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="NEFT">NEFT</MenuItem>
                <MenuItem value="RTGS">RTGS</MenuItem>
                <MenuItem value="hold">IMPS</MenuItem>
                <MenuItem value="Cash deposit at CDM">
                  Cash deposit at CDM
                </MenuItem>
                <MenuItem value="Fund Transfer">Fund Transfer</MenuItem>
                <MenuItem value="Cash deposit at branch">
                  Cash deposit at branch
                </MenuItem>
              </RHFSelect>
              <RHFSelect
                name="BankName"
                label="BankName"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {bankList.map((item: any) => (
                  <MenuItem value={item?._id}>
                    {item?.bank_details.bank_name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                name="request_type"
                label="Req. Type"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="mannual">Mannual</MenuItem>
                <MenuItem value="auto collect">Auto Collect</MenuItem>
              </RHFSelect>

              <RHFTextField
                name="utrNumber"
                label=" UTR"
                placeholder="UTR"
                size="small"
              />
              <RHFTextField
                name="amount"
                label="amount"
                placeholder="amount"
                size="small"
              />
              <RHFTextField
                name="remarks"
                label="Remarks"
                placeholder="Remarks"
                size="small"
              />

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

              {
                // getValues("searchBy") == "agentId" ||
                // getValues("searchBy") == "distributorId" ||
                // getValues("searchBy") == "masterDistributorId" ||
                getValues("searchBy") == "partnerId" ? (
                  <>
                    {/* <RHFSelect
                    fullWidth
                    name="searchBy"
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
                    <MenuItem value={"email"}>Email</MenuItem>
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
                            top: 40,
                            zIndex: 9,
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
                                      ? `${item.firstName} ${item.lastName} (${item.userCode})`
                                      : `${item.firstName} ${item.lastName}`}
                                  </Typography>
                                );
                              })}
                          </Scrollbar>
                        </Stack>
                      </Stack>
                    )}
                  </>
                ) : !!getValues("searchBy") ? (
                  <RHFTextField
                    name={getValues("searchBy")}
                    placeholder={"Type here..."}
                  />
                ) : null
              }
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent="flex-end"
              gap={1.5}
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <PageGhostButton onClick={handleClose}>Cancel</PageGhostButton>
              <PageGhostButton
                startIcon={<Iconify icon="bx:reset" />}
                onClick={handleReset}
              >
                Reset
              </PageGhostButton>
              <PageActionButton type="submit" disabled={isSubmitting}>
                Apply
              </PageActionButton>
            </Stack>
          </FormProvider>
          {/* </Box> */}
        </MotionModal>

        <TabPanel value={valueTabs} index={0}>
          <Grid item xs={6} md={3} lg={4}>
            <FundRequestTable
              tab={valueTabs}
              tableData={pendata}
              updtatedData={updateDataTable}
              sendDataToParent={handleDataFromChild}
              tableLabels={[
                { id: "	date_of_deposit", label: "Date & Time" },
                { id: "	userName", label: "User Name" },
                { id: "	amount ", label: "Amount" },
                // { id: 'role', label: 'User Type' },
                // { id: "	amountwords  ", label: " Amount in Words" },
                { id: "	mobile  ", label: " Mobile Number" },
                { id: "modeName", label: "Mode of Payment" },
                { id: "	bank_name", label: "Bank" },
                { id: "	Branch", label: "Branch" },
                { id: "referralCode", label: "	UTR" },
                { id: "	Charge", label: "Charge/Commission" },
                // { id: '	Commission', label: 'Commission' },
                // { id: "	transactionSlip ", label: "	Deposit Slip " },
                { id: "remark", label: " Patner's Remarks" },
                { id: "	 ", label: "Action" },
              ]}
            />

            <CustomPagination
              page={currentPage - 1}
              count={penlen}
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
        </TabPanel>
        <TabPanel value={valueTabs} index={3}>
          <Grid item xs={6} md={3} lg={4}>
            <FundRequestTable
              tab={valueTabs}
              tableData={holddata}
              updtatedData={updateDataTable}
              sendDataToParent={handleDataFromChild}
              tableLabels={[
                { id: "	date_of_deposit", label: "Date & Time" },
                { id: "	userName", label: "User Name" },
                { id: "	amount ", label: "Amount" },
                // { id: 'role', label: 'User Type' },
                { id: "	mobile  ", label: " Mobile Number" },
                { id: "modeName", label: "Mode of Payment" },
                { id: "	bank_name", label: "Bank" },
                { id: "	Branch", label: "Branch" },
                { id: "referralCode", label: "	UTR" },
                { id: "	Charge", label: "Charge/Commission" },
                // { id: '	Commission', label: 'Commission' },
                // { id: "	transactionSlip ", label: "	Deposit Slip " },
                { id: "remark", label: " Patner's Remarks" },
                { id: "	 ", label: "Action" },
              ]}
            />

            {/* <CustomPagination
              page={currentPageHold - 1}
              count={holdlen}
              onPageChange={(
                event: React.MouseEvent<HTMLButtonElement> | null,
                newPage: number
              ) => {
                setCurrentPageHold(newPage + 1);
              }}
              rowsPerPage={pageSizeHold}
              onRowsPerPageChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                setPageSizeHold(parseInt(event.target.value));
                setCurrentPageHold(1);
              }}
            /> */}
          </Grid>
        </TabPanel>

        <TabPanel value={valueTabs} index={1}>
          <Grid item xs={12} md={6} lg={8}>
            <FundRequestTable
              tab={valueTabs}
              tableData={appdata}
              updtatedData={updateDataTable}
              sendDataToParent={handleDataFromChild}
              tableLabels={[
                { id: "	date_of_deposit", label: "Date & Time" },
                { id: "	userName", label: "User Name" },
                { id: "	amount ", label: "Amount" },
                { id: "	mobile  ", label: " Mobile Number" },
                { id: "modeName", label: "Mode of Payment" },
                { id: "	bank_name", label: "Bank" },
                { id: "	Branch", label: "Branch" },
                { id: "referralCode", label: "UTR" },
                // { id: "	transactionSlip ", label: "	Deposit Slip " },
                { id: "remark", label: " Patner's Remarks" },
                { id: "Remark", label: "Remark" },
              ]}
            />

            <CustomPagination
              page={currentPageApprove - 1}
              count={applen}
              onPageChange={(
                event: React.MouseEvent<HTMLButtonElement> | null,
                newPage: number
              ) => {
                setCurrentPageApprove(newPage + 1);
              }}
              rowsPerPage={pageSizeApprove}
              onRowsPerPageChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                setPageSizeApprove(parseInt(event.target.value));
                setCurrentPageApprove(1);
              }}
            />
          </Grid>
        </TabPanel>
        <TabPanel value={valueTabs} index={2}>
          <Grid item xs={12} md={6} lg={8}>
            <FundRequestTable
              tab={valueTabs}
              tableData={rejdata}
              updtatedData={updateDataTable}
              sendDataToParent={handleDataFromChild}
              tableLabels={[
                { id: "	date_of_deposit", label: "Date & Time" },
                { id: "	userName", label: "User Name" },
                { id: "	amount ", label: "Amount" },
                { id: "	mobile  ", label: " Mobile Number" },
                { id: "modeName", label: "Mode of Payment" },
                { id: "	bank_name", label: "Bank" },
                { id: "	Branch", label: "Branch" },
                { id: "referralCode", label: "UTR" },
                // { id: "	transactionSlip ", label: "Deposit Slip" },
                { id: "remark", label: " Patner's Remarks" },
                { id: "Reason", label: "Reason" },
              ]}
            />

            <CustomPagination
              page={currentPageRej - 1}
              count={rejlen}
              onPageChange={(
                event: React.MouseEvent<HTMLButtonElement> | null,
                newPage: number
              ) => {
                setCurrentPageRej(newPage + 1);
              }}
              rowsPerPage={pageSizeRej}
              onRowsPerPageChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                setPageSizeRej(parseInt(event.target.value));
                setCurrentPageRej(1);
              }}
            />
          </Grid>
        </TabPanel>
      </Scrollbar>
    </>
  );
}
function gotoPage() {
  throw new Error("Function not implemented.");
}
