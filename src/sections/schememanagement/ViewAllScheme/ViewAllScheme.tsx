import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Modal,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form";
// date pickers
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// routes
import { useNavigate } from "react-router-dom";
import { PATH_DASHBOARD } from "src/routes/paths";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "src/components/snackbar";
// utils
import { fDateFormatForApi } from "src/utils/formatTime";
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
  EmptyState,
  LoadingState,
} from "src/components/page-kit";
//
import SchemeRow, { SchemeRowProps, schemeTypeLabel } from "./ViewSchemeTable";

// ----------------------------------------------------------------------
// Plans > Scheme Catalog (internally "all scheme").
//
// `scheme/list/fetch?page=&limit=` POST takes startDate, endDate, searchBy
// ("id" | "description"), searchVal and schemeType, and returns
// {data: {schemes, total}} - so unlike the other Plans screens the filters
// here are real server-side filters, not page-scoped ones.
//
// The payload has no status field, so there is no active/inactive state and no
// enable/disable action. Creating a scheme hands off to the AddNewScheme page,
// which is where the rate configuration lives.
// ----------------------------------------------------------------------

type FormValuesProps = {
  startDate: Date | null;
  endDate: Date | null;
  searchBy: string;
  usersearchby: string;
  search: string;
};

const SCHEME_TYPES = [
  { value: "directagent", label: "Direct Agent" },
  { value: "neonetwork", label: "Distribution Network" },
  { value: "apiuser", label: "API User" },
];

export default function ViewAllScheme() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [sdata, setSdata] = useState<SchemeRowProps[]>([]);
  const [txnCount, setTxnCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  /* Create */
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [description, setDescription] = useState("");

  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    startDate: null,
    endDate: null,
    searchBy: "",
    usersearchby: "",
    search: "",
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
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    MapScheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  /* ================= API - unchanged contract ================= */

  const MapScheme = async () => {
    const token = localStorage.getItem("token");
    setIsFetching(true);
    setError("");
    try {
      const body = {
        startDate: fDateFormatForApi(getValues("startDate")),
        endDate: fDateFormatForApi(getValues("endDate")),
        searchBy: getValues("usersearchby"),
        searchVal: getValues("search"),
        schemeType: getValues("searchBy"),
      };
      Api(
        `scheme/list/fetch?page=${currentPage}&limit=${pageSize}`,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setSdata(Response.data.data.schemes || []);
          setTxnCount(Response.data.data.total || 0);
        } else {
          setSdata([]);
          setError(
            Response?.data?.data?.message || "Could not load the scheme catalog."
          );
          enqueueSnackbar(Response?.data?.data?.message, { variant: "error" });
        }
        setIsFetching(false);
      });
    } catch (err: any) {
      setSdata([]);
      setError(err?.message || "Could not load the scheme catalog.");
      setIsFetching(false);
    }
  };

  const onSearch = () => {
    setCurrentPage(1);
    MapScheme();
  };

  const handleReset = () => {
    reset(defaultValues);
    setCurrentPage(1);
    setTimeout(MapScheme, 0);
  };

  const createScheme = () => {
    setOpen(false);
    navigate(PATH_DASHBOARD.scheme.AddNewScheme, {
      state: {
        schemeFor: selectedValue,
        desc: description,
      },
    });
  };

  /* ================= DERIVED (page-scoped) ================= */

  const typesOnPage = useMemo(() => {
    const types = new Set<string>();
    sdata.forEach((row) => row.schemeType && types.add(row.schemeType));
    return Array.from(types);
  }, [sdata]);

  const newestOnPage = useMemo(() => {
    const newest = sdata.reduce<string>(
      (latest, row) => (row.createdOn > latest ? row.createdOn : latest),
      ""
    );
    return newest ? new Date(newest).toLocaleDateString("en-IN") : "-";
  }, [sdata]);

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Scheme Catalog | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Scheme Catalog"
          subtitle="Every commission scheme on the platform, ready to be assigned to accounts."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={MapScheme}
              >
                Refresh
              </PageGhostButton>
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
              >
                Create Scheme
              </PageActionButton>
            </>
          }
        />

        <StatGrid columns={3}>
          <StatCard
            label="Total Schemes"
            value={txnCount}
            caption="Matching the current filters"
            icon={<WorkspacePremiumOutlinedIcon />}
          />
          <StatCard
            label="Scheme Types"
            value={typesOnPage.length}
            caption={
              typesOnPage.map(schemeTypeLabel).join(", ") || "None on this page"
            }
            tone="neutral"
            icon={<CategoryOutlinedIcon />}
          />
          <StatCard
            label="Newest On Page"
            value={newestOnPage}
            caption={`${sdata.length} schemes shown`}
            tone="primary"
            icon={<UpdateOutlinedIcon />}
          />
        </StatGrid>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSearch)}>
          <FilterBar>
            <FilterSlot icon={<CategoryOutlinedIcon />} minWidth={210}>
              <TextField
                select
                fullWidth
                variant="standard"
                value={watch("searchBy") || ""}
                onChange={(event) => setValue("searchBy", event.target.value)}
                InputProps={{ disableUnderline: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">All Scheme Types</MenuItem>
                {SCHEME_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </FilterSlot>

            <FilterSlot icon={<ManageSearchOutlinedIcon />} minWidth={170}>
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
                <MenuItem value="">Search field</MenuItem>
                <MenuItem value="id">Scheme ID</MenuItem>
                <MenuItem value="description">Description</MenuItem>
              </TextField>
            </FilterSlot>

            {Boolean(watch("usersearchby")) && (
              <FilterSlot icon={<SearchIcon />} grow minWidth={220}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={
                    watch("usersearchby") === "id"
                      ? "Search by scheme ID"
                      : "Search by description"
                  }
                  value={watch("search") || ""}
                  onChange={(event) => setValue("search", event.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
              </FilterSlot>
            )}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FilterSlot icon={<CalendarMonthRoundedIcon />} minWidth={310}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <DatePicker
                    value={watch("startDate")}
                    inputFormat="DD/MM/YYYY"
                    maxDate={new Date()}
                    onChange={(newValue: any) =>
                      setValue("startDate", newValue)
                    }
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
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "text.disabled",
                    }}
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
                </Box>
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

            <PageGhostButton
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              Reset
            </PageGhostButton>
          </FilterBar>
        </FormProvider>

        {isFetching ? (
          <LoadingState label="Loading schemes..." height={300} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load the catalog"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={MapScheme}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : sdata.length === 0 ? (
          <EmptyState
            icon={<WorkspacePremiumOutlinedIcon />}
            title="No schemes found"
            description="Nothing matches these filters. Clear them, or create a new scheme."
            action={
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
              >
                Create Scheme
              </PageActionButton>
            }
          />
        ) : (
          <DataTable
            minWidth={980}
            columns={[
              { id: "Id", label: "Scheme ID" },
              { id: "Type", label: "Type" },
              { id: "schdis", label: "Description" },
              { id: "create", label: "Created" },
              { id: "action", label: "Actions", align: "center" },
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
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            }
          >
            {sdata.map((row) => (
              <SchemeRow key={row._id} row={row} onUpdated={MapScheme} />
            ))}
          </DataTable>
        )}

        {/* ── Create ─────────────────────────────────────────────────── */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalShell
            title="Create Scheme"
            subtitle="Pick the audience and describe the scheme; rates are set on the next screen."
            onClose={() => setOpen(false)}
            width={560}
            actions={
              <>
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  disabled={description.trim().length < 5 || !selectedValue}
                  onClick={createScheme}
                >
                  Continue
                </LoadingButton>
              </>
            }
          >
            <Box sx={{ display: "grid", gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="scheme-for-label">Scheme For</InputLabel>
                <Select
                  labelId="scheme-for-label"
                  label="Scheme For"
                  value={selectedValue}
                  onChange={(event) => setSelectedValue(event.target.value)}
                >
                  {SCHEME_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                name="dis"
                label="Scheme Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!selectedValue}
                helperText="At least 5 characters."
              />
            </Box>
          </ModalShell>
        </Modal>
      </Box>
    </>
  );
}
