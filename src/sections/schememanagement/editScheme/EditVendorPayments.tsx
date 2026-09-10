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
import { isOk, notifyFailure } from "src/utils/apiResult";

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
      agentCharge: number;
      apiUserCharge: number;
      commissionType: string;
      distributorCommission: number;
      masterDistributorCommission: number;
    }[];
  }[];
};

export default function EditVendorPayments({
  tableData,
  scheme,
  cateId,
  ...other
}: Props) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);
  const [isFetchSlots, setIsFetchSlots] = useState(false);
  const [vendorPaymentSlotData, setVendorPaymentSlotData] = useState<any>([]);
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
    { id: "commission", label: "Commission Tyape" },
    { id: "dis", label: "Distributor Commission" },
    { id: "mdis", label: "Master Distributor Commission" },
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
    Api(
      `scheme/getShemeDetail/` +
        schemeDetail.schemeId +
        "/" +
        schemeDetail.categoryId,
      "GET",
      "",
      ""
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
        if (isOk(Response)) {
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
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getVendorPaymentSlots = (val: string) => {
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          Response.data.data.map((element: any) => VendorPaymentSlot(element));
          handleOpen();
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const VendorPaymentSlot = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/vendor_payment_slots/${val._id}`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
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
          setVendorPaymentSlotData((prevState: any) => [
            ...prevState,
            {
              productId: val._id,
              productName: val.productName,
              slots: arr,
            },
          ]);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  function onSubmit(data: FormValuesProps) {
    if (edit == false) {
      setEdit(true);
    } else if (edit == true) {
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
          if (isOk(Response)) {
            setEdit(false);
            enqueueSnackbar("Scheme update Successfull !", {
              variant: "success",
            });
          } else {
            setEdit(false);
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    }
  }

  return (
    <React.Fragment>
      {tableData.length ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack mx={1} flexDirection={"row"} justifyContent={"end"}>
            <LoadingButton
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={() => getVendorPaymentSlots(schemeDetail.categoryId)}
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
          {fields.map((item: any, itemIndex: number) => {
            return (
              <Card sx={{ mt: 1 }}>
                <Typography variant="h5" sx={{ m: 1, textAlign: "center" }}>
                  {item.productName}
                </Typography>
                <TableContainer sx={{ overflow: "unset" }}>
                  <Scrollbar>
                    <Table sx={{ minWidth: 720 }} size="small">
                      <TableHeadCustom
                        headLabel={
                          scheme.schemeType == "neonetwork"
                            ? tableLabels
                            : scheme.schemeType == "directagent"
                            ? tableLabels1
                            : tableLabels2
                        }
                      />

                      <TableBody sx={{ overflow: "auto" }}>
                        {item.slots.map((row: any, rowIndex: number) => {
                          return (
                            <TableRow sx={{ py: 1 }}>
                              <TableCell>Rs.{row.minSlab}</TableCell>
                              <TableCell>Rs.{row.maxSlab}</TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.chargeType`}
                                    label="Charge Type"
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
                                ) : (
                                  <Typography textAlign={"center"}>
                                    {row.chargeType == "flat"
                                      ? "Rs."
                                      : row.chargeType == "percentage"
                                      ? "%"
                                      : "-"}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.agentCharge`}
                                    label="Agent Charge"
                                    type="number"
                                  />
                                ) : (
                                  <Typography textAlign={"center"}>
                                    {row.agentCharge || "-"}
                                  </Typography>
                                )}
                              </TableCell>
                              {scheme.schemeType !== "neonetwork" && (
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.apiUserCharge`}
                                      label="Api User Charge"
                                      type="number"
                                    />
                                  ) : (
                                    <Typography textAlign={"center"}>
                                      {row.apiUserCharge || "-"}
                                    </Typography>
                                  )}
                                </TableCell>
                              )}
                              <TableCell>
                                {edit ? (
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
                                ) : (
                                  <Typography textAlign={"center"}>
                                    {" "}
                                    {row.commissionType == "flat"
                                      ? "Rs."
                                      : row.commissionType == "percentage"
                                      ? "%"
                                      : "-"}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.distributorCommission`}
                                    label="Distributor Commission"
                                    type="number"
                                  />
                                ) : (
                                  <Typography textAlign={"center"}>
                                    {row.distributorCommission || "-"}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.masterDistributorCommission`}
                                    label="Master Distributor Commission"
                                    type="number"
                                  />
                                ) : (
                                  <Typography textAlign={"center"}>
                                    {row.masterDistributorCommission || "-"}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Card>
            );
          })}
        </FormProvider>
      ) : (
        <React.Fragment>
          <Typography mt={3} variant="h5" textAlign={"center"}>
            Scheme not created.{" "}
          </Typography>
          <Stack alignItems={"center"} mt={2}>
            <LoadingButton
              onClick={() => getVendorPaymentSlots(cateId)}
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
            updatedSlots={vendorPaymentSlotData}
            tableLabels={tableLabels}
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

  const LoginSchema = Yup.object().shape({});

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
          save Vendor Payment scheme
        </Button>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </Stack>
      {fields.map((item: any, itemIndex: number) => {
        return (
          <Card sx={{ mt: 1 }}>
            <Typography variant="h5" sx={{ m: 1, textAlign: "center" }}>
              {item.productName}
            </Typography>
            <TableContainer sx={{ overflow: "unset" }}>
              <Scrollbar>
                <Table sx={{ minWidth: 720 }} size="small">
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
                              name={`tableData.${itemIndex}.slots.${rowIndex}.agentCharge`}
                              label="Agent Charge"
                              type="number"
                            />
                          </TableCell>
                          {schType == "apiuser" && (
                            <TableCell>
                              <RHFTextField
                                name={`tableData.${itemIndex}.slots.${rowIndex}.apiUserCharge`}
                                label="Api User Charge"
                                type="number"
                              />
                            </TableCell>
                          )}
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
                              type="number"
                            />
                          </TableCell>
                          <TableCell>
                            <RHFTextField
                              name={`tableData.${itemIndex}.slots.${rowIndex}.masterDistributorCommission`}
                              label="Master Distributor Commission"
                              type="number"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        );
      })}
    </FormProvider>
  );
};
