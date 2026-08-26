import { useEffect, useState, useContext } from "react";
import { Box, MenuItem, Stack } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";

import { CategoryContext } from "./ServicesVenderSwitch";
import { useForm } from "react-hook-form";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  FormCard,
  PageActionButton,
  PageGhostButton,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import { VendorLane, VendorValue } from "./VendorLane";

// ----------------------------------------------------------------------

type VendorItem = {
  vendorId: string;
  vendorName: string;
};

type ProductVendorState = {
  productName: string;
  productId: string;
  vendorList: VendorItem[];
  activeVendorId: string;
  activeVendorName: string;
};

// Individual product card with its own form + edit state
function ProductVendorCard({
  product,
  onSaveSuccess,
}: {
  product: ProductVendorState;
  onSaveSuccess: () => void;
}) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [isEdit, setIsEdit] = useState(false);

  const methods = useForm<{ vendorId: string }>({
    defaultValues: { vendorId: product.activeVendorId },
  });

  const {
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Sync form if parent refreshes data
  useEffect(() => {
    setValue("vendorId", product.activeVendorId);
  }, [product.activeVendorId]);

  const onSubmit = async (data: { vendorId: string }) => {
    if (!isEdit) {
      setIsEdit(true);
      return;
    }

    const token = localStorage.getItem("token");
    await Api(
      "product/setActiveVendorForBeneVerify",
      "POST",
      { productName: product.productName, vendorId: data.vendorId },
      token
    ).then((Response: any) => {
      if (Response?.status == 200 && Response.data.code == 200) {
        enqueueSnackbar(Response.data.message);
        setIsEdit(false);
        onSaveSuccess();
      }
      if (Response?.status == 200 && Response.data.code == 400) {
        enqueueSnackbar(Response.data.message, { variant: "error" });
      }
    });
  };

  const activeVendorName = () => {
    const selectedId = getValues("vendorId");
    return (
      product.vendorList.find((v) => v.vendorId === selectedId)?.vendorName ||
      product.activeVendorName ||
      "—"
    );
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormCard
        title={product.productName}
        actions={
          isEdit ? (
            <PageActionButton
              type="submit"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
            >
              Save
            </PageActionButton>
          ) : (
            <PageGhostButton type="submit" startIcon={<EditIcon />}>
              Edit
            </PageGhostButton>
          )
        }
      >
        <VendorLane
          label="Active vendor"
          hint="Runs beneficiary verification for this product."
          divider={false}
        >
          {isEdit ? (
            <RHFSelect
              name="vendorId"
              label="Select Vendor"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {product.vendorList.map((item) => (
                <MenuItem key={item.vendorId} value={item.vendorId}>
                  {item.vendorName}
                </MenuItem>
              ))}
            </RHFSelect>
          ) : (
            <VendorValue value={activeVendorName()} />
          )}
        </VendorLane>
      </FormCard>
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

export default function PennyVerificationVendorSwitch() {
  const { Api } = useAuthContext();
  const CategoryContaxt: any = useContext(CategoryContext);
  const [isLoading, setIsLoading] = useState(false);
  const [productVendors, setProductVendors] = useState<ProductVendorState[]>(
    []
  );

  useEffect(() => {
    getProductsByCategory(CategoryContaxt?._id);
  }, []);

  const getProductsByCategory = (categoryId: string) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    Api(`product/getProductsBycategoryId/${categoryId}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          const products: { productName: string; productId: string }[] =
            Response.data.data;

          Promise.all(
            products.map((product) =>
              Api(
                `product/penny_verify_vendor_list`,
                "POST",
                { productName: product.productName },
                token
              ).then((res: any) => {
                if (res?.status == 200 && res.data.code == 200) {
                  const { vendorList, activeVendor } = res.data.data;
                  return {
                    productName: product.productName,
                    productId: product.productId,
                    vendorList: vendorList || [],
                    activeVendorId: activeVendor?.vendorId || "",
                    activeVendorName: activeVendor?.vendorName || "",
                  } as ProductVendorState;
                }
                return {
                  productName: product.productName,
                  productId: product.productId,
                  vendorList: [],
                  activeVendorId: "",
                  activeVendorName: "",
                } as ProductVendorState;
              })
            )
          ).then((results) => {
            setProductVendors(results);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      {isLoading ? (
        <LoadingState label="Loading verification vendors..." />
      ) : productVendors.length === 0 ? (
        <EmptyState
          icon={<AltRouteOutlinedIcon />}
          title="No products to route"
          description="This service has no products configured, so there is no verification vendor to set."
        />
      ) : (
        <Box sx={{ maxWidth: 760 }}>
          <Stack spacing={2.5}>
            {productVendors.map((product) => (
              <ProductVendorCard
                key={product.productId}
                product={product}
                onSaveSuccess={() => getProductsByCategory(CategoryContaxt?._id)}
              />
            ))}
          </Stack>
        </Box>
      )}
    </>
  );
}
