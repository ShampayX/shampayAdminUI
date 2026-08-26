// @mui
import {
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  TextField,
  Grid,
  styled,
  Switch,
  MenuItem,
  Select,
  Button,
  Typography,
} from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import { SchemeDetail } from "../ManageBBPSscheme/AddNewBBPSScheme";
import { useFieldArray, useForm } from "react-hook-form";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import Label from "src/components/label/Label";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router";
import { PATH_DASHBOARD } from "src/routes/paths";
import { useAuthContext } from "src/auth/useAuthContext";

type FormValuesProps = {
  schemeData: {
    subCategoryId: string;
    subCategoryName: string;
    commissionSetting: {
      minSlab: number;
      maxSlab: number;
      activeVendorId: string;
      activeVendorName: string;
      agentCommissionType: string;
      agentCommission: number;
      distributorCommissionType: string;
      distributorCommission: number;
      masterDistributorCommissionType: string;
      masterDistributorCommission: number;
      apiUserCommissionType: string;
      apiUserCommission: number;
    }[];
  }[];
};

export default function BillPayments({ tableData, ...other }: any) {
  const { Api } = useAuthContext();
  const schType: any = useContext(SchemeDetail);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [bbpsVendor, setBPSvendor] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tableLabels = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "activevender", label: "Active Vendor" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
    { id: "commissiontype2", label: "Distributor Commission Type" },
    { id: "dis", label: "Distributor Commission" },
    { id: "commissiontype1", label: "Master Distributor Commission Type" },
    { id: "mdis", label: "Master Distributor Commission" },
  ];
  const tableLabels1 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "activevender", label: "Active Vendor" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
  ];
  const tableLabels2 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "activevender", label: "Active Vendor" },
    { id: "commissiontype", label: "API user Commission Type" },
    { id: "Agcommission", label: "API user Commission" },
  ];

  const FilterSchema = Yup.object().shape({});
  const methods = useForm<FormValuesProps>({
    // resolver: yupResolver(FilterSchema),
  });
  const defaultValues = {
    schemeData: [],
  };
  const {
    control,
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append }: any = useFieldArray({
    name: "schemeData",
    control,
  });

  useEffect(() => {
    setIsLoading(true);
    if (tableData.categoryDetail.length && tableData.commissionSetting.length) {
      tableData.categoryDetail.map((element: any) => {
        append({
          subCategoryId: element._id,
          subCategoryName: element.sub_category_name,
          commissionSetting: tableData.commissionSetting,
        });
      });
    }

    getBBPSVendor();
  }, [tableData]);

  const getBBPSVendor = () => {
    let token = localStorage.getItem("token");
    Api("vendor/bbps_vendor_list", "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setBPSvendor(Response.data.data);
        }
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    });
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      const body = {
        schemeDescription: "Test Scheme",
        schemeType:
          schType.toLowerCase() == "distribution network"
            ? "neonetwork"
            : schType.toLowerCase() == "direct agent"
            ? "directagent"
            : "apiuser",
        schemeData: data.schemeData,
      };
      await Api("bbpsManagement/bbpsScheme/create", "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              navigate(PATH_DASHBOARD.scheme.AllbbpsScheme);
            } else {
              enqueueSnackbar(Response.data.message);
            }
          } else {
            enqueueSnackbar("Failed");
          }
        }
      );
    } catch (err) {}
  };

  // The header switches on scheme type; the skeleton has to switch with it or
  // the column count changes when the data lands.
  const activeLabels =
    schType.toLowerCase() == "distribution network"
      ? tableLabels
      : schType.toLowerCase() == "direct agent"
      ? tableLabels1
      : tableLabels2;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <>
        {isLoading ? (
          <ApiDataLoading
            variant="table"
            columns={activeLabels}
            minWidth={720}
          />
        ) : (
          <Grid {...other}>
            <Stack flexDirection={"row"} justifyContent={"end"} m={1}>
              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
              >
                Create BBPS Scheme
              </LoadingButton>
            </Stack>
            <TableContainer sx={{ overflow: "unset" }}>
              <Scrollbar>
                <Table sx={{ minWidth: 720 }} size="small">
                  <TableHeadCustom headLabel={activeLabels} />

                  {fields.map((item: any, index: number) => {
                    return (
                      <Fragment key={item.id}>
                        <Stack>
                          <Label variant="soft" color={"primary"} m={1}>
                            <Typography variant="h5" m={1}>
                              {watch(`schemeData.${index}.subCategoryName`)}
                            </Typography>
                          </Label>
                        </Stack>
                        {item.commissionSetting.map((row: any, i: number) => {
                          return (
                            <TableBody sx={{ overflow: "auto" }} key={row._id}>
                              <TableRow>
                                <TableCell>
                                  <Typography>{+row.minSlab}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{+row.maxSlab}</Typography>
                                </TableCell>
                                <TableCell>
                                  <RHFSelect
                                    name={`schemeData.${index}.commissionSetting.${i}.activeVendorId`}
                                    label="vendor"
                                    placeholder="vendor"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                  >
                                    {bbpsVendor.map((item: any) => (
                                      <MenuItem
                                        value={item._id}
                                        key={item._id}
                                        onClick={() =>
                                          setValue(
                                            `schemeData.${index}.commissionSetting.${i}.activeVendorName`,
                                            item.vendorName
                                          )
                                        }
                                      >
                                        {item.vendorName}
                                      </MenuItem>
                                    ))}
                                  </RHFSelect>
                                </TableCell>
                                {schType.toLowerCase() ==
                                  "distribution network" && (
                                  <>
                                    <TableCell>
                                      <RHFSelect
                                        name={`schemeData.${index}.commissionSetting.${i}.agentCommissionType`}
                                        label="Agent Commission Type"
                                        placeholder="Agent Commission Type"
                                        SelectProps={{
                                          native: false,
                                          sx: { textTransform: "capitalize" },
                                        }}
                                      >
                                        <MenuItem value="percentage">
                                          %
                                        </MenuItem>
                                        <MenuItem value="flat">Rs.</MenuItem>
                                      </RHFSelect>
                                    </TableCell>
                                    <TableCell>
                                      <RHFTextField
                                        type="number"
                                        name={`schemeData.${index}.commissionSetting.${i}.agentCommission`}
                                        label="Agent Commission"
                                        placeholder="Agent Commission"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <RHFSelect
                                        name={`schemeData.${index}.commissionSetting.${i}.distributorCommissionType`}
                                        label="Distributor Commission Type"
                                        placeholder="Distributor Commission Type"
                                        SelectProps={{
                                          native: false,
                                          sx: { textTransform: "capitalize" },
                                        }}
                                      >
                                        <MenuItem value="percentage">
                                          %
                                        </MenuItem>
                                        <MenuItem value="flat">Rs.</MenuItem>
                                      </RHFSelect>
                                    </TableCell>
                                    <TableCell>
                                      <RHFTextField
                                        name={`schemeData.${index}.commissionSetting.${i}.distributorCommission`}
                                        label="Distributor Commission"
                                        placeholder="Distributor Commission"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <RHFSelect
                                        name={`schemeData.${index}.commissionSetting.${i}.masterDistributorCommissionType`}
                                        label="Master Distributor Commission Type"
                                        placeholder="Master Distributor Commission Type"
                                        SelectProps={{
                                          native: false,
                                          sx: { textTransform: "capitalize" },
                                        }}
                                      >
                                        <MenuItem value="percentage">
                                          %
                                        </MenuItem>
                                        <MenuItem value="flat">Rs.</MenuItem>
                                      </RHFSelect>
                                    </TableCell>
                                    <TableCell>
                                      <RHFTextField
                                        name={`schemeData.${index}.commissionSetting.${i}.masterDistributorCommission`}
                                        label="Master Distributor Commission"
                                        placeholder="Master Distributor Commission"
                                      />
                                    </TableCell>
                                  </>
                                )}
                                {schType.toLowerCase() == "direct agent" && (
                                  <>
                                    <TableCell>
                                      <RHFSelect
                                        name={`schemeData.${index}.commissionSetting.${i}.agentCommissionType`}
                                        label="Agent Commission Type"
                                        placeholder="Agent Commission Type"
                                        SelectProps={{
                                          native: false,
                                          sx: { textTransform: "capitalize" },
                                        }}
                                      >
                                        <MenuItem value="percentage">
                                          %
                                        </MenuItem>
                                        <MenuItem value="flat">Rs.</MenuItem>
                                      </RHFSelect>
                                    </TableCell>
                                    <TableCell>
                                      <RHFTextField
                                        name={`schemeData.${index}.commissionSetting.${i}.agentCommission`}
                                        label="Agent Commission"
                                        placeholder="Agent Commission"
                                      />
                                    </TableCell>
                                  </>
                                )}
                                {schType.toLowerCase() == "api user" && (
                                  <>
                                    <TableCell>
                                      <RHFSelect
                                        name={`schemeData.${index}.commissionSetting.${i}.apiUserCommissionType`}
                                        label="API user Commission Type"
                                        placeholder="API user Commission Type"
                                        SelectProps={{
                                          native: false,
                                          sx: { textTransform: "capitalize" },
                                        }}
                                      >
                                        <MenuItem value="percentage">
                                          %
                                        </MenuItem>
                                        <MenuItem value="flat">Rs.</MenuItem>
                                      </RHFSelect>
                                    </TableCell>
                                    <TableCell>
                                      <RHFTextField
                                        name={`schemeData.${index}.commissionSetting.${i}.apiUserCommission`}
                                        label="API user Commission"
                                        placeholder="API user Commission"
                                      />
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            </TableBody>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </Table>
              </Scrollbar>
            </TableContainer>
          </Grid>
        )}
      </>
    </FormProvider>
  );
}
