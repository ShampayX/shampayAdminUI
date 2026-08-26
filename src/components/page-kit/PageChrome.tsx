import { ReactNode, SyntheticEvent } from "react";
// @mui
import { Box, Tabs, Stack, Button, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// ----------------------------------------------------------------------
// Page chrome shared by every admin screen: header, action buttons, filter bar.
// ----------------------------------------------------------------------

/** Green gradient used by the primary page actions (Export / Archive / Add). */
export const KIT_GREEN = {
  from: "#0e9f6e",
  to: "#047857",
  fromAlt: "#0f766e",
  toAlt: "#065f46",
};

type ActionButtonProps = {
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  tone?: "primary" | "alt";
  disabled?: boolean;
  type?: "button" | "submit";
};

/** Filled gradient action, used top-right of a page header. */
export function PageActionButton({
  children,
  startIcon,
  endIcon,
  onClick,
  tone = "primary",
  disabled,
  type = "button",
}: ActionButtonProps) {
  const isAlt = tone === "alt";

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        px: 2.25,
        height: 42,
        borderRadius: 1.5,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        background: isAlt
          ? `linear-gradient(135deg, ${KIT_GREEN.fromAlt}, ${KIT_GREEN.toAlt})`
          : `linear-gradient(135deg, ${KIT_GREEN.from}, ${KIT_GREEN.to})`,
        boxShadow: "0 6px 16px rgba(4, 120, 87, 0.25)",
        "&:hover": {
          background: isAlt
            ? `linear-gradient(135deg, ${KIT_GREEN.toAlt}, ${KIT_GREEN.toAlt})`
            : `linear-gradient(135deg, ${KIT_GREEN.to}, ${KIT_GREEN.to})`,
        },
        "&.Mui-disabled": { color: alpha("#fff", 0.7) },
      }}
    >
      {children}
    </Button>
  );
}

/** Quiet outlined action, for secondary things next to a PageActionButton. */
export function PageGhostButton({
  children,
  startIcon,
  onClick,
  disabled,
  type = "button",
}: ActionButtonProps) {
  const theme = useTheme();

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      sx={{
        px: 2,
        height: 42,
        borderRadius: 1.5,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        color: "text.primary",
        border: `1px solid ${theme.palette.divider}`,
        "&:hover": {
          borderColor: theme.palette.text.primary,
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
        },
      }}
    >
      {children}
    </Button>
  );
}

// ----------------------------------------------------------------------

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

/** Screen title block with the action cluster on the right. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      sx={{ mb: 2.5 }}
    >
      <Box>
        <Typography sx={{ fontSize: 25, fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 0.5, fontSize: 14.5, color: "text.secondary" }}>
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
  );
}

// ----------------------------------------------------------------------

/** Rounded card holding the quick filters in a single row. */
export function FilterBar({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Box
      sx={{
        p: 1.25,
        mb: 2.5,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight ? "0 2px 12px rgba(15, 23, 42, 0.05)" : "none",
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        {children}
      </Stack>
    </Box>
  );
}

/** One bordered slot inside the filter bar: leading icon + control. */
export function FilterSlot({
  icon,
  children,
  grow,
  minWidth = 190,
}: {
  icon?: ReactNode;
  children: ReactNode;
  grow?: boolean;
  minWidth?: number;
}) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 1.5,
        height: 48,
        minWidth,
        flexGrow: grow ? 1 : 0,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        "&:focus-within": { borderColor: theme.palette.text.disabled },
      }}
    >
      {icon && (
        <Box
          sx={{ display: "flex", color: "text.disabled", "& svg": { fontSize: 19 } }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

/**
 * Tab strip for screens that switch between sub-views (service categories,
 * vendor lanes). Same rail on every page: quiet uppercase labels, green
 * indicator, scrollable when the list is long.
 */
export function KitTabs({
  value,
  onChange,
  children,
}: {
  value: any;
  onChange: (event: SyntheticEvent, value: any) => void;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        mb: 2.5,
        minHeight: 44,
        borderBottom: `1px solid ${theme.palette.divider}`,
        "& .MuiTab-root": {
          minHeight: 44,
          px: 2,
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: theme.palette.text.secondary,
          "&.Mui-selected": { color: KIT_GREEN.to },
        },
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: 3,
          backgroundColor: KIT_GREEN.from,
        },
      }}
    >
      {children}
    </Tabs>
  );
}

// ----------------------------------------------------------------------

/** Square icon button sized to sit inside a FilterBar row. */
export function FilterIconButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  const theme = useTheme();

  return (
    <Button
      onClick={onClick}
      title={title}
      sx={{
        minWidth: 48,
        width: 48,
        height: 48,
        p: 0,
        borderRadius: 1.5,
        color: "text.secondary",
        border: `1px solid ${theme.palette.divider}`,
        "&:hover": { borderColor: theme.palette.text.primary },
      }}
    >
      {children}
    </Button>
  );
}
