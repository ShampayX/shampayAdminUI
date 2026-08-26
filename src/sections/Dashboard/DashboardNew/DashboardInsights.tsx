import React, { useMemo } from "react";
import { Box, Card, Stack, Typography, Divider, LinearProgress } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CancelIcon from "@mui/icons-material/Cancel";
import CategoryIcon from "@mui/icons-material/Category";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= FORMATTERS ================= */

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (num: number) => `₹${amountFormatter.format(Number(num) || 0)}`;

const formatMoneyShort = (num: number) => {
  const value = Number(num) || 0;
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)}k`;
  return `₹${value}`;
};

/** "just updated" / "updated 4 min ago" - mirrors the footer line on each card. */
const relativeTime = (timestamp?: number | null) => {
  if (!timestamp) return "awaiting first sync";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just updated";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `updated ${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `updated ${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `updated ${days} day${days > 1 ? "s" : ""} ago`;
};

const CHART_GREEN = "#4CAF50";

/* ================= SHARED PIECES ================= */

function CardShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Card
      sx={{
        p: 3,
        height: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight ? "0 2px 14px rgba(15, 23, 42, 0.05)" : "none",
      }}
    >
      <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      <Typography
        component="div"
        sx={{ mt: 0.5, fontSize: 14, color: "text.secondary" }}
      >
        {subtitle}
      </Typography>

      <Box sx={{ flexGrow: 1, mt: 2.5 }}>{children}</Box>

      {footer && (
        <>
          <Divider sx={{ mt: 2.5 }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.75 }}>
            <AccessTimeIcon sx={{ fontSize: 17, color: "text.disabled" }} />
            <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
              {footer}
            </Typography>
          </Stack>
        </>
      )}
    </Card>
  );
}

function ChartTooltip({ active, payload, label, money }: any) {
  const theme = useTheme();

  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        backgroundColor: theme.palette.grey[900],
        color: theme.palette.common.white,
      }}
    >
      <Typography sx={{ fontSize: 11, opacity: 0.7 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
        {money ? formatMoney(payload[0].value) : `${payload[0].value} transactions`}
      </Typography>
    </Box>
  );
}

function EmptyPlot({ message }: { message: string }) {
  return (
    <Box
      sx={{
        height: 190,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>{message}</Typography>
    </Box>
  );
}

/* ================= INSIGHTS ================= */

type DashboardInsightsProps = {
  /** Raw `data` object from `dashboard/getTransaction`. */
  data: any;
  /** Category rows already extracted by the dashboard page. */
  categoryData: any[];
  /** Reads inside the subtitles, e.g. "today", "this month". */
  periodLabel?: string;
  /** Epoch ms of the last successful fetch - drives the card footers. */
  updatedAt?: number | null;
};

const DashboardInsights: React.FC<DashboardInsightsProps> = ({
  data,
  categoryData,
  periodLabel = "today",
  updatedAt,
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const axisTick = { fontSize: 12, fill: theme.palette.text.secondary };
  const gridStroke = isLight ? "#eef1f6" : alpha(theme.palette.common.white, 0.08);

  const rows = useMemo(
    () =>
      (categoryData || []).map((item: any) => ({
        name: item.categoryName || "-",
        count: Number(item.totalCount) || 0,
        amount: Number(item.totalAmount) || 0,
        avgTicket: Number(item.totalCount)
          ? Number(item.totalAmount) / Number(item.totalCount)
          : 0,
      })),
    [categoryData]
  );

  const totals = useMemo(() => {
    const statusObj = data?.status || {};

    const bucket = (keys: string[]) =>
      keys.reduce(
        (acc, key) => ({
          count: acc.count + (Number(statusObj?.[key]?.totalCount) || 0),
          amount: acc.amount + (Number(statusObj?.[key]?.totalAmount) || 0),
        }),
        { count: 0, amount: 0 }
      );

    const success = bucket(["success", "Success"]);
    const accepted = bucket(["accepted", "Accepted", "initiated", "in_process", "queued"]);
    const pending = bucket(["pending", "hold"]);
    const failed = bucket(["failed", "Failed"]);

    const laneCount = success.count + accepted.count + pending.count + failed.count;
    const count = Number(data?.totalTransaction?.count) || laneCount;
    const amount =
      Number(data?.totalTransaction?.amount) ||
      success.amount + accepted.amount + pending.amount + failed.amount;

    return { success, accepted, pending, failed, count, amount };
  }, [data]);

  const share = (value: number) => (totals.count ? (value / totals.count) * 100 : 0);

  const timeline = [
    {
      key: "success",
      label: `${formatMoney(totals.success.amount)}, cleared to beneficiary`,
      caption: `${totals.success.count} transactions · ${Math.round(
        share(totals.success.count)
      )}% of volume`,
      color: theme.palette.success.main,
      icon: <CheckCircleIcon />,
    },
    {
      key: "accepted",
      label: `${formatMoney(totals.accepted.amount)}, accepted by network`,
      caption: `${totals.accepted.count} transactions · ${Math.round(
        share(totals.accepted.count)
      )}% of volume`,
      color: theme.palette.info.main,
      icon: <HourglassTopIcon />,
    },
    {
      key: "pending",
      label: `${formatMoney(totals.pending.amount)}, waiting on settlement`,
      caption: `${totals.pending.count} transactions · ${Math.round(
        share(totals.pending.count)
      )}% of volume`,
      color: theme.palette.warning.main,
      icon: <ScheduleIcon />,
    },
    {
      key: "failed",
      label: `${formatMoney(totals.failed.amount)}, returned without moving`,
      caption: `${totals.failed.count} transactions · ${Math.round(
        share(totals.failed.count)
      )}% of volume`,
      color: theme.palette.error.main,
      icon: <CancelIcon />,
    },
  ];

  const footer = relativeTime(updatedAt);
  const successShare = Math.round(share(totals.success.count));

  return (
    <>
      {/* ---------------- CHART ROW ---------------- */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
        }}
      >
        <CardShell
          title="Category Volume"
          subtitle={`Transaction count per category ${periodLabel}.`}
          footer={footer}
        >
          {rows.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={rows} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={38} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: alpha(theme.palette.grey[500], 0.08) }}
                />
                <Bar
                  dataKey="count"
                  fill={CHART_GREEN}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={34}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyPlot message="No category activity in this period." />
          )}
        </CardShell>

        <CardShell
          title="Value Flow"
          subtitle={
            <>
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                ({successShare}%)
              </Box>{" "}
              of value cleared {periodLabel}.
            </>
          }
          footer={footer}
        >
          {rows.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={rows} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={formatMoneyShort}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                />
                <Tooltip content={<ChartTooltip money />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={CHART_GREEN}
                  strokeWidth={2}
                  dot={{ fill: CHART_GREEN, r: 4, strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: CHART_GREEN,
                    stroke: theme.palette.background.paper,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyPlot message="No value moved in this period." />
          )}
        </CardShell>

        <CardShell
          title="Average Ticket"
          subtitle={`Ticket size across categories ${periodLabel}.`}
          footer={footer}
        >
          {rows.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={rows} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={formatMoneyShort}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                />
                <Tooltip content={<ChartTooltip money />} />
                <Line
                  type="monotone"
                  dataKey="avgTicket"
                  stroke={CHART_GREEN}
                  strokeWidth={2}
                  dot={{ fill: CHART_GREEN, r: 4, strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: CHART_GREEN,
                    stroke: theme.palette.background.paper,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyPlot message="No tickets to average yet." />
          )}
        </CardShell>
      </Box>

      {/* ---------------- TABLE + TIMELINE ---------------- */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.9fr 1fr" },
          gap: 3,
        }}
      >
        {/* Category performance table */}
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isLight ? "0 2px 14px rgba(15, 23, 42, 0.05)" : "none",
          }}
        >
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
            Category Performance
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, color: "text.secondary" }}>
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              {rows.length} active
            </Box>{" "}
            {periodLabel}
          </Typography>

          <Box sx={{ mt: 3, overflowX: "auto" }}>
            <Box sx={{ minWidth: 560 }}>
              {/* header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1.3fr 1.4fr",
                  gap: 2,
                  pb: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                {["Category", "Transactions", "Value", "Share"].map((head) => (
                  <Typography
                    key={head}
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    {head}
                  </Typography>
                ))}
              </Box>

              {/* rows */}
              {rows.length ? (
                rows.map((row) => {
                  const rowShare = totals.amount
                    ? (row.amount / totals.amount) * 100
                    : 0;

                  return (
                    <Box
                      key={row.name}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1.3fr 1.4fr",
                        gap: 2,
                        alignItems: "center",
                        py: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            "& svg": { fontSize: 17 },
                          }}
                        >
                          <CategoryIcon />
                        </Box>
                        <Typography
                          noWrap
                          sx={{ fontSize: 14.5, fontWeight: 600, color: "text.primary" }}
                        >
                          {row.name}
                        </Typography>
                      </Stack>

                      <Typography sx={{ fontSize: 14.5, color: "text.primary" }}>
                        {row.count}
                      </Typography>

                      <Typography sx={{ fontSize: 14.5, color: "text.primary" }}>
                        {formatMoney(row.amount)}
                      </Typography>

                      <Box>
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}
                        >
                          {Math.round(rowShare)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(rowShare, 100)}
                          sx={{
                            mt: 0.75,
                            height: 4,
                            borderRadius: 99,
                            backgroundColor: alpha(theme.palette.grey[500], 0.2),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 99,
                              backgroundColor: theme.palette.primary.main,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography sx={{ py: 4, fontSize: 13.5, color: "text.disabled" }}>
                  No category activity in this period.
                </Typography>
              )}
            </Box>
          </Box>
        </Card>

        {/* Status timeline */}
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isLight ? "0 2px 14px rgba(15, 23, 42, 0.05)" : "none",
          }}
        >
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
            Status Overview
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: "success.main" }} />
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {successShare}%
              </Box>{" "}
              success {periodLabel}
            </Typography>
          </Stack>

          <Stack sx={{ mt: 3 }}>
            {timeline.map((entry, index) => (
              <Stack key={entry.key} direction="row" spacing={2}>
                {/* rail */}
                <Stack alignItems="center" sx={{ width: 26, flexShrink: 0 }}>
                  <Box sx={{ color: entry.color, "& svg": { fontSize: 20 } }}>
                    {entry.icon}
                  </Box>
                  {index < timeline.length - 1 && (
                    <Box
                      sx={{
                        flexGrow: 1,
                        width: "2px",
                        my: 0.75,
                        backgroundColor: theme.palette.divider,
                      }}
                    />
                  )}
                </Stack>

                <Box sx={{ pb: index < timeline.length - 1 ? 3 : 0 }}>
                  <Typography
                    sx={{ fontSize: 14.5, fontWeight: 600, color: "text.primary" }}
                  >
                    {entry.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    {entry.caption}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Box>
    </>
  );
};

export default DashboardInsights;
