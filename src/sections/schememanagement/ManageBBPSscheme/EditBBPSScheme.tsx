import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { _ecommerceBestSalesman } from "src/_mock/arrays";

import CustomBreadcrumbs from "src/components/custom-breadcrumbs/CustomBreadcrumbs";
import { PATH_DASHBOARD } from "src/routes/paths";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { TableHeadCustom } from "src/components/table";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import { useSnackbar } from "notistack";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";

//form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFCodes,
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

type FormValuesProps = {
  subcategoryList: string[];
  subcategory: string;
  product: string;
};

export default function EditBBPSScheme() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { state } = useLocation();
  const { rowDetail } = state || {};
  // Item 1a: the first page is 1, not 0. The slice below is 1-based
  // (`currentPage * pageSize - pageSize`), so a 0 here computes slice(-10, 0) and
  // renders an empty table on first paint, and the pager received page={-1}.
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [bbpsVendor, setBPSvendor] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tempTableData, setTempTableData] = useState([]);
  const [isFilter, setIsFilted] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [editable, setEditable] = useState(false);
  const rechargePageSchema = Yup.object().shape({});

  const defaultValues = {
    subcategory: "",
    product: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(rechargePageSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    reset,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const tableLabels = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "cate", label: "Category" },
    { id: "product", label: "Product" },
    { id: "activevender", label: "Active Vendor" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
    { id: "commissiontype2", label: "Distributor Commission Type" },
    { id: "dis", label: "Distributor Commission" },
    { id: "commissiontype1", label: "Master Distributor Commission Type" },
    { id: "mdis", label: "Master Distributor Commission" },
    { id: "action", label: "Action" },
  ];
  const tableLabels1 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "cate", label: "Category" },
    { id: "product", label: "Product" },
    { id: "activevender", label: "Active Vendor" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
    { id: "action", label: "Action" },
  ];
  const tableLabels2 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "cate", label: "Category" },
    { id: "product", label: "Product" },
    { id: "activevender", label: "Active Vendor" },
    { id: "commissiontype", label: "API user Commission Type" },
    { id: "Agcommission", label: "API user Commission" },
    { id: "action", label: "Action" },
  ];

  useEffect(() => {
    getBBPSVendor();
    getSchemeDetails(rowDetail._id);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    let temp = [...searchData];
    setTempTableData(
      temp.slice(currentPage * pageSize - pageSize, currentPage * pageSize)
    );
  }, [searchData.length]);

  //pagenation in frontend
  useEffect(() => {
    let temp = isFilter ? [...searchData] : [...tableData];
    setTempTableData(
      temp.slice(currentPage * pageSize - pageSize, currentPage * pageSize)
    );
  }, [currentPage, tableData, pageSize]);

  const getBBPSVendor = () => {
    let token = localStorage.getItem("token");
    Api("vendor/bbps_vendor_list", "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setBPSvendor(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getSchemeDetails = async (val: any) => {
    let token = localStorage.getItem("token");
    setIsLoading(true);
    await Api(
      `bbpsManagement/bbpsScheme/scheme_details/` + val,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setTableData(Response.data.data.commissionSetting);
          setCurrentPage(1);
        } else {
          enqueueSnackbar(Response.data.message);
        }
        let arr: any = [];

        Response.data?.data?.commissionSetting?.map((item: any) => {
          if (!arr.includes(item.subCategoryName)) {
            arr.push(item.subCategoryName);
          }
        });
        setValue("subcategoryList", arr);
        setIsLoading(false);
      } else {
        enqueueSnackbar("Failed to Load");
        setIsLoading(false);
      }
    });
  };
  const onSubmit = (data: FormValuesProps) => {
    setIsFilted(true);
    if (data.subcategory && !data.product) {
      setSearchData(
        tableData.filter(
          (item: any) => item.subCategoryName == data.subcategory
        )
      );
    } else if (!data.subcategory && data.product) {
      setSearchData(
        tableData.filter((item: any) =>
          item.product.productName
            .toLowerCase()
            .match(data.product.toLowerCase())
        )
      );
    } else if (data.subcategory && data.product) {
      setSearchData(
        tableData
          .filter((item: any) => item.subCategoryName == data.subcategory)
          .filter((item: any) =>
            item.product.productName
              .toLowerCase()
              .match(data.product.toLowerCase())
          )
      );
    } else {
      setSearchData(tableData);
    }
  };

  const clear = () => {
    setIsFilted(false);
    setTempTableData(
      tableData.slice(currentPage * pageSize - pageSize, currentPage * pageSize)
    );
    setCurrentPage(1);
    setValue("product", "");
    setValue("subcategory", "");
  };

  // The header switches on scheme type; the skeleton has to switch with it or
  // the column count changes when the data lands.
  const activeLabels =
    rowDetail.schemeType.toLowerCase() == "neonetwork"
      ? tableLabels
      : rowDetail.schemeType.toLowerCase() == "directagent"
      ? tableLabels1
      : tableLabels2;

  return (
    <>
      <CustomBreadcrumbs
        sx={{ ml: 1 }}
        links={[
          { name: "BBPS Scheme", href: "" },
          {
            name: "All BBPS Scheme",
            href: PATH_DASHBOARD.scheme.AllbbpsScheme,
          },
          {
            name: `${
              rowDetail.schemeType == "apiuser"
                ? `API User Scheme`
                : rowDetail.schemeType == "neonetwork"
                ? `Distributon Network Scheme`
                : `Direct Agent Scheme `
            }`,
            href: "",
          },
          {
            name: `${rowDetail.schemeId} (${rowDetail.schemeDescription})`,
            href: "",
          },
        ]}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack
          flexDirection={"row"}
          gap={1}
          my={1}
          width={{ xs: "100%", sm: "50%" }}
        >
          <RHFSelect
            name="subcategory"
            label="Category"
            placeholder="Category"
            size="small"
            SelectProps={{ native: false, sx: { textTransform: "capitalize" } }}
          >
            {getValues("subcategoryList")?.map((item: string) => {
              return (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              );
            })}
          </RHFSelect>
          <RHFTextField
            name="product"
            label="Product"
            placeholder="Product"
            size="small"
            SelectProps={{ native: false, sx: { textTransform: "capitalize" } }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={!watch("product") && !watch("subcategory")}
          >
            {" "}
            Search
          </Button>
          <Button
            variant="contained"
            onClick={clear}
            disabled={!watch("product") && !watch("subcategory")}
          >
            Clear
          </Button>
        </Stack>
      </FormProvider>
      {isLoading ? (
        <ApiDataLoading variant="table" columns={activeLabels} minWidth={720} />
      ) : (
        <TableContainer sx={{ overflow: "unset" }}>
          <Table sx={{ minWidth: 720 }} size="small">
            <TableHeadCustom headLabel={activeLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              {tempTableData.map((row: any) => {
                return (
                  <SchemeRow
                    key={row._id}
                    row={row}
                    bbpsVendor={bbpsVendor}
                    rowDetail={rowDetail}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CustomPagination
        page={currentPage - 1}
        count={(isFilter ? searchData : tableData).length}
        onPageChange={(
          event: React.MouseEvent<HTMLButtonElement> | null,
          newPage: number
        ) => {
          setCurrentPage(newPage + 1);
        }}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setPageSize(parseInt(event.target.value));
          setCurrentPage(1);
        }}
      />
    </>
  );
}

const SchemeRow = React.memo(({ row, bbpsVendor, rowDetail }: any) => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [item, setItem] = useState(row);
  const [editable, setEditable] = useState(false);

  const handleChange = (val: boolean) => {
    setEditable(true);
    !val && SaveScheme(item);
  };

  const SaveScheme = (val: any) => {
    let token = localStorage.getItem("token");
    let body = {
      schemeId: rowDetail.schemeId,
      commissionDetails: {
        id: val._id,
        activeVendorName: val.activeVendorName,
        activeVendorId: val.activeVendorId,
        agentCommissionType: val.agentCommissionType,
        agentCommission: val.agentCommission,
        distributorCommissionType: val.distributorCommissionType,
        distributorCommission: val.distributorCommission,
        masterDistributorCommissionType: val.masterDistributorCommissionType,
        masterDistributorCommission: val.masterDistributorCommission,
        apiUserCommissionType: val.apiUserCommissionType,
        apiUserCommission: val.apiUserCommission,
      },
    };
    Api(
      "bbpsManagement/bbpsScheme/edit_scheme_by_product",
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        setEditable(false);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <TableRow>
      <TableCell>{item?.minSlab}</TableCell>
      <TableCell>{item?.maxSlab}</TableCell>
      <TableCell>{item?.subCategoryName}</TableCell>
      <TableCell>{item?.product?.productName}</TableCell>
      <TableCell>
        {editable ? (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Vendor</InputLabel>
            <Select
              label="Vendor"
              placeholder="Vendor"
              size="small"
              value={item?.activeVendorId}
            >
              {bbpsVendor.map((row: any) => (
                <MenuItem
                  value={row?._id}
                  key={row?._id}
                  onClick={() =>
                    setItem({
                      ...item,
                      activeVendorName: row.vendorName,
                      activeVendorId: row._id,
                    })
                  }
                >
                  {row?.vendorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography>{item?.activeVendorName || "-"}</Typography>
        )}
      </TableCell>

      {rowDetail?.schemeType == "neonetwork" &&
        (editable ? (
          <>
            <TableCell>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Agent Commission Type
                </InputLabel>
                <Select
                  label="Agent Commission Type"
                  size="small"
                  value={item?.agentCommissionType}
                  onChange={(e) =>
                    setItem({ ...item, agentCommissionType: e.target.value })
                  }
                >
                  <MenuItem value="percentage">%</MenuItem>
                  <MenuItem value="flat">Rs.</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <TextField
                label="Agent Commission"
                size="small"
                value={item?.agentCommission}
                onChange={(e) =>
                  setItem({ ...item, agentCommission: e.target.value })
                }
              />
            </TableCell>
            <TableCell>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Distributor Commission Type
                </InputLabel>
                <Select
                  label="Distributor Commission Type"
                  size="small"
                  value={item?.distributorCommissionType}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      distributorCommissionType: e.target.value,
                    })
                  }
                >
                  <MenuItem value="percentage">%</MenuItem>
                  <MenuItem value="flat">Rs.</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <TextField
                label="Distributor Commission"
                size="small"
                value={item?.distributorCommission}
                onChange={(e) =>
                  setItem({ ...item, distributorCommission: e.target.value })
                }
              />
            </TableCell>
            <TableCell>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Master Distributor Commission Type
                </InputLabel>
                <Select
                  label="Master Distributor Commission Type"
                  size="small"
                  value={item?.masterDistributorCommissionType}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      masterDistributorCommissionType: e.target.value,
                    })
                  }
                >
                  <MenuItem value="percentage">%</MenuItem>
                  <MenuItem value="flat">Rs.</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <TextField
                label="Master Distributor Commission"
                size="small"
                value={item?.masterDistributorCommission}
                onChange={(e) =>
                  setItem({
                    ...item,
                    masterDistributorCommission: e.target.value,
                  })
                }
              />
            </TableCell>
          </>
        ) : (
          <>
            <TableCell>
              {item?.agentCommissionType == "flat"
                ? "Rs."
                : item?.agentCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{item?.agentCommission}</TableCell>
            <TableCell>
              {item?.distributorCommissionType == "flat"
                ? "Rs."
                : item?.distributorCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{item?.distributorCommission}</TableCell>
            <TableCell>
              {item?.masterDistributorCommissionType == "flat"
                ? "Rs."
                : item?.masterDistributorCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{item?.masterDistributorCommission}</TableCell>
          </>
        ))}
      {rowDetail?.schemeType == "directagent" &&
        (editable ? (
          <>
            <TableCell>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Agent Commission Type
                </InputLabel>
                <Select
                  label="Agent Commission Type"
                  size="small"
                  value={item?.agentCommissionType}
                  onChange={(e) =>
                    setItem({ ...item, agentCommissionType: e.target.value })
                  }
                >
                  <MenuItem value="percentage">%</MenuItem>
                  <MenuItem value="flat">Rs.</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <TextField
                label="Agent Commission"
                size="small"
                value={item?.agentCommission}
                onChange={(e) =>
                  setItem({ ...item, agentCommission: e.target.value })
                }
              />
            </TableCell>
          </>
        ) : (
          <>
            <TableCell>
              {item?.agentCommissionType == "flat"
                ? "Rs."
                : item?.agentCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{item?.agentCommission}</TableCell>
          </>
        ))}
      {rowDetail?.schemeType == "apiuser" &&
        (editable ? (
          <>
            <TableCell>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Commission Type
                </InputLabel>
                <Select
                  label="Commission Type"
                  size="small"
                  value={item?.apiUserCommissionType}
                  onChange={(e) =>
                    setItem({ ...item, apiUserCommissionType: e.target.value })
                  }
                >
                  <MenuItem value="percentage">%</MenuItem>
                  <MenuItem value="flat">Rs.</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <TextField
                label="API Commission"
                size="small"
                value={item?.apiUserCommission}
                onChange={(e) =>
                  setItem({ ...item, apiUserCommission: e.target.value })
                }
              />
            </TableCell>
          </>
        ) : (
          <>
            <TableCell>
              {item?.apiUserCommissionType == "flat"
                ? "Rs."
                : item?.apiUserCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{item?.apiUserCommission}</TableCell>
          </>
        ))}
      <TableCell>
        <Button variant="contained" onClick={() => handleChange(!editable)}>
          {editable ? "Save" : "Edit"}
        </Button>
      </TableCell>
    </TableRow>
  );
});
