import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSettingsContext } from "src/components/settings";
//form
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDateRangePicker } from "src/components/date-range-picker";

import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  TooltipProps,
  Typography,
  Zoom,
  styled,
  tableCellClasses,
  tooltipClasses,
  useTheme,
} from "@mui/material";
import Iconify from "src/components/iconify/Iconify";
import Label from "src/components/label/Label";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { FileFilterButton } from "src/sections/reports/file";
import DateRangePicker from "src/components/date-range-picker/DateRangePicker";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import FundRequestTable from "src/sections/fundmanagement/FundRequestTable";
import { Helmet } from "react-helmet-async";
import { LoadingButton } from "@mui/lab";
import { TableNoData } from "src/components/table";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { sentenceCase } from "change-case";
import { Icon } from "@iconify/react";
import { CustomAvatar } from "src/components/custom-avatar";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import { token } from "stylis";

type FormValuesProps = {
  updatedstatus: string;
  vendorutr: string;
  remarks: string;
  vendortxnid: string;
  //filter txn
  searchBy: string;
  clientRefId: string;
  status: string;
  categoryId: string;
  transactionId: string;
  transactionType: string;
  User: string;
  agentId: string;
  distributorId: string;
  masterDistributorId: string;
  partnerId: string;
  startDate: string;
  endDate: string;
  productId: string;
  vendorUtrNumber: string;
  amount: string;
  usersearchby: string;
};

export default function FundReports() {
  const [valueTabs, setValueTabs] = useState(1);

  const tabs = [
    { id: 1, name: "Fund Request" },
    { id: 2, name: "Fund Flow" },
    { id: 3, name: "Settlement" },
  ];

  return (
    <Stack>
      <Tabs
        value={valueTabs}
        onChange={(event, newValue) => setValueTabs(newValue)}
        aria-label="basic tabs example"
      >
        {tabs.map((tab: any) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={<Typography variant="subtitle2">{tab.name}</Typography>}
          />
        ))}
      </Tabs>
      {valueTabs == 1 ? <FundRequest /> : <FundFlow />}
    </Stack>
  );
}

const FundRequest = React.memo(() => {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();

  const { mailId = "" } = params;

  const [appdata, setAppdata] = useState([]);
  const [rejdata, setRejdata] = useState([]);
  const [pendata, setPendata] = useState([]);

  const [applen, setApplen] = useState(0);
  const [penlen, setPenlen] = useState(0);
  const [rejlen, setRejlen] = useState(0);

  const [pageSize, setPageSize] = useState<number>(10);
  const [pageSizeApprove, setPageSizeApprove] = useState<number>(10);
  const [userList, setUserList] = useState([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [currentPageApprove, setCurrentPageApprove] = useState<any>(1);
  const [pageSizeRej, setPageSizeRej] = useState<number>(10);
  const [txnType, setTxnType] = useState([]);
  const [currentPageRej, setCurrentPageRej] = useState<any>(1);
  const [valueTabs, setvalueTabs] = React.useState(0);
  const [pro, setPro] = useState("go");

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
    endDate: string;
    startDate: string;
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
    startDate: "",
    endDate: "",
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

  const PendingList = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };

    Api(`admin/fundManagement/get_p_fnd_requests`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setPendata(Response.data.data);
            setPenlen(Response?.data?.count);
          } else {
            enqueueSnackbar(Response.data.err);
          }
        }
      }
    );
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
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setAppdata(Response.data.data);
          setApplen(Response?.data?.count);
        } else {
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
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setAppdata(Response.data.data);
          setApplen(Response?.data?.count);

          if (Response.data.code == 200 && Response?.data?.count == 0) {
            enqueueSnackbar("No Data Found");
          }
        } else {
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
      startDate: fDateFormatForApi(data.startDate),
      endDate: fDateFormatForApi(data.endDate),
      type: "",
    };

    Api(`admin/fundManagement/get_p_fnd_requests`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setPendata(Response.data.data);
            setPenlen(Response?.data?.count);

            if (Response.data.code == 200 && Response?.data?.count == 0) {
              enqueueSnackbar("No Data Found");
            }
          } else {
            enqueueSnackbar(Response.data.responseMessage);
          }
        }
      }
    );
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
          : getValues("partnerId"),

      utr: data.utrNumber,
      modeName: data.Paymentmode,
      modeId: "",
      mobileNumber: data.phoneNumber,
      amount: data.amount,
      remarks: data.remarks,
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
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setRejdata(Response.data.data);
          setRejlen(Response?.data?.count);

          if (Response.data.code == 200 && Response?.data?.count == 0) {
            enqueueSnackbar("No Data Found");
          }
        } else {
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
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setRejdata(Response.data.data);
          setRejlen(Response?.data?.count);
          // setWalletCount(Response?.data?.data?.count);
        } else {
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
  }, [watch("User")]);

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
      finalStatus: "approved",
    };
    {
      Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          } else {
          }
        }
      });
    }
  };

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

  const handdleClear = () => {
    reset();
    onChangeEndDate(null);
    onChangeStartDate(null);
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            fontSize: "20px",
          }}
        >
          <Tabs
            value={valueTabs}
            onChange={handleChangePanels}
            aria-label="basic tabs example"
          >
            <Tab
              style={{ fontSize: "20px", color: "#24c0ff" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:bell-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  New Requests
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginLeft: "5px" }}
                  >
                    {penlen ? penlen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(1)}
            />

            <Tab
              style={{ fontSize: "20px", color: "#00AB55" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:checkmark-circle-2-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  Approved
                  <Label
                    variant="soft"
                    color={"success"}
                    style={{ marginLeft: "5px" }}
                  >
                    {applen ? applen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(2)}
            />
            <Tab
              style={{ fontSize: "20px", color: "#FF3030" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:close-circle-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  Rejected
                  <Label
                    variant="soft"
                    color={"warning"}
                    style={{ marginLeft: "5px" }}
                  >
                    {rejlen ? rejlen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>
      </Box>

      <Scrollbar>
        <FormProvider
          methods={methods}
          onSubmit={
            valueTabs == 0
              ? handleSubmit(NewListFiler)
              : valueTabs == 1
              ? handleSubmit(ApprovedListFiler)
              : handleSubmit(RejListFiler)
          }
        >
          <Stack direction="row" gap={1} mt={2}>
            <Stack>
              <FileFilterButton
                isSelected={!!isSelectedValuePicker}
                startIcon={<Iconify icon="eva:calendar-fill" />}
                onClick={onOpenPicker}
              >
                {isSelectedValuePicker ? shortLabel : "Select Date"}
              </FileFilterButton>
              <DateRangePicker
                variant="input"
                title="Choose Maximum 31 Days"
                startDate={startDate}
                endDate={endDate}
                onChangeStartDate={onChangeStartDate}
                onChangeEndDate={onChangeEndDate}
                open={openPicker}
                onClose={onClosePicker}
                isSelected={isSelectedValuePicker}
                isError={isError}
                // additionalFunction={ExportData}
              />
            </Stack>

            <RHFTextField
              name="phoneNumber"
              label="Mobile"
              placeholder="Mobile"
              size="small"
            />
            <RHFSelect
              name="Paymentmode"
              label="Mode Of Payment"
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
              name="request_type"
              label="Request Type"
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
              <MenuItem value="agentId">Agent</MenuItem>
              <MenuItem value="distributorId">Distributor</MenuItem>
              <MenuItem value="masterDistributorId">
                Master Distributor
              </MenuItem>
              <MenuItem value="partnerId">Api User</MenuItem>
            </RHFSelect>

            {getValues("searchBy") == "agentId" ||
            getValues("searchBy") == "distributorId" ||
            getValues("searchBy") == "masterDistributorId" ||
            getValues("searchBy") == "partnerId" ? (
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
                  <MenuItem value={"email"}>Email</MenuItem>
                </RHFSelect> */}
                {watch("usersearchby") && (
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
                                    ? setValue("masterDistributorId", item._id)
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
            ) : null}

            <Button variant="contained" type="submit">
              Search
            </Button>
            <Button variant="contained" onClick={handdleClear}>
              Clear
            </Button>
          </Stack>
        </FormProvider>
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
                { id: "	mobile  ", label: " Mobile Number" },
                { id: "modeName", label: "Mode of Payment" },
                { id: "	bank_name", label: "Bank" },
                { id: "	Branch", label: "Branch" },
                { id: "referralCode", label: "	UTR" },
                { id: "	Charge", label: "Charge/Commission" },
                // { id: '	Commission', label: 'Commission' },
                { id: "	transactionSlip ", label: "	Deposit Slip " },
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
                { id: "	Remark", label: "Remark" },
                { id: "	transactionSlip ", label: "	Deposit Slip " },
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
                { id: "referralCode", label: "	UTR" },
                { id: "	transactionSlip ", label: "	Deposit Slip " },
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
});

const FundFlow = React.memo(() => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [sdata, setSdata] = useState([]);
  const [txnCount, setTxnCount] = useState(0);
  const [currentTab, setCurrentTab] = useState("");
  const [searchLoading, isSearchLoading] = useState(false);
  const [txnType, setTxnType] = useState([]);
  const [userList, setUserList] = useState([]);

  const tableLabels = [
    { id: "transaction_type", label: "Transaction Type" },
    { id: "userdetail", label: "From" },
    { id: "transactiondetail", label: "To" },
    { id: "Device_Info", label: "Device Info" },
    { id: "lat/long", label: "Lat/Long" },
    { id: "commission", label: "Amount" },
    { id: "Narration", label: "Narration" },
    { id: "status", label: "Status" },
  ];

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
  } = useDateRangePicker(new Date(), new Date());

  // Form Controller
  const FilterSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
    amount: Yup.string(),
  });
  const defaultValues = {
    searchBy: "",
    clientRefId: "",
    status: "",
    agentId: "",
    distributorId: "",
    masterDistributorId: "",
    partnerId: "",
    startDate: "",
    endDate: "",
    amount: "",
    usersearchby: "",
    User: "",
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
    formState: { errors, isSubmitting },
  } = methods;

  //Transaction List
  useEffect(() => {
    fundFlowTxn();
  }, [currentPage]);

  useEffect(() => setCurrentPage(1), [currentTab]);

  useEffect(() => {
    setValue("amount", "");
    setValue("clientRefId", "");
    setValue("productId", "");
    setValue("transactionId", "");
    setValue("transactionType", "");
    setValue("agentId", "");
    setValue("distributorId", "");
    setValue("masterDistributorId", "");
    setValue("partnerId", "");
    setValue("usersearchby", "");
    setValue("User", "");
  }, [watch("searchBy")]);

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
          : "API_User",
      searchInput: val,
      finalStatus: "approved",
    };
    val.length > 2 &&
      Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          } else {
          }
        }
      });
  };

  //Get All Transaction Once
  const fundFlowTxn = () => {
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
      startDate: getValues("searchBy") == "date" ? startDate : "",
      endDate: getValues("searchBy") == "date" ? endDate : "",
      amount: getValues("amount") || "",
    };
    Api(`adminTransaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setTxnCount(Response.data.data.totalNumberOfRecords);
            setCurrentTab("all");
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  //get Transaction by using Filter
  const searchTxnFilterData = async (data: FormValuesProps) => {
    setCurrentPage(1);
    isSearchLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: data.clientRefId,
      status: data.status,
      agentId: data.agentId,
      distributorId: data.distributorId,
      masterDistributorId: data.masterDistributorId,
      partnerId: data.partnerId,
      startDate: getValues("searchBy") == "date" ? startDate : "",
      endDate: getValues("searchBy") == "date" ? endDate : "",
      amount: data.amount,
    };
    await Api(
      `adminTransaction/fund_flow_transaction`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setSdata(Response.data.data.data);
          setTxnCount(Response.data.data.totalNumberOfRecords);
          setCurrentTab("");
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
        isSearchLoading(false);
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
        isSearchLoading(false);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title> Transactions | Shampay Admin </title>
      </Helmet>
      <Stack flexDirection={"row"} my={1}>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(searchTxnFilterData)}
        >
          <Stack flexDirection={"row"} gap={1}>
            <RHFSelect
              name="searchBy"
              label="Search By"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {/* <MenuItem value="date">Date Range</MenuItem>
              <MenuItem value="agentId">Agent</MenuItem>
              <MenuItem value="distributorId">Distributor</MenuItem>
              <MenuItem value="masterDistributorId">
                Master Distributor
              </MenuItem> */}
              <MenuItem value="partnerId">Api User</MenuItem>
            </RHFSelect>
            {getValues("searchBy") == "transactionType" ? (
              <RHFSelect
                name={getValues("searchBy")}
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
            ) : getValues("searchBy") == "date" ? (
              <Stack>
                <FileFilterButton
                  isSelected={!!isSelectedValuePicker}
                  startIcon={<Iconify icon="eva:calendar-fill" />}
                  onClick={onOpenPicker}
                >
                  {isSelectedValuePicker ? shortLabel : "Select Date"}
                </FileFilterButton>
                <DateRangePicker
                  variant="input"
                  title="Select Date Range to Search"
                  startDate={startDate}
                  endDate={endDate}
                  onChangeStartDate={onChangeStartDate}
                  onChangeEndDate={onChangeEndDate}
                  open={openPicker}
                  onClose={onClosePicker}
                  isSelected={isSelectedValuePicker}
                  isError={isError}
                  // additionalFunction={ExportData}
                />
              </Stack>
            ) : getValues("searchBy") == "agentId" ||
              getValues("searchBy") == "distributorId" ||
              getValues("searchBy") == "masterDistributorId" ||
              getValues("searchBy") == "partnerId" ? (
              <>
                {/* <RHFSelect
                  fullWidth
                  name="searchBy"
                  label="User"
                  size="small"
                  placeholder="User"
                  // sx={{ml:12}}
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
                                    ? setValue("masterDistributorId", item._id)
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
            ) : null}
            <RHFSelect
              name="status"
              label="Status"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_process">In process</MenuItem>
              <MenuItem value="hold">Hold</MenuItem>
              <MenuItem value="initiated">Initiated</MenuItem>
            </RHFSelect>

            <RHFTextField
              name="clientRefId"
              label="Transaction Id"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {userList.map((item: any) => {
                return (
                  <MenuItem key={item._id} value={item._id}>
                    {item?.clientRefId}
                  </MenuItem>
                );
              })}
            </RHFTextField>
            <RHFTextField
              name="amount"
              label="Amount"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {userList.map((item: any) => {
                return (
                  <MenuItem key={item._id} value={item._id}>
                    {item?.amount}
                  </MenuItem>
                );
              })}
            </RHFTextField>
            <LoadingButton
              size="medium"
              variant="contained"
              type="submit"
              loading={searchLoading}
            >
              Search
            </LoadingButton>
            <Button
              size="medium"
              variant="contained"
              onClick={() => {
                reset(defaultValues);
                fundFlowTxn();
              }}
            >
              Clear
            </Button>
          </Stack>
        </FormProvider>
      </Stack>

      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        <TableContainer component={Paper}>
          <Scrollbar sx={{ height: "fit-content" }}>
            <Table
              sx={{ minWidth: 720 }}
              stickyHeader
              size="small"
              aria-label="customized table"
            >
              <TableHead>
                <TableRow>
                  {tableLabels.map((column: any) => (
                    <TableCell key={column.id}>{column.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sdata.map((row: any) => (
                  <TransactionRow row={row} key={row._id} />
                ))}
              </TableBody>
            </Table>
            <TableNoData isNotFound={!sdata.length} />
          </Scrollbar>
        </TableContainer>

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
});

const TransactionRow = React.memo(({ row }: any) => {
  const { Api } = useAuthContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [loading, setLoading] = useState(false);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      whiteSpace: "nowrap",
    },
  }));
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));
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

  const { copy } = useCopyToClipboard();
  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  return (
    <>
      <StyledTableRow key={newRow._id}>
        <StyledTableCell>
          <Typography variant="body2">
            {" "}
            <strong> Txn Type </strong> : {newRow?.transactionType}
          </Typography>
          <Typography variant="body2">
            {" "}
            Transaction Id: {newRow?.clientRefId}{" "}
            <IconButton onClick={() => onCopy(`${newRow?.clientRefId}`)}>
              <Iconify icon="eva:copy-fill" width={20} />
            </IconButton>
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {fDateTime(newRow.createdAt)}
          </Typography>
        </StyledTableCell>
        {/* User Detail */}
        {newRow.transactionType.toLowerCase() !== "fund flow" ? (
          <StyledTableCell>
            <Stack direction="row" alignItems="center">
              <CustomAvatar
                name={newRow?.agentDetails?.id?.userName}
                alt={newRow?.agentDetails?.id?.userName}
                src={newRow?.agentDetails?.id?.selfie[0]}
              />
              <Box sx={{ ml: 2 }}>
                {newRow?.agentDetails?.id !== undefined ? (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="body2">
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <CustomWidthTooltip
                      title={
                        <>
                          <Stack flexDirection={"column"}>
                            <Typography variant="body2">
                              Name : {newRow?.distributorDetails?.id?.firstName}{" "}
                              {newRow?.distributorDetails?.id?.lastName}
                            </Typography>
                            <Typography variant="body2">
                              Role :{" "}
                              {newRow?.distributorDetails?.id?.role === "agent"
                                ? "Agent"
                                : newRow?.distributorDetails?.id?.role ===
                                  "distributor"
                                ? "Distributor"
                                : "Master Distributor"}
                            </Typography>
                            <Typography variant="body2">
                              UserCode :{" "}
                              {newRow?.distributorDetails?.id?.userCode}
                            </Typography>
                          </Stack>
                          <Divider />
                          <Stack flexDirection={"column"}>
                            <Typography variant="body2">
                              Name :{" "}
                              {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                              {newRow?.masterDistributorDetails?.id?.lastName}
                            </Typography>
                            <Typography variant="body2">
                              Role :{" "}
                              {newRow?.masterDistributorDetails?.id?.role ===
                              "agent"
                                ? "Agent"
                                : newRow?.masterDistributorDetails?.id?.role ===
                                  "distributor"
                                ? "Distributor"
                                : "Master Distributor"}
                            </Typography>
                            <Typography variant="body2">
                              UserCode :{" "}
                              {newRow?.masterDistributorDetails?.id?.userCode}
                            </Typography>
                          </Stack>
                        </>
                      }
                    >
                      <Icon
                        icon="ph:info-duotone"
                        width={20}
                        color={theme.palette.primary.main}
                      />
                    </CustomWidthTooltip>
                  </Stack>
                ) : (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="body2">
                      {newRow?.partnerDetails?.id?.firstName}{" "}
                      {newRow?.partnerDetails?.id?.lastName}
                    </Typography>
                  </Stack>
                )}
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Role:{" "}
                  {newRow?.agentDetails?.id === undefined
                    ? newRow?.partnerDetails?.id?.role
                    : newRow?.agentDetails?.id?.role}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  UserCode :{" "}
                  {newRow?.agentDetails?.id === undefined
                    ? newRow?.partnerDetails?.id?.userCode
                    : "NA"}
                </Typography>
                <Typography variant="body2">
                  {" "}
                  Transaction Id: {newRow?.clientRefId}{" "}
                </Typography>
              </Box>
            </Stack>
          </StyledTableCell>
        ) : (
          <StyledTableCell>
            {newRow?.agentDetails?.id &&
              newRow?.agentDetails?.id?._id ===
                newRow?.walletLedgerData?.from?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.agentDetails?.id?.firstName}
                    alt={newRow?.agentDetails?.id?.firstName}
                    src={newRow?.agentDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.agentDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode : {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.adminDetails?.id &&
              newRow?.adminDetails?.id?._id ===
                newRow?.walletLedgerData?.from?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <Stack gap={1}>
                    <Typography variant="body2">
                      {newRow?.adminDetails?.id?.email}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.distributorDetails?.id &&
              newRow?.distributorDetails?.id?._id ===
                newRow?.walletLedgerData?.from?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.distributorDetails?.id?.firstName}
                    alt={newRow?.distributorDetails?.id?.firstName}
                    src={newRow?.distributorDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.distributorDetails?.id?.firstName}{" "}
                      {newRow?.distributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.distributorDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode : {newRow?.distributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}

            {newRow?.masterDistributorDetails?.id &&
              newRow?.masterDistributorDetails?.id?._id ===
                newRow?.walletLedgerData?.from?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.masterDistributorDetails?.id?.firstName}
                    alt={newRow?.masterDistributorDetails?.id?.firstName}
                    src={newRow?.masterDistributorDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                      {newRow?.masterDistributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.masterDistributorDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode :{" "}
                      {newRow?.masterDistributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}

            {newRow?.partnerDetails?.id &&
              newRow?.partnerDetails?.id?._id ===
                newRow?.walletLedgerData?.from?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.partnerDetails?.id?.firstName}
                    alt={newRow?.partnerDetails?.id?.firstName}
                    src={newRow?.partnerDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.partnerDetails?.id?.firstName}{" "}
                      {newRow?.partnerDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.partnerDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode : {newRow?.partnerDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
          </StyledTableCell>
        )}

        {/* Transactional Detail */}
        {newRow.transactionType.toLowerCase() === "fund flow" ? (
          <StyledTableCell>
            {newRow?.agentDetails?.id &&
              newRow?.agentDetails?.id?._id ===
                newRow?.walletLedgerData?.to?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.agentDetails?.id?.firstName}
                    alt={newRow?.agentDetails?.id?.firstName}
                    src={newRow?.agentDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.agentDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode : {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.adminDetails?.id &&
              newRow?.adminDetails?.id?._id ===
                newRow?.walletLedgerData?.to?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <Stack gap={1}>
                    <Typography variant="body2">
                      {newRow?.adminDetails?.id?.email}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.distributorDetails?.id &&
              newRow?.distributorDetails?.id?._id ===
                newRow?.walletLedgerData?.to?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.distributorDetails?.id?.firstName}
                    alt={newRow?.distributorDetails?.id?.firstName}
                    src={newRow?.distributorDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.distributorDetails?.id?.firstName}{" "}
                      {newRow?.distributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.distributorDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode : {newRow?.distributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.masterDistributorDetails?.id &&
              newRow?.masterDistributorDetails?.id?._id ===
                newRow?.walletLedgerData?.to?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.masterDistributorDetails?.id?.firstName}
                    alt={newRow?.masterDistributorDetails?.id?.firstName}
                    src={newRow?.masterDistributorDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                      {newRow?.masterDistributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.masterDistributorDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode :{" "}
                      {newRow?.masterDistributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}

            {newRow?.partnerDetails?.id &&
              newRow?.partnerDetails?.id?._id ===
                newRow?.walletLedgerData?.to?.id && (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.partnerDetails?.id?.firstName}
                    alt={newRow?.partnerDetails?.id?.firstName}
                    src={newRow?.partnerDetails?.id?.selfie[0]}
                  />
                  <Stack>
                    <Typography variant="body2">
                      {newRow?.partnerDetails?.id?.firstName}{" "}
                      {newRow?.partnerDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2" whiteSpace={"nowrap"}>
                      {newRow?.partnerDetails?.id?.role}
                    </Typography>
                    <Typography variant="body2">
                      userCode : {newRow?.partnerDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
          </StyledTableCell>
        ) : (
          <StyledTableCell>
            <Typography variant="body2">
              {" "}
              Vendor Id : {newRow?.transactionId}{" "}
            </Typography>
            <Typography variant="body2">
              {" "}
              Vendor : {newRow?.vendorName}{" "}
            </Typography>
            <Typography variant="body2">
              {" "}
              UTR Number : {newRow?.vendorUtrNumber}
            </Typography>
          </StyledTableCell>
        )}

        {/* Device Info */}
        <StyledTableCell>
          <Typography variant="body2">
            {" "}
            Device Type : {newRow?.metaData?.deviceType}{" "}
          </Typography>
          <Typography variant="body2">
            {" "}
            IMEI : {newRow?.metaData?.imeiNumber || "NA"}{" "}
          </Typography>
          <Typography variant="body2">
            {" "}
            IP : {newRow?.metaData?.ipAddress}{" "}
          </Typography>
        </StyledTableCell>

        {/* Lat Long Type */}
        <StyledTableCell>
          <Typography variant="body2">
            {" "}
            Latitude : {newRow?.metaData?.lat}{" "}
          </Typography>
          <Typography variant="body2">
            {" "}
            Longitude : {newRow?.metaData?.long}{" "}
          </Typography>
        </StyledTableCell>

        {/* Amount */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">Txn Amt : {newRow?.amount}</Typography>
        </StyledTableCell>

        {/* Narration */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">
            Reason : {newRow?.walletLedgerData?.reason}
          </Typography>
          <Typography variant="body2">
            Remark : {newRow?.walletLedgerData?.remarks}
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
              (newRow?.status === "failed" && "error") ||
              ((newRow?.status === "pending" ||
                newRow?.status === "in_process") &&
                "warning") ||
              "success"
            }
            sx={{ textTransform: "capitalize" }}
          >
            {newRow?.status ? sentenceCase(newRow?.status) : ""}
          </Label>
        </StyledTableCell>
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
            p: 4,
            width: {
              xs: "75%",
              sm: "75%",
            },
          }}
        >
          <Scrollbar sx={{ maxHeight: 500 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ border: "solid #000" }}>Date</TableCell>
                  <TableCell sx={{ border: "solid #000" }}>
                    Transaction
                  </TableCell>
                  <TableCell
                    sx={{ border: "solid #000", whiteSpace: "nowrap" }}
                  >
                    Check Status By
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
                {row?.checkStatus?.map((item: any, index: number) => {
                  return (
                    <TableRow key={item._id}>
                      <TableCell align="left" sx={{ border: " solid #000" }}>
                        <Typography color={"text.secondary"} variant="body2">
                          {fDateTime(item.date)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ border: " solid #000", whiteSpace: "nowrap" }}
                      >
                        <Typography variant="subtitle1">
                          {index === 0 ? "Transaction" : "Check Status"}
                        </Typography>
                        <Typography variant="body2">
                          Device : {item?.deviceType}
                        </Typography>
                        <Typography variant="body2">
                          ip : {item?.ipAddress}
                        </Typography>
                        <Typography variant="body2">
                          latitude : {item?.lat}
                        </Typography>
                        <Typography variant="body2">
                          longitude : {item?.long}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ border: " solid #000", whiteSpace: "nowrap" }}
                      >
                        {index !== 0 ? (
                          <Stack direction="row" alignItems="center" gap={2}>
                            <CustomAvatar
                              name={item?.checkStatusDoneBy?.firstName}
                              alt={item?.checkStatusDoneBy?.firstName}
                              src={
                                item?.checkStatusDoneBy?.selfie &&
                                item?.checkStatusDoneBy?.selfie[0]
                              }
                            />
                            <Stack>
                              <Typography variant="body2">
                                {item?.checkStatusDoneBy?.firstName}{" "}
                                {item?.checkStatusDoneBy?.lastName}
                              </Typography>
                              <Typography variant="body2">
                                {item?.checkStatusDoneBy?.role === "agent"
                                  ? "Agent"
                                  : item?.checkStatusDoneBy?.role ===
                                    "distributor"
                                  ? "Distributor"
                                  : item?.checkStatusDoneBy?.role ===
                                    "m_distributor"
                                  ? "Master Distributor"
                                  : null}
                              </Typography>
                              <Typography variant="body2">
                                {item?.checkStatusDoneBy?.userCode}
                              </Typography>
                            </Stack>
                          </Stack>
                        ) : null}
                      </TableCell>

                      <TableCell align="left" sx={{ border: " solid #000" }}>
                        {item?.vendorApiRequest}
                      </TableCell>
                      <TableCell align="left" sx={{ border: " solid #000" }}>
                        {item?.vendorApiResponse}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Scrollbar>
          <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
            close
          </Button>
        </Box>
      </Modal>
    </>
  );
});
