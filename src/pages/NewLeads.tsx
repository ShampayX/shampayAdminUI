import {
  Box,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import Iconify from "src/components/iconify/Iconify";
import Label from "../components/label/Label";
import { NewLeadsTable } from "../sections/Newleads";
import { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { TableHeadCustom, TableNoData } from "src/components/table";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { FileFilterButton } from "src/sections/reports/file";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  LEAD_COLUMNS,
  LEAD_COLUMNS_WITH_ACTION,
} from "src/sections/Newleads/leadColumns";
// import styled from "@emotion/styled";

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

export default function NewLeads() {
  const { Api } = useAuthContext();
  const [currentTab, setCurrentTab] = useState("new leads");
  const [successData, setSuccessData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [count, setCount] = useState({
    pendingCount: 0,
    rejectedCount: 0,
    approvedCount: 0,
  });

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
    if (getValues("User")?.length > 2) searchFromUser(getValues("User"));
  }, [watch("User")]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, pageSize]);

  useEffect(() => getUsers(currentTab), [currentPage]);

  useEffect(() => {
    let token = localStorage.getItem("token");
    Api("admin/get_user_count", "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setCount(Response.data.data);
        }
      }
    });
  }, []);

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

  const getUsers = (val: string) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      city: getValues("city") || "",
      constitutionType: getValues("constitutionType") || "",
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
    Api(
      val == "new leads"
        ? "admin/get_pendingList"
        : val == "approved"
        ? "admin/get_ApprovedList"
        : "admin/get_RejectedList",
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setSuccessData(Response.data.data);
          setTxnCount(Response.data.count);
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  };

  const searchFromUser = (val: string) => {
    let body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
      finalStatus: currentTab == "new leads" ? "" : "approved",
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

  const StyledTableRow = styled(TableRow)(({ theme }: { theme: Theme }) => ({
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[300],
    },
  }));

  // The action column only appears on the actionable tab; NewLeadsTable
  // renders its own action cell off the row status, so the header has to
  // reserve the slot on that tab whether or not a given row uses it.
  const leadColumns =
    currentTab == "new leads" ? LEAD_COLUMNS_WITH_ACTION : LEAD_COLUMNS;

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={(event, newValue) => {
          reset(defaultValues);
          setCurrentTab(newValue);
          getUsers(newValue);
          setUserList([]);
        }}
        aria-label="basic tabs example"
      >
        <Tab
          value={"new leads"}
          label={
            <Stack
              flexDirection={"row"}
              gap={1}
              alignItems={"center"}
              color={"#FFAB00"}
            >
              <Iconify icon={"eva:bell-fill"} />
              <Typography variant="h5">New Leads</Typography>
              <Label variant="soft" color={"warning"}>
                {currentTab == "new leads" ? txnCount : count.pendingCount}
              </Label>
            </Stack>
          }
        />
        <Tab
          value={"approved"}
          label={
            <Stack
              flexDirection={"row"}
              gap={1}
              alignItems={"center"}
              color={"#00AB55"}
            >
              <Iconify icon={"eva:checkmark-circle-2-fill"} />
              <Typography variant="h5">Approved</Typography>
              <Label variant="soft" color={"success"}>
                {currentTab == "approved" ? txnCount : count.approvedCount}
              </Label>
            </Stack>
          }
        />
        <Tab
          value={"rejected"}
          label={
            <Stack
              flexDirection={"row"}
              gap={1}
              alignItems={"center"}
              color={"#FF3030"}
            >
              <Iconify icon={"eva:close-circle-fill"} />
              <Typography variant="h5">Rejected</Typography>
              <Label variant="soft" color={"warning"}>
                {currentTab == "rejected" ? txnCount : count.rejectedCount}
              </Label>
            </Stack>
          }
        />
      </Tabs>

      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => getUsers(currentTab))}
      >
        <Stack
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent={"left"}
          m={1}
          gap={1}
        >
          <Stack
            flexDirection={{ xs: "column", sm: "row" }}
            flexBasis={{ xs: "100%" }}
            justifyContent="center"
            gap={1}
          >
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
                        maxWidth: "100%",
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

            <RHFSelect
              name="constitutionType"
              label="Constitution Type"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              <MenuItem value="Individual">Individual</MenuItem>
              <MenuItem value="Proprietorship">Proprietorship</MenuItem>
              <MenuItem value="Private Limited Company">
                Private Limited Company
              </MenuItem>
              <MenuItem value="Partnership">Partnership</MenuItem>
              <MenuItem value="Limited Liability Partnership">
                Limited Liability Partnership
              </MenuItem>
              <MenuItem value="One Person Company">One Person Company</MenuItem>
              <MenuItem value="Limited Company">Limited Company</MenuItem>
            </RHFSelect>
            <Stack flexDirection={"row"} gap={1}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start date"
                  inputFormat="DD/MM/YYYY"
                  value={watch("startDate")}
                  maxDate={new Date()}
                  onChange={(newValue: any) => setValue("startDate", newValue)}
                  renderInput={(params: any) => (
                    <TextField {...params} size={"small"} sx={{ width: 230 }} />
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
                    <TextField {...params} size={"small"} sx={{ width: 230 }} />
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
                  getUsers(currentTab);
                }}
              >
                Clear
              </LoadingButton>
            </Stack>
          </Stack>
        </Stack>
      </FormProvider>

      <StyledTableRow>
        <Stack maxWidth={"100%"}>
          <Fragment>
            {isLoading ? (
              <ApiDataLoading
                variant="table"
                columns={leadColumns}
                minWidth={720}
              />
            ) : (
              <Table size="small">
                <TableHeadCustom headLabel={leadColumns} />

                <TableBody>
                  {successData.map((row) => (
                    <NewLeadsTable row={row} />
                  ))}
                </TableBody>
                <TableNoData isNotFound={!successData?.length} />
              </Table>
            )}

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
          </Fragment>
        </Stack>
      </StyledTableRow>
    </Box>
  );
}
