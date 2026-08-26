import { useEffect, useState, useContext } from "react";
import {
  Box,
  MenuItem,
  Typography,
  Stack,
  Card,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
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

// ----------------------------------------------------------------------

type FormValuesProps = {
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

interface Props {
  userId: string;
}

export default function VendorSwitch({ userId }: Props) {
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
  const defaultValues = {
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
        userId: userId,
        apiUserVendorId: data.apiUserVendor.vendorId,
        neoNetworkVendorId: data.neoNetworkVendor.vendorId,
        directAgentVendorId: data.directAgentVendor.vendorId,
        productId: productId,
      };

      await Api("product/setUserVendorSwitch", "POST", body, token).then(
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
        <Box sx={{ width: { xs: "95%", md: "50%" } }}>
          <ApiDataLoading variant="cards" rows={1} />
        </Box>
      ) : (
        <Card sx={{ p: 2, width: { xs: "95%", md: "50%" } }}>
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
                      {getValues("moneyTransferVendors").map((item: any) => (
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
                      {getValues("moneyTransferVendors").map((item: any) => (
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
                      {getValues("moneyTransferVendors").map((item: any) => (
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

            {/* default bank */}
            {/* <Divider sx={{ my: 2 }} /> */}

            {/* <Stack>
              <Typography variant="h5">Default Bank Accounts</Typography>
              {watch("moneyTransferVendors")?.length &&
                getValues("moneyTransferVendors").map((element: any) => {
                  return (
                    <VendorBanks
                      element={element}
                      updateDetail={updateDetail}
                      Vendors={getValues("moneyTransferVendors")}
                    />
                  );
                })}
            </Stack> */}
          </FormProvider>
        </Card>
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
