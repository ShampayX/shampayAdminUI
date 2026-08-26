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
  Grid,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import React, { useEffect, useContext, useState } from "react";
import { Icon } from "@iconify/react";
// form
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import * as Yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SchemeDetail } from "../ManageScheme/AddNewScheme";
import { useAuthContext } from "src/auth/useAuthContext";

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

let updated_Content: any = [];
export default function PayoutTransfer({ tableData }: FormValuesProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);

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
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const { fields }: any = useFieldArray({
    name: "tableData",
    control,
  });

  const tableLabels = [
    { id: "transactionAmount", label: "Min Slab" },
    { id: "netpayout", label: "Max Slab" },
    { id: "chargetype", label: "Charge Type" },
    { id: "Agcommission", label: "Agent Charge" },
    { id: "commission", label: "Commission Type" },
    { id: "dis", label: "Distributor Commission" },
    { id: "mdis", label: "Master Distributor Commission" },
  ];
  const tableLabels1 = [
    { id: "transactionAmount", label: "Min Slab" },
    { id: "netpayout", label: "Max Slab" },
    { id: "chargetype", label: "Charge Type" },
    { id: "Agcommission", label: "Direct Agent Charge" },
  ];
  const tableLabels2 = [
    { id: "transactionAmount", label: "Transaction Amount" },
    { id: "netpayout", label: "Net Payout" },
    { id: "chargetype", label: "Change Type" },
    { id: "Apicommission", label: "API User charge" },
  ];

  const onSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let slots: any = [];
    data.tableData
      .map((row: any) => row)
      .map((item: any) => {
        item.slots.map((element: any) => slots.push(element));
      });

    const body = {
      categoryId: schemeDetail.categoryId,
      mainSchemeId: schemeDetail.schemeId,
      commissionSetting: slots,
    };
    Api(`scheme/create_subscheme`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.responseCode == 200) {
            enqueueSnackbar(Response.data.responseMessage);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  return (
    <React.Fragment>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack mx={1}>
          <Button
            variant="contained"
            style={{ alignSelf: "flex-end" }}
            // onClick={() => create_subscheme()}
            type="submit"
          >
            <Icon
              icon="material-symbols:save"
              color="white"
              style={{ fontSize: 30, marginRight: 5 }}
            />{" "}
            save Vendor Payment scheme
          </Button>
        </Stack>
        <Grid container spacing={1}>
          {fields.map((item: any, itemIndex: number) => (
            <Grid item xs={4} md={6} key={item.id || itemIndex}>
              <Card>
                <Typography variant="h5" sx={{ m: 1, textAlign: "center" }}>
                  {item.productName}
                </Typography>
                <TableContainer>
                  <Scrollbar>
                    <Table size="small">
                      <TableHeadCustom
                        headLabel={
                          schemeDetail.schemeType == "neonetwork"
                            ? tableLabels
                            : schemeDetail.schemeType == "directagent"
                            ? tableLabels1
                            : tableLabels2
                        }
                      />

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
                                  <MenuItem value="flat">Rs</MenuItem>
                                  <MenuItem value="percentage">%</MenuItem>
                                </RHFSelect>
                              </TableCell>
                              {schemeDetail.schemeType == "apiuser" && (
                                <TableCell>
                                  <RHFTextField
                                    name={`tableData.${itemIndex}.slots.${rowIndex}.apiUserCharge`}
                                    label="Api User Charge"
                                    type="number"
                                  />
                                </TableCell>
                              )}
                              {schemeDetail.schemeType == "neonetwork" && (
                                <>
                                  <TableCell>
                                    <RHFTextField
                                      name={`tableData.${itemIndex}.slots.${rowIndex}.agentCharge`}
                                      label="Agent Charge"
                                      type="number"
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
          ))}
        </Grid>
      </FormProvider>
    </React.Fragment>
  );
}
