import React, { Fragment, useEffect } from "react";
import { Button, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import ProductTable from "./ProductTable";
import CustomPagination from "src/components/CustomFunction/CustomPagination";

import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
import { useSnackbar } from "src/components/snackbar";

// Hoisted so the loading skeleton and the real table share one definition.
const BBPS_PRODUCT_COLUMNS = [
  { id: "product", label: "Product Details" },
  { id: "subcategory", label: "Subcategory" },
  { id: "due", label: "Circle/Area" },
  { id: "maxComm", label: "Max. Limit" },
  { id: "commType", label: "Transaction type" },
  { id: "due", label: "Comm. Structure" },
  { id: "commType", label: "Max. Comm." },
  { id: "commType", label: "Product For" },
  { id: "commType", label: "Plan Provider" },
  { id: "commType", label: "Action Wallet" },
  { id: "commType", label: "Action" },
];

function EditBBPSproducts({ categoryData }: any) {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [txnCount, setTxnCount] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [tableData, setTableData] = React.useState([]);
  const [searchVal, setSearchVal] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [subcategory, setSubcategory] = React.useState(
    categoryData.sub_category[1]._id
  );

  //change tabs
  const [valueTabs, setvalueTabs] = React.useState(1);
  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  useEffect(() => {
    if (categoryData.sub_category[0]._id !== "1") {
      categoryData.sub_category.unshift({
        sub_category_name: "All",
        _id: "1",
      });
    }
  }, []);
  useEffect(() => setSearchVal(""), [valueTabs]);
  useEffect(() => setCurrentPage(1), [valueTabs, searchVal]);
  useEffect(() => getBBPSproduct(), [currentPage, valueTabs, pageSize]);

  const getBBPSproduct = () => {
    setIsLoading(true);
    setTableData([]);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      productName: "",
      subCategory: subcategory === "1" ? "" : subcategory,
    };
    Api("product/bbpsProductList", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setTableData(Response.data.data);
          setTxnCount(Response.data.totalCount);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getSearchProuct = (val: string) => {
    setIsLoading(true);
    setSearchVal(val);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      productName: val,
      subCategory: "",
    };
    +val.length >= 3
      ? Api("product/bbpsProductList", "POST", body, token).then(
          (Response: any) => {
            if (isOk(Response)) {
              setTableData(Response.data.data);
              setTxnCount(Response.data.totalCount);
              setTimeout(() => {
                setIsLoading(false);
              }, 500);
            } else {
              notifyFailure(enqueueSnackbar, Response);
            }
          }
        )
      : setIsLoading(false);
  };
  return (
    <Fragment>
      <Tabs
        value={valueTabs}
        onChange={handleChangePanels}
        aria-label="basic tabs example"
        sx={{ background: "#F4F6F8" }}
      >
        {categoryData.sub_category.map((item: any, index: number) => {
          return (
            <Tab
              key={item._id}
              label={
                <Typography variant="subtitle1">
                  {item.sub_category_name}
                </Typography>
              }
              onClick={() => setSubcategory(item._id)}
              {...a11yProps(index)}
            />
          );
        })}
      </Tabs>
      {subcategory === "1" && (
        <Stack flexDirection={"row"} justifyContent={"start"} gap={1} m={1}>
          <TextField
            label="Search Product"
            value={searchVal}
            onChange={(event: any) => getSearchProuct(event.target.value)}
          />
        </Stack>
      )}
      {isLoading ? (
        <ApiDataLoading
          variant="table"
          columns={BBPS_PRODUCT_COLUMNS}
          minWidth={1100}
        />
      ) : (
        <ProductTable
          tableData={tableData}
          categoryData={categoryData}
          tableLabels={BBPS_PRODUCT_COLUMNS}
        />
      )}

      <CustomPagination
        page={currentPage - 1}
        count={txnCount}
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
    </Fragment>
  );
}

export default EditBBPSproducts;
