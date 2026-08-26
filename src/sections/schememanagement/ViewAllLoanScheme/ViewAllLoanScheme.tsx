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
import AddIcon from "@mui/icons-material/Add";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
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
  EmptyState,
  LoadingState,
  useDataTable,
} from "src/components/page-kit";
//
import LoanSchemeRow, { LoanSchemeRowProps } from "./ViewLoanSchemeTable";

// ----------------------------------------------------------------------
// Plans > Loan Plan Catalog (internally "loan scheme").
//
// Endpoints, all unchanged:
//   admin/loan/get_loan_scheme   POST  {pageInitData}  -> {data, count}
//   admin/loan/add_loan_scheme   POST  {schemeDescription}
//   scheme/edit_scheme/:id       POST  {schemeDescription}
//
// The payload has no status, interest rate or tenure, so the catalog shows
// none of those. Description is the only editable field the API accepts.
// The endpoint pages server-side and takes no search param, so the search box
// narrows the current page and says so.
// ----------------------------------------------------------------------

export default function ViewAllLoanScheme() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [allScheme, setAllScheme] = useState<LoanSchemeRowProps[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [typeFilter, setTypeFilter] = useState("");

  /* Create */
  const [createOpen, setCreateOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  /* Edit description */
  const [editRow, setEditRow] = useState<LoanSchemeRowProps | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSchemeList(pageSize, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  /* ================= API - unchanged contracts ================= */

  const getSchemeList = (pageSize: number, currentPage: number) => {
    setIsLoadingList(true);
    setError("");

    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`admin/loan/get_loan_scheme`, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setAllScheme(Response.data.data || []);
          setTxnCount(Response.data.count || 0);
        } else {
          setAllScheme([]);
          setError(
            Response?.data?.message || "Could not load the loan plan catalog."
          );
        }
        setIsLoadingList(false);
      })
      .catch((err: any) => {
        setAllScheme([]);
        setError(err?.message || "Could not load the loan plan catalog.");
        setIsLoadingList(false);
      });
  };

  const createScheme = () => {
    setCreating(true);
    let token = localStorage.getItem("token");
    let body = {
      schemeDescription: description,
    };
    Api(`admin/loan/add_loan_scheme`, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          enqueueSnackbar("Loan plan created");
          closeCreate();
          getSchemeList(pageSize, currentPage);
        } else {
          enqueueSnackbar(
            Response?.data?.message || "Could not create the loan plan",
            { variant: "error" }
          );
        }
        setCreating(false);
      })
      .catch(() => {
        enqueueSnackbar("Could not create the loan plan", { variant: "error" });
        setCreating(false);
      });
  };

  const saveDescription = () => {
    if (!editRow) return;

    /* Blank means "leave it alone", matching the previous behaviour. */
    if (!editDescription.trim()) {
      setEditRow(null);
      return;
    }

    setSaving(true);
    const body = { schemeDescription: editDescription };
    let token = localStorage.getItem("token");

    Api(`scheme/edit_scheme/` + editRow._id, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          enqueueSnackbar("Description update Successfull !");
          setAllScheme((prev) =>
            prev.map((item) =>
              item._id === editRow._id
                ? { ...item, schemeDescription: editDescription }
                : item
            )
          );
          setEditRow(null);
        } else {
          enqueueSnackbar(
            Response?.data?.message || "Could not update the description",
            { variant: "error" }
          );
        }
        setSaving(false);
      })
      .catch(() => {
        enqueueSnackbar("Could not update the description", {
          variant: "error",
        });
        setSaving(false);
      });
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setDescription("");
  };

  const openEdit = (row: LoanSchemeRowProps) => {
    setEditRow(row);
    setEditDescription(row.schemeDescription || "");
  };

  /* ================= DERIVED (page-scoped) ================= */

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    allScheme.forEach((row) => row.schemeType && types.add(row.schemeType));
    return Array.from(types).sort();
  }, [allScheme]);

  const scopedRows = useMemo(
    () =>
      typeFilter
        ? allScheme.filter((row) => row.schemeType === typeFilter)
        : allScheme,
    [allScheme, typeFilter]
  );

  const table = useDataTable<LoanSchemeRowProps>(scopedRows, {
    rowsPerPage: pageSize,
    searchKeys: ["schemeId", "schemeType", "schemeDescription"],
  });

  const latestUpdate = useMemo(() => {
    const newest = allScheme.reduce<string>(
      (latest, row) => (row.createdAt > latest ? row.createdAt : latest),
      ""
    );
    return newest ? new Date(newest).toLocaleDateString("en-IN") : "-";
  }, [allScheme]);

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Loan Plan Catalog | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Loan Plan Catalog"
          subtitle="Loan plans available on the platform, ready to be mapped to accounts."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => getSchemeList(pageSize, currentPage)}
              >
                Refresh
              </PageGhostButton>
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Create Loan Plan
              </PageActionButton>
            </>
          }
        />

        <StatGrid columns={3}>
          <StatCard
            label="Total Loan Plans"
            value={txnCount}
            caption="Across all pages"
            icon={<AccountBalanceOutlinedIcon />}
          />
          <StatCard
            label="Plan Types"
            value={typeOptions.length}
            caption={typeOptions.join(", ") || "None on this page"}
            tone="neutral"
            icon={<CategoryOutlinedIcon />}
          />
          <StatCard
            label="Newest On Page"
            value={latestUpdate}
            caption={`${allScheme.length} plans shown`}
            tone="primary"
            icon={<UpdateOutlinedIcon />}
          />
        </StatGrid>

        <FilterBar>
          <SearchField
            value={table.query}
            onChange={table.setQuery}
            placeholder="Search this page by plan ID, type or description"
            count={table.total}
            total={table.grandTotal}
          />

          {typeOptions.length > 0 && (
            <FilterSlot icon={<CategoryOutlinedIcon />} minWidth={200}>
              <TextField
                select
                fullWidth
                variant="standard"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                InputProps={{ disableUnderline: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">All Plan Types</MenuItem>
                {typeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </FilterSlot>
          )}
        </FilterBar>

        {isLoadingList ? (
          <LoadingState label="Loading loan plans..." height={300} />
        ) : error ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load the catalog"
            description={error}
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => getSchemeList(pageSize, currentPage)}
              >
                Try again
              </PageGhostButton>
            }
          />
        ) : allScheme.length === 0 ? (
          <EmptyState
            icon={<AccountBalanceOutlinedIcon />}
            title="No loan plans yet"
            description="Create the first loan plan to start mapping it to accounts."
            action={
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Create Loan Plan
              </PageActionButton>
            }
          />
        ) : (
          <DataTable
            minWidth={900}
            columns={[
              { id: "schemeId", label: "Loan Plan" },
              { id: "schType", label: "Plan Type" },
              { id: "schdis", label: "Description" },
              { id: "create", label: "Created" },
              { id: "action", label: "Action", align: "center" },
            ]}
            isEmpty={table.isEmpty}
            emptyMessage="No plans on this page match the search or type filter."
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
              <LoanSchemeRow key={row._id} row={row} onEdit={openEdit} />
            ))}
          </DataTable>
        )}

        {/* ── Create ─────────────────────────────────────────────────── */}
        <Modal open={createOpen} onClose={closeCreate}>
          <ModalShell
            title="Create Loan Plan"
            subtitle="A description is all the API needs; plan configuration happens after."
            onClose={closeCreate}
            width={560}
            actions={
              <>
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  onClick={closeCreate}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  loading={creating}
                  disabled={description.trim().length < 5}
                  onClick={createScheme}
                >
                  Create
                </LoadingButton>
              </>
            }
          >
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              name="dis"
              label="Plan Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="At least 5 characters."
            />
          </ModalShell>
        </Modal>

        {/* ── Edit description ───────────────────────────────────────── */}
        <Modal open={Boolean(editRow)} onClose={() => setEditRow(null)}>
          <ModalShell
            title="Edit Loan Plan"
            subtitle={editRow ? `Plan ${editRow.schemeId}` : undefined}
            onClose={() => setEditRow(null)}
            width={560}
            actions={
              <>
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  onClick={() => setEditRow(null)}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  loading={saving}
                  onClick={saveDescription}
                >
                  Save
                </LoadingButton>
              </>
            }
          >
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              name="dis"
              label="Plan Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              helperText="Description is the only field this endpoint updates."
            />
          </ModalShell>
        </Modal>
      </Box>
    </>
  );
}
