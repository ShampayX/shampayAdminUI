import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
// @mui
import {
  Box,
  Stack,
  Collapse,
  Tooltip,
  Typography,
  ButtonBase,
  IconButton,
} from "@mui/material";
import { alpha, getContrastRatio, useTheme, Theme } from "@mui/material/styles";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// nav item icons
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
// locales
import { useLocales } from "../../../locales";
// auth
import { useAuthContext } from "../../../auth/useAuthContext";
// components
import Scrollbar from "../../../components/scrollbar";
//
// theme
import { brandPreset } from "../../../components/settings/presets";
//
import { getNavConfig } from "./config";
import AccountPopover from "../header/AccountPopover";
import NotificationsPopover from "../header/NotificationsPopover";

// ----------------------------------------------------------------------

/**
 * Sidebar palette. Follows the app theme mode - light surface by default,
 * deep navy once the user switches to dark.
 */
/**
 * Highlight colour for the light sidebar (hover + active item). Reads the brand
 * preset rather than the live palette, so switching Color/Plain never repaints
 * the nav - re-tint the whole portal from `brandPreset` in settings/presets.
 */
const SIDEBAR_ACCENT = brandPreset.main;

export function getSidebarTokens(theme: Theme) {
  const accent = SIDEBAR_ACCENT;
  /* Guard against a highlight too light to read as text on a white surface. */
  const accentInk =
    getContrastRatio(accent, "#FFFFFF") >= 4.5 ? accent : "#200A69";
  const isDark = theme.palette.mode === "dark";

  if (isDark) {
    return {
      accent,
      live: "#22c55e",
      bg: "linear-gradient(180deg, #0A101E 0%, #111B2F 55%, #16233C 100%)",
      border: "rgba(255, 255, 255, 0.07)",
      text: "rgba(255, 255, 255, 0.92)",
      textSoft: "rgba(255, 255, 255, 0.72)",
      textMuted: "rgba(255, 255, 255, 0.46)",
      label: "rgba(255, 255, 255, 0.38)",
      surface: "rgba(255, 255, 255, 0.05)",
      surfaceBorder: "rgba(255, 255, 255, 0.09)",
      surfaceHover: "rgba(255, 255, 255, 0.08)",
      active: "rgba(255, 255, 255, 0.1)",
      activeText: "#ffffff",
      activeMarker: "#ffffff",
      iconActiveBg: "rgba(255, 255, 255, 0.14)",
      brandTile: "#ffffff",
      brandShadow: "0 4px 14px rgba(0,0,0,0.35)",
      panelBg: "rgba(0, 0, 0, 0.18)",
      scrollThumb: "rgba(255, 255, 255, 0.28)",
    };
  }

  return {
    accent,
    live: "#22c55e",
    bg: "linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 100%)",
    border: "#E7EBF1",
    text: "#1C2536",
    textSoft: "#4A5768",
    textMuted: "#6B7A90",
    label: "#98A5B8",
    surface: "#F4F7FB",
    surfaceBorder: "#E7EBF1",
    surfaceHover: alpha(accent, 0.07),
    active: alpha(accent, 0.12),
    activeText: accentInk,
    activeMarker: accent,
    iconActiveBg: alpha(accent, 0.14),
    brandTile: "#F4F7FB",
    brandShadow: "none",
    panelBg: "#F7F9FC",
    scrollThumb: "rgba(20, 30, 50, 0.22)",
  };
}

export type SidebarTokens = ReturnType<typeof getSidebarTokens>;

/**
 * Groups the flat nav config into the labelled sections shown in the sidebar.
 * Titles must match `navConfig` in ./config. Anything unmapped falls into
 * the trailing "More" group, so a new menu entry never disappears.
 */
const NAV_GROUPS: { label: string; titles: string[] }[] = [
  { label: "Overview", titles: ["Dashboard"] },
  {
    label: "Network & Users",
    titles: ["Our Network", "User Management", "Role Management"],
  },
  {
    label: "Reports & Operations",
    titles: ["reports", "Fund Management"],
  },
  {
    label: "Products & Config",
    titles: [
      "Scheme Management",
      "Vendor Management",
      "BBPS Management",
      "Tools",
    ],
  },
];

/**
 * Display name + icon per menu entry, keyed by the `title` in ./config.
 * The config titles stay untouched on purpose - module permissions and the
 * i18n keys match on them - so renaming here is presentation only.
 */
const NAV_META: Record<string, { label: string; icon: React.ReactNode }> = {
  Dashboard: { label: "Summary", icon: <SpeedOutlinedIcon /> },
  "Our Network": { label: "Ecosystem", icon: <HubOutlinedIcon /> },
  "User Management": { label: "People", icon: <GroupsOutlinedIcon /> },
  "Role Management": {
    label: "Permissions",
    icon: <AdminPanelSettingsOutlinedIcon />,
  },
  reports: { label: "Records", icon: <FactCheckOutlinedIcon /> },
  "Fund Management": { label: "Treasury", icon: <SavingsOutlinedIcon /> },
  "Scheme Management": { label: "Plans", icon: <WorkspacePremiumOutlinedIcon /> },
  "Vendor Management": { label: "Providers", icon: <StorefrontOutlinedIcon /> },
  "BBPS Management": { label: "Bill Payments", icon: <ReceiptLongOutlinedIcon /> },
  Tools: { label: "Utilities", icon: <HandymanOutlinedIcon /> },
  /* "Doc Api Reference" ("API Docs") was removed from the sidebar in Phase 6 -
     see the note at its removal site in nav/config.tsx. */
};

/**
 * Display name per sub-menu entry, keyed by the child `title` in ./config.
 * Same rule as NAV_META: the config titles are matched by MODULE_NAV_CONFIG
 * for roleLevel 2/3, and several carry trailing spaces, so they must never be
 * edited there - only relabelled here. Anything unmapped falls back to the
 * config title, so a new sub-menu entry still shows up.
 */
const NAV_CHILD_LABELS: Record<string, string> = {
  /* People */
  "User Wise Limit": "Limits",
  "User Wise Vendor": "Vendor Routing",

  /* Records */
  "All Transaction Records ": "Transaction Center",
  "Track Transactions ": "Transaction Tracker",
  "Fund Flow Transactions": "Money Movement",
  "Wallet Ladger ": "Account Ledger",
  "Historical Data Exports ": "Export Archive",
  "UserWise Opening Balance": "Starting Balances",

  /* Plans */
  "Manage Scheme": "Scheme Catalog",
  "Map Scheme": "Scheme Assignment",
  "Manage BBPS Scheme": "Bill Payment Plans",
  "Map BBPS Scheme": "Bill Payment Mapping",
  "Manage Loan Scheme": "Loan Plan Catalog",
  "Map Loan Scheme": "Loan Plan Mapping",

  /* Providers - the four consolidated screens are already named the way they
     should read, so there is nothing to relabel here. See the block comment on
     "Vendor Management" in nav/config.tsx for what they replaced. */

  /* Treasury */
  "Add New Bank": "Banks",
  "Admin Fund Flow": "Fund Flow",
  "Fund Requests": "Requests",

  /* Bill Payments */
  BBPS: "Manage",
  "BBPS Products": "Products",

  /* Utilities */
  "SMS/Email Management ": "SMS & Email",
  /* "Approve User PAN" ("PAN Approvals") and "Update DocuSign" ("DocuSign")
     were removed from the sidebar in Phase 6 - see nav/config.tsx. */
  "Vendor Switch ": "Vendor Switch",
  "Bank Master ": "Bank Master",
  ReProcess: "Reprocess",
  BulkCheckStatus: "Bulk Status Check",
  NewsFlash: "News Flash",
  NewsSummary: "News Summary",
  "Enable/Disable categories": "Categories",
  "Wallet To Wallet Control": "Wallet Transfers",
  "Other ": "Platform Limits",
};

/* Wordmark in the sidebar. Kept literal so it never waits on an env rebuild -
   change this one string to rebrand the sidebar. */
const BRAND_NAME = "Shampay";

/* Swap this file (same path) to change the mark - no code change needed.
   Falls back to an "S" monogram if the asset is missing. */
const BRAND_LOGO = "/logo/shampay-mark.svg";

// ----------------------------------------------------------------------

/** Small pill badge - pass as `info` on a nav item, e.g. <NavBadge label="LIVE" />. */
export function NavBadge({ label }: { label: string }) {
  return (
    <Box
      sx={{
        px: 0.85,
        py: 0.15,
        borderRadius: 99,
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: 0.6,
        color: "#052e16",
        backgroundColor: "#22c55e",
      }}
    >
      {label}
    </Box>
  );
}

// ----------------------------------------------------------------------

type NavRowProps = {
  tokens: SidebarTokens;
  title: string;
  icon?: any;
  info?: any;
  active: boolean;
  collapsed: boolean;
  hasChildren?: boolean;
  open?: boolean;
  to?: string;
  onClick?: () => void;
};

function NavRow({
  tokens,
  title,
  icon,
  info,
  active,
  collapsed,
  hasChildren,
  open,
  to,
  onClick,
}: NavRowProps) {
  const row = (
    <ButtonBase
      onClick={onClick}
      {...(to ? { component: RouterLink, to } : {})}
      sx={{
        position: "relative",
        width: "100%",
        px: collapsed ? 0 : 1.25,
        py: 1,
        borderRadius: 2,
        justifyContent: collapsed ? "center" : "flex-start",
        color: active ? tokens.activeText : tokens.textSoft,
        backgroundColor: active ? tokens.active : "transparent",
        transition: "background-color 0.2s ease, color 0.2s ease",
        "&:hover": {
          backgroundColor: active ? tokens.active : tokens.surfaceHover,
        },
        /* active marker on the far left edge */
        ...(active && {
          "&:before": {
            content: '""',
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 20,
            borderRadius: 99,
            backgroundColor: tokens.activeMarker,
          },
        }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ width: "100%", minWidth: 0 }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: 1.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active ? tokens.activeText : tokens.textSoft,
            backgroundColor: active ? tokens.iconActiveBg : tokens.surface,
            border: `1px solid ${tokens.surfaceBorder}`,
            "& svg": { fontSize: 18 },
          }}
        >
          {icon}
        </Box>

        {!collapsed && (
          <>
            <Typography
              noWrap
              sx={{
                flexGrow: 1,
                minWidth: 0,
                textAlign: "left",
                fontSize: 14.5,
                fontWeight: active ? 600 : 500,
                textTransform: "capitalize",
              }}
            >
              {title}
            </Typography>

            {info}

            {hasChildren &&
              (open ? (
                <KeyboardArrowDownIcon sx={{ fontSize: 18, opacity: 0.55 }} />
              ) : (
                <KeyboardArrowRightIcon sx={{ fontSize: 18, opacity: 0.55 }} />
              ))}
          </>
        )}
      </Stack>
    </ButtonBase>
  );

  return collapsed ? (
    <Tooltip title={title} placement="right" arrow>
      <Box sx={{ width: "100%" }}>{row}</Box>
    </Tooltip>
  ) : (
    row
  );
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
};

export default function NavSidebar({ isCollapsed = false, toggleCollapse }: Props) {
  const theme = useTheme();
  const tokens = getSidebarTokens(theme);

  const { pathname } = useLocation();
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [logoFailed, setLogoFailed] = useState(false);

  /* Role / module filtered menu, same source the old sidebar used. */
  const { items, roleLabel, accountEmail } = useMemo(() => {
    let adminUserData: any = {};
    let modules: any[] = [];

    try {
      const storedUser = localStorage.getItem("adminUserData");
      const storedModules = localStorage.getItem("adminModules");

      adminUserData =
        storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : {};
      modules =
        storedModules && storedModules !== "undefined"
          ? JSON.parse(storedModules)
          : [];
    } catch (error) {}

    const roleLevel = adminUserData?.user?.roleLevel ?? 0;

    const flat = getNavConfig(roleLevel, modules).flatMap(
      (section: any) => section.items || []
    );

    const label =
      roleLevel === 0
        ? "Super Admin"
        : roleLevel === 1
        ? "Root Admin"
        : roleLevel === 2
        ? "Team Lead"
        : "Team Member";

    return {
      items: flat,
      roleLabel: label,
      accountEmail: adminUserData?.user?.email || "",
    };
  }, []);

  const groups = useMemo(() => {
    const mapped = NAV_GROUPS.map((group) => ({
      label: group.label,
      items: items.filter((item: any) => group.titles.includes(item.title)),
    }));

    const grouped = new Set(NAV_GROUPS.flatMap((group) => group.titles));
    const rest = items.filter((item: any) => !grouped.has(item.title));

    return [...mapped, { label: "More", items: rest }].filter(
      (group) => group.items.length > 0
    );
  }, [items]);

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isBranchActive = (item: any) =>
    isActive(item.path) ||
    Boolean(item.children?.some((child: any) => isActive(child.path)));

  /* Keep the branch holding the current route expanded. */
  useEffect(() => {
    const openBranch = items.find(
      (item: any) => item.children && isBranchActive(item)
    );
    if (openBranch) {
      setOpenItems((prev) => ({ ...prev, [openBranch.title]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, items]);

  const displayName = user?.displayName || accountEmail || "Admin user";

  return (
    <Stack sx={{ height: 1, color: tokens.text }}>
      {/* ---------------- BRAND ---------------- */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={isCollapsed ? "center" : "space-between"}
        sx={{ px: isCollapsed ? 1 : 2.5, pt: 3, pb: 2.5, flexShrink: 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2,
              backgroundColor: tokens.brandTile,
              border: `1px solid ${tokens.surfaceBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: tokens.brandShadow,
            }}
          >
            {logoFailed ? (
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1,
                  background: "linear-gradient(150deg, #F7B32B 0%, #EF8B1F 45%, #4B2A8C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                S
              </Typography>
            ) : (
              <Box
                component="img"
                src={BRAND_LOGO}
                alt={BRAND_NAME}
                onError={() => setLogoFailed(true)}
                sx={{ width: 30, height: 30 }}
              />
            )}
          </Box>

          {!isCollapsed && (
            <Typography
              noWrap
              sx={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.4px" }}
            >
              {BRAND_NAME}
            </Typography>
          )}
        </Stack>

        {!isCollapsed && (
          <Stack direction="row" alignItems="center" spacing={0.25}>
            {/* Notifications belong with the other global chrome, not buried
                inside the identity block. */}
            <Box sx={{ color: tokens.textMuted, display: "flex" }}>
              <NotificationsPopover />
            </Box>

            {toggleCollapse && (
              <IconButton
                onClick={toggleCollapse}
                size="small"
                sx={{
                  color: tokens.textMuted,
                  "&:hover": { color: tokens.text },
                }}
              >
                <MenuOpenIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        )}
      </Stack>

      {isCollapsed && toggleCollapse && (
        <Box sx={{ display: "flex", justifyContent: "center", pb: 1.5 }}>
          <IconButton
            onClick={toggleCollapse}
            size="small"
            sx={{ color: tokens.textMuted, "&:hover": { color: tokens.text } }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* ---------------- IDENTITY STRIP ----------------
          Replaces the old boxed avatar-left / bell-right account card.

          Structure now reads top-to-bottom instead of left-to-right: a muted
          eyebrow says what the block IS, the identity itself gets the full
          width so long emails stop truncating at ten characters, and the role
          is a tinted pill rather than grey caption text. The avatar moved to
          the trailing edge - it is a menu trigger, not the headline - and the
          bell moved out entirely, up to the brand row. The bordered card is
          gone in favour of a brand accent rail, so the block reads as part of
          the sidebar rather than a widget sitting on top of it. */}
      {!isCollapsed ? (
        <Box sx={{ mx: 2.5, mb: 2.5, flexShrink: 0, display: "flex" }}>
          <Box
            sx={{
              width: 3,
              flexShrink: 0,
              borderRadius: 3,
              background: `linear-gradient(180deg, ${tokens.accent} 0%, ${alpha(
                tokens.accent,
                0.25
              )} 100%)`,
            }}
          />

          <Box sx={{ pl: 1.75, minWidth: 0, flexGrow: 1 }}>
            <Typography
              sx={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: tokens.label,
              }}
            >
              Signed in
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 0.5, minWidth: 0 }}
            >
              <Tooltip title={displayName} placement="right" arrow>
                <Typography
                  noWrap
                  sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "-0.2px",
                    color: tokens.text,
                  }}
                >
                  {displayName}
                </Typography>
              </Tooltip>

              {/* Trailing avatar: still the profile / logout menu trigger. */}
              <Box sx={{ flexShrink: 0, display: "flex" }}>
                <AccountPopover />
              </Box>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ mt: 0.85 }}
              flexWrap="wrap"
              useFlexGap
            >
              <Box
                sx={{
                  px: 0.9,
                  py: 0.2,
                  borderRadius: 0.75,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: tokens.activeText,
                  backgroundColor: tokens.active,
                }}
              >
                {roleLabel}
              </Box>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: tokens.live,
                  }}
                />
                <Typography
                  sx={{ fontSize: 10.5, fontWeight: 600, color: tokens.textMuted }}
                >
                  Active
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Stack spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Tooltip title={`${displayName} · ${roleLabel}`} placement="right" arrow>
            <Box sx={{ display: "flex" }}>
              <AccountPopover />
            </Box>
          </Tooltip>
          <Box sx={{ color: tokens.textMuted }}>
            <NotificationsPopover />
          </Box>
        </Stack>
      )}

      {/* ---------------- NAVIGATION ---------------- */}
      <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex" }}>
        <Scrollbar
          sx={{
            height: 1,
            width: 1,
            "& .simplebar-scrollbar:before": {
              backgroundColor: tokens.scrollThumb,
            },
          }}
        >
          <Stack sx={{ px: isCollapsed ? 1.5 : 2.5, pb: 2 }} spacing={2.5}>
            {groups.map((group) => (
              <Box key={group.label}>
                {!isCollapsed ? (
                  <Typography
                    sx={{
                      px: 1.25,
                      mb: 1.25,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1.1,
                      textTransform: "uppercase",
                      color: tokens.label,
                    }}
                  >
                    {group.label}
                  </Typography>
                ) : (
                  <Box
                    sx={{ mb: 1.5, height: "1px", backgroundColor: tokens.border }}
                  />
                )}

                <Stack spacing={0.75}>
                  {group.items.map((item: any) => {
                    const active = isBranchActive(item);
                    const open = Boolean(openItems[item.title]);

                    if (item.children?.length) {
                      return (
                        <Box key={item.title}>
                          <NavRow
                            tokens={tokens}
                            title={NAV_META[item.title]?.label || translate(item.title)}
                            icon={NAV_META[item.title]?.icon || item.icon}
                            info={item.info}
                            active={active}
                            collapsed={isCollapsed}
                            hasChildren
                            open={open}
                            onClick={() =>
                              setOpenItems((prev) => ({
                                ...prev,
                                [item.title]: !prev[item.title],
                              }))
                            }
                          />

                          {!isCollapsed && (
                            <Collapse in={open} unmountOnExit>
                              <Stack
                                spacing={0.25}
                                sx={{
                                  mt: 0.75,
                                  ml: 3,
                                  pl: 2,
                                  borderLeft: `1px solid ${tokens.border}`,
                                }}
                              >
                                {item.children.map((child: any) => {
                                  const childActive = isActive(child.path);
                                  return (
                                    <ButtonBase
                                      key={child.title}
                                      component={RouterLink}
                                      to={child.path}
                                      sx={{
                                        px: 1.25,
                                        py: 0.85,
                                        borderRadius: 1.5,
                                        justifyContent: "flex-start",
                                        color: childActive
                                          ? tokens.activeText
                                          : tokens.textMuted,
                                        backgroundColor: childActive
                                          ? tokens.active
                                          : "transparent",
                                        "&:hover": {
                                          backgroundColor: tokens.surfaceHover,
                                        },
                                      }}
                                    >
                                      <Typography
                                        noWrap
                                        sx={{
                                          fontSize: 13.5,
                                          fontWeight: childActive ? 600 : 500,
                                          textAlign: "left",
                                        }}
                                      >
                                        {NAV_CHILD_LABELS[child.title] ||
                                          translate(child.title)}
                                      </Typography>
                                    </ButtonBase>
                                  );
                                })}
                              </Stack>
                            </Collapse>
                          )}
                        </Box>
                      );
                    }

                    return (
                      <NavRow
                        key={item.title}
                        tokens={tokens}
                        title={NAV_META[item.title]?.label || translate(item.title)}
                        icon={NAV_META[item.title]?.icon || item.icon}
                        info={item.info}
                        active={active}
                        collapsed={isCollapsed}
                        to={item.path}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </Box>

    </Stack>
  );
}
