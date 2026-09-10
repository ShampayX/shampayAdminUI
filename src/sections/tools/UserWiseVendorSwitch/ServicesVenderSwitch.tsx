import { createContext, useEffect, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "../../../components/snackbar";

import RechargeVendorSwitch from "./RechargeVendorSwitch";
import MoneyTransferVendorSwitch from "./MoneyTransferVendorSwitch";
import DMT2VendorSwitch from "./Dmt2VendorSwitch";
import PartnerBilling from "./KYCVender";
import { useAuthContext } from "src/auth/useAuthContext";
import TransferVendorSwitch from "./TransferVendorSwitch";
import PayoutPayments from "./PayoutPayments";
import { useParams } from "react-router-dom";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

export const CategoryContext = createContext(null);

export default function ServicesVenderSwitch() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [categoryList, setCategoryList] = useState([]);
  const [superCurrentTab, setSuperCurrentTab] = useState("");
  const { id } = useParams<{ id: string }>();

  const params = useParams();
  //

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setCategoryList(Response.data.data);
        setSuperCurrentTab(Response.data.data[0].category_name);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Tabs
          value={superCurrentTab}
          aria-label="basic tabs example"
          sx={{ background: "#e0e3e5" }}
          onChange={(event, newValue) => setSuperCurrentTab(newValue)}
        >
          {categoryList.map((tab: any) => (
            <Tab
              key={tab._id}
              label={tab.category_name}
              value={tab.category_name}
              sx={{ ml: 2 }}
            />
          ))}
        </Tabs>
        {categoryList.map(
          (tab: any) =>
            tab.category_name == superCurrentTab && (
              <CategoryContext.Provider value={tab}>
                <Box key={tab.category_name} sx={{ m: 3 }}>
                  {tab.category_name.toLowerCase() == "recharges" ? (
                    <RechargeVendorSwitch categoryId={tab._id} userId={id!} />
                  ) : superCurrentTab.toLowerCase() == "dmt2" ? (
                    <DMT2VendorSwitch userId={id!} />
                  ) : superCurrentTab.toLowerCase() == "money transfer" ? (
                    <MoneyTransferVendorSwitch userId={id!} />
                  ) : superCurrentTab.toLowerCase() == "transfer" ? (
                    <TransferVendorSwitch userId={id!} />
                  ) : superCurrentTab.toLowerCase() == "kyc" ? (
                    <PartnerBilling />
                  ) : superCurrentTab.toLowerCase() == "payout payments" ? (
                    <PayoutPayments userId={id!} />
                  ) : null}
                </Box>
              </CategoryContext.Provider>
            )
        )}
      </Box>
    </>
  );
}
