// @mui
import {
  Card,
  Table,
  Stack,
  TableRow,
  Select,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  Button,
  TextField,
  Box,
  MenuItem,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import React, { useState, useEffect, useContext } from "react";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form/FormProvider";
import { RHFSelect, RHFTextField } from "src/components/hook-form";

import { Icon } from "@iconify/react";
import { SchemeDetail } from "../ManageScheme/AddNewScheme";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure, notifyResult } from "src/utils/apiResult";

// ----------------------------------------------------------------------

type FormValuesProps = {
  categoryId: string;
  mainSchemeId: string;
  commissionSetting: {
    minSlab: number;
    maxSlab: number;
    productid: string;
    TransactionType: string;
    commissionType: string;
    agentCommission: string;
    distributorCommission: string;
    masterDistributorCommission: string;
    apiUserCommission: string;
    _id: string;
  }[];
};

export default function MATM() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const schemeDetail: any = useContext(SchemeDetail);

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

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    categoryId: schemeDetail.categoryId,
    mainSchemeId: schemeDetail.schemeId,
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

  useEffect(() => getAEPSSlots(), []);

  const getAEPSSlots = () => {
    let token = localStorage.getItem("token");
    let widthdrawArr: any = [];
    let miniStatementArr: any = [];
    let balanceInqArr: any = [];
    Api(`vendor/showAEPSSlots`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        Response.data.data?.slotsData?.vendor_slots.map(
          (item: any, index: any) => {
            widthdrawArr.push({
              minSlab: item.minSlab,
              maxSlab: item.maxSlab,
              productid: Response.data.data?.productData.filter(
                (row: any) =>
                  row?.productName?.toLowerCase() ==
                  item.TransactionType?.toLowerCase()
              )[0]._id,
              TransactionType: item.TransactionType,
              BankMaxPayout: item.BankMaxPayout,
              AEPSVendorPayout: item.AEPSVendorPayout,
              commissionType: "",
              agentCommission: "",
              distributorCommission: "",
              masterDistributorCommission: "",
              apiUserCommission: "",
              TDS: "",
              GST: "",
              _id: index,
            });
          }
        );
        miniStatementArr.push({
          minSlab: "",
          maxSlab: "",
          productid: Response.data.data?.productData.filter(
            (row: any) => row?.productName?.toLowerCase() == "mini statement"
          )[0]._id,
          TransactionType: "Mini Statement",
          commissionType: "",
          agentCommission: "",
          distributorCommission: "",
          masterDistributorCommission: "",
          apiUserCommission: "",
          TDS: "",
          GST: "",
          _id: "Mini Statement",
        });
        balanceInqArr.push({
          minSlab: "",
          maxSlab: "",
          productid: Response.data.data?.productData.filter(
            (row: any) => row?.productName?.toLowerCase() == "balance inquiry"
          )[0]._id,
          TransactionType: "Balance Inquiry",
          commissionType: "",
          agentCommission: "",
          distributorCommission: "",
          masterDistributorCommission: "",
          apiUserCommission: "",
          TDS: "",
          GST: "",
          _id: "Balance Inquiry",
        });
        let arry = widthdrawArr.concat(miniStatementArr, balanceInqArr);
        setValue("commissionSetting", arry);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const create_subscheme = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    const body = {
      ...data,
    };
    Api(`scheme/create_subscheme`, "POST", body, token).then(
      (Response: any) => {
        // Item 1b/1c: every response body is `{ code, message }` now, so
        // `responseCode` is never set - this success branch could not fire and a
        // failed save was toasted exactly like a successful one.
        notifyResult(enqueueSnackbar, Response, "Sub-scheme created.");
      }
    );
  };

  return (
    <Card>
      <FormProvider methods={methods} onSubmit={handleSubmit(create_subscheme)}>
        <Stack m={1}>
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
            save MATM scheme
          </Button>
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
                            {watch(`commissionSetting.${index}.minSlab`) &&
                              "Rs."}
                            {watch(`commissionSetting.${index}.minSlab`)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">
                            {watch(`commissionSetting.${index}.maxSlab`) &&
                              "Rs."}
                            {watch(`commissionSetting.${index}.maxSlab`)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">
                            {watch(
                              `commissionSetting.${index}.TransactionType`
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <RHFSelect
                            name={`commissionSetting.${index}.commissionType`}
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
                        {schemeDetail.schemeType == "directagent" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.agentCommission`}
                              label="Agent Charge"
                            />
                          </TableCell>
                        )}
                        {schemeDetail.schemeType == "neonetwork" && (
                          <React.Fragment>
                            <TableCell>
                              <RHFTextField
                                name={`commissionSetting.${index}.agentCommission`}
                                label="Agent Charge"
                              />
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
                        {schemeDetail.schemeType == "apiuser" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.apiUserCommission`}
                              label="Api User Charge"
                            />
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
  );
}
