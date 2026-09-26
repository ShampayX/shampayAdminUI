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
    _id: string;
    minSlab: number;
    maxSlab: number;
    ccfType: string;
    ccf: string;
    agentCommissionType: string;
    agentCommission: string;
    distributorCommissionType: string;
    distributorCommission: string;
    masterDistributorCommissionType: string;
    masterDistributorCommission: string;
    ApiCommissionType: string;
    apiUserCommission: string;
  }[];
};

export default function PBPS() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const schemeDetail: any = useContext(SchemeDetail);

  const tableLabels = [
    { id: "transactionAmount", label: "Min Slab" },
    { id: "netpayout", label: "Max Slab" },
    { id: "ccftype", label: "CCF Type" },
    { id: "ccf", label: "CCF" },
  ];

  schemeDetail.schemeType == "neonetwork" &&
    tableLabels.push(
      { id: "agentCommissionType", label: "Agent Commission Type" },
      { id: "agentCommission", label: "Agent Commission" },
      { id: "distributorCommissionType", label: "Distributor Commission Type" },
      { id: "distributorCommission", label: "Distributor Commission" },
      {
        id: "masterdistributorCommissionType",
        label: "Master Distributor Commission Type",
      },
      {
        id: "masterdistributorCommission",
        label: "Master Distributor Commission",
      }
    );
  schemeDetail.schemeType == "apiuser" &&
    tableLabels.push(
      { id: "apiCommissionType", label: "Api Commission Type" },
      { id: "apiCommission", label: "Api Commission" }
    );
  schemeDetail.schemeType == "directagent" &&
    tableLabels.push(
      { id: "agentCommissionType", label: "Agent Commission Type" },
      { id: "agentCommission", label: "Agent Commission" }
    );

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
    reset,
    resetField,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => MoneyTransferSlot(), []);

  const MoneyTransferSlot = () => {
    let token = localStorage.getItem("token");
    Api(`vendor/show_pbps_slots`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        let arr: any = [];
        Response.data.data[0].slots.map((item: any) => {
          arr.push({
            _id: item._id,
            minSlab: item.minSlab,
            maxSlab: item.maxSlab,
            ccfType: "",
            ccf: "",
            agentCommissionType: "",
            agentCommission: "",
            distributorCommissionType: "",
            distributorCommission: "",
            masterDistributorCommissionType: "",
            masterDistributorCommission: "",
            ApiCommissionType: "",
            apiUserCommission: "",
          });
        });
        setValue("commissionSetting", arr);
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
            save PBPS scheme
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
                            name={`commissionSetting.${index}.ccfType`}
                            label="CCF Type"
                            SelectProps={{
                              native: false,
                              sx: { textTransform: "capitalize" },
                            }}
                          >
                            <MenuItem value="flat">Rs.</MenuItem>
                            <MenuItem value="percentage">%</MenuItem>
                          </RHFSelect>
                        </TableCell>
                        <RHFTextField
                          name={`commissionSetting.${index}.ccf`}
                          label="CCF value"
                        />

                        {schemeDetail.schemeType == "neonetwork" && (
                          <React.Fragment>
                            <TableCell>
                              <RHFSelect
                                name={`commissionSetting.${index}.agentCommissionType`}
                                label="Agent Commission Type"
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
                                name={`commissionSetting.${index}.agentCommission`}
                                label="Agent Commission"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFSelect
                                name={`commissionSetting.${index}.distributorCommissionType`}
                                label="Distributor Commission Type"
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
                              <RHFSelect
                                name={`commissionSetting.${index}.masterDistributorCommissionType`}
                                label="Master Distributor Commission Type"
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
                                name={`commissionSetting.${index}.masterDistributorCommission`}
                                label="Master Distributor Commission"
                              />
                            </TableCell>
                          </React.Fragment>
                        )}
                        {schemeDetail.schemeType == "directagent" && (
                          <>
                            <TableCell>
                              <RHFSelect
                                name={`commissionSetting.${index}.agentCommissionType`}
                                label="Agent Commission Type"
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
                                name={`commissionSetting.${index}.agentCommission`}
                                label="Agent Commission"
                              />
                            </TableCell>
                          </>
                        )}
                        {schemeDetail.schemeType == "apiuser" && (
                          <>
                            <TableCell>
                              <RHFSelect
                                name={`commissionSetting.${index}.ApiCommissionType`}
                                label="API user Commission Type"
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
                                name={`commissionSetting.${index}.apiUserCommission`}
                                label="Api User Commission"
                              />
                            </TableCell>
                          </>
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
