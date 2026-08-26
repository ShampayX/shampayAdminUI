// // @mui
// import { Typography, Stack, Box } from "@mui/material";
// // components
// import Logo from "../../components/logo";
// import Image from "../../components/image";
// //
// import {
//   StyledRoot,
//   StyledSectionBg,
//   StyledSection,
//   StyledContent,
// } from "./styles";
// import { Link } from "react-router-dom";
// import packageFile from "../../../package.json";

// // ----------------------------------------------------------------------

// type Props = {
//   title?: string;
//   illustration?: string;
//   children: React.ReactNode;
// };

// export default function LoginLayout({ children, illustration, title }: Props) {
//   return (
//     <StyledRoot>
//       <Logo
//         sx={{
//           zIndex: 9,
//           position: "absolute",
//           mt: { xs: 1.5, md: 5 },
//           ml: { xs: 2, md: 5 },
//         }}
//       />

//       {/* <StyledSection>
//         <Typography variant="h3" sx={{ mb: 10, maxWidth: 480, textAlign: 'center' }}>
//           {title || 'Hi, Welcome back'}
//         </Typography>

//         <Image
//           disabledEffect
//           visibleByDefault
//           alt="auth"
//           src={illustration || '/assets/illustrations/illustration_dashboard.png'}
//           sx={{ maxWidth: 720 }}
//         />

//         <StyledSectionBg />
//       </StyledSection> */}

//       <StyledContent>
//         <Stack sx={{ width: 1 }}> {children} </Stack>
//       </StyledContent>

//       <Box
//         component="footer"
//         sx={{
//           position: "fixed",
//           width: "100%",
//           bottom: 0,
//           backgroundColor: "#375168",
//         }}
//       >
//         <Stack
//           sx={{ bgcolor: "white" }}
//           flexDirection={"row"}
//           justifyContent={"space-between"}
//           px={1}
//         >
//           <Typography variant="caption">
//             v.
//             {process.env.REACT_APP_ENV == "DEV"
//               ? packageFile.versiondev
//               : packageFile.versionprod}
//           </Typography>
//           <Typography variant="caption">
//             Last Updated :- {packageFile.lastUpdated}
//           </Typography>
//         </Stack>
//       </Box>
//     </StyledRoot>
//   );
// }

// @mui
import { Typography, Stack, Box } from "@mui/material";
// components
import Logo from "../../components/logo";
import Image from "../../components/image";
//
import { StyledRoot, StyledCard } from "./styles";
import packageFile from "../../../package.json";
import photo from "src/assets/images/Login.svg";
// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ children, illustration }: Props) {
  return (
    <StyledRoot>
      {/* 🔝 TOP BAR (LOGO + MENU ALWAYS ON TOP) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          px: { xs: 2, md: 5 },
          py: { xs: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Logo />

        {/* MENU ICON (if you have one) */}
        {/* <IconButton>
          <MenuIcon />
        </IconButton> */}
      </Box>

      {/* 🎯 CENTER LOGIN CARD */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <StyledCard>
          {/* LEFT ILLUSTRATION */}
          <Box
            sx={{
              width: "50%",
              bgcolor: "#FAFAFA",
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              p: 6,
              borderRadius: 2,
              m: 2,
            }}
          >
            <Image
              disabledEffect
              visibleByDefault
              alt="login"
              src={illustration || photo}
              sx={{ maxWidth: 383 }}
            />
          </Box>

          {/* RIGHT FORM */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              p: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Stack sx={{ width: 1 }}>{children}</Stack>
          </Box>
        </StyledCard>
      </Box>

      {/* FOOTER SAME */}
      <Box
        component="footer"
        sx={{
          position: "fixed",
          width: "100%",
          bottom: 0,
          // backgroundColor: "#375168",
        }}
      >
        <Stack
          // sx={{ bgcolor: "white" }}
          direction="row"
          justifyContent="space-between"
          px={1}
        >
          <Typography variant="caption">
            v.
            {process.env.REACT_APP_ENV === "DEV"
              ? packageFile.versiondev
              : packageFile.versionprod}
          </Typography>
          <Typography variant="caption">
            Last Updated : {packageFile.lastUpdated}
          </Typography>
        </Stack>
      </Box>
    </StyledRoot>
  );
}
