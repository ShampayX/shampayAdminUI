import { createContext, useEffect, useState } from "react";
import { Box, Tab } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "../../../components/snackbar";
import { KitTabs, EmptyState, LoadingState } from "src/components/page-kit";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import RechargeVendorSwitch from "./RechargeVendorSwitch";
import MoneyTransferVendorSwitch from "./MoneyTransferVendorSwitch";
import DMT2VendorSwitch from "./Dmt2VendorSwitch";
import PartnerBilling from "./KYCVender";
import { useAuthContext } from "src/auth/useAuthContext";
import TransferVendorSwitch from "./TransferVendorSwitch";
import PayoutPayments from "./PayoutPayments";
import MobileUPI from "./MobileUPI";
import PennyVerification from "./PennyVerification";
// ----------------------------------------------------------------------

export const CategoryContext = createContext(null);

export default function ServicesVenderSwitch() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [categoryList, setCategoryList] = useState([]);
  const [superCurrentTab, setSuperCurrentTab] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setCategoryList(Response.data.data);
          setSuperCurrentTab(Response.data.data[0]?.category_name);
        }
      }
      setIsLoading(false);
    });
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      {isLoading ? (
        <LoadingState label="Loading services..." />
      ) : categoryList.length === 0 ? (
        <EmptyState
          icon={<CategoryOutlinedIcon />}
          title="No services"
          description="The platform has no service categories, so there is nothing to route."
        />
      ) : (
      <Box>
        <KitTabs
          value={superCurrentTab}
          onChange={(event, newValue) => setSuperCurrentTab(newValue)}
        >
          {categoryList.map((tab: any) => (
            <Tab
              key={tab._id}
              label={tab.category_name}
              value={tab.category_name}
            />
          ))}
        </KitTabs>
        {categoryList.map(
          (tab: any) =>
            tab.category_name == superCurrentTab && (
              <CategoryContext.Provider value={tab}>
                <Box key={tab.category_name}>
                  {tab.category_name.toLowerCase() == "recharges" ? (
                    <RechargeVendorSwitch categoryId={tab._id} />
                  ) : superCurrentTab.toLowerCase() == "dmt2" ? (
                    <DMT2VendorSwitch />
                  ) : superCurrentTab.toLowerCase() == "money transfer" ? (
                    <MoneyTransferVendorSwitch />
                  ) : superCurrentTab.toLowerCase() == "transfer" ? (
                    <TransferVendorSwitch />
                  ) : superCurrentTab.toLowerCase() == "kyc" ? (
                    <PartnerBilling />
                  ) : superCurrentTab.toLowerCase() == "payout payments" ? (
                    <PayoutPayments />
                  ) : superCurrentTab == "MOBILE UPI" ? (
                    <MobileUPI />
                  ) : superCurrentTab == "PENNY VERIFICATION" ? (
                    <PennyVerification />
                  ) : null}
                </Box>
              </CategoryContext.Provider>
            )
        )}
      </Box>
      )}
    </>
  );
}
