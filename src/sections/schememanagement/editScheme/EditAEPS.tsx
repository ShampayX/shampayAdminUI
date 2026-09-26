// @mui
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  Button,
  MenuItem,
  Typography,
} from "@mui/material";
// components
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import React, { useState, useEffect, useContext } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
// form
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form/FormProvider";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";
import MotionModal from "src/components/animate/MotionModal";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { SchemeDetail } from "../ManageScheme/EditScheme";
import { Select } from "@mui/material";
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

type FormValuesProps = {
  categoryId: string;
  mainSchemeId: string;
  commissionSetting: {
    minSlab: number;
    maxSlab: number;
    productId: string;
    TransactionType: string;
    commissionType: string;
    agentCommission: string;
    distributorCommission: string;
    masterDistributorCommission: string;
    apiUserCommission: string;
    apiUserCharge: string;
    _id: string;
  }[];
};

type Slot = {
  _id: string | number;
  minSlab: number | string;
  maxSlab: number | string;
  TransactionType: string;
  productId: string;
  productName?: string;
  commissionType?: string;
  agentCommission?: string;
  distributorCommission?: string;
  masterDistributorCommission?: string;
  apiUserCommission?: string;
  apiUserCharge: string;
};

type ProductSlots = {
  productId: string;
  productName: string;
  slots: Slot[];
};

export default function EditAEPS() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);
  const [isFetchSlots, setIsFetchSlots] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedSlots, setUpdatedSlots] = useState<ProductSlots[]>([]);
  const [edit, setEdit] = useState(false);
  const [productList, setProductList] = useState<any[]>([]);

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
    { id: "txnType", label: "Transaction Type" },
    { id: "commission", label: "Commission Type" },
  ];

  schemeDetail.schemeType == "neonetwork" &&
    tableLabels.push(
      { id: "Agcommission", label: "Agent Commission" },
      { id: "dis", label: "Distributor Commission" },
      { id: "mdis", label: "Master Distributor Commission" }
    );
  schemeDetail.schemeType == "directagent" &&
    tableLabels.push({ id: "Agcommission", label: "Agent Commission" });
  schemeDetail.schemeType == "apiuser" &&
    tableLabels.push({ id: "apicommission", label: "Api User Commission" });
  tableLabels.push({ id: "apiUserCharge", label: "Api User Charge" });

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    categoryId: schemeDetail.categoryId,
    mainSchemeId: schemeDetail.schemeId,
    commissionSetting: [],
    productId: schemeDetail.productId,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getSchemeDetails();
  }, [schemeDetail?.schemeId, schemeDetail?.categoryId]);

  const buildProductWiseSlots = (products: any[], slots: any[]) => {
    return products.map((product) => ({
      productId: product._id,
      productName: product.productName,
      slots: slots.filter((slot: any) => slot.productId === product._id),
    }));
  };

  const getAEPSSlots = async () => {
    setEdit(false);
    setIsFetchSlots(true);

    const token = localStorage.getItem("token");

    try {
      const slotRes = await Api(`vendor/showAepsSlot`, "GET", "", token);
      const productRes = await Api(
        `product/get_ProductList/${schemeDetail.categoryId}`,
        "GET",
        "",
        token
      );

      if (
        slotRes?.status === 200 &&
        slotRes?.data?.code === 200 &&
        productRes?.data?.code === 200
      ) {
        setProductList(productRes.data.data || []);

        const slotWrappers = slotRes.data.data || [];

        const normalizedSlots = slotWrappers.flatMap((wrapper: any) => {
          // Find product details to get proper name
          const productInfo = productRes.data.data?.find(
            (p: any) => p._id === wrapper.productId
          );

          return (wrapper.slots || []).map((item: any, index: number) => ({
            minSlab: item.minSlab,
            maxSlab: item.maxSlab,
            productId: wrapper.productId,
            productName: productInfo?.productName || "",
            TransactionType: productInfo?.productName
              ?.replace(/AEPS/gi, "")
              .trim(),

            commissionType: "",
            agentCommission: "",
            distributorCommission: "",
            masterDistributorCommission: "",
            apiUserCommission: "",
            apiUserCharge: "",
            _id: item._id || index,
          }));
        });

        const productWiseData = buildProductWiseSlots(
          productRes.data.data,
          normalizedSlots
        );

        setUpdatedSlots(productWiseData);
        handleOpen();
      }
    } finally {
      setIsFetchSlots(false);
    }
  };

  const getSchemeDetails = async () => {
    setIsLoading(true);
    try {
      const schemeId = schemeDetail?.schemeId;
      const categoryId = schemeDetail?.categoryId;

      if (!schemeId || !categoryId) {
        setIsLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      const Response = await Api(
        `scheme/getShemeDetail/${schemeId}/${categoryId}`,
        "GET",
        "",
        token
      );

      const productRes = await Api(
        `product/get_ProductList/${categoryId}`,
        "GET",
        "",
        token
      );

      if (Response?.status == 200 && Response.data.code == 200) {
        if (Response.data.data != null) {
          if (Response.data.data?.succ?.commissionSetting.length) {
            // Make sure we're only setting data for THIS scheme
            const schemeData = Response.data.data?.succ?.commissionSetting;
            setValue("commissionSetting", schemeData);
          }
        } else {
          enqueueSnackbar("Data not Found", { variant: "error" });
        }
      }

      if (productRes?.data?.code === 200) {
        setProductList(productRes.data.data || []);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching data", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormValuesProps) => {
    if (!edit) {
      setEdit(true);
      return;
    }

    // Ensure we're sending the correct scheme data
    const body = {
      ...data,
      categoryId: schemeDetail.categoryId,
      mainSchemeId: schemeDetail.schemeId,
    };
    let token = localStorage.getItem("token");
    Api(`scheme/edit_subscheme`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setEdit(false);
        enqueueSnackbar("Scheme update Successfull !");
        // Refresh only this scheme's data
        getSchemeDetails();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  if (isLoading) {
    return (
      <ApiDataLoading
        variant="table"
        columns={tableLabels}
        rows={6}
        minWidth={720}
      />
    );
  }

  const commissionSettings = watch("commissionSetting");

  return (
    <>
      {commissionSettings.length ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack flexDirection="row" justifyContent="end" m={1}>
            <LoadingButton
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={getAEPSSlots}
              loading={isFetchSlots}
            >
              Get Updated Slots here
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

          {buildProductWiseSlots(productList, commissionSettings).map(
            (product: any) => (
              <Card key={product.productId} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ p: 2 }}>
                  {product.productName}
                </Typography>

                <TableContainer sx={{ overflow: "unset" }}>
                  <Scrollbar>
                    <Table size="small" sx={{ minWidth: 720 }}>
                      <TableHeadCustom headLabel={tableLabels} />

                      <TableBody>
                        {product.slots.map((slot: any, slotIndex: number) => {
                          const index = commissionSettings.findIndex(
                            (s: any) => s._id === slot._id
                          );

                          if (index === -1) return null;

                          const currentSlot = commissionSettings[index];
                          const commissionTypeValue =
                            currentSlot?.commissionType || "";

                          return (
                            <TableRow
                              key={`${product.productId}-${slot._id}-${index}`}
                            >
                              <TableCell>
                                Rs.{currentSlot?.minSlab || "-"}
                              </TableCell>

                              <TableCell>
                                Rs.{currentSlot?.maxSlab || "-"}
                              </TableCell>

                              <TableCell>
                                {currentSlot?.TransactionType || "-"}
                              </TableCell>

                              <TableCell>
                                {edit ? (
                                  <Controller
                                    name={`commissionSetting.${index}.commissionType`}
                                    control={control}
                                    defaultValue={commissionTypeValue}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        size="small"
                                        fullWidth
                                        onChange={(e) => {
                                          field.onChange(e);
                                        }}
                                      >
                                        <MenuItem value="">Select</MenuItem>
                                        <MenuItem value="flat">Rs.</MenuItem>
                                        <MenuItem value="percentage">
                                          %
                                        </MenuItem>
                                      </Select>
                                    )}
                                  />
                                ) : commissionTypeValue === "flat" ? (
                                  "Rs."
                                ) : commissionTypeValue === "percentage" ? (
                                  "%"
                                ) : (
                                  "-"
                                )}
                              </TableCell>

                              {schemeDetail.schemeType === "directagent" && (
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`commissionSetting.${index}.agentCommission`}
                                      size="small"
                                    />
                                  ) : (
                                    currentSlot?.agentCommission || "-"
                                  )}
                                </TableCell>
                              )}

                              {schemeDetail.schemeType === "neonetwork" && (
                                <>
                                  <TableCell>
                                    {edit ? (
                                      <RHFTextField
                                        name={`commissionSetting.${index}.agentCommission`}
                                        size="small"
                                      />
                                    ) : (
                                      currentSlot?.agentCommission || "-"
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {edit ? (
                                      <RHFTextField
                                        name={`commissionSetting.${index}.distributorCommission`}
                                        size="small"
                                      />
                                    ) : (
                                      currentSlot?.distributorCommission || "-"
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {edit ? (
                                      <RHFTextField
                                        name={`commissionSetting.${index}.masterDistributorCommission`}
                                        size="small"
                                      />
                                    ) : (
                                      currentSlot?.masterDistributorCommission ||
                                      "-"
                                    )}
                                  </TableCell>
                                </>
                              )}

                              {schemeDetail.schemeType === "apiuser" && (
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`commissionSetting.${index}.apiUserCommission`}
                                      size="small"
                                    />
                                  ) : (
                                    currentSlot?.apiUserCommission || "-"
                                  )}
                                </TableCell>
                              )}

                              {/* Api User Charge Column */}
                              {schemeDetail.schemeType === "apiuser" && (
                                <TableCell>
                                  {edit ? (
                                    <RHFTextField
                                      name={`commissionSetting.${index}.apiUserCharge`}
                                      size="small"
                                    />
                                  ) : (
                                    currentSlot?.apiUserCharge || "-"
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Card>
            )
          )}
        </FormProvider>
      ) : (
        <>
          <Typography mt={3} variant="h5" textAlign="center">
            Scheme not created.
          </Typography>

          <Stack alignItems="center" mt={2}>
            <LoadingButton
              onClick={getAEPSSlots}
              variant="contained"
              loading={isFetchSlots}
            >
              Create Scheme
            </LoadingButton>
          </Stack>
        </>
      )}

      <MotionModal open={open} width={{ xs: "95%", md: "90%" }}>
        <Scrollbar sx={{ maxHeight: { xs: 400, md: 800 } }}>
          <UpdateNewSots
            schType={schemeDetail.schemeType}
            cateId={schemeDetail.categoryId}
            rowId={schemeDetail.schemeId}
            updatedSlots={updatedSlots}
            tableLabels={tableLabels}
            handleClose={handleClose}
            isSchemeCreated={!!commissionSettings.length}
          />
        </Scrollbar>
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
  tableLabels,
}: any) => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    categoryId: cateId,
    mainSchemeId: rowId,
    commissionSetting: updatedSlots.flatMap((p: any) => p.slots),
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const commissionSettings = watch("commissionSetting");

  const updateSubscheme = async (data: FormValuesProps) => {
    const token = localStorage.getItem("token");

    // Ensure we're sending the correct scheme data
    const body = {
      ...data,
      categoryId: cateId,
      mainSchemeId: rowId,
    };

    await Api(
      isSchemeCreated ? `scheme/edit_subscheme` : `scheme/sub-scheme/add`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        notifyOk(enqueueSnackbar, Response, "Scheme updated.");
        handleClose();
      } else {
        // Item 1c: this read `Response.data.message` unguarded, which throws when
        // `Api()` resolves to the string "error" on a transport failure.
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(updateSubscheme)}>
      <Stack m={1} direction="row" justifyContent="end" gap={1}>
        <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
          Update AEPS Scheme
        </LoadingButton>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
      </Stack>

      {updatedSlots.map((product: any) => (
        <Card key={product.productId} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            {product.productName}
          </Typography>

          <TableContainer>
            <Scrollbar>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {product.slots.map((slot: any, slotIndex: number) => {
                    const index = commissionSettings.findIndex(
                      (s: any) => s._id === slot._id
                    );

                    if (index === -1) return null;

                    const currentSlot = commissionSettings[index];
                    const commissionTypeValue =
                      currentSlot?.commissionType || "";

                    return (
                      <TableRow
                        key={`${product.productId}-${slot._id}-${slotIndex}`}
                      >
                        <TableCell>Rs.{currentSlot?.minSlab || "-"}</TableCell>
                        <TableCell>Rs.{currentSlot?.maxSlab || "-"}</TableCell>
                        <TableCell>
                          {currentSlot?.TransactionType || "-"}
                        </TableCell>

                        <TableCell>
                          <Controller
                            name={`commissionSetting.${index}.commissionType`}
                            control={control}
                            defaultValue={commissionTypeValue}
                            render={({ field }) => (
                              <Select
                                {...field}
                                size="small"
                                fullWidth
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                              >
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value="flat">Rs.</MenuItem>
                                <MenuItem value="percentage">%</MenuItem>
                              </Select>
                            )}
                          />
                        </TableCell>

                        {schType === "directagent" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.agentCommission`}
                              size="small"
                            />
                          </TableCell>
                        )}

                        {schType === "neonetwork" && (
                          <>
                            <TableCell>
                              <RHFTextField
                                name={`commissionSetting.${index}.agentCommission`}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`commissionSetting.${index}.distributorCommission`}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`commissionSetting.${index}.masterDistributorCommission`}
                                size="small"
                              />
                            </TableCell>
                          </>
                        )}

                        {schType === "apiuser" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.apiUserCommission`}
                              size="small"
                            />
                          </TableCell>
                        )}
                        {/* Api User Charge Column */}
                        {schType === "apiuser" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.apiUserCharge`}
                              size="small"
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
        </Card>
      ))}
    </FormProvider>
  );
};
