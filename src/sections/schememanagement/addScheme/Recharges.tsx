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
import { notifyResult } from "src/utils/apiResult";

// ----------------------------------------------------------------------

type FormValuesProps = {
  categoryId: string;
  mainSchemeId: string;
  commissionSetting: {
    productId: string;
    productName: string;
    category: string;
    agentCommission: string;
    distributorCommission: string;
    masterDistributorCommission: string;
    apiUserCommission: string;
    TDS: string;
    GST: string;
  }[];
};

export default function Recharges() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);

  const tableLabels = [{ id: "product", label: "Product Details" }];

  schemeDetail.schemeType == "neonetwork" &&
    tableLabels.push(
      { id: "Agcommission", label: "Agent Commission(in %)" },
      { id: "dis", label: "Distributor Commission(in %)" },
      { id: "mdis", label: "Master Distributor Commission(in %)" }
    );
  schemeDetail.schemeType == "directagent" &&
    tableLabels.push({ id: "Agcommission", label: "Agent Commission(in %)" });
  schemeDetail.schemeType == "apiuser" &&
    tableLabels.push({ id: "commission", label: "Api User commission(in %)" });

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

  useEffect(() => getRechargeProduct(), []);

  const getRechargeProduct = () => {
    let token = localStorage.getItem("token");
    let arr: any = [];
    Api(
      `admin/rechargeControl/get_recharge_ProductList`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        Response.data.result1.map((item: any) => {
          arr.push({
            productId: item?.productId?._id,
            productName: item?.productId?.productName,
            category: item?.productId?.category,
            agentCommission: "",
            distributorCommission: "",
            masterDistributorCommission: "",
            apiUserCommission: "",
            TDS: "",
            GST: "",
          });
        });
        setValue("commissionSetting", arr);
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
            save Recharge scheme
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
                            {watch(`commissionSetting.${index}.productName`)}
                          </Typography>
                        </TableCell>

                        {schemeDetail.schemeType == "directagent" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.agentCommission`}
                              label="Agent Commission"
                            />
                          </TableCell>
                        )}
                        {schemeDetail.schemeType == "neonetwork" && (
                          <React.Fragment>
                            <TableCell>
                              <RHFTextField
                                name={`commissionSetting.${index}.agentCommission`}
                                label="Agent Commission"
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
