import { useEffect, useState } from "react";
// @mui
import { Box } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";
import { EmptyState, LoadingState } from "src/components/page-kit";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";

import RechargeVendorSwitchTable from "./RechargeVendorSwitchTable";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

export default function RechargeVendorSwitch(props: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [product, setProduct] = useState([]);
  const [tableLabel, setTableLabel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProductList();
  }, []);

  const getProductList = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(
      "admin/rechargeControl/get_ProductList/" + props.categoryId,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.status == 200) {
          enqueueSnackbar(Response.data.message);
          setProduct(Response.data.result1);
          /* Action first, matching the kit convention on every other table */
          let staticLabel: any = [
            { id: "switch", label: "Action" },
            { id: "productName", label: "Product Name" },
            { id: "our", label: "Our Operator Id" },
            { id: "directvendor", label: "Direct Agent Vendor" },
            { id: "distributor", label: "Distribution network" },
            { id: "apivendor", label: "Api user Vendor" },
          ];
          let array: any = [];
          Response.data.result1[0].vendors.map((item: any, index: number) => {
            if (item.services == "Yes") {
              let obj: any = { id: item.vendorid, label: item.vendorName };
              array.push(obj);
            }
          });
          /* vendor short-code columns sit after Product / Operator Id */
          array.reverse().map((item: string) => {
            staticLabel.splice(3, 0, item);
          });
          setTableLabel(staticLabel);
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      {isLoading ? (
        <LoadingState label="Loading recharge vendors..." />
      ) : product.length === 0 ? (
        <EmptyState
          icon={<AltRouteOutlinedIcon />}
          title="No recharge products"
          description="This service has no products configured, so there is nothing to route."
        />
      ) : (
        <Box>
          <RechargeVendorSwitchTable
            tableData={product}
            tableLabels={tableLabel}
          />
        </Box>
      )}
    </>
  );
}
