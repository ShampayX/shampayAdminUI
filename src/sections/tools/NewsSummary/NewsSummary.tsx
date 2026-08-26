import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
// @mui
import {
  Box,
  Chip,
  Modal,
  Stack,
  MenuItem,
  TableCell,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import { LoadingButton } from "@mui/lab";
// routes
import { PATH_DASHBOARD } from "src/routes/paths";
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
  StackedCell,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
  ModalShell,
  useDataTable,
  exportToExcel,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Utilities > News Summary.
//
// Presentation only. Same two endpoints, same bodies:
//
//   read    GET  admin/getAllNewsFlashes   -> NewsItem[] (a bare array on
//                                             `data`, newest last - the list
//                                             is reversed for display, as before)
//   toggle  POST admin/setNewsFlash/:id    { isActive: !current }
//
// Editing still hands off to the News Flash screen via router state, exactly
// as the Update button always did - there is no inline edit here.
//
// Fields shown are the ones the payload carries: title, content, type,
// createdBy, startTime, endTime, isActive. There is no source, no priority and
// no view count, so none of those appear.
//
// Two things the old version was missing rather than choosing not to have:
//   - the table paged its rows through useDataTable but rendered no pagination
//     control, so anything past the first 25 flashes was unreachable.
//   - `getNews` fed the response straight into state with no guard, so a
//     failed call threw instead of showing an error.
// Both are fixed here; neither changes a request.
//
// The dead `formData` / `editId` / `handleUpdate` block was removed. Nothing
// called `handleUpdate` - the Update button navigates away - so its
// `admin/updateNewsFlash/:id` call was unreachable. That endpoint is still used
// by the News Flash screen the button navigates to.
// ----------------------------------------------------------------------

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  type: string;
  createdBy: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const ALL = "__all__";

const fmt = (value?: string) =>
  value ? new Date(value).toLocaleString() : "-";

/** Colour per flash type, from the theme - alert reads as error, warning amber. */
const typeTone = (type?: string): "error" | "warning" | "info" => {
  const key = String(type || "").toLowerCase();
  if (key === "alert") return "error";
  if (key === "warning") return "warning";
  return "info";
};

const NewsSummary = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [typeFilter, setTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const [viewing, setViewing] = useState<NewsItem | null>(null);
  const [confirming, setConfirming] = useState<NewsItem | null>(null);
  const [toggling, setToggling] = useState(false);

  const getNews = useCallback(() => {
    setLoading(true);
    setFailed(false);

    const token = localStorage.getItem("token");

    Api("admin/getAllNewsFlashes", "GET", "", token)
      .then((response: any) => {
        const data = response?.data;

        if (Array.isArray(data)) {
          setNewsList([...data].reverse());
        } else {
          setNewsList([]);
          setFailed(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNewsList([]);
        setFailed(true);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getNews();
  }, [getNews]);

  /* Same call and body as before; only the confirmation step around it is new. */
  const toggleStatus = async (item: NewsItem) => {
    setToggling(true);
    const token = localStorage.getItem("token");

    try {
      const res = await Api(
        `admin/setNewsFlash/${item._id}`,
        "POST",
        { isActive: !item.isActive },
        token
      );

      if (res?.status === 200) {
        enqueueSnackbar("News flash status updated successfully.", {
          variant: "success",
        });
        setConfirming(null);
        getNews();
      } else {
        enqueueSnackbar(res?.data?.message || "Failed to update status", {
          variant: "warning",
        });
      }
    } catch (err) {
      enqueueSnackbar("Something went wrong while updating status.", {
        variant: "error",
      });
    }

    setToggling(false);
  };

  /* Types come from the data, so a new type the backend starts returning shows
     up in the filter without a code change. */
  const types = useMemo(() => {
    const seen = new Set<string>();
    newsList.forEach((item) => item.type && seen.add(item.type));
    return Array.from(seen);
  }, [newsList]);

  const filtered = useMemo(
    () =>
      newsList.filter((item) => {
        if (typeFilter !== ALL && item.type !== typeFilter) return false;
        if (statusFilter === "active" && !item.isActive) return false;
        if (statusFilter === "inactive" && item.isActive) return false;
        return true;
      }),
    [newsList, typeFilter, statusFilter]
  );

  const table = useDataTable<NewsItem>(filtered, {
    searchKeys: ["title", "content", "type", "createdBy"],
    storageKey: "news-summary",
  });

  const totals = useMemo(() => {
    const active = newsList.filter((item) => item.isActive).length;

    /* "Live now" = active AND inside its start/end window, which is what the
       partner actually sees. Both dates are already on the payload. */
    const now = Date.now();
    const live = newsList.filter((item) => {
      if (!item.isActive) return false;
      const start = item.startTime ? new Date(item.startTime).getTime() : null;
      const end = item.endTime ? new Date(item.endTime).getTime() : null;
      if (start && now < start) return false;
      if (end && now > end) return false;
      return true;
    }).length;

    return {
      total: newsList.length,
      active,
      inactive: newsList.length - active,
      live,
    };
  }, [newsList]);

  const exportNews = () => {
    const ok = exportToExcel(
      table.results.map((item: any) => ({
        Title: item?.title || "",
        Content: item?.content || "",
        Type: item?.type || "",
        "Created By": item?.createdBy || "",
        Start: item?.startTime ? new Date(item.startTime).toLocaleString() : "",
        End: item?.endTime ? new Date(item.endTime).toLocaleString() : "",
        Status: item?.isActive ? "Active" : "Inactive",
      })),
      "news-flashes",
      "News"
    );
    if (!ok) enqueueSnackbar("Nothing to export", { variant: "warning" });
  };

  return (
    <>
      <Helmet>
        <title> News Summary | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="News Summary"
          subtitle="Every news flash, its live window and whether partners can see it right now."
          actions={
            <>
              <PageGhostButton startIcon={<RefreshIcon />} onClick={getNews}>
                Refresh
              </PageGhostButton>
              <PageActionButton
                tone="alt"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={exportNews}
                disabled={table.isEmpty}
              >
                Export
              </PageActionButton>
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={() => navigate(PATH_DASHBOARD.tools.newsflash)}
              >
                New Flash
              </PageActionButton>
            </>
          }
        />

        {loading ? (
          <LoadingState label="Loading news flashes..." height={320} />
        ) : failed ? (
          <EmptyState
            icon={<ErrorOutlineOutlinedIcon />}
            title="Could not load news flashes"
            description="The news feed did not come back. Check the connection and try again."
            action={
              <PageGhostButton startIcon={<RefreshIcon />} onClick={getNews}>
                Retry
              </PageGhostButton>
            }
          />
        ) : newsList.length === 0 ? (
          <EmptyState
            icon={<CampaignOutlinedIcon />}
            title="No news flashes yet"
            description="Nothing has been published to partners. Create the first flash to get started."
            action={
              <PageActionButton
                startIcon={<AddIcon />}
                onClick={() => navigate(PATH_DASHBOARD.tools.newsflash)}
              >
                New Flash
              </PageActionButton>
            }
          />
        ) : (
          <>
            <StatGrid>
              <StatCard
                label="Total Flashes"
                value={totals.total}
                caption="Published to date"
                icon={<CampaignOutlinedIcon />}
              />
              <StatCard
                label="Live Now"
                value={totals.live}
                caption="Active and inside its window"
                tone="success"
                icon={<ToggleOnOutlinedIcon />}
              />
              <StatCard
                label="Active"
                value={totals.active}
                caption="Switched on"
                tone="primary"
                icon={<LabelOutlinedIcon />}
              />
              <StatCard
                label="Inactive"
                value={totals.inactive}
                caption="Switched off"
                tone="neutral"
                icon={<ToggleOffOutlinedIcon />}
              />
            </StatGrid>

            <FilterBar>
              <SearchField
                value={table.query}
                onChange={table.setQuery}
                placeholder="Search title, content, type or author"
                count={table.total}
                total={filtered.length}
              />

              <FilterSlot icon={<LabelOutlinedIcon />} minWidth={180}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                  SelectProps={{ sx: { textTransform: "capitalize" } }}
                >
                  <MenuItem value={ALL}>All types</MenuItem>
                  {types.map((type) => (
                    <MenuItem
                      key={type}
                      value={type}
                      sx={{ textTransform: "capitalize" }}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </FilterSlot>

              <FilterSlot icon={<FilterAltOutlinedIcon />} minWidth={180}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                >
                  <MenuItem value={ALL}>All statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </FilterSlot>
            </FilterBar>

            <DataTable
              minWidth={1120}
              isEmpty={table.isEmpty}
              emptyMessage={
                table.isFiltered
                  ? `No news flash matches "${table.query}".`
                  : "No news flash matches these filters."
              }
              sortBy={table.sortBy}
              sortDir={table.sortDir}
              onSort={table.toggleSort}
              columns={[
                { id: "action", label: "Action" },
                { id: "title", label: "Title", sortKey: "title" },
                { id: "type", label: "Type", sortKey: "type" },
                { id: "createdBy", label: "Created By", sortKey: "createdBy" },
                { id: "window", label: "Live Window", sortKey: "startTime" },
                { id: "status", label: "Status", sortKey: "isActive" },
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
              {table.paged.map((item) => (
                <KitRow key={item._id}>
                  {/* Action first, matching the transaction report */}
                  <TableCell>
                    <Stack direction="row" spacing={0.75}>
                      <PageGhostButton
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => setViewing(item)}
                      >
                        View
                      </PageGhostButton>
                      <PageGhostButton
                        startIcon={<EditOutlinedIcon />}
                        onClick={() =>
                          navigate(PATH_DASHBOARD.tools.newsflash, {
                            state: { item },
                          })
                        }
                      >
                        Edit
                      </PageGhostButton>
                      <PageGhostButton onClick={() => setConfirming(item)}>
                        {item.isActive ? "Deactivate" : "Activate"}
                      </PageGhostButton>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 360 }}>
                    <StackedCell
                      bold
                      primary={item.title}
                      secondary={item.content}
                    />
                  </TableCell>

                  <TableCell>
                    <TypeChip type={item.type} theme={theme} />
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 13.5 }}>
                      {item.createdBy || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <StackedCell
                      primary={fmt(item.startTime)}
                      secondary={`to ${fmt(item.endTime)}`}
                    />
                  </TableCell>

                  <TableCell>
                    <StatusPill status={item.isActive ? "Active" : "Inactive"} />
                  </TableCell>
                </KitRow>
              ))}
            </DataTable>
          </>
        )}
      </Box>

      {/* --- full flash, since the table truncates the content ------------ */}
      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)}>
        <Box>
          <ModalShell
            title={viewing?.title || "News flash"}
            subtitle={
              viewing
                ? [viewing.type, viewing.createdBy].filter(Boolean).join(" • ")
                : undefined
            }
            width={680}
            onClose={() => setViewing(null)}
          >
            {viewing && (
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TypeChip type={viewing.type} theme={theme} />
                  <StatusPill
                    status={viewing.isActive ? "Active" : "Inactive"}
                  />
                </Stack>

                <Box>
                  <FieldLabel>Content</FieldLabel>
                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 13.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {viewing.content || "-"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    rowGap: 2,
                    columnGap: 2,
                    gridTemplateColumns: {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(3, 1fr)",
                    },
                  }}
                >
                  <Detail label="Created by" value={viewing.createdBy} />
                  <Detail label="Starts" value={fmt(viewing.startTime)} />
                  <Detail label="Ends" value={fmt(viewing.endTime)} />
                </Box>
              </Stack>
            )}
          </ModalShell>
        </Box>
      </Modal>

      {/* --- activate / deactivate --------------------------------------- */}
      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => !toggling && setConfirming(null)}
        title={`${confirming?.isActive ? "Deactivate" : "Activate"} this flash?`}
        content={
          confirming?.isActive
            ? `"${confirming?.title}" stops showing to partners straight away.`
            : `"${confirming?.title}" starts showing to partners inside its live window.`
        }
        action={
          <LoadingButton
            variant="contained"
            color={confirming?.isActive ? "error" : "primary"}
            loading={toggling}
            onClick={() => confirming && toggleStatus(confirming)}
          >
            {confirming?.isActive ? "Deactivate" : "Activate"}
          </LoadingButton>
        }
      />
    </>
  );
};

export default NewsSummary;

// ----------------------------------------------------------------------

function TypeChip({ type, theme }: { type?: string; theme: any }) {
  if (!type) return <>-</>;

  const accent = theme.palette[typeTone(type)].main;

  return (
    <Chip
      size="small"
      label={type}
      sx={{
        height: 24,
        fontSize: 11.5,
        fontWeight: 700,
        textTransform: "capitalize",
        color: accent,
        backgroundColor: alpha(
          accent,
          theme.palette.mode === "light" ? 0.12 : 0.24
        ),
      }}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.7,
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      <Typography
        sx={{
          mt: 0.4,
          fontSize: 13.5,
          wordBreak: "break-word",
          color: value ? "text.primary" : "text.disabled",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}
