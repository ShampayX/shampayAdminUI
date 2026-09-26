import { useEffect, useState, useContext } from "react";
import { Box, MenuItem, Typography, Stack, Card } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";

import { CategoryContext } from "./ServicesVenderSwitch";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import { useParams } from "react-router-dom";
import { isOk, notifyFailure } from "src/utils/apiResult";
import VendorWarnings, {
  vendorWarningsOf,
} from "src/components/VendorWarnings";

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

interface Props {
  userId: string;
}

export default function DMT2VendorSwitch({ userId }: Props) {
  const { Api } = useAuthContext();
  const CategoryContaxt: any = useContext(CategoryContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [vendorList, setVendorList] = useState([]);
  const [vendorWarnings, setVendorWarnings] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  // Form Controller
  const FilterSchema = Yup.object().shape({
    // activeVendor: "",
  });
  const defaultValues = {
    neoNetworkVendor: {
      vendorId: "",
      vendorName: "",
    },
    apiUserVendor: {
      vendorId: "",
      vendorName: "",
    },
    directAgentVendor: {
      vendorId: "",
      vendorName: "",
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    getValues,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getProductlist(CategoryContaxt?._id);
  }, []);

  const getProductlist = (val: string) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setProductId(Response.data.data[0]?._id);
            Api(
              `product/getActiveVendor/${Response.data.data[0]?._id}`,
              "GET",
              "",
              token
            ).then((Response: any) => {
              if (isOk(Response)) {
                setValue(
                  "neoNetworkVendor",
                  Response.data.data.neoNetworkVendor
                );
                setValue("apiUserVendor", Response.data.data.apiUserVendor);
                setValue(
                  "directAgentVendor",
                  Response.data.data.directAgentVendor
                );
                MTVendors();
              } else {
                notifyFailure(enqueueSnackbar, Response);
              }
            });
          }
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const MTVendors = async () => {
    let token = localStorage.getItem("token");
    await Api(`product/dmt2_vendor_list`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setVendorList(Response.data.data);
          // Item 3b: an empty dropdown used to be indistinguishable from a
          // broken one. `warnings` sits beside `data`, not inside it.
          setVendorWarnings(vendorWarningsOf(Response));
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        setIsLoading(false);
      }
    );
  };

  const onSubmit = async (data: FormValuesProps) => {
    if (!isEdit) {
      setIsEdit(!isEdit);
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
          if (isOk(Response)) {
            enqueueSnackbar(Response.data.message);
            setIsEdit(!isEdit);
            getProductlist(CategoryContaxt?._id);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    }
  };

  return (
    <>
      <VendorWarnings warnings={vendorWarnings} />
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      {isLoading ? (
        <Box sx={{ width: { xs: "95%", sm: "50%" } }}>
          <ApiDataLoading variant="cards" rows={1} />
        </Box>
      ) : (
        <Card sx={{ p: 2, width: { xs: "95%", sm: "50%" } }}>
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

            {/* //neo vendor÷ */}
            <Stack sx={{ gap: 2 }}>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                gap={1}
              >
                <Stack>
                  <Typography variant="h6" noWrap>
                    Neo Network vendor
                  </Typography>
                </Stack>
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
                      {vendorList.map((item: any) => (
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

              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                gap={1}
              >
                <Stack>
                  <Typography variant="h6" noWrap>
                    Direct Agent vendor
                  </Typography>
                </Stack>
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
                      {vendorList.map((item: any) => (
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

              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                gap={1}
              >
                <Stack>
                  <Typography variant="h6" noWrap>
                    Api User vendor
                  </Typography>
                </Stack>
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
                      {vendorList.map((item: any) => (
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
      )}
    </>
  );
}
