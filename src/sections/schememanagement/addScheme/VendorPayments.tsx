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
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import React, { useEffect, useContext } from "react";
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
import { notifyResult } from "src/utils/apiResult";

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
export default function VendorPayments({ tableData }: FormValuesProps) {
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
        // Item 1b/1c: every response body is `{ code, message }` now, so
        // `responseCode` is never set - this success branch could not fire and a
        // failed save was toasted exactly like a successful one.
        notifyResult(enqueueSnackbar, Response, "Sub-scheme created.");
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
                            {schemeDetail.schemeType == "apiuser" && (
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
    </React.Fragment>
  );
}
