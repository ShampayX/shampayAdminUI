import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  DevicesOther as DeviceIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActivityLog {
  _id: string;
  userId?: string;
  userMail: string;
  userName: string;
  action: string;
  device: string;
  latitude: string;
  longitude: string;
  url: string;
  ip: string;
  isSuccess: boolean;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse UA string → readable browser + OS */
const parseDevice = (ua: string): { browser: string; os: string } => {
  const os = ua.includes("Mac OS X")
    ? "macOS"
    : ua.includes("Windows")
    ? "Windows"
    : ua.includes("Android")
    ? "Android"
    : ua.includes("iPhone") || ua.includes("iPad")
    ? "iOS"
    : ua.includes("Linux")
    ? "Linux"
    : ua.includes("Postman")
    ? "Postman"
    : "Unknown";

  const browser =
    ua.includes("Chrome") && !ua.includes("Edg")
      ? "Chrome"
      : ua.includes("Firefox")
      ? "Firefox"
      : ua.includes("Safari") && !ua.includes("Chrome")
      ? "Safari"
      : ua.includes("Edg")
      ? "Edge"
      : "Browser";

  return { browser, os };
};

/** Normalize raw IP strings from Express */
const formatIP = (ip?: string): { display: string; isLocal: boolean } => {
  if (!ip || ip === "undefined" || ip.trim() === "") {
    return { display: "—", isLocal: false };
  }
  // IPv6 loopback
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1" || ip === "::ffff:127.0.0.1") {
    return { display: "Localhost", isLocal: true };
  }
  // Strip IPv6-mapped IPv4 prefix e.g. "::ffff:192.168.1.1" → "192.168.1.1"
  if (ip.startsWith("::ffff:")) {
    return { display: ip.replace("::ffff:", ""), isLocal: false };
  }
  return { display: ip, isLocal: false };
};

const actionColor = (action: string) => {
  switch (action?.toUpperCase()) {
    case "LOGIN":
      return { color: "#1565c0", bg: "#e3f0ff", border: "#90caf9" };
    case "LOGOUT":
      return { color: "#6d4c41", bg: "#fbe9e7", border: "#ffccbc" };
    default:
      return { color: "#555", bg: "#f5f5f5", border: "#e0e0e0" };
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ActivityLogTable() {
  const { Api } = useAuthContext();
  const token = localStorage.getItem("token");

  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await Api("admin/get_activities", "GET", null, token);
      if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (e) {
      console.error("Activity fetch error:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.userMail?.toLowerCase().includes(q) ||
      row.userName?.toLowerCase().includes(q) ||
      row.action?.toLowerCase().includes(q) ||
      row.ip?.toLowerCase().includes(q) ||
      row.errorMessage?.toLowerCase().includes(q) ||
      row.url?.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const successCount = data.filter((d) => d.isSuccess).length;
  const failCount = data.filter((d) => !d.isSuccess).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3, bgcolor: "#f7f8fa", minHeight: "100vh" }}>
      {/* ── Page header ───────────────────────────────────────────────── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Activity Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin › Activity Logs
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by email, IP, action…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "#aaa" }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 260 }}
          />
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchActivities}
              size="small"
              sx={{
                border: "1px solid #e0e0e0",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── Summary chips ─────────────────────────────────────────────── */}
      <Stack direction="row" spacing={1.5} mb={2.5}>
        <Chip
          label={`Total: ${data.length}`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: "#e8eaf6",
            color: "#3949ab",
            fontSize: 12,
          }}
        />
        <Chip
          icon={
            <CheckCircleIcon
              sx={{ fontSize: "14px !important", color: "#2e7d32 !important" }}
            />
          }
          label={`Success: ${successCount}`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: "#f0fdf4",
            color: "#2e7d32",
            fontSize: 12,
          }}
        />
        <Chip
          icon={
            <CancelIcon
              sx={{ fontSize: "14px !important", color: "#c62828 !important" }}
            />
          }
          label={`Failed: ${failCount}`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: "#fff5f5",
            color: "#c62828",
            fontSize: 12,
          }}
        />
      </Stack>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #f0f0f0" }}>
        <TableContainer component={Paper} elevation={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={32} sx={{ color: "#e53935" }} />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#fafafa" }}>
                  {[
                    "#",
                    "User",
                    "Action",
                    "Status",
                    "Device",
                    "IP Address",
                    "Location",
                    "URL",
                    "Time",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#555",
                        py: 1.5,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 6, color: "#bbb" }}
                    >
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((row, idx) => {
                    const { browser, os } = parseDevice(row.device);
                    const ac = actionColor(row.action);
                    const rowNum = page * rowsPerPage + idx + 1;

                    return (
                      <TableRow
                        key={row._id}
                        hover
                        sx={{
                          "&:last-child td": { border: 0 },
                          bgcolor: !row.isSuccess ? "#fff9f9" : "transparent",
                        }}
                      >
                        {/* # */}
                        <TableCell
                          sx={{ color: "#bbb", fontSize: 12, width: 40 }}
                        >
                          {rowNum}
                        </TableCell>

                        {/* User */}
                        <TableCell sx={{ minWidth: 180 }}>
                          <Typography
                            fontSize={13}
                            fontWeight={600}
                            color="#111"
                          >
                            {row.userName || "—"}
                          </Typography>
                          <Typography fontSize={12} color="#888">
                            {row.userMail}
                          </Typography>
                        </TableCell>

                        {/* Action */}
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.6,
                              bgcolor: ac.bg,
                              border: `1px solid ${ac.border}`,
                              borderRadius: "20px",
                              px: 1.2,
                              py: 0.3,
                            }}
                          >
                            {row.action?.toUpperCase() === "LOGIN" ? (
                              <LoginIcon
                                sx={{ fontSize: 12, color: ac.color }}
                              />
                            ) : (
                              <LogoutIcon
                                sx={{ fontSize: 12, color: ac.color }}
                              />
                            )}
                            <Typography
                              fontSize={11.5}
                              fontWeight={700}
                              color={ac.color}
                            >
                              {row.action}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {row.isSuccess ? (
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <CheckCircleIcon
                                sx={{ fontSize: 15, color: "#2e7d32" }}
                              />
                              <Typography
                                fontSize={12}
                                fontWeight={600}
                                color="#2e7d32"
                              >
                                Success
                              </Typography>
                            </Stack>
                          ) : (
                            <Box>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <CancelIcon
                                  sx={{ fontSize: 15, color: "#c62828" }}
                                />
                                <Typography
                                  fontSize={12}
                                  fontWeight={600}
                                  color="#c62828"
                                >
                                  Failed
                                </Typography>
                              </Stack>
                              {row.errorMessage && (
                                <Typography
                                  fontSize={11}
                                  color="#e57373"
                                  sx={{
                                    bgcolor: "#fff5f5",
                                    border: "1px solid #ffcdd2",
                                    borderRadius: "4px",
                                    px: 0.8,
                                    py: 0.2,
                                    mt: 0.4,
                                    display: "inline-block",
                                  }}
                                >
                                  {row.errorMessage}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </TableCell>

                        {/* Device */}
                        <TableCell sx={{ minWidth: 130 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.6}
                          >
                            <DeviceIcon sx={{ fontSize: 14, color: "#aaa" }} />
                            <Box>
                              <Typography
                                fontSize={12}
                                fontWeight={600}
                                color="#333"
                              >
                                {browser}
                              </Typography>
                              <Typography fontSize={11} color="#aaa">
                                {os}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* IP Address */}
                        <TableCell sx={{ minWidth: 110 }}>
                          {(() => {
                            const { display, isLocal } = formatIP(row.ip);
                            return isLocal ? (
                              <Chip
                                label={display}
                                size="small"
                                sx={{
                                  bgcolor: "#f1f5f9",
                                  color: "#94a3b8",
                                  fontFamily: "monospace",
                                  fontWeight: 600,
                                  fontSize: 11,
                                  border: "1px solid #e2e8f0",
                                  height: 22,
                                }}
                              />
                            ) : display === "—" ? (
                              <Typography fontSize={13} color="#cbd5e1">
                                —
                              </Typography>
                            ) : (
                              <Chip
                                label={display}
                                size="small"
                                sx={{
                                  bgcolor: "#f0f9ff",
                                  color: "#0369a1",
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  fontSize: 11,
                                  border: "1px solid #bae6fd",
                                  height: 22,
                                }}
                              />
                            );
                          })()}
                        </TableCell>

                        {/* Location */}
                        <TableCell sx={{ minWidth: 120 }}>
                          {row.latitude && row.longitude ? (
                            <Tooltip
                              title={`${parseFloat(row.latitude).toFixed(
                                5
                              )}, ${parseFloat(row.longitude).toFixed(5)}`}
                              arrow
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                onClick={() =>
                                  window.open(
                                    `https://www.google.com/maps?q=${row.latitude},${row.longitude}`,
                                    "_blank"
                                  )
                                }
                                sx={{
                                  cursor: "pointer",
                                  width: "fit-content",
                                  bgcolor: "#fff5f5",
                                  border: "1px solid #ffcdd2",
                                  borderRadius: "20px",
                                  px: 1.2,
                                  py: 0.4,
                                  transition: "all 0.15s ease",
                                  "&:hover": {
                                    bgcolor: "#ffebee",
                                    border: "1px solid #ef9a9a",
                                    boxShadow: "0 2px 8px rgba(229,57,53,0.18)",
                                  },
                                }}
                              >
                                <LocationIcon
                                  sx={{ fontSize: 13, color: "#e53935" }}
                                />
                                <Typography
                                  fontSize={11.5}
                                  fontWeight={600}
                                  color="#e53935"
                                >
                                  View on Map
                                </Typography>
                              </Stack>
                            </Tooltip>
                          ) : (
                            <Typography fontSize={12} color="#ccc">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* URL */}
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Tooltip title={row.url} arrow>
                            <Typography
                              fontSize={11.5}
                              color="#888"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 150,
                                bgcolor: "#f5f5f5",
                                borderRadius: "4px",
                                px: 0.8,
                                py: 0.3,
                                fontFamily: "monospace",
                              }}
                            >
                              {row.url}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* Time */}
                        <TableCell sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
                          <Typography fontSize={12} color="#555">
                            {fDateTime(row.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            borderTop: "1px solid #f0f0f0",
            "& .MuiTablePagination-toolbar": { fontSize: 12 },
          }}
        />
      </Card>
    </Box>
  );
}
