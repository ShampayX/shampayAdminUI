// @mui
import { alpha, useTheme } from "@mui/material/styles";
import {
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableCell,
  Box,
  TableRow,
  TableBody,
  Typography,
  Button,
  Tooltip,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
// hooks
import useOffSetTop from "../../../hooks/useOffSetTop";
import useResponsive from "../../../hooks/useResponsive";
// config
import { HEADER, NAV } from "../../../config";
// components
import Logo from "../../../components/logo";
import Iconify from "../../../components/iconify";
import { useSettingsContext } from "../../../components/settings";
//
import AccountPopover from "./AccountPopover";
import NotificationsPopover from "./NotificationsPopover";
import { fIndianCurrency } from "src/utils/formatNumber";
import { useAuthContext } from "src/auth/useAuthContext";
import { useEffect, useState } from "react";
import MotionModal from "src/components/animate/MotionModal";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { LoadingButton } from "@mui/lab";

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
  isCollapsed?: boolean;
};

// The vendor balance modal is a fixed two-column table; the skeleton needs the
// same shape so the modal does not resize when the balances land.
const VENDOR_BALANCE_COLUMNS = [
  { id: "vendorName", label: "Vendor Name" },
  { id: "vendorBalance", label: "Vendor Balance", align: "right" as const },
];

export default function Header({ onOpenNav, isCollapsed = false }: Props) {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [vendorList, setVendorList] = useState<string>("");
  const [Ambika, setAmbika] = useState<string>("");
  const [RupeeBiz, setRupeeBiz] = useState<string>("");
  const [DecentroIdfc, setDecentroIdfc] = useState<string>("");
  const [DecentroAxis, setDecentroAxis] = useState<string>("");
  const [Plural, setPlural] = useState<string>("");
  const [InstantPay, setInstantPay] = useState<string>("");
  const [Finzep, setFinzep] = useState<string>("");
  const [AeronPay, setAeronPay] = useState<string>("");
  const [Castler, setCastler] = useState<string>("");
  const [allUserBalance, setAllUserBalance] = useState<{
    total_main_wallet_amount?: number;
    total_aeps_wallet_amount?: number;
  }>({});

  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout == "horizontal";

  const isNavMini = themeLayout == "mini";

  const isDesktop = useResponsive("up", "lg");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const isOffset = useOffSetTop(HEADER.H_DASHBOARD_DESKTOP) && !isNavHorizontal;
  const isTablet = useResponsive("up", "sm");

  const isLight = theme.palette.mode === "light";
  const navWidth = isCollapsed ? 88 : NAV.W_DASHBOARD;

  useEffect(() => {
    allUserBalances();
  }, []);

  function getBalance() {
    openModal();
    getVendor();
    AmbikaVendor();
    RupeeBizVendor();
    DecentroIdfcVendor();
    DecentroAxisVendor();
    PluralVendor();
    InstantPayVendor();
    FinzepVendor();
    castlerVendor();
    AronPay();
  }

  const getVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getAirtelVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setVendorList(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const AronPay = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/aeronPayVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setAeronPay(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const AmbikaVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getAmbikaVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setAmbika(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const RupeeBizVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getRupeeBizVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setRupeeBiz(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const DecentroIdfcVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getDecentroIdfcVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setDecentroIdfc(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const DecentroAxisVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getDecentroAxisVednorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setDecentroAxis(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const PluralVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getPluralVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setPlural(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const InstantPayVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`vendor/getInstantPayVendorBalance`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setInstantPay(Response.data.data);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    );
  };

  const FinzepVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");

    Api(`finzepBalance`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data?.data?.errorcode === "200") {
          setFinzep(Response.data.data.bal);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  };

  const castlerVendor = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");

    Api(`castlerBalance`, "GET", "", token).then((Response: any) => {
      if (Response?.status === 200) {
        try {
          const parsedData = JSON.parse(Response.data.data);

          if (parsedData?.success) {
            setCastler(parsedData.result.balance);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        } catch (err) {
          console.error("JSON parse error:", err);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  };

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

  /* ---------------- wallet chip ---------------- */

  const WalletChip = ({
    label,
    value,
    icon,
    tone,
  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    tone: string;
  }) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        px: 2,
        py: 1,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: isLight
          ? alpha(theme.palette.grey[500], 0.04)
          : alpha(theme.palette.common.white, 0.03),
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tone,
          backgroundColor: alpha(tone, 0.12),
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: "text.secondary",
            lineHeight: 1.4,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
          ₹ {fIndianCurrency(value || 0)}
        </Typography>
      </Box>
    </Stack>
  );

  const renderContent = (
    <>
      {isDesktop && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!isDesktop && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1, color: "text.primary" }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
      )}

      {isTablet && (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <WalletChip
            label="Main Wallet"
            value={allUserBalance.total_main_wallet_amount || 0}
            icon={<AccountBalanceWalletOutlinedIcon />}
            tone={theme.palette.primary.main}
          />
          <WalletChip
            label="AEPS Wallet"
            value={allUserBalance.total_aeps_wallet_amount || 0}
            icon={<SavingsOutlinedIcon />}
            tone={theme.palette.warning.main}
          />

          <Tooltip title="Refresh wallet balances">
            <IconButton
              onClick={allUserBalances}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                width: 40,
                height: 40,
              }}
            >
              <RefreshIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1.5 }}
      >
        {isTablet ? (
          <>
            <Button
              onClick={getBalance}
              startIcon={<AccountBalanceOutlinedIcon />}
              sx={{
                px: 2,
                height: 40,
                borderRadius: 2,
                fontWeight: 600,
                color: "text.primary",
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.grey[500], 0.08),
                },
              }}
            >
              Vendor Balance
            </Button>

            <MotionModal
              open={isModalOpen}
              onClose={closeModal}
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
                      <TableRow>
                        <TableCell>Ambika</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+Ambika)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>RupeeBiz</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+RupeeBiz)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Decentro IDFC</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+DecentroIdfc)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Plural</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+Plural || 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Instant Pay</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+InstantPay)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Finzep</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+Finzep)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Castler</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+Castler)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>AeronPay</TableCell>
                        <TableCell align="right">
                          {fIndianCurrency(+AeronPay)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                    <LoadingButton variant="contained" onClick={closeModal}>
                      Close
                    </LoadingButton>
                  </Box>
                </TableContainer>
              )}
            </MotionModal>

            <NotificationsPopover />
            <AccountPopover />
          </>
        ) : (
          <AccountPopover />
        )}
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: "none",
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        transition: theme.transitions.create(["height", "width"], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(isDesktop && {
          width: `calc(100% - ${navWidth}px)`,
          height: HEADER.H_DASHBOARD_DESKTOP,
          ...(isOffset && {
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { xs: 2, lg: 4 },
          gap: 1.5,
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
