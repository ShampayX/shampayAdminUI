import { Box, IconButton, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import React, { useEffect, useState } from "react";
// @mui
import { Stack, Grid, MenuItem } from "@mui/material";
import * as Yup from "yup";
// form
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import VendorMoneyTransferTable from "./VendorPaymentsDataTable";
import { useAuthContext } from "src/auth/useAuthContext";
import Iconify from "src/components/iconify/Iconify";
import { LoadingButton } from "@mui/lab";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

type FormValuesProps = {
  product: {
    productId: string;
    productName: string;
  };
  slots: {
    minSlab: number;
    maxSlab: number;
  }[];
};

export default function VendorPaymentData() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [productNameForValidation, setProductNameForValidation] = useState({
    name: "",
    min: 0,
    max: 0,
  });
  const [slots, setSlots] = useState([]);

  const FilterSchema = Yup.object().shape({
    slots: Yup.array().of(
      Yup.object().shape({
        minSlab: Yup.number()
          .min(
            productNameForValidation.min,
            `minSlab for ${productNameForValidation.name} should be greater then ${productNameForValidation.min}`
          )
          .max(
            productNameForValidation.max - 1,
            `maxSlab for ${
              productNameForValidation.name
            } should not be greater then ${productNameForValidation.max - 1}`
          )
          .typeError("That doesn't look like a number")
          .required("Min slab is mendatory field"),
        maxSlab: Yup.number()
          .typeError("That doesn't look like a number")
          .when("minSlab", (minSlab, schema) => {
            return Yup.number()
              .typeError("That doesn't look like a  number")
              .required("field is required")
              .min(minSlab + 1, "Please enter valid Max Slab")
              .max(
                productNameForValidation.max,
                `maxSlab for ${productNameForValidation.name} should not be greater then ${productNameForValidation.max}`
              );
          })
          .required("Field is required"),
      })
    ),
  });

  const defaultValues = {
    slots: [{ minSlab: 0, maxSlab: 0 }],
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    resetField,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getProduct();
  }, []);

  const { fields, append, remove }: any = useFieldArray({
    name: "slots",
    control,
  });

  const getProduct = async () => {
    let token = localStorage.getItem("token");
    await Api(`category/get_CategoryList`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          let filterCategory = Response.data.data.filter(
            (item: any) =>
              item?.category_name?.toLowerCase() == "vendor payments"
          );
          Api(
            `product/get_ProductList/${filterCategory[0]?._id}`,
            "GET",
            "",
            token
          ).then((Response: any) => {
            if (Response?.status == 200) {
              if (Response.data.code == 200) {
                setProductList(Response.data.data);
              }
            }
          });
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getSlots = (id: string) => {
    let token = localStorage.getItem("token");
    Api(`vendor/vendor_payment_slots/${id}`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          setSlots(Response.data?.data[0]?.slots || []);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const onSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      productId: data.product.productId,
      slots: data.slots,
    };
    Api(`vendor/vendor_payment_slots`, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          reset(defaultValues);
          setSlots(Response.data?.data?.slots || []);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title> Vendor Payment Slots | Shampay Admin</title>
      </Helmet>
      <Box sx={{ mx: 2 }}>
        <Typography variant="h3" my={2}>
          Vendor Payment Slots
        </Typography>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 0.5fr)",
                md: "repeat(1, 0.3fr)",
              }}
            >
              <RHFSelect
                name="product.productId"
                label="Select Product"
                SelectProps={{
                  native: false,
                  sx: {
                    textTransform: "capitalize",
                  },
                }}
              >
                {productList.map((item: any) => {
                  return (
                    <MenuItem
                      key={item._id}
                      value={item._id}
                      onClick={() => {
                        getSlots(item._id);
                        reset(defaultValues);
                        setValue("product.productId", item._id);
                        setValue("product.productName", item.productName);
                        setProductNameForValidation({
                          name: item.productName,
                          min:
                            item.productName == "Min Vendor Payment"
                              ? 5000
                              : item.productName == "Max Vendor Payment"
                              ? 25000
                              : item.productName == "Super Vendor Payment"
                              ? 50000
                              : 200000,
                          max:
                            item.productName == "Min Vendor Payment"
                              ? 25000
                              : item.productName == "Max Vendor Payment"
                              ? 50000
                              : item.productName == "Super Vendor Payment"
                              ? 200000
                              : 500000,
                        });
                      }}
                    >
                      {item.productName}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
              {watch("product.productId") &&
                watch("slots").map((service: any, slotIndex: number) => (
                  <React.Fragment>
                    <Stack flexDirection={"row"} gap={1}>
                      <RHFTextField
                        name={`slots.${slotIndex}.minSlab`}
                        type="number"
                        label="Min Slab"
                        disabled={
                          slotIndex > 0 ||
                          !(watch("slots").length - 1 == slotIndex)
                        }
                        sx={{ width: 300 }}
                      />
                      <RHFTextField
                        name={`slots.${slotIndex}.maxSlab`}
                        type="number"
                        disabled={!(watch("slots").length - 1 == slotIndex)}
                        label="Max Slab"
                        sx={{ width: 300 }}
                      />
                      {isValid && watch("slots").length - 1 === slotIndex && (
                        <IconButton
                          onClick={() => {
                            append({
                              minSlab: +watch(`slots.${slotIndex}.maxSlab`) + 1,
                              maxSlab: 0,
                            });
                          }}
                        >
                          <Iconify icon="ph:plus-bold" />
                        </IconButton>
                      )}
                      {watch("slots").length - 1 === slotIndex &&
                        slotIndex >= 1 && (
                          <IconButton onClick={() => remove(slotIndex)}>
                            <Iconify icon="ph:minus-bold" />
                          </IconButton>
                        )}
                    </Stack>
                  </React.Fragment>
                ))}
              {isValid && (
                <Stack flexDirection={"row"} justifyContent={"end"}>
                  <LoadingButton
                    variant="contained"
                    loading={isSubmitting}
                    disabled={!isValid}
                    type="submit"
                  >
                    Upload Slots
                  </LoadingButton>
                </Stack>
              )}
            </Grid>
          </Box>
        </FormProvider>
        <Grid xs={12} md={6} lg={8} mt={2}>
          <VendorMoneyTransferTable
            tableData={slots}
            tableLabels={[
              { id: "id", label: "Slot" },
              { id: "minamount", label: "Min Amount" },
              { id: "maxamount", label: "Max Amount" },
            ]}
          />
        </Grid>
      </Box>
    </>
  );
}
