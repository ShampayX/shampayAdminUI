import React, { useState } from "react";
// @mui
import {
  Chip,
  Modal,
  Stack,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useNavigate } from "react-router-dom";
// components
import { useSnackbar } from "../../../components/snackbar";
import { PATH_DASHBOARD } from "src/routes/paths";
import { fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  KitRow,
  CopyText,
  ModalShell,
  PageGhostButton,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// One bill payment plan.
//
// `bbpsManagement/bbpsScheme/schemes` returns schemeId, schemeType,
// schemeDescription and createdAt. There is no status, provider or commission
// summary on the list payload - commissions live inside the plan itself, which
// View opens - so this row shows none of those.
//
// Edit updates the description via `bbpsManagement/bbpsScheme/edit/:id`.
// Download hits the plan export endpoint for its audience.
// ----------------------------------------------------------------------

export type BbpsSchemeRow = {
  _id: string;
  schemeId: string;
  schemeType: string;
  schemeDescription: string;
  createdAt: string;
  role?: string;
};

/** Audience a plan is written for. */
const TYPE_LABELS: Record<string, string> = {
  neonetwork: "Distribution Network",
  apiuser: "API User",
  directagent: "Direct Agent",
};

export const bbpsTypeLabel = (type: string) =>
  TYPE_LABELS[type] || type || "N/A";

/** Path segment the download endpoint expects per audience. */
const DOWNLOAD_SEGMENT: Record<string, string> = {
  neonetwork: "distribution",
  apiuser: "apiUser",
  directagent: "directagent",
};

export default function ViewBBPSSchemeRow({
  row,
  onUpdated,
}: {
  row: BbpsSchemeRow;
  onUpdated?: () => void;
}) {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(row.schemeDescription || "");
  const [saving, setSaving] = useState(false);

  const setDes = () => {
    if (!description.trim()) {
      setOpen(false);
      return;
    }

    setSaving(true);
    const body = { schemeDescription: description };
    Api(`bbpsManagement/bbpsScheme/edit/` + row._id, "POST", body, "")
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          enqueueSnackbar("Description update Successfull !");
          setOpen(false);
          onUpdated?.();
        } else {
          enqueueSnackbar(Response?.data?.message || "Could not update", {
            variant: "error",
          });
        }
        setSaving(false);
      })
      .catch(() => {
        enqueueSnackbar("Could not update", { variant: "error" });
        setSaving(false);
      });
  };

  const openPlan = () => {
    navigate(PATH_DASHBOARD.scheme.EditBBPSScheme, {
      state: { rowDetail: row },
    });
  };

  const downloadPlan = () => {
    const segment = DOWNLOAD_SEGMENT[row.schemeType];
    if (!segment) {
      enqueueSnackbar("This plan type has no export", { variant: "warning" });
      return;
    }
    window.open(
      process.env.REACT_APP_BASE_URL +
        `bbpsManagement/bbpsScheme/download_scheme/${segment}/${row._id}`
    );
  };

  return (
    <>
      <KitRow>
        <TableCell>
          <CopyText value={row.schemeId}>
            <Typography
              sx={{ fontSize: 13.5, fontWeight: 700, fontFamily: "monospace" }}
            >
              {row.schemeId || "-"}
            </Typography>
          </CopyText>
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            variant="outlined"
            color={row.schemeType ? "primary" : "default"}
            label={bbpsTypeLabel(row.schemeType)}
            sx={{ fontSize: 11, fontWeight: 600 }}
          />
        </TableCell>

        <TableCell sx={{ maxWidth: 380 }}>
          <Typography sx={{ fontSize: 13.5 }}>
            {row.schemeDescription || "—"}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 13 }}>
            {row.createdAt ? fDateTime(row.createdAt) : "-"}
          </Typography>
        </TableCell>

        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <PageGhostButton
              startIcon={<EditOutlinedIcon />}
              onClick={() => {
                setDescription(row.schemeDescription || "");
                setOpen(true);
              }}
            >
              Edit
            </PageGhostButton>
            <PageGhostButton
              startIcon={<VisibilityOutlinedIcon />}
              onClick={openPlan}
            >
              View
            </PageGhostButton>
            <PageGhostButton
              startIcon={<DownloadOutlinedIcon />}
              onClick={downloadPlan}
            >
              Export
            </PageGhostButton>
          </Stack>
        </TableCell>
      </KitRow>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalShell
          title="Edit Bill Payment Plan"
          subtitle={`${row.schemeId} • ${bbpsTypeLabel(row.schemeType)}`}
          onClose={() => setOpen(false)}
          width={560}
          actions={
            <>
              <LoadingButton
                variant="outlined"
                color="inherit"
                onClick={() => setOpen(false)}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                variant="contained"
                loading={saving}
                disabled={!description.trim()}
                onClick={setDes}
              >
                Save
              </LoadingButton>
            </>
          }
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              name="dis"
              label="Plan Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Commissions and slabs are edited inside the plan - use View."
            />
          </Stack>
        </ModalShell>
      </Modal>
    </>
  );
}
