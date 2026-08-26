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
import { SchemeDetail } from "../ManageScheme/EditScheme";

// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form/FormProvider";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { LoadingButton } from "@mui/lab";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import MotionModal from "src/components/animate/MotionModal";
import { Icon } from "@iconify/react";
import { token } from "stylis";
// ----------------------------------------------------------------------

interface Props extends CardProps {
  productId: any;
}

type FormValuesProps = {
  categoryId: string;
  mainSchemeId: string;
  productId: string;
  commissionSetting: {
    minSlab: number;
    maxSlab: number;
    chargeType: string;
    agentCharge: string;
    commissionType: string;
    distributorCommission: string;
    masterDistributorCommission: string;
    apiUserCharge: string;
    _id: number;
  }[];
};

export default function EditCreditCard({ productId }: Props) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchSlots, setIsFetchSlots] = useState(false);
  const [updatedSlots, setUpdatedSlots] = useState([]);
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
  ];

  schemeDetail.schemeType == "neonetwork" &&
    tableLabels.push(
      { id: "Agcommission", label: "Agent Charge" },
      { id: "commission", label: "Commission Type" },
      { id: "dis", label: "Distributor Commission" },
      { id: "mdis", label: "Master Distributor Commission" }
    );
  schemeDetail.schemeType == "apiuser" &&
    tableLabels.push({ id: "apicommission", label: "Api User Charge" });
  schemeDetail.schemeType == "directagent" &&
    tableLabels.push({ id: "Agcommission", label: "Agent Charge" });

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    categoryId: schemeDetail.categoryId,
    mainSchemeId: schemeDetail.schemeId,
    productId: productId,
    commissionSetting: [],
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getSchemeDetails();
  }, []);

  const CreditCardSlots = () => {
    setIsFetchSlots(true);
    let token = localStorage.getItem("token");
    Api(`vendor/get/credit_card_payment_slots`, "GET", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            let arr: any = [];
            Response.data.data[0].slots.map((item: any) => {
              arr.push({
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
            setUpdatedSlots(arr);
            handleOpen();
          }
        }
        setIsFetchSlots(false);
      }
    );
  };

  const getSchemeDetails = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    await Api(
      `scheme/getShemeDetail/` +
        schemeDetail.schemeId +
        "/" +
        schemeDetail.categoryId,
      "GET",

      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data != null) {
            if (Response.data.data?.succ?.commissionSetting.length) {
              setValue(
                "commissionSetting",
                Response.data.data?.succ?.commissionSetting.filter(
                  (item: any) => item.productId == productId
                )[0].productCommissionSetting
              );
            }
          } else {
            enqueueSnackbar("Data not Found", { variant: "error" });
          }
        }
        setIsLoading(false);
      }
    });
  };

  const onSubmit = (data: FormValuesProps) => {
    const token = localStorage.getItem("token");
    if (!edit) {
      setEdit(true);
      return;
    }
    const body = {
      mainSchemeId: data.mainSchemeId,
      commissionSetting: data.commissionSetting,
      productId: data.productId,
    };
    Api(`scheme/edit/payment`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setEdit(false);
          enqueueSnackbar("Scheme update Successfull !");
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  if (isLoading) {
    return <ApiDataLoading variant="table" columns={tableLabels} rows={6} minWidth={720} />;
  }

  return (
    <>
      {watch("commissionSetting").length ? (
        <Card>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack flexDirection={"row"} justifyContent={"end"} m={1}>
              <LoadingButton
                variant="outlined"
                sx={{ mr: 1 }}
                onClick={CreditCardSlots}
                loading={isFetchSlots}
              >
                Get Updated Slots
              </LoadingButton>
              {edit ? (
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={isSubmitting}
                >
                  save
                </LoadingButton>
              ) : (
                <LoadingButton variant="contained" type="submit">
                  edit
                </LoadingButton>
              )}
            </Stack>

            <TableContainer sx={{ overflow: "unset" }}>
              <Scrollbar>
                <Table sx={{ minWidth: 720 }} size="small">
                  <TableHeadCustom headLabel={tableLabels} />

                  <TableBody sx={{ overflow: "auto" }}>
                    {watch("commissionSetting").map(
                      (element: any, index: number) => {
                        return (
                          <TableRow key={element._id}>
                            <TableCell>
                              <Typography variant="subtitle1">
                                Rs.{watch(`commissionSetting.${index}.minSlab`)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle1">
                                Rs.{watch(`commissionSetting.${index}.maxSlab`)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {edit ? (
                                <RHFSelect
                                  name={`commissionSetting.${index}.chargeType`}
                                  label="Charge Type"
                                  SelectProps={{
                                    native: false,
                                    sx: { textTransform: "capitalize" },
                                  }}
                                >
                                  <MenuItem value="flat">Rs.</MenuItem>
                                  <MenuItem value="percentage">%</MenuItem>
                                </RHFSelect>
                              ) : (
                                <Typography>
                                  {watch(
                                    `commissionSetting.${index}.chargeType`
                                  ) == "flat"
                                    ? "Rs."
                                    : watch(
                                        `commissionSetting.${index}.chargeType`
                                      ) == "percentage"
                                    ? "%"
                                    : "-"}
                                </Typography>
                              )}
                            </TableCell>
                            {schemeDetail.schemeType == "directagent" && (
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSetting.${index}.agentCharge`}
                                    label="Agent Charge"
                                  />
                                ) : (
                                  <Typography>
                                    {watch(
                                      `commissionSetting.${index}.agentCharge`
                                    ) || "-"}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                            {schemeDetail.schemeType == "neonetwork" && (
                              <React.Fragment>
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`commissionSetting.${index}.agentCharge`}
                                      label="Agent Charge"
                                    />
                                  ) : (
                                    <Typography>
                                      {watch(
                                        `commissionSetting.${index}.agentCharge`
                                      ) || "-"}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {edit ? (
                                    <RHFSelect
                                      name={`commissionSetting.${index}.commissionType`}
                                      label="Commission Type"
                                      SelectProps={{
                                        native: false,
                                        sx: { textTransform: "capitalize" },
                                      }}
                                    >
                                      <MenuItem value="flat">Rs.</MenuItem>
                                      <MenuItem value="percentage">%</MenuItem>
                                    </RHFSelect>
                                  ) : (
                                    <Typography>
                                      {watch(
                                        `commissionSetting.${index}.commissionType`
                                      ) == "flat"
                                        ? "Rs."
                                        : watch(
                                            `commissionSetting.${index}.chargeType`
                                          ) == "percentage"
                                        ? "%"
                                        : "-"}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`commissionSetting.${index}.distributorCommission`}
                                      label="Distributor Commission"
                                    />
                                  ) : (
                                    <Typography>
                                      {watch(
                                        `commissionSetting.${index}.distributorCommission`
                                      ) || "-"}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`commissionSetting.${index}.masterDistributorCommission`}
                                      label="Master Distributor Commission"
                                    />
                                  ) : (
                                    <Typography>
                                      {watch(
                                        `commissionSetting.${index}.masterDistributorCommission`
                                      ) || "-"}
                                    </Typography>
                                  )}
                                </TableCell>
                              </React.Fragment>
                            )}
                            {schemeDetail.schemeType == "apiuser" && (
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSetting.${index}.apiUserCharge`}
                                    label="Api User Charge"
                                  />
                                ) : (
                                  <Typography>
                                    {watch(
                                      `commissionSetting.${index}.apiUserCharge`
                                    ) || "-"}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </FormProvider>
        </Card>
      ) : (
        <React.Fragment>
          <Typography mt={3} variant="h5" textAlign={"center"}>
            Scheme not created.{" "}
          </Typography>
          <Stack alignItems={"center"} mt={2}>
            <LoadingButton
              onClick={CreditCardSlots}
              variant="contained"
              loading={isFetchSlots}
            >
              Create Scheme
            </LoadingButton>
          </Stack>
        </React.Fragment>
      )}
      <MotionModal open={open} width={{ xs: "95%", md: "90%" }}>
        <UpdateNewSots
          schType={schemeDetail.schemeType}
          cateId={schemeDetail.categoryId}
          rowId={schemeDetail.schemeId}
          updatedSlots={updatedSlots}
          productId={productId}
          handleClose={handleClose}
          isSchemeCreated={!!watch("commissionSetting").length}
        />
      </MotionModal>
    </>
  );
}

const UpdateNewSots = ({
  schType,
  cateId,
  rowId,
  updatedSlots,
  handleClose,
  isSchemeCreated,
  productId,
}: any) => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const tableLabels = [
    { id: "transactionAmount", label: "Min Slab" },
    { id: "netpayout", label: "Max Slab" },
    { id: "chargetype", label: "Charge Type" },
  ];
  schType == "neonetwork" &&
    tableLabels.push(
      { id: "Agcommission", label: "Agent Charge" },
      { id: "commission", label: "Commission Type" },
      { id: "dis", label: "Distributor Commission" },
      { id: "mdis", label: "Master Distributor Commission" }
    );
  schType == "apiuser" &&
    tableLabels.push({ id: "apicommission", label: "Api User Charge" });
  schType == "directagent" &&
    tableLabels.push({ id: "Agcommission", label: "Agent Charge" });

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    categoryId: cateId,
    mainSchemeId: rowId,
    productId: productId,
    commissionSetting: updatedSlots,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const updateSubscheme = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    const body = {
      ...data,
    };
    Api(`scheme/edit/payment`, "POST", body, token).then((Response: any) => {
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
      <Stack m={1} flexDirection={"row"} justifyContent={"end"} gap={1}>
        <Button variant="contained" type="submit">
          <Icon
            icon="material-symbols:save"
            color="white"
            style={{ fontSize: 30, marginRight: 5 }}
          />{" "}
          Update Credit Card scheme
        </Button>
        <Button variant="outlined" onClick={handleClose}>
          cancel
        </Button>
      </Stack>

      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }} size="small">
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              {watch("commissionSetting").map((element: any, index: number) => {
                return (
                  <TableRow key={element._id}>
                    <TableCell>
                      <Typography variant="subtitle1">
                        Rs.{watch(`commissionSetting.${index}.minSlab`)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">
                        Rs.{watch(`commissionSetting.${index}.maxSlab`)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <RHFSelect
                        name={`commissionSetting.${index}.chargeType`}
                        label="Charge Type"
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize" },
                        }}
                      >
                        <MenuItem value="flat">Rs.</MenuItem>
                        <MenuItem value="percentage">%</MenuItem>
                      </RHFSelect>
                    </TableCell>

                    {schType == "neonetwork" && (
                      <React.Fragment>
                        <TableCell>
                          <RHFTextField
                            name={`commissionSetting.${index}.agentCharge`}
                            label="Agent Charge"
                          />
                        </TableCell>
                        <TableCell>
                          <RHFSelect
                            name={`commissionSetting.${index}.commissionType`}
                            label="Commission Type"
                            SelectProps={{
                              native: false,
                              sx: { textTransform: "capitalize" },
                            }}
                          >
                            <MenuItem value="flat">Rs.</MenuItem>
                            <MenuItem value="percentage">%</MenuItem>
                          </RHFSelect>
                        </TableCell>
                        <TableCell>
                          <RHFTextField
                            name={`commissionSetting.${index}.distributorCommission`}
                            label="Distributor Commission"
                          />
                        </TableCell>
                        <TableCell>
                          <RHFTextField
                            name={`commissionSetting.${index}.masterDistributorCommission`}
                            label="Master Distributor Commission"
                          />
                        </TableCell>
                      </React.Fragment>
                    )}
                    {schType == "directagent" && (
                      <TableCell>
                        <RHFTextField
                          name={`commissionSetting.${index}.agentCharge`}
                          label="Agent Charge"
                        />
                      </TableCell>
                    )}
                    {schType == "apiuser" && (
                      <TableCell>
                        <RHFTextField
                          name={`commissionSetting.${index}.apiUserCharge`}
                          label="Api User Charge"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </FormProvider>
  );
};
