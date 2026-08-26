import { useEffect, useState } from "react";
// @mui
import {
  Box,
  Chip,
  Stack,
  Dialog,
  Divider,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "notistack";
//
import { Category, Product } from "./types";

// ----------------------------------------------------------------------
// Per-service limit editor. Each service saves on its own row - that mirrors
// `product/setUserWisedLimit`, which only ever takes one product at a time.
// ----------------------------------------------------------------------

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  currentLimits: any;
  onProductSave: (productId: string, limit: any) => void;
}

export default function EditLimitsDialog({
  open,
  onClose,
  userId,
  categories,
  productsByCategory,
  currentLimits,
  onProductSave,
}: Props) {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const [form, setForm] = useState<any>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const init: any = {};
    Object.values(productsByCategory).forEach((products) => {
      products.forEach((p) => {
        init[p._id] = {
          day: currentLimits?.[p._id]?.day,
          month: currentLimits?.[p._id]?.month,
        };
      });
    });
    setForm(init);
    setSavedIds([]);
  }, [productsByCategory, currentLimits, open]);

  const handleChange = (
    productId: string,
    field: "day" | "month",
    value: string
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
    setSavedIds((prev) => prev.filter((id) => id !== productId));
  };

  const saveProduct = async (productId: string, categoryId: string) => {
    const dayRaw = form[productId]?.day;
    const monthRaw = form[productId]?.month;

    // ❌ empty check
    if (
      dayRaw === "" ||
      dayRaw === undefined ||
      monthRaw === "" ||
      monthRaw === undefined
    ) {
      enqueueSnackbar("Daily and Monthly limits are required", {
        variant: "error",
      });
      return;
    }

    const daily = Number(dayRaw);
    const monthly = Number(monthRaw);

    // ❌ invalid number check
    if (isNaN(daily) || isNaN(monthly)) {
      enqueueSnackbar("Limits must be valid numbers", { variant: "error" });
      return;
    }

    // ❌ business rule
    if (monthly < daily) {
      enqueueSnackbar("Monthly limit cannot be less than daily limit", {
        variant: "error",
      });
      return;
    }

    try {
      setSavingId(productId);

      const token = localStorage.getItem("token");

      const payload = {
        userId,
        productId,
        categoriesId: categoryId,
        dailyLimit:
          form[productId]?.day === "" ? 0 : Number(form[productId]?.day),
        monthlyLimit:
          form[productId]?.month === "" ? 0 : Number(form[productId]?.month),
      };

      await Api("product/setUserWisedLimit", "POST", payload, token);

      onProductSave(productId, {
        day: payload.dailyLimit,
        month: payload.monthlyLimit,
      });

      setSavedIds((prev) => [...prev, productId]);
      enqueueSnackbar("Limits saved successfully", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Failed to save limits", { variant: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const amountField = (
    productId: string,
    field: "day" | "month",
    label: string
  ) => (
    <TextField
      size="small"
      type="number"
      label={label}
      value={form[productId]?.[field] ?? ""}
      onChange={(event) => handleChange(productId, field, event.target.value)}
      InputProps={{
        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
      }}
      sx={{ width: { xs: "100%", sm: 168 } }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
            Edit User Limits
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
            Each service is saved on its own. Monthly cannot be lower than daily.
          </Typography>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ mt: -0.5, mr: -1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ px: 3, py: 2.5, maxHeight: "70vh", overflowY: "auto" }}>
        {categories.map((category) => {
          const products = productsByCategory[category._id] || [];
          if (!products.length) return null;

          return (
            <Box key={category._id} sx={{ mb: 3.5 }}>
              <Typography
                sx={{
                  mb: 1.5,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                {category.category_name}
              </Typography>

              <Stack
                divider={<Divider flexItem />}
                sx={{
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {products.map((p) => {
                  const isSaving = savingId === p._id;
                  const isSaved = savedIds.includes(p._id);

                  return (
                    <Stack
                      key={p._id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      sx={{
                        px: 2,
                        py: 1.75,
                        backgroundColor: isSaved
                          ? alpha(theme.palette.success.main, 0.06)
                          : "transparent",
                        transition: "background-color 0.25s ease",
                      }}
                    >
                      <Typography
                        sx={{
                          flexGrow: 1,
                          fontSize: 13.5,
                          fontWeight: 600,
                          minWidth: 0,
                        }}
                      >
                        {p.productName}
                      </Typography>

                      {amountField(p._id, "day", "Daily Limit")}
                      {amountField(p._id, "month", "Monthly Limit")}

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flexShrink: 0 }}
                      >
                        <LoadingButton
                          variant="contained"
                          size="medium"
                          loading={isSaving}
                          onClick={() => saveProduct(p._id, category._id)}
                          sx={{ minWidth: 84, borderRadius: 1.5 }}
                        >
                          Save
                        </LoadingButton>

                        {isSaved && (
                          <Chip
                            size="small"
                            icon={<CheckOutlinedIcon />}
                            label="Saved"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: 11, fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Dialog>
  );
}
