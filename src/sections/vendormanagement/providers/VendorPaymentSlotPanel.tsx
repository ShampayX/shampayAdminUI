import { useCallback, useEffect, useState } from "react";
// @mui
import {
  Box,
  Stack,
  MenuItem,
  IconButton,
  TableCell,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
// form
import * as Yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import Iconify from "src/components/iconify/Iconify";
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  FormCard,
  DataTable,
  KitRow,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Vendor Payment slabs - per product, with per-product ceilings.
//
// Ported from the standalone Vendor Payment Slots screen. The validation is
// the part that matters and it is unchanged:
//
//   - each product carries its own [min, max] band (the PRODUCT_BANDS table
//     below, copied verbatim from that screen)
//   - a slab's minimum must sit inside the band; its maximum must be greater
//     than the minimum and must not exceed the band ceiling
//   - slabs are contiguous: adding one seeds its minimum from the previous
//     slab's maximum + 1, and only the last row stays editable
//
// Endpoints, also unchanged:
//   products  category/get_CategoryList -> the category named "vendor payments"
//             -> product/get_ProductList/<categoryId>
//   read      GET  vendor/vendor_payment_slots/<productId>
//   save      POST vendor/vendor_payment_slots  { productId, slots }
//
// Note there is no separate create/update endpoint here - a single POST both
// creates and replaces, which is why this panel can seed from what is saved.
// ----------------------------------------------------------------------

type Product = { _id: string; productName: string };

type FormValuesProps = {
  product: { productId: string; productName: string };
  slots: { minSlab: number; maxSlab: number }[];
};

/** Ceilings per product name, exactly as the original screen defined them. */
const PRODUCT_BANDS: Record<string, { min: number; max: number }> = {
  "Min Vendor Payment": { min: 5000, max: 25000 },
  "Max Vendor Payment": { min: 25000, max: 50000 },
  "Super Vendor Payment": { min: 50000, max: 200000 },
};

/** Anything not named above falls back to the original screen's else branch. */
const DEFAULT_BAND = { min: 200000, max: 500000 };

const bandFor = (productName: string) =>
  PRODUCT_BANDS[productName] || DEFAULT_BAND;

const defaultValues: FormValuesProps = {
  product: { productId: "", productName: "" },
  slots: [{ minSlab: 0, maxSlab: 0 }],
};

export default function VendorPaymentSlotPanel() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState<Product[]>([]);
  const [savedSlots, setSavedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [band, setBand] = useState({ name: "", ...DEFAULT_BAND });

  const SlotSchema = Yup.object().shape({
    slots: Yup.array().of(
      Yup.object().shape({
        minSlab: Yup.number()
          .min(
            band.min,
            `minSlab for ${band.name} should be greater then ${band.min}`
          )
          .max(
            band.max - 1,
            `maxSlab for ${band.name} should not be greater then ${band.max - 1}`
          )
          .typeError("That doesn't look like a number")
          .required("Min slab is mendatory field"),
        maxSlab: Yup.number()
          .typeError("That doesn't look like a number")
          .when("minSlab", (minSlab) =>
            Yup.number()
              .typeError("That doesn't look like a  number")
              .required("field is required")
              .min(minSlab + 1, "Please enter valid Max Slab")
              .max(
                band.max,
                `maxSlab for ${band.name} should not be greater then ${band.max}`
              )
          )
          .required("Field is required"),
      })
    ),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(SlotSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const { fields, append, remove }: any = useFieldArray({
    name: "slots",
    control,
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const categoryRes: any = await Api(
      "category/get_CategoryList",
      "GET",
      "",
      token
    );

    if (categoryRes?.status === 200 && categoryRes.data.code === 200) {
      const category = (categoryRes.data.data || []).find(
        (entry: any) =>
          String(entry?.category_name).toLowerCase() === "vendor payments"
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
        }
      } else {
        setProducts([]);
      }
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadSlots = async (productId: string) => {
    const token = localStorage.getItem("token");
    const response: any = await Api(
      `vendor/vendor_payment_slots/${productId}`,
      "GET",
      "",
      token
    );

    if (response?.status === 200 && response.data.code === 200) {
      setSavedSlots(response.data?.data?.[0]?.slots || []);
    } else {
      setSavedSlots([]);
    }
  };

  const selectProduct = (product: Product) => {
    reset(defaultValues);
    setValue("product.productId", product._id);
    setValue("product.productName", product.productName);
    setBand({ name: product.productName, ...bandFor(product.productName) });
    loadSlots(product._id);
  };

  const onSubmit = async (data: FormValuesProps) => {
    const token = localStorage.getItem("token");

    const response: any = await Api(
      "vendor/vendor_payment_slots",
      "POST",
      { productId: data.product.productId, slots: data.slots },
      token
    );

    if (response?.status === 200 && response.data.code === 200) {
      enqueueSnackbar(response.data.message || "Slabs saved");
      const productId = data.product.productId;
      reset(defaultValues);
      setSavedSlots(response.data?.data?.slots || []);
      /* Re-read so the table shows what the server actually stored. */
      loadSlots(productId);
    } else {
      enqueueSnackbar(response?.data?.message || "Could not save the slabs", {
        variant: "error",
      });
    }
  };

  if (loading) return <LoadingState label="Loading vendor payment products..." />;

  if (!products.length) {
    return (
      <EmptyState
        icon={<Inventory2OutlinedIcon />}
        title="No vendor payment products"
        description="Vendor payment slabs are set per product and this category has none, so there is nothing to configure yet."
      />
    );
  }

  const selectedProductId = watch("product.productId");

  return (
    <Stack spacing={2.5}>
      <FormCard
        title="Vendor payment slabs"
        subtitle="Amount bands per vendor payment product. Each product has its own ceiling, and slabs must run continuously up to it."
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ maxWidth: { sm: 380 } }}>
            <RHFSelect
              name="product.productId"
              label="Product"
              size="small"
              SelectProps={{ native: false }}
            >
              {products.map((product) => (
                <MenuItem
                  key={product._id}
                  value={product._id}
                  onClick={() => selectProduct(product)}
                >
                  {product.productName}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>

          {selectedProductId && (
            <>
              <Typography
                sx={{ mt: 2, fontSize: 12.5, color: "text.secondary" }}
              >
                {band.name} accepts slabs between ₹
                {band.min.toLocaleString("en-IN")} and ₹
                {band.max.toLocaleString("en-IN")}.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2.5 }}>
                {fields.map((field: any, index: number) => {
                  const isLast = fields.length - 1 === index;

                  return (
                    <Stack
                      key={field.id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "stretch", sm: "flex-start" }}
                    >
                      <RHFTextField
                        name={`slots.${index}.minSlab`}
                        type="number"
                        size="small"
                        label="Min slab"
                        /* Only the first slab's minimum is chosen; every later
                           one is derived from the previous maximum. */
                        disabled={index > 0 || !isLast}
                        sx={{ flex: 1 }}
                      />
                      <RHFTextField
                        name={`slots.${index}.maxSlab`}
                        type="number"
                        size="small"
                        label="Max slab"
                        disabled={!isLast}
                        sx={{ flex: 1 }}
                      />

                      <Stack direction="row" spacing={0.5} sx={{ pt: 0.25 }}>
                        {isValid && isLast && (
                          <IconButton
                            title="Add the next slab"
                            onClick={() =>
                              append({
                                minSlab:
                                  Number(watch(`slots.${index}.maxSlab`)) + 1,
                                maxSlab: 0,
                              })
                            }
                          >
                            <Iconify icon="ph:plus-bold" />
                          </IconButton>
                        )}
                        {isLast && index >= 1 && (
                          <IconButton
                            title="Remove this slab"
                            onClick={() => remove(index)}
                          >
                            <Iconify icon="ph:minus-bold" />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>

              {isValid && (
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={{ mt: 3 }}
                >
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                    sx={{ height: 42, px: 3 }}
                  >
                    Save slabs
                  </LoadingButton>
                </Stack>
              )}
            </>
          )}
        </FormProvider>
      </FormCard>

      {!selectedProductId ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon />}
          title="Pick a product"
          description="Vendor payment slabs are stored per product. Choose one to see and edit its bands."
        />
      ) : savedSlots.length === 0 ? (
        <EmptyState
          icon={<StraightenOutlinedIcon />}
          title="No slabs configured"
          description={`${band.name} has no amount slabs yet. Add them above and save to create the first set.`}
        />
      ) : (
        <DataTable
          minWidth={520}
          columns={[
            { id: "slab", label: "Slab" },
            { id: "min", label: "Minimum" },
            { id: "max", label: "Maximum" },
          ]}
        >
          {savedSlots.map((slab: any, index: number) => (
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
            </KitRow>
          ))}
        </DataTable>
      )}
    </Stack>
  );
}
