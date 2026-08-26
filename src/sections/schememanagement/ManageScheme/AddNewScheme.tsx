import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// @mui
import { Stack, Grid, Tabs, Tab, Box, Typography } from "@mui/material";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
// sections
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "../../../components/snackbar";
import MATM from "../addScheme/MATM";
import { PATH_DASHBOARD } from "src/routes/paths";
import { useAuthContext } from "src/auth/useAuthContext";

import {
  AEPS,
  DMT,
  DMT1,
  DMT2,
  Recharges,
  VendorPayments,
  IndoNepalTransfer,
  AEPS2,
  AadhaarPay,
  Payments,
  Transfer,
} from "../addScheme";
import PayoutTransfer from "../addScheme/PayoutTransfer";
import ADMT from "../addScheme/ADMT";
import PayIn from "../addScheme/PayIn";

// ----------------------------------------------------------------------

export const SchemeDetail = React.createContext({});

export default function AddNewScheme() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState("");
  const [scheme, setScheme] = useState("");
  const [schemeName, setSchemeName] = useState({
    schemeName: "",
    schemeDesc: "",
    _id: "",
  });
  const [indoNepalTransfer, setIndoNepalTransfer] = useState([]);
  const [vendorPaymentSlotData, setVendorPaymentSlotData] = useState<any>([]);
  const [VendorPayoutSlotData, setPayoutSlotData] = useState<any>([]);
  const { state } = useLocation();
  const { schemeFor, desc } = state || {};

  const [categoryLabel, setCategoryLabel] = useState([]);
  useEffect(() => {
    getCategory();
    callScheme(schemeFor, desc);
  }, []);

  function callScheme(val: any, desc: string) {
    setScheme(val);
    create_scheme(val, desc);
  }

  const getCategory = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setCategoryLabel(
            Response.data.data.filter(
              (item: any) => item.category_name.toLowerCase() !== "bill payment"
            )
          );
          Response.data.data?.filter((item: any) => {
            if (item.category_name.toLowerCase() == "vendor payments") {
              Api(`product/get_ProductList/${item._id}`, "GET", "", token).then(
                (Response: any) => {
                  if (Response?.status == 200) {
                    if (Response.data.code == 200) {
                      Response.data.data.map((element: any) =>
                        VendorPaymentSlot(element)
                      );
                    }
                  }
                }
              );
            }
            if (item.category_name.toLowerCase() == "payout payments") {
              Api(`product/get_ProductList/${item._id}`, "GET", "", token).then(
                (Response: any) => {
                  if (Response?.status == 200) {
                    if (Response.data.code == 200) {
                      const product = Response.data.data.filter(
                        (item: any) =>
                          item.productName?.toUpperCase() !== "UPI PAYOUT"
                      );
                      product.map((element: any) => VendorPayoutSlot(element));
                    }
                  }
                }
              );
            }
            if (item.category_name.toLowerCase() == "payout payments") {
              Api(`product/get_ProductList/${item._id}`, "GET", "", token).then(
                (Response: any) => {
                  if (Response?.status == 200) {
                    if (Response.data.code == 200) {
                      const upiProduct = Response.data.data.find(
                        (item: any) =>
                          item.productName?.toUpperCase() === "UPI PAYOUT"
                      );
                      //  upiProduct.map((element: any) => VendorPayoutUpiSlot(element));
                      if (upiProduct) {
                        VendorPayoutUpiSlot(upiProduct);
                      }
                    }
                  }
                }
              );
            }
          });
          setCurrentTab(Response.data.data[0].category_name);
          localStorage.setItem("cateId", Response.data.data[0]._id);
        }
      }
    });
  };

  const VendorPaymentSlot = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/vendor_payment_slots/${val._id}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            let arr: any = [];
            Response.data.data[0].slots.map((item: any) => {
              arr.push({
                productId: val._id,
                _id: item._id,
                minSlab: item.minSlab,
                maxSlab: item.maxSlab,
                chargeType: "",
                agentCharge: "",
                apiUserCharge: "",
                commissionType: "",
                distributorCommission: "",
                masterDistributorCommission: "",
              });
            });
            setVendorPaymentSlotData((prevState: any) => [
              ...prevState,
              {
                productId: val._id,
                productName: val.productName,
                slots: arr,
              },
            ]);
          }
        }
      }
    );
  };

  const VendorPayoutSlot = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/payoutPaymentSlots`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          let arr: any = [];
          Response.data.data[0].slots.map((item: any) => {
            arr.push({
              productId: val._id,
              _id: item._id,
              minSlab: item.minSlab,
              maxSlab: item.maxSlab,
              chargeType: "",
              agentCharge: "",
              apiUserCharge: "",
              commissionType: "",
              distributorCommission: "",
              masterDistributorCommission: "",
            });
          });
          setPayoutSlotData((prevState: any) => [
            ...prevState,
            {
              productId: val._id,
              productName: val.productName,
              slots: arr,
            },
          ]);
        }
      }
    });
  };

  const VendorPayoutUpiSlot = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/payoutPaymentSlots_UPI`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          let arr: any = [];
          Response.data.data[0].slots.forEach((item: any) => {
            arr.push({
              productId: val._id,
              _id: item._id,
              minSlab: item.minSlab,
              maxSlab: item.maxSlab,
              chargeType: "",
              agentCharge: "",
              apiUserCharge: "",
              commissionType: "",
              distributorCommission: "",
              masterDistributorCommission: "",
            });
          });

          setPayoutSlotData((prevState: any) => {
            const filtered = prevState.filter(
              (item: any) => item.productName?.toUpperCase() !== "UPI PAYOUT"
            );
            return [
              ...filtered,
              {
                productId: val._id,
                productName: val.productName,
                slots: arr,
              },
            ];
          });
        }
      }
    );
  };

  const create_scheme = (val: string, val1: string) => {
    let token = localStorage.getItem("token");
    const body = {
      schemeType: val,
      schemeDescription: val1,
    };
    Api(`scheme/create_scheme`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar("Scheme Create Successfull !");
          setSchemeName({
            schemeName: Response.data.data.schemeID,
            schemeDesc: Response.data.data.schemeDescription,
            _id: Response.data.data._id,
          });
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  const saveCategory = (val: string) => {
    // localStorage.setItem("cateId", val);
    // if (currentTab == '')
  };
  return (
    <>
      <Helmet>
        <title>Create Scheme | Shampay Admin</title>
      </Helmet>
      <CustomBreadcrumbs
        links={[
          { name: `Scheme`, href: "" },
          { name: `All Scheme`, href: PATH_DASHBOARD.scheme.root },
          { name: `Create Scheme`, href: "" },
          { name: `${schemeFor} Scheme`, href: "" },
          {
            name: ` ${schemeName.schemeName} (${schemeName.schemeDesc})`,
            href: "",
          },
          // { name: user?.displayName },
        ]}
      />
      <Stack style={{ flexDirection: "row" }}>
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={currentTab}
            aria-label="scrollable auto tabs example"
            sx={{ background: "#F4F6F8" }}
            onChange={(event, newValue) => setCurrentTab(newValue)}
          >
            {categoryLabel.map((tab: any) => (
              <Tab
                key={tab._id}
                onClick={() => saveCategory(tab._id)}
                sx={{ fontSize: { xs: 14, md: 18 } }}
                label={
                  <Typography
                    variant="h4"
                    sx={{ fontSize: { xs: 14, md: 18 } }}
                  >
                    {tab.category_name}{" "}
                  </Typography>
                }
                value={tab.category_name}
              />
            ))}
          </Tabs>
        </Box>
      </Stack>

      <Grid item xs={12} md={6} lg={8}>
        {categoryLabel.map(
          (tab: any) =>
            tab.category_name == currentTab && (
              <Box key={tab.status} sx={{ m: 1 }}>
                <SchemeDetail.Provider
                  value={{
                    schemeType: scheme,
                    schemeId: schemeName._id,
                    description: desc,
                    categoryId: tab._id,
                  }}
                >
                  {currentTab.toLowerCase() == "recharges" ? (
                    <Recharges />
                  ) : currentTab.toLowerCase() == "money transfer" ? (
                    <DMT />
                  ) : currentTab.toLowerCase() == "vendor payments" ? (
                    <VendorPayments tableData={vendorPaymentSlotData} />
                  ) : currentTab.toLowerCase() == "dmt1" ? (
                    <DMT1 />
                  ) : currentTab.toLowerCase() == "dmt2" ? (
                    <DMT2 />
                  ) : currentTab.toLowerCase() == "indo nepal" ? (
                    <IndoNepalTransfer tableData={indoNepalTransfer} />
                  ) : currentTab.toLowerCase() == "aeps" ? (
                    <AEPS />
                  ) : currentTab.toLowerCase() == "aeps 2" ? (
                    <AEPS2 />
                  ) : currentTab.toLowerCase() == "aadhaar pay" ? (
                    <AadhaarPay />
                  ) : currentTab.toLowerCase() == "matm" ? (
                    <MATM />
                  ) : currentTab.toLowerCase() == "payments" ? (
                    <Payments />
                  ) : currentTab.toLowerCase() == "transfer" ? (
                    <Transfer />
                  ) : currentTab.toLowerCase() == "admt" ? (
                    <ADMT />
                  ) : currentTab.toLowerCase() == "payout payments" ? (
                    <PayoutTransfer tableData={VendorPayoutSlotData} />
                  ) : currentTab == "PAY IN" ? (
                    <PayIn />
                  ) : null}
                </SchemeDetail.Provider>
              </Box>
            )
        )}
      </Grid>
    </>
  );
}
