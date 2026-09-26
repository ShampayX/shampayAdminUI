import { useCallback, useEffect, useState } from "react";
// @mui
import {
  Box,
  Stack,
  Switch,
  MenuItem,
  TextField,
  SwitchProps,
  styled,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  FormCard,
  PageActionButton,
  PageGhostButton,
  LoadingState,
} from "src/components/page-kit";
//
import { VendorLane, VendorValue } from "./VendorLane";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------
// Vendor Switch > KYC.
//
// Presentation only. Same four endpoints, same bodies:
//
//   GET  admin/get_KYC_Vendor          -> { data: string[], activeVendor }
//   POST admin/set_KYC_Vendor          { vendorName }
//   GET  admin/get_kyc_switch_offline  -> { isAadhaarOffline }
//   POST admin/kyc_switch_office       { isAadhaarOffline: !current }
//
// The settlement-vendor block on this screen was already commented out
// upstream. Its `admin/get_settlement_vendor` fetch is kept so the page still
// makes the same calls it did, and the note below records why it looks unused.
// ----------------------------------------------------------------------

/** Track uses semantic success/error instead of the hardcoded #65C466 / #ff0000. */
const StatusSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.success.main,
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.5 },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.success.light,
      border: `6px solid ${theme.palette.common.white}`,
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
    backgroundColor: theme.palette.common.white,
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: alpha(theme.palette.error.main, 0.55),
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default function PartnerBilling() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [vlist, setVList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [oflineaadhar, setAadharOfline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getAPIDocumentation = useCallback(() => {
    Api(`admin/get_KYC_Vendor`, "GET", "", "").then((Response: any) => {
      if (Response?.status === 200 && Response.data.code === 200) {
        setVList(Response.data.data || []);
        setInputValue(Response.data.activeVendor);
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The settlement vendor select is commented out upstream, but the call it
     fed is left in place so the page's request footprint is unchanged. */
  const SellementVendor = useCallback(() => {
    const token = localStorage.getItem("token");
    Api(`admin/get_settlement_vendor`, "GET", "", token).then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAPIDocumentation();
    SellementVendor();
  }, [getAPIDocumentation, SellementVendor]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Api(`admin/get_kyc_switch_offline`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          setAadharOfline(Response?.data?.isAadhaarOffline);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SetVender = () => {
    setIsSaving(true);
    const body = {
      vendorName: inputValue,
    };

    Api("admin/set_KYC_Vendor", "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        setIsEditing(false);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      enqueueSnackbar(Response.data.message);
      setIsSaving(false);
    });
  };

  const updateStatus = () => {
    const body = {
      isAadhaarOffline: !oflineaadhar,
    };
    const token = localStorage.getItem("token");

    Api("admin/kyc_switch_office", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setAadharOfline(Response?.data?.isAadhaarOffline);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        enqueueSnackbar(Response.data.message);
      }
    );
  };

  if (isLoading) return <LoadingState label="Loading KYC vendors..." />;

  return (
    <Box sx={{ maxWidth: 760 }}>
      <FormCard
        title="KYC vendor"
        subtitle="Which provider runs KYC checks, and how Aadhaar verification is handled."
        actions={
          isEditing ? (
            <PageActionButton
              startIcon={<SaveIcon />}
              onClick={SetVender}
              disabled={isSaving}
            >
              Save
            </PageActionButton>
          ) : (
            <PageGhostButton
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </PageGhostButton>
          )
        }
      >
        <VendorLane
          label="Active vendor"
          hint="Handles every KYC verification request."
        >
          {isEditing ? (
            <TextField
              select
              fullWidth
              size="small"
              label="Active vendor"
              value={inputValue || ""}
              onChange={(event) => setInputValue(event.target.value)}
              SelectProps={{ sx: { textTransform: "capitalize" } }}
            >
              {vlist.map((item: any) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <VendorValue value={inputValue} />
          )}
        </VendorLane>

        <VendorLane
          label="Aadhaar offline"
          hint="On routes Aadhaar checks through the offline flow."
          divider={false}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <StatusSwitch
              checked={oflineaadhar}
              onChange={updateStatus}
              inputProps={{ "aria-label": "Aadhaar offline switch" }}
            />
            <VendorValue value={oflineaadhar ? "On" : "Off"} />
          </Stack>
        </VendorLane>
      </FormCard>
    </Box>
  );
}
