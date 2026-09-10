import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import * as Yup from "yup";
import {
  Stack,
  MenuItem,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
} from "@mui/material";
import FormProvider from "src/components/hook-form/FormProvider";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import AWS from "aws-sdk";

export default function Transactions() {
  const { Api } = useAuthContext();
  const [userList, setUserList] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const accountValidate = Yup.object().shape({
    searchBy: Yup.string().required("Search By is required"),
    // usersearchby: Yup.string().when("searchBy", {
    //   is: (val: string) => val && val.length > 0,
    //   then: Yup.string().required("User Search By is required"),
    // }),
    // User: Yup.string().required("User is required"),
    selectedDate: Yup.date().nullable().required("Date is required"),
  });

  type FormValuesProps = {
    searchBy: string;
    usersearchby: string;
    User: string;
    agent: string;
    distributor: string;
    m_distributor: string;
    Admin: string;
    selectedDate: Date | null;
  };

  const defaultValues = {
    searchBy: "",
    usersearchby: "",
    User: "",
    agent: "",
    distributor: "",
    m_distributor: "",
    Admin: "",
    selectedDate: null,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
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

  useEffect(() => {
    if (getValues("User")?.length > 2) searchFromUser(getValues("User"));
  }, [watch("User")]);

  const searchFromUser = (val: string) => {
    let token = localStorage.getItem("token");
    const body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
    };

    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response?.status === 200 && Response.data.code === 200) {
        setUserList(Response.data.data);
      } else {
        setUserList([]);
      }
    });
  };

  const Downloaddata = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");

    const userId =
      data.searchBy === "agent"
        ? data.agent
        : data.searchBy === "distributor"
        ? data.distributor
        : data.searchBy === "m_distributor"
        ? data.m_distributor
        : data.searchBy === "admin"
        ? ""
        : data.Admin;
    const role = data.searchBy;
    const from_date = dayjs(data.selectedDate).format("DD/MM/YYYY");
    const to_date = dayjs(data.selectedDate).format("DD/MM/YYYY");
    const user_id = userId;
    window.open(
      `${process.env.REACT_APP_BASE_URL}adminTransaction/downloadMasterTransactionReportUserWise?from_date=${from_date}&to_date=${to_date}&user_id=${user_id}&role=${role}`
    );
  };

  return (
    <>
      <Stack sx={{ maxWidth: "100%" }}>
        <Stack alignItems={"center"} mt={1} p={2}>
          <Typography variant="h6">All User Wise Report Export</Typography>
        </Stack>
        <CardContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(Downloaddata)}>
            <Stack spacing={3}>
              <RHFSelect
                name="searchBy"
                label="Search By"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {/* Item 3d: roles are only Admin and API_User now. */}
                <MenuItem value="API_User">API User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </RHFSelect>
              <>
                {watch("searchBy") === "API_User" && (
                  <>
                    <RHFSelect
                      fullWidth
                      name="usersearchby"
                      label="User Search By"
                      size="small"
                      placeholder="User Search By"
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
                              userList.map((item: any) => (
                                <Typography
                                  key={item._id}
                                  sx={{
                                    p: 1,
                                    cursor: "pointer",
                                    color: "grey",
                                    "&:hover": { color: "black" },
                                  }}
                                  onClick={() => {
                                    const role = item.role;
                                    setValue(
                                      role === "agent"
                                        ? "agent"
                                        : role === "distributor"
                                        ? "distributor"
                                        : role === "m_distributor"
                                        ? "m_distributor"
                                        : "Admin",
                                      item._id
                                    );
                                    setUserList([]);
                                    setValue(
                                      "User",
                                      `${item.firstName} ${item.lastName}`
                                    );
                                  }}
                                  variant="subtitle2"
                                >
                                  {item.userCode
                                    ? `${item.firstName} ${item.lastName} (${item.userCode})`
                                    : `${item.firstName} ${item.lastName}`}
                                </Typography>
                              ))}
                          </Scrollbar>
                        </Stack>
                      </Stack>
                    )}
                  </>
                )}
              </>

              {/* Date Fields - Always displayed */}
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Stack direction={"row"} gap={1} justifyContent={"center"}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select Date"
                        inputFormat="YYYY/MM/DD"
                        value={watch("selectedDate")}
                        maxDate={new Date()}
                        onChange={(newValue: any) =>
                          setValue("selectedDate", newValue)
                        }
                        renderInput={(params: any) => (
                          <TextField {...params} size={"small"} fullWidth />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack flexDirection="row" gap={2}>
                <LoadingButton
                  variant="contained"
                  onClick={() => {
                    reset(defaultValues);
                  }}
                >
                  Clear
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={isSubmitting}
                >
                  Download
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        </CardContent>
      </Stack>
    </>
  );
}
