import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";

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
  tooltipClasses,
  Tooltip,
  TooltipProps,
  Zoom,
  useTheme,
  TextField,
  MenuItem,
} from "@mui/material";

import React from "react";

import Scrollbar from "src/components/scrollbar/Scrollbar";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import { fDateTime } from "src/utils/formatTime";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { CustomAvatar } from "src/components/custom-avatar";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form/FormProvider";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import Label from "src/components/label/Label";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

export default function PlanFetchRecords() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [sdata, setSdata] = useState([]);
  const [isTxnFound, setIsTxnFound] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [categoryList, setCategoryList] = useState([]);
  const [planTypeList, setPlanTypeList] = useState([]);
  const [venderList, setvenderList] = useState([]);

  type FormValuesProps = {
    planType: string;
    operatorName: string;
    venderName: string;
    ClientRefId: string;
    Partnerid: string;
    category: {
      categoryName: string;
      categoryId: string;
    };
    endDate: Date | null;
    startDate: Date | null;
  };

  const FilterSchema = Yup.object().shape({
    UserName: Yup.string(),
  });

  const defaultValues = {
    planType: "",
    venderName: "",
    ClientRefId: "",
    Partnerid: "",
    operatorName: "",
    category: {
      categoryName: "",
      categoryId: "",
    },
    startDate: null,
    endDate: null,
  };

  const tableLabels = [
    { id: "timeDate", label: "Time & Date " },
    { id: "userDetails", label: "User Details " },
    { id: "categoryName", label: "Category Name " },
    { id: "operator", label: "Operator Name " },
    { id: "type", label: "Type " },
    { id: "VenderName", label: "Vendor Name" },
    { id: "metaData", label: "Meta Data" },
    { id: "Status", label: "Status" },
    { id: "Req/Res", label: "Req/Res" },
  ];

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
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

  useEffect(() => {
    getTransaction();
  }, [currentPage, pageSize]);
  useEffect(() => setCurrentPage(1), [currentTab]);

  useEffect(() => {
    getCategoryList();
    getPlanType();
    getVendorList();
  }, []);

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

  const getPlanType = () => {
    let token = localStorage.getItem("token");
    Api(`admin/vendoriliaryRecord/type`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setPlanTypeList(Response.data.data);
          }
        }
      }
    );
  };

  const getVendorList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/vendorAuxiliaryRecord/vendor_list`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setvenderList(Response.data.data);
          }
        }
      }
    );
  };

  const getTransaction = () => {
    setIsTxnFound(true);
    setSdata([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`admin/vendorAuxiliaryRecord/fetch`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data);

            setTxnCount(Response.data.totalNumberOfRecords);
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

  const FilterData = (data: FormValuesProps) => {
    setIsTxnFound(true);
    setSdata([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      type: data.planType,
      operator: data.operatorName,
      startDate: formattedStart,
      endDate: formattedEndDate,
      categoryName: data.category.categoryName,
      vendorName: data.venderName,
      clientRefId: data.ClientRefId,
      partnerTransactionId: data.Partnerid,
    };

    Api(`admin/vendorAuxiliaryRecord/fetch`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data);

            setTxnCount(Response.data.totalNumberOfRecords);
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

  const handdleClear = () => {
    reset();
    getTransaction();
  };

  return (
    <>
      <Helmet>
        <title> Plan Fetch Records | Shampay Admin </title>
      </Helmet>

      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        {isTxnFound ? (
          <ApiDataLoading variant="table" columns={tableLabels} />
        ) : (
          <TableContainer component={Paper}>
            <Scrollbar sx={{ height: "fit-content" }}>
              <FormProvider
                methods={methods}
                onSubmit={handleSubmit(FilterData)}
              >
                <Stack direction={{ xs: "column", md: "row" }} gap={1} mt={1}>
                  <Stack direction="row" gap={1}>
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
                          <TextField
                            {...params}
                            size={"small"}
                            sx={{ minWidth: 150 }}
                          />
                        )}
                      />
                      <DatePicker
                        label="End date"
                        inputFormat="DD/MM/YYYY"
                        value={watch("endDate")}
                        minDate={watch("startDate")}
                        maxDate={new Date()}
                        onChange={(newValue: any) =>
                          setValue("endDate", newValue)
                        }
                        renderInput={(params: any) => (
                          <TextField
                            {...params}
                            size={"small"}
                            sx={{ minWidth: 150 }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>

                  <RHFTextField
                    name="ClientRefId"
                    label=" Client Ref ID"
                    placeholder="Client Ref ID"
                    size="small"
                  />
                  <RHFTextField
                    name="Partnerid"
                    label=" Partner ID"
                    placeholder=" Partner ID"
                    size="small"
                  />

                  <RHFSelect
                    name="planType"
                    label="Plan Type"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {planTypeList.map((item: any) => {
                      return (
                        <MenuItem
                          key={item?._id}
                          value={item}
                          onClick={() => {
                            setValue("planType", item);
                          }}
                        >
                          {item}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>

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
                    name="venderName"
                    label="Vendor Name"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {venderList.map((item: any) => {
                      return (
                        <MenuItem
                          key={item?._id}
                          value={item}
                          onClick={() => {
                            setValue("venderName", item);
                          }}
                        >
                          {item}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>

                  <RHFTextField
                    name="operatorName"
                    label=" Operator Name"
                    placeholder="Operator Name"
                    size="small"
                  />

                  <Stack flexDirection={"row"} gap={1}>
                    <Button variant="contained" type="submit">
                      Search
                    </Button>
                    <Button variant="contained" onClick={handdleClear}>
                      Clear
                    </Button>
                  </Stack>
                </Stack>
              </FormProvider>
              <Scrollbar>
                <Table
                  sx={{ minWidth: 720, marginTop: "10px" }}
                  stickyHeader
                  size="small"
                  aria-label="customized table"
                >
                  <TableHead>
                    <TableRow>
                      {tableLabels.map((column: any) => (
                        <TableCell key={column.id}>
                          {" "}
                          <Typography
                            whiteSpace={"nowrap"}
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {column.label}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sdata.map((row: any) => (
                      <TransactionRow row={row} key={row._id} />
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
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
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  return (
    <>
      <TableRow key={newRow._id} hover>
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {fDateTime(newRow?.createdAt || "NA")}
          </Typography>
        </TableCell>

        <TableCell>
          <Stack flexDirection="row" gap={1}>
            <CustomAvatar
              name={newRow?.userId?.firstName ? newRow?.userId?.firstName : ""}
              alt={newRow?.userId?.firstName}
              src={newRow?.userId?.selfie && newRow?.userId?.selfie[0]}
            />
            <Stack>
              <Typography whiteSpace={"nowrap"} variant="body2">
                {newRow?.userId?.firstName} {newRow?.userId?.lastName}
              </Typography>
              <Typography whiteSpace={"nowrap"} variant="body2">
                {newRow?.userId?.role}, {newRow?.userId?.userCode}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {newRow?.categoryName || "NA"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {newRow?.operatorDetails?.key1}
          </Typography>

          <Typography whiteSpace={"nowrap"} variant="body2">
            {newRow?.operatorDetails?.key2}
          </Typography>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {newRow?.operatorDetails?.key3}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {newRow?.type}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            {newRow?.vendorName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography whiteSpace={"nowrap"} variant="body2">
            DeviceType :{newRow?.metaData?.deviceType}
          </Typography>
          <Stack flexDirection="row" gap={1}>
            <Typography whiteSpace={"nowrap"} variant="body2">
              IP Address :{newRow?.metaData?.ipAddress}
            </Typography>

            <CustomWidthTooltip
              title={
                <Stack flexDirection={"column"}>
                  <Typography whiteSpace={"nowrap"}>
                    IMEI :{newRow?.metaData?.imeiNumber}
                  </Typography>
                  <Typography whiteSpace={"nowrap"}>
                    Mac.Address :{newRow?.metaData?.macAddress}
                  </Typography>

                  <Typography whiteSpace={"nowrap"}>
                    Lat.
                    {newRow?.metaData?.lat}
                  </Typography>
                  <Typography whiteSpace={"nowrap"}>
                    Long.
                    {newRow?.metaData?.long}
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
        <TableCell>
          {newRow?.status && (
            <Label
              variant="soft"
              color={newRow?.status === "success" ? "success" : "error"}
            >
              {newRow?.status}
            </Label>
          )}
        </TableCell>

        <TableCell>
          <Stack gap={0.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpen}
              sx={{ whiteSpace: "nowrap", textAlign: "center" }}
            >
              Response / Request
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      <Modal
        open={open}
        // onClose={handleClose}
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
                  <TableCell align="left" sx={{ border: " solid #000" }}>
                    Request
                  </TableCell>
                  <TableCell align="left" sx={{ border: " solid #000" }}>
                    Response
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow key={newRow._id} hover>
                  <TableCell align="left" sx={{ border: "solid #000" }}>
                    <Typography
                      sx={{
                        cursor: "pointer",
                        overflow: "hidden",
                        wordBreak: "break-all",
                      }}
                    >
                      {newRow?.request || "NA"}
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
                      {newRow?.response || "NA"}
                    </Typography>
                  </TableCell>
                </TableRow>
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
