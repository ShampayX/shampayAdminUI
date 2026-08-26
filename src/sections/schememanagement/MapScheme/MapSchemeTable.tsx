import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
// components
import { useSnackbar } from "../../../components/snackbar";
import { CustomAvatar } from "src/components/custom-avatar";
import { PATH_DASHBOARD } from "src/routes/paths";
import { fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  KitRow,
  StackedCell,
  ModalShell,
  PageGhostButton,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// One account -> scheme assignment.
//
// `scheme/mapScheme_list` returns the account plus the scheme code, description
// and mapping comment. There is no status flag or effective date on the payload.
//
// The row editor updates the COMMENT only - the scheme picker inside it has
// always been commented out upstream. It still posts to `scheme/map_Scheme`,
// which needs a schemeId, so the current scheme's `_id` is resolved from the
// `schemes` list the parent already fetches. The old code posted an empty
// string there.
// ----------------------------------------------------------------------

export type SchemeMappingRow = {
  _id: string;
  userCode: string;
  role: string;
  firstName: string;
  lastName: string;
  selfie: [string];
  company_name: string;
  productId: string;
  createdAt: string;
  schemeId: string;
  schemeDescription: string;
  mapComment: string;
};

const ROLE_LABELS: Record<string, string> = {
  agent: "Agent",
  distributor: "Distributor",
  m_distributor: "Master Distributor",
  directagent: "Direct Agent",
};

export const roleLabel = (role: string) => ROLE_LABELS[role] || "API User";

export default function MapSchemeRow({
  row,
  schemes,
  onUpdated,
}: {
  row: SchemeMappingRow;
  schemes: any[];
  onUpdated?: () => void;
}) {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(row.mapComment || "");
  const [saving, setSaving] = useState(false);

  /** The catalogue entry behind this row, matched on the visible scheme code. */
  const matchedScheme = schemes?.find(
    (scheme: any) => scheme.schemeID === row.schemeId
  );

  const handleRedirect = () => {
    if (matchedScheme) {
      localStorage.setItem("schId", matchedScheme._id);
      navigate(PATH_DASHBOARD.scheme.EditScheme, {
        state: { rowD: matchedScheme },
      });
    } else {
      enqueueSnackbar("Scheme not found", { variant: "error" });
    }
  };

  const updateScheme = () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    let body = {
      userId: row._id,
      schemeId: matchedScheme?._id || "",
      mapComment: comment,
    };
    Api(`scheme/map_Scheme`, "POST", body, token)
      .then((Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setOpen(false);
          enqueueSnackbar(Response.data.message);
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

  return (
    <>
      <KitRow>
        {/* Entity */}
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CustomAvatar
              name={row.firstName}
              alt={row.firstName}
              src={row.selfie?.[0] || ""}
              sx={{ width: 34, height: 34 }}
            />
            <StackedCell
              bold
              primary={
                `${row.firstName || ""} ${row.lastName || ""}`.trim() || "—"
              }
              secondary={
                [row.userCode, row.company_name].filter(Boolean).join(" • ") ||
                undefined
              }
            />
          </Stack>
        </TableCell>

        {/* Entity type */}
        <TableCell>
          <Chip
            size="small"
            variant="outlined"
            label={roleLabel(row.role)}
            sx={{ fontSize: 11, fontWeight: 600 }}
          />
        </TableCell>

        {/* Assigned scheme - opens the scheme in the catalog editor */}
        <TableCell>
          <Typography
            onClick={handleRedirect}
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "monospace",
              color: "primary.main",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {row.schemeId || "-"}
          </Typography>
        </TableCell>

        <TableCell sx={{ maxWidth: 300 }}>
          <Typography sx={{ fontSize: 13 }}>
            {row.schemeDescription || "—"}
          </Typography>
        </TableCell>

        <TableCell sx={{ maxWidth: 220 }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {row.mapComment || "—"}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography sx={{ fontSize: 13 }}>
            {row.createdAt ? fDateTime(row.createdAt) : "-"}
          </Typography>
        </TableCell>

        <TableCell align="center">
          <PageGhostButton
            startIcon={<EditOutlinedIcon />}
            onClick={() => {
              setComment(row.mapComment || "");
              setOpen(true);
            }}
          >
            Edit
          </PageGhostButton>
        </TableCell>
      </KitRow>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalShell
          title="Edit Assignment"
          subtitle={`${
            `${row.firstName || ""} ${row.lastName || ""}`.trim() || "Account"
          } • ${row.schemeId || "-"}`}
          onClose={() => setOpen(false)}
          width={520}
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
                onClick={updateScheme}
              >
                Save
              </LoadingButton>
            </>
          }
        >
          <Stack spacing={2}>
            <Box>
              <Typography
                sx={{
                  mb: 0.5,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                Assigned Scheme
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {row.schemeId} {row.schemeDescription ? `— ${row.schemeDescription}` : ""}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              name="mapComment"
              label="Comments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              helperText="The comment is the only field this editor changes."
            />
          </Stack>
        </ModalShell>
      </Modal>
    </>
  );
}
