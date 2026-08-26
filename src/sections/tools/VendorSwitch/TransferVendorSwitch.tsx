// import { useEffect, useState, useContext } from "react";
// import { MenuItem, Typography, Stack, Card } from "@mui/material";
// import { Helmet } from "react-helmet-async";
// import { useSnackbar } from "src/components/snackbar";

// import { CategoryContext } from "./ServicesVenderSwitch";
// import * as Yup from "yup";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import FormProvider, { RHFSelect } from "src/components/hook-form";
// import { LoadingButton } from "@mui/lab";
// import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
// import { useAuthContext } from "src/auth/useAuthContext";

// // ----------------------------------------------------------------------

// type FormValuesProps = {
//   vendorMode: "GLOBAL" | "USER_WISE";
//   neoNetworkVendor: {
//     vendorId: string;
//     vendorName: string;
//   };
//   apiUserVendor: {
//     vendorId: string;
//     vendorName: string;
//   };
//   directAgentVendor: {
//     vendorId: string;
//     vendorName: string;
//   };
// };

// export default function TransferVendorSwitch() {
//   const { Api } = useAuthContext();
//   const CategoryContaxt: any = useContext(CategoryContext);
//   const { enqueueSnackbar } = useSnackbar();
//   const [isLoading, setIsLoading] = useState(false);
//   const [productId, setProductId] = useState("");
//   const [vendorList, setVendorList] = useState([]);
//   const [isEdit, setIsEdit] = useState(false);

//   // Form Controller
//   const FilterSchema = Yup.object().shape({
//     // activeVendor: "",
//   });
//   const defaultValues: FormValuesProps = {
//     vendorMode: "GLOBAL",
//     neoNetworkVendor: {
//       vendorId: "",
//       vendorName: "",
//     },
//     apiUserVendor: {
//       vendorId: "",
//       vendorName: "",
//     },
//     directAgentVendor: {
//       vendorId: "",
//       vendorName: "",
//     },
//   };

//   const methods = useForm<FormValuesProps>({
//     resolver: yupResolver(FilterSchema),
//     defaultValues,
//   });

//   const {
//     getValues,
//     setValue,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = methods;

//   useEffect(() => {
//     getProductlist(CategoryContaxt?._id);
//   }, []);

//   const getProductlist = (val: string) => {
//     setIsLoading(true);
//     let token = localStorage.getItem("token");
//     Api(`product/get_ProductList/${val}`, "GET", "", token).then(
//       (Response: any) => {
//         if (Response?.status == 200) {
//           if (Response.data.code == 200) {
//             setProductId(Response.data.data[0]?._id);
//             Api(
//               `product/getActiveVendor/${Response.data.data[0]?._id}`,
//               "GET",
//               "",
//               token
//             ).then((Response: any) => {
//               if (Response?.status == 200) {
//                 if (Response.data.code == 200) {
//                   setValue(
//                     "neoNetworkVendor",
//                     Response.data.data.neoNetworkVendor
//                   );
//                   setValue("apiUserVendor", Response.data.data.apiUserVendor);
//                   setValue(
//                     "directAgentVendor",
//                     Response.data.data.directAgentVendor
//                   );
//                   TVendors();
//                 }
//               }
//             });
//           }
//         } else {
//           setIsLoading(false);
//         }
//       }
//     );
//   };

//   const TVendors = async () => {
//     let token = localStorage.getItem("token");
//     await Api(`product/transfer_vendor_list`, "GET", "", token).then(
//       (Response: any) => {
//         if (Response?.status == 200) {
//           if (Response.data.code == 200) {
//             setVendorList(Response.data.data);
//           }
//           setIsLoading(false);
//         } else {
//           setIsLoading(false);
//         }
//       }
//     );
//   };

//   const onSubmit = async (data: FormValuesProps) => {
//     if (!isEdit) {
//       setIsEdit(!isEdit);
//     } else {
//       let token = localStorage.getItem("token");
//       let body = {
//         vendorMode: data.vendorMode,
//         apiUserVendorId: data.apiUserVendor.vendorId,
//         neoNetworkVendorId: data.neoNetworkVendor.vendorId,
//         directAgentVendorId: data.directAgentVendor.vendorId,
//         productId: productId,
//       };
//       await Api("product/setActiveVendor", "POST", body, token).then(
//         (Response: any) => {
//           if (Response?.status == 200) {
//             if (Response.data.code == 200) {
//               enqueueSnackbar(Response.data.message);
//               setIsEdit(!isEdit);
//               getProductlist(CategoryContaxt?._id);
//             }
//           }
//         }
//       );
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Vendor Switch | Shampay Admin</title>
//       </Helmet>
//       {isLoading ? (
//         <ApiDataLoading />
//       ) : (
//         <Card sx={{ p: 2, width: { xs: "95%", sm: "50%" } }}>
//           <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
//             <Stack flexDirection={"row"} justifyContent={"end"} mb={1}>
//               <LoadingButton
//                 variant="contained"
//                 type="submit"
//                 loading={isSubmitting}
//               >
//                 {isEdit ? "Save" : "Edit"}
//               </LoadingButton>
//             </Stack>

//             {/* //neo vendor÷ */}
//             <Stack sx={{ gap: 2 }}>
//               <Stack
//                 flexDirection={"row"}
//                 justifyContent={"space-between"}
//                 gap={1}
//               >
//                 <Stack>
//                   <Typography variant="h6" noWrap>
//                     Neo Network vendor
//                   </Typography>
//                 </Stack>
//                 <Stack>
//                   {isEdit ? (
//                     <RHFSelect
//                       name="neoNetworkVendor.vendorId"
//                       label="Active Vendor"
//                       placeholder="Active Vendor"
//                       SelectProps={{
//                         native: false,
//                         sx: { textTransform: "capitalize", width: 250 },
//                       }}
//                     >
//                       {vendorList.map((item: any) => (
//                         <MenuItem key={item.vendorId} value={item.vendorId}>
//                           {item.vendorName}
//                         </MenuItem>
//                       ))}
//                     </RHFSelect>
//                   ) : (
//                     <Typography>
//                       {getValues("neoNetworkVendor.vendorName")}
//                     </Typography>
//                   )}
//                 </Stack>
//               </Stack>

//               <Stack
//                 flexDirection={"row"}
//                 justifyContent={"space-between"}
//                 gap={1}
//               >
//                 <Stack>
//                   <Typography variant="h6" noWrap>
//                     Direct Agent vendor
//                   </Typography>
//                 </Stack>
//                 <Stack>
//                   {isEdit ? (
//                     <RHFSelect
//                       name="directAgentVendor.vendorId"
//                       label="Active Vendor"
//                       placeholder="Active Vendor"
//                       SelectProps={{
//                         native: false,
//                         sx: { textTransform: "capitalize", width: 250 },
//                       }}
//                     >
//                       {vendorList.map((item: any) => (
//                         <MenuItem key={item.vendorId} value={item.vendorId}>
//                           {item.vendorName}
//                         </MenuItem>
//                       ))}
//                     </RHFSelect>
//                   ) : (
//                     <Typography>
//                       {getValues("directAgentVendor.vendorName")}
//                     </Typography>
//                   )}
//                 </Stack>
//               </Stack>

//               <Stack
//                 flexDirection={"row"}
//                 justifyContent={"space-between"}
//                 gap={1}
//               >
//                 <Stack>
//                   <Typography variant="h6" noWrap>
//                     Api User vendor
//                   </Typography>
//                 </Stack>
//                 <Stack>
//                   {isEdit ? (
//                     <RHFSelect
//                       name="apiUserVendor.vendorId"
//                       label="Active Vendor"
//                       placeholder="Active Vendor"
//                       SelectProps={{
//                         native: false,
//                         sx: { textTransform: "capitalize", width: 250 },
//                       }}
//                     >
//                       {vendorList.map((item: any) => (
//                         <MenuItem key={item.vendorId} value={item.vendorId}>
//                           {item.vendorName}
//                         </MenuItem>
//                       ))}
//                     </RHFSelect>
//                   ) : (
//                     <Typography>
//                       {getValues("apiUserVendor.vendorName")}
//                     </Typography>
//                   )}
//                 </Stack>
//               </Stack>
//               {/* <Stack
//                 flexDirection={"row"}
//                 justifyContent={"space-between"}
//                 gap={1}
//               >
//                 <Stack>
//                   <Typography variant="h6" noWrap>
//                     Vendor Mode
//                   </Typography>
//                 </Stack>

//                 <Stack>
//                   {isEdit ? (
//                     <RHFSelect
//                       name="vendorMode"
//                       label="Vendor Mode"
//                       SelectProps={{
//                         native: false,
//                         sx: { width: 250 },
//                       }}
//                     >
//                       <MenuItem value="GLOBAL">Global</MenuItem>
//                       <MenuItem value="USER_WISE">User Wise</MenuItem>
//                     </RHFSelect>
//                   ) : (
//                     <Typography>
//                       {getValues("vendorMode") === "GLOBAL"
//                         ? "Global"
//                         : "User Wise"}
//                     </Typography>
//                   )}
//                 </Stack>
//               </Stack> */}
//             </Stack>
//           </FormProvider>
//         </Card>
//       )}
//     </>
//   );
// }

import { useEffect, useState, useContext } from "react";
import { MenuItem, Typography, Stack } from "@mui/material";
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
  LoadingState,
} from "src/components/page-kit";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
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
        subtitle="Provider currently verifying this product."
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
        <VendorLane label="Active Vendor" divider={false}>
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
        <LoadingState label="Loading transfer vendors..." />
      ) : productVendors.length === 0 ? (
        <FormCard>
          <Typography sx={{ py: 4, textAlign: "center", color: "text.disabled" }}>
            No products configured for this category.
          </Typography>
        </FormCard>
      ) : (
        <Stack gap={2.5} sx={{ maxWidth: 760 }}>
          {productVendors.map((product) => (
            <ProductVendorCard
              key={product.productId}
              product={product}
              onSaveSuccess={() => getProductsByCategory(CategoryContaxt?._id)}
            />
          ))}
        </Stack>
      )}
    </>
  );
}
