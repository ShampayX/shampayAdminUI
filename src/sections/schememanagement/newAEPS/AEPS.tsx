import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import {
  Stack,
  Grid,
  TextField,
  Button,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import FormProvider, { RHFSelect } from "../../../components/hook-form";

import { useSnackbar } from "notistack";
import VendorAEPSTable from "./AEPSTable";
import { useAuthContext } from "src/auth/useAuthContext";

// ========== TYPES ==========
interface Product {
  _id: string;
  productName: string;
}

interface Slot {
  productId: string;
  minSlab: number;
  maxSlab: number;
}

interface ProductSlot {
  productId: string;
  slots: Slot[];
}

interface FilterFormData {
  productId: string;
}

// ========== MAIN COMPONENT ==========
export default function Vendor() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const refElem = useRef<HTMLDivElement>(null);

  // ============ FORM SETUP ============
  const FilterSchema = Yup.object().shape({
    productId: Yup.string().required("Product is required"),
  });

  const methods = useForm<FilterFormData>({
    resolver: yupResolver(FilterSchema),
    defaultValues: {
      productId: "",
    },
  });

  const { handleSubmit, setValue } = methods;

  // ============ STATE MANAGEMENT ============
  const [productList, setProductList] = useState<Product[]>([]);
  const [allSlots, setAllSlots] = useState<ProductSlot[]>([]);
  const [slot, setSlot] = useState<Slot[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ============ EFFECTS ============
  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    handleProductChange();
  }, [selectedProductId, allSlots]);

  // ============ INITIALIZATION ============
  const initializeData = async () => {
    await Promise.all([getProduct(), showSlots()]);
  };

  // ============ PRODUCT CHANGE HANDLER ============
  const handleProductChange = () => {
    if (!selectedProductId) {
      setSlot([]);
      setEditingIndex(null);
      return;
    }

    const productSlot = allSlots.find(
      (item) => item.productId === selectedProductId
    );

    setSlot(productSlot?.slots || []);
    setEditingIndex(null);
  };

  // ============ HELPER FUNCTIONS ============
  const getProductName = (productId: string): string => {
    const product = productList.find((p) => p._id === productId);
    return product?.productName || "Unknown Product";
  };

  const validateAmounts = (): boolean => {
    if (!minAmount || !maxAmount) {
      enqueueSnackbar("Please fill in both Min and Max amounts", {
        variant: "warning",
      });
      return false;
    }

    const min = Number(minAmount);
    const max = Number(maxAmount);

    if (isNaN(min) || isNaN(max)) {
      enqueueSnackbar("Min and Max amounts must be valid numbers", {
        variant: "error",
      });
      return false;
    }

    if (min >= max) {
      enqueueSnackbar("Min amount must be less than Max amount", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const checkDuplicateSlab = (minVal: number, maxVal: number): boolean => {
    return slot.some(
      (s, idx) =>
        idx !== editingIndex &&
        Number(s.minSlab) === minVal &&
        Number(s.maxSlab) === maxVal
    );
  };

  // ============ API CALLS ============
  const getProduct = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");

      if (!token) {
        enqueueSnackbar("Authentication token not found", { variant: "error" });
        return;
      }

      const catRes = await Api("category/get_CategoryList", "GET", "", token);

      if (catRes?.data?.code !== 200) {
        enqueueSnackbar("Failed to fetch categories", { variant: "error" });
        return;
      }

      const aepsCategory = catRes.data.data.find(
        (c: any) => c.category_name?.toLowerCase() === "aeps"
      );

      if (!aepsCategory?._id) {
        enqueueSnackbar("AEPS category not found", { variant: "warning" });
        return;
      }

      const productRes = await Api(
        `product/get_ProductList/${aepsCategory._id}`,
        "GET",
        "",
        token
      );

      if (productRes?.data?.code === 200) {
        setProductList(productRes.data.data || []);
      } else {
        enqueueSnackbar("Failed to fetch products", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      enqueueSnackbar("Error fetching products", { variant: "error" });
    } finally {
      setLoadingProducts(false);
    }
  };

  const showSlots = async () => {
    try {
      setLoadingSlots(true);
      const token = localStorage.getItem("token");

      if (!token) {
        enqueueSnackbar("Authentication token not found", { variant: "error" });
        return;
      }

      const res = await Api("vendor/showAepsSlot", "GET", "", token);

      if (res?.data?.code === 200) {
        setAllSlots(res.data.data || []);
      } else {
        enqueueSnackbar("Failed to fetch slots", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      enqueueSnackbar("Error fetching slots", { variant: "error" });
    } finally {
      setLoadingSlots(false);
    }
  };

  // ============ SLOT MANAGEMENT ============
  const handleToAdd = () => {
    if (!selectedProductId) {
      enqueueSnackbar("Please select a product first", { variant: "warning" });
      return;
    }

    if (!validateAmounts()) {
      return;
    }

    const minVal = Number(minAmount);
    const maxVal = Number(maxAmount);

    if (checkDuplicateSlab(minVal, maxVal)) {
      enqueueSnackbar("Duplicate slab not allowed", { variant: "error" });
      return;
    }

    if (editingIndex !== null) {
      // Update existing slot
      const updatedSlots = [...slot];
      updatedSlots[editingIndex] = {
        ...updatedSlots[editingIndex],
        minSlab: minVal,
        maxSlab: maxVal,
      };
      setSlot(updatedSlots);
      enqueueSnackbar("Slot updated locally", { variant: "success" });
    } else {
      // Add new slot
      setSlot((prev) => [
        ...prev,
        {
          productId: selectedProductId,
          minSlab: minVal,
          maxSlab: maxVal,
        },
      ]);
      enqueueSnackbar("Slot added locally", { variant: "success" });
    }

    // Reset form
    setMinAmount("");
    setMaxAmount("");
    setEditingIndex(null);
    refElem.current?.querySelector("input")?.focus();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setMinAmount(String(slot[index].minSlab));
    setMaxAmount(String(slot[index].maxSlab));
  };

  const handleDelete = (index: number) => {
    setSlot((prev) => prev?.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setMinAmount("");
      setMaxAmount("");
    }
    enqueueSnackbar("Slot deleted", { variant: "info" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setMinAmount("");
    setMaxAmount("");
  };

  // ============ FORM SUBMIT ============
  const onSubmit = async (data: FilterFormData) => {
    try {
      if (slot.length === 0) {
        enqueueSnackbar("Please add at least one slot", { variant: "warning" });
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        enqueueSnackbar("Authentication token not found", { variant: "error" });
        return;
      }

      const payload = {
        productId: data?.productId,
        slots: slot,
      };

      const exists = allSlots.some((item) => item.productId === data.productId);

      const endpoint = exists ? "vendor/editAepsslot" : "vendor/addAepsSlot";

      const res = await Api(endpoint, "POST", payload, token);

      if (res?.data?.code === 200) {
        enqueueSnackbar(res.data.message || "Slots saved successfully", {
          variant: "success",
        });

        // Update allSlots state
        setAllSlots((prev) => {
          if (!exists) {
            return [...prev, payload];
          }

          return prev.map((item) =>
            item?.productId === data?.productId
              ? { ...item, slots: payload?.slots }
              : item
          );
        });

        // Reset form
        setSlot([]);
        setSelectedProductId("");
        setValue("productId", "");
        setEditingIndex(null);
        setMinAmount("");
        setMaxAmount("");
        initializeData();
      } else {
        enqueueSnackbar(res?.data?.message || "Failed to save slots", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting slots:", error);
      enqueueSnackbar("Error saving slots", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RENDER ============
  return (
    <>
      <Helmet>
        <title>AEPS Slot Management | Shampay Admin</title>
      </Helmet>

      <Box sx={{ mx: 2, pb: 4 }}>
        <Typography variant="h3" my={2} fontWeight="bold">
          AEPS Slot Management
        </Typography>

        {/* ========== ADD / EDIT FORM ========== */}
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid rowGap={3}>
            {/* Product Selection */}
            <Box>
              <RHFSelect
                name="productId"
                label="Select Product"
                SelectProps={{ displayEmpty: true }}
                disabled={loadingProducts}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("productId", value, { shouldValidate: true });
                  setSelectedProductId(value);
                }}
              >
                <MenuItem value="">
                  <em>Select Product</em>
                </MenuItem>

                {productList.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.productName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            {/* Display Current Slots */}
            {slot?.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1.5,
                  bgcolor: "#f9fafb",
                }}
              >
                <Typography
                  variant="subtitle1"
                  mb={2}
                  fontWeight="bold"
                  color="textPrimary"
                >
                  Current Slots ({slot.length})
                </Typography>

                <Stack spacing={1}>
                  {slot.map((item, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        bgcolor: "white",
                        borderRadius: 0.75,
                        border: "1px solid #e0e0e0",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography sx={{ minWidth: 30, fontWeight: 500 }}>
                        #{index + 1}
                      </Typography>

                      <Box sx={{ flex: 1, textAlign: "center" }}>
                        <Typography variant="body2">
                          ₹{item.minSlab.toLocaleString()} - ₹
                          {item.maxSlab.toLocaleString()}
                        </Typography>
                      </Box>

                      <Stack direction="row" gap={0.5}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(index)}
                          title="Edit slot"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(index)}
                          title="Delete slot"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, width: "100%" }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save All Slots"}
                </Button>
              </Box>
            )}

            {/* Add/Edit Slab Inputs */}
            <Box>
              <Typography variant="subtitle2" mb={1.5} color="textSecondary">
                {editingIndex !== null ? "Edit Slot" : "Add New Slot"}
              </Typography>

              <Stack direction="row" gap={1} ref={refElem}>
                <TextField
                  label="Min Amount"
                  size="small"
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  fullWidth
                />
                <TextField
                  label="Max Amount"
                  size="small"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="1000"
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleToAdd}
                  sx={{ minWidth: 120 }}
                >
                  {editingIndex !== null ? "Update" : "Add Slot"}
                </Button>
                {editingIndex !== null && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelEdit}
                    startIcon={<CloseIcon />}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Box>
          </Grid>
        </FormProvider>

        {/* ========== SAVED SLOTS DISPLAY ========== */}
        {loadingSlots ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="textSecondary">Loading slots...</Typography>
          </Box>
        ) : allSlots?.length > 0 ? (
          <Box mt={6}>
            <Typography variant="h5" mb={3} fontWeight="bold">
              All Products & Slots
            </Typography>

            <Grid container spacing={3}>
              {allSlots?.map((productSlot) => (
                <Grid item xs={12} key={productSlot.productId}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1.5,
                      bgcolor: "white",
                    }}
                  >
                    <Typography
                      variant="h6"
                      mb={2}
                      fontWeight="bold"
                      color="primary"
                    >
                      {getProductName(productSlot.productId)}
                    </Typography>

                    <VendorAEPSTable
                      tableData={productSlot.slots}
                      tableLabels={[
                        { id: "slot", label: "Slot" },
                        { id: "minAmount", label: "Min Amount" },
                        { id: "maxAmount", label: "Max Amount" },
                      ]}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="textSecondary">
              No slots configured yet. Create your first slot above.
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
