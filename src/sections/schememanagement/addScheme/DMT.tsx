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

// ----------------------------------------------------------------------

type FormValuesProps = {
  categoryId: string;
  mainSchemeId: string;
  commissionSetting: {
    minSlab: number;
    maxSlab: number;
    chargeType: string;
    agentCharge: string;
    apiUserCharge: string;
    commissionType: string;
    distributorCommission: string;
    masterDistributorCommission: string;
    _id: string;
  }[];
};

export default function DMT() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const schemeDetail: any = useContext(SchemeDetail);

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
    Api(`vendor/payoutSlots`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          let arr: any = [];
          Response.data.data[0].slots.map((item: any) => {
            arr.push({
              _id: item._id,
              minSlab: item.minSlab,
              maxSlab: item.maxSlab,
              chargeType: "",
              agentCharge: "0",
              apiUserCharge: "0",
              commissionType: "",
              distributorCommission: "0",
              masterDistributorCommission: "0",
            });
          });
          setValue("commissionSetting", arr);
        }
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
            save Money Transfer scheme
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

                        {schemeDetail.schemeType == "neonetwork" && (
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
                        {schemeDetail.schemeType == "directagent" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.agentCharge`}
                              label="Agent Charge"
                            />
                          </TableCell>
                        )}
                        {schemeDetail.schemeType == "apiuser" && (
                          <TableCell>
                            <RHFTextField
                              name={`commissionSetting.${index}.apiUserCharge`}
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
