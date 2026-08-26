import { ReactNode } from "react";
// @mui
import { Box, Card, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// ----------------------------------------------------------------------
// Summary tiles for the top of an operations screen. Deliberately plain:
// one number, one label, one optional caption. The accent is semantic, so a
// row of these reads as status at a glance without turning into a dashboard.
// ----------------------------------------------------------------------

export type StatTone = "primary" | "success" | "warning" | "error" | "neutral";

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** Small line under the value - a share, a total, a unit. */
  caption?: string;
  icon?: ReactNode;
  tone?: StatTone;
};

export function StatCard({
  label,
  value,
  caption,
  icon,
  tone = "primary",
}: StatCardProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const accent =
    tone === "neutral" ? theme.palette.text.secondary : theme.palette[tone].main;

  return (
    <Card
      sx={{
        p: 2.25,
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {icon && (
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              display: "flex",
              borderRadius: 1.25,
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              backgroundColor: alpha(accent, isLight ? 0.12 : 0.2),
              "& svg": { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{ mt: 0.25, fontSize: 21, fontWeight: 700, lineHeight: 1.25 }}
          >
            {value}
          </Typography>

          {caption && (
            <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
              {caption}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

/** Even row of StatCards - four across on desktop, two on tablet, one on phone. */
export function StatGrid({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        mb: 2.5,
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: `repeat(${columns}, 1fr)`,
        },
      }}
    >
      {children}
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * Horizontal meter for a used/allowed pair. Turns amber past 75% and red past
 * 90%, so an account close to its ceiling stands out in a long list.
 */
export function UsageMeter({
  used,
  total,
  height = 6,
}: {
  used: number;
  total: number;
  height?: number;
}) {
  const theme = useTheme();

  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color =
    percent >= 90
      ? theme.palette.error.main
      : percent >= 75
      ? theme.palette.warning.main
      : theme.palette.success.main;

  return (
    <Box
      sx={{
        height,
        borderRadius: 5,
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.grey[500], 0.2),
      }}
    >
      <Box
        sx={{
          height: "100%",
          borderRadius: 5,
          width: `${percent}%`,
          backgroundColor: color,
          transition: "width 0.4s ease",
        }}
      />
    </Box>
  );
}
