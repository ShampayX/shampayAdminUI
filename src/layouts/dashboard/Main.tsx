// @mui
import { Box, BoxProps } from "@mui/material";
// hooks
import useResponsive from "../../hooks/useResponsive";
// config
import { HEADER, NAV } from "../../config";
// components
import { useSettingsContext } from "../../components/settings";

// ----------------------------------------------------------------------

const SPACING = 8;

export default function Main({ children, sx, ...other }: BoxProps) {
  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout == "horizontal";

  const isNavMini = themeLayout == "mini";

  const isDesktop = useResponsive("up", "lg");

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          pt: `${HEADER.H_MOBILE + SPACING}px`,
          pb: `${HEADER.H_MOBILE + SPACING}px`,
          px: 1,
          ...(isDesktop && {
            px: 2,
            pt: `${HEADER.H_DASHBOARD_DESKTOP + 40}px`,
            pb: `${HEADER.H_DASHBOARD_DESKTOP + SPACING}px`,
          }),
        }}
      >
        {children}
      </Box>
    );
  }

  /* The dashboard top bar was removed - the sidebar owns account, alerts and
     balances now - so main content only needs breathing room, not header offset. */
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: `${SPACING * 2}px`,
        px: 1,
        ...(isDesktop && {
          px: 2,
          py: `${SPACING * 3}px`,
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
