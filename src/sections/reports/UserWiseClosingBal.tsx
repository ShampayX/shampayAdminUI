import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Chip,
  Stack,
  Avatar,
  MenuItem,
  TextField,
  Typography,
  TableCell,
  Autocomplete,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useTheme } from "@mui/material/styles";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form";
// date pickers
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// utils
import { fDateTime } from "src/utils/formatTime";
// page kit
import {
  PageHeader,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  DataTable,
  KitRow,
  StackedCell,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Starting Balances.
//
// `admin/get_user_day_wise_record` returns one row per user per day: the main
// and AEPS wallet balance recorded for that day. That is the whole payload -
// there is no status flag, no account type beyond the user's role and no
// effective date separate from `createdAt` - so none of those are shown.
// Only the main wallet is rendered; the AEPS wallet is not surfaced anywhere
// in this console.
//
// The endpoint pages server-side and filters by userId + date range only, so
// the summary sums below are page-scoped and captioned as such.
// ----------------------------------------------------------------------

type FormValuesProps = {
  searchBy: string;
  usersearchby: string;
  userId: string;
  User: string;
  startDate: Date | null;
  endDate: Date | null;
};

type PickedUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  userCode?: string;
};

const money = (value: any) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** dd/mm/yyyy, the format this endpoint expects for its date range. */
const apiDate = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(value)
    : "";

const initialOf = (row: any) =>
  (
    row?.userId?.firstName?.[0] ||
    row?.userId?.email?.[0] ||
    "?"
  ).toUpperCase();

export default function UserWiseClosingBal() {
  const theme = useTheme();
  const { Api } = useAuthContext();
  let token = localStorage.getItem("token");
  const { user } = useAuthContext();

  const [userList, setUserList] = useState<PickedUser[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  /** Filter the current result set was fetched with, so paging keeps it. */
  const [activeFilter, setActiveFilter] = useState<{
    userType: string;
    userId: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  // Form Controller
  const FilterSchema = Yup.object().shape({});
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues: {
      searchBy: "API_User",
      usersearchby: "",
      userId: "",
      User: "",
      startDate: null,
      endDate: null,
    },
  });
  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  /* Typing in the user box looks users up, same as before. */
  useEffect(() => {
    const term = getValues("User");
    if (term && term.length > 2) searchFromUser(term);
    else setUserList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("User")]);

  useEffect(() => {
    getUsersBalance(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  /* ================= API - unchanged contracts ================= */

  const searchFromUser = (val: string) => {
    let body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
      finalStatus: watch("searchBy") !== "API_User" ? "approved" : "",
    };
    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200 && Response.data.code == 200) {
        setUserList(Response.data.data || []);
      }
    });
  };

  const getUsersBalance = (
    filter: {
      userType: string;
      userId: string;
      startDate: string;
      endDate: string;
    } | null
  ) => {
    setLoading(true);
    setError("");

    let body = {
      pageInitData: { pageSize, currentPage },
      userType: filter?.userType || "user",
      userId: filter?.userId || "",
      startDate: filter?.startDate || "",
      endDate: filter?.endDate || "",
    };

    Api("admin/get_user_day_wise_record", "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setBalanceData(Response.data.data || []);
          setCount(Response.data.totalNumberOfRecords || 0);
        } else {
          setBalanceData([]);
          setError(
            Response?.data?.message || "Could not load the balance records."
          );
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setBalanceData([]);
        setError(err?.message || "Could not load the balance records.");
        setLoading(false);
      });
  };

  const onSubmit = (data: FormValuesProps) => {
    const filter = {
      userType: data.searchBy == "admin" ? "admin" : "user",
      userId: data.searchBy == "admin" ? user?._id : data.userId,
      startDate: apiDate(data.startDate),
      endDate: apiDate(data.endDate),
    };
    setActiveFilter(filter);
    setCurrentPage(1);
    getUsersBalance(filter);
  };

  const onClear = () => {
    reset({
      searchBy: "API_User",
      usersearchby: "",
      userId: "",
      User: "",
      startDate: null,
      endDate: null,
    });
    setUserList([]);
    setActiveFilter(null);
    setCurrentPage(1);
    getUsersBalance(null);
  };

  /* ================= DERIVED (page-scoped) ================= */

  /* The AEPS wallet is not surfaced in this console, so only the main wallet
     is summed. `AEPS_wallet_amount` is still on the payload and ignored. */
  const totals = useMemo(() => {
    const accounts = new Set<string>();
    let main = 0;

    balanceData.forEach((row) => {
      const id = row?.userId?._id || row?.userId?.userCode;
      if (id) accounts.add(String(id));
      main += Number(row?.main_wallet_amount || 0);
    });

    return { accounts: accounts.size, main };
  }, [balanceData]);

  const hasFilter = Boolean(
    activeFilter?.userId || activeFilter?.startDate || activeFilter?.endDate
  );

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Starting Balances | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Starting Balances"
          subtitle="Day-wise opening main wallet balance recorded for each account."
        />

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <FilterBar>
            <FilterSlot icon={<BadgeOutlinedIcon />} minWidth={170}>
              <TextField
                select
                fullWidth
                variant="standard"
                value={watch("searchBy") || ""}
                onChange={(event) => {
                  setValue("searchBy", event.target.value);
                  setValue("userId", "");
                  setValue("User", "");
                  setUserList([]);
                }}
                InputProps={{ disableUnderline: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="API_User">API User</MenuItem>
              </TextField>
            </FilterSlot>

            <FilterSlot icon={<PersonSearchOutlinedIcon />} grow minWidth={260}>
              <Autocomplete
                fullWidth
                freeSolo
                options={userList}
                filterOptions={(options) => options}
                getOptionLabel={(option: any) =>
                  typeof option === "string"
                    ? option
                    : `${option.firstName || ""} ${option.lastName || ""}`.trim()
                }
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    setValue("User", value);
                    setValue("userId", "");
                  }
                }}
                onChange={(_, value: any) => {
                  if (value && typeof value !== "string") {
                    setValue("userId", value._id);
                    setValue(
                      "User",
                      `${value.firstName || ""} ${value.lastName || ""}`.trim()
                    );
                    setUserList([]);
                  }
                }}
                renderOption={(props, option: any) => (
                  <li {...props} key={option._id}>
                    <Box sx={{ py: 0.25 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                        {`${option.firstName || ""} ${
                          option.lastName || ""
                        }`.trim() || "Unnamed"}
                      </Typography>
                      {option.userCode && (
                        <Typography
                          sx={{ fontSize: 11.5, color: "text.secondary" }}
                        >
                          {option.userCode}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Search account by name"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                    }}
                  />
                )}
              />
            </FilterSlot>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={310}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DatePicker
                    value={watch("startDate")}
                    inputFormat="DD/MM/YYYY"
                    maxDate={new Date()}
                    onChange={(newValue: any) => setValue("startDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="From"
                        InputProps={{
                          ...params.InputProps,
                          disableUnderline: true,
                        }}
                        sx={{ width: 125 }}
                      />
                    )}
                  />
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 700, color: "text.disabled" }}
                  >
                    TO
                  </Typography>
                  <DatePicker
                    value={watch("endDate")}
                    inputFormat="DD/MM/YYYY"
                    minDate={watch("startDate") || undefined}
                    maxDate={new Date()}
                    onChange={(newValue: any) => setValue("endDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="To"
                        InputProps={{
                          ...params.InputProps,
                          disableUnderline: true,
                        }}
                        sx={{ width: 125 }}
                      />
                    )}
                  />
                </Stack>
              </FilterSlot>
            </LocalizationProvider>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              startIcon={<SearchIcon />}
              sx={{ height: 48, px: 3, borderRadius: 1.5, fontWeight: 700 }}
            >
              Search
            </LoadingButton>

            <PageGhostButton startIcon={<RestartAltIcon />} onClick={onClear}>
              Reset
            </PageGhostButton>
          </FilterBar>
        </FormProvider>

        <StatGrid>
          <StatCard
            label="Balance Records"
            value={count}
            caption={hasFilter ? "For the active filter" : "Across all pages"}
            icon={<FingerprintOutlinedIcon />}
          />
          <StatCard
            label="Accounts On Page"
            value={totals.accounts}
            caption={`${balanceData.length} rows shown`}
            tone="neutral"
            icon={<GroupsOutlinedIcon />}
          />
          <StatCard
            label="Main Wallet"
            value={money(totals.main)}
            caption="Sum on this page"
            tone="primary"
            icon={<AccountBalanceWalletOutlinedIcon />}
          />
        </StatGrid>

        {loading ? (
          <LoadingState label="Loading balance records..." height={300} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load balances"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RestartAltIcon />}
                onClick={() => getUsersBalance(activeFilter)}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : balanceData.length === 0 ? (
          <EmptyState
            icon={<AccountBalanceWalletOutlinedIcon />}
            title={hasFilter ? "No records for this filter" : "No balance records"}
            description={
              hasFilter
                ? "No day-wise balance was recorded for that account or date range."
                : "No opening balances have been recorded yet."
            }
            action={
              hasFilter ? (
                <PageGhostButton
                  startIcon={<RestartAltIcon />}
                  onClick={onClear}
                >
                  Clear filters
                </PageGhostButton>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            minWidth={860}
            columns={[
              { id: "user", label: "Account" },
              { id: "role", label: "Account Type" },
              { id: "date", label: "Recorded On" },
              { id: "main", label: "Main Wallet", align: "right" },
            ]}
            footer={
              <TablePagination
                component="div"
                count={count}
                page={currentPage - 1}
                rowsPerPage={pageSize}
                onPageChange={(_, page) => setCurrentPage(page + 1)}
                onRowsPerPageChange={(event) => {
                  setPageSize(parseInt(event.target.value));
                  setCurrentPage(1);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            }
          >
            {balanceData.map((row: any, index: number) => {
              const main = Number(row?.main_wallet_amount || 0);

              return (
                <KitRow key={row?._id || index}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: "primary.lighter",
                          color: "primary.dark",
                        }}
                      >
                        {initialOf(row)}
                      </Avatar>
                      <StackedCell
                        bold
                        primary={
                          row?.userId?.firstName && row?.userId?.lastName
                            ? `${row.userId.firstName} ${row.userId.lastName}`
                            : row?.userId?.email || "—"
                        }
                        secondary={row?.userId?.userCode || undefined}
                      />
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {row?.userId?.role ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={row.userId.role}
                        sx={{ fontSize: 11, fontWeight: 600 }}
                      />
                    ) : (
                      <Typography
                        sx={{ fontSize: 13, color: "text.disabled" }}
                      >
                        -
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ fontSize: 13.5, whiteSpace: "nowrap" }}>
                    {fDateTime(row?.createdAt)}
                  </TableCell>

                  <TableCell align="right">
                    <BalanceAmount value={main} tone="primary" />
                  </TableCell>
                </KitRow>
              );
            })}
          </DataTable>
        )}
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

/**
 * Wallet amount. A zero balance is greyed and a negative one turns red, so an
 * account that opened the day empty or overdrawn is visible while scanning.
 */
function BalanceAmount({
  value,
  tone,
}: {
  value: number;
  tone: "primary" | "warning";
}) {
  const theme = useTheme();

  const color =
    value < 0
      ? theme.palette.error.main
      : value === 0
      ? theme.palette.text.disabled
      : tone === "primary"
      ? theme.palette.primary.dark
      : theme.palette.warning.dark;

  return (
    <Typography sx={{ fontSize: 14, fontWeight: 700, color }}>
      {money(value)}
    </Typography>
  );
}
