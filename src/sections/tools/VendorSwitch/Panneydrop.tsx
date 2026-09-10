import { useCallback, useEffect, useState } from "react";
// @mui
import { Box, MenuItem, TextField } from "@mui/material";
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
// Vendor Switch > Penny drop.
//
// Presentation only. Same three endpoints, same bodies:
//
//   GET  admin/vendor/penny_drop/list    -> [{ _id, vendorName }]
//   GET  admin/vendor/penny_drop/active  -> { API_User, Distribution_Network }
//   POST admin/vendor/penny_drop/switch  { vendorType, vendorID }
//
// Both lanes are saved independently, one POST each, exactly as before - the
// old screen had two Edit/Save buttons crammed into a single row with the two
// selects; here each lane owns its own action.
// ----------------------------------------------------------------------

type Vendor = { _id: string; vendorName: string };

type Lane = {
  vendorType: string;
  vendorID: string;
  vendorName: string;
};

const EMPTY: Lane = { vendorType: "", vendorID: "", vendorName: "" };

export default function Panneydrop() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [vlist, setVList] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [apiUser, setApiUser] = useState<Lane>(EMPTY);
  const [network, setNetwork] = useState<Lane>(EMPTY);

  const [editingApiUser, setEditingApiUser] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState(false);
  const [saving, setSaving] = useState(false);

  const getAPIDocumentation = useCallback(() => {
    const token = localStorage.getItem("token");
    Api(`admin/vendor/penny_drop/list`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          setVList(Response.data.data || []);
        }
        setIsLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userActive = useCallback(() => {
    const token = localStorage.getItem("token");
    Api(`admin/vendor/penny_drop/active`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          setApiUser({
            vendorType: "API_User",
            vendorID: Response.data.data.API_User._id,
            vendorName: Response.data.data.API_User.vendorName,
          });
          setNetwork({
            vendorType: "Distribution_Network",
            vendorID: Response.data.data.Distribution_Network._id,
            vendorName: Response.data.data.Distribution_Network.vendorName,
          });
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAPIDocumentation();
    userActive();
  }, [getAPIDocumentation, userActive]);

  const SetVender = (lane: Lane) => {
    const token = localStorage.getItem("token");
    setSaving(true);

    const body = {
      vendorType: lane.vendorType,
      vendorID: lane.vendorID,
    };

    Api("admin/vendor/penny_drop/switch", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setEditingApiUser(false);
          setEditingNetwork(false);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        enqueueSnackbar(Response.data.message);
        setSaving(false);
      }
    );
  };

  if (isLoading) return <LoadingState label="Loading penny drop vendors..." />;

  return (
    <Box sx={{ maxWidth: 760 }}>
      <FormCard
        title="Penny drop vendors"
        subtitle="Which provider runs the penny-drop account check for each customer lane."
      >
        <LaneRow
          label="API User"
          hint="Partners integrating over the public API."
          lane={apiUser}
          vendors={vlist}
          isEditing={editingApiUser}
          saving={saving}
          onEdit={() => setEditingApiUser(true)}
          onChange={(vendor) =>
            setApiUser({
              vendorType: "API_User",
              vendorID: vendor._id,
              vendorName: vendor.vendorName,
            })
          }
          onSave={() => SetVender(apiUser)}
        />

        <LaneRow
          label="Distribution Network"
          hint="Retail network users on the platform."
          lane={network}
          vendors={vlist}
          isEditing={editingNetwork}
          saving={saving}
          divider={false}
          onEdit={() => setEditingNetwork(true)}
          onChange={(vendor) =>
            setNetwork({
              vendorType: "Distribution_Network",
              vendorID: vendor._id,
              vendorName: vendor.vendorName,
            })
          }
          onSave={() => SetVender(network)}
        />
      </FormCard>
    </Box>
  );
}

// ----------------------------------------------------------------------

function LaneRow({
  label,
  hint,
  lane,
  vendors,
  isEditing,
  saving,
  divider = true,
  onEdit,
  onChange,
  onSave,
}: {
  label: string;
  hint: string;
  lane: Lane;
  vendors: Vendor[];
  isEditing: boolean;
  saving: boolean;
  divider?: boolean;
  onEdit: () => void;
  onChange: (vendor: Vendor) => void;
  onSave: () => void;
}) {
  return (
    <VendorLane label={label} hint={hint} divider={divider}>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        {isEditing ? (
          <>
            <TextField
              select
              size="small"
              label="Vendor"
              value={lane.vendorID || ""}
              onChange={(event) => {
                const vendor = vendors.find(
                  (item) => item._id === event.target.value
                );
                if (vendor) onChange(vendor);
              }}
              sx={{ minWidth: 200, flexGrow: 1 }}
              SelectProps={{ sx: { textTransform: "capitalize" } }}
            >
              {vendors.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.vendorName}
                </MenuItem>
              ))}
            </TextField>

            <PageActionButton
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={saving || !lane.vendorID}
            >
              Save
            </PageActionButton>
          </>
        ) : (
          <>
            <VendorValue value={lane.vendorName} />
            <PageGhostButton startIcon={<EditIcon />} onClick={onEdit}>
              Edit
            </PageGhostButton>
          </>
        )}
      </Box>
    </VendorLane>
  );
}
