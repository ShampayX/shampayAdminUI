import { useCallback, useEffect, useState } from "react";
// @mui
import {
  Box,
  Stack,
  Divider,
  IconButton,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import { LoadingButton } from "@mui/lab";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  FormCard,
  DataTable,
  KitRow,
  EmptyState,
  LoadingState,
  PageGhostButton,
} from "src/components/page-kit";
// utils
import { fDateTime } from "src/utils/formatTime";
//
import { SlotService } from "./providerCatalog";

// ----------------------------------------------------------------------
// The amount-slab editor, shared by eleven services.
//
// Each of the eleven used to be its own screen and its own file, identical
// except for two endpoint names. The behaviour here is the behaviour they all
// had, unchanged:
//
//   read     GET <service.read>
//   save     POST <service.update> when slabs already exist,
//            POST <service.create> when none do,
//            body { [service.payloadKey]: <the staged slabs> }
//
// Two things are deliberately NOT changed:
//
//   - the request still sends only the slabs staged in this session, never the
//     saved ones merged in. Whether the backend replaces the set or appends to
//     it is not observable from the frontend, and seeding the editor from the
//     saved slabs would duplicate every row if it appends.
//   - slabs are per SERVICE. No slab endpoint accepts a provider id, so this
//     panel has no provider selector; every provider on the service shares
//     these slabs.
//
// What is new is only editor comfort: a staged slab can be corrected or
// removed before saving, min/max are validated, and duplicates are refused.
// ----------------------------------------------------------------------

type Slab = { minSlab: string | number; maxSlab: string | number };

type SavedSlab = Slab & { _id?: string; createdAt?: string };

export default function SlabSlotPanel({ service }: { service: SlotService }) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [saved, setSaved] = useState<SavedSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [staged, setStaged] = useState<Slab[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!service.read) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    const response: any = await Api(service.read, "GET", "", token);

    if (response?.status === 200 && response.data.code === 200) {
      const data = response.data.data;

      /* BBPS returns the slab array itself; every other service wraps it in
         one document as `data[0].slots`. */
      const slabs =
        service.shape === "flat"
          ? (data as SavedSlab[]) || []
          : (Array.isArray(data) && data.length ? data[0]?.slots : []) || [];

      setSaved(slabs);
    } else {
      setSaved([]);
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.read, service.shape]);

  useEffect(() => {
    /* A different service was picked - drop anything staged for the old one
       rather than posting it to the new service's endpoint. */
    setStaged([]);
    setMinAmount("");
    setMaxAmount("");
    setEditingIndex(null);
    load();
  }, [load]);

  const resetEntry = () => {
    setMinAmount("");
    setMaxAmount("");
    setEditingIndex(null);
  };

  const handleAdd = () => {
    if (!minAmount || !maxAmount) {
      enqueueSnackbar("Enter both a minimum and a maximum", {
        variant: "warning",
      });
      return;
    }

    const min = Number(minAmount);
    const max = Number(maxAmount);

    if (isNaN(min) || isNaN(max)) {
      enqueueSnackbar("Slab amounts must be numbers", { variant: "error" });
      return;
    }

    if (min >= max) {
      enqueueSnackbar("Minimum must be less than maximum", { variant: "error" });
      return;
    }

    const duplicate = staged.some(
      (slab, index) =>
        index !== editingIndex &&
        Number(slab.minSlab) === min &&
        Number(slab.maxSlab) === max
    );

    if (duplicate) {
      enqueueSnackbar("That slab is already staged", { variant: "error" });
      return;
    }

    if (editingIndex !== null) {
      setStaged((previous) =>
        previous.map((slab, index) =>
          index === editingIndex ? { minSlab: min, maxSlab: max } : slab
        )
      );
    } else {
      setStaged((previous) => [...previous, { minSlab: min, maxSlab: max }]);
    }

    resetEntry();
  };

  const handleSave = async () => {
    if (!staged.length) {
      enqueueSnackbar("Add at least one slab first", { variant: "warning" });
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    /* Same rule the old screens used: anything already configured means the
       update endpoint, nothing configured means the create endpoint. */
    const url = saved.length ? service.update : service.create;
    const body = { [service.payloadKey || "slots"]: staged };

    const response: any = await Api(url as string, "POST", body, token);

    if (response?.status === 200 && response.data.code === 200) {
      enqueueSnackbar(response.data.message || "Slabs saved");
      setStaged([]);
      resetEntry();
      await load();
    } else {
      enqueueSnackbar(response?.data?.message || "Could not save the slabs", {
        variant: "error",
      });
    }

    setSaving(false);
  };

  const showsCreatedAt = saved.some((slab) => Boolean(slab.createdAt));

  return (
    <Stack spacing={2.5}>
      <FormCard
        title={`${service.label} slabs`}
        subtitle={`${service.hint} Slabs apply to the service, so every provider handling it uses the same bands.`}
      >
        {/* --- staged slabs --------------------------------------------- */}
        {staged.length > 0 && (
          <Box
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.grey[500], 0.06),
            }}
          >
            <Typography
              sx={{
                mb: 1.5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.7,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Staged - not saved yet ({staged.length})
            </Typography>

            <Stack spacing={1}>
              {staged.map((slab, index) => (
                <Stack
                  key={`${slab.minSlab}-${slab.maxSlab}-${index}`}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12.5, fontWeight: 700, minWidth: 44 }}
                  >
                    #{index + 1}
                  </Typography>

                  <Typography sx={{ flex: 1, fontSize: 13.5 }}>
                    ₹{Number(slab.minSlab).toLocaleString("en-IN")} - ₹
                    {Number(slab.maxSlab).toLocaleString("en-IN")}
                  </Typography>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      color="primary"
                      title="Edit this slab"
                      onClick={() => {
                        setEditingIndex(index);
                        setMinAmount(String(slab.minSlab));
                        setMaxAmount(String(slab.maxSlab));
                      }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      title="Remove this slab"
                      onClick={() => {
                        setStaged((previous) =>
                          previous.filter((_, position) => position !== index)
                        );
                        if (editingIndex === index) resetEntry();
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <PageGhostButton onClick={() => setStaged([])} disabled={saving}>
                Discard
              </PageGhostButton>
              <LoadingButton
                variant="contained"
                loading={saving}
                onClick={handleSave}
                sx={{ height: 42, px: 3 }}
              >
                {saved.length ? "Update slabs" : "Save slabs"}
              </LoadingButton>
            </Stack>
          </Box>
        )}

        {/* --- entry row ------------------------------------------------- */}
        <Typography
          sx={{
            mb: 1.5,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.7,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {editingIndex !== null ? "Edit staged slab" : "Add a slab"}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            size="small"
            type="number"
            label="Minimum amount"
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            type="number"
            label="Maximum amount"
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            sx={{ flex: 1 }}
          />

          <PageGhostButton startIcon={<AddOutlinedIcon />} onClick={handleAdd}>
            {editingIndex !== null ? "Update" : "Add slab"}
          </PageGhostButton>

          {editingIndex !== null && (
            <PageGhostButton
              startIcon={<CloseOutlinedIcon />}
              onClick={resetEntry}
            >
              Cancel
            </PageGhostButton>
          )}
        </Stack>
      </FormCard>

      {/* --- saved slabs ------------------------------------------------- */}
      {loading ? (
        <LoadingState label={`Loading ${service.label} slabs...`} />
      ) : saved.length === 0 ? (
        <EmptyState
          icon={<StraightenOutlinedIcon />}
          title="No slabs configured"
          description={`${service.label} has no amount slabs yet. Add one above and save to create the first set.`}
        />
      ) : (
        <DataTable
          minWidth={520}
          columns={[
            { id: "slab", label: "Slab" },
            { id: "min", label: "Minimum" },
            { id: "max", label: "Maximum" },
            ...(showsCreatedAt ? [{ id: "created", label: "Created" }] : []),
          ]}
        >
          {saved.map((slab, index) => (
            <KitRow key={slab._id || `${slab.minSlab}-${slab.maxSlab}-${index}`}>
              <TableCell>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                  Slab {index + 1}
                </Typography>
              </TableCell>
              <TableCell>
                ₹{Number(slab.minSlab).toLocaleString("en-IN")}
              </TableCell>
              <TableCell>
                ₹{Number(slab.maxSlab).toLocaleString("en-IN")}
              </TableCell>
              {showsCreatedAt && (
                <TableCell>
                  {slab.createdAt ? fDateTime(slab.createdAt) : "-"}
                </TableCell>
              )}
            </KitRow>
          ))}
        </DataTable>
      )}
    </Stack>
  );
}
