import React, { useMemo, useState } from "react";
import { Box, Card, Stack, Typography, ButtonBase } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
// theme
import { brandPreset } from "src/components/settings/presets";

/* ================= FORMATTERS ================= */

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (num: number) => `₹${amountFormatter.format(Number(num) || 0)}`;

const formatPercent = (num: number) => `${Math.round(Number(num) || 0)}%`;

/* ================= LANE CONFIG ================= */
/**
 * Each lane rolls up one or more raw status keys returned by
 * `dashboard/getTransaction`. Adjust `apiKeys` here if the backend
 * renames or adds a status - nothing else needs to change.
 */
const LANES = [
  {
    key: "success",
    label: "Success",
    title: "Successful Lane",
    blurb: "Clean credits reaching beneficiary without operational noise.",
    color: "#22c55e",
    apiKeys: ["success", "Success"],
  },
  {
    key: "accepted",
    label: "Accepted",
    title: "Accepted Lane",
    blurb: "Handed to the network and awaiting a final settlement signal.",
    color: brandPreset.main,
    apiKeys: ["accepted", "Accepted", "initiated", "in_process", "queued"],
  },
  {
    key: "pending",
    label: "Pending",
    title: "Pending Lane",
    blurb: "Value is parked mid-flight and still needs an operational nudge.",
    color: "#f59e0b",
    apiKeys: ["pending", "hold"],
  },
  {
    key: "failed",
    label: "Failed",
    title: "Failed Lane",
    blurb: "Declined attempts that returned without moving any value.",
    color: "#ef4444",
    apiKeys: ["failed", "Failed"],
  },
];

/* Weight of each lane when scoring engine health. */
const LANE_HEALTH_WEIGHT: Record<string, number> = {
  success: 1,
  accepted: 0.8,
  pending: 0.45,
  failed: 0,
};

/* Brand accent used by the "x% of <period>" chip on the focused lane. */
const SHARE_CHIP_COLOR = brandPreset.dark;

const HEALTH_BANDS = [
  { min: 90, mode: "Prime Mode", caption: "Excellent Stability", color: "#22c55e" },
  { min: 75, mode: "Steady Mode", caption: "Strong Stability", color: brandPreset.main },
  { min: 50, mode: "Watch Mode", caption: "Moderate Strain", color: "#f59e0b" },
  { min: 1, mode: "Critical Mode", caption: "Needs Attention", color: "#ef4444" },
  { min: 0, mode: "Idle Mode", caption: "Awaiting Traffic", color: "#94a3b8" },
];

/* ================= HEALTH RING ================= */

function HealthRing({
  value,
  color,
  track,
}: {
  value: number;
  color: string;
  track: string;
}) {
  const size = 176;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="butt"
          style={{ transition: "stroke-dasharray 0.9s ease" }}
        />
      </svg>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{ fontSize: 44, fontWeight: 700, lineHeight: 1, color: "text.primary" }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Engine Health
        </Typography>
      </Box>
    </Box>
  );
}

/* ================= STAT TILE ================= */

function StatTile({
  label,
  value,
  caption,
  surface,
  border,
}: {
  label: string;
  value: string;
  caption?: string;
  surface: string;
  border: string;
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        backgroundColor: surface,
        border: `1px solid ${border}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "text.secondary",
          mb: 1.25,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color: "text.primary" }}>
        {value}
      </Typography>
      {caption && (
        <Typography sx={{ mt: 1, fontSize: 12.5, color: "text.secondary" }}>{caption}</Typography>
      )}
    </Box>
  );
}

/* ================= FLIGHT DECK ================= */

type TransactionFlightDeckProps = {
  /** Raw `data` object from `dashboard/getTransaction`. */
  data: any;
  /** Reads inside labels, e.g. "today", "this month". */
  periodLabel?: string;
};

const TransactionFlightDeck: React.FC<TransactionFlightDeckProps> = ({
  data,
  periodLabel = "today",
}) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const surface = isLight ? "#ffffff" : theme.palette.background.paper;
  const softSurface = isLight ? "#fbfcfe" : alpha(theme.palette.common.white, 0.04);
  const border = isLight ? "#e8edf5" : alpha(theme.palette.common.white, 0.12);
  const ringTrack = isLight ? "#eef2f7" : alpha(theme.palette.common.white, 0.1);

  const [activeLane, setActiveLane] = useState("success");

  const { lanes, totalCount, totalAmount, health, band } = useMemo(() => {
    const statusObj = data?.status || {};

    const computed = LANES.map((lane) => {
      const count = lane.apiKeys.reduce(
        (sum, key) => sum + (Number(statusObj?.[key]?.totalCount) || 0),
        0
      );
      const amount = lane.apiKeys.reduce(
        (sum, key) => sum + (Number(statusObj?.[key]?.totalAmount) || 0),
        0
      );
      return { ...lane, count, amount };
    });

    const laneCount = computed.reduce((sum, lane) => sum + lane.count, 0);
    const laneAmount = computed.reduce((sum, lane) => sum + lane.amount, 0);

    const resolvedCount = Number(data?.totalTransaction?.count) || laneCount;
    const resolvedAmount = Number(data?.totalTransaction?.amount) || laneAmount;

    const weighted = laneCount
      ? computed.reduce(
          (sum, lane) => sum + lane.count * (LANE_HEALTH_WEIGHT[lane.key] ?? 0),
          0
        ) / laneCount
      : 0;

    /* A flawless book scores 96 - the last 4 points stay reserved as headroom. */
    const score = Math.round(weighted * 96);
    const resolvedBand =
      HEALTH_BANDS.find((item) => score >= item.min) || HEALTH_BANDS[HEALTH_BANDS.length - 1];

    return {
      lanes: computed,
      totalCount: resolvedCount,
      totalAmount: resolvedAmount,
      health: score,
      band: resolvedBand,
    };
  }, [data]);

  const laneByKey = (key: string) => lanes.find((lane) => lane.key === key);

  const successLane = laneByKey("success");
  const acceptedLane = laneByKey("accepted");
  const pendingLane = laneByKey("pending");
  const failedLane = laneByKey("failed");

  const selected = laneByKey(activeLane) || lanes[0];

  const share = (count: number) => (totalCount ? (count / totalCount) * 100 : 0);

  const successCount = successLane?.count || 0;
  const successAmount = successLane?.amount || 0;
  const pendingCount = pendingLane?.count || 0;
  const failedCount = failedLane?.count || 0;

  const waitingValue = (pendingLane?.amount || 0) + (acceptedLane?.amount || 0);
  const avgSuccessTicket = successCount ? successAmount / successCount : 0;
  const selectedAvgTicket = selected?.count ? selected.amount / selected.count : 0;

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 4,
        backgroundColor: surface,
        border: `1px solid ${border}`,
        boxShadow: isLight ? "0 2px 20px rgba(15, 23, 42, 0.05)" : "none",
      }}
    >
      {/* ---------- HEADER ---------- */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography sx={{ fontSize: 23, fontWeight: 700, color: "text.primary" }}>
            Transaction Flight Deck
          </Typography>
          <Typography sx={{ mt: 0.75, fontSize: 14.5, color: "text.secondary" }}>
            Focus any transaction lane and view instant business impact.
          </Typography>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 99,
            backgroundColor: alpha(band.color, isLight ? 0.1 : 0.18),
          }}
        >
          <Box
            sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: band.color }}
          />
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: band.color }}>
            {band.mode} · {health} / 100
          </Typography>
        </Stack>
      </Stack>

      {/* ---------- HEALTH + LANES ---------- */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
          gap: { xs: 4, md: 5 },
        }}
      >
        {/* Left: engine health */}
        <Stack alignItems="center" spacing={2.5}>
          <HealthRing value={health} color={band.color} track={ringTrack} />

          <Typography sx={{ fontSize: 15.5, fontWeight: 600, color: band.color }}>
            {band.caption}
          </Typography>

          <Stack spacing={1.5} sx={{ width: "100%", pt: 0.5 }}>
            {lanes.map((lane) => (
              <Stack
                key={lane.key}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      backgroundColor: lane.color,
                    }}
                  />
                  <Typography sx={{ fontSize: 14, color: "text.primary" }}>
                    {lane.label}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  {formatPercent(share(lane.count))}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* Right: lane selector + focused lane */}
        <Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {lanes.map((lane) => {
              const isActive = lane.key === selected?.key;
              return (
                <ButtonBase
                  key={lane.key}
                  onClick={() => setActiveLane(lane.key)}
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    borderRadius: 99,
                    border: `1px solid ${isActive ? "transparent" : border}`,
                    backgroundColor: isActive ? theme.palette.grey[900] : surface,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: isActive ? theme.palette.grey[900] : softSurface,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        backgroundColor: lane.color,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 14.5,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? theme.palette.common.white : "text.primary",
                      }}
                    >
                      {lane.label} {lane.count}
                    </Typography>
                  </Stack>
                </ButtonBase>
              );
            })}
          </Stack>

          {/* Focused lane card */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${border}`,
              backgroundColor: surface,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "flex-start", sm: "flex-start" }}
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography sx={{ fontSize: 19, fontWeight: 700, color: "text.primary" }}>
                  {selected?.title}
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: 14.5, color: "text.secondary" }}>
                  {selected?.blurb}
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1.75,
                  py: 0.75,
                  borderRadius: 99,
                  flexShrink: 0,
                  backgroundColor: alpha(SHARE_CHIP_COLOR, isLight ? 0.1 : 0.2),
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: SHARE_CHIP_COLOR }}>
                  {formatPercent(share(selected?.count || 0))} of {periodLabel}
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2.5,
              }}
            >
              <StatTile
                label="Transactions"
                value={String(selected?.count || 0)}
                surface={softSurface}
                border={border}
              />
              <StatTile
                label="Amount"
                value={formatMoney(selected?.amount || 0)}
                surface={softSurface}
                border={border}
              />
              <StatTile
                label="Avg Ticket"
                value={formatMoney(selectedAvgTicket)}
                surface={softSurface}
                border={border}
              />
            </Box>
          </Box>

          {/* Value snapshot */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            <StatTile
              label={`Cleared ${periodLabel}`}
              value={formatMoney(successAmount)}
              surface={surface}
              border={border}
            />
            <StatTile
              label="Waiting Value"
              value={formatMoney(waitingValue)}
              surface={surface}
              border={border}
            />
            <StatTile
              label="Total Value"
              value={formatMoney(totalAmount)}
              surface={surface}
              border={border}
            />
          </Box>
        </Box>
      </Box>

      {/* ---------- RATIO STRIP ---------- */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2.5,
        }}
      >
        <StatTile
          label="Success Ratio"
          value={formatPercent(share(successCount))}
          caption={`${successCount} / ${totalCount} transactions`}
          surface={surface}
          border={border}
        />
        <StatTile
          label="Pending Pressure"
          value={formatPercent(share(pendingCount))}
          caption={`${pendingCount} waiting transactions`}
          surface={surface}
          border={border}
        />
        <StatTile
          label="Failure Ratio"
          value={formatPercent(share(failedCount))}
          caption={`${failedCount} failed transactions`}
          surface={surface}
          border={border}
        />
        <StatTile
          label="Average Ticket"
          value={formatMoney(avgSuccessTicket)}
          caption="Successful transaction average"
          surface={surface}
          border={border}
        />
      </Box>
    </Card>
  );
};

export default TransactionFlightDeck;
