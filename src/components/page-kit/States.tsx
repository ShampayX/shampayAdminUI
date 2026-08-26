import { ReactNode } from "react";
// @mui
import { Box, Card, Stack, Typography, CircularProgress } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// ----------------------------------------------------------------------
// Empty / loading panels, so every screen says "nothing here" and "working"
// the same way instead of each page inventing its own.
// ----------------------------------------------------------------------

/**
 * Placeholder for a panel with no rows yet. `action` is for the button that
 * would fix it ("Add provider"), omitted when there is nothing to offer.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  boxed = true,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  /** Wrap in a bordered card. Turn off when already inside one. */
  boxed?: boolean;
}) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const body = (
    <Stack alignItems="center" spacing={1.25} sx={{ py: 6, px: 3 }}>
      {icon && (
        <Box
          sx={{
            width: 52,
            height: 52,
            display: "flex",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            color: "text.disabled",
            backgroundColor: alpha(theme.palette.grey[500], 0.1),
            "& svg": { fontSize: 26 },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{title}</Typography>

      {description && (
        <Typography
          sx={{
            fontSize: 13.5,
            maxWidth: 420,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          {description}
        </Typography>
      )}

      {action && <Box sx={{ mt: 0.5 }}>{action}</Box>}
    </Stack>
  );

  if (!boxed) return body;

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
      }}
    >
      {body}
    </Card>
  );
}

/** Centred spinner with an optional line of context. */
export function LoadingState({
  label,
  height = 220,
}: {
  label?: string;
  height?: number;
}) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ height }}>
      <CircularProgress size={30} />
      {label && (
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
      )}
    </Stack>
  );
}
