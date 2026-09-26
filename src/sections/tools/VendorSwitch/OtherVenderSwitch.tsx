import { useEffect, useState } from "react";
// @mui
import { Box, Tab } from "@mui/material";
import { Helmet } from "react-helmet-async";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import { KitTabs, EmptyState, LoadingState } from "src/components/page-kit";
//
import KYCVender from "./KYCVender";
import Panneydrop from "./Panneydrop";
import { isOk, notifyFailure } from "src/utils/apiResult";
import { useSnackbar } from "src/components/snackbar";

// ----------------------------------------------------------------------
// Vendor Switch > Others.
//
// Same single endpoint as before - GET category/getOtherCategoryList - and the
// same two panels behind it (KYC, Penny drop). The unused react-hook-form
// setup this file carried (a schema and defaults for category / question /
// answer, none of which was ever rendered) has been dropped; nothing read it.
// ----------------------------------------------------------------------

export default function OtherVenderSwitch() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();

  const [categoryList, setCategoryList] = useState([]);
  const [superCurrentTab, setSuperCurrentTab] = useState("Recharges");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategoryList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryList = () => {
    setIsLoading(true);
    Api(`category/getOtherCategoryList`, "GET", "", "").then(
      (Response: any) => {
        if (isOk(Response)) {
          setCategoryList(Response.data.data);
          setSuperCurrentTab(Response.data.data[0]?.category_name);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        setIsLoading(false);
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>

      {isLoading ? (
        <LoadingState label="Loading other services..." />
      ) : categoryList.length === 0 ? (
        <EmptyState
          icon={<CategoryOutlinedIcon />}
          title="No other services"
          description="There are no additional service categories to route."
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
                <Box key={tab.category_name}>
                  {superCurrentTab == "KYC" ? (
                    <KYCVender />
                  ) : superCurrentTab == "Penny drop" ? (
                    <Panneydrop />
                  ) : null}
                </Box>
              )
          )}
        </Box>
      )}
    </>
  );
}
