import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  SwitchProps,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  styled,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { TableHeadCustom, TableNoData } from "src/components/table";
import { useSnackbar } from "notistack";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";

function RoleWiseControls() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [identifier, setIdentifier] = React.useState<any>();
  const [services, setServices] = useState<any>([]);
  const useRole = ["Agent", "Distributor", "M_Distributor", "API_User"];

  useEffect(() => {
    GetAutocollectList();
  }, []);
  const GetAutocollectList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/autoCollect/fetch`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setIdentifier(Response.data.data[0]);
        setServices(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const updateStatus = (e: any, role: string) => {
    let token = localStorage.getItem("token");

    let body = {
      serviceId: e?._id,
      isEnabled:
        role == "Agent"
          ? !e.isEnabledForAgent
          : role == "Distributor"
          ? !e.isEnabledForDistributor
          : role == "M_Distributor"
          ? !e.isEnabledForMasterDistributor
          : !e.isEnabledForPartner,
      role:
        role == "Agent"
          ? "agent"
          : role == "Distributor"
          ? "distributor"
          : role == "M_Distributor"
          ? "m_distributor"
          : "partner",
    };

    Api(
      `admin/autoCollect/update/service/role/switch`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      // Item 1b: the autocollect switch reported success on the transport
      // status alone, so a refused toggle still flipped the switch on screen and
      // toasted a save that never happened.
      if (isOk(Response)) {
        notifyOk(enqueueSnackbar, Response);

        const updatedServices = services.map((item: any) => {
          const newItem = { ...item };
          const isServiceMatched = item.services?.some(
            (val: any) =>
              val?._id === Response?.data?.data?.serviceId &&
              (Response?.data?.data?.role === "agent" ||
                Response?.data?.data?.role === "distributor" ||
                Response?.data?.data?.role === "m_distributor" ||
                Response?.data?.data?.role === "partner")
          );

          if (isServiceMatched) {
            newItem.services?.forEach((otherItem: any) => {
              if (
                otherItem._id === Response?.data?.data?.serviceId &&
                Response?.data?.data?.role === "agent"
              ) {
                otherItem.isEnabledForAgent = !otherItem.isEnabledForAgent;
              } else if (
                otherItem._id === Response?.data?.data?.serviceId &&
                Response?.data?.data?.role === "distributor"
              ) {
                otherItem.isEnabledForDistributor =
                  !otherItem.isEnabledForDistributor;
              } else if (
                otherItem._id === Response?.data?.data?.serviceId &&
                Response?.data?.data?.role === "m_distributor"
              ) {
                otherItem.isEnabledForMasterDistributor =
                  !otherItem.isEnabledForMasterDistributor;
              } else if (
                otherItem._id === Response?.data?.data?.serviceId &&
                Response?.data?.data?.role === "partner"
              ) {
                otherItem.isEnabledForPartner = !otherItem.isEnabledForPartner;
              }
            });
          }

          return newItem;
        });

        setServices(updatedServices);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const IOSSwitch = styled((props: SwitchProps) => (
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

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setIdentifier(newValue);
  };

  return (
    <>
      <Grid display="grid">
        <Card
          sx={{ background: "#FFF8F8", p: 3, boxShadow: 5, borderRadius: 1 }}
        >
          <Typography style={{ fontWeight: "bold" }} variant="body1">
            Role-wise Controls
          </Typography>

          <Stack flexDirection={"row"} justifyContent={"space-between"} p={1}>
            <Tabs
              value={identifier}
              onChange={handleChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                ".MuiTabs-indicator": {
                  marginBottom: 1,
                },
              }}
            >
              {services.map((item: any) => (
                <Tab
                  key={item?.autoCollectIdentifier}
                  value={item}
                  label={item.autoCollectIdentifier}
                  sx={{ fontWeight: "bold" }}
                />
              ))}
            </Tabs>
          </Stack>

          <Card sx={{ mt: 2 }}>
            <TableContainer sx={{ overflow: "unset" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Typography>Role</Typography>
                      </Stack>
                    </TableCell>

                    {identifier?.services.map((row: any) => (
                      <TableCell key={row?._id}>
                        <Stack direction="row" spacing={1}>
                          <Typography>{row.serviceName}</Typography>
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {identifier?.services.length ? (
                    <>
                      {" "}
                      {useRole?.map((role) => (
                        <TableRow key={role}>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Typography>{role}</Typography>
                            </Stack>
                          </TableCell>
                          {identifier?.services.map((row: any) => (
                            <TableCell key={row?._id}>
                              <Stack direction="row" spacing={1}>
                                <IOSSwitch
                                  color="error"
                                  onChange={() => updateStatus(row, role)}
                                  checked={
                                    role === "Agent"
                                      ? row?.isEnabledForAgent
                                      : role === "Distributor"
                                      ? row?.isEnabledForDistributor
                                      : role === "M_Distributor"
                                      ? row?.isEnabledForMasterDistributor
                                      : role === "API_USER"
                                      ? row?.isEnabledForPartner
                                      : false
                                  }
                                />
                              </Stack>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}{" "}
                    </>
                  ) : (
                    <TableNoData isNotFound={!identifier?.services} />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Card>
      </Grid>
    </>
  );
}

export default RoleWiseControls;
