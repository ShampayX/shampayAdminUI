import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Switch,
  MenuItem,
  TextField,
  TableCell,
  Typography,
  SwitchProps,
  TablePagination,
  styled,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import { useSnackbar } from "src/components/snackbar";
import ConfirmDialog from "src/components/confirm-dialog";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  SearchField,
  DataTable,
  KitRow,
  StatusPill,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
  useDataTable,
  exportToExcel,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Utilities > Categories.
//
// Presentation only. The page does exactly one thing, and still does:
//
//   read    GET  category/get_CategoryList   -> [{ _id, category_name, isEnabled }]
//   toggle  POST admin/category_switch       { categoryId, isEnabled }
//
// There is no create, edit, delete or reorder endpoint for categories, so this
// screen has no Add / Edit / Delete actions - the only supported action is the
// on/off switch, behind the same confirmation step it always had.
//
// Fields that do NOT exist on the payload, so are not shown: no description,
// no item count, no created/updated timestamps.
// ----------------------------------------------------------------------

const ALL = "__all__";

/** Track uses semantic success/error instead of the hardcoded #65C466 / #ff0000. */
const StatusSwitch = styled((props: SwitchProps) => (
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
      color: theme.palette.common.white,
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.success.main,
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.5 },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.success.light,
      border: `6px solid ${theme.palette.common.white}`,
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
    backgroundColor: theme.palette.common.white,
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: alpha(theme.palette.error.main, 0.55),
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

type Category = {
  _id: string;
  category_name: string;
  isEnabled: boolean;
};

export default function EnableDisCategories() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const GetAllCategories = useCallback(() => {
    setLoading(true);
    setFailed(false);

    const token = localStorage.getItem("token");

    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response?.status === 200 && Response.data.code === 200) {
        setCategories(Response.data.data || []);
      } else {
        setCategories([]);
        setFailed(true);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    GetAllCategories();
  }, [GetAllCategories]);

  /* Reflect a toggle locally so the row, the cards and the filter all agree
     without a second round trip. The API response is still what decides it. */
  const applyToggle = (id: string, value: boolean) =>
    setCategories((current) =>
      current.map((row) => (row._id === id ? { ...row, isEnabled: value } : row))
    );

  const filtered = useMemo(
    () =>
      categories.filter((row) => {
        if (statusFilter === ALL) return true;
        return statusFilter === "enabled" ? row.isEnabled : !row.isEnabled;
      }),
    [categories, statusFilter]
  );

  const table = useDataTable<Category>(filtered, {
    searchKeys: ["category_name"],
    storageKey: "enable-categories",
  });

  const totals = useMemo(() => {
    const enabled = categories.filter((row) => row.isEnabled).length;
    return {
      total: categories.length,
      enabled,
      disabled: categories.length - enabled,
    };
  }, [categories]);

  const exportCategories = () => {
    const ok = exportToExcel(
      table.results.map((row: any) => ({
        Category: row?.category_name || "",
        Status: row?.isEnabled ? "Enabled" : "Disabled",
      })),
      "service-categories",
      "Categories"
    );
    if (!ok) enqueueSnackbar("Nothing to export", { variant: "warning" });
  };

  return (
    <>
      <Helmet>
        <title>Categories | Shampay Admin</title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Categories"
          subtitle="Turn a service category on or off across the whole platform. Disabling one takes it away from every user immediately."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshIcon />}
                onClick={GetAllCategories}
              >
                Refresh
              </PageGhostButton>
              <PageActionButton
                tone="alt"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={exportCategories}
                disabled={table.isEmpty}
              >
                Export
              </PageActionButton>
            </>
          }
        />

        {loading ? (
          <LoadingState label="Loading categories..." height={320} />
        ) : failed ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load categories"
            description="The category list did not come back. Check the connection and try again."
            action={
              <PageGhostButton
                startIcon={<RefreshIcon />}
                onClick={GetAllCategories}
              >
                Retry
              </PageGhostButton>
            }
          />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={<CategoryOutlinedIcon />}
            title="No categories"
            description="The platform has no service categories configured yet."
          />
        ) : (
          <>
            <StatGrid columns={3}>
              <StatCard
                label="Total Categories"
                value={totals.total}
                caption="On the platform"
                icon={<CategoryOutlinedIcon />}
              />
              <StatCard
                label="Enabled"
                value={totals.enabled}
                caption="Live for every user"
                tone="success"
                icon={<ToggleOnOutlinedIcon />}
              />
              <StatCard
                label="Disabled"
                value={totals.disabled}
                caption="Switched off platform-wide"
                tone={totals.disabled > 0 ? "warning" : "neutral"}
                icon={<ToggleOffOutlinedIcon />}
              />
            </StatGrid>

            <FilterBar>
              <SearchField
                value={table.query}
                onChange={table.setQuery}
                placeholder="Search category"
                count={table.total}
                total={filtered.length}
              />

              <FilterSlot icon={<FilterAltOutlinedIcon />} minWidth={190}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                >
                  <MenuItem value={ALL}>All statuses</MenuItem>
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </TextField>
              </FilterSlot>
            </FilterBar>

            <DataTable
              minWidth={620}
              isEmpty={table.isEmpty}
              emptyMessage={
                table.isFiltered
                  ? `No category matches "${table.query}".`
                  : "No category matches this filter."
              }
              sortBy={table.sortBy}
              sortDir={table.sortDir}
              onSort={table.toggleSort}
              columns={[
                { id: "action", label: "Action" },
                { id: "category", label: "Category", sortKey: "category_name" },
                { id: "status", label: "Status", sortKey: "isEnabled" },
              ]}
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
              {table.paged.map((row) => (
                <CategoryRow key={row._id} row={row} onToggled={applyToggle} />
              ))}
            </DataTable>
          </>
        )}
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function CategoryRow({
  row,
  onToggled,
}: {
  row: Category;
  onToggled: (id: string, value: boolean) => void;
}) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const isEnabled = row.isEnabled;
  const next = !isEnabled;

  const handleClose = () => {
    if (isLoading) return;
    setOpen(false);
  };

  /* Same call, same body, same success condition as before. */
  const onSubmit = async () => {
    setIsLoading(true);

    const token = localStorage.getItem("token");
    const body = {
      categoryId: row._id,
      isEnabled: next,
    };

    await Api("admin/category_switch", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status === 200) {
          if (Response.data.code === 200) {
            enqueueSnackbar(Response.data.message);
            onToggled(row._id, next);
            setOpen(false);
          }
        } else {
          enqueueSnackbar("failed", { variant: "error" });
        }
      }
    );

    setIsLoading(false);
  };

  return (
    <KitRow>
      {/* Action first, matching the transaction report */}
      <TableCell>
        <StatusSwitch
          checked={isEnabled}
          onClick={() => setOpen(true)}
          inputProps={{
            "aria-label": `${isEnabled ? "Disable" : "Enable"} ${
              row.category_name
            }`,
          }}
        />
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
          {row.category_name}
        </Typography>
      </TableCell>

      <TableCell>
        <StatusPill status={isEnabled ? "Enabled" : "Disabled"} />
      </TableCell>

      <ConfirmDialog
        open={open}
        onClose={handleClose}
        title={`${next ? "Enable" : "Disable"} ${row.category_name}?`}
        content={
          next
            ? `"${row.category_name}" becomes available to every user on the platform.`
            : `"${row.category_name}" is withdrawn from every user on the platform straight away.`
        }
        action={
          <LoadingButton
            variant="contained"
            color={next ? "primary" : "error"}
            loading={isLoading}
            onClick={onSubmit}
          >
            {next ? "Enable" : "Disable"}
          </LoadingButton>
        }
      />
    </KitRow>
  );
}
