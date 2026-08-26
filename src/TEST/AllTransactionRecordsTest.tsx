import { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import {
  Box,
  Table,
  Avatar,
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
import { useDateRangePicker } from "src/components/date-range-picker";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { fDate, fDateTime } from "src/utils/formatTime";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { fIndianCurrency } from "src/utils/formatNumber";
import useResponsive from "src/hooks/useResponsive";
import { TableNoData } from "src/components/table";

//date picker
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import {
  TRANSACTION_RANGE_MONTHS,
  transactionMinDate,
  transactionMaxDate,
  transactionEndMinDate,
  transactionEndMaxDate,
  clampToTransactionWindow,
} from "src/sections/reports/components/transactionDateRange";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type FormValuesProps = {
  //txn row
  updatedstatus: string;
  vendorutr: string;
  remarks: string;
  vendortxnid: string;
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
  operator: string;
  key1: string;
  key2: string;
  key3: string;
  startDate: Date | null;
  endDate: Date | null;
};

export default function AllTransactionRecords() {
  const { Api } = useAuthContext();
  const isDesktop = useResponsive("up", "sm");
  const { enqueueSnackbar } = useSnackbar();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [sdata, setSdata] = useState([]);
  const [isTxnFound, setIsTxnFound] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [txnType, setTxnType] = useState([]);
  const [userList, setUserList] = useState([]);
  const [filterdValue, setFilterdValue] = useState<any>([]);

  //filter modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const tableLabels = [
    { id: "userdetail", label: "User Detail" },
    { id: "transactiondetail", label: "Transaction Detail" },
    { id: "Device_Info", label: "Device Info" },
    { id: "transaction_type", label: "Transaction Type" },
    { id: "Operator", label: "Operator" },
    { id: "moneyTransferSenderId", label: "Sender/Beneficiary Detail" },
    { id: "Commission", label: "Commission" },
    { id: "gst", label: "GST/TDS" },
    { id: "commission", label: "Amount" },
    { id: "debit", label: "Debit/Credit" },
    { id: "status", label: "Status" },
    { id: "Actiob", label: "Action" },
  ];

  // Form Controller
  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    searchBy: "",
    clientRefId: "",
    status: "",
    category: {
      categoryName: "",
      categoryId: "",
    },
    transactionId: "",
    transactionType: "",
    agentId: "",
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
    User: "",
    operator: "",
    key1: "",
    key2: "",
    key3: "",
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
    resetField,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getCategoryList();
    getTxnType();
  }, []);

  //handle transactions
  useEffect(() => {
    getTransaction();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (getValues("searchBy") == "agentId") searchFromUser(getValues("User"));
    if (getValues("searchBy") == "distributorId")
      searchFromUser(getValues("User"));
    if (getValues("searchBy") == "masterDistributorId")
      searchFromUser(getValues("User"));
    if (getValues("searchBy") == "partnerId") searchFromUser(getValues("User"));
  }, [watch("User")]);

  const getProductlist = useCallback(
    (val: string) => {
      let token = localStorage.getItem("token");
      Api(`product/get_ProductList/${val}`, "GET", "", token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              setProductList(Response.data.data);
            } else {
            }
          }
        }
      );
    },
    [watch("category.categoryId")]
  );

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setCategoryList(Response.data.data);
        }
      }
    });
  };

  const getTxnType = () => {
    let token = localStorage.getItem("token");
    Api(`adminTransaction/transactionTypes`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setTxnType(Response.data.data);
          }
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
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          } else {
          }
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
      categoryId: getValues("category.categoryId") || "",
      transactionId: getValues("transactionId") || "",
      transactionType: getValues("transactionType") || "",
      agentId: getValues("agentId") || "",
      distributorId: getValues("distributorId") || "",
      masterDistributorId: getValues("masterDistributorId") || "",
      partnerId: getValues("partnerId") || "",
      startDate: dayjs(getValues("startDate")).add(1, "day"),
      endDate: dayjs(getValues("endDate")).add(1, "day"),
      productId: getValues("product.productId") || "",
      vendorUtrNumber: getValues("vendorUtrNumber") || "",
      amount: getValues("amount") || "",
      key1: getValues("key1") || "",
      key2: getValues("key2") || "",
      key3: getValues("key3") || "",
    };
    Api(`adminTransaction/get_transaction_test`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setTxnCount(Response.data.data.totalNumberOfRecords);
          } else {
            enqueueSnackbar(Response.data.message);
          }
          setIsTxnFound(false);
        } else {
          setIsTxnFound(false);
          enqueueSnackbar("Failed to Load");
        }
      }
    );
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
        clientRefId: data.clientRefId,
        status: data.status,
        categoryId: data.category.categoryId,
        transactionId: data.transactionId,
        transactionType: data.transactionType,
        agentId: data.agentId,
        distributorId: data.distributorId,
        masterDistributorId: data.masterDistributorId,
        partnerId: data.partnerId,
        startDate: dayjs(data.startDate).add(1, "day"),
        endDate: dayjs(data.endDate).add(1, "day"),
        productId: data.product.productId,
        vendorUtrNumber: data.vendorUtrNumber,
        amount: data.amount,
        key1: data.key1,
        key2: data.key2,
        key3: data.key3,
      };
      await Api(
        `adminTransaction/get_transaction_test`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setTxnCount(Response.data.data.totalNumberOfRecords);
            filterData(data);
            handleClose();
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
        }
      });
    } catch (err) {}
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "100%", md: "50%" },
    bgcolor: "#ffffff",
    borderRadius: 2,
    p: 4,
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
          : !elem.endsWith("Id") &&
            arr.push({
              key: elem,
              value: elem.endsWith("Date") ? fDate(val[elem]) : val[elem],
            });
      }
    }

    setFilterdValue(arr);
  };

  /**
   * Transaction reports only cover a rolling 3-month window - see
   * src/sections/reports/components/transactionDateRange. Values are pinned
   * into that window here because typing into the field bypasses the disabled
   * calendar days, and a "to" date left behind by a newer "from" is dropped.
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
      resetField("agentId");
      resetField("distributorId");
      resetField("masterDistributorId");
      resetField("partnerId");
      resetField("searchBy");
      resetField("usersearchby");
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

  return (
    <>
      <Helmet>
        <title> Transactions | Shampay Admin </title>
      </Helmet>
      <Stack
        flexDirection={"row"}
        justifyContent={isDesktop ? "space-between" : "end"}
        gap={1}
        mb={1}
      >
        <Stack flexDirection={"row"} m={1} gap={1}>
          {filterdValue.length > 0 &&
            filterdValue.map((item: any) => {
              return (
                item.value && (
                  <Chip
                    key={item.key}
                    label={item.value}
                    onDelete={() => handleDelete(item.key)}
                  />
                )
              );
            })}
        </Stack>

        <Stack flexDirection={"row"} gap={1}>
          <Button variant="contained" onClick={handleReset}>
            <Iconify icon="bx:reset" color={"common.white"} mr={1} />
            Reset
          </Button>
          <Button variant="contained" onClick={handleOpen}>
            <Iconify
              icon="icon-park-outline:filter"
              color={"common.white"}
              mr={1}
            />{" "}
            Filter
          </Button>
        </Stack>
      </Stack>
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
            <Scrollbar sx={{ maxHeight: 500 }}>
              <Stack m={1} gap={1}>
                <Grid
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
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
                            ? "Bank Name"
                            : getValues(
                                "category.categoryName"
                              ).toLowerCase() == "recharges" ||
                              getValues(
                                "category.categoryName"
                              ).toLowerCase() == "bill payment"
                            ? "Operator Name"
                            : "key1"
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
                            : "key2"
                        }
                      />
                      {(getValues("category.categoryName").toLowerCase() !=
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
                      )}
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

                <Stack flexDirection={"row"} gap={1}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      inputFormat="DD/MM/YYYY"
                      value={watch("startDate")}
                      minDate={transactionMinDate()}
                      maxDate={transactionMaxDate()}
                      components={{ OpenPickerIcon: CalendarMonthRoundedIcon }}
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
                      components={{ OpenPickerIcon: CalendarMonthRoundedIcon }}
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
                    <MenuItem value="agentId">Agent</MenuItem>
                    <MenuItem value="distributorId">Distributor</MenuItem>
                    <MenuItem value="masterDistributorId">
                      Master Distributor
                    </MenuItem>
                    <MenuItem value="partnerId">Api User</MenuItem>
                  </RHFSelect>
                  {watch("searchBy") && (
                    <>
                      <RHFSelect
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
                        {getValues("searchBy") == "partnerId" ? (
                          <>
                            <MenuItem value={"userCode"}>User Code</MenuItem>
                            <MenuItem value={"firstName"}>First Name</MenuItem>
                            <MenuItem value={"contact_no"}>
                              Contact Number
                            </MenuItem>
                            <MenuItem value={"email"}>Email</MenuItem>{" "}
                          </>
                        ) : (
                          <MenuItem value={"firstName"}>First Name</MenuItem>
                        )}
                      </RHFSelect>
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
                  )}
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

      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        {isTxnFound ? (
          <ApiDataLoading />
        ) : (
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

const TransactionRow = React.memo(({ row }: any) => {
  const { Api } = useAuthContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);

  //modal for request response
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  const checkStatus = (val: any) => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let rowFor = val;
    Api(
      rowFor.categoryName.toLowerCase() == "money transfer"
        ? `admin/moneyTransfer/transaction/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "recharges"
        ? `agents/v1/checkStatus/` + rowFor._id
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
        `admin/${
          rowFor == "dmt2" ? "dmt2" : "moneytransfer"
        }/transaction/update`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            handleClose1();
            setNewRow({ ...newRow, status: Response.data.data.status });
          } else {
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar("Failed to Update");
        }
      });
    } catch (err) {}
  };

  const copyToClipboard = (str: any) => {
    enqueueSnackbar("Copied");
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(str);
    return Promise.reject("The Clipboard API is not available.");
  };

  return (
    <>
      <TableRow key={newRow._id} hover>
        {/* User Detail */}
        {newRow.transactionType.toLowerCase() !== "fund flow" ? (
          <TableCell>
            <Stack direction="row" alignItems="center">
              <Avatar
                alt={newRow?.agentDetails?.id?.userName}
                src={AwsDocSign(newRow?.agentDetails?.id?.selfie[0] || "")}
              />
              <Box sx={{ ml: 2 }}>
                {newRow?.agentDetails?.id !== undefined ? (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.partnerDetails?.id?.firstName}{" "}
                      {newRow?.partnerDetails?.id?.lastName}
                    </Typography>
                  </Stack>
                )}
                <Typography
                  whiteSpace={"nowrap"}
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  Role:{" "}
                  {newRow?.agentDetails?.id === undefined
                    ? newRow?.partnerDetails?.id?.role
                    : newRow?.agentDetails?.id?.role}
                </Typography>
                <Typography
                  whiteSpace={"nowrap"}
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  UserCode :{" "}
                  {newRow?.agentDetails?.id === undefined
                    ? "NA"
                    : newRow?.agentDetails?.id?.userCode}
                </Typography>
                <Typography whiteSpace={"nowrap"} variant="body2">
                  {" "}
                  Transaction Id : {newRow?.clientRefId}{" "}
                </Typography>
              </Box>
            </Stack>
          </TableCell>
        ) : (
          <TableCell>
            {newRow?.agentDetails?.id &&
              newRow?.agentDetails?.id?._id ===
                newRow?.walletLedgerData?.from && (
                <Stack flexDirection={"row"} gap={1}>
                  <Avatar
                    alt={newRow?.agentDetails?.id?.userName}
                    src={newRow?.agentDetails?.id?.selfie[0]}
                  />
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.agentDetails?.id?.role}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      userCode : {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.adminDetails?.id &&
              newRow?.adminDetails?.id?._id ===
                newRow?.walletLedgerData?.from && (
                <Stack flexDirection={"row"} gap={1}>
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.adminDetails?.id?.email}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.distributorDetails?.id &&
              newRow?.distributorDetails?.id?._id ===
                newRow?.walletLedgerData?.from && (
                <Stack flexDirection={"row"} gap={1}>
                  <Avatar
                    alt={newRow?.distributorDetails?.id?.userName}
                    src={newRow?.distributorDetails?.id?.selfie[0]}
                  />
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.distributorDetails?.id?.firstName}{" "}
                      {newRow?.distributorDetails?.id?.lastName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.distributorDetails?.id?.role}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      userCode : {newRow?.distributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.masterDistributorDetails?.id &&
              newRow?.masterDistributorDetails?.id?._id ===
                newRow?.walletLedgerData?.from && (
                <Stack flexDirection={"row"} gap={1}>
                  <Avatar
                    alt={newRow?.masterDistributorDetails?.id?.userName}
                    src={newRow?.masterDistributorDetails?.id?.selfie[0]}
                  />
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                      {newRow?.masterDistributorDetails?.id?.lastName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.masterDistributorDetails?.id?.role}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      userCode :{" "}
                      {newRow?.masterDistributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            <Typography whiteSpace={"nowrap"} variant="body2">
              {" "}
              Transaction Id : {newRow?.clientRefId}{" "}
            </Typography>
          </TableCell>
        )}

        {/* Transactional Detail */}
        {newRow.transactionType.toLowerCase() === "fund flow" ? (
          <TableCell>
            {newRow?.agentDetails?.id &&
              newRow?.agentDetails?.id?._id ===
                newRow?.walletLedgerData?.to && (
                <Stack flexDirection={"row"} gap={1}>
                  <Avatar
                    alt={newRow?.agentDetails?.id?.userName}
                    src={newRow?.agentDetails?.id?.selfie[0]}
                  />
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.agentDetails?.id?.role}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      userCode : {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.adminDetails?.id &&
              newRow?.adminDetails?.id?._id ===
                newRow?.walletLedgerData?.to && (
                <Stack flexDirection={"row"} gap={1}>
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.adminDetails?.id?.email}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.distributorDetails?.id &&
              newRow?.distributorDetails?.id?._id ===
                newRow?.walletLedgerData?.to && (
                <Stack flexDirection={"row"} gap={1}>
                  <Avatar
                    alt={newRow?.distributorDetails?.id?.userName}
                    src={newRow?.distributorDetails?.id?.selfie[0]}
                  />
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.distributorDetails?.id?.firstName}{" "}
                      {newRow?.distributorDetails?.id?.lastName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.distributorDetails?.id?.role}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      userCode : {newRow?.distributorDetails?.id?.userCode}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {" "}
                      Mode : {newRow?.modeOfPayment}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            {newRow?.masterDistributorDetails?.id &&
              newRow?.masterDistributorDetails?.id?._id ===
                newRow?.walletLedgerData?.to && (
                <Stack flexDirection={"row"} gap={1}>
                  <Avatar
                    alt={newRow?.masterDistributorDetails?.id?.userName}
                    src={newRow?.masterDistributorDetails?.id?.selfie[0]}
                  />
                  <Stack gap={1}>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                      {newRow?.masterDistributorDetails?.id?.lastName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {newRow?.masterDistributorDetails?.id?.role}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      userCode :{" "}
                      {newRow?.masterDistributorDetails?.id?.userCode}
                    </Typography>
                    <Typography whiteSpace={"nowrap"} variant="body2">
                      {" "}
                      Mode : {newRow?.modeOfPayment}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            <Typography
              whiteSpace={"nowrap"}
              variant="body2"
              sx={{ color: "text.secondary" }}
            >
              {fDateTime(newRow.createdAt)}
            </Typography>
          </TableCell>
        ) : (
          <TableCell>
            <Typography whiteSpace={"nowrap"} variant="body2">
              {" "}
              Vendor Id : {newRow?.transactionId}{" "}
            </Typography>
            <Typography whiteSpace={"nowrap"} variant="body2">
              {" "}
              Vendor : {newRow?.vendorName}{" "}
            </Typography>
            <Typography whiteSpace={"nowrap"} variant="body2">
              {" "}
              UTR Number : {newRow?.vendorUtrNumber}
            </Typography>

            <Typography whiteSpace={"nowrap"} variant="body2">
              {" "}
              Mode : {newRow?.modeOfPayment}
            </Typography>
            <Typography
              whiteSpace={"nowrap"}
              variant="body2"
              sx={{ color: "text.secondary" }}
            >
              {fDateTime(newRow.createdAt)}
            </Typography>
          </TableCell>
        )}

        {/* Device Info */}
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Device Type :{" "}
            <Iconify
              width={16}
              icon={
                newRow?.metaData?.deviceType === "mac"
                  ? "ant-design:apple-filled"
                  : newRow?.metaData?.deviceType === "window"
                  ? "ant-design:windows-filled"
                  : newRow?.metaData?.deviceType === "android"
                  ? "ant-design:android-filled"
                  : "-"
              }
            />{" "}
            {newRow?.metaData?.deviceType}{" "}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            IMEI : {newRow?.metaData?.imeiNumber || "-"}{" "}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            IP : {newRow?.metaData?.ipAddress}{" "}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Latitude : {newRow?.metaData?.lat}{" "}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Longitude : {newRow?.metaData?.long}{" "}
          </Typography>
        </TableCell>

        {/* Transaction Type */}
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Txn Type : {newRow?.transactionType || "NA"}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Category : {newRow?.categoryName || "NA"}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Product : {newRow?.productName || "NA"}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            Mobile Number : {newRow?.mobileNumber || "NA"}
          </Typography>
        </TableCell>

        {/* Operator */}
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            {newRow?.operator?.key1}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            {newRow?.operator?.key2}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {" "}
            {newRow?.operator?.key3}
          </Typography>
        </TableCell>

        {/* Sender/Beneficiary detail */}
        <TableCell>
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
            <Typography whiteSpace={"nowrap"} variant="body2">
              Beneficiary:{" "}
              {newRow?.moneyTransferBeneficiaryDetails?.accountNumber || "NA"}
            </Typography>
            {newRow?.moneyTransferBeneficiaryDetails?.accountNumber && (
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      {newRow?.moneyTransferBeneficiaryDetails?.mobileNumber}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
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
        </TableCell>

        {/* Commission */}
        {newRow?.agentDetails?.id === undefined ? (
          <TableCell>
            <Stack flexDirection={"row"} gap={1}>
              <Typography
                whiteSpace={"nowrap"}
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                Api User: {newRow?.partnerDetails?.creditedAmount?.toFixed(2)}
              </Typography>
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      Opening Main Wallet :{" "}
                      {parseFloat(
                        newRow?.partnerDetails?.oldMainWalletBalance
                      )?.toFixed(2)}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      Closing Main Wallet :{" "}
                      {parseFloat(
                        newRow?.partnerDetails?.newMainWalletBalance
                      )?.toFixed(2)}
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
            </Stack>
          </TableCell>
        ) : (
          <TableCell>
            <Stack flexDirection={"row"} gap={1}>
              <Typography
                whiteSpace={"nowrap"}
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                Agent: {newRow?.agentDetails?.creditedAmount?.toFixed(2)}
              </Typography>
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      Opening Main Wallet :{" "}
                      {parseFloat(
                        newRow?.agentDetails?.oldMainWalletBalance
                      )?.toFixed(2)}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      Closing Main Wallet :{" "}
                      {parseFloat(
                        newRow?.agentDetails?.newMainWalletBalance
                      )?.toFixed(2)}
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
            </Stack>
            <Stack flexDirection={"row"} gap={1}>
              <Typography
                whiteSpace={"nowrap"}
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                Distributor:{" "}
                {newRow?.distributorDetails?.creditedAmount?.toFixed(3)}
              </Typography>
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      Opening Main Wallet :
                      {parseFloat(
                        newRow?.distributorDetails?.oldMainWalletBalance
                      )?.toFixed(2)}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      Closing Main Wallet :{" "}
                      {parseFloat(
                        newRow?.distributorDetails?.newMainWalletBalance
                      )?.toFixed(2)}
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
            </Stack>
            <Stack flexDirection={"row"} gap={1}>
              <Typography whiteSpace={"nowrap"} variant="body2">
                M.Distributor:{" "}
                {newRow?.masterDistributorDetails?.creditedAmount?.toFixed(3)}
              </Typography>
              <CustomWidthTooltip
                title={
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      Opening Main Wallet :
                      {parseFloat(
                        newRow?.masterDistributorDetails?.oldMainWalletBalance
                      )?.toFixed(2)}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      Closing Main Wallet :{" "}
                      {parseFloat(
                        newRow?.masterDistributorDetails?.newMainWalletBalance
                      )?.toFixed(2)}
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
            </Stack>
          </TableCell>
        )}

        {/* GST/TDS */}
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            GST: {newRow?.GST?.toFixed(2)}
          </Typography>
          <Stack flexDirection={"row"} gap={1}>
            <Typography whiteSpace={"nowrap"} variant="body2">
              TDS: {newRow?.TDS?.toFixed(3)}
            </Typography>
            <CustomWidthTooltip
              title={
                newRow?.agentDetails?.id !== undefined ? (
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      Agent : {newRow?.agentDetails?.TDSAmount}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      Distributor : {newRow?.distributorDetails?.TDSAmount}
                    </Typography>
                    <Typography whiteSpace={"nowrap"}>
                      M.Distributor :{" "}
                      {newRow?.masterDistributorDetails?.TDSAmount}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack flexDirection={"column"}>
                    <Typography whiteSpace={"nowrap"}>
                      Api User : {newRow?.partnerDetails?.TDSAmount}
                    </Typography>
                  </Stack>
                )
              }
            >
              <Icon
                icon="ph:info-duotone"
                width={20}
                color={theme.palette.primary.main}
              />
            </CustomWidthTooltip>
          </Stack>
        </TableCell>

        {/* Amount */}
        <TableCell sx={{ textAlign: "end", whiteSpace: "nowrap" }}>
          <Typography whiteSpace={"nowrap"} variant="body2">
            Txn Amt : {newRow.amount}
          </Typography>
        </TableCell>

        {/* Debit/Credit */}
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            Debit : {newRow?.debit}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            Credit : {newRow?.credit}
          </Typography>
        </TableCell>

        {/* Status */}
        <TableCell
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
        </TableCell>

        <TableCell>
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
              (newRow.categoryName.toLowerCase() == "money transfer" ||
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
          </Stack>
        </TableCell>
      </TableRow>

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
                            <Avatar
                              alt={
                                item?.checkStatusDoneBy?.selfie &&
                                item?.checkStatusDoneBy?.selfie[0]
                              }
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
                              <Typography variant="body2">
                                {item?.checkStatusDoneBy?.email}
                              </Typography>
                            </Stack>
                          </Stack>
                        ) : null}
                      </TableCell>

                      <TableCell align="left" sx={{ border: "solid #000" }}>
                        <Typography
                          sx={{
                            cursor: "pointer",
                            overflow: "hidden",
                            wordBreak: "break-all",
                          }}
                        >
                          {item?.vendorApiRequest}
                          <Icon
                            style={{
                              fontSize: "20px",
                              float: "right",
                              cursor: "pointer",
                            }}
                            icon="uil:copy"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item?.vendorApiRequest);
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
                          {item?.vendorApiResponse}
                          <Icon
                            style={{
                              fontSize: "20px",
                              float: "right",
                              cursor: "pointer",
                            }}
                            icon="uil:copy"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item?.vendorApiResponse);
                            }}
                          />
                        </Typography>
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
