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

export default function TdsGstReport() {
  const { Api } = useAuthContext();
  const [userList, setUserList] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const accountValidate = Yup.object().shape({
    searchBy: Yup.string().required("Search By is required"),
    usersearchby: Yup.string().when("searchBy", {
      is: (val: string) => val && val.length > 0,
      then: Yup.string().required("User Search By is required"),
    }),
    User: Yup.string().required("User is required"),
    startDate: Yup.date().nullable().required("Start Date is required"),
    endDate: Yup.date().nullable().required("End Date is required"),
  });

  type FormValuesProps = {
    searchBy: string;
    usersearchby: string;
    User: string;
    agent: string;
    distributor: string;
    m_distributor: string;
    API_User: string;
    startDate: Date | null;
    endDate: Date | null;
  };

  const defaultValues = {
    searchBy: "",
    usersearchby: "",
    User: "",
    agent: "",
    distributor: "",
    m_distributor: "",
    API_User: "",
    startDate: null,
    endDate: null,
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
    const body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
    };

    Api(`admin/search_user`, "POST", body).then((Response: any) => {
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
        : data.API_User;

    const body = {
      startDate: data.startDate,
      endDate: data.endDate,
      role: "partner",
      userId: userId,
    };

    Api(`adminTransaction/fetchgsttdsreport`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          enqueueSnackbar(Response.data.message);
          if (Response.data.signedUrl) {
            window.open(Response.data.signedUrl, "_blank");
          } else {
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar(Response.data.message || "Error fetching report", {
            variant: "error",
          });
        }
      }
    );
  };

  // const download = (val: string) => {
  //   const s3 = new AWS.S3();
  //   const params = {
  //     Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //     Key: val !== "" && val?.split("/").splice(4, 4).join("/"),
  //     Expires: 600,
  //   };

  //   s3.getSignedUrl("getObject", params, (err, url) => {
  //
  //     window.open(url, "_blank");
  //   });
  // };

  return (
    <Stack sx={{ maxWidth: "29%" }}>
      <Stack alignItems={"center"} mt={1}>
        <Typography variant="h6">TDS & GST Report Export</Typography>
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
            </RHFSelect>

            {(watch("searchBy") === "agent" ||
              watch("searchBy") === "distributor" ||
              watch("searchBy") === "m_distributor" ||
              watch("searchBy") === "API_User") && (
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
                                    : "API_User",
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

            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Stack direction={"row"} gap={1} justifyContent={"center"}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      inputFormat="YYYY/MM/DD"
                      value={watch("startDate")}
                      maxDate={new Date()}
                      onChange={(newValue: any) =>
                        setValue("startDate", newValue)
                      }
                      renderInput={(params: any) => (
                        <TextField {...params} size={"small"} />
                      )}
                    />
                    <DatePicker
                      label="End date"
                      inputFormat="YYYY/MM/DD"
                      disabled={!watch("startDate")}
                      value={watch("endDate")}
                      minDate={dayjs(watch("startDate"))}
                      maxDate={dayjs(watch("startDate")).add(15, "day")}
                      onChange={(newValue: any) =>
                        setValue("endDate", newValue)
                      }
                      renderInput={(params: any) => (
                        <TextField {...params} size={"small"} />
                      )}
                    />
                  </LocalizationProvider>
                </Stack>
              </Box>
            </Stack>

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
  );
}
