import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Stack,
  Typography,
  Modal,
  Grid,
  Box,
  Button,
  TableContainer,
  Table,
  Divider,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  AccordionProps,
  styled,
  AccordionSummaryProps,
  Tab,
  Tabs,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Card,
} from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { LoadingButton } from "@mui/lab";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import FormProvider, {
  RHFAutocomplete,
  RHFRadioGroup,
  RHFTextField,
} from "src/components/hook-form";
import * as Yup from "yup";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import NoBankAccount from "src/assets/icons/NoBankAccount";
import MotionModal from "src/components/animate/MotionModal";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";
import ModeCustome from "./ModeCustome";
import {
  PageHeader,
  PageActionButton,
  KitTabs,
  StatCard,
  StatGrid,
  EmptyState,
} from "src/components/page-kit";
import { alpha } from "@mui/material/styles";
import ConfirmDialog from "src/components/confirm-dialog";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { isOk, notifyFailure } from "src/utils/apiResult";

type FormValuesProps = {
  bank: {
    bankName: string;
    masterIFSC: string;
  };
  accountNumber: string;
  branch: string;
  bankAddress: string;
  minDepositeAmount: string;
  maxDepositeAmount: string;
  mode: string[];
  visibleto: string[];
  cashDepositeCharges: string;
  modes_of_transfer: {
    modeId: string;
    modeName: string;
    transactionFeeType: string;
    transactionFeeOption: {
      for_API_user: string;
      for_Agent: string;
      for_Distributor: string;
      for_M_Distributor: string;
    };
    transactionFeeValue: {
      for_API_user: string;
      for_Agent: string;
      for_Distributor: string;
      for_M_Distributor: string;
    };
  }[];
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // width: 400,
  bgcolor: "#ffffff",
  boxShadow: 24,
  p: 2,
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export default function AddBankAccount() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState("active");
  const [modesList, setModesList] = React.useState([]);
  const [banksList, setBanksList] = React.useState([]);
  const [selectBank, setSelectBank] = React.useState<any>([]);
  const [currentBank, setCurrentBank] = React.useState("");
  const [adminBankList, setAdminBankList] = React.useState<any>([]);
  const [defaultValue, setDefaultValue] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [loadingEdit, setLoadingEdit] = React.useState(false);
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  /* Deleting a company bank account is destructive and used to fire on click. */
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  /* Deleted banks stay in the list with an isDeleted flag - the tab strip
     already filters them out, so the count has to as well. */
  const activeBanks = React.useMemo(
    () => (adminBankList || []).filter((item: any) => !item.isDeleted),
    [adminBankList]
  );

  const visibleToCount = React.useMemo(() => {
    const bank = selectBank[0];
    if (!bank) return 0;
    return [
      bank.visibleTo_API_User,
      bank.visibleTo_Agent,
      bank.visibleTo_Distributor,
      bank.visibleTo_M_Distributor,
    ].filter(Boolean).length;
  }, [selectBank]);
  const [inputValue, setInputValue] = useState<string | null>("");
  const [modeList, setModeList] = useState([]);

  // modal for add bank
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    if (modesList.length && banksList.length) {
      setOpen(true);
    } else {
      setLoading(true);
      getBankAndModeList("add");
    }
  };
  const handleClose = () => setOpen(false);

  // modal for Edit bank
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => {
    if (modesList.length && banksList.length) {
      setOpen1(true);
    } else {
      setLoadingEdit(true);
      getBankAndModeList("edit");
    }
  };
  const handleClose1 = () => setOpen1(false);

  // modal for Modes
  const [open2, setOpen2] = React.useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  const vlist = [
    "RTGS",
    "IMPS",
    "NEFT",
    "Cash deposit at branch",
    "Cash deposit at CDM",
    "Fund Transfer",
    "Cheque",
    "UPI Transfer",
  ];

  useEffect(() => {
    getAdminBank();
    getModesList();
  }, []);

  const getBankAndModeList = (val: string) => {
    let token = localStorage.getItem("token");
    Api("bankManagement/get_bank", "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (isOk(Response)) {
        setBanksList(
          Response.data.data.filter((item: any) => {
            if (item.ekoBankId) {
              return item;
            }
          })
        );
        Api(`admin/fundManagement/get_modes`, "GET", "", token).then(
          (Response: any) => {
            console.log("======Modes List==response=====>" + Response);
            if (isOk(Response)) {
              setModesList(Response.data.data);
              if (val === "add") {
                setOpen(true);
                setLoading(false);
              } else {
                setOpen1(true);
                setLoadingEdit(false);
              }
            } else {
              notifyFailure(enqueueSnackbar, Response);
            }
          }
        );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getAdminBank = () => {
    let token = localStorage.getItem("token");
    Api(`admin/fundManagement/get_banks` + "", "GET", "", token).then(
      (Response: any) => {
        console.log("======BankList==response=====>", Response);
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            let arr: any = [];
            let modes: any = [];
            let visibleFor: any = [];
            arr.push(Response.data.data[0]);
            if (Response.data.data[0]?.visibleTo_API_User)
              visibleFor.push("Api User");
            if (Response.data.data[0]?.visibleTo_Agent)
              visibleFor.push("Agent");
            if (Response.data.data[0]?.visibleTo_Distributor)
              visibleFor.push("Distributor");
            if (Response.data.data[0]?.visibleTo_M_Distributor)
              visibleFor.push("Master Distributor");
            Response.data.data[0]?.modes_of_transfer?.map((row: any) => {
              modes.push({ _id: row.modeId, transfer_mode_name: row.modeName });
            });
            setDefaultValue({
              bankDetail: arr[0],
              modes: modes,
              visible: visibleFor,
            });
            setAdminBankList(Response.data.data);
            setCurrentBank(Response.data.data[0]._id);
            setSelectBank(arr);
            console.log(
              "======BankList===data.data 200====>",
              Response.data.data
            );
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
            console.log("======BankList=======>" + Response);
          }
        }
      }
    );
  };

  const ChangeBankDetail = useCallback(
    (val: string) => {
      console.log("chnage bank");
      setCurrentBank(val);
      let arr: any = [];
      let modes: any = [];
      let visibleFor: any = [];
      adminBankList.map((item: any) => {
        if (item._id === val) {
          arr.push(item);
          if (item?.visibleTo_API_User) visibleFor.push("Api User");
          if (item?.visibleTo_Agent) visibleFor.push("Agent");
          if (item?.visibleTo_Distributor) visibleFor.push("Distributor");
          if (item?.visibleTo_M_Distributor)
            visibleFor.push("Master Distributor");
          item?.modes_of_transfer?.map((row: any) => {
            modes.push({ _id: row.modeId, transfer_mode_name: row.modeName });
          });
        }
      });
      setDefaultValue({
        bankDetail: arr[0],
        modes: modes,
        visible: visibleFor,
      });
      setSelectBank(arr);
    },
    [currentBank]
  );

  const DeleteBank = (val: string) => {
    setLoadingDelete(true);
    let token = localStorage.getItem("token");
    Api(`admin/fundManagement/delete_bank/` + val, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            console.log(
              "======Get Bank Data==response=====>",
              Response.data.data
            );
          } else {
            console.log("======BankList=======>" + Response);
          }
          setAdminBankList(
            adminBankList.filter((item: any) => item._id !== val)
          );
          setSelectBank([adminBankList[0]]);
          setCurrentBank(adminBankList[0]._id);
          enqueueSnackbar(Response.data.message);
          setLoadingDelete(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setLoadingDelete(false);
        }
      }
    );
  };

  const SetMode = () => {
    let body = {
      transfer_mode_name: inputValue,
      isCommision: selectedValue == "Charge" ? false : true,
      isCharge: selectedValue == "Charge" ? true : false,
    };
    Api("admin/fundManagement/add_mode", "POST", body, "").then(
      (Response: any) => {
        console.log("==========>> Se vender List", Response);
        if (isOk(Response)) {
          handleClose2();
          getModesList();
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getModesList = () => {
    let token = localStorage.getItem("token");

    Api(`admin/fundManagement/get_modes/`, "GET", "", token).then(
      (Response: any) => {
        console.log("======Modes List==response=====>" + Response);
        if (isOk(Response)) {
          console.log(
            "===============Get modes list >>>>>>>>>>",
            Response.data.data
          );
          setModeList(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const updateBanksList = useCallback(
    (val: any) => {
      let arr: any = adminBankList.map((item: any) => {
        if (item._id === val._id) {
          setSelectBank([val]);
          return val;
        } else {
          return item;
        }
      });
      console.log("test", arr);
      setAdminBankList(arr);
    },
    [open, open1]
  );

  return (
    <>
      <KitTabs
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
      >
        <Tab label={"Bank Accounts"} value={"active"} />
        <Tab label={"Modes"} value={"deactive"} />
      </KitTabs>
      {currentTab == "active" ? (
        <>
          <Helmet>
            <title> Add Bank Detail | Shampay Admin </title>
          </Helmet>
          <PageHeader
            title="Bank Accounts"
            subtitle="Company accounts users deposit into, and the modes each one accepts."
            actions={
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={handleOpen}
                disabled={loading}
              >
                Add New Bank
              </PageActionButton>
            }
          />

          <StatGrid columns={3}>
            <StatCard
              label="Bank Accounts"
              value={activeBanks.length}
              caption="Company accounts users can deposit into"
              icon={<AccountBalanceOutlinedIcon />}
            />
            <StatCard
              label="Modes On This Bank"
              value={selectBank[0]?.modes_of_transfer?.length || 0}
              caption={
                selectBank[0]?.bank_details?.bank_name || "No bank selected"
              }
              tone="primary"
              icon={<SwapHorizOutlinedIcon />}
            />
            <StatCard
              label="Visible To"
              value={visibleToCount}
              caption="Roles that can see this bank"
              tone="neutral"
              icon={<VisibilityOutlinedIcon />}
            />
          </StatGrid>

          {adminBankList.length === 0 && (
            <EmptyState
              icon={<AccountBalanceOutlinedIcon />}
              title="No bank accounts yet"
              description="Add the first company bank account so users have somewhere to deposit."
            />
          )}

          {adminBankList.length > 0 && (
            <Card
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Row 1: Bank Tabs */}
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.grey[500], 0.08),
                  borderRadius: 2,
                  p: 0.5,
                  mb: 1.5,
                }}
              >
                <Tabs
                  value={currentBank}
                  onChange={(e, val) => {
                    setCurrentBank(val);
                    ChangeBankDetail(val);
                  }}
                  sx={{
                    minHeight: 38,
                    "& .MuiTab-root": {
                      fontSize: 13,
                      fontWeight: 500,
                      minHeight: 38,
                      px: 2,
                      borderRadius: 1.5,
                      textTransform: "none",
                      color: "text.secondary",
                    },
                    "& .Mui-selected": {
                      fontWeight: 700,
                      color: "primary.main",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "primary.main",
                      height: 3,
                      borderRadius: 2,
                    },
                  }}
                >
                  {adminBankList.map(
                    (item: any) =>
                      !item.isDeleted && (
                        <Tab
                          key={item._id}
                          value={item._id}
                          label={item?.bank_details?.bank_name}
                        />
                      )
                  )}
                </Tabs>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Row 2: Bank Details + Modes */}
              <Grid container spacing={2}>
                <Grid item lg={4} md={4} xs={12}>
                  <Box
                    sx={{
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                      p: 2,
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                      height: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "primary.main",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        mb: 1.5,
                      }}
                    >
                      Bank Details
                    </Typography>
                    {selectBank.map((row: any) => (
                      <Stack key={row._id} spacing={1}>
                        {[
                          {
                            label: "Bank Name",
                            value: row?.bank_details?.bank_name,
                          },
                          {
                            label: "Branch",
                            value: row?.bank_details?.branch_name,
                          },
                          {
                            label: "Account Number",
                            value: row?.bank_details?.account_number,
                          },
                          { label: "IFSC", value: row?.bank_details?.ifsc },
                          {
                            label: "Address",
                            value: row?.bank_details?.address,
                          },
                        ].map((item) => (
                          <Stack
                            key={item.label}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              py: 0.8,
                              borderBottom: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "text.secondary",
                                fontWeight: 500,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "text.primary",
                              }}
                            >
                              {item.value || "—"}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ))}
                  </Box>
                </Grid>

                <Grid item lg={8} md={8} xs={12}>
                  <Box
                    sx={{
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 2,
                      p: 2,
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                      height: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "primary.main",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        mb: 1.5,
                      }}
                    >
                      Modes of Transfer
                    </Typography>
                    <Grid container spacing={2}>
                      {selectBank.map((row: any) =>
                        row?.modes_of_transfer.map((item: any) => (
                          <Grid item xs={12} sm={6} md={4} key={item._id}>
                            <ModeCustome modeData={item} />
                          </Grid>
                        ))
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* Edit + Delete buttons back at the bottom */}
              <Stack direction="row" spacing={1} mt={2}>
                <LoadingButton
                  variant="contained"
                  onClick={handleOpen1}
                  loading={loadingEdit}
                  sx={{ borderRadius: 1.5, fontSize: 12, boxShadow: "none" }}
                >
                  Edit Bank
                </LoadingButton>
                <LoadingButton
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirmDelete(true)}
                  loading={loadingDelete}
                  sx={{ borderRadius: 1.5, fontSize: 12 }}
                >
                  Delete Bank
                </LoadingButton>
              </Stack>
            </Card>
          )}

          {/* {adminBankList.length && ( */}
          <>
            {/* <Stack flexDirection={"row"} gap={1} my={1}>
                {adminBankList.map((item: any) => {
                  return (
                    !item.isDeleted && (
                      <Button
                        key={item._id}
                        variant={
                          currentBank === item._id ? "contained" : "outlined"
                        }
                        onClick={() => {
                          setCurrentBank(item._id);
                          ChangeBankDetail(item._id);
                        }}
                      >
                        {item?.bank_details?.bank_name}
                      </Button>
                    )
                  );
                })}
              </Stack> */}

            {/* View Bank in Detail */}

            {/* <Grid container>
                <Grid lg={4} md={4} sm={10}>
                  <Card
                    sx={{ p: 2, bgcolor: "primary.lighter", marginRight: 2 }}
                  >
                    <Typography variant="h6"> Bank Details</Typography>
                    {selectBank.map((row: any) => (
                      <>
                        <Stack sx={{ p: 1 }} spacing={1} mt={2}>
                          <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle1">
                              Bank Name :
                            </Typography>
                            <Typography variant="body2">
                              {row?.bank_details?.bank_name}
                            </Typography>
                          </Stack>
                          <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle1">
                              Bank Branch :
                            </Typography>
                            <Typography variant="body2">
                              {row?.bank_details?.branch_name}
                            </Typography>
                          </Stack>
                          <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle1">
                              Account Number :
                            </Typography>
                            <Typography variant="body2">
                              {row?.bank_details?.account_number}
                            </Typography>
                          </Stack>
                          <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle1">IFSC :</Typography>
                            <Typography variant="body2">
                              {row?.bank_details?.ifsc}
                            </Typography>
                          </Stack>{" "}
                          <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                          >
                            <Typography variant="subtitle1">
                              Address :
                            </Typography>
                            <Typography variant="body2">
                              {row?.bank_details?.address}
                            </Typography>
                          </Stack>
                        </Stack>
                      </>
                    ))}
                  </Card>
                </Grid>
                <Grid lg={8} md={8} sm={10}>
                  <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
                    <Typography variant="h6"> Modes Details</Typography>
                    <Grid container spacing={3}>
                      {selectBank.map((row: any) =>
                        row?.modes_of_transfer.map((item: any) => {
                          return (
                            <>
                              <Grid item xs={12} sm={6} md={4}>
                                <Stack mt={1}>
                                  <ModeCustome modeData={item} />
                                </Stack>
                              </Grid>
                            </>
                          );
                        })
                      )}
                    </Grid>
                  </Card>
                </Grid>
              </Grid>

              <Stack flexDirection={"row"} gap={2} mt={2}>
                <LoadingButton
                  variant="contained"
                  onClick={() => {
                    handleOpen1();
                  }}
                  loading={loadingEdit}
                >
                  Edit Bank
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  onClick={() => DeleteBank(selectBank[0]?._id)}
                  loading={loadingDelete}
                >
                  Delete Bank
                </LoadingButton>
              </Stack> */}
          </>
          {/* )} */}
          {adminBankList.length == 0 && (
            <Stack justifyContent={"center"} alignItems={"center"}>
              <NoBankAccount />
              <Typography variant="h5">No Bank Account Found</Typography>
            </Stack>
          )}

          {/* Add Bank Modal */}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Grid>
              <BankAddComponent
                handleClose={handleClose}
                modesList={modesList}
                banksList={banksList}
                updateBanksList={updateBanksList}
              />
            </Grid>
          </Modal>

          {/* edit Bank Modal */}
          <Modal
            open={open1}
            onClose={handleClose1}
            // component={motion.div}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Grid>
              <BankEditComponent
                handleClose={handleClose1}
                defaultValue={defaultValue}
                modesList={modesList}
                banksList={banksList}
                updateBanksList={updateBanksList}
              />
            </Grid>
          </Modal>
        </>
      ) : (
        <>
          <Box
            rowGap={3}
            columnGap={10}
            sx={{
              display: "grid",
              justifyContent: "start",
              alignItems: "center",
            }}
            gridTemplateColumns={{
              // xs: 'repeat(1, 1fr)',
              sm: "0.2fr 0.8fr",
            }}
          >
            <Grid>
              <Button
                variant="contained"
                onClick={handleOpen2}
                sx={{
                  mt: 2,
                  mb: 2,
                  borderRadius: 2,
                  fontSize: 12,
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "0 4px 12px rgba(4,120,87,0.35)" },
                }}
              >
                Add Modes
              </Button>
              <Stack>
                <Card sx={{ bgcolor: "primary.lighter" }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Mode Name</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {modeList.map((modesName: any) => (
                          <TableRow key={modesName._id}>
                            <TableCell>
                              {modesName.transfer_mode_name}
                            </TableCell>
                            <TableCell>
                              {modesName.isCharge ? "Charge" : "Commission"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Stack>
            </Grid>
          </Box>
          <MotionModal
            open={open2}
            onClose={handleClose2}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={vlist}
                sx={{ minWidth: 250 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Mode Type"
                    size="small"
                  />
                )}
                onChange={(event, newValue) => setInputValue(newValue)}
              />
            </Grid>
            <div>
              <h2>Select Charge/ Commission</h2>
              <RadioGroup
                aria-label="modeVal"
                name="modeVal"
                value={selectedValue}
                onChange={(event: any) => setSelectedValue(event.target.value)}
              >
                <FormControlLabel
                  value="Charge"
                  control={<Radio />}
                  label="Charge"
                />
                <FormControlLabel
                  value="Commission"
                  control={<Radio />}
                  label=" Commission"
                />
              </RadioGroup>
            </div>

            <Button
              size="small"
              type="submit"
              variant="contained"
              sx={{ mt: 1 }}
              onClick={SetMode}
            >
              Add Mode
            </Button>
          </MotionModal>
        </>
      )}
      {/* Add Bank Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid>
          <BankAddComponent
            handleClose={handleClose}
            modesList={modesList}
            banksList={banksList}
            updateBanksList={updateBanksList}
          />
        </Grid>
      </Modal>

      {/* edit Bank Modal */}
      <Modal
        open={open1}
        onClose={handleClose1}
        // component={motion.div}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid>
          <BankEditComponent
            handleClose={handleClose1}
            defaultValue={defaultValue}
            modesList={modesList}
            banksList={banksList}
            updateBanksList={updateBanksList}
          />
        </Grid>
      </Modal>

      {/* Removing a company bank account is not reversible from this screen. */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete bank account?"
        content={
          selectBank[0]?.bank_details?.bank_name
            ? `${selectBank[0].bank_details.bank_name} will no longer be offered to users for deposits.`
            : "This bank will no longer be offered to users for deposits."
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={loadingDelete}
            onClick={() => {
              setConfirmDelete(false);
              DeleteBank(selectBank[0]?._id);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
    </>
  );
}

const BankAddComponent = React.memo(
  ({ handleClose, banksList, modesList, updateBanksList }: any) => {
    const { Api } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const [expanded, setExpanded] = React.useState<string | false>("panel1");

    const handleChange =
      (panel: string) =>
      (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
      };

    const visibleTo = [
      "Api User",
      "Agent",
      "Distributor",
      "Master Distributor",
    ];

    const accountValidate = Yup.object().shape({
      bank: Yup.object({
        bankName: Yup.string().required(`Bank Name is Required Field`),
        masterIFSC: Yup.string().required(`IFSC is Required Field`),
      }),
      mode: Yup.array()
        .of(
          Yup.object().shape({
            transfer_mode_name: Yup.string(),
          })
        )
        .min(1, "Mode Type is required Filed"),
      // visibleto: Yup.string().required('visible To is required Filed'),
      accountNumber: Yup.string().required("Account Number is required Field"),
      branch: Yup.string().required("Branch is required Field"),
      bankAddress: Yup.string().required("Bank Address is required Field"),
      minDepositeAmount: Yup.string().required(
        "Minimum Deposite Amount is required Field"
      ),
      maxDepositeAmount: Yup.string().required(
        "Maximum Deposite Amount is required Field"
      ),
    });

    const defaultValues = {
      bank: {
        bankName: "",
        masterIFSC: "",
      },
      mode: [],
      visibleto: [],
      modes_of_transfer: [],
      accountNumber: "",
      branch: "",
      bankAddress: "",
      minDepositeAmount: "",
      maxDepositeAmount: "",
    };

    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(accountValidate),
      defaultValues,
      mode: "all",
    });
    const {
      control,
      reset,
      watch,
      getValues,
      setValue,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = methods;

    const { fields, append, remove }: any = useFieldArray({
      name: "modes_of_transfer",
      control,
    });

    const setMode = (event: any, newValue: any) => {
      setValue("mode", newValue);
      let modeid = "";
      let modetype = "";
      modesList.map((item: any) => {
        if (item.transfer_mode_name == event.target.textContent) {
          modeid = item._id;
          modetype = item.isCharge ? "Charge" : "Commission";
        }
      });
      watch("modes_of_transfer").length < watch("mode").length
        ? append({
            modeId: modeid,
            modeName: event.target.textContent,
            transactionFeeType: modetype,
            transactionFeeOption: {
              for_API_user: "",
              for_Agent: "",
              for_Distributor: "",
              for_M_Distributor: "",
            },
            transactionFeeValue: {
              for_API_user: "",
              for_Agent: "",
              for_Distributor: "",
              for_M_Distributor: "",
            },
          })
        : watch("modes_of_transfer").map((item: any, index: any) => {
            if (!newValue.includes(item.modeName)) {
              remove(index);
            }
          });
    };

    const addBank = async (data: FormValuesProps) => {
      console.log("data", data);
      try {
        let token = localStorage.getItem("token");
        let body = {
          bank_details: {
            ifsc: data.bank.masterIFSC,
            account_number: data.accountNumber,
            bank_name: data.bank.bankName,
            branch_name: data.branch,
            address: data.bankAddress,
          },
          visibleTo_Agent: watch("visibleto").includes("Agent") ? true : false,
          visibleTo_Distributor: watch("visibleto").includes("Distributor")
            ? true
            : false,
          visibleTo_M_Dist: watch("visibleto").includes("Master Distributor")
            ? true
            : false,
          visibleTo_API_User: watch("visibleto").includes("Api User")
            ? true
            : false,
          min_Deposit_Amount: data.minDepositeAmount,
          max_Deposit_Amount: data.maxDepositeAmount,
          modes_of_transfer: data.modes_of_transfer,
        };
        await fetchLocation();
        await Api("admin/fundManagement/add_bank", "POST", body, token).then(
          (Response: any) => {
            console.log("==========>> Se vender List", Response);
            if (isOk(Response)) {
              handleClose();
              reset(defaultValues);
              updateBanksList(Response.data.data);
              enqueueSnackbar(Response.data.message);
            } else {
              notifyFailure(enqueueSnackbar, Response);
            }
          }
        );
      } catch (err) {
        console.log(err);
      }
    };
    return (
      <FormProvider methods={methods} onSubmit={handleSubmit(addBank)}>
        <Box
          sx={style}
          style={{ borderRadius: "20px", overflow: "auto" }}
          width={{ xs: "95%", md: "50%" }}
        >
          <Scrollbar sx={{ maxHeight: 600 }}>
            <Grid
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
              mt={1}
            >
              <RHFAutocomplete
                name="bank"
                freeSolo
                onChange={(event, newValue) => {
                  setValue("bank.bankName", newValue?.bankName);
                  setValue("bank.masterIFSC", newValue?.masterIFSC);
                }}
                options={banksList.map((option: any) => option)}
                getOptionLabel={(option: any) => option.bankName}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option.bankName}
                  </Box>
                )}
                size="small"
                renderInput={(params) => (
                  <RHFTextField
                    name="bank.bankName"
                    label="Bank Name"
                    {...params}
                  />
                )}
              />
              <RHFTextField
                name="bank.masterIFSC"
                label="IFSC code"
                size="small"
                placeholder="IFSC code"
              />
              <RHFTextField
                name="accountNumber"
                label="Account Number"
                size="small"
                placeholder="Account Number"
              />
              <RHFTextField
                name="branch"
                label="Branch Name"
                size="small"
                placeholder="Branch Name"
              />
              <RHFTextField
                name="bankAddress"
                label="Bank Address"
                size="small"
                placeholder="Bank Address"
              />

              <RHFTextField
                name="minDepositeAmount"
                label="Min Deposite Amount"
                size="small"
                placeholder="Min Deposite Amount"
              />
              <RHFTextField
                name="maxDepositeAmount"
                label="Max Deposite Amount"
                size="small"
                placeholder="Max Deposite Amount"
              />

              <RHFAutocomplete
                name="modes"
                multiple
                freeSolo
                onChange={setMode}
                options={modesList}
                getOptionLabel={(option: any) => option.transfer_mode_name}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option.transfer_mode_name}
                  </Box>
                )}
                size="small"
                renderInput={(params) => (
                  <RHFTextField
                    name="mode"
                    label="Select Mode Type"
                    {...params}
                  />
                )}
              />
              <RHFAutocomplete
                name="visibletos"
                multiple
                freeSolo
                onChange={(event, newValue: any) =>
                  setValue("visibleto", newValue)
                }
                options={visibleTo}
                getOptionLabel={(option: any) => option}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option}
                  </Box>
                )}
                size="small"
                renderInput={(params) => (
                  <RHFTextField
                    name="visibleto"
                    label="Select Visible To"
                    {...params}
                  />
                )}
              />
            </Grid>

            {Array.isArray(watch("visibleto")) &&
              watch("visibleto").length > 0 &&
              watch("visibleto").map((client: string, clientIndex: number) => (
                <Accordion
                  key={clientIndex}
                  expanded={expanded === `panel${clientIndex + 1}`}
                  onChange={handleChange(`panel${clientIndex + 1}`)}
                >
                  <AccordionSummary
                    aria-controls={`panel${clientIndex}d-content`}
                    id={`panel${clientIndex}d-header`}
                  >
                    {client}
                  </AccordionSummary>
                  {fields.map((field: any, index: any) => (
                    <AccordionDetails key={field.id}>
                      <Stack
                        flexDirection={"row"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        mb={1}
                      >
                        <Typography variant="subtitle1">
                          {watch("modes_of_transfer")[index].modeName}
                        </Typography>
                        <Typography variant="subtitle2">
                          (
                          {watch("modes_of_transfer")[index].transactionFeeType}
                          )
                        </Typography>
                      </Stack>
                      <Box
                        sx={{ display: "flex" }}
                        justifyContent={"space-around"}
                      >
                        <Stack>
                          <Typography variant="body1">
                            {
                              watch("modes_of_transfer")[index]
                                .transactionFeeType
                            }{" "}
                            Type :
                          </Typography>
                          <RHFRadioGroup
                            name={`modes_of_transfer.${index}.transactionFeeOption.${
                              client === "Agent"
                                ? "for_Agent"
                                : client === "Distributor"
                                ? "for_Distributor"
                                : client === "Master Distributor"
                                ? "for_M_Distributor"
                                : "for_API_user"
                            }`}
                            sx={{ display: "flex", flexDirection: "column" }}
                            options={[
                              { label: "Flat", value: "flat" },
                              { label: "Percentage", value: "percentage" },
                            ]}
                          />
                        </Stack>
                        <Stack>
                          <Typography variant="body1">FeeValue</Typography>
                          <RHFTextField
                            name={`modes_of_transfer.${index}.transactionFeeValue.${
                              client === "Agent"
                                ? "for_Agent"
                                : client === "Distributor"
                                ? "for_Distributor"
                                : client === "Master Distributor"
                                ? "for_M_Distributor"
                                : "for_API_user"
                            }`}
                            sx={{ mt: 1 }}
                            placeholder="Value"
                            label="Value"
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </AccordionDetails>
                  ))}
                </Accordion>
              ))}

            <LoadingButton
              fullWidth
              size="medium"
              type="submit"
              variant="contained"
              sx={{ mt: 1 }}
              loading={isSubmitting}
            >
              Add Bank Account
            </LoadingButton>
          </Scrollbar>
        </Box>
      </FormProvider>
    );
  }
);
const BankEditComponent = React.memo(
  ({
    handleClose,
    defaultValue,
    banksList,
    modesList,
    updateBanksList,
  }: any) => {
    const { Api } = useAuthContext();
    const { enqueueSnackbar } = useSnackbar();
    const [expanded, setExpanded] = React.useState<string | false>("panel1");

    const handleChange =
      (panel: string) =>
      (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
      };

    const visibleTo = [
      "Api User",
      "Agent",
      "Distributor",
      "Master Distributor",
    ];

    const accountValidate = Yup.object().shape({
      bank: Yup.object({
        bankName: Yup.string().required(`Bank Name is Required Field`),
        masterIFSC: Yup.string().required(`IFSC is Required Field`),
      }),
      mode: Yup.array()
        .of(
          Yup.object().shape({
            transfer_mode_name: Yup.string(),
          })
        )
        .min(1, "Mode Type is required Filed"),
      // visibleto: Yup.string().required('visible To is required Filed'),
      accountNumber: Yup.string().required("Account Number is required Field"),
      branch: Yup.string().required("Branch is required Field"),
      bankAddress: Yup.string().required("Bank Address is required Field"),
      minDepositeAmount: Yup.string().required(
        "Minimum Deposite Amount is required Field"
      ),
      maxDepositeAmount: Yup.string().required(
        "Maximum Deposite Amount is required Field"
      ),
    });

    const defaultValues = {
      bank: {
        bankName: defaultValue?.bankDetail?.bank_details?.bank_name || "",
        masterIFSC: defaultValue?.bankDetail?.bank_details?.ifsc || "",
      },
      mode: defaultValue?.modes || [],
      visibleto: defaultValue?.visible || [],
      modes_of_transfer: defaultValue?.bankDetail?.modes_of_transfer || "",
      accountNumber:
        defaultValue?.bankDetail?.bank_details?.account_number || "",
      branch: defaultValue?.bankDetail?.bank_details?.branch_name || "",
      bankAddress: defaultValue?.bankDetail?.bank_details?.address || "",
      minDepositeAmount: defaultValue?.bankDetail?.min_Deposit_Amount || "",
      maxDepositeAmount: defaultValue?.bankDetail?.max_Deposit_Amount || "",
    };

    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(accountValidate),
      defaultValues,
      mode: "all",
    });
    const {
      control,
      reset,
      watch,
      getValues,
      setValue,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = methods;

    const { fields, append, remove }: any = useFieldArray({
      name: "modes_of_transfer",
      control,
    });

    const setMode = (event: any, newValue: any) => {
      setValue("mode", newValue);
      let modeid = "";
      let modetype = "";
      modesList.map((item: any) => {
        if (item.transfer_mode_name == event.target.textContent) {
          modeid = item._id;
          modetype = item.isCharge ? "Charge" : "Commission";
        }
      });
      watch("modes_of_transfer").length < watch("mode").length
        ? append({
            modeId: modeid,
            modeName: event.target.textContent,
            transactionFeeType: modetype,
            transactionFeeOption: {
              for_API_user: "",
              for_Agent: "",
              for_Distributor: "",
              for_M_Distributor: "",
            },
            transactionFeeValue: {
              for_API_user: "",
              for_Agent: "",
              for_Distributor: "",
              for_M_Distributor: "",
            },
          })
        : watch("modes_of_transfer").map((item: any, index: any) => {
            if (!newValue.includes(item.modeName)) {
              remove(index);
            }
          });
    };

    const editBank = (data: FormValuesProps) => {
      try {
        let token = localStorage.getItem("token");
        let body = {
          bank_details: {
            ifsc: data.bank.masterIFSC,
            account_number: data.accountNumber,
            bank_name: data.bank.bankName,
            branch_name: data.branch,
            address: data.bankAddress,
          },
          visibleTo_Agent: watch("visibleto").includes("Agent") ? true : false,
          visibleTo_Distributor: watch("visibleto").includes("Distributor")
            ? true
            : false,
          visibleTo_M_Dist: watch("visibleto").includes("Master Distributor")
            ? true
            : false,
          visibleTo_API_User: watch("visibleto").includes("Api User")
            ? true
            : false,
          min_Deposit_Amount: data.minDepositeAmount,
          max_Deposit_Amount: data.maxDepositeAmount,
          modes_of_transfer: data.modes_of_transfer,
        };

        Api(
          "admin/fundManagement/update_bank/" + defaultValue?.bankDetail?._id,
          "POST",
          body,
          token
        ).then((Response: any) => {
          console.log("==========>> Update bank", Response);
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              handleClose();
              reset(defaultValues);
              updateBanksList(Response.data.data);
              enqueueSnackbar(Response.data.message);
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        });
      } catch (err) {
        console.log(err);
      }
    };
    return (
      <FormProvider methods={methods} onSubmit={handleSubmit(editBank)}>
        <Box
          sx={style}
          style={{ borderRadius: "20px", overflow: "auto" }}
          width={{ xs: "95%", md: "50%" }}
        >
          <Scrollbar sx={{ maxHeight: 600 }}>
            <Grid
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
              my={1}
            >
              <RHFAutocomplete
                name="bank"
                freeSolo
                onChange={(event, newValue) => {
                  setValue("bank.bankName", newValue?.bankName);
                  setValue("bank.masterIFSC", newValue?.masterIFSC);
                }}
                options={banksList.map((option: any) => option)}
                getOptionLabel={(option: any) => option.bankName}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option.bankName}
                  </Box>
                )}
                size="small"
                renderInput={(params) => (
                  <RHFTextField
                    name="bank.bankName"
                    label="Bank Name"
                    {...params}
                  />
                )}
              />
              <RHFTextField
                name="bank.masterIFSC"
                label="IFSC code"
                size="small"
                placeholder="IFSC code"
              />
              <RHFTextField
                name="accountNumber"
                label="Account Number"
                size="small"
                placeholder="Account Number"
              />
              <RHFTextField
                name="branch"
                label="Branch Name"
                size="small"
                placeholder="Branch Name"
              />
              <RHFTextField
                name="bankAddress"
                label="Bank Address"
                size="small"
                placeholder="Bank Address"
              />

              <RHFTextField
                name="minDepositeAmount"
                label="Min Deposite Amount"
                size="small"
                placeholder="Min Deposite Amount"
              />
              <RHFTextField
                name="maxDepositeAmount"
                label="Max Deposite Amount"
                size="small"
                placeholder="Max Deposite Amount"
              />

              <RHFAutocomplete
                name="modes"
                multiple
                freeSolo
                onChange={setMode}
                options={modesList}
                defaultValue={defaultValue?.modes}
                getOptionLabel={(option: any) => option.transfer_mode_name}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option.transfer_mode_name}
                  </Box>
                )}
                size="small"
                renderInput={(params) => (
                  <RHFTextField
                    name="mode"
                    label="Select Mode Type"
                    {...params}
                  />
                )}
              />
              <RHFAutocomplete
                name="visibletos"
                multiple
                freeSolo
                defaultValue={defaultValue?.visible}
                onChange={(event, newValue: any) =>
                  setValue("visibleto", newValue)
                }
                options={visibleTo}
                getOptionLabel={(option: any) => option}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    {option}
                  </Box>
                )}
                size="small"
                renderInput={(params) => (
                  <RHFTextField
                    name="visibleto"
                    label="Select Visible To"
                    {...params}
                  />
                )}
              />
            </Grid>

            {Array.isArray(watch("visibleto")) &&
              watch("visibleto").length > 0 &&
              watch("visibleto").map((client: string, clientIndex: number) => (
                <Accordion
                  key={clientIndex}
                  expanded={expanded === `panel${clientIndex + 1}`}
                  onChange={handleChange(`panel${clientIndex + 1}`)}
                >
                  <AccordionSummary
                    aria-controls={`panel${clientIndex}d-content`}
                    id={`panel${clientIndex}d-header`}
                  >
                    {client}
                  </AccordionSummary>
                  {fields.map((field: any, index: any) => (
                    <AccordionDetails key={field.id}>
                      <Stack
                        flexDirection={"row"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        mb={1}
                      >
                        <Typography variant="subtitle1">
                          {watch("modes_of_transfer")[index].modeName}
                        </Typography>
                        <Typography variant="subtitle2">
                          (
                          {watch("modes_of_transfer")[index].transactionFeeType}
                          )
                        </Typography>
                      </Stack>
                      <Box
                        sx={{ display: "flex" }}
                        justifyContent={"space-around"}
                      >
                        <Stack>
                          <Typography variant="body1">
                            {
                              watch("modes_of_transfer")[index]
                                .transactionFeeType
                            }{" "}
                            Type :
                          </Typography>
                          <RHFRadioGroup
                            name={`modes_of_transfer.${index}.transactionFeeOption.${
                              client === "Agent"
                                ? "for_Agent"
                                : client === "Distributor"
                                ? "for_Distributor"
                                : client === "Master Distributor"
                                ? "for_M_Distributor"
                                : "for_API_user"
                            }`}
                            sx={{ display: "flex", flexDirection: "column" }}
                            options={[
                              { label: "Flat", value: "flat" },
                              { label: "Percentage", value: "percentage" },
                            ]}
                          />
                        </Stack>
                        <Stack>
                          <Typography variant="body1">FeeValue</Typography>
                          <RHFTextField
                            name={`modes_of_transfer.${index}.transactionFeeValue.${
                              client === "Agent"
                                ? "for_Agent"
                                : client === "Distributor"
                                ? "for_Distributor"
                                : client === "Master Distributor"
                                ? "for_M_Distributor"
                                : "for_API_user"
                            }`}
                            sx={{ mt: 1 }}
                            placeholder="Value"
                            label="Value"
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </AccordionDetails>
                  ))}
                </Accordion>
              ))}

            <LoadingButton
              fullWidth
              size="medium"
              type="submit"
              variant="contained"
              sx={{ mt: 1 }}
              loading={isSubmitting}
            >
              Save Bank Account
            </LoadingButton>
          </Scrollbar>
        </Box>
      </FormProvider>
    );
  }
);
