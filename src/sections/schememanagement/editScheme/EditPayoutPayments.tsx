// @mui
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
// components
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import React, { useContext, useEffect, useState } from "react";
import { useAuthContext } from "src/auth/useAuthContext";

// form
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import * as Yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@iconify/react";
import { LoadingButton } from "@mui/lab";
import MotionModal from "src/components/animate/MotionModal";
import { SchemeDetail } from "../ManageScheme/EditScheme";

// ----------------------------------------------------------------------

interface Props extends CardProps {
  tableData: any;
  scheme: any;
  cateId: any;
}

type FormValuesProps = {
  tableData: {
    productId: string;
    productName: string;
    slots: {
      _id: string;
      minSlab: string;
      maxSlab: string;
      chargeType: string;
      agentCharge: string;
      apiUserCharge: string;
      commissionType: string;
      distributorCommission: string;
      masterDistributorCommission: string;
    }[];
  }[];
};

export default function EditPayoutPayments({
  tableData,
  scheme,
  cateId,
  ...other
}: Props) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);
  const [isFetchSlots, setIsFetchSlots] = useState(false);
  const [payoutSlotData, setPayoutSlotData] = useState<any>([]);
  const [edit, setEdit] = useState(false);

  //modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    getSchemeDetails();
  };

  const tableLabels = [
    { id: "transactionAmount", label: "Min Slab" },
    { id: "netpayout", label: "Max Slab" },
    { id: "chargetype", label: "Charge Type" },
    { id: "Agcommission", label: "Agent Charge" },
    // { id: "commission", label: "Commission Tyape" },
    // { id: "dis", label: "Distributor Commission" },
    // { id: "mdis", label: "Master Distributor Commission" },
  ];
  const tableLabels1 = [
    { id: "minSlab", label: "Min Slab" },
    { id: "maxSlab", label: "Max Slab" },
    { id: "chrTyp", label: "Charge Type" },
    { id: "Agcommission", label: "Direct Agent Charge" },
  ];
  const tableLabels2 = [
    { id: "minSlab", label: "Min Slab" },
    { id: "maxSlab", label: "Max Slab" },
    { id: "chrTyp", label: "Charge Type" },
    { id: "apicommission", label: "Api user Charge" },
  ];

  const LoginSchema = Yup.object().shape({});

  const defaultValues = {
    tableData: tableData,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields }: any = useFieldArray({
    name: "tableData",
    control,
  });

  useEffect(() => {
    getSchemeDetails();
  }, []);

  const getSchemeDetails = () => {
    const token = localStorage.getItem("token");
    Api(
      `scheme/getShemeDetail/` +
        schemeDetail.schemeId +
        "/" +
        schemeDetail.categoryId,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data != null) {
            // enqueueSnackbar(Response.data.message);
            if (Response.data.data?.succ?.commissionSetting.length) {
              getSlotsUsingProduct(Response.data.data?.succ?.commissionSetting);
            }
          } else {
            enqueueSnackbar("Data not Found", { variant: "error" });
          }
        } else {
        }
      }
    });
  };

  const getSlotsUsingProduct = async (val: any) => {
    let token = localStorage.getItem("token");
    await Api(`product/get_ProductList/${cateId}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            let arr: any = [];
            Response.data.data.map((item: any) => {
              let slotsArr: any = [];
              val.map((row: any) => {
                if (item._id == row.productId) {
                  slotsArr.push(row);
                }
              });
              arr.push({
                productId: item._id,
                productName: item.productName,
                slots: slotsArr,
              });
            });
            setValue("tableData", arr);
          }
        }
      }
    );
  };

  const getVendorPaymentSlots = (val: string) => {
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          const product = Response.data.data.filter(
            (item: any) => item.productName?.toUpperCase() !== "UPI PAYOUT"
          );

          product.forEach((element: any) => VendorPayoutSlot(element));
          if (product.length > 0) {
            handleOpen();
          }
        }
      }
    );
  };

  const VendorPayoutSlot = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/payoutPaymentSlots`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          let arr: any = [];
          Response.data.data[0].slots.map((item: any) => {
            arr.push({
              productId: val._id,
              _id: item._id,
              minSlab: item.minSlab,
              maxSlab: item.maxSlab,
              chargeType: "",
              agentCharge: "",
              apiUserCharge: "",
              commissionType: "",
              distributorCommission: "",
              masterDistributorCommission: "",
            });
          });
          setPayoutSlotData((prevState: any) => [
            ...prevState,
            {
              productId: val._id,
              productName: val.productName,
              slots: arr,
            },
          ]);
        }
      }
    });
  };

  const getVendorPaymentUpiSlots = (val: string) => {
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          const upiProduct = Response.data.data.find(
            (item: any) => item.productName?.toUpperCase() === "UPI PAYOUT"
          );

          if (upiProduct) {
            VendorPayoutUpiSlot(upiProduct);
            handleOpen();
          } else {
            console.warn("UPI PAYOUT product not found.");
          }
        }
      }
    );
  };

  const VendorPayoutUpiSlot = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/payoutPaymentSlots_UPI`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          let arr: any = [];
          Response.data.data[0].slots.forEach((item: any) => {
            arr.push({
              productId: val._id,
              _id: item._id,
              minSlab: item.minSlab,
              maxSlab: item.maxSlab,
              chargeType: "",
              agentCharge: "",
              apiUserCharge: "",
              commissionType: "",
              distributorCommission: "",
              masterDistributorCommission: "",
            });
          });

          setPayoutSlotData((prevState: any) => {
            const filtered = prevState.filter(
              (item: any) => item.productName?.toUpperCase() !== "UPI PAYOUT"
            );
            return [
              ...filtered,
              {
                productId: val._id,
                productName: val.productName,
                slots: arr,
              },
            ];
          });
        }
      }
    );
  };

  function onSubmit(data: FormValuesProps) {
    if (edit === false) {
      setEdit(true);
    } else if (edit === true) {
      let slots: any = [];
      data.tableData
        .map((row: any) => row)
        .map((item: any) => {
          item.slots.map((element: any) => slots.push(element));
        });

      const body = {
        categoryId: cateId,
        mainSchemeId: scheme._id,
        commissionSetting: slots,
      };
      let token = localStorage.getItem("token");
      Api(`scheme/edit_subscheme/`, "POST", body, token).then(
        (Response: any) => {
          if (Response?.status === 200) {
            if (Response.data.code === 200) {
              setEdit(false);
              enqueueSnackbar("Scheme update Successfull!");
            } else {
              setEdit(false);
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    }
  }

  const handleClick = () => {
    getVendorPaymentSlots(schemeDetail.categoryId);
    getVendorPaymentUpiSlots(schemeDetail.categoryId);
  };

  return (
    <React.Fragment>
      {tableData.length ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack mx={1} flexDirection={"row"} justifyContent={"end"}>
            <LoadingButton
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={handleClick}
              loading={isFetchSlots}
            >
              Get Updated Slots
            </LoadingButton>
            <Button
              variant="contained"
              style={{ alignSelf: "flex-end" }}
              type="submit"
            >
              <Icon
                icon="material-symbols:save"
                color="white"
                style={{ fontSize: 30, marginRight: 5 }}
              />{" "}
              {!edit ? "edit" : "save"}
            </Button>
          </Stack>
          <br />

          <Grid container spacing={1}>
            {fields.map((item: any, itemIndex: number) => (
              <Grid item xs={6} md={6} lg={3.85} key={item.id || itemIndex}>
                <Card>
                  <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
                    {item.productName}
                  </Typography>
                  <TableContainer>
                    <Scrollbar>
                      <Table size="small">
                        <TableHeadCustom headLabel={tableLabels} />
                        <TableBody>
                          {item.slots.map((row: any, rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              <TableCell>Rs.{row.minSlab}</TableCell>
                              <TableCell>Rs.{row.maxSlab}</TableCell>
                              <TableCell>
                                <RHFSelect
                                  name={`tableData.${itemIndex}.slots.${rowIndex}.chargeType`}
                                  label="Charge Type"
                                  SelectProps={{
                                    sx: { width: 100 },
                                  }}
                                >
                                  <MenuItem value="flat">Rs.</MenuItem>
                                  <MenuItem value="percentage">%</MenuItem>
                                </RHFSelect>
                              </TableCell>

                              {schemeDetail.schemeType === "apiuser" && (
                                <TableCell>
                                  <RHFTextField
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.apiUserCharge`}
                                    label="Api User Charge"
                                    type="string"
                                  />
                                </TableCell>
                              )}

                              {schemeDetail.schemeType === "neonetwork" && (
                                <>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.agentCharge`}
                                      label="Agent Charge"
                                      type="string"
                                      SelectProps={{
                                        sx: { width: 10 },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <RHFSelect
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.commissionType`}
                                      label="Commission Type"
                                    >
                                      <MenuItem value="flat">Rs.</MenuItem>
                                      <MenuItem value="percentage">%</MenuItem>
                                    </RHFSelect>
                                  </TableCell>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.distributorCommission`}
                                      label="Distributor Commission"
                                      type="string"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.masterDistributorCommission`}
                                      label="Master Distributor Commission"
                                      type="string"
                                    />
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                </Card>
              </Grid>
            ))}
          </Grid>
        </FormProvider>
      ) : (
        <React.Fragment>
          <Typography mt={3} variant="h5" textAlign={"center"}>
            Scheme not created.{" "}
          </Typography>
          <Stack alignItems={"center"} mt={2}>
            <LoadingButton
              onClick={() => handleClick()}
              variant="contained"
              loading={isFetchSlots}
            >
              Create Scheme
            </LoadingButton>
          </Stack>
        </React.Fragment>
      )}
      <MotionModal open={open} width={{ xs: "95%", md: "90%" }}>
        <Scrollbar sx={{ maxHeight: { xs: 400, md: 800 } }}>
          <UpdateNewSots
            schType={schemeDetail.schemeType}
            cateId={schemeDetail.categoryId}
            rowId={schemeDetail.schemeId}
            updatedSlots={payoutSlotData}
            tableLabels={
              schemeDetail.schemeType == "neonetwork"
                ? tableLabels
                : schemeDetail.schemeType == "directagent"
                ? tableLabels1
                : tableLabels2
            }
            handleClose={handleClose}
            isSchemeCreated={!!tableData.length}
          />
        </Scrollbar>
      </MotionModal>
    </React.Fragment>
  );
}

const UpdateNewSots = ({
  schType,
  cateId,
  rowId,
  updatedSlots,
  handleClose,
  isSchemeCreated,
  tableLabels,
}: any) => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const LoginSchema = Yup.object().shape({
    tableData: Yup.array().of(
      Yup.object().shape({
        productId: Yup.string().required("Product is required"),
        productName: Yup.string().required("Product Name is required"),
        slots: Yup.array().of(
          Yup.object().shape({
            minSlab: Yup.number().required("Min Slab is required"),
            maxSlab: Yup.number().required("Max Slab is required"),
            chargeType: Yup.string().required("Charge Type is required"),
            apiUserCharge: Yup.mixed()
              .test(
                "not-null",
                "Api User Charge is required",
                (value) => value !== null
              )
              .test("not-empty", "Api User Charge cannot be empty", (value) =>
                typeof value === "string" ? value.trim() !== "" : true
              ),
          })
        ),
      })
    ),
  });

  const defaultValues = {
    tableData: updatedSlots,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields }: any = useFieldArray({
    name: "tableData",
    control,
  });

  useEffect(() => {
    setValue("tableData", updatedSlots);
  }, [updatedSlots]);

  const updateSubscheme = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");

    let slots: any = [];

    data.tableData
      .map((row: any) => row)
      .map((item: any) => {
        item.slots.map((element: any) => slots.push(element));
      });

    const body = {
      categoryId: cateId,
      mainSchemeId: rowId,
      commissionSetting: slots,
    };
    Api(
      isSchemeCreated ? `scheme/edit_subscheme` : `scheme/sub-scheme/add`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          handleClose();
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(updateSubscheme)}>
      <Stack mx={1} flexDirection={"row"} justifyContent={"end"} gap={1}>
        <Button
          variant="contained"
          style={{ alignSelf: "flex-end" }}
          type="submit"
        >
          <Icon
            icon="material-symbols:save"
            color="white"
            style={{ fontSize: 30, marginRight: 5 }}
          />{" "}
          save Vendor Payment scheme heloo===
        </Button>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {fields.map((item: any, itemIndex: number) => {
          return (
            <Grid item xs={6} md={1} lg={6} key={item.id || itemIndex}>
              <Card>
                <Typography variant="h5" sx={{ m: 1, textAlign: "center" }}>
                  {item.productName}
                </Typography>
                <TableContainer sx={{ overflow: "unset" }}>
                  <Scrollbar>
                    <Table size="small">
                      <TableHeadCustom headLabel={tableLabels} />

                      <TableBody sx={{ overflow: "auto" }}>
                        {item.slots.map((row: any, rowIndex: number) => {
                          return (
                            <TableRow>
                              <TableCell>Rs.{row.minSlab}</TableCell>
                              <TableCell>Rs.{row.maxSlab}</TableCell>
                              <TableCell>
                                <RHFSelect
                                  name={`tableData.${itemIndex}.slots.${rowIndex}.chargeType`}
                                  label="Charge Type"
                                  SelectProps={{
                                    native: false,
                                    sx: {
                                      textTransform: "capitalize",
                                      width: 120,
                                    },
                                  }}
                                >
                                  <MenuItem value="flat">Rs.</MenuItem>
                                  <MenuItem value="percentage">%</MenuItem>
                                </RHFSelect>
                              </TableCell>

                              {schType == "apiuser" && (
                                <TableCell>
                                  <RHFTextField
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.apiUserCharge`}
                                    label="Api User Charge"
                                    type="string"
                                  />
                                </TableCell>
                              )}
                              {schType == "neonetwork" && (
                                <>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.agentCharge`}
                                      label="Agent Charge"
                                      type="string"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <RHFSelect
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.commissionType`}
                                      label="Commission Type"
                                      SelectProps={{
                                        native: false,
                                        sx: {
                                          textTransform: "capitalize",
                                          width: 200,
                                        },
                                      }}
                                    >
                                      <MenuItem value="flat">Rs.</MenuItem>
                                      <MenuItem value="percentage">%</MenuItem>
                                    </RHFSelect>
                                  </TableCell>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.distributorCommission`}
                                      label="Distributor Commission"
                                      type="string"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.masterDistributorCommission`}
                                      label="Master Distributor Commission"
                                      type="string"
                                    />
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </FormProvider>
  );
};
