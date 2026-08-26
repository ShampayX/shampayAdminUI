import { memo } from "react";
// @mui
import { useTheme } from "@mui/material/styles";
import { Box, BoxProps } from "@mui/material";

// ----------------------------------------------------------------------

function GoldLoanIcon({ active, ...other }: any) {
  const theme = useTheme();

  const PRIMARY_MAIN = theme.palette.primary.main;

  const PRIMARY_DARK = theme.palette.primary.dark;

  const PRIMARY_DARKER = theme.palette.primary.darker;

  return (
    <Box {...other}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 29 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_2243_805"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="29"
          height="28"
        >
          <path
            d="M0.779297 3.8147e-06H28.2193V27.44H0.779297V3.8147e-06Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_2243_805)">
          <path
            d="M18.7952 11.393C18.5429 10.7208 17.9006 10.2757 17.1824 10.2757H11.8196C11.1019 10.2757 10.4596 10.7208 10.2073 11.393C9.4758 13.3437 8.04297 17.1643 8.04297 17.1643H20.9591C20.9591 17.1643 19.5266 13.3437 18.7952 11.393Z"
            stroke={active ? "#C52031" : "#333333"}
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8.04161 7.69247L6.75 6.40087"
            stroke={active ? "#C52031" : "#333333"}
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20.959 7.69247L22.2506 6.40087"
            stroke={active ? "#C52031" : "#333333"}
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14.5 5.10928V3.38716"
            stroke={active ? "#C52031" : "#333333"}
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12.3362 18.2815C12.0839 17.6095 11.4416 17.1643 10.7234 17.1643H5.36063C4.64295 17.1643 4.00058 17.6095 3.74831 18.2815C3.01681 20.2323 1.58398 24.0529 1.58398 24.0529H14.5001C14.5001 24.0529 13.0676 20.2323 12.3362 18.2815Z"
            stroke={active ? "#C52031" : "#333333"}
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.6643 18.2815C16.9166 17.6095 17.559 17.1643 18.2766 17.1643H23.6394C24.3576 17.1643 24.9999 17.6095 25.2522 18.2815C25.9837 20.2323 27.4161 24.0529 27.4161 24.0529H14.5C14.5 24.0529 15.9329 20.2323 16.6643 18.2815Z"
            stroke={active ? "#C52031" : "#333333"}
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    </Box>
  );
}

export default memo(GoldLoanIcon);
