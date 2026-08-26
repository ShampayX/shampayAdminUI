import { useEffect, useState, useContext } from "react";
import {
  Box,
  MenuItem,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";

import { CategoryContext } from "./ServicesVenderSwitch";
import * as Yup from "yup";
import { Form, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";
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
  moneyTransferVendors: {
    vendorName: string;
    vendorId: string;
    bankAccounts: {
      accountNumber: string;
      isAccountActive: boolean;
    }[];
    bankName: {
      name: string;
      isBankAccount: boolean;
    }[];
  }[];
  decentroDefaulBank: {
    accountNumber: string;
    bankName: string;
  };
  razorpayDefaulBank: {
    accountNumber: string;
    bankName: string;
  };
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

export default function VendorSwitch() {
  const { Api } = useAuthContext();
  const CategoryContaxt: any = useContext(CategoryContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  // Form Controller
  const FilterSchema = Yup.object().shape({
    // activeVendor: "",
  });
  const defaultValues: FormValuesProps = {
    vendorMode: "GLOBAL",
    moneyTransferVendors: [],
    decentroDefaulBank: {
      accountNumber: "",
      bankName: "",
    },
    razorpayDefaulBank: {
      accountNumber: "",
      bankName: "",
    },
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
    watch,
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
            setValue("vendorMode", Response.data.data[0].vendorMode);
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
    await Api(`product/moneyTransfer_vendor_list`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setValue("moneyTransferVendors", Response.data.data);
            Response.data.data.map((item: any) => {
              if (item.vendorName == "DECENTRO") {
                item.bankName.map((row: any, index: number) => {
                  row.isBankAccount &&
                    setValue("decentroDefaulBank", {
                      accountNumber: item.bankAccounts[index].accountNumber,
                      bankName: item.bankName[index].name,
                    });
                });
              }
              if (item.vendorName == "RAZORPAY") {
                item.bankAccounts.map((row: any, index: number) => {
                  row.isAccountActive &&
                    setValue("razorpayDefaulBank", {
                      accountNumber: item.bankAccounts[index].accountNumber,
                      bankName: item.bankName[index].name,
                    });
                });
              }
            });
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

  const updateDetail = () => {
    MTVendors();
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      {isLoading ? (
        <LoadingState label="Loading money transfer vendors..." />
      ) : (
        <Box sx={{ maxWidth: 760 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <FormCard
              title="Money Transfer vendors"
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
                    {getValues("moneyTransferVendors").map((item: any) => (
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
                    {getValues("moneyTransferVendors").map((item: any) => (
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
                    {getValues("moneyTransferVendors").map((item: any) => (
                      <MenuItem key={item.vendorId} value={item.vendorId}>
                        {item.vendorName}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                ) : (
                  <VendorValue value={getValues("apiUserVendor.vendorName")} />
                )}
              </VendorLane>

              <VendorLane
                label="Vendor Mode"
                hint="Global applies one vendor to everyone; User Wise follows per-user overrides."
                divider={false}
              >
                {isEdit ? (
                  <RHFSelect
                    name="vendorMode"
                    label="Vendor Mode"
                    SelectProps={{ native: false }}
                  >
                    <MenuItem value="GLOBAL">Global</MenuItem>
                    <MenuItem value="USER_WISE">User Wise</MenuItem>
                  </RHFSelect>
                ) : (
                  <VendorValue
                    value={
                      getValues("vendorMode") === "GLOBAL" ? "Global" : "User Wise"
                    }
                  />
                )}
              </VendorLane>
            </FormCard>
          </FormProvider>
        </Box>
      )}
    </>
  );
}

const VendorBanks = ({ element, Vendors, updateDetail }: any) => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [edit, setEdit] = useState(false);
  const [decentroBank, setDecentroBank] = useState({
    accountNumber: "",
    bankName: "",
    vendorId: "",
  });
  const [razorpayBank, setRazorpayBank] = useState({
    accountNumber: "",
    bankName: "",
    vendorId: "",
  });

  useEffect(() => {
    Vendors.map((item: any) => {
      if (item.vendorName == "DECENTRO") {
        item.bankName.map((row: any, index: number) => {
          row.isBankAccount &&
            setDecentroBank({
              accountNumber: item.bankAccounts[index].accountNumber,
              bankName: item.bankName[index].name,
              vendorId: item.vendorId,
            });
        });
      }
      if (item.vendorName == "RAZORPAY") {
        item.bankAccounts.map((row: any, index: number) => {
          row.isAccountActive &&
            setRazorpayBank({
              accountNumber: item.bankAccounts[index].accountNumber,
              bankName: item.bankName[index].name,
              vendorId: item.vendorId,
            });
        });
      }
    });
  }, [element]);

  const submit = async () => {
    if (!edit) {
      setEdit(!edit);
    } else {
      let token = localStorage.getItem("token");
      let body =
        element.vendorName == "DECENTRO"
          ? {
              bankAccounts: element.bankAccounts.map((item: any) => {
                if (item.accountNumber == decentroBank.accountNumber) {
                  return { ...item, isAccountActive: true };
                } else {
                  return { ...item, isAccountActive: false };
                }
              }),
              bankName: element.bankName.map((item: any) => {
                if (item.name == decentroBank.bankName) {
                  return { ...item, isBankAccount: true };
                } else {
                  return { ...item, isBankAccount: false };
                }
              }),
              vendorId: decentroBank.vendorId,
            }
          : {
              bankAccounts: element.bankAccounts.map((item: any) => {
                if (item.accountNumber == razorpayBank.accountNumber) {
                  return { ...item, isAccountActive: true };
                } else {
                  return { ...item, isAccountActive: false };
                }
              }),
              bankName: element.bankName.map((item: any) => {
                if (item.name == razorpayBank.bankName) {
                  return { ...item, isBankAccount: true };
                } else {
                  return { ...item, isBankAccount: false };
                }
              }),
              vendorId: razorpayBank.vendorId,
            };
      await Api("product/updateVendorBankDetails", "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              updateDetail();
              setEdit(!edit);
            }
          }
        }
      );
    }
  };

  return (
    <Stack
      flexDirection={"row"}
      my={1}
      gap={2}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Typography variant="subtitle1">{element.vendorName}</Typography>
      {edit ? (
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            Default Bank Account
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={
              element.vendorName == "DECENTRO"
                ? decentroBank.accountNumber
                : razorpayBank.accountNumber
            }
            label="Default Bank Account"
            // onChange={(e: any) => setBank(e.target.value)}
          >
            {element.bankAccounts.map((item: any, ind: number) => {
              return (
                <MenuItem
                  key={item._id}
                  value={item.accountNumber}
                  onClick={() => {
                    setDecentroBank({
                      accountNumber: item.accountNumber,
                      bankName: element.bankName[ind].name,
                      vendorId: element.vendorId,
                    });
                  }}
                >
                  {element.bankName[ind].name}({item.accountNumber})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        (decentroBank.accountNumber || razorpayBank.accountNumber) && (
          <Typography>
            {element.vendorName == "DECENTRO"
              ? `${decentroBank.bankName} - ${decentroBank.accountNumber}`
              : `${razorpayBank.bankName} - ${razorpayBank.accountNumber}`}
          </Typography>
        )
      )}
      <LoadingButton variant="contained" onClick={submit}>
        {edit ? "Save" : "Edit"}
      </LoadingButton>
    </Stack>
  );
};
