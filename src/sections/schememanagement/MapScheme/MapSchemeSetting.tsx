import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Modal,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AddLinkOutlinedIcon from "@mui/icons-material/AddLinkOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
} from "src/components/hook-form";
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
  DataTable,
  StatCard,
  StatGrid,
  ModalShell,
  FormGrid,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";
//
import MapSchemeRow, { SchemeMappingRow, roleLabel } from "./MapSchemeTable";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------
// Plans > Scheme Assignment (internally "map scheme").
//
// Endpoints, all unchanged:
//   scheme/mapScheme_list         POST  {pageInitData, userId, role}
//   scheme/get_schemeList         GET   scheme names
//   scheme/schemeFilter           POST  {schemeType, userId} -> pickable schemes
//   admin/getUserList_ViaRole     POST  accounts for a scheme type
//   admin/search_user             POST  account lookup for the filter bar
//   scheme/map_Scheme             POST  create / update an assignment
//   scheme/list/fetch?page=all    POST  full catalogue, used to resolve a
//                                       scheme code back to its _id
//
// The list filters by role + one account only; there is no free-text or status
// filter behind it, so none is offered.
// ----------------------------------------------------------------------

type FormValuesProps = {
  User: string;
  username: string;
  SchemeName: string;
  mapComment: string;
  userId: string;
  isUserValid: boolean;
  usersearchby: string;
  agent: string;
  distributor: string;
  m_distributor: string;
  API_User: string;
  searchBy: string;
  schemeDescription: string;
};

// Item 3d: roles are only `Admin` and `API_User` now, so the agent-network roles
// are gone from this filter. Historical users with those roles still exist in the
// data and still render wherever a row shows its own role - this list is what an
// operator can PICK, and picking one would filter to a population that can no
// longer be created.
const ROLE_OPTIONS = [{ value: "API_User", label: "API User" }];

export default function ProductSettingPage() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [sdata, setSdata] = useState<SchemeMappingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [userList, setUserList] = useState<any[]>([]);
  const [distributor, setDistributor] = useState<any[]>([]);
  const [schemeFilter, setSchemeFilter] = useState<any[]>([]);
  const [schemeName, setSchemeName] = useState<any[]>([]);
  const [schemeT, setschemeT] = useState("");
  const [schemes, setSchemes] = useState<any[]>([]);

  const [openPopUp, setModalEditPopUp] = useState(false);
  const openEditModalPopUp = () => setModalEditPopUp(true);
  const handleClosePopUp = () => setModalEditPopUp(false);

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    User: "",
    isUserValid: false,
    searchBy: "",
    usersearchby: "",
    agent: "",
    distributor: "",
    m_distributor: "",
    API_User: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    reset,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const term = getValues("User");
    if (term && term.length > 2) searchFromUser(term);
    else setUserList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("User")]);

  useEffect(() => {
    mapSchemeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchSchemeCatalogue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= API - unchanged contracts ================= */

  const searchFromUser = (val: string) => {
    let body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
      finalStatus: "approved",
    };

    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200 && Response.data.code == 200) {
        setUserList(Response.data.data || []);
      }
    });
  };

  const mapSchemeList = () => {
    setLoading(true);
    setError("");
    setSdata([]);

    const body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      userId:
        getValues("agent") ||
        getValues("distributor") ||
        getValues("m_distributor") ||
        getValues("API_User") ||
        "",
      role: getValues("searchBy") || "",
    };
    Api(`scheme/mapScheme_list`, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setSdata(Response.data.data || []);
          setTxnCount(Response.data.totalNumberOfRecords || 0);
        } else {
          setSdata([]);
          setError(
            Response?.data?.message || "Could not load scheme assignments."
          );
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setSdata([]);
        setError(err?.message || "Could not load scheme assignments.");
        setLoading(false);
      });
  };

  const getSchemeList = () => {
    Api(`scheme/get_schemeList`, "GET", token).then((Response: any) => {
      if (Response?.status == 200 && Response.data.code == 200) {
        setSchemeName(Response.data.data || []);
      }
    });
  };

  function setFilterScheme(data: any) {
    let body = {
      schemeType: data,
      userId: "",
    };
    Api("scheme/schemeFilter", "POST", body, token).then((Response: any) => {
      if (Response?.status == 200 && Response.data.code == 200) {
        setSchemeFilter(Response.data.data || []);
      }
    });
  }

  function getDistributor(val: any) {
    setschemeT(val);
    // Item 3d: `getUserList_ViaRole` no longer accepts `schemeType` - it took
    // `schemeType: 'directAgent'` and does not any more, so only `role` is sent.
    let body = {
      role:
        val == "directagent"
          ? "agent"
          : val == "neonetwork"
          ? "distributor"
          : "API_User",
    };
    Api("admin/getUserList_ViaRole", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          /* Item 3d: "direct agent" used to mean an agent with no referral
             code, but `referralCode` was removed from the user record - the
             old test is `undefined === ""` against the new payload, which is
             false for every row and emptied this dropdown. Role alone now. */
          if (val == "directagent") {
            setDistributor(
              (Response.data.data || []).filter(
                (item: any) => item.role === "agent"
              )
            );
          } else {
            setDistributor(Response.data.data || []);
          }
          getSchemeList();
          setFilterScheme(val);
        }
      }
    );
  }

  const mapScheme = (data: FormValuesProps) => {
    const body = {
      userId: data.username,
      schemeId: data.SchemeName,
      mapComment: data.mapComment,
      schemeType: schemeT,
      schemeDescription: data.schemeDescription,
    };

    Api(`scheme/map_Scheme`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setModalEditPopUp(false);
        reset(defaultValues);
        enqueueSnackbar(Response.data.message);
        mapSchemeList();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  /** Full catalogue, so a row can resolve its scheme code back to an `_id`. */
  const fetchSchemeCatalogue = async () => {
    try {
      const body = {
        startDate: "",
        endDate: "",
        searchBy: "",
        searchVal: "",
        schemeType: "",
      };
      const response = await Api(
        `scheme/list/fetch?page=all&limit=1000`,
        "POST",
        body,
        token
      );

      if (response?.status === 200 && response?.data?.code === 200) {
        setSchemes(response.data.data.schemes || []);
      }
    } catch (error) {
      console.error("Error loading scheme catalogue: ", error);
    }
  };

  const onClear = () => {
    reset(defaultValues);
    setUserList([]);
    setCurrentPage(1);
    setTimeout(mapSchemeList, 0);
  };

  /* ================= DERIVED (page-scoped) ================= */

  const roleCounts = useMemo(() => {
    const roles = new Set<string>();
    sdata.forEach((row) => row.role && roles.add(row.role));
    return Array.from(roles);
  }, [sdata]);

  const distinctSchemes = useMemo(() => {
    const codes = new Set<string>();
    sdata.forEach((row) => row.schemeId && codes.add(row.schemeId));
    return codes.size;
  }, [sdata]);

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Scheme Assignment | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Scheme Assignment"
          subtitle="Which commission scheme each account in the network is assigned to."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={mapSchemeList}
              >
                Refresh
              </PageGhostButton>
              <PageActionButton
                startIcon={<AddLinkOutlinedIcon />}
                onClick={openEditModalPopUp}
              >
                Assign Scheme
              </PageActionButton>
            </>
          }
        />

        <StatGrid columns={3}>
          <StatCard
            label="Assigned Accounts"
            value={txnCount}
            caption="Across all pages"
            icon={<AccountTreeOutlinedIcon />}
          />
          <StatCard
            label="Schemes In Use"
            value={distinctSchemes}
            caption="Distinct schemes on this page"
            tone="primary"
            icon={<WorkspacePremiumOutlinedIcon />}
          />
          <StatCard
            label="Account Types"
            value={roleCounts.length}
            caption={
              roleCounts.map(roleLabel).join(", ") || "None on this page"
            }
            tone="neutral"
            icon={<GroupsOutlinedIcon />}
          />
        </StatGrid>

        <FormProvider methods={methods} onSubmit={handleSubmit(mapSchemeList)}>
          <FilterBar>
            <FilterSlot icon={<BadgeOutlinedIcon />} minWidth={200}>
              <TextField
                select
                fullWidth
                variant="standard"
                value={watch("searchBy") || ""}
                onChange={(event) => {
                  setValue("searchBy", event.target.value);
                  setValue("User", "");
                  setUserList([]);
                }}
                InputProps={{ disableUnderline: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">All Account Types</MenuItem>
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            </FilterSlot>

            {Boolean(watch("searchBy")) && (
              <>
                <FilterSlot icon={<SearchIcon />} minWidth={180}>
                  <TextField
                    select
                    fullWidth
                    variant="standard"
                    value={watch("usersearchby") || ""}
                    onChange={(event) =>
                      setValue("usersearchby", event.target.value)
                    }
                    InputProps={{ disableUnderline: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="" disabled>
                      Search account by
                    </MenuItem>
                    <MenuItem value="userCode">User Code</MenuItem>
                    <MenuItem value="firstName">First Name</MenuItem>
                  </TextField>
                </FilterSlot>

                {Boolean(watch("usersearchby")) && (
                  <FilterSlot
                    icon={<PersonSearchOutlinedIcon />}
                    grow
                    minWidth={250}
                  >
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={userList}
                      filterOptions={(options) => options}
                      getOptionLabel={(option: any) =>
                        typeof option === "string"
                          ? option
                          : `${option.firstName || ""} ${
                              option.lastName || ""
                            }`.trim()
                      }
                      onInputChange={(_, value, reason) => {
                        if (reason === "input") {
                          setValue("User", value);
                          setValue("agent", "");
                          setValue("distributor", "");
                          setValue("m_distributor", "");
                          setValue("API_User", "");
                        }
                      }}
                      onChange={(_, item: any) => {
                        if (!item || typeof item === "string") return;
                        if (item.role == "agent") setValue("agent", item._id);
                        else if (item.role == "distributor")
                          setValue("distributor", item._id);
                        else if (item.role == "m_distributor")
                          setValue("m_distributor", item._id);
                        else setValue("API_User", item._id);

                        setValue(
                          "User",
                          `${item.firstName} ${item.lastName} (${item.userCode})`
                        );
                        setUserList([]);
                      }}
                      renderOption={(props, option: any) => (
                        <li {...props} key={option._id}>
                          <Box sx={{ py: 0.25 }}>
                            <Typography
                              sx={{ fontSize: 13.5, fontWeight: 600 }}
                            >
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
                          placeholder="Search account"
                          InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                          }}
                        />
                      )}
                    />
                  </FilterSlot>
                )}
              </>
            )}

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

        {loading ? (
          <LoadingState label="Loading scheme assignments..." height={300} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load assignments"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={mapSchemeList}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : sdata.length === 0 ? (
          <EmptyState
            icon={<AccountTreeOutlinedIcon />}
            title="No scheme assignments"
            description="Nothing matches this filter. Assign a scheme to an account to get started."
            action={
              <PageActionButton
                startIcon={<AddLinkOutlinedIcon />}
                onClick={openEditModalPopUp}
              >
                Assign Scheme
              </PageActionButton>
            }
          />
        ) : (
          <DataTable
            minWidth={1180}
            columns={[
              { id: "user", label: "Account" },
              { id: "role", label: "Account Type" },
              { id: "schemeId", label: "Scheme Code" },
              { id: "schemeDescription", label: "Description" },
              { id: "comment", label: "Comment" },
              { id: "created", label: "Created" },
              { id: "action", label: "Action", align: "center" },
            ]}
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
                rowsPerPageOptions={[25, 50, 100]}
              />
            }
          >
            {sdata.map((row) => (
              <MapSchemeRow
                key={row._id}
                row={row}
                schemes={schemes}
                onUpdated={mapSchemeList}
              />
            ))}
          </DataTable>
        )}

        {/* ── Assign a scheme ────────────────────────────────────────── */}
        <Modal open={openPopUp} onClose={handleClosePopUp}>
          <ModalShell
            title="Assign Scheme"
            subtitle="Pick the scheme type to load its accounts and eligible schemes."
            onClose={handleClosePopUp}
            width={720}
          >
            <FormProvider methods={methods} onSubmit={handleSubmit(mapScheme)}>
              <FormGrid columns={2}>
                <RHFSelect
                  fullWidth
                  name="schemetype"
                  label="Scheme Type"
                  size="small"
                  placeholder="Scheme Type"
                  value={schemeT}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  {/* Item 3d: the agent-network scheme types are retired - roles
                      are only Admin and API_User now. */}
                  <MenuItem
                    value="apiuser"
                    onClick={() => getDistributor("apiuser")}
                  >
                    API User
                  </MenuItem>
                </RHFSelect>

                <RHFAutocomplete
                  name="username"
                  freeSolo
                  options={distributor}
                  getOptionLabel={(option: any) =>
                    `${option.firstName} ${option.lastName} ${
                      option.userCode
                    }(${option.company_name || "NA"})`
                  }
                  onChange={(event: any, newValue: any) => {
                    setValue("username", newValue?._id);
                  }}
                  fullWidth
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      label="Account"
                      placeholder="Account"
                      size="small"
                    />
                  )}
                />

                <RHFAutocomplete
                  name="SchemeName"
                  options={schemeFilter}
                  getOptionLabel={(option: any) =>
                    `${option.schemeID} ${option.schemeDescription || ""}`
                  }
                  onChange={(event: any, newValue: any) => {
                    setValue("SchemeName", newValue?._id);
                  }}
                  fullWidth
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      label="Scheme"
                      placeholder="Scheme"
                      size="small"
                    />
                  )}
                />

                <RHFTextField
                  fullWidth
                  multiline
                  rows={1}
                  name="mapComment"
                  label="Comments"
                  size="small"
                />
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
                  onClick={handleClosePopUp}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton type="submit" variant="contained">
                  Assign Scheme
                </LoadingButton>
              </Box>
            </FormProvider>
          </ModalShell>
        </Modal>
      </Box>
    </>
  );
}
