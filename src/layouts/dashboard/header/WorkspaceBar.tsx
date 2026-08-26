import { useEffect, useState } from "react";
// @mui
import {
  Box,
  Stack,
  Table,
  Paper,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  ButtonBase,
  Tooltip,
  TableContainer,
} from "@mui/material";
import { alpha, getContrastRatio, useTheme } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
// auth
import { useAuthContext } from "../../../auth/useAuthContext";
// components
import MotionModal from "../../../components/animate/MotionModal";
import ApiDataLoading from "../../../components/CustomFunction/ApiDataLoading";
import { useSettingsContext } from "../../../components/settings";
// utils
import { fIndianCurrency } from "../../../utils/formatNumber";

// ----------------------------------------------------------------------

// The vendor balance modal is a fixed two-column table; the skeleton needs the
// same shape so the modal does not resize when the balances land.
const VENDOR_BALANCE_COLUMNS = [
  { id: "vendorName", label: "Vendor Name" },
  { id: "vendorBalance", label: "Vendor Balance", align: "right" as const },
];

/**
 * Floating cluster pinned to the top-right of the content column: platform
 * float, vendor balances, theme mode and colour preset. Keeps the sidebar
 * free of chrome.
 */
export default function WorkspaceBar() {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const {
    themeMode,
    onChangeMode,
    themeColorPresets,
    onChangeColorPresets,
  } = useSettingsContext();

  const isLight = theme.palette.mode === "light";
  /* Readable shade of the accent: keep `main` when it carries enough contrast
     on a light surface, otherwise step down to the preset's darker shade. */
  const accentInk = isLight
    ? getContrastRatio(theme.palette.primary.main, "#FFFFFF") >= 4.5
      ? theme.palette.primary.main
      : (theme.palette.primary as any).darker || theme.palette.primary.dark
    : theme.palette.primary.light;

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [Ambika, setAmbika] = useState<string>("");
  const [RupeeBiz, setRupeeBiz] = useState<string>("");
  const [DecentroIdfc, setDecentroIdfc] = useState<string>("");
  const [Plural, setPlural] = useState<string>("");
  const [InstantPay, setInstantPay] = useState<string>("");
  const [Finzep, setFinzep] = useState<string>("");
  const [AeronPay, setAeronPay] = useState<string>("");
  const [Castler, setCastler] = useState<string>("");

  const [allUserBalance, setAllUserBalance] = useState<{
    total_main_wallet_amount?: number;
    total_aeps_wallet_amount?: number;
  }>({});

  /* ---------------- platform float ---------------- */

  const allUserBalances = () => {
    const token = localStorage.getItem("token");

    Api("admin/API_User_Management/getAllUsersWalletBalance", "GET", "", token)
      .then((Response: any) => {
        if (Response?.data?.success === true && Response.data.code === 200) {
          setAllUserBalance(Response.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    allUserBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- vendor balances ---------------- */

  const readVendor = (endpoint: string, setter: (value: string) => void) => {
    const token = localStorage.getItem("token");

    return Api(endpoint, "GET", "", token).then((Response: any) => {
      if (Response?.status === 200 && Response.data?.code === 200) {
        setter(Response.data.data);
      }
    });
  };

  const FinzepVendor = () => {
    const token = localStorage.getItem("token");

    return Api("finzepBalance", "GET", "", token).then((Response: any) => {
      if (Response?.status === 200 && Response.data?.data?.errorcode === "200") {
        setFinzep(Response.data.data.bal);
      }
    });
  };

  const castlerVendor = () => {
    const token = localStorage.getItem("token");

    return Api("castlerBalance", "GET", "", token).then((Response: any) => {
      if (Response?.status === 200) {
        try {
          const parsedData = JSON.parse(Response.data.data);
          if (parsedData?.success) {
            setCastler(parsedData.result.balance);
          }
        } catch (err) {
          console.error("JSON parse error:", err);
        }
      }
    });
  };

  const openVendorBalances = () => {
    setIsModalOpen(true);
    setIsLoading(true);

    Promise.allSettled([
      readVendor("vendor/getAmbikaVendorBalance", setAmbika),
      readVendor("vendor/getRupeeBizVendorBalance", setRupeeBiz),
      readVendor("vendor/getDecentroIdfcVendorBalance", setDecentroIdfc),
      readVendor("vendor/getPluralVendorBalance", setPlural),
      readVendor("vendor/getInstantPayVendorBalance", setInstantPay),
      readVendor("vendor/aeronPayVendorBalance", setAeronPay),
      FinzepVendor(),
      castlerVendor(),
    ]).finally(() => setIsLoading(false));
  };

  const vendorRows = [
    { name: "Ambika", value: +Ambika },
    { name: "RupeeBiz", value: +RupeeBiz },
    { name: "Decentro IDFC", value: +DecentroIdfc },
    { name: "Plural", value: +Plural || 0 },
    { name: "Instant Pay", value: +InstantPay },
    { name: "Finzep", value: +Finzep },
    { name: "Castler", value: +Castler },
    { name: "AeronPay", value: +AeronPay },
  ];

  /* ---------------- settings ---------------- */

  const setMode = (mode: "light" | "dark") =>
    onChangeMode({ target: { value: mode } } as any);

  const setPreset = (preset: string) =>
    onChangeColorPresets({ target: { value: preset } } as any);

  /* "Color" restores the configured brand preset (REACT_APP_PRESET), "Plain"
     swaps it for neutral graphite. Both defined in components/settings/presets. */
  const isPlain = themeColorPresets === "plain";

  /* ---------------- pieces ---------------- */

  const Balance = ({ label, value }: { label: string; value: number }) => (
    <Box sx={{ px: 1.25 }}>
      <Typography
        sx={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 0.9,
          lineHeight: 1.4,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>
        ₹ {fIndianCurrency(value || 0)}
      </Typography>
    </Box>
  );

  const SegmentedIcon = ({
    title,
    icon,
    selected,
    onClick,
  }: {
    title: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
  }) => (
    <Tooltip title={title}>
      <ButtonBase
        onClick={onClick}
        aria-label={title}
        sx={{
          width: 32,
          height: 30,
          borderRadius: 99,
          color: selected ? accentInk : theme.palette.text.secondary,
          backgroundColor: selected ? theme.palette.background.paper : "transparent",
          boxShadow: selected
            ? isLight
              ? "0 1px 4px rgba(15,23,42,0.16)"
              : "0 1px 4px rgba(0,0,0,0.5)"
            : "none",
          transition: "all 0.2s ease",
          "& svg": { fontSize: 16 },
        }}
      >
        {icon}
      </ButtonBase>
    </Tooltip>
  );

  const trackSx = {
    p: 0.35,
    borderRadius: 99,
    backgroundColor: alpha(theme.palette.grey[500], isLight ? 0.12 : 0.2),
  };

  const iconButtonSx = {
    width: 34,
    height: 34,
    color: "text.secondary",
    "&:hover": { color: "text.primary" },
  };

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 12,
          zIndex: 1100,
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
          pointerEvents: "none",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            p: 0.75,
            pointerEvents: "auto",
            borderRadius: 99,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isLight
              ? "0 6px 24px rgba(15, 23, 42, 0.1)"
              : "0 6px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* float */}
          <Stack
            direction="row"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <Balance label="Main" value={allUserBalance.total_main_wallet_amount || 0} />
            <Balance label="AEPS" value={allUserBalance.total_aeps_wallet_amount || 0} />
          </Stack>

          <Tooltip title="Refresh balances">
            <IconButton onClick={allUserBalances} sx={iconButtonSx}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Vendor balances">
            <IconButton onClick={openVendorBalances} sx={iconButtonSx}>
              <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />

          {/* theme mode */}
          <Stack direction="row" spacing={0.25} sx={trackSx}>
            <SegmentedIcon
              title="Dark theme"
              icon={<DarkModeOutlinedIcon />}
              selected={themeMode === "dark"}
              onClick={() => setMode("dark")}
            />
            <SegmentedIcon
              title="Light theme"
              icon={<LightModeOutlinedIcon />}
              selected={themeMode === "light"}
              onClick={() => setMode("light")}
            />
          </Stack>

          {/* colour preset */}
          <Stack direction="row" spacing={0.25} sx={trackSx}>
            <SegmentedIcon
              title="Brand colour"
              icon={<PaletteOutlinedIcon />}
              selected={!isPlain}
              onClick={() => setPreset("default")}
            />
            <SegmentedIcon
              title="Plain colour"
              icon={<RadioButtonUncheckedIcon />}
              selected={isPlain}
              onClick={() => setPreset("plain")}
            />
          </Stack>
        </Stack>
      </Box>

      <MotionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="Vendor Wallet Modal"
      >
        {isLoading ? (
          <ApiDataLoading
            variant="table"
            columns={VENDOR_BALANCE_COLUMNS}
            rows={6}
            minWidth={360}
          />
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Typography sx={{ px: 2, pt: 2, fontSize: 16, fontWeight: 700 }}>
              Vendor Balances
            </Typography>
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor Name</TableCell>
                  <TableCell align="right">Vendor Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{fIndianCurrency(row.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
              <LoadingButton variant="contained" onClick={() => setIsModalOpen(false)}>
                Close
              </LoadingButton>
            </Box>
          </TableContainer>
        )}
      </MotionModal>
    </>
  );
}
