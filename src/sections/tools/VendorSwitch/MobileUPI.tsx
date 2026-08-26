import { useEffect, useState, useContext } from "react";
import { MenuItem, Box } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";

import { CategoryContext } from "./ServicesVenderSwitch";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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

type FormValuesProps = {
  vendorMode: "GLOBAL" | "USER_WISE";
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

export default function MobileVendorSwitch() {
  const { Api } = useAuthContext();
  const CategoryContaxt: any = useContext(CategoryContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [vendorList, setVendorList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  // Form Controller
  const FilterSchema = Yup.object().shape({
    // activeVendor: "",
  });
  const defaultValues: FormValuesProps = {
    vendorMode: "GLOBAL",
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
            setValue("vendorMode", Response.data.data[0]?.vendorMode);

            Api(
              `product/getActiveVendor/${Response.data.data[0]?._id}`,
              "GET",
              "",
              token
            ).then((Response: any) => {
              if (Response?.status == 200) {
                if (Response.data.code == 200) {
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
                }
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
    await Api(`product/mobile_upi_vendor_list`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setVendorList(Response.data.data);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const onSubmit = async (data: FormValuesProps) => {
    if (!isEdit) {
      setIsEdit(!isEdit);
    } else {
      let token = localStorage.getItem("token");
      let body = {
        apiUserVendorId: data.apiUserVendor.vendorId,
        neoNetworkVendorId: data.neoNetworkVendor.vendorId,
        directAgentVendorId: data.directAgentVendor.vendorId,
        vendorMode: data.vendorMode,
        productId: productId,
      };
      await Api("product/setActiveVendor", "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              setIsEdit(!isEdit);
              getProductlist(CategoryContaxt?._id);
            }
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
        <LoadingState label="Loading Mobile UPI vendors..." />
      ) : (
        <Box sx={{ maxWidth: 760 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <FormCard
              title="Mobile UPI vendors"
              subtitle="Which provider handles each customer lane for this service."
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
                label="Neo Network vendor"
                hint="Retail network users on the platform."
              >
                {isEdit ? (
                  <RHFSelect
                    name="neoNetworkVendor.vendorId"
                    label="Active Vendor"
                    placeholder="Active Vendor"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {vendorList.map((item: any) => (
                      <MenuItem key={item.vendorId} value={item.vendorId}>
                        {item.vendorName}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                ) : (
                  <VendorValue value={getValues("neoNetworkVendor.vendorName")} />
                )}
              </VendorLane>

              <VendorLane
                label="Direct Agent vendor"
                hint="Agents onboarded directly, without a distributor."
              >
                {isEdit ? (
                  <RHFSelect
                    name="directAgentVendor.vendorId"
                    label="Active Vendor"
                    placeholder="Active Vendor"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {vendorList.map((item: any) => (
                      <MenuItem key={item.vendorId} value={item.vendorId}>
                        {item.vendorName}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                ) : (
                  <VendorValue value={getValues("directAgentVendor.vendorName")} />
                )}
              </VendorLane>

              <VendorLane
                label="API User vendor"
                hint="Partners integrating over the public API."
                divider={false}
              >
                {isEdit ? (
                  <RHFSelect
                    name="apiUserVendor.vendorId"
                    label="Active Vendor"
                    placeholder="Active Vendor"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {vendorList.map((item: any) => (
                      <MenuItem key={item.vendorId} value={item.vendorId}>
                        {item.vendorName}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                ) : (
                  <VendorValue value={getValues("apiUserVendor.vendorName")} />
                )}
              </VendorLane>
              {/* Vendor Mode select intentionally left commented out upstream */}
            </FormCard>
          </FormProvider>
        </Box>
      )}
    </>
  );
}
