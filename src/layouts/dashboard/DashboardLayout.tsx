// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// // @mui
// import { Box } from "@mui/material";
// // hooks
// import useResponsive from "../../hooks/useResponsive";
// // components
// import { useSettingsContext } from "../../components/settings";
// //
// import Main from "./Main";
// import Header from "./header";
// import NavMini from "./nav/NavMini";
// import NavVertical from "./nav/NavVertical";
// import NavHorizontal from "./nav/NavHorizontal";

// // ----------------------------------------------------------------------

// export default function DashboardLayout() {
//   const { themeLayout } = useSettingsContext();

//   const isDesktop = useResponsive("up", "lg");

//   const [open, setOpen] = useState(false);

//   const isNavHorizontal = themeLayout == "horizontal";

//   const isNavMini = themeLayout == "mini";

//   const handleOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const renderNavVertical = (
//     <NavVertical openNav={open} onCloseNav={handleClose} />
//   );

//   if (isNavHorizontal) {
//     return (
//       <>
//         <Header onOpenNav={handleOpen} />

//         {isDesktop ? <NavHorizontal /> : renderNavVertical}

//         <Main>
//           <Outlet />
//         </Main>
//       </>
//     );
//   }

//   if (isNavMini) {
//     return (
//       <>
//         <Header onOpenNav={handleOpen} />

//         <Box
//           sx={{
//             display: { lg: "flex" },
//             minHeight: { lg: 1 },
//           }}
//         >
//           {isDesktop ? <NavMini /> : renderNavVertical}

//           <Main>
//             <Outlet />
//           </Main>
//         </Box>
//       </>
//     );
//   }

//   return (
//     <>
//     {/* this is header part only in this only conatain right side top contain  */}
//       <Header onOpenNav={handleOpen} />

//       <Box
//         sx={{
//           display: { lg: "flex" },
//           minHeight: { lg: 1 },
//         }}
//       >
//         {renderNavVertical}

//         <Main>
//           <Outlet />
//         </Main>
//       </Box>
//     </>
//   );
// }


import { useState } from "react";
import { Outlet } from "react-router-dom";
// @mui
import { Box, Fab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
// hooks
import useResponsive from "../../hooks/useResponsive";
//
import Main from "./Main";
import WorkspaceBar from "./header/WorkspaceBar";
import NavVertical, { NAV_W_COLLAPSED } from "./nav/NavVertical";
// config
import { NAV } from "../../config";

// import  NavSectionVertical  from "../../components/nav-section/vertical/NavSectionVertical";

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const isDesktop = useResponsive("up", "lg");

  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapse state

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navWidth = isCollapsed ? NAV_W_COLLAPSED : NAV.W_DASHBOARD;

  return (
    <Box>
      {/* Mobile-only nav opener - the desktop top bar is gone, the sidebar owns
          account, alerts and balances now. */}
      {!isDesktop && (
        <Fab
          size="small"
          color="primary"
          aria-label="open navigation"
          onClick={handleOpen}
          sx={{ position: "fixed", left: 16, bottom: 16, zIndex: 1200 }}
        >
          <MenuIcon fontSize="small" />
        </Fab>
      )}

      {/* Main Layout */}
      <Box
        sx={{
          display: { lg: "flex" },
          minHeight: { lg: 1 },
        }}
      >
        {/* Sidebar */}
        <NavVertical
          openNav={open}
          onCloseNav={handleClose}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        {/* Main Content (Expands when Sidebar is Collapsed) */}
        <Main
          sx={{
            minWidth: 0,
            width: { lg: `calc(100% - ${navWidth}px)` },
            transition: "width 0.3s ease-in-out",
          }}
        >
          {/* float, vendor balances, theme + colour - pinned top-right */}
          <WorkspaceBar />

          <Outlet />
        </Main>
      </Box>
    </Box>
  );
}
