// @mui
import { alpha, useTheme } from "@mui/material/styles";
import { GlobalStyles } from "@mui/material";

// ----------------------------------------------------------------------
// Look and feel of every toast in the portal. notistack renders the markup,
// this paints it: a paper card with a coloured rail on the leading edge, so
// success / error / warning / info read apart at a glance while still sitting
// in the same design language as the rest of the admin (cards, filter bars).
// ----------------------------------------------------------------------

export default function StyledNotistack() {
  const theme = useTheme();

  const isLight = theme.palette.mode === "light";

  /* Rail + wash carried by the leading edge, one colour per variant. notistack
     emits no class for the `default` variant, so the brand accent is applied on
     the base rule below and each variant overrides it. */
  const tint = (color: string) => ({
    borderLeftColor: color,
    backgroundImage: `linear-gradient(90deg, ${alpha(
      color,
      isLight ? 0.07 : 0.14
    )} 0%, ${alpha(color, 0)} 42%)`,
  });

  const RAIL: Record<string, string> = {
    Success: theme.palette.success.main,
    Error: theme.palette.error.main,
    Warning: theme.palette.warning.main,
    Info: theme.palette.info.main,
  };

  const variantRails = Object.keys(RAIL).reduce(
    (styles, variant) => ({
      ...styles,
      [`&.SnackbarItem-variant${variant}`]: tint(RAIL[variant]),
    }),
    {}
  );

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        "#root": {
          ".SnackbarContent-root": {
            width: "100%",
            maxWidth: "calc(100vw - 32px)",
            padding: theme.spacing(1.25, 1.5),
            margin: theme.spacing(0.5, 0),
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderLeft: "4px solid",
            borderRadius: Number(theme.shape.borderRadius) * 1.5,
            boxShadow: theme.customShadows.dropdown,
            ...tint(theme.palette.primary.main),
            ...variantRails,
            [theme.breakpoints.up("md")]: {
              minWidth: 300,
              maxWidth: 460,
            },
          },
          ".SnackbarItem-message": {
            padding: "0 !important",
            fontSize: 14,
            lineHeight: 1.55,
            fontWeight: theme.typography.fontWeightBold,
            letterSpacing: 0.1,
          },
          ".SnackbarItem-action": {
            marginRight: 0,
            paddingLeft: theme.spacing(1),
            color: theme.palette.text.disabled,

            "& svg": {
              width: 18,
              height: 18,
            },
            "& .MuiIconButton-root:hover": {
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
            },
          },
        },
      }}
    />
  );

  return inputGlobalStyles;
}
