import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Modal,
  MenuItem,
  TextField,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AddLinkOutlinedIcon from "@mui/icons-material/AddLinkOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFSelect } from "src/components/hook-form";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  SearchField,
  DataTable,
  StatCard,
  StatGrid,
  ModalShell,
  FormGrid,
  EmptyState,
  LoadingState,
  useDataTable,
} from "src/components/page-kit";
//
import MapBBPSSchemeRow, {
  BbpsMappingRow,
  roleLabel,
} from "./MapBBPSSchemeTable";

// ----------------------------------------------------------------------
// Plans > Bill Payment Mapping (internally "map BBPS scheme").
//
// Endpoints, all unchanged:
//   bbpsManagement/bbpsScheme/mapped_user_scheme?page=&limit=&userId=  GET
//   bbpsManagement/bbpsScheme/schemes                                  GET
//   admin/getUserList_ViaRole                                          POST
//   bbpsManagement/bbpsScheme/map_scheme                               POST
//
// `map_scheme` only creates, so there is no edit or unmap action. The plan
// dropdown is filtered client-side by the selected audience, which is why
// picking the account type also loads the plans.
// ----------------------------------------------------------------------

type FormValuesProps = {
  schemeType: string;
  userName: string;
  schemeName: string;
  comment: string;
};

export default function MapBBPSScheme() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState(25);
  const [txnCount, setTxnCount] = useState(0);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };

  const [schemeList, setSchemeList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bBPSschemeData, setBBPSschemeData] = useState<BbpsMappingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const FilterSchema = Yup.object().shape({
    schemeType: Yup.string().required("Scheme Type is required filed"),
    userName: Yup.string().required("User Name is required filed"),
    schemeName: Yup.string().required("Scheme Name is required filed"),
    mapComment: Yup.string(),
  });

  const defaultValues = {
    schemeType: "",
    userName: "",
    schemeName: "",
    comment: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    mapSchemeList("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, currentPage]);

  /* ================= API - unchanged contracts ================= */

  const mapSchemeList = (val: string) => {
    setListLoading(true);
    setError("");

    let token = localStorage.getItem("token");
    Api(
      `bbpsManagement/bbpsScheme/mapped_user_scheme?page=${currentPage}&limit=${pageSize}&userId=${val}`,
      "GET",
      "",
      token
    )
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setBBPSschemeData(Response.data.data || []);
          setTxnCount(Response.data.count || 0);
        } else {
          setBBPSschemeData([]);
          setError(Response?.data?.message || "Could not load the mappings.");
        }
        setListLoading(false);
      })
      .catch((err: any) => {
        setBBPSschemeData([]);
        setError(err?.message || "Could not load the mappings.");
        setListLoading(false);
      });
  };

  const getDistributor = (val: any) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      role: val == "apiuser" ? "API_User" : null,
    };

    Api("admin/getUserList_ViaRole", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setUsers(Response.data.data || []);
            getSchemeList(val);
          } else {
            enqueueSnackbar(Response.data.data);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
          enqueueSnackbar("Failed to load schemes");
        }
      }
    );
  };

  const getSchemeList = (val: string) => {
    let token = localStorage.getItem("token");
    Api(`bbpsManagement/bbpsScheme/schemes`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSchemeList(
              (Response.data.data || []).filter(
                (item: any) => item.schemeType == val
              )
            );
          } else {
            enqueueSnackbar(Response.data.data);
          }
        } else {
          enqueueSnackbar("Failed to load schemes");
        }
      }
    );
  };

  const mapScheme = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    try {
      const body = {
        userId: data.userName, // _id
        bbpsSchemeId: data.schemeName, // _id
      };
      await Api(
        `bbpsManagement/bbpsScheme/map_scheme`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            handleClose();
            mapSchemeList("");
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar("Failed");
        }
      });
    } catch (err) {}
  };

  /* ================= DERIVED (page-scoped) ================= */

  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    bBPSschemeData.forEach((row) => row.role && roles.add(row.role));
    return Array.from(roles).sort();
  }, [bBPSschemeData]);

  const scopedRows = useMemo(
    () =>
      roleFilter
        ? bBPSschemeData.filter((row) => row.role === roleFilter)
        : bBPSschemeData,
    [bBPSschemeData, roleFilter]
  );

  const table = useDataTable<BbpsMappingRow>(scopedRows, {
    rowsPerPage: pageSize,
    searchKeys: [
      "firstName",
      "lastName",
      "userCode",
      "company_name",
      "bbpsScheme.schemeId",
      "bbpsScheme.schemeDescription",
    ],
  });

  const distinctPlans = useMemo(() => {
    const plans = new Set<string>();
    bBPSschemeData.forEach(
      (row) => row.bbpsScheme?.schemeId && plans.add(row.bbpsScheme.schemeId)
    );
    return plans.size;
  }, [bBPSschemeData]);

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Bill Payment Mapping | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Bill Payment Mapping"
          subtitle="Which bill payment plan each account is assigned to."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => mapSchemeList("")}
              >
                Refresh
              </PageGhostButton>
              <PageActionButton
                startIcon={<AddLinkOutlinedIcon />}
                onClick={handleOpen}
              >
                Map Plan
              </PageActionButton>
            </>
          }
        />

        <StatGrid columns={3}>
          <StatCard
            label="Mapped Accounts"
            value={txnCount}
            caption="Across all pages"
            icon={<AccountTreeOutlinedIcon />}
          />
          <StatCard
            label="Plans In Use"
            value={distinctPlans}
            caption="Distinct plans on this page"
            tone="primary"
            icon={<ReceiptLongOutlinedIcon />}
          />
          <StatCard
            label="Account Types"
            value={roleOptions.length}
            caption={
              roleOptions.map(roleLabel).join(", ") || "None on this page"
            }
            tone="neutral"
            icon={<GroupsOutlinedIcon />}
          />
        </StatGrid>

        <FilterBar>
          <SearchField
            value={table.query}
            onChange={table.setQuery}
            placeholder="Search this page by account, company or plan"
            count={table.total}
            total={table.grandTotal}
          />

          {roleOptions.length > 0 && (
            <FilterSlot icon={<BadgeOutlinedIcon />} minWidth={200}>
              <TextField
                select
                fullWidth
                variant="standard"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                InputProps={{ disableUnderline: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">All Account Types</MenuItem>
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabel(role)}
                  </MenuItem>
                ))}
              </TextField>
            </FilterSlot>
          )}
        </FilterBar>

        {listLoading ? (
          <LoadingState label="Loading bill payment mappings..." height={300} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load mappings"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => mapSchemeList("")}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : bBPSschemeData.length === 0 ? (
          <EmptyState
            icon={<AccountTreeOutlinedIcon />}
            title="No bill payment plans mapped"
            description="Map a bill payment plan to an account to get started."
            action={
              <PageActionButton
                startIcon={<AddLinkOutlinedIcon />}
                onClick={handleOpen}
              >
                Map Plan
              </PageActionButton>
            }
          />
        ) : (
          <DataTable
            minWidth={1080}
            columns={[
              { id: "user", label: "Account" },
              { id: "role", label: "Account Type" },
              { id: "plan", label: "Plan Code" },
              { id: "description", label: "Description" },
              { id: "planType", label: "Plan Audience" },
              { id: "created", label: "Plan Created" },
            ]}
            isEmpty={table.isEmpty}
            emptyMessage="No mappings on this page match the search or filter."
            footer={
              <TablePagination
                component="div"
                count={txnCount}
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
            {table.results.map((row) => (
              <MapBBPSSchemeRow key={row._id} row={row} />
            ))}
          </DataTable>
        )}

        {/* ── Map a plan ─────────────────────────────────────────────── */}
        <Modal open={open} onClose={handleClose}>
          <ModalShell
            title="Map Bill Payment Plan"
            subtitle="Pick the account type to load its accounts and matching plans."
            onClose={handleClose}
            width={620}
          >
            <FormProvider methods={methods} onSubmit={handleSubmit(mapScheme)}>
              <FormGrid columns={1}>
                <RHFSelect
                  name="schemeType"
                  label="Account Type"
                  placeholder="Account Type"
                  size="small"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem
                    value="API User"
                    onClick={() => getDistributor("apiuser")}
                  >
                    API User
                  </MenuItem>
                </RHFSelect>

                <RHFSelect
                  name="userName"
                  label="Account"
                  size="small"
                  placeholder="Account"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  {isLoading ? (
                    <MenuItem disabled sx={{ height: 38 }}>
                      Loading accounts...
                    </MenuItem>
                  ) : users.length ? (
                    users.map((item: any, index: any) => (
                      <MenuItem value={item._id} key={index}>
                        {`${item.firstName} ${item.lastName}`}
                        {item.userCode ? ` (${item.userCode})` : ""}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Select an account type first</MenuItem>
                  )}
                </RHFSelect>

                <RHFSelect
                  name="schemeName"
                  label="Bill Payment Plan"
                  size="small"
                  placeholder="Bill Payment Plan"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  {isLoading ? (
                    <MenuItem disabled sx={{ height: 38 }}>
                      Loading plans...
                    </MenuItem>
                  ) : schemeList.length ? (
                    schemeList.map((item: any, index: any) => (
                      <MenuItem key={index} value={item._id}>
                        {item.schemeId} - {item.schemeDescription}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No plans for this account type
                    </MenuItem>
                  )}
                </RHFSelect>
              </FormGrid>

              <Box
                sx={{
                  mt: 3,
                  pt: 2.5,
                  display: "flex",
                  gap: 1.5,
                  justifyContent: "flex-end",
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  onClick={handleClose}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  disabled={!isValid}
                  loading={isSubmitting}
                >
                  Map Plan
                </LoadingButton>
              </Box>
            </FormProvider>
          </ModalShell>
        </Modal>
      </Box>
    </>
  );
}
