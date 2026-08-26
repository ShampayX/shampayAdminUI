import { useEffect, useState } from "react";
import { Box, MenuItem, Typography, Stack, Card } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type FormValuesProps = {
  neoNetworkVendor: {
    vendorId: string;
    vendorName: string;
  };
  apiUserVendor: {
    vendorId: string;
    vendorName: string;
  };
  directAgentVendor: {
    vendorId: string;
    vendorName: string;
  };
};

function PayoutComponet(props: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const productId = props?.ProdectData?._id;
  const userId = props?.userId;

  const getStoredVendors = (productId: string) => {
    return {
      neoNetworkVendor: JSON.parse(
        localStorage.getItem(`neoNetworkVendor_${productId}`)!
      ) || {
        vendorId: props?.ProdectData?.neoNetworkVendor?.vendorId || "",
        vendorName: props?.ProdectData?.neoNetworkVendor?.vendorName || "",
      },
      apiUserVendor: JSON.parse(
        localStorage.getItem(`apiUserVendor_${productId}`)!
      ) || {
        vendorId: props?.ProdectData?.apiUserVendor?.vendorId || "",
        vendorName: props?.ProdectData?.apiUserVendor?.vendorName || "",
      },
      directAgentVendor: JSON.parse(
        localStorage.getItem(`directAgentVendor_${productId}`)!
      ) || {
        vendorId: props?.ProdectData?.directAgentVendor?.vendorId || "",
        vendorName: props?.ProdectData?.directAgentVendor?.vendorName || "",
      },
    };
  };

  const [selectedVendors, setSelectedVendors] = useState(
    getStoredVendors(productId)
  );

  const FilterSchema = Yup.object().shape({});
  const defaultValues = selectedVendors;

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    getValues,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    if (!isEdit) {
      setIsEdit(true);
    } else {
      let token = localStorage.getItem("token");
      let body = {
        userId: userId,
        apiUserVendorId: data.apiUserVendor.vendorId,
        neoNetworkVendorId: data.neoNetworkVendor.vendorId,
        directAgentVendorId: data.directAgentVendor.vendorId,
        productId: productId,
      };
      await Api("product/setUserVendorSwitch", "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200 && Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            const updatedVendors = {
              neoNetworkVendor:
                props?.vendorList.find(
                  (v: any) => v.vendorId === data.neoNetworkVendor.vendorId
                ) || {},
              apiUserVendor:
                props?.vendorList.find(
                  (v: any) => v.vendorId === data.apiUserVendor.vendorId
                ) || {},
              directAgentVendor:
                props?.vendorList.find(
                  (v: any) => v.vendorId === data.directAgentVendor.vendorId
                ) || {},
            };

            setSelectedVendors(updatedVendors);
            localStorage.setItem(
              `neoNetworkVendor_${productId}`,
              JSON.stringify(updatedVendors.neoNetworkVendor)
            );
            localStorage.setItem(
              `apiUserVendor_${productId}`,
              JSON.stringify(updatedVendors.apiUserVendor)
            );
            localStorage.setItem(
              `directAgentVendor_${productId}`,
              JSON.stringify(updatedVendors.directAgentVendor)
            );

            setValue(
              "neoNetworkVendor.vendorName",
              updatedVendors.neoNetworkVendor.vendorName
            );
            setValue(
              "apiUserVendor.vendorName",
              updatedVendors.apiUserVendor.vendorName
            );
            setValue(
              "directAgentVendor.vendorName",
              updatedVendors.directAgentVendor.vendorName
            );

            setIsEdit(false);
          }
        }
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      {isLoading ? (
        <Box sx={{ width: { xs: "95%", sm: "50%" } }}>
          <ApiDataLoading variant="cards" rows={1} />
        </Box>
      ) : (
        <Stack justifyContent={"space-between"}>
          <Card sx={{ p: 2, mt: 3, width: { xs: "95%", sm: "50%" } }}>
            <Typography>{props?.ProdectData?.productName}</Typography>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Stack flexDirection={"row"} justifyContent={"end"} mb={1}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={isSubmitting}
                >
                  {isEdit ? "Save" : "Edit"}
                </LoadingButton>
              </Stack>

              <Stack sx={{ gap: 2 }}>
                {/* Neo Network Vendor */}
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  gap={1}
                >
                  <Typography variant="h6" noWrap>
                    Neo Network Vendor
                  </Typography>
                  <Stack>
                    {isEdit ? (
                      <RHFSelect
                        name="neoNetworkVendor.vendorId"
                        label="Active Vendor"
                        placeholder="Active Vendor"
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize", width: 250 },
                        }}
                      >
                        {props.vendorList.map((item: any) => (
                          <MenuItem key={item.vendorId} value={item.vendorId}>
                            {item.vendorName}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    ) : (
                      <Typography>
                        {getValues("neoNetworkVendor.vendorName")}
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                {/* Direct Agent Vendor */}
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  gap={1}
                >
                  <Typography variant="h6" noWrap>
                    Direct Agent Vendor
                  </Typography>
                  <Stack>
                    {isEdit ? (
                      <RHFSelect
                        name="directAgentVendor.vendorId"
                        label="Active Vendor"
                        placeholder="Active Vendor"
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize", width: 250 },
                        }}
                      >
                        {props.vendorList.map((item: any) => (
                          <MenuItem key={item.vendorId} value={item.vendorId}>
                            {item.vendorName}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    ) : (
                      <Typography>
                        {getValues("directAgentVendor.vendorName")}
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                {/* API User Vendor */}
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  gap={1}
                >
                  <Typography variant="h6" noWrap>
                    API User Vendor
                  </Typography>
                  <Stack>
                    {isEdit ? (
                      <RHFSelect
                        name="apiUserVendor.vendorId"
                        label="Active Vendor"
                        placeholder="Active Vendor"
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize", width: 250 },
                        }}
                      >
                        {props?.vendorList.map((item: any) => (
                          <MenuItem key={item.vendorId} value={item.vendorId}>
                            {item.vendorName}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    ) : (
                      <Typography>
                        {getValues("apiUserVendor.vendorName")}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </FormProvider>
          </Card>
        </Stack>
      )}
    </>
  );
}

export default PayoutComponet;
