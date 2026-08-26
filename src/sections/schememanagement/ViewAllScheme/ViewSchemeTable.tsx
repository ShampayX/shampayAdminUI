import { useState } from "react";
// @mui
import {
  Box,
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
// One scheme in the catalog.
//
// `scheme/list/fetch` returns schemeID, schemeType, schemeDescription and
// createdOn. There is no status field, so the catalog has no active/inactive
// state and no enable/disable action.
//
// Edit updates the description via `scheme/edit_scheme/:id`; View opens the
// full scheme editor page, which is where rates are configured.
// ----------------------------------------------------------------------

export type SchemeRowProps = {
  _id: string;
  schemeID: string;
  schemeType: string;
  schemeDescription: string;
  createdOn: string;
};

/** Audience a scheme is written for. */
const TYPE_LABELS: Record<string, string> = {
  apiuser: "API User",
  neonetwork: "Distribution Network",
  directagent: "Direct Agent",
};

export const schemeTypeLabel = (type: string) =>
  TYPE_LABELS[type] || type || "N/A";

export default function SchemeRow({
  row,
  onUpdated,
}: {
  row: SchemeRowProps;
  onUpdated?: () => void;
}) {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [editDescription, setEditDescription] = useState(
    row.schemeDescription || ""
  );
  const [saving, setSaving] = useState(false);

  const handleEditSubmit = () => {
    if (!editDescription) return;

    setSaving(true);
    const body = { schemeDescription: editDescription };
    Api(`scheme/edit_scheme/${row._id}`, "POST", body, "")
      .then((res: any) => {
        if (res?.status === 200 && res.data.code === 200) {
          enqueueSnackbar("Description updated successfully!");
          setOpen(false);
          /* The old code called window.location.reload() here, which threw away
             the filters and the page position. */
          onUpdated?.();
        } else {
          enqueueSnackbar(res?.data?.message || "Could not update", {
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

  const openScheme = () => {
    localStorage.setItem("schId", row._id);
    navigate(PATH_DASHBOARD.scheme.EditScheme, { state: { rowD: row } });
  };

  return (
    <>
      <KitRow>
        <TableCell>
          <CopyText value={row.schemeID}>
            <Typography
              sx={{ fontSize: 13.5, fontWeight: 700, fontFamily: "monospace" }}
            >
              {row.schemeID || "-"}
            </Typography>
          </CopyText>
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            variant="outlined"
            color={row.schemeType ? "primary" : "default"}
            label={schemeTypeLabel(row.schemeType)}
            sx={{ fontSize: 11, fontWeight: 600 }}
          />
        </TableCell>

        <TableCell sx={{ maxWidth: 420 }}>
          <Typography sx={{ fontSize: 13.5 }}>
            {row.schemeDescription || "—"}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 13 }}>
            {row.createdOn ? fDateTime(row.createdOn) : "-"}
          </Typography>
        </TableCell>

        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <PageGhostButton
              startIcon={<EditOutlinedIcon />}
              onClick={() => {
                setEditDescription(row.schemeDescription || "");
                setOpen(true);
              }}
            >
              Edit
            </PageGhostButton>
            <PageGhostButton
              startIcon={<VisibilityOutlinedIcon />}
              onClick={openScheme}
            >
              View
            </PageGhostButton>
          </Stack>
        </TableCell>
      </KitRow>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalShell
          title="Edit Scheme"
          subtitle={`${row.schemeID} • ${schemeTypeLabel(row.schemeType)}`}
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
                disabled={!editDescription.trim()}
                onClick={handleEditSubmit}
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
              label="Scheme Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                Rates and slabs are configured in the full scheme editor - use
                View to open it.
              </Typography>
            </Box>
          </Stack>
        </ModalShell>
      </Modal>
    </>
  );
}
