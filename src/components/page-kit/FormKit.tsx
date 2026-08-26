import { ReactNode } from "react";
// @mui
import { Box, Card, Stack, Divider, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

// ----------------------------------------------------------------------
// Form + modal chrome, so create/edit screens match the list screens.
// ----------------------------------------------------------------------

/** Card wrapper for a form or any panel of content. */
export function FormCard({
  title,
  subtitle,
  actions,
  children,
  sx,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  sx?: object;
}) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
        ...sx,
      }}
    >
      {(title || actions) && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2.5 }}
          >
            <Box>
              {title && (
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography sx={{ mt: 0.5, fontSize: 13.5, color: "text.secondary" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            {actions && (
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {actions}
              </Stack>
            )}
          </Stack>

          <Divider sx={{ mb: 3 }} />
        </>
      )}

      {children}
    </Card>
  );
}

/** Responsive field grid - drops to one column on small screens. */
export function FormGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        rowGap: 2.5,
        columnGap: 2.5,
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: `repeat(${Math.min(columns, 2)}, 1fr)`,
          md: `repeat(${columns}, 1fr)`,
        },
      }}
    >
      {children}
    </Box>
  );
}

/** Right-aligned footer row for Save / Cancel. */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent="flex-end"
      sx={{ mt: 3, pt: 2.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}
    >
      {children}
    </Stack>
  );
}

// ----------------------------------------------------------------------

/**
 * Body for a MUI <Modal>: centered rounded panel with a titled header and a
 * scrollable content area. Use inside the existing Modal, replacing ad-hoc
 * style objects.
 */
export function ModalShell({
  title,
  subtitle,
  onClose,
  width = 640,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  width?: number;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "94%", sm: width },
        maxWidth: "94vw",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        outline: "none",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 24px 64px rgba(15, 23, 42, 0.28)",
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{title}</Typography>
          {subtitle && (
            <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, mr: -1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ px: 3, py: 2.5, overflowY: "auto" }}>{children}</Box>

      {actions && (
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {actions}
        </Stack>
      )}
    </Box>
  );
}
