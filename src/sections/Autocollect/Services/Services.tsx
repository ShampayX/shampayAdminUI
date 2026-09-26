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
  TableRow,
  Tabs,
  styled,
  Typography,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { TableHeadCustom, TableNoData } from "src/components/table";
import { useSnackbar } from "notistack";
import RoleWiseControls from "./RoleWiseControls";
import UserWiseControls from "./UserWiseControls";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";

function Services() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [services, setServices] = useState([]);
  const [identifier, setIdentifier] = React.useState<any>();
  const TABLE_HEAD = [
    { id: "serviceName", label: "Services Name " },
    { id: "qr", label: "Status" },
  ];

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

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setIdentifier(newValue);
  };

  const updateStatus = (e: any) => {
    let token = localStorage.getItem("token");

    let body = {
      serviceId: e?._id,
      isEnabled: (e.isEnabled = !e.isEnabled),
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

        const updatedService: any = services.map((serve: any) => {
          if (serve.autoCollectIdentifier === Response.serviceId) {
            return {
              ...serve,
              isEnabled: !e.isEnabled,
            };
          }
          return serve;
        });

        setServices(updatedService);
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

  return (
    <>
      <Stack display="grid" gap={3} m={3}>
        <Card
          sx={{ background: "#FFF8F8", p: 3, boxShadow: 5, borderRadius: 1 }}
        >
          <Typography style={{ fontWeight: "bold" }} variant="body1">
            Service Controls
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
          <Grid container>
            <Grid item xs={12} md={8} lg={5}>
              <Card sx={{ mt: 2 }}>
                <TableContainer sx={{ overflow: "unset" }}>
                  <Table>
                    <TableHeadCustom headLabel={TABLE_HEAD} />

                    {identifier?.services.length ? (
                      <TableBody>
                        {identifier?.services?.map((row: any) => (
                          <TableRow key={row?._id}>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Typography>{row?.serviceName} </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <IOSSwitch
                                  color="error"
                                  onChange={() => updateStatus(row)}
                                  checked={row?.isEnabled}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    ) : (
                      <TableNoData isNotFound={!identifier?.services} />
                    )}
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </Card>
        <RoleWiseControls />
        <UserWiseControls />
      </Stack>
    </>
  );
}

export default Services;
