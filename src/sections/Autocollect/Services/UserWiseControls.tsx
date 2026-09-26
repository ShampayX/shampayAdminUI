import {
  Card,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Button,
  TextField,
  Typography,
  TableHead,
  styled,
  SwitchProps,
} from "@mui/material";

import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { CustomAvatar } from "src/components/custom-avatar";
import { TableNoData } from "src/components/table";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

function UserWiseControls() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Item 3d: "agent" was the default tab; that role is retired, so the first
  // remaining tab is the default.
  const [userRoleWise, setUserRoleWise] = React.useState("API_User");
  const [identifier, setIdentifier] = React.useState<any>();
  const [services, setServices] = React.useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [txnCount, setTxnCount] = useState(0);
  const [userList, setUserList] = useState<any>([]);
  const [userDeatils, setUserDetails] = React.useState({
    name: "",
    useCode: "",
    profileuser: "",
    email: "",
    contact_no: "",
  });
  const [selectFromUser, setSelectFromUser] = React.useState({
    userName: "",
    _id: "",
  });
  const [UserSearchBy, setUserSearchBy] = React.useState("");

  type FormValuesProps = {
    reportType: string;
    userRole: string;
    email: string;
    from: string;
    usersearchby: string;
  };

  const defaultValues = {
    userRole: "",
    email: "",
    usersearchby: " ",
  };

  useEffect(() => {
    setIsLoading(true);
    getApprovedUsers("agent");
  }, [currentPage]);

  const accountValidate = Yup.object().shape({
    userRole: Yup.string().required(" Role is required Field"),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

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

  function setFromValue(val: any) {
    setSelectFromUser({
      userName: val.firstName + " " + val.lastName,
      _id: val._id,
    });
    setUserDetails({
      name: val?.firstName + " " + val?.lastName,
      useCode: val?.userCode,
      profileuser: val?.selfie[0],
      email: val?.email,
      contact_no: val?.contact_no,
    });
    setUsers([]);
  }
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setIdentifier(newValue);
  };

  const handleServices = (event: React.SyntheticEvent, newValue: string) => {
    setUserRoleWise(newValue);
    getApprovedUsers(newValue);
  };

  const getApprovedUsers = (role: string) => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      userId: selectFromUser?._id,
      startDate: "",
      endDate: "",
      city: "",
      role: role,
    };
    Api(`admin/get_ApprovedList`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setTxnCount(Response.data.count);
        GetAutocollectList();
        setUserList(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsLoading(false);
    });
  };

  const searchUser = (val: string) => {
    setSelectFromUser({ ...selectFromUser, userName: val });
    let body = {
      searchBy: UserSearchBy,
      role: watch("userRole"),
      searchInput: val,
      finalStatus: watch("userRole") !== "partner" ? "approved" : "",
    };
    {
      val.length
        ? Api(`admin/search_user`, "POST", body, "").then((Response: any) => {
            if (isOk(Response)) {
              setUsers(Response.data.data);
            } else {
              notifyFailure(enqueueSnackbar, Response);
            }
          })
        : setUsers([]);
    }
  };

  const submitReport = (data: FormValuesProps) => {};

  const updateStatus = (e: any, val: any, rowId: string) => {
    let token = localStorage.getItem("token");

    let body = {
      userId: e?._id,
      autoCollectId: rowId,
      serviceId: val?._id,
      isEnabled: (val.isEnabled = !val.isEnabled),
    };

    Api(
      `admin/autoCollect/update/service/user/switch`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      // Item 1b: the autocollect switch reported success on the transport
      // status alone, so a refused toggle still flipped the switch on screen and
      // toasted a save that never happened.
      if (isOk(Response)) {
        setUserList(
          userList.filter((user: any, index: number) => {
            if (user._id === e._id) {
              return {
                ...user,
                autoCollectData: user.autoCollectData.map(
                  (autoCollect: any) => {
                    if (autoCollect._id === rowId) {
                      return {
                        ...autoCollect,
                        services: autoCollect.services.map((service: any) => {
                          if (service._id === val._id) {
                            return {
                              ...service,
                              isEnabled: !service.isEnabled,
                            };
                          } else {
                            return service;
                          }
                        }),
                      };
                    } else {
                      return autoCollect;
                    }
                  }
                ),
              };
            } else {
              return user;
            }
          })
        );
        enqueueSnackbar(Response?.data?.message);
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
      <Grid display="grid">
        <Card
          sx={{
            background: "#FFF8F8",
            p: 3,
            boxShadow: 5,
            borderRadius: 1,
          }}
        >
          <Typography style={{ fontWeight: "bold" }} variant="body1">
            User-wise Controls
          </Typography>
          <Stack flexDirection={"row"} justifyContent={"space-between"} p={1}>
            <Tabs
              value={userRoleWise}
              onChange={handleServices}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                ".MuiTabs-indicator": {
                  marginBottom: 1,
                },
              }}
            >
              {/* Item 3d: roles are only Admin and API_User now. */}
              <Tab
                value="API_User"
                label="API User"
                sx={{ fontWeight: "bold" }}
              />
            </Tabs>
          </Stack>
          <Stack mt={2}>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(submitReport)}
            >
              <Stack rowGap={1} columnGap={2} flexDirection="row">
                <Stack
                  sx={{
                    width: { xs: "75%", md: "30%", lg: "15%" },
                  }}
                >
                  <RHFSelect
                    fullWidth
                    name="usersearchby"
                    label="Search By"
                    size="small"
                    placeholder="User Search By"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    <MenuItem
                      value={"usercode"}
                      onClick={() => setUserSearchBy("userCode")}
                    >
                      User Code
                    </MenuItem>

                    <MenuItem
                      value={"firstName"}
                      onClick={() => setUserSearchBy("firstName")}
                    >
                      First Name
                    </MenuItem>
                    <MenuItem
                      value={"contact_no"}
                      onClick={() => setUserSearchBy("contact_no")}
                    >
                      Contact Number
                    </MenuItem>

                    <MenuItem
                      value={"email"}
                      onClick={() => setUserSearchBy("email")}
                    >
                      Email
                    </MenuItem>
                  </RHFSelect>
                </Stack>
                <Stack
                  flexDirection={"row"}
                  sx={{ position: "relative" }}
                  gap={2}
                >
                  <TextField
                    placeholder={UserSearchBy || "usercode"}
                    label={"User"}
                    size="small"
                    error={!!errors.from}
                    value={selectFromUser.userName}
                    {...register("from", {
                      onChange: (e: any) => searchUser(e.target.value),
                      required: true,
                    })}
                  />
                  {users.length ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 40,
                        backgroundColor: "white",
                        zIndex: 1700,
                        width: "100%",

                        maxHeight: 100,
                        scrollbarWidth: "thin",
                        border: "1px solid #dadada",
                        borderRadius: 10,
                        overflowY: "auto",
                      }}
                    >
                      {users.map((item: any) => {
                        return (
                          <Stack
                            flexDirection="row"
                            key={item._id}
                            sx={{
                              "&:hover": {
                                bgcolor: "#f8222814",
                                cursor: "pointer",
                              },
                              padding: 1,
                            }}
                            onClick={() => setFromValue(item)}
                          >
                            <CustomAvatar
                              name={item.firstName}
                              alt={item.firstName}
                              src={item.selfie[0] || ""}
                            />
                            <Typography key={item._id}>
                              {`${item.firstName + " " + item.lastName} (${
                                item.role
                              })`}
                            </Typography>
                          </Stack>
                        );
                      })}
                    </div>
                  ) : null}
                </Stack>
                <Button
                  variant="contained"
                  onClick={() => getApprovedUsers("")}
                >
                  {" "}
                  Submit
                </Button>
              </Stack>
            </FormProvider>
          </Stack>
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
            <TableContainer sx={{ overflow: "auto", maxHeight: 400 }}>
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
                      {userList?.map((row: any, rowIndex: number) => (
                        <TableRow key={row?._id}>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Typography>{row.firstName}</Typography>
                            </Stack>
                          </TableCell>
                          {row?.autoCollectData?.map(
                            (autoCollect: any, autoCollectIndex: number) => {
                              return autoCollect.services.map(
                                (service: any, serviceIndex: number) => {
                                  return identifier?.services.map(
                                    (identifireService: any) => {
                                      return (
                                        identifireService._id ==
                                          service.serviceId && (
                                          <TableCell
                                            key={identifireService._id}
                                          >
                                            <Stack
                                              direction="column"
                                              spacing={1}
                                            >
                                              <IOSSwitch
                                                color="error"
                                                onChange={() =>
                                                  updateStatus(
                                                    row,
                                                    service,
                                                    row?.autoCollectData[
                                                      autoCollectIndex
                                                    ]._id
                                                  )
                                                }
                                                checked={
                                                  userList[rowIndex]
                                                    ?.autoCollectData[
                                                    autoCollectIndex
                                                  ]?.services[serviceIndex]
                                                    .isEnabled
                                                }
                                              />
                                            </Stack>
                                          </TableCell>
                                        )
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          )}
                          {/* {identifier?.services.map(
                        (serviceItem: any, index: number) => {
                          const matchingService = row?.autoCollectData?.[
                            index
                          ]?.services.find(
                            (service: any) =>
                              service?.serviceId === serviceItem._id
                          );
                          return (
                            <TableCell key={serviceItem._id}>
                              <Stack direction="column" spacing={1}>
                                {matchingService && (
                                  <Switch
                                    color="error"
                                    onChange={() =>
                                      updateStatus(
                                        row,
                                        matchingService,
                                        row.autoCollectData[0]._id
                                      )
                                    }
                                    checked={matchingService?.isEnabled}
                                  />
                                )}
                              </Stack>
                            </TableCell>
                          );
                        }
                      )} */}
                        </TableRow>
                      ))}
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

export default UserWiseControls;
