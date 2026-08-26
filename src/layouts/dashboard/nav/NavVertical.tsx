import { useEffect } from "react";
import { useLocation } from "react-router-dom";
// @mui
import { Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
// hooks
import useResponsive from "../../../hooks/useResponsive";
// config
import { NAV } from "../../../config";
//
import NavSidebar, { getSidebarTokens } from "./NavSidebar";

// ----------------------------------------------------------------------

export const NAV_W_COLLAPSED = 88;

interface Props {
  openNav: boolean;
  onCloseNav: VoidFunction;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function NavVertical({
  openNav,
  onCloseNav,
  isCollapsed,
  toggleCollapse,
}: Props) {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isDesktop = useResponsive("up", "lg");
  const tokens = getSidebarTokens(theme);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const paperSx = {
    width: isCollapsed ? NAV_W_COLLAPSED : NAV.W_DASHBOARD,
    border: "none",
    borderRight: `1px solid ${tokens.border}`,
    background: tokens.bg,
    transition: "width 0.3s ease-in-out",
  };

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: isCollapsed ? NAV_W_COLLAPSED : NAV.W_DASHBOARD,
        transition: "width 0.3s ease-in-out",
      }}
    >
      {isDesktop ? (
        <Drawer open variant="permanent" PaperProps={{ sx: paperSx }}>
          <NavSidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { ...paperSx, width: NAV.W_DASHBOARD } }}
        >
          <NavSidebar />
        </Drawer>
      )}
    </Box>
  );
}
