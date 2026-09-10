import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// @mui
import { Card, Grid, Tab, Tabs } from "@mui/material";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
// sections
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "../../../components/snackbar";
import { PATH_DASHBOARD } from "src/routes/paths";
import BillPayments from "../BillPayments/BillPayments";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

export const SchemeDetail = React.createContext({});
export const SubcategoryDetail = React.createContext({});

export default function AddNewBBPSScheme(props: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [subCategory, setSubCategory] = useState<any>([]);
  const [BBPSslotForScheme, setBBPSslotForScheme] = useState<any>([]);
  const [currentTab, setCurrentTab] = useState("");
  const [cateId, setCateId] = useState("");
  const { state } = useLocation();
  const { schemeFor, desc, schemeId } = state || {};

  // *************************share data from product filter api and send this data to component wise

  useEffect(() => {
    !schemeId && getSubCategory();
  }, []);

  const getSubCategory = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        let arr = Response.data.data.filter(
          (item: any) => item.category_name.toLowerCase() == "bill payment"
        );
        setSubCategory(arr[0].sub_category);
        setCateId(arr[0].sub_category[0]._id);
        getBBPSslots(arr[0].sub_category);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getBBPSslots = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`vendor/show_bbps_slots`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setBBPSslotForScheme(
          Response.data.data.map((item: any, index: number) => {
            return {
              minSlab: +item.minSlab,
              maxSlab: +item.maxSlab,
              activeVendorId: "",
              activeVendorName: "",
              agentCommissionType: "",
              agentCommission: "",
              distributorCommissionType: "",
              distributorCommission: "",
              masterDistributorCommissionType: "",
              masterDistributorCommission: "",
              apiUserCommissionType: "",
              apiUserCommission: "",
            };
          })
        );
        enqueueSnackbar(Response.data.message);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Create BBPS Scheme | Shampay Admin</title>
      </Helmet>
      <CustomBreadcrumbs
        links={[
          { name: `BBPS Scheme`, href: "" },
          {
            name: `All BBPS Scheme`,
            href: PATH_DASHBOARD.scheme.AllbbpsScheme,
          },
          { name: `Create BBPS Scheme`, href: "" },
          { name: ` ${schemeFor} Scheme (${desc})`, href: "" },
          // { name: user?.displayName },
        ]}
      />
      <SchemeDetail.Provider value={schemeFor}>
        <Card>
          <SubcategoryDetail.Provider
            value={{ currentTab: currentTab, cateId: cateId }}
          >
            <BillPayments
              tableData={{
                commissionSetting: BBPSslotForScheme,
                categoryDetail: subCategory,
                id: schemeId,
              }}
            />
          </SubcategoryDetail.Provider>
        </Card>
      </SchemeDetail.Provider>
    </>
  );
}
