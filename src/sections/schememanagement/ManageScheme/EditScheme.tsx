import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// @mui
import { Grid, Tabs, Tab, Box, useTheme } from "@mui/material";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { useSnackbar } from "../../../components/snackbar";
import EditIndoNepalTransfer from "../editScheme/EditIndoNepalTransfer";
import EditMATM from "../editScheme/EditMATM";
import EditAadharPay from "../editScheme/EditAadharPay";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs/CustomBreadcrumbs";
import { PATH_DASHBOARD } from "src/routes/paths";
import { useAuthContext } from "src/auth/useAuthContext";
import EditVendorPayments from "../editScheme/EditVendorPayments";
import EditPaymentScheme from "../editScheme/EditPayments";
import EditAEPS from "../editScheme/EditAEPS";
import EditAEPS2 from "../editScheme/EditAEPS2";
import EditDMT from "../editScheme/EditDMT";
import EditRecharges from "../editScheme/EditRecharges";
import EditTransfer from "../editScheme/EditTransfer";
import EditDMT1 from "../editScheme/editDMT1";
import EditDMT2 from "../editScheme/editDMT2";
import EditPayoutPayments from "../editScheme/EditPayoutPayments";
import EditADMT from "../editScheme/EditADMT";
import EditPBPS from "../editScheme/EditPBPS";
import EditPayIn from "../editScheme/editPAYIN";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

export const SchemeDetail = React.createContext({});

export default function EditScheme(props: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState("");
  const [categoryLabel, setCategoryLabel] = useState([]);
  const [cateId, setcateId] = useState("");
  const [scheme, setScheme] = useState("");
  const [display, setDisplay] = useState(true);
  const [sdata, setSdata] = useState([]);

  const { state } = useLocation();
  const { rowD } = state || {};

  useEffect(() => {
    setScheme(rowD?.schemeType);
    getCategory();
  }, []);

  function getLabel(val: any) {
    setCategoryLabel(val);
    setCurrentTab(val[0].category_name);
    getSchemeDetails(val[0]._id);
    setcateId(val[0]._id);
  }

  function changeTab(val: any) {
    getSchemeDetails(val);
    setcateId(val);
  }

  const getCategory = () => {
    const token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        const sortedData = Response.data.data
          .sort((a: any, b: any) => a.order - b.order)
          .filter(
            (item: any) => item.category_name.toLowerCase() !== "bill payment"
          );
        getLabel(sortedData);
        setCurrentTab(Response.data.data[0].category_name);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getSchemeDetails = (val: any) => {
    const token = localStorage.getItem("token");
    setSdata([]);
    setDisplay(false);
    let id = rowD?._id;
    Api(`scheme/getShemeDetail/` + id + "/" + val, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setDisplay(true);
            if (Response.data.data != null) {
              // enqueueSnackbar(Response.data.message);
              if (Response.data.data?.succ?.commissionSetting.length) {
                setSdata(Response.data.data?.succ?.commissionSetting);
              }
            } else {
              enqueueSnackbar("Data not Found", { variant: "error" });
            }
          }
        }
      }
    );
  };

  return (
    <>
      <CustomBreadcrumbs
        sx={{ ml: 1 }}
        links={[
          { name: "Scheme", href: "" },
          { name: "All Scheme", href: PATH_DASHBOARD.scheme.root },
          {
            name: `${
              rowD?.schemeType == "apiuser"
                ? `API User Scheme`
                : rowD?.schemeType == "neonetwork"
                ? `Distributon Network Scheme`
                : `Direct Agent Scheme `
            }`,
            href: "",
          },
          { name: `${rowD?.schemeID} (${rowD?.schemeDescription})`, href: "" },
        ]}
      />

      <Box>
        <Tabs
          value={currentTab}
          aria-label="basic tabs example"
          sx={{ background: "#F4F6F8", padding: "0 10px", height: "48px" }}
          onChange={(event, newValue) => setCurrentTab(newValue)}
        >
          {categoryLabel.map((tab: any) => (
            <Tab
              key={tab._id}
              onClick={() => changeTab(tab._id)}
              label={tab.category_name}
              value={tab.category_name}
            />
          ))}
        </Tabs>
      </Box>
      <Grid item xs={12} md={6} lg={8}>
        {categoryLabel.map(
          (tab: any) =>
            tab.category_name == currentTab && (
              <SchemeDetail.Provider
                value={{
                  schemeType: scheme,
                  schemeId: rowD?._id,
                  categoryId: tab._id,
                }}
              >
                <Box key={tab.status} sx={{ m: 1 }}>
                  {currentTab.toLowerCase() == "recharges" ? (
                    <EditRecharges />
                  ) : currentTab.toLowerCase() == "money transfer" ? (
                    <EditDMT />
                  ) : currentTab.toLowerCase() == "vendor payments" ? (
                    <EditVendorPayments
                      tableData={sdata}
                      scheme={rowD}
                      cateId={cateId}
                    />
                  ) : currentTab.toLowerCase() == "dmt1" ? (
                    <EditDMT1 />
                  ) : currentTab.toLowerCase() == "dmt2" ? (
                    <EditDMT2 />
                  ) : currentTab?.toLowerCase() == "indo-nepal" ? (
                    <EditIndoNepalTransfer
                      tableData={sdata}
                      schType={scheme}
                      rowId={rowD._id}
                      cateId={cateId}
                    />
                  ) : currentTab.toLowerCase() == "pbps" ? (
                    <EditPBPS />
                  ) : currentTab.toLowerCase() == "aeps" ? (
                    <EditAEPS />
                  ) : currentTab.toLowerCase() == "aeps 2" ? (
                    <EditAEPS2 />
                  ) : currentTab.toLowerCase() == "aadhaar pay" ? (
                    <EditAadharPay />
                  ) : currentTab.toLowerCase() == "matm" ? (
                    <EditMATM />
                  ) : currentTab.toLowerCase() == "transfer" ? (
                    <EditTransfer />
                  ) : currentTab.toLowerCase() == "payments" ? (
                    <EditPaymentScheme />
                  ) : currentTab.toLowerCase() == "admt" ? (
                    <EditADMT />
                  ) : currentTab.toLowerCase() == "payout payments" ? (
                    <EditPayoutPayments
                      tableData={sdata}
                      scheme={rowD}
                      cateId={cateId}
                    />
                  ) : currentTab.toLowerCase() == "pay in" ? (
                    <EditPayIn />
                  ) : null}
                </Box>
              </SchemeDetail.Provider>
            )
        )}
      </Grid>
    </>
  );
}
