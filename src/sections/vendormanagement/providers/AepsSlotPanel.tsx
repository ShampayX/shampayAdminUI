import { useCallback, useEffect, useState } from "react";
// @mui
import {
  Box,
  Stack,
  Divider,
  MenuItem,
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
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
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

// ----------------------------------------------------------------------
// AEPS slabs - per product, not per service.
//
// Ported from the standalone AEPS Slot Management screen with its behaviour
// intact:
//
//   products   category/get_CategoryList -> the category named "aeps"
//              -> product/get_ProductList/<categoryId>
//   read       GET vendor/showAepsSlot   -> [{ productId, slots: [...] }]
//   save       POST vendor/editAepsslot  when the product already has slabs,
//              POST vendor/addAepsSlot   when it does not,
//              body { productId, slots }
//
// Unlike the flat slab services, this one is safe to seed the editor from the
// saved slabs - its own screen already did, so a save is known to replace the
// product's set rather than append to it. That is why edit and delete here act
// on saved rows too.
// ----------------------------------------------------------------------

type Product = { _id: string; productName: string };

type Slab = { productId: string; minSlab: number; maxSlab: number };

type ProductSlots = { productId: string; slots: Slab[] };

export default function AepsSlotPanel() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [allSlots, setAllSlots] = useState<ProductSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [productId, setProductId] = useState("");
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const productName = (id: string) =>
    products.find((product) => product._id === id)?.productName ||
    "Unknown product";

  const load = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const [categoryRes, slotRes]: any[] = await Promise.all([
      Api("category/get_CategoryList", "GET", "", token),
      Api("vendor/showAepsSlot", "GET", "", token),
    ]);

    if (categoryRes?.status === 200 && categoryRes.data.code === 200) {
      const category = (categoryRes.data.data || []).find(
        (entry: any) => String(entry?.category_name).toLowerCase() === "aeps"
      );

      if (category?._id) {
        const productRes: any = await Api(
          `product/get_ProductList/${category._id}`,
          "GET",
          "",
          token
        );

        if (productRes?.status === 200 && productRes.data.code === 200) {
          setProducts(productRes.data.data || []);
        } else {
          enqueueSnackbar("Could not load AEPS products", { variant: "error" });
        }
      } else {
        enqueueSnackbar("No AEPS category configured", { variant: "warning" });
        setProducts([]);
      }
    }

    if (slotRes?.status === 200 && slotRes.data.code === 200) {
      setAllSlots(slotRes.data.data || []);
    } else {
      setAllSlots([]);
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Selecting a product loads that product's saved slabs into the editor. */
  useEffect(() => {
    if (!productId) {
      setSlabs([]);
      setEditingIndex(null);
      return;
    }
    const entry = allSlots.find((item) => item.productId === productId);
    setSlabs(entry?.slots || []);
    setEditingIndex(null);
  }, [productId, allSlots]);

  const resetEntry = () => {
    setMinAmount("");
    setMaxAmount("");
    setEditingIndex(null);
  };

  const handleAdd = () => {
    if (!productId) {
      enqueueSnackbar("Select a product first", { variant: "warning" });
      return;
    }

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

    const duplicate = slabs.some(
      (slab, index) =>
        index !== editingIndex &&
        Number(slab.minSlab) === min &&
        Number(slab.maxSlab) === max
    );

    if (duplicate) {
      enqueueSnackbar("Duplicate slab not allowed", { variant: "error" });
      return;
    }

    if (editingIndex !== null) {
      setSlabs((previous) =>
        previous.map((slab, index) =>
          index === editingIndex
            ? { ...slab, minSlab: min, maxSlab: max }
            : slab
        )
      );
    } else {
      setSlabs((previous) => [
        ...previous,
        { productId, minSlab: min, maxSlab: max },
      ]);
    }

    resetEntry();
  };

  const handleSave = async () => {
    if (!productId) {
      enqueueSnackbar("Select a product first", { variant: "warning" });
      return;
    }

    if (!slabs.length) {
      enqueueSnackbar("Add at least one slab", { variant: "warning" });
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    const exists = allSlots.some((item) => item.productId === productId);
    const url = exists ? "vendor/editAepsslot" : "vendor/addAepsSlot";

    const response: any = await Api(
      url,
      "POST",
      { productId, slots: slabs },
      token
    );

    if (response?.status === 200 && response.data.code === 200) {
      enqueueSnackbar(response.data.message || "Slabs saved");
      resetEntry();
      await load();
    } else {
      enqueueSnackbar(response?.data?.message || "Could not save the slabs", {
        variant: "error",
      });
    }

    setSaving(false);
  };

  if (loading) return <LoadingState label="Loading AEPS products..." />;

  if (!products.length) {
    return (
      <EmptyState
        icon={<Inventory2OutlinedIcon />}
        title="No AEPS products"
        description="AEPS slabs are set per product and the AEPS category has none, so there is nothing to configure yet."
      />
    );
  }

  const isDirty = productId.length > 0;

  return (
    <Stack spacing={2.5}>
      <FormCard
        title="AEPS slabs"
        subtitle="Amount bands per AEPS product. Slabs apply to the product, so every provider handling it uses the same bands."
      >
        <TextField
          select
          fullWidth
          size="small"
          label="Product"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          sx={{ maxWidth: { sm: 380 } }}
        >
          <MenuItem value="">
            <em>Select a product</em>
          </MenuItem>
          {products.map((product) => (
            <MenuItem key={product._id} value={product._id}>
              {product.productName}
            </MenuItem>
          ))}
        </TextField>

        {isDirty && (
          <>
            {slabs.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  mt: 2.5,
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
                  {productName(productId)} - {slabs.length} slab
                  {slabs.length === 1 ? "" : "s"}
                </Typography>

                <Stack spacing={1}>
                  {slabs.map((slab, index) => (
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
                            setSlabs((previous) =>
                              previous.filter(
                                (_, position) => position !== index
                              )
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

                <Stack direction="row" justifyContent="flex-end">
                  <LoadingButton
                    variant="contained"
                    loading={saving}
                    onClick={handleSave}
                    sx={{ height: 42, px: 3 }}
                  >
                    Save slabs
                  </LoadingButton>
                </Stack>
              </Box>
            )}

            <Typography
              sx={{
                mt: 2.5,
                mb: 1.5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.7,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {editingIndex !== null ? "Edit slab" : "Add a slab"}
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

              <PageGhostButton
                startIcon={<AddOutlinedIcon />}
                onClick={handleAdd}
              >
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
          </>
        )}
      </FormCard>

      {/* Everything configured, across products. */}
      {allSlots.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon />}
          title="No AEPS slabs configured"
          description="Pick a product above, add slabs and save to create the first set."
        />
      ) : (
        <DataTable
          minWidth={620}
          columns={[
            { id: "product", label: "Product" },
            { id: "slab", label: "Slab" },
            { id: "min", label: "Minimum" },
            { id: "max", label: "Maximum" },
          ]}
        >
          {allSlots.flatMap((entry) => {
            const slabs = entry.slots || [];

            /* A product can be present with an empty slab array - show it as a
               row rather than letting it disappear out of the summary. */
            if (!slabs.length) {
              return [
                <KitRow key={`${entry.productId}-empty`}>
                  <TableCell>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                      {productName(entry.productId)}
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={3}>
                    <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                      No slabs
                    </Typography>
                  </TableCell>
                </KitRow>,
              ];
            }

            return slabs.map((slab, index) => (
              <KitRow key={`${entry.productId}-${index}`}>
                <TableCell>
                  {index === 0 ? (
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                      {productName(entry.productId)}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>Slab {index + 1}</TableCell>
                <TableCell>
                  ₹{Number(slab.minSlab).toLocaleString("en-IN")}
                </TableCell>
                <TableCell>
                  ₹{Number(slab.maxSlab).toLocaleString("en-IN")}
                </TableCell>
              </KitRow>
            ));
          })}
        </DataTable>
      )}
    </Stack>
  );
}
