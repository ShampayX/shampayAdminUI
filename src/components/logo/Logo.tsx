import { forwardRef } from "react";
import { Box, IconButton, BoxProps } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// ----------------------------------------------------------------------

/** Brand mark. Swap this one file to rebrand every place the logo appears. */
export const BRAND_MARK = "/logo/shampay-mark.svg";

interface LogoProps extends BoxProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      isCollapsed = false,
      toggleCollapse = () => {},
      disabledLink = false,
      sx,
      ...other
    },
    ref
  ) => {
    const mark = (
      <Box
        component="img"
        src={BRAND_MARK}
        alt={process.env.REACT_APP_COMPANY_NAME || "Shampay"}
        sx={{ width: 36, height: 36 }}
      />
    );

    return (
      <Box
        ref={ref}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          width: "100%",
          padding: "10px",
          ...sx,
        }}
        {...other}
      >
        {!isCollapsed &&
          (disabledLink ? (
            mark
          ) : (
            <Box component="a" href="/" sx={{ display: "flex" }}>
              {mark}
            </Box>
          ))}

        <IconButton onClick={toggleCollapse} sx={{ marginLeft: "10px" }}>
          <MenuIcon />
        </IconButton>
      </Box>
    );
  }
);

export default Logo;
