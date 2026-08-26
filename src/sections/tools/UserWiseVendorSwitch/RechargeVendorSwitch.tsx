import { useEffect, useState, useCallback } from "react";
// @mui
import {
  Stack,
  Tabs,
  Button,
  Tab,
  Modal,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
// redux
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";

import RechargeVendorSwitchTable from "./RechargeVendorSwitchTable";
import { useAuthContext } from "src/auth/useAuthContext";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  category: string;
  question: string;
  answer: string;
};
const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function RechargeVendorSwitch(props: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [product, setProduct] = useState([]);
  const [tableLabel, setTableLabel] = useState([]);

  useEffect(() => {
    getProductList();
  }, []);

  const getProductList = () => {
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
          let staticLabel: any = [
            { id: "productName", label: "Product Name" },
            { id: "our", label: "Our Operator Id" },
            { id: "directvendor", label: "Direct Agent Vendor" },
            { id: "distributor", label: "Distribution network" },
            { id: "apivendor", label: "Api user Vendor" },
            { id: "switch", label: "Action" },
          ];
          let array: any = [];
          Response.data.result1[0].vendors.map((item: any, index: number) => {
            if (item.services == "Yes") {
              let obj: any = { id: item.vendorid, label: item.vendorName };
              array.push(obj);
            }
          });
          array.reverse().map((item: string) => {
            staticLabel.splice(2, 0, item);
          });
          setTableLabel(staticLabel);
        } else {
        }
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Stack m={2} width={200}></Stack>
        <RechargeVendorSwitchTable
          tableData={product}
          tableLabels={tableLabel}
        />
      </Box>
    </>
  );
}
