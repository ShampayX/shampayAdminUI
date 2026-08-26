// @mui
import {
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Typography,
} from "@mui/material";
// components

import { TableHeadCustom, TableNoData } from "../../components/table";
import React, { useEffect, useState } from "react";
import CustomPagination from "../../components/CustomFunction/CustomPagination";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import UserDetail from "./UserDetail";
import { useDateRangePicker } from "src/components/date-range-picker";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { LoadingButton } from "@mui/lab";
import { FileFilterButton } from "../reports/file";
import Iconify from "src/components/iconify/Iconify";
import DateRangePicker from "src/components/date-range-picker/DateRangePicker";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------
type FormValuesProps = {
  searchBy: string;
  usersearchby: string;
  User: string;
  agent: string;
  distributor: string;
  m_distributor: string;
  API_User: string;
  date: string;
  constitutionType: string;
  city: string;
  startDate: Date | null;
  endDate: Date | null;
};

export default function NeoNetwork() {
  const { Api } = useAuthContext();
  const [appdata, setAppdata] = useState([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [txnCount, setTxnCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState([]);

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
    { id: "Viewnetwork", label: "View Network", align: "center" },
  ];

  // Form Controller
  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    searchBy: "",
    usersearchby: "",
    User: "",
    agent: "",
    distributor: "",
    m_distributor: "",
    API_User: "",
    date: "",
    constitutionType: "",
    city: "",
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
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    setIsLoading(true);
    getApprovedUsers();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (getValues("User")?.length > 2) searchFromUser(getValues("User"));
  }, [watch("User")]);

  const getApprovedUsers = async () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      city: getValues("city") || "",
      userId:
        getValues("agent") ||
        getValues("distributor") ||
        getValues("m_distributor") ||
        getValues("API_User") ||
        "",
      role: getValues("searchBy") || "",
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };
    await Api(`admin/get_ApprovedList`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setAppdata(Response.data.data);
            setTxnCount(Response.data.count);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const searchFromUser = (val: string) => {
    let body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
      finalStatus: "approved",
    };
    {
      Api(`admin/search_user`, "POST", body, "").then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          } else {
          }
        }
      });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(getApprovedUsers)}>
        <Stack flexDirection={{ xs: "column", sm: "row" }} my={1} gap={1}>
          <RHFSelect
            name="searchBy"
            label="Search By"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
          >
            <MenuItem value="agent">Agent</MenuItem>
            <MenuItem value="distributor">Distributor</MenuItem>
            <MenuItem value="m_distributor">Master Distributor</MenuItem>
          </RHFSelect>
          {(watch("searchBy") == "agent" ||
            watch("searchBy") == "distributor" ||
            watch("searchBy") == "m_distributor" ||
            watch("searchBy") == "API_User") && (
            <>
              <RHFSelect
                fullWidth
                name="usersearchby"
                label="User Search By"
                size="small"
                placeholder="User Search By"
                // InputLabelProps={{ shrink: true }}
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
                                  ? setValue("agent", item._id)
                                  : item.role == "distributor"
                                  ? setValue("distributor", item._id)
                                  : item.role == "m_distributor"
                                  ? setValue("m_distributor", item._id)
                                  : setValue("API_User", item._id);
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
          <RHFTextField name="city" label="City" />

          <Stack flexDirection={"row"} gap={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start date"
                inputFormat="DD/MM/YYYY"
                value={watch("startDate")}
                maxDate={new Date()}
                onChange={(newValue: any) => setValue("startDate", newValue)}
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
                onChange={(newValue: any) => setValue("endDate", newValue)}
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

          <Stack
            flexDirection={"row"}
            flexBasis={{ xs: "100%", sm: "50%" }}
            gap={1}
          >
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
                getApprovedUsers();
              }}
            >
              Clear
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
      {isLoading ? (
        <ApiDataLoading variant="table" columns={tableLabels} />
      ) : (
        <>
          <Scrollbar>
            <TableContainer>
              <Table stickyHeader>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {appdata.map((row) => (
                    <UserDetail key={row} row={row} />
                  ))}
                </TableBody>
                <TableNoData isNotFound={!appdata?.length} />
              </Table>
            </TableContainer>
          </Scrollbar>

          <CustomPagination
            page={currentPage - 1}
            count={txnCount}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => setCurrentPage(newPage + 1)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              setPageSize(parseInt(event.target.value));
              setCurrentPage(1);
            }}
          />
        </>
      )}
    </>
  );
}
