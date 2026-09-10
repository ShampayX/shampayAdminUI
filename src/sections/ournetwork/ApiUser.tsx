// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Autocomplete,
  Grid,
  Typography,
  TableContainer,
  Pagination,
  Button,
  Modal,
  Divider,
  Chip,
  Avatar,
  Checkbox,
  TextField,
  TableHead,
  IconButton,
  styled,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
// components
import { useSnackbar } from "../../components/snackbar";

import { fDate } from "src/utils/formatTime";

import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import * as Yup from "yup";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState, useRef } from "react";
import { LoadingButton } from "@mui/lab";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import Iconify from "src/components/iconify";
import { fIndianCurrency } from "src/utils/formatNumber";
import { useAuthContext } from "src/auth/useAuthContext";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { company } from "src/_mock/assets";
import { useNavigate } from "react-router";
import { use } from "i18next";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
// page kit
import {
  FilterBar,
  FilterSlot,
  SearchField,
  ModalShell,
  FormGrid,
  PageActionButton,
  PageGhostButton,
  EmptyState,
  LoadingState,
  DataTable,
  KitRow,
  StatusPill,
  StackedCell,
  CopyText,
  TableSkeleton,
  FilterBarSkeleton,
  useDataTable,
  exportToExcel,
} from "src/components/page-kit";
import {
  TablePagination,
  MenuItem,
  Drawer,
  Tooltip,
  Alert,
} from "@mui/material";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  isOk,
  notifyOk,
  notifyFailure,
  readReadiness,
} from "src/utils/apiResult";
import PartnerAccessPanel from "./PartnerAccessPanel";
import { ipEntryError } from "src/utils/ipAllowList";

/* ----------------------------------------------------------------------
   Ecosystem is an operational RECORD list, not a dashboard.

   It used to render a two-column grid of tall summary cards - one ~900-line
   Card per API user, roughly two users visible per screen. That reads as a
   marketing surface, not an estate you operate: you could not scan it, sort
   it, or compare two accounts without scrolling.

   Now the estate is a dense record table - identity, contact, verification,
   wallet, created - and the full per-user control panel (charges, OTP, AEPS,
   allowed users, limits ...) opens in a right-hand drawer on demand. The card
   component itself is reused verbatim inside that drawer, so every action it
   ever had still works and no API call changed.
   ---------------------------------------------------------------------- */
const ECOSYSTEM_COLUMNS: {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  sortKey?: string;
}[] = [
  { id: "user", label: "API User", sortKey: "firstName" },
  { id: "company", label: "Business", sortKey: "company_name" },
  { id: "contact", label: "Contact" },
  { id: "verify", label: "Verification", align: "center" },
  {
    id: "wallet",
    label: "Wallet",
    align: "right",
    sortKey: "main_wallet_amount",
  },
  { id: "created", label: "Onboarded", sortKey: "createdAt" },
  { id: "action", label: "", align: "right" },
];

const VERIFY_FILTERS = [
  { value: "all", label: "All records" },
  { value: "verified", label: "Verified only" },
  { value: "unverified", label: "Unverified only" },
];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // hide last border

  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.grey[200],
  },
}));
// ----------------------------------------------------------------------

type RowProps = {
  role: string;
  firstName: string;
  email: string;
  status: string;
  _id: any;
  contact_no: string;
  PANnumber: string;
  GSTNumber: string;
  lastName: any;
  mobileOtp: string;
  emailOtp: string;
  verificationStatus: string;
  emailVerify: string;
  mobileVerify: string;
  main_wallet_amount: number;
  AEPS_wallet_amount: number;
  isBeneSearchInDatabase: boolean;
  allowed: boolean;
  userCode: string;
  beneValidationCharge: string;
  upiValidationCharge: string;
  bin_verify_charges: string;
  company_name: string;
  adhaarValidationCharge: string;
  createdAt: string;
  myIp: string;

  minTxnLimit?: number;
  maxTxnLimit?: number;
  aepsCharge2FA?: number;
  partnerCallbackUrls?: Record<string, string>;
  lienAmount?: number;
};

type FormValuesProps = {
  fname: string;
  lname: string;
  contact: string;
  email: string;
  password: string;
  gst: string;
  pan: string;
  companyname: string;
  companyAddress: string;
};

const IOSSwitch = styled((props: any) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
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

export default function ApiUser() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [appdata, setAppdata] = useState<any>([]);
  const [otpReq, setOtpReq] = React.useState(false);
  const [emailOtp, setEmailOtp] = React.useState("");
  const [mobileOtp, setMobileOtp] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [cateList, setCateList] = useState([]);
  const [CheckBox, setCheckBox] = useState<any>([]);
  const [open, setModalEdit] = React.useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const openEditModal = () => {
    setModalEdit(true);
  };
  const handleClose = () => setModalEdit(false);
  const navigate = useNavigate();

  const accountValidate = Yup.object().shape({});
  const defaultValues = {
    fname: "",
    lname: "",
    contact: "",
    email: "",
    password: "",
    gst: "",
    pan: "",
    companyname: "",
    companyAddress: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const tableLabels: any = [
    { id: "userdetails", label: "User Details", align: "center" },
    { id: "businessdetails", label: "Business Details" },
    { id: "wallet", label: "Wallet Balance" },
    { id: "currentotp", label: "Current OTP", align: "center" },
    // { id: "Verificationcharges", label: "Verification Charges" },
    { id: "Verificationcharges", label: "Edit User Data" },
    { id: "beneverify", label: " User Permission" },
    // bhu
    // { id: "restriction", label: "User Restriction " },

    { id: "status", label: "Status", align: "center" },
    { id: "action", label: "Action", align: "center" },

    { id: "minmax", label: "Min / Max Limit" }, // <-- NEW column
    { id: "lien", label: "Lien Amount" }, // <-- NEW column
  ];

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  useEffect(() => {
    ListApiUser();
    categoryList();
  }, []);

  // Item 2b: `create_API_User` accepts `myIps` now. Without at least one address
  // a partner created here is refused on every endpoint with 500 "Please
  // configure your IP", which is exactly how partners were being created into a
  // dead state. Collected on the form so a new partner can be callable at once.
  const [newPartnerIps, setNewPartnerIps] = useState<string[]>([]);
  const [newPartnerIpDraft, setNewPartnerIpDraft] = useState("");
  const newPartnerIpError = newPartnerIpDraft.trim()
    ? ipEntryError(newPartnerIpDraft)
    : "";
  const addNewPartnerIp = () => {
    const value = newPartnerIpDraft.trim();
    if (!value || ipEntryError(value)) return;
    setNewPartnerIps((prev) =>
      prev.includes(value) ? prev : [...prev, value]
    );
    setNewPartnerIpDraft("");
  };

  const AddApiUser = (data: FormValuesProps) => {
    setIsSubmitLoading(true);
    let token = localStorage.getItem("token");
    let cate: any = CheckBox.map((item: any) => {
      return item.category_name;
    });
    const body = {
      fName: data.fname,
      lastName: data.lname,
      contactNo: data.contact,
      email: data.email,
      password: data.password,
      GSTNumber: data.gst,
      PANNumber: data.pan,
      company_name: data.companyname,
      category: cate,
      adhaarValidationCharge: data.pan,
      companyAddress: data.companyAddress,
      // Item 2b: array or single string are both accepted; omitted when empty so
      // the request is unchanged for anyone who does not fill the field in.
      ...(newPartnerIps.length ? { myIps: newPartnerIps } : {}),
    };
    Api(`admin/API_User_Management/create_API_User`, "Post", body, token).then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          setUserId(Response.data.data._id);
          setAppdata([...appdata, Response.data.data]);
          setOtpReq(true);
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        setIsSubmitLoading(false);
      }
    );
  };

  const VerifyOTP = () => {
    let token = localStorage.getItem("token");
    const body = {
      userId: userId,
      mobileOtp: mobileOtp,
      emailOtp: emailOtp,
    };
    Api(
      `admin/API_User_Management/verifyOTP_API_User`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("====ApprovedList==User==response====>" + Response);
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        handleClose();
        console.log(
          "====ApprovedList==data.data udata===>",
          Response.data.data
        );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const ListApiUser = () => {
    let token = localStorage.getItem("token");
    setIsListLoading(true);
    // Stage 3 offers optional `page` / `pageSize` / `search` on this endpoint.
    // Deliberately NOT opted into: it is 20 rows, and the server-side `search`
    // covers firstName, lastName, company_name and userCode only, where the
    // client-side search on this screen also covers email and phone. Opting in
    // would page a 20-row list and narrow what an operator can search by.
    Api(`admin/API_User_Management/list_API_users`, "GET", "", token).then(
      (Response: any) => {
        setIsListLoading(false);
        if (isOk(Response)) {
          setAppdata(Response.data.data.slice().reverse());
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
    loadReadiness();
  };

  /**
   * Item 3a: one request gives `ready` for every partner, so each row can carry
   * an honest badge instead of looking identical whether or not the partner can
   * actually transact. Read-only, and it returns no secret - the report says
   * whether `accessKey` and the IP allow-list are set, never what they are.
   */
  const [readinessById, setReadinessById] = useState<Record<string, any>>({});
  const [notReady, setNotReady] = useState<number | null>(null);

  const loadReadiness = () => {
    const token = localStorage.getItem("token");
    Api(`admin/readiness/partners`, "GET", "", token).then((Response: any) => {
      const body = readReadiness(Response);
      if (!body || !Array.isArray(body.partners)) {
        setReadinessById({});
        setNotReady(null);
        return;
      }
      const map: Record<string, any> = {};
      body.partners.forEach((p: any) => {
        map[p.partnerId] = p;
      });
      setReadinessById(map);
      setNotReady(typeof body.notReady === "number" ? body.notReady : null);
    });
  };

  const categoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      //  console.log("====ApprovedList==User==response====>" + Response);
      if (isOk(Response)) {
        setCateList(Response.data.data);
        // console.log(
        //   "====ApprovedList==data.data udata===>",
        //   Response.data.data
        // );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };
  /* Record-list controls: a verification filter and the drawer target. */
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [detailRow, setDetailRow] = useState<any>(null);

  const scopedData = React.useMemo(() => {
    if (verifyFilter === "all") return appdata;
    const wantVerified = verifyFilter === "verified";
    return (appdata || []).filter((row: any) => {
      const verified = Boolean(row?.emailVerify && row?.mobileVerify);
      return verified === wantVerified;
    });
  }, [appdata, verifyFilter]);

  /* Client-side, because `list_API_users` returns the whole estate in one
     call - the old <Pagination> had no `count` and never sliced anything. */
  const table = useDataTable<any>(scopedData, {
    rowsPerPage: 25,
    storageKey: "ecosystem-apiusers",
    searchKeys: [
      "firstName",
      "lastName",
      "email",
      "userCode",
      "contact_no",
      "company_name",
    ],
  });

  return (
    <>
      {/* Item 3a: an honest count. `notReady` comes straight from the readiness
          list endpoint, so it says how many partners the platform will actually
          refuse rather than how many exist. */}
      {notReady !== null && notReady > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>
            {notReady} of {appdata.length} partner
            {appdata.length === 1 ? "" : "s"}
          </strong>{" "}
          cannot transact - a blocking gate is unsatisfied. Open a partner to
          see which one.
        </Alert>
      )}

      <FilterBar>
        <SearchField
          value={table.query}
          onChange={table.setQuery}
          placeholder="Search by name, code, email, phone or company"
          count={table.total}
          total={table.grandTotal}
        />

        <FilterSlot icon={<FilterAltOutlinedIcon />} minWidth={190}>
          <TextField
            select
            fullWidth
            variant="standard"
            value={verifyFilter}
            onChange={(event) => setVerifyFilter(event.target.value)}
            InputProps={{ disableUnderline: true }}
          >
            {VERIFY_FILTERS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </FilterSlot>

        <PageGhostButton
          startIcon={<FileDownloadOutlinedIcon />}
          disabled={table.isEmpty}
          onClick={() =>
            exportToExcel(
              table.results.map((row: any) => ({
                Name: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
                "User Code": row.userCode || "",
                Role: row.role || "",
                Company: row.company_name || "",
                Email: row.email || "",
                Mobile: row.contact_no || "",
                GST: row.GSTNumber || "",
                PAN: row.PANnumber || "",
                Verified: row.emailVerify && row.mobileVerify ? "Yes" : "No",
                "Main Wallet": row.main_wallet_amount ?? 0,
                "AEPS Wallet": row.AEPS_wallet_amount ?? 0,
                Onboarded: row.createdAt ? fDate(row.createdAt) : "",
              })),
              "ecosystem-api-users",
              "API Users"
            )
          }
        >
          Export
        </PageGhostButton>

        <PageActionButton
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={openEditModal}
        >
          Add API User
        </PageActionButton>
      </FilterBar>

      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalShell
          title={otpReq ? "Verify API User" : "Add API User"}
          subtitle={
            otpReq
              ? "Enter the codes sent to the user's email and mobile."
              : "Creates the account and sends email + mobile verification codes."
          }
          onClose={handleClose}
          width={760}
        >
          <FormProvider methods={methods} onSubmit={handleSubmit(AddApiUser)}>
            <Box>
              {!otpReq ? (
                <>
                  <FormGrid columns={2}>
                    <RHFTextField
                      name="fname"
                      label="First Name"
                      placeholder="First Name"
                      size="small"
                    />
                    <RHFTextField
                      name="lname"
                      label="Last Name"
                      placeholder="Last Name"
                      size="small"
                    />
                    <RHFTextField
                      name="contact"
                      label="Contact Number"
                      size="small"
                      placeholder="Contact Number"
                    />
                    <RHFTextField
                      name="email"
                      label="Email"
                      placeholder="Email"
                      size="small"
                    />
                    <RHFTextField
                      name="password"
                      label="Password"
                      placeholder="Password"
                      size="small"
                    />
                    <RHFTextField
                      name="gst"
                      label="GST Number"
                      placeholder="GST Number"
                      size="small"
                    />
                    <RHFTextField
                      name="pan"
                      label="PAN Number"
                      placeholder="PAN Number"
                      size="small"
                    />
                    <RHFTextField
                      name="companyname"
                      label="company name"
                      size="small"
                      placeholder="Company Name"
                    />
                    <RHFTextField
                      name="companyAddress"
                      label="Company Address"
                      size="small"
                      placeholder="Company Address"
                    />
                  </FormGrid>

                  {/* Item 2b: the IP allow-list, at creation time. */}
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>
                      IP allow-list
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}
                    >
                      A partner cannot make a single API call until at least one
                      address is set. Ranges (10.0.0.0/8) are rejected - the
                      platform compares addresses exactly.
                    </Typography>

                    {newPartnerIps.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 1 }}
                      >
                        {newPartnerIps.map((ip) => (
                          <Chip
                            key={ip}
                            size="small"
                            label={ip}
                            onDelete={() =>
                              setNewPartnerIps((prev) =>
                                prev.filter((x) => x !== ip)
                              )
                            }
                          />
                        ))}
                      </Stack>
                    )}

                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <TextField
                        size="small"
                        fullWidth
                        label="Add an IPv4 or IPv6 address"
                        placeholder="203.0.113.10"
                        value={newPartnerIpDraft}
                        onChange={(e) => setNewPartnerIpDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addNewPartnerIp();
                          }
                        }}
                        error={Boolean(newPartnerIpError)}
                        helperText={newPartnerIpError || " "}
                      />
                      <Button
                        variant="outlined"
                        onClick={addNewPartnerIp}
                        disabled={
                          !newPartnerIpDraft.trim() ||
                          Boolean(newPartnerIpError)
                        }
                        sx={{ mt: 0.25 }}
                      >
                        Add
                      </Button>
                    </Stack>
                  </Box>

                  <Autocomplete
                    multiple
                    id="checkboxes-tags-demo"
                    options={cateList}
                    disableCloseOnSelect
                    getOptionLabel={(option: any) => option.category_name}
                    sx={{ my: 2 }}
                    onChange={(event, newValue) => {
                      setCheckBox(newValue);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} style={{ padding: 0 }}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.category_name}
                      </li>
                    )}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        size="small"
                        placeholder="Category"
                      />
                    )}
                  />
                </>
              ) : null}

              {otpReq ? (
                <FormGrid columns={2}>
                  <TextField
                    name="emailotp"
                    size="small"
                    label="Email OTP"
                    placeholder="Email OTP"
                    onChange={(e) => setEmailOtp(e.target.value)}
                  />
                  <TextField
                    name="mobileotp"
                    size="small"
                    label="Mobile OTP"
                    placeholder="Mobile OTP"
                    onChange={(e) => setMobileOtp(e.target.value)}
                  />
                </FormGrid>
              ) : null}

              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="flex-end"
                sx={{
                  mt: 3,
                  pt: 2.5,
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  onClick={handleClose}
                >
                  Close
                </LoadingButton>

                {otpReq ? (
                  <LoadingButton variant="contained" onClick={VerifyOTP}>
                    Verify User
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={isSubmitLoading}
                  >
                    Add User
                  </LoadingButton>
                )}
              </Stack>
            </Box>
          </FormProvider>
        </ModalShell>
      </Modal>

      {/* <TableContainer sx={{ border: "1px", height: "70vh ", mt: "0px" }}>
          <Scrollbar>
            <Table stickyHeader>
              <TableHeadCustom headLabel={tableLabels} />

              <TableBody>
                {appdata.map((row: any, index: number) => (
                  <EcommerceBestSalesmanRow
                    key={row._id || index}
                    row={row}
                    refreshList={ListApiUser}
                  />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer> */}

      {isListLoading ? (
        <TableSkeleton columns={ECOSYSTEM_COLUMNS} rows={8} minWidth={1180} />
      ) : table.isEmpty ? (
        <EmptyState
          icon={<HubOutlinedIcon />}
          title={
            table.isFiltered ? "No matching API users" : "No API users yet"
          }
          description={
            table.isFiltered
              ? "Nothing matches that search. Clear it to see the whole estate."
              : "Add the first API user to start integrating partners with the platform."
          }
          action={
            !table.isFiltered ? (
              <PageActionButton
                startIcon={<PersonAddAltOutlinedIcon />}
                onClick={openEditModal}
              >
                Add API User
              </PageActionButton>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          minWidth={1180}
          columns={ECOSYSTEM_COLUMNS}
          sortBy={table.sortBy}
          sortDir={table.sortDir}
          onSort={table.toggleSort}
          footer={
            <TablePagination
              component="div"
              count={table.total}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onPageChange={(_, page) => table.setPage(page)}
              onRowsPerPageChange={(event) =>
                table.changeRowsPerPage(Number(event.target.value))
              }
            />
          }
        >
          {table.paged.map((row: any, index: number) => {
            const name =
              [row.firstName, row.lastName].filter(Boolean).join(" ") ||
              "Unnamed user";
            const verified = Boolean(row?.emailVerify && row?.mobileVerify);

            return (
              <KitRow
                key={row._id || index}
                sx={{ cursor: "pointer" }}
                onClick={() => setDetailRow(row)}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontSize: 12.5,
                        fontWeight: 700,
                        bgcolor: "primary.lighter",
                        color: "primary.dark",
                      }}
                    >
                      {(row.firstName?.[0] || "") + (row.lastName?.[0] || "")}
                    </Avatar>
                    <Stack spacing={0.4} sx={{ minWidth: 0 }}>
                      <StackedCell
                        bold
                        primary={name}
                        secondary={
                          [row.userCode, row.role]
                            .filter(Boolean)
                            .join(" | ") || undefined
                        }
                      />
                      {/* Item 3a: `ready` is the one field that says whether the
                          platform will actually let this partner transact. Rows
                          looked identical before, ready or not. */}
                      {readinessById[row._id] && (
                        <Tooltip
                          title={
                            readinessById[row._id].ready
                              ? readinessById[row._id].warnings?.length
                                ? `Ready. Warnings: ${readinessById[
                                    row._id
                                  ].warnings.join(", ")}`
                                : "Ready to transact."
                              : `Blocked by: ${(
                                  readinessById[row._id].blocking || []
                                ).join(", ")}`
                          }
                        >
                          <Chip
                            size="small"
                            variant="outlined"
                            color={
                              readinessById[row._id].ready
                                ? readinessById[row._id].warnings?.length
                                  ? "warning"
                                  : "success"
                                : "error"
                            }
                            label={
                              readinessById[row._id].ready
                                ? readinessById[row._id].warnings?.length
                                  ? `Ready (${
                                      readinessById[row._id].warnings.length
                                    } warning)`
                                  : "Ready"
                                : "Not ready"
                            }
                            sx={{ alignSelf: "flex-start", height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell>
                  <StackedCell
                    primary={row.company_name || "-"}
                    secondary={
                      [
                        row.GSTNumber && "GST " + row.GSTNumber,
                        row.PANnumber && "PAN " + row.PANnumber,
                      ]
                        .filter(Boolean)
                        .join(" | ") || undefined
                    }
                  />
                </TableCell>

                <TableCell>
                  <StackedCell
                    primary={row.email || "-"}
                    secondary={row.contact_no || undefined}
                  />
                </TableCell>

                <TableCell align="center">
                  <Stack alignItems="center" spacing={0.5}>
                    <StatusPill status={verified ? "Verified" : "Unverified"} />
                    <Typography
                      sx={{ fontSize: 10.5, color: "text.secondary" }}
                    >
                      {(row.emailVerify ? "email" : "no email") +
                        " | " +
                        (row.mobileVerify ? "mobile" : "no mobile")}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell align="right">
                  <StackedCell
                    primary={
                      "Rs." + (fIndianCurrency(row.main_wallet_amount) || "0")
                    }
                    secondary={
                      "AEPS Rs." +
                      (fIndianCurrency(row.AEPS_wallet_amount) || "0")
                    }
                  />
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {row.createdAt ? fDate(row.createdAt) : "-"}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <PageGhostButton
                    startIcon={<ManageAccountsOutlinedIcon />}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDetailRow(row);
                    }}
                  >
                    Manage
                  </PageGhostButton>
                </TableCell>
              </KitRow>
            );
          })}
        </DataTable>
      )}

      {/* Full per-user control panel. The existing card component is reused
          unchanged, so every action it carried still works exactly as before -
          only where it renders has moved. */}
      <Drawer
        anchor="right"
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 620, md: 720 }, p: 0 },
        }}
      >
        {detailRow && (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 3,
                py: 2,
                position: "sticky",
                top: 0,
                zIndex: 2,
                backgroundColor: "background.paper",
                borderBottom: (t) => "1px solid " + t.palette.divider,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700 }} noWrap>
                  {[detailRow.firstName, detailRow.lastName]
                    .filter(Boolean)
                    .join(" ") || "API user"}
                </Typography>
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary" }}
                  noWrap
                >
                  {[detailRow.userCode, detailRow.email]
                    .filter(Boolean)
                    .join(" | ")}
                </Typography>
              </Box>

              <IconButton onClick={() => setDetailRow(null)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ p: 2.5 }}>
              <EcommerceBestSalesmanRow
                row={detailRow}
                refreshList={ListApiUser}
              />

              {/* Stage 2: the four gates between "created" and "can transact",
                  plus the IP allow-list (2b), the allowed-users row (2c), the
                  callback URLs (2d) and the readiness report (3a). */}
              <Box sx={{ mt: 2.5 }}>
                <PartnerAccessPanel
                  partnerId={detailRow._id}
                  onChanged={ListApiUser}
                />
              </Box>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
  refreshList: () => void;
};
// sd
function EcommerceBestSalesmanRow({
  row,
  refreshList,
}: EcommerceBestSalesmanRowProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [emailOtp, setEmailOtp] = React.useState("");
  const [mobileOtp, setMobileOtp] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [open, setModalEdit] = React.useState(false);
  const [aepsData, Setaeps] = useState<any>([]);
  const [apiUserID, setApiUserID] = useState("");
  const [currentPages, setCurrentPages] = useState<any>(1);
  const [openServices, setOpenServices] = React.useState(false);
  const openEditModal = (val: any) => {
    setModalEdit(true);
    setUserId(val);
    resendOtp(val);
  };

  const [openCallbackModal, setOpenCallbackModal] = useState(false);
  const [callbackData, setCallbackData] = useState<
    Record<string, string | null>
  >({});

  const openservicesModal = (e: any) => {
    setApiUserID(e);
    setOpenServices(true);
  };
  const navigate = useNavigate();
  const handleCloseServices = () => setOpenServices(false);
  const [CheckBoxUpdatedS, setCheckBoxUpdatedS] = useState<any>([]);
  const [cateListUpdated, setCateListUpdated] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(row.beneValidationCharge);
  const [isEditing1, setIsEditing1] = useState(false);
  const [fieldValue1, setFieldValue1] = useState(row.bin_verify_charges);
  const [isEditing2, setIsEditing2] = useState(false);
  const [fieldValue2, setFieldValue2] = useState(row.upiValidationCharge);
  const [isEditing3, setIsEditing3] = useState(false);
  const [isEditing4, setIsEditing4] = useState(false);
  const [aadharValue, setAadharValue] = useState(row.adhaarValidationCharge);
  const [AEPS2FACharge, setSetAEPS2FACharge] = useState(row.aepsCharge2FA);

  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [minTxnLimit, setMinLimit] = useState<number | string>(
    row.minTxnLimit ?? ""
  );
  const [maxTxnLimit, setMaxLimit] = useState<number | string>(
    row.maxTxnLimit ?? ""
  );
  const [savingLimits, setSavingLimits] = useState(false);
  const minInputRef = useRef<HTMLInputElement | null>(null);
  const maxInputRef = useRef<HTMLInputElement | null>(null);

  const toggleEditLimits = () => setIsEditingLimit((s) => !s);

  const [isEditingLien, setIsEditingLien] = useState(false);
  const [lienValue, setLienValue] = useState<number | string>(
    row.lienAmount ?? ""
  );
  const [savingLien, setSavingLien] = useState(false);

  useEffect(() => {
    if (isEditingLimit && minInputRef.current) {
      minInputRef.current.focus(); // edit start pe min ko focus
    }
  }, [isEditingLimit]);

  const saveLimits = async () => {
    // basic validation
    const minN = Number(minTxnLimit);
    const maxN = Number(maxTxnLimit);
    if (isNaN(minN) || isNaN(maxN)) {
      enqueueSnackbar("Please enter valid numeric values for limits", {
        variant: "error",
      });
      return;
    }
    if (minN > maxN) {
      enqueueSnackbar("Min limit cannot be greater than Max limit", {
        variant: "error",
      });
      return;
    }

    setSavingLimits(true);

    const body = {
      userId: row._id,
      minTxn: minN,
      maxTxn: maxN,
    };

    // Replace endpoint with the real one if needed
    Api(
      `admin/API_User_Management/changeTxnLimit/${row._id}`,
      "POST",
      body,
      localStorage.getItem("token")
    )
      .then((Response: any) => {
        setSavingLimits(false);
        if (Response?.status === 200 && Response.data?.code === 200) {
          enqueueSnackbar(Response.data.message || "Limits updated", {
            variant: "success",
          });
          setIsEditingLimit(false);
          refreshList();
        } else {
          enqueueSnackbar(Response.data?.message || "Failed to update limits", {
            variant: "error",
          });
        }
      })
      .catch((err: any) => {
        setSavingLimits(false);
        console.error(err);
        enqueueSnackbar("API request failed", { variant: "error" });
      });
  };

  const saveLienAmount = () => {
    const lienN = Number(lienValue);

    if (isNaN(lienN) || lienN < 0) {
      enqueueSnackbar("Invalid lien amount", { variant: "error" });
      return;
    }

    setSavingLien(true);

    Api(
      "admin/lien/apply-lien",
      "POST",
      {
        userId: row._id,
        lienAmount: lienN,
      },
      localStorage.getItem("token")
    )
      .then((res: any) => {
        setSavingLien(false);
        // Item 1b/1c: this gated on `data.success`, which the `{ code, message }`
        // contract does not set - so a lien that saved correctly still reported
        // "Failed to update lien". The failure branch also discarded the
        // backend's message, which is written for an operator to read.
        if (isOk(res)) {
          notifyOk(enqueueSnackbar, res, "Lien updated");
          refreshList();
          setIsEditingLien(false);
        } else {
          notifyFailure(enqueueSnackbar, res);
        }
      })
      .catch(() => {
        setSavingLien(false);
        enqueueSnackbar("API error", { variant: "error" });
      });
  };

  const handleSave = () => {
    setIsEditing(false);
    SaveBene(fieldValue);
  };

  const handleSave1 = () => {
    setIsEditing1(false);
    SaveBin(fieldValue1);
  };

  const handleSave2 = () => {
    setIsEditing2(false);
    SaveUpi(fieldValue2);
  };

  const handleSave3 = () => {
    setIsEditing3(false);
    saveAadhar(setAadharValue);
  };

  const handleSave4 = () => {
    setIsEditing4(false);
    SaveAEPSCharges2FA(AEPS2FACharge);
  };

  const [selectedRow, setSelectedRow] = useState(null);
  const openViewModal = (row: any) => {
    setViewModalOpen(true);
    setSelectedRow(row);
  };
  const handleClose = () => setModalEdit(false);

  const accountValidate = Yup.object().shape({});
  const defaultValues = {
    fname: "",
    lname: "",
    contact: "",
    email: "",
    password: "",
    gst: "",
    pan: "",
    companyname: "",
    companyAddress: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    // border: '4px solid #00AB55',
    borderRadius: 5,
    boxShadow: 24,
    padding: "40px 32px",
  };
  const { copy } = useCopyToClipboard();

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const tableLabels = [
    { id: "Name", label: "Name" },
    { id: "merchantPhoneNumber", label: "Mobile Number" },
    { id: "email ", label: "Email" },
    { id: "merchantLogin", label: "MerchantLogin" },
    { id: "merchantAddress", label: "MerchantAddress" },
    { id: "Userpan", label: "User Pan" },
    { id: "Aadhaar number", label: "Aadhaar Number" },
    { id: "Companypan", label: "Company Pan" },
    { id: "Lat Long", label: "Lat Long" },
  ];

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const handleCopyClick = (data: any) => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        console.log("Data copied:", data);
      })
      .catch((error) => {
        console.error("Unable to copy data", error);
      });
  };

  useEffect(() => {
    categoryList();
  }, []);

  const categoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      // console.log("====ApprovedList==User==response====>" + Response);
      if (isOk(Response)) {
        setCateListUpdated(Response.data.data);
        // console.log(
        //   "====ApprovedList==data.data udata===>",
        //   Response.data.data
        // );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const UpdateCategory = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let cate: any = CheckBoxUpdatedS.map((item: any) => {
      return item.category_name;
    });
    const body = {
      apiUserId: apiUserID,
      category: cate,
    };
    Api(
      `admin/API_User_Management/update_categories`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("====ApprovedList==User==response====>" + Response);
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);

        handleCloseServices();
        console.log(
          "====ApprovedList==data.data udata===>",
          Response.data.data
        );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const SaveBene = (val: any) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: row._id,
      beneValidationCharge: fieldValue,
    };
    Api(`admin/setBeneVerificationCharge`, "POST", body, token).then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const SaveBin = (val: any) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: row._id,
      binVerifyCharge: fieldValue1,
    };
    Api(`admin/bin_verify_charge`, "POST", body, token).then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const SaveAEPSCharges2FA = (val: any) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: row._id,
      aepsCharge2FA: AEPS2FACharge,
    };
    Api(`admin/aepsValidationCharge`, "POST", body, token).then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const SaveUpi = (val: any) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: row._id,
      upiValidationCharge: fieldValue2,
    };
    Api(`admin/setUpiVerificationCharge`, "POST", body, token).then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const saveAadhar = (val: any) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: row._id,
      adhaarValidationCharge: setAadharValue,
    };
    Api(`admin/adhaarValidationCharge`, "POST", body, token).then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const resendOtp = (val: any) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: val,
    };
    Api(`apiBox/resendOtp`, "POST", body, token).then((Response: any) => {
      console.log("====ApprovedList==User==response====>" + Response);
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        console.log(
          "====ApprovedList==data.data udata===>",
          Response.data.data
        );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };
  const VerifyOTPAgain = () => {
    const body = {
      userId: userId,
      mobileOtp: mobileOtp,
      emailOtp: emailOtp,
    };
    Api(`admin/API_User_Management/verifyOTP_API_User`, "POST", body, "").then(
      (Response: any) => {
        console.log("====ApprovedList==User==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          handleClose();
          console.log(
            "====ApprovedList==data.data udata===>",
            Response.data.data
          );
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getAepsApiUser = () => {
    // Item 1a: this sent empty strings for both fields. An absent `pageSize` used
    // to return the entire collection, which is what this screen relies on - the
    // backend now defaults to 25, so empty strings would silently cut the list to
    // the first 25 rows. Both fields are sent explicitly, at the 1000-row ceiling
    // the backend caps reports at.
    const body = {
      pageInitData: {
        pageSize: 1000,
        currentPage: 1,
      },
    };

    Api(`admin/getAepsApiUser/${row._id}`, "POST", body, "").then(
      (Response: any) => {
        console.log("====AepsApiUser==response====>" + Response);
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          handleClose();
          Setaeps(Response.data.data);
          console.log("====AepsApiUserResponse===>", Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const [beneVerification, setBeneVerification] = useState<boolean>(
    row.allowed
  );
  /** Item 2c: whether an `allowed_users` row exists at all - see below. */
  const [hasAllowListRow, setHasAllowListRow] = useState<boolean | null>(null);

  const setBeneVerificationStatus = (id: string, val: boolean) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: id,
      allowed: val,
    };

    Api(
      `admin/API_User_Management/changeAllowedUsers/${row._id}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======response====>" + JSON.stringify(Response));
      console.log("ROW id of user", row._id);
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);

        const userId = Response.data.data.userId;
        if (Response.data.data.allowed == false) {
          setBeneVerification(false);
          // setBeneVerification(true);
        }
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  // get api use restriction list
  const [dataUserRestrictionList, setdataUserRestrictionList] = useState([]);
  const userRestrictionList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/API_User_Management/getAllowedUsers`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setdataUserRestrictionList(Response.data.data);

          // setBeneVerification(userRestriction);
          const foundUser = Response.data.data.find(
            (user: any) => user.userId === row._id
          );

          if (foundUser) {
            setBeneVerification(foundUser.allowed);
            setUserRestriction(foundUser.isBeneSearchInDatabase);
            // Item 2c: a partner with no `allowed_users` row is refused at every
            // transaction with "User not found in the allowed list". That is a
            // different operator problem from being deliberately blocked, and
            // the switch alone cannot tell them apart - both read "Disabled".
            setHasAllowListRow(Boolean(foundUser.hasAllowListRow));
          } else {
            // console.log("=====approved List Error====" + Response)
          }
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  // Call the API on component mount
  useEffect(() => {
    userRestrictionList();
  }, []);

  const [userRestriction, setUserRestriction] = useState<boolean>(
    row.isBeneSearchInDatabase
  );

  const setUserRestrictionStatus = (id: string, val: boolean) => {
    let token = localStorage.getItem("token");
    const body = {
      userId: id,
      isBeneSearchInDatabase: val,
    };

    Api(
      `admin/API_User_Management/list_API_users/${row._id}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("====user restriction status==response====>" + Response);
      if (isOk(Response)) {
        setUserRestriction(val);

        enqueueSnackbar(Response.data.message);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const handlePageChange1 = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPages(value);
  };

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
    },
    modal: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
      textAlign: "center",
      minWidth: "300px",
    },
    formContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
  };

  const [showModal, setShowModal] = useState(false);
  //id
  //  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  //  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openEditModalPopup = (userId: string) => {
    console.log("Selected User ID:", userId); // Debugging
    setSelectedUserId(userId);
    setShowModal(true);

    // call
    fetchUserDetails(userId);
  };

  //

  // setdata

  const [userData, setUserData] = useState<any>({});

  const fetchUserDetails = async (userId: string) => {
    const url = `admin/API_User_Management/getApiUserDetails/${userId}`;
    const token = "";
    const body = {};

    Api(url, "GET", body, token)
      .then((Response: any) => {
        console.log("====User Details API Response====>", Response);

        if (Response?.status === 200 && Response.data?.code === 200) {
          console.log("User Details Fetched:", Response.data.data);
          setUserData({
            firstName: Response.data.data.firstName || "",
            lastName: Response.data.data.lastName || "",
            contact_no: Response.data.data.contact_no || "",
            userCode: Response.data.data.userCode || "",
            email: Response.data.data.email || "",
            GSTNumber: Response.data.data.GSTNumber || "",
            PANnumber: Response.data.data.PANnumber || "",
            company_name: Response.data.data.company_name || "",
            companyAddress: Response.data.data.companyAddress || "",
            AEPS_wallet_amount: Response.data.data.AEPS_wallet_amount || "",
            main_wallet_amount: Response.data.data.main_wallet_amount || "",
            bin_verify_charges: Response.data.data.bin_verify_charges || "",
            beneValidationCharge: Response.data.data.beneValidationCharge || "",
            upiValidationCharge: Response.data.data.upiValidationCharge || "",
            kycAdharVerificationCharge:
              Response.data.data.kycAdharVerificationCharge || "",
            adhaarValidationCharge:
              Response.data.data.adhaarValidationCharge || "",
            aepsCharge2FA: Response.data.data.aepsCharge2FA || "",
            pennliesValidateBankAccountCharge:
              Response?.data?.data?.pennliesValidateBankAccountCharge || "",
            pennyDropValidateBankAccountCharge:
              Response?.data?.data?.pennyDropValidateBankAccountCharge || "",
            OptimizedValidateBankAccountCharge:
              Response?.data?.data?.OptimizedValidateBankAccountCharge || "",
            mobileUpiCharge: Response?.data?.data?.mobileUpiCharge || "",

            createdAt: Response.data.data.createdAt || "",
          });
        } else {
          enqueueSnackbar(
            Response.data?.message || "Error fetching user details",
            { variant: "error" }
          );
        }
      })
      .catch((error: any) => {
        console.error("API Error:", error);
        enqueueSnackbar("API request failed", { variant: "error" });
      });
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId); // Fetch updated data when ID changes
    }
  }, [selectedUserId]);

  // Now Save
  const handleSaveedit = async () => {
    if (!selectedUserId) {
      console.error("User ID is missing");
      return;
    }

    const url = `admin/API_User_Management/updateApiUserDetails/${selectedUserId}`;
    const token = "your-auth-token"; // Replace with actual token if needed

    Api(url, "POST", userData, token)
      .then((Response: any) => {
        console.log("====Update User API Response====>", Response);

        if (Response?.status === 200 && Response.data?.code === 200) {
          console.log("User Updated Successfully:", Response.data);
          enqueueSnackbar("User updated successfully!", { variant: "success" });

          // Fetch updated user details immediately after saving
          fetchUserDetails(selectedUserId);

          closeModal(); // Close modal after saving
        } else {
          enqueueSnackbar(Response.data?.message || "Failed to update user", {
            variant: "error",
          });
        }
      })
      .catch((error: any) => {
        console.error("API Error:", error);
        enqueueSnackbar("API request failed", { variant: "error" });
      });
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId);
    }
  }, [selectedUserId]);

  type Category = {
    _id: string;
    name: string;
    allowed: boolean;
  };

  type User = {
    _id: string;
    userCode: string;
    allowed: boolean;
    userId: string;
    categories: Category[];
  };

  const [checkedUserRestriction, setCheckedUserRestriction] =
    React.useState(true);

  const [allRestrictedUsers, setAllRestrictedUsers] = useState<User[]>([]);

  return (
    <>
      <Card
        sx={{
          p: 2.5,
          borderRadius: 3,
          mb: 2,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          border: "1px solid #f1f5f9",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Header: Name + Verification Status */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: "primary.lighter",
                color: "primary.dark",
                fontWeight: 700,
              }}
            >
              {row.firstName?.[0]}
              {row.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography
                sx={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}
              >
                {`${row.firstName} ${row.lastName}`}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                {row.userCode || "No Code"} · {row.role}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {row.emailVerify && row.mobileVerify ? (
              <Chip
                label="Verified"
                size="small"
                sx={{
                  backgroundColor: "#f0fdf4",
                  color: "#22c55e",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
            ) : (
              <Chip
                label="Unverified"
                size="small"
                sx={{
                  backgroundColor: "#fef2f2",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
            )}
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Row 1: User Details + Business Details */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              User Details
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              {row.email}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              {row.contact_no}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              IP: {row.myIp || "Not Set"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
              Created: {fDate(row.createdAt)}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              Business Details
            </Typography>
            {row.company_name && (
              <Typography sx={{ fontSize: 12, color: "#475569" }}>
                {row.company_name}
              </Typography>
            )}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography sx={{ fontSize: 12, color: "#475569" }}>
                GST: {row.GSTNumber || "—"}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onCopy(row.GSTNumber)}
                sx={{ p: 0.3 }}
              >
                <Iconify icon="eva:copy-fill" width={14} />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography sx={{ fontSize: 12, color: "#475569" }}>
                PAN: {row.PANnumber || "—"}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onCopy(row.PANnumber)}
                sx={{ p: 0.3 }}
              >
                <Iconify icon="eva:copy-fill" width={14} />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        {/* Row 2: Wallet + OTP */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              Wallet Balance
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              AEPS: ₹{fIndianCurrency(row.AEPS_wallet_amount) || "0"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              Main: ₹{fIndianCurrency(row.main_wallet_amount) || "0"}
            </Typography>
          </Box>

          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              Current OTP
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              Mobile: {row.mobileOtp}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#475569" }}>
              Email: {row.emailOtp}
            </Typography>
          </Box>
        </Box>

        {/* Row 3: Min/Max Limit + Lien */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              Min / Max Limit
            </Typography>
            {!isEditingLimit ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Min: {minTxnLimit ?? "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Max: {maxTxnLimit ?? "—"}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    setMinLimit(row.minTxnLimit ?? "");
                    setMaxLimit(row.maxTxnLimit ?? "");
                    setIsEditingLimit(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <Stack spacing={0.8}>
                <Stack direction="row" spacing={0.8}>
                  <TextField
                    size="small"
                    label="Min"
                    value={String(minTxnLimit ?? "")}
                    onChange={(e) =>
                      setMinLimit(e.target.value.replace(/\D/g, ""))
                    }
                    sx={{ width: 80 }}
                    inputRef={minInputRef}
                  />
                  <TextField
                    size="small"
                    label="Max"
                    value={String(maxTxnLimit ?? "")}
                    onChange={(e) =>
                      setMaxLimit(e.target.value.replace(/\D/g, ""))
                    }
                    sx={{ width: 80 }}
                    inputRef={maxInputRef}
                  />
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={saveLimits}
                    disabled={savingLimits}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setIsEditingLimit(false);
                      setMinLimit(row.minTxnLimit ?? "");
                      setMaxLimit(row.maxTxnLimit ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>

          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                mb: 0.5,
              }}
            >
              Lien Amount
            </Typography>
            {!isEditingLien ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontSize: 12, color: "#475569" }}>
                  ₹{row.lienAmount ?? 0}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setLienValue(row.lienAmount ?? "");
                    setIsEditingLien(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <Stack spacing={0.8}>
                <TextField
                  size="small"
                  label="Lien"
                  value={String(lienValue)}
                  onChange={(e) =>
                    setLienValue(e.target.value.replace(/\D/g, ""))
                  }
                  sx={{ width: 120 }}
                />
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={saveLienAmount}
                    disabled={savingLien}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setIsEditingLien(false);
                      setLienValue(row.lienAmount ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Actions Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            mb: 2,
          }}
        >
          {/* Edit User Data */}
          <Button
            variant="contained"
            size="small"
            onClick={() => openEditModalPopup(row._id)}
            sx={{
              borderRadius: 2,
              fontSize: 11,
              boxShadow: "none",
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Edit User
          </Button>

          {/* Callbacks */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setCallbackData(row.partnerCallbackUrls || {});
              setOpenCallbackModal(true);
            }}
            sx={{
              borderRadius: 2,
              fontSize: 11,
              borderColor: "primary.main",
              color: "primary.main",
            }}
          >
            Callbacks
          </Button>

          {/* Verify / Verified */}
          {!row.emailVerify && !row.mobileVerify ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => openEditModal(row._id)}
              sx={{
                borderRadius: 2,
                fontSize: 11,
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                boxShadow: "none",
              }}
            >
              Verify Now
            </Button>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
            >
              <Typography
                sx={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}
              >
                Verified
              </Typography>
              <Icon
                icon="material-symbols:verified"
                color="green"
                fontSize={18}
              />
            </Stack>
          )}
        </Box>

        {/* User Permission + Service Actions */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <IOSSwitch
                  sx={{ m: 1 }}
                  checked={beneVerification}
                  onClick={() =>
                    setBeneVerificationStatus(row._id, !beneVerification)
                  }
                />
              }
              label={
                <Stack spacing={0.25}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                    {beneVerification ? "Enabled" : "Disabled"}
                  </Typography>
                  {/* Item 2c: "no row" and "blocked" both rendered as
                      "Disabled" before, so an operator could not tell an
                      un-onboarded partner from a deliberately blocked one. */}
                  {hasAllowListRow === false && (
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "warning.main",
                        fontWeight: 600,
                      }}
                    >
                      No allow-list row - never onboarded
                    </Typography>
                  )}
                </Stack>
              }
            />
          </FormGroup>

          <Stack spacing={0.8}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => openViewModal(getAepsApiUser)}
              sx={{
                borderRadius: 2,
                fontSize: 11,
                borderColor: "#22c55e",
                color: "#22c55e",
              }}
            >
              View Users
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => openservicesModal(row._id)}
              sx={{
                borderRadius: 2,
                fontSize: 11,
                borderColor: "primary.main",
                color: "primary.main",
              }}
            >
              Update Services
            </Button>
          </Stack>
        </Box>
      </Card>
      <StyledTableRow>
        {/* <TableCell sx={{ padding: "7px" }}> */}
        {/* <Stack direction="row" alignItems="center"> */}
        {/* <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2">
                {" "}
                {`${row.firstName} ${row.lastName}`} ({row.role})
              </Typography>
              <Typography variant="subtitle2"> {row?.company_name}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {row.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {row.contact_no}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Whitelisted IP {row.myIp || "IP Not Set"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                CreatedAt: {fDate(row.createdAt)}
              </Typography>
            </Box> */}
        {/* </Stack> */}
        {/* </TableCell> */}
        {/* <TableCell>
          <Typography variant="body2">User Code : {row?.userCode}</Typography>
          <Typography variant="body2">
            GST : {row.GSTNumber}
            <IconButton onClick={() => onCopy(`${row.GSTNumber}`)}>
              <Iconify icon="eva:copy-fill" width={20} />
            </IconButton>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            PAN : {row.PANnumber}
            <IconButton onClick={() => onCopy(`${row.PANnumber}`)}>
              <Iconify icon="eva:copy-fill" width={20} />
            </IconButton>
          </Typography>
        </TableCell> */}
        {/* <TableCell>
          <Typography variant="body2">
            AEPS Wallet Rs.
            {fIndianCurrency(row.AEPS_wallet_amount) || "0"}
          </Typography>
          <Typography variant="body2">
            MAIN Wallet Rs.
            {fIndianCurrency(row.main_wallet_amount) || "0"}
          </Typography>
        </TableCell> */}
        {/* <TableCell>
          <Typography variant="body2">
            Mobile OTP : {row?.mobileOtp}
            
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Email OTP : {row?.emailOtp}
            
          </Typography>
        </TableCell> */}

        {/* <TableCell> */}
        {/* <Button
            onClick={() => openEditModalPopup(row._id)}
            variant="contained"
            sx={{ ml: 2 }}
          >
            Edit
          </Button> */}

        {/* {showModal && (
            <div style={styles.overlay}>
              <div
                style={{
                  ...styles.modal,
                  maxHeight: "85vh",
                  overflowY: "auto",
                }}
              > */}

        {/* <h2>Edit User Details</h2>
                <Box component="form" sx={styles.formContainer}> */}

        {/* <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      sx={{ gridColumn: "span 2" }}
                      value={userData.firstName}
                      onChange={(e) =>
                        setUserData({ ...userData, firstName: e.target.value })
                      }
                    />

                    <TextField
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      value={userData?.lastName || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, lastName: e.target.value })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />

                    <TextField
                      label="Company Name"
                      variant="outlined"
                      fullWidth
                      value={userData?.company_name || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          company_name: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 4" }}
                    />

                    <TextField
                      label="Email"
                      variant="outlined"
                      fullWidth
                      value={userData?.email || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />

                    <TextField
                      label="Mobile Number"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.contact_no || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, contact_no: e.target.value })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                  </Box> */}

        {/* <Box
                    sx={{
                      gridColumn: "span 2",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="User Code"
                      variant="outlined"
                      fullWidth
                      value={userData?.userCode || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, userCode: e.target.value })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />

                    <TextField
                      label="GST Number"
                      variant="outlined"
                      fullWidth
                      value={userData?.GSTNumber || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, GSTNumber: e.target.value })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      label="PAN Number"
                      variant="outlined"
                      fullWidth
                      value={userData?.PANnumber || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, PANnumber: e.target.value })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      label="Company Address"
                      variant="outlined"
                      fullWidth
                      value={userData?.companyAddress || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          companyAddress: e.target.value,
                        })
                      }
                      sx={{ gridColumn: "span 2" }}
                    />
                  </Box> */}
        {/* Wallet Balance */}
        {/* <Box
                    sx={{
                      gridColumn: "span 2",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 2,
                    }}
                  ></Box> */}
        {/* Verification Charges (3-column layout) */}

        {/* Wallet Balance */}
        {/* <Box
                    sx={{
                      gridColumn: "span 2",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 2,
                    }}
                  ></Box> */}
        {/* Verification Charges (3-column layout) */}
        {/* <Box
                    sx={{
                      gridColumn: "span 2",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Aadhar Charges"
                      variant="outlined"
                      fullWidth
                      value={userData?.adhaarValidationCharge}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          adhaarValidationCharge: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="BIN Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.bin_verify_charges}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          bin_verify_charges: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="Bene Verification Charges"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={userData?.beneValidationCharge}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          beneValidationCharge: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="UPI Validation Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.upiValidationCharge || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          upiValidationCharge: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label=" Mobile UPI Validation Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.mobileUpiCharge || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          mobileUpiCharge: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="KYC Adhar Validation Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.kycAdharVerificationCharge || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          kycAdharVerificationCharge: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="AEPS FA Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.aepsCharge2FA}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          aepsCharge2FA: e.target.value,
                        })
                      }
                      // sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      label="Penny less Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.pennliesValidateBankAccountCharge}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          pennliesValidateBankAccountCharge: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Penny drop Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.pennyDropValidateBankAccountCharge}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          pennyDropValidateBankAccountCharge: e.target.value,
                        })
                      }
                    />

                    <TextField
                      label="Optimized Validation Charges"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={userData?.OptimizedValidateBankAccountCharge}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          OptimizedValidateBankAccountCharge: e.target.value,
                        })
                      }
                    />
                  </Box> */}

        {/* Buttons */}
        {/* <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    marginTop={2}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveedit}
                    >
                      Save
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                  </Stack> */}
        {/* </Box> */}
        {/* </div>
            </div>
          )} */}

        {/* <Button
            variant="contained"
            sx={{ ml: 2, mt: 1 }}
            onClick={() => {
              setCallbackData(row.partnerCallbackUrls || {});
              setOpenCallbackModal(true);
            }}
          >
            Callbacks
          </Button> */}

        {/* <Modal
            open={openCallbackModal}
            onClose={() => setOpenCallbackModal(false)}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 3,
                width: 520,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <Typography variant="h6" mb={2}>
                Partner Callback URLs
              </Typography>

              {Object.keys(callbackData).length === 0 && (
                <Typography>No callback URLs found</Typography>
              )}

              {Object.entries(callbackData).map(([key, value]) => (
                <React.Fragment key={key}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ width: "85%" }}>
                      <Typography variant="caption" color="text.secondary">
                        {key.toUpperCase()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {value || "-"}
                      </Typography>
                    </Box>

                    {value && (
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(String(value));
                          enqueueSnackbar("Copied!", { variant: "success" });
                        }}
                      >
                        <Iconify icon="eva:copy-fill" width={20} />
                      </IconButton>
                    )}
                  </Box>
                </React.Fragment>
              ))}

              <Stack alignItems="flex-end" mt={2}>
                <Button
                  variant="contained"
                  onClick={() => setOpenCallbackModal(false)}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </Modal> */}
        {/* </TableCell> */}

        {/* <TableCell>
          <FormGroup>
            <FormControlLabel
              control={
                <IOSSwitch
                  sx={{ m: 1, cursor: "pointer" }}
                  checked={beneVerification}
                  onClick={() =>
                    setBeneVerificationStatus(row._id, !beneVerification)
                  }
                />
              }
              label={<h5>{beneVerification ? "Enable" : "Disable"}</h5>}
            />
          </FormGroup>
        </TableCell> */}

        {/* <TableCell>
          {!row.emailVerify && !row.mobileVerify ? (
            <Stack flexDirection={"row"} gap={1}>
              <Button
                variant="contained"
                onClick={() => openEditModal(row._id)}
              >
                <Typography variant="body2" noWrap>
                  Verify Now
                </Typography>
              </Button>
            </Stack>
          ) : (
            <Stack
              flexDirection={"row"}
              gap={1}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Typography>Verified</Typography>
              <Icon
                icon="material-symbols:verified"
                color="green"
                fontSize={30}
              />{" "}
            </Stack>
          )}
        </TableCell>
        <TableCell align="left">
          <Stack gap={1}>
            <Button
              variant="contained"
              onClick={() => openViewModal(getAepsApiUser)}
            >
              <Typography variant="body2" noWrap>
                View Users
              </Typography>
            </Button>
            <Button
              variant="contained"
              onClick={() => openservicesModal(row._id)}
            >
              <Typography variant="body2" noWrap>
                Update Services
              </Typography>
            </Button>
          </Stack>
        </TableCell> */}

        {/* <TableCell>
          {!isEditingLimit ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box>
                <Typography variant="body2">
                  Min:{" "}
                  {minTxnLimit === "" || minTxnLimit === undefined
                    ? "-"
                    : minTxnLimit}
                </Typography>
                <Typography variant="body2">
                  Max:{" "}
                  {maxTxnLimit === "" || maxTxnLimit === undefined
                    ? "-"
                    : maxTxnLimit}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={() => {
                  setMinLimit(row.minTxnLimit ?? "");
                  setMaxLimit(row.maxTxnLimit ?? "");
                  setIsEditingLimit(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <TextField
                size="small"
                label="Min"
                value={String(minTxnLimit ?? "")} // 👈 always string
                onChange={(e) => setMinLimit(e.target.value.replace(/\D/g, ""))}
                sx={{ width: 100 }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                inputRef={minInputRef}
              />
              <TextField
                size="small"
                label="Max"
                value={String(maxTxnLimit ?? "")} // 👈 always string
                onChange={(e) => setMaxLimit(e.target.value.replace(/\D/g, ""))}
                sx={{ width: 100 }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                inputRef={maxInputRef}
              />

              <IconButton
                size="small"
                onClick={saveLimits}
                disabled={savingLimits}
              >
                <SaveIcon fontSize="small" />
              </IconButton>

              <Button
                variant="text"
                onClick={() => {
                  setIsEditingLimit(false);
                  setMinLimit(row.minTxnLimit ?? "");
                  setMaxLimit(row.maxTxnLimit ?? "");
                }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </TableCell>

        <TableCell>
          {!isEditingLien ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                Lien: ₹{row.lienAmount ?? 0}
              </Typography>

              <IconButton
                size="small"
                onClick={() => {
                  setLienValue(row.lienAmount ?? "");
                  setIsEditingLien(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <TextField
                size="small"
                label="Lien Amount"
                value={String(lienValue)}
                onChange={(e) =>
                  setLienValue(e.target.value.replace(/\D/g, ""))
                }
                sx={{ width: 120 }}
              />

              <IconButton
                size="small"
                onClick={saveLienAmount}
                disabled={savingLien}
              >
                <SaveIcon fontSize="small" />
              </IconButton>

              <Button
                variant="text"
                onClick={() => {
                  setIsEditingLien(false);
                  setLienValue(row.lienAmount ?? "");
                }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </TableCell> */}
      </StyledTableRow>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <TextField
              name="emailotp"
              label="Email OTP"
              size="small"
              placeholder="Email OTP"
              onChange={(e) => setEmailOtp(e.target.value)}
            />
            <TextField
              name="mobileotp"
              label="Mobile OTP"
              size="small"
              placeholder="Mobile OTP"
              onChange={(e) => setMobileOtp(e.target.value)}
            />
          </Box>
          <Stack mt={3} width={"fit-content"} flexDirection={"row"}>
            <Button variant="contained" onClick={VerifyOTPAgain}>
              Verify User
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            // border: '4px solid #00AB55',
            borderRadius: 5,
            boxShadow: 24,
            padding: "40px 32px",
            height: "90vh",
            width: "80%",
          }}
        >
          {aepsData.length === 0 ? (
            <Typography variant="h2" mt={45} ml={33}>
              No data found...
            </Typography>
          ) : (
            <>
              <Scrollbar>
                <Table>
                  <TableHead>
                    <TableRow sx={{ position: "fixed" }}>
                      {tableLabels.map((column: any) => (
                        <TableCell key={column.id}>{column.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ overflowX: "scroll" }}>
                    {aepsData?.map((row: any) => (
                      <TableRow
                        key={row?._id}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        sx={{ borderBottom: "1px solid #dadada" }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {" "}
                              {`${row?.merchant?.firstName} ${row?.merchant?.lastName}`}{" "}
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {row?.merchant?.merchantPhoneNumber}
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {row?.merchant?.emailId}
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography>
                            <Typography variant="subtitle2">
                              {" "}
                              LoginId:{`${row?.merchant?.merchantLoginId}`}
                              <IconButton
                                onClick={() =>
                                  onCopy(`${row?.merchant?.merchantLoginId}`)
                                }
                              >
                                <Iconify icon="eva:copy-fill" width={20} />
                              </IconButton>
                            </Typography>
                            <Typography variant="subtitle2">
                              LoginPin: {`${row?.merchant?.merchantLoginPin}`}
                              <IconButton
                                onClick={() =>
                                  onCopy(`${row?.merchant?.merchantLoginPin}`)
                                }
                              >
                                <Iconify icon="eva:copy-fill" width={20} />
                              </IconButton>
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {" "}
                              {`${row?.merchant?.merchantAddress?.merchantCityName} ${row?.merchant?.merchantAddress?.merchantDistrictName} ${row?.merchant?.merchantAddress?.merchantPinCode}`}{" "}
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {row?.merchant?.kyc?.userPan}{" "}
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {row?.merchant?.kyc?.aadhaarNumber}{" "}
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {row?.merchant?.kyc?.companyOrShopPan}{" "}
                            </Typography>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            <Typography variant="subtitle2">
                              {" "}
                              {`${row?.lat} ${row?.long}`}{" "}
                            </Typography>
                          </Typography>
                          <IconButton
                            onClick={() =>
                              handleCopyClick(`${row?.lat} ${row?.long}`)
                            }
                          ></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
              <Stack>
                <Button
                  variant="contained"
                  onClick={() => setViewModalOpen(false)}
                >
                  Close
                </Button>
              </Stack>
              <Pagination
                sx={{ display: "flex", justifyContent: "center", mt: "2px" }}
                page={currentPages}
                onChange={handlePageChange1}
                color="primary"
                variant="outlined"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={openServices}
        onClose={handleCloseServices}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>
          <Box sx={style}>
            <Typography variant="h6"> Update Servcies </Typography>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(UpdateCategory)}
            >
              <>
                <Autocomplete
                  multiple
                  id="checkboxes-tags-demo"
                  options={cateListUpdated}
                  disableCloseOnSelect
                  getOptionLabel={(option: any) => option.category_name}
                  sx={{ my: 2 }}
                  onChange={(event, newValue) => {
                    setCheckBoxUpdatedS(newValue);
                  }}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} style={{ padding: 0 }}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.category_name}
                    </li>
                  )}
                  style={{ width: 500 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      size="small"
                      placeholder="Category"
                    />
                  )}
                />
              </>

              <Stack justifyContent={"end"} mt={3} width={"fit-content"}>
                <Stack flexDirection={"row"} gap={1}>
                  <LoadingButton variant="contained" type="submit">
                    Update Services
                  </LoadingButton>

                  <Button variant="contained" onClick={handleCloseServices}>
                    Close
                  </Button>
                </Stack>
              </Stack>
            </FormProvider>
          </Box>
        </>
      </Modal>
    </>
  );
}
