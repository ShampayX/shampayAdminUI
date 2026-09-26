import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import { CustomAvatar } from "src/components/custom-avatar";
import FormProvider from "src/components/hook-form/FormProvider";
import Iconify from "src/components/iconify";
import Label from "src/components/label/Label";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom, TableNoData } from "src/components/table";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { fIndianCurrency } from "src/utils/formatNumber";

import * as Yup from "yup";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import MotionModal from "src/components/animate/MotionModal";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

type RowProps = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  mobileVerify: boolean;
  emailVerify: boolean;
  _id: any;
  verificationStatus: string;
  avatar: string;
  category: string;
  flag: string;
  total: number;
  rank: string;
  finalStatus: string;
  contact_no: string;
  role: string;
  createdAt: string;
  company_name: string;
  selfie: any;
  main_wallet_amount: string;
  fingPayAEPSKycStatus: string;
  fingPayAPESRegistrationStatus: string;
  userCode: string;
  eAgreement_Signed_URL: string;
  startDate: Date | null;
  endDate: Date | null;
};

type ChildProps = {
  row: RowProps;
};

function UserDetail({ row }: ChildProps) {
  const { Api } = useAuthContext();
  const [selectedData, setSelectedData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setModal] = React.useState(false);
  const openModal = () => setModal(true);
  const handleClose = () => setModal(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const { enqueueSnackbar } = useSnackbar();
  const [sdata, setSdata] = useState([]);
  const [txnCount, setTxnCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(25);

  const [networkData, setNetworkData] = useState([]);
  const [networkPageSize, setNetworkPageSize] = useState(25);
  const [currentNetworkPage, setCurrentNetworkPage] = useState<any>(1);
  const [networkCount, setNetworkCount] = useState(0);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);

  const [openNetwork, setOpenNetwork] = React.useState(false);
  const handleOpenNetwork = () => setOpenNetwork(true);
  const handleCloseNetwork = () => setOpenNetwork(false);

  const tableLabels: any = [
    { id: "product", label: "User Details", align: "center" },
    // { id: "shopname", label: "Shop Name" },
    { id: "Type", label: "User Type" },
    { id: "due", label: "Referred By" },
    { id: "maxComm", label: "Mobile Verified" },
    { id: "mobileNumber", label: "Mobile Number" },
    { id: "maxComm", label: "Email Verified" },
    { id: "WalletBal", label: "Wallet Balance", align: "center" },
    { id: "consentagreed", label: "Consent Agreed", align: "center" },
    { id: "Action", label: "Action", align: "center" },
  ];

  const tableHead: any = [
    { id: "product", label: "Name" },
    { id: "shopname", label: "Shop Name" },
    { id: "Type", label: "User Type" },
    { id: "due", label: "Referred By" },
    { id: "maxComm", label: "Mobile Verified" },
    { id: "mobileNumber", label: "Mobile Number" },
    { id: "maxComm", label: "Email Verified" },
    { id: "WalletBal", label: "Wallet Balance", align: "center" },
    { id: "consentagreed", label: "Consent Agreed", align: "center" },
    { id: "Action", label: "Action", align: "center" },
  ];

  const walletStyle = {
    textTransform: "capitalize",
    borderColor: "primary",
    borderRadius: 1,
    borderWidth: "2px",
    borderStyle: "solid",
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "1px solid #00AB55",
    borderRadius: 2,
    boxShadow: 24,
    padding: "10px 32px",
    overflow: "auto",
    p: 2,
  };

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(true);
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    startDate: null,
    endDate: null,
  };

  const methods = useForm<any>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    reset,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

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

  const searchFromUser = (val: string) => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    openModal();
    let body = {
      searchBy: "userCode", // possible values -- firstName, email, contact_no, userCode
      searchInput: val,
    };
    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setSelectedData(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsLoading(false);
    });
  };

  const ViewAEPS = () => {
    setIsLoading(true);
    setSdata([]);
    let token = localStorage.getItem("token");
    const body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      userId: row._id,
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };
    Api(`admin/getAepsUserAttendance`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            reset(defaultValues);
            enqueueSnackbar(Response.data.message);
            setSdata(Response.data.data);
            setLoading(false);
            setTxnCount(Response.data.count);
          } else {
            reset(defaultValues);
          }
        }
      }
    );
  };
  const { copy } = useCopyToClipboard();
  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const getNetworkData = () => {
    setIsNetworkLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      userId: row._id,
    };
    Api(
      `admin/downlineUsers?page=${currentNetworkPage}&limit=${pageSize}&userId=${row._id}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        handleOpenNetwork();
        setNetworkCount(Response.data.count);
        setNetworkData(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsNetworkLoading(false);
    });
  };

  return (
    <>
      <TableRow sx={{ width: "100%" }}>
        <TableCell>
          <Stack direction="row" alignItems="center">
            <CustomAvatar
              name={`${row.firstName} ${row.lastName}`}
              alt={`${row.firstName} ${row.lastName}`}
              src={row?.selfie[0]}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2">
                {" "}
                {row?.company_name || "No shop name"}{" "}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {row.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {fDateTime(row.createdAt)}
              </Typography>
              <Typography variant="body2">
                {" "}
                {`${row.firstName} ${row.lastName}`}{" "}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          {row.role == "m_distributor"
            ? "Master Distributor"
            : row.role == "distributor"
            ? "Distributor"
            : row.role == "agent"
            ? "Agent"
            : "Direct Agent"}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {row?.userCode}{" "}
          </Typography>
        </TableCell>

        <TableCell>{"NA"}</TableCell>
        <TableCell>{row.mobileVerify ? "Verified" : "Unverified"}</TableCell>
        <TableCell>{row.contact_no}</TableCell>
        <TableCell>{row.emailVerify ? "Verified" : "Unverified"}</TableCell>
        <TableCell align="center">
          <Stack gap={1}>
            <Label variant="soft" color={"primary"} sx={walletStyle}>
              Main = {fIndianCurrency(row?.main_wallet_amount) || 0}
            </Label>
          </Stack>
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>Yes</TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          <Stack gap={1}>
            {/* The "AEPS Attendance" button was removed. It was gated on
                `row.role === "agent"`, and there is no agent role any more -
                roles are { Admin, API_User } - so it could only ever render
                disabled. `admin/getAepsUserAttendance` is untouched. */}
            <LoadingButton
              variant="contained"
              onClick={() => window.open(row?.eAgreement_Signed_URL)}
              disabled={!row?.eAgreement_Signed_URL}
            >
              View Agreement
            </LoadingButton>
          </Stack>
        </TableCell>

        <TableCell sx={{ textAlign: "center" }}>
          <LoadingButton
            variant="contained"
            onClick={getNetworkData}
            loading={isNetworkLoading}
            disabled={row?.role == "agent"}
          >
            View Network
          </LoadingButton>
        </TableCell>

        <Modal
          open={isModalOpen}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <TableContainer>
              <FormProvider methods={methods} onSubmit={handleSubmit(ViewAEPS)}>
                <Stack flexDirection={"row"} gap={1} padding={2}>
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
                          sx={{ width: 150 }}
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
                          sx={{ width: 150 }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={isSubmitting}
                  >
                    Search
                  </LoadingButton>
                  <LoadingButton
                    variant="contained"
                    onClick={() => {
                      reset(defaultValues);
                      ViewAEPS();
                    }}
                  >
                    Clear
                  </LoadingButton>
                </Stack>
              </FormProvider>
              <Scrollbar
                sx={{
                  minWidth: { xs: 300, sm: 500, md: 1100 },
                  pb: 2,
                  height: "70vh",
                }}
              >
                <Table stickyHeader>
                  <TableHeadCustom headLabel={tableHead} />
                  <TableBody>
                    {sdata.length ? (
                      sdata.map((item: any) => (
                        <TableRow key={row._id}>
                          <TableCell sx={{ padding: "0px" }}>
                            <Stack direction="row" alignItems="center">
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="subtitle2">
                                  {" "}
                                  {item?.userId?.firstName}{" "}
                                  {item?.userId?.lastName}{" "}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {fDateTime(item.createdAt)}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {item?.userId?.role}
                            {""}
                          </TableCell>
                          <TableCell>
                            {item?.userId?.email}
                            {""}
                          </TableCell>
                          <TableCell>
                            {item?.status}
                            {""}
                          </TableCell>
                          <TableCell>
                            {item?.remarks}
                            {""}
                          </TableCell>
                          <TableCell>
                            {item?.metaData?.deviceType}
                            {""}

                            <Typography noWrap variant="body2">
                              {item?.metaData?.ipAddress}
                              {""}
                              <IconButton
                                sx={{ p: 0.5 }}
                                onClick={() =>
                                  onCopy(`${item?.metaData?.ipAddress}`)
                                }
                              >
                                <Iconify icon="eva:copy-fill" width={20} />
                              </IconButton>
                            </Typography>
                            <Typography variant="body2">
                              {item?.metaData?.imeiNumber}
                              {""}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              lat: {fIndianCurrency(item?.metaData?.lat)}{" "}
                            </Typography>
                            <Typography variant="body2">
                              lat: {fIndianCurrency(item?.metaData?.long)}{" "}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <Typography variant="h6" padding={2}>
                        Not Data Found
                      </Typography>
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <Button variant="contained" onClick={closeModal}>
              Close
            </Button>
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
          </Box>
        </Modal>
      </TableRow>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TableContainer>
            <Scrollbar sx={{ minWidth: { xs: 300, sm: 500, md: 1100 }, pb: 2 }}>
              <Table>
                <TableHeadCustom headLabel={tableLabels} />
                {/* Deliberately still the spinner: this sits INSIDE <Table>,
                    between the head and the body. TableSkeleton renders its own
                    table element, which is invalid there. Converting this means
                    lifting the branch outside <Table> first. */}
                {isLoading ? (
                  <ApiDataLoading />
                ) : (
                  <TableBody>
                    {selectedData.length ? (
                      selectedData.map((row: any) => (
                        <TableRow key={row._id}>
                          <TableCell sx={{ padding: "0px" }}>
                            <Stack direction="row" alignItems="center">
                              <CustomAvatar
                                name={row.firstName}
                                alt={row.firstName}
                                src={row?.selfie[0]}
                              />
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="subtitle2">
                                  {" "}
                                  {row?.firstName}{" "}
                                </Typography>
                                <Typography variant="body2">
                                  User code: {row?.userCode}{" "}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {row.email}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {fDateTime(row.createdAt)}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {row.role == "m_distributor"
                              ? "Master Distributor"
                              : row.role == "distributor"
                              ? "Distributor"
                              : row.role == "agent"
                              ? "Agent"
                              : "Direct Agent"}
                          </TableCell>

                          <TableCell>{"NA"}</TableCell>
                          <TableCell>
                            {row.mobileVerify ? "Verified" : "Unverified"}
                          </TableCell>
                          <TableCell>{row.contact_no}</TableCell>
                          <TableCell>
                            {row.emailVerify ? "Verified" : "Unverified"}
                          </TableCell>
                          <TableCell align="right">
                            <Stack gap={1}>
                              <Label
                                variant="soft"
                                color={"primary"}
                                sx={walletStyle}
                              >
                                Main ={" "}
                                {fIndianCurrency(row?.main_wallet_amount) || 0}
                              </Label>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            Yes
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <Typography
                        sx={{ direction: "flex", alignItems: "center" }}
                      >
                        Not Data Found
                      </Typography>
                    )}
                  </TableBody>
                )}
              </Table>
            </Scrollbar>
          </TableContainer>
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Modal>

      <MotionModal open={openNetwork} width={{ xs: "100%", md: "75%" }}>
        <Stack>
          <TableContainer>
            <Scrollbar sx={{ maxHeight: 700, mb: 5 }}>
              <Table sx={{ minWidth: 720 }} stickyHeader>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {networkData.map((row) => (
                    <UserDetail key={row} row={row} />
                  ))}
                </TableBody>
                <TableNoData isNotFound={!networkData?.length} />
              </Table>
            </Scrollbar>
          </TableContainer>

          <CustomPagination
            page={currentNetworkPage - 1}
            count={networkCount}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => setCurrentNetworkPage(newPage + 1)}
            rowsPerPage={networkPageSize}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              setNetworkPageSize(parseInt(event.target.value));
              setCurrentNetworkPage(1);
            }}
          />

          <Button
            variant="contained"
            onClick={handleCloseNetwork}
            sx={{ position: "absolute", bottom: 10, left: 10 }}
          >
            Close
          </Button>
        </Stack>
      </MotionModal>
    </>
  );
}

export default UserDetail;
