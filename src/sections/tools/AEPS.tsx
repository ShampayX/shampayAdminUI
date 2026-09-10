import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Stack,
  Grid,
  FormGroup,
  FormControlLabel,
  styled,
  Switch,
  Box,
  Divider,
  MenuItem,
  CardContent,
  SwitchProps,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";

import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from "../../components/hook-form";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomAvatar } from "src/components/custom-avatar";
import { sentenceCase } from "change-case";
import { isOk, notifyFailure } from "src/utils/apiResult";

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 40,
  height: 22,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: "0 -2px",
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

function AEPS() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState("settlement tools");
  const [isLoadingServiceStatus, setIsLoadingServiceStatus] = useState(false);
  const [isLoadingHoldApi, setIsLoadingHoldApi] = useState(false);
  const [isLoadingHoldAgent, setIsLoadingHoldAgent] = useState(false);
  const [aepsAgentHold, setAepsAgentHold] = useState("");
  const [aepsApiHold, setAepsApiHold] = useState("");
  const [aepsServiceStatus, setAepsServiceStatus] = useState<boolean>();
  const [aepsTxnAgentHold, setAepsTxnAgentHold] = useState<boolean>();
  const [aepsTxnApiHold, setAepsTxnApiHold] = useState<boolean>();
  const [isEditAgent, setIsEditAgent] = useState(false);
  const [isEditApi, setIsEditApi] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aepsLoading, setAepsLoading] = useState(false);
  const [aeps, setAeps] = useState<number | null>(0);
  const [reconLoading, setReconLoading] = useState(false);
  const [agentSattlementSlab, setAgentSattlementSlab] = useState([
    {
      minSlab: 0,
      maxSlab: 0,
      charge: 0,
      _id: 1,
    },
    {
      minSlab: 0,
      maxSlab: 0,
      charge: 0,
      _id: 2,
    },
    {
      minSlab: 0,
      maxSlab: 0,
      charge: 0,
      _id: 3,
    },
  ]);
  const [apiSattlementSlab, setApiSattlementSlab] = useState([
    {
      minSlab: 0,
      maxSlab: 0,
      charge: 0,
      _id: 1,
    },
    {
      minSlab: 0,
      maxSlab: 0,
      charge: 0,
      _id: 2,
    },
    {
      minSlab: 0,
      maxSlab: 0,
      charge: 0,
      _id: 3,
    },
  ]);

  const category = [
    { id: 1, cateName: "settlement tools" },
    { id: 2, cateName: "aeps tools" },
    { id: 3, cateName: "3 Way Recon" },
  ];

  const handleChangeTab = (state: any, val: string) => {
    setCurrentTab(val);
  };

  useEffect(() => {
    getSlab();
  }, []);

  useEffect(() => {
    aepsCharge();
  }, []);

  function getSlab() {
    let token = localStorage.getItem("token");
    Api(`admin/adminDetails`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        if (Response.data.data.agentSettlementSlab.length) {
          setAgentSattlementSlab(Response.data.data.agentSettlementSlab);
        }
        if (Response.data.data.apiUserSettlementSlab.length) {
          setApiSattlementSlab(Response.data.data.apiUserSettlementSlab);
        }
        setAepsAgentHold(Response.data.data.settlementWalletHoldAmountForAgent);
        setAepsApiHold(Response.data.data.settlementWalletHoldAmountForApiUser);
        setAepsServiceStatus(Response.data.data.isSettlementServiceEnable);
        setAepsTxnAgentHold(
          Response.data.data.isSettlementTransactionOnHoldForAgent
        );
        setAepsTxnApiHold(
          Response.data.data.isSettlementTransactionOnHoldForApiUser
        );
        setAeps(Response.data.data.AEPS_Reg_Charge);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  }

  const saveHoldAmountAgent = () => {
    let token = localStorage.getItem("token");
    const body = {
      settlementWalletHoldAmountForAgent: aepsAgentHold,
    };
    Api(
      `admin/set_settlement_wallet_hold_amount_agent`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        setIsEditAgent(!isEditAgent);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const saveHoldAmountApiUser = () => {
    setIsEditApi(!isEditApi);
    let token = localStorage.getItem("token");
    const body = {
      settlementWalletHoldAmountForApiUser: aepsApiHold,
    };
    Api(
      `admin/set_settlement_wallet_hold_amount_apiUser`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  function setStatus() {
    setIsLoadingServiceStatus(true);
    let token = localStorage.getItem("token");
    const body = {
      isSettlementServiceEnable: !aepsServiceStatus,
    };
    Api(`admin/set_settlement_service_status`, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setAepsServiceStatus(!aepsServiceStatus);
          enqueueSnackbar("Service Status Update successfully");
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        setIsLoadingServiceStatus(false);
      }
    );
  }

  function txnHoldAgent() {
    setIsLoadingHoldAgent(true);
    let token = localStorage.getItem("token");
    const body = {
      isSettlementTransactionOnHoldForAgent: !aepsTxnAgentHold,
    };
    Api(
      `admin/set_settlement_transaction_hold_status_agent`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        setAepsTxnAgentHold(!aepsTxnAgentHold);
        enqueueSnackbar("Service Status Update successfully");
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsLoadingHoldAgent(false);
    });
  }

  const aepsCharge = () => {
    setAepsLoading(true);
    let token = localStorage.getItem("token");
    const body = {
      AEPS_Reg_Charge: aeps,
    };
    Api(`admin/set_AEPS_registration_charge`, "POST", body, token).then(
      (Response: any) => {
        // Item 1c: the failure branch silently put the field back into edit mode
        // with no explanation - the toast was commented out.
        if (isOk(Response)) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
          notifyFailure(enqueueSnackbar, Response);
        }
        setAepsLoading(false);
      }
    );
  };

  function txnHoldApi() {
    setIsLoadingHoldApi(true);
    let token = localStorage.getItem("token");
    const body = {
      isSettlementTransactionOnHoldForApiUser: !aepsTxnApiHold,
    };
    Api(
      `admin/set_settlement_transaction_hold_status_apiUser`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        setAepsTxnApiHold(!aepsTxnApiHold);
        enqueueSnackbar("Service Status Update successfully");
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsLoadingHoldApi(false);
    });
  }

  const HandleRecon = () => {
    setReconLoading(true);
    let token = localStorage.getItem("token");

    Api(`adminTransaction/aeps/3_way_recon`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setReconLoading(false);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
            setReconLoading(false);
          }
          setReconLoading(false);
        } else {
          setReconLoading(false);
        }
      }
    );
  };

  const IOSSwitch = styled((props: any) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "#65C466",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: theme.palette.primary.main,
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: "#ff0000",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        aria-label="basic tabs example"
        sx={{ background: "#F4F6F8", padding: "0 20px", height: "48px" }}
      >
        {category.map((item: any) => {
          return (
            <Tab
              key={item.id}
              sx={{ mx: 3 }}
              label={
                <h4 style={{ marginBlockStart: "10px", fontSize: "18px" }}>
                  {item.cateName}{" "}
                </h4>
              }
              value={item.cateName}
            />
          );
        })}
      </Tabs>
      <Stack m={3}>
        {currentTab == "aeps tools" ? (
          <>
            <Stack>
              <Typography variant="h5">Charge For AEPS</Typography>
              <Stack flexDirection={"row"} gap={2} mt={2}>
                <TextField
                  variant="outlined"
                  label="charge"
                  defaultValue={aeps}
                  type="number"
                  size="small"
                  disabled={!isEditing}
                  value={aeps}
                  onChange={(e) => setAeps((e.target as any).value)}
                />
                <LoadingButton
                  variant="contained"
                  loading={aepsLoading}
                  onClick={() =>
                    isEditing ? aepsCharge() : setIsEditing(!isEditing)
                  }
                >
                  {isEditing ? "Save" : "Edit"}
                </LoadingButton>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack>
                <Typography variant="h4">
                  Update AEPS Onboarding Status
                </Typography>
                <UpdateAepsOnBoardingStatus />
              </Stack>
            </Stack>
          </>
        ) : currentTab == "3 Way Recon" ? (
          <>
            <Stack>
              <Typography variant="h5" mt={2}>
                3 Way Recon
              </Typography>
              <Stack flexDirection={"row"} gap={3} mt={3}>
                <LoadingButton
                  variant="contained"
                  onClick={HandleRecon}
                  loading={reconLoading}
                >
                  Start 3 Way Recon
                </LoadingButton>
              </Stack>
            </Stack>
          </>
        ) : (
          <>
            <Stack
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"center"}
              gap={5}
              mb={5}
            >
              <Typography variant="h5">Settlement service status</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      sx={{ m: 1, cursor: "pointer" }}
                      checked={aepsServiceStatus}
                      disabled={isLoadingServiceStatus}
                      onClick={setStatus}
                    />
                  }
                  label={<h3>{aepsServiceStatus ? "Active" : "Disable"}</h3>}
                />
              </FormGroup>
            </Stack>
            <Grid
              gap={2}
              display={"grid"}
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)",
              }}
            >
              <Stack>
                <AgentSettlement
                  agentSettlementSlab={agentSattlementSlab}
                  aepsTxnAgentHold={aepsTxnAgentHold} //35c50b565de54778ee550c48fd115aa4a88e5444
                  aepsServiceStatus={aepsServiceStatus} //d499464f8b58459568fd7c36b68031d6ef11b5be
                />{" "}
                <Box sx={{ p: 2, mt: 2, bgcolor: "#D4DADF", borderRadius: 2 }}>
                  <Stack>
                    <Stack flexDirection={"row"} alignItems={"center"} gap={2}>
                      <Typography variant="h5">
                        Hold Wallet Amount for Agent is
                      </Typography>{" "}
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <IOSSwitch
                              sx={{ m: 1, cursor: "pointer" }}
                              checked={aepsTxnAgentHold}
                              disabled={isLoadingHoldAgent}
                              onClick={txnHoldAgent}
                            />
                          }
                          label={
                            <h3>{aepsTxnAgentHold ? "Active" : "Disable"}</h3>
                          }
                        />
                      </FormGroup>
                    </Stack>
                    <Stack flexDirection={"row"} gap={2}>
                      <TextField
                        id="outlined-basic"
                        // label={row.minSlab}
                        variant="outlined"
                        size="small"
                        disabled={!isEditAgent}
                        value={aepsAgentHold}
                        onChange={(e) => setAepsAgentHold(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={() =>
                          isEditAgent
                            ? saveHoldAmountAgent()
                            : setIsEditAgent(!isEditAgent)
                        }
                      >
                        {isEditAgent ? "Save" : "Edit"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
              <Stack>
                <ApiSettlement
                  apiSettlementSlab={apiSattlementSlab}
                  aepsTxnApiHold={aepsTxnApiHold}
                  aepsServiceStatus={aepsServiceStatus}
                />
                <Box sx={{ p: 2, mt: 2, bgcolor: "#D4DADF", borderRadius: 2 }}>
                  <Stack
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Stack>
                      <Stack
                        flexDirection={"row"}
                        alignItems={"center"}
                        gap={2}
                      >
                        <Typography variant="h5">
                          Hold Wallet Amount for API user is
                        </Typography>{" "}
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <IOSSwitch
                                sx={{ m: 1, cursor: "pointer" }}
                                checked={aepsTxnApiHold}
                                disabled={isLoadingHoldApi}
                                onClick={txnHoldApi}
                              />
                            }
                            label={
                              <h3>{aepsTxnApiHold ? "Active" : "Disable"}</h3>
                            }
                          />
                        </FormGroup>
                      </Stack>
                      <Stack flexDirection={"row"} gap={2}>
                        <TextField
                          id="outlined-basic"
                          variant="outlined"
                          size="small"
                          disabled={!isEditApi}
                          value={aepsApiHold}
                          onChange={(e) => setAepsApiHold(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          onClick={() =>
                            isEditApi
                              ? saveHoldAmountApiUser()
                              : setIsEditApi(!isEditApi)
                          }
                        >
                          {isEditApi ? "Save" : "Edit"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </>
        )}
      </Stack>
    </>
  );
}

function AgentSettlement({ agentSettlementSlab }: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [edit, setEdit] = useState(false);

  const tableLabels = [
    { id: 1, label: "MinSlab" },
    { id: 2, label: "MaxSlab" },
    { id: 3, label: "Charge" },
  ];

  function validation() {
    if (
      Number(agentSettlementSlab[0].minSlab) < 100 ||
      Number(agentSettlementSlab[1].minSlab) < 100 ||
      Number(agentSettlementSlab[2].minSlab) < 100
    ) {
      enqueueSnackbar("For slabs minimum value 100 is allowed");
      return false;
    } else if (
      Number(agentSettlementSlab[0].maxSlab) > 50000 ||
      Number(agentSettlementSlab[1].maxSlab) > 50000 ||
      Number(agentSettlementSlab[2].maxSlab) > 50000
    ) {
      enqueueSnackbar("For slabs maximum value 50000 is allowed");
      return false;
    } else if (
      Number(agentSettlementSlab[0].maxSlab) <
        Number(agentSettlementSlab[0].minSlab) ||
      Number(agentSettlementSlab[1].maxSlab) <
        Number(agentSettlementSlab[1].minSlab) ||
      Number(agentSettlementSlab[2].maxSlab) <
        Number(agentSettlementSlab[2].minSlab)
    ) {
      enqueueSnackbar("Please check maxSlab is greater then minSlab");
      return false;
    } else if (
      Number(agentSettlementSlab[1].minSlab) !==
        Number(agentSettlementSlab[0].maxSlab) + 1 ||
      Number(agentSettlementSlab[2].minSlab) !==
        Number(agentSettlementSlab[1].maxSlab) + 1
    ) {
      enqueueSnackbar(
        "Please check minSlab value is only +1 then previous maxSlab value"
      );
      return false;
    } else {
      return true;
    }
  }

  async function saveSlab() {
    let validate = await validation();

    if (validate == true) {
      let slabs: any[] = [];
      agentSettlementSlab.forEach((item: any) => {
        delete item._id;
        slabs.push(item);
      });
      let token = localStorage.getItem("token");
      const body = {
        agentSettlementSlab: slabs,
      };
      Api(`admin/set_agent_settlement_slab`, "POST", body, token).then(
        (Response: any) => {
          if (isOk(Response)) {
            setEdit(false);
            agentSettlementSlab = agentSettlementSlab;
            enqueueSnackbar(Response.data.message);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    }
  }

  return (
    <Card>
      <Stack justifyContent={"space-between"} flexDirection={"row"} m={1}>
        <Typography variant="h5">Agent Settlement Slab</Typography>
        {edit ? (
          <Button variant="contained" onClick={() => saveSlab()}>
            Save
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setEdit(!edit)}>
            Edit
          </Button>
        )}
      </Stack>
      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              <TableRow hover>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[0].minSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[0].minSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[0].minSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[0].maxSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[0].maxSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[0].maxSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[0].charge}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[0].charge = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[0].charge}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      placeholder={agentSettlementSlab[1].minSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[1].minSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[1]?.minSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[1].maxSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[1].maxSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[1]?.maxSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[1].charge}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[1].charge = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[1]?.charge}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[2].minSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[2].minSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[2]?.minSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[2].maxSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[2].maxSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[2]?.maxSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={agentSettlementSlab[2].charge}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (agentSettlementSlab[2].charge = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{agentSettlementSlab[2]?.charge}</Typography>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

function ApiSettlement({ apiSettlementSlab }: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [edit, setEdit] = useState(false);

  const tableLabels = [
    { id: 1, label: "MinSlab" },
    { id: 2, label: "MaxSlab" },
    { id: 3, label: "Charge" },
  ];

  function validation() {
    if (
      Number(apiSettlementSlab[0].minSlab) < 100 ||
      Number(apiSettlementSlab[1].minSlab) < 100 ||
      Number(apiSettlementSlab[2].minSlab) < 100
    ) {
      enqueueSnackbar("For slabs minimum value 100 is allowed");
      return false;
    } else if (
      Number(apiSettlementSlab[0].maxSlab) > 50000 ||
      Number(apiSettlementSlab[1].maxSlab) > 50000 ||
      Number(apiSettlementSlab[2].maxSlab) > 50000
    ) {
      enqueueSnackbar("For slabs maximum value 50000 is allowed");
      return false;
    } else if (
      Number(apiSettlementSlab[0].maxSlab) <
        Number(apiSettlementSlab[0].minSlab) ||
      Number(apiSettlementSlab[1].maxSlab) <
        Number(apiSettlementSlab[1].minSlab) ||
      Number(apiSettlementSlab[2].maxSlab) <
        Number(apiSettlementSlab[2].minSlab)
    ) {
      enqueueSnackbar("Please check maxSlab is greater then minSlab");
      return false;
    } else if (
      Number(apiSettlementSlab[1].minSlab) !==
        Number(apiSettlementSlab[0].maxSlab) + 1 ||
      Number(apiSettlementSlab[2].minSlab) !==
        Number(apiSettlementSlab[1].maxSlab) + 1
    ) {
      enqueueSnackbar(
        "Please check minSlab value is only +1 then previous maxSlab value"
      );
      return false;
    } else {
      return true;
    }
  }

  async function saveSlab() {
    let validate = await validation();

    if (validate == true) {
      let slabs: any[] = [];
      apiSettlementSlab.forEach((item: any) => {
        delete item._id;
        slabs.push(item);
      });
      let token = localStorage.getItem("token");
      const body = {
        apiUserSettlementSlab: slabs,
      };
      Api(`admin/set_apiUser_settlement_slab`, "POST", body, token).then(
        (Response: any) => {
          if (isOk(Response)) {
            setEdit(false);
            apiSettlementSlab = [...apiSettlementSlab];
            enqueueSnackbar(Response.data.message);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    }
  }

  function handleChange(row: any, mdist: any, key: any, i: any) {
    row[key] = Number(mdist.target.value);
    apiSettlementSlab.splice(i, 1, row);
  }

  return (
    <Card>
      <Stack justifyContent={"space-between"} flexDirection={"row"} m={1}>
        <Typography variant="h5">Api Settlement Slab</Typography>
        {edit ? (
          <Button variant="contained" onClick={() => saveSlab()}>
            Save
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setEdit(!edit)}>
            Edit
          </Button>
        )}
      </Stack>
      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              <TableRow hover>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[0].minSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[0].minSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[0].minSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[0].maxSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[0].maxSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[0].maxSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[0].charge}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[0].charge = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[0].charge}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      placeholder={apiSettlementSlab[1].minSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[1].minSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[1]?.minSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[1].maxSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[1].maxSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[1]?.maxSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[1].charge}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[1].charge = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[1]?.charge}</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[2].minSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[2].minSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[2]?.minSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[2].maxSlab}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[2].maxSlab = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[2]?.maxSlab}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {edit ? (
                    <TextField
                      id="outlined-basic"
                      label={apiSettlementSlab[2].charge}
                      variant="outlined"
                      sx={{ width: 100 }}
                      size="small"
                      onChange={(e) =>
                        (apiSettlementSlab[2].charge = e.target.value)
                      }
                    />
                  ) : (
                    <Typography>{apiSettlementSlab[2]?.charge}</Typography>
                  )}
                </TableCell>
              </TableRow>
              {/* {apiSettlementSlab.map((row: any, index: number) => (
                <TableRow hover key={row.id}>
                  <TableCell>
                    {edit ? (
                      <TextField
                        id="outlined-basic"
                        label={row.minSlab}
                        variant="outlined"
                        sx={{ width: 100 }}
                        size="small"
                        // onChange={(e) => {
                        //   row.minSlab = e.target.value;
                        //           }}
                        onChange={(chargeT) => handleChange(row, chargeT, 'minSlab', index)}
                      />
                    ) : (
                      <Typography>{row.minSlab}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit ? (
                      <TextField
                        id="outlined-basic"
                        label={row.maxSlab}
                        variant="outlined"
                        sx={{ width: 100 }}
                        size="small"
                        onChange={(chargeT) => handleChange(row, chargeT, 'maxSlab', index)}
                      />
                    ) : (
                      <Typography>{row.maxSlab}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit ? (
                      <TextField
                        id="outlined-basic"
                        label={row.charge}
                        variant="outlined"
                        sx={{ width: 100 }}
                        size="small"
                        onChange={(chargeT) => handleChange(row, chargeT, 'charge', index)}
                      />
                    ) : (
                      <Typography>{row.charge}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

type FormValuesProps = {
  User: string;
  usersearchby: string;
  userDetail: {
    firstName: string;
    lastName: string;
    userCode: string;
    contact_no: string;
    selfie: string;
    role: string;
    email: string;
    fingPayAEPSKycStatus: boolean;
    fingPayAPESRegistrationStatus: boolean;
    _id: string;
  };
};

function UpdateAepsOnBoardingStatus() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [userList, setUserList] = useState([]);
  const ValidationSchema = Yup.object().shape({});

  const defaultValues = {
    User: "",
    usersearchby: "",
    userDetail: {
      firstName: "",
      lastName: "",
      userCode: "",
      contact_no: "",
      selfie: "",
      role: "",
      email: "",
      fingPayAEPSKycStatus: false,
      fingPayAPESRegistrationStatus: false,
      _id: "",
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ValidationSchema),
    defaultValues,
  });

  const {
    watch,
    getValues,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    searchFromUser(getValues("User"));
  }, [watch("User")]);

  const searchFromUser = (val: string) => {
    const token = localStorage.getItem("token");
    let body = {
      searchBy: watch("usersearchby"),
      role: "agent",
      searchInput: val,
      finalStatus: "approved",
    };
    val?.length > 2
      ? Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
          if (isOk(Response)) {
            setUserList(Response.data.data);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        })
      : setUserList([]);
  };

  const handleChange = async (kyc: boolean, registration: boolean) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        fingPay: {},
        fingPayPin: "",
        fingPayAEPSKycStatus: kyc,
        fingPayAPESRegistrationStatus: registration,
      };
      await Api(
        `admin/edit_user/${getValues("userDetail._id")}`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          setValue("userDetail.fingPayAEPSKycStatus", kyc);
          setValue("userDetail.fingPayAPESRegistrationStatus", registration);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      });
    } catch (e) {}
  };

  const userDetailFormat = (name: string, value: any) => {
    return (
      <Stack flexDirection={"row"} justifyContent={"space-between"} mt={1}>
        <Typography variant="subtitle1" noWrap>
          {name} :{" "}
        </Typography>
        <Typography variant="subtitle1">{value}</Typography>
      </Stack>
    );
  };

  return (
    <FormProvider methods={methods}>
      <Stack
        flexDirection="row"
        my={1}
        gap={1}
        width={{ xs: "100%", sm: "75%", md: "50%" }}
      >
        <RHFSelect
          name="usersearchby"
          label="Search By"
          placeholder="Search By"
          SelectProps={{
            native: false,
            sx: { textTransform: "capitalize" },
          }}
        >
          <MenuItem value={"userCode"}>User Code</MenuItem>
          <MenuItem value={"firstName"}>First Name</MenuItem>
          <MenuItem value={"contact_no"}>Contact Number</MenuItem>
          <MenuItem value={"email"}>Email</MenuItem>
        </RHFSelect>

        <Stack sx={{ position: "relative", minWidth: "300px" }}>
          <RHFTextField
            fullWidth
            name="User"
            autoComplete="off"
            placeholder={"Type here..."}
            disabled={!watch("usersearchby")}
          />
          {userList.length > 0 && (
            <Stack
              sx={{
                position: "absolute",
                top: 40,
                zIndex: 19900,
                width: "100%",
                bgcolor: "white",
                border: "1px solid grey",
                borderRadius: 2,
              }}
            >
              <Scrollbar sx={{ maxHeight: 400 }}>
                {userList.map((item: any) => {
                  return (
                    <Typography
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        color: "grey",
                        "&:hover": { color: "black" },
                      }}
                      onClick={() => {
                        setUserList([]);
                        setValue("User", `${item.firstName} ${item.lastName}`);
                        setValue("userDetail.firstName", `${item.firstName}`);
                        setValue("userDetail.lastName", `${item.lastName}`);
                        setValue("userDetail.contact_no", `${item.contact_no}`);
                        setValue("userDetail.email", `${item.email}`);
                        setValue("userDetail.role", `${item.role}`);
                        setValue("userDetail.selfie", `${item.selfie[0]}`);
                        setValue("userDetail.userCode", `${item.userCode}`);
                        setValue("userDetail._id", `${item._id}`);
                        setValue(
                          "userDetail.fingPayAEPSKycStatus",
                          item.fingPayAEPSKycStatus
                        );
                        setValue(
                          "userDetail.fingPayAPESRegistrationStatus",
                          item.fingPayAPESRegistrationStatus
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
          )}
        </Stack>

        {!!watch("User") && (
          <Button variant="outlined" onClick={() => reset(defaultValues)}>
            Clear
          </Button>
        )}
      </Stack>
      {watch("userDetail.userCode") && (
        <Card sx={{ p: 1, width: 400 }}>
          <CardContent>
            <Card sx={{ p: 1 }}>
              <Stack flexDirection={"row"} justifyContent={"center"}>
                <CustomAvatar
                  name={getValues("userDetail.firstName")}
                  alt={getValues("userDetail.selfie")}
                  src={getValues("userDetail.selfie")}
                  sx={{ width: 250, height: 250 }}
                />
              </Stack>
              <Stack direction="row" alignItems="center" gap={2} mt={2}>
                <Stack>
                  <Typography variant="subtitle1">
                    {sentenceCase(getValues("userDetail.firstName"))}{" "}
                    {sentenceCase(getValues("userDetail.lastName"))}
                  </Typography>
                  <Typography variant="subtitle2">
                    {sentenceCase(getValues("userDetail.role"))}(
                    {sentenceCase(getValues("userDetail.userCode"))})
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            <Stack mt={2}>
              {userDetailFormat(
                "Contact No",
                getValues("userDetail.contact_no") || ""
              )}
              {userDetailFormat("Email", getValues("userDetail.email") || "")}
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                my={1}
              >
                <Typography>AEPS Registration</Typography>
                <IOSSwitch
                  checked={watch("userDetail.fingPayAPESRegistrationStatus")}
                  onClick={() =>
                    handleChange(
                      !!getValues("userDetail.fingPayAEPSKycStatus"),
                      !getValues("userDetail.fingPayAPESRegistrationStatus")
                    )
                  }
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                my={1}
              >
                <Typography>AEPS KYC status</Typography>
                <IOSSwitch
                  checked={watch("userDetail.fingPayAEPSKycStatus")}
                  onClick={() =>
                    handleChange(
                      !getValues("userDetail.fingPayAEPSKycStatus"),
                      !!getValues("userDetail.fingPayAPESRegistrationStatus")
                    )
                  }
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </FormProvider>
  );
}

export default AEPS;
