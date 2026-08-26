import { useRef } from "react";
import { SnackbarProvider as NotistackProvider, SnackbarKey } from "notistack";
// @mui
import { alpha } from "@mui/material/styles";
import { Box, Collapse, IconButton } from "@mui/material";
//
import { useSettingsContext } from "../settings";
import Iconify, { IconifyProps } from "../iconify";
//
import StyledNotistack from "./styles";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function SnackbarProvider({ children }: Props) {
  const { themeDirection } = useSettingsContext();

  const isRTL = themeDirection == "rtl";

  const notistackRef = useRef<any>(null);

  const onClose = (key: SnackbarKey) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <>
      <StyledNotistack />

      <NotistackProvider
        ref={notistackRef}
        dense
        maxSnack={5}
        preventDuplicate
        autoHideDuration={3000}
        TransitionComponent={isRTL ? Collapse : undefined}
        transitionDuration={{ enter: 260, exit: 200 }}
        variant="success" // Set default variant
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        iconVariant={{
          info: <SnackbarIcon icon="eva:info-fill" color="info" />,
          success: (
            <SnackbarIcon icon="eva:checkmark-circle-2-fill" color="success" />
          ),
          warning: (
            <SnackbarIcon icon="eva:alert-triangle-fill" color="warning" />
          ),
          error: <SnackbarIcon icon="eva:alert-circle-fill" color="error" />,
        }}
        // With close as default
        action={(key) => (
          <IconButton size="small" onClick={onClose(key)} sx={{ p: 0.75 }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        )}
      >
        {children}
      </NotistackProvider>
    </>
  );
}

// ----------------------------------------------------------------------

type SnackbarIconProps = {
  icon: IconifyProps;
  color: "info" | "success" | "warning" | "error";
};

/** Rounded tinted tile carrying the variant glyph, sized to the message row. */
function SnackbarIcon({ icon, color }: SnackbarIconProps) {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 34,
        height: 34,
        flexShrink: 0,
        display: "flex",
        borderRadius: 1.25,
        alignItems: "center",
        justifyContent: "center",
        color: `${color}.main`,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
      }}
    >
      <Iconify icon={icon} width={20} />
    </Box>
  );
}
