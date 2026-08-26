// @mui
import { styled, alpha } from "@mui/material/styles";
// utils
import { bgGradient } from "../../utils/cssStyles";
import bg from "src/assets/images/backgroundLogin.png";
// ----------------------------------------------------------------------

export const StyledRoot = styled("main")(() => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage: `url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
}));

export const StyledSection = styled("div")(({ theme }) => ({
  display: "none",
  position: "relative",
  [theme.breakpoints.up("md")]: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
}));

export const StyledSectionBg = styled("div")(({ theme }) => ({
  ...bgGradient({
    color: alpha(
      theme.palette.background.default,
      theme.palette.mode == "light" ? 0.9 : 0.94
    ),
    imgUrl: "/assets/background/overlay_2.jpg",
  }),
  top: 0,
  left: 0,
  zIndex: -1,
  width: "100%",
  height: "100%",
  position: "absolute",
  transform: "scaleX(-1)",
}));

export const StyledContent = styled("div")(({ theme }) => ({
  width: 480,
  margin: "auto",
  display: "flex",
  minHeight: "100vh",
  justifyContent: "center",
  padding: theme.spacing(15, 2),
  [theme.breakpoints.up("md")]: {
    flexShrink: 0,
    padding: theme.spacing(30, 8, 0, 8),
  },
}));

export const StyledCard = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: 920,
  minHeight: 520,
  backgroundColor: "#ffffff",
  borderRadius: 18,
  display: "flex",
  overflow: "hidden",
  border: "1px solid #EAE6E6",

  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    minHeight: "auto",
  },
}));
