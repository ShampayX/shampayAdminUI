import { useContext, useEffect, useState } from "react";
import { Stack, Tabs, Tab } from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";
import { SchemeDetail } from "../ManageScheme/EditScheme";
import EditCreditCard from "../Paymentsscheme/EditCreditCard";

function EditPaymentScheme() {
  const { Api } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const schemeDetail: any = useContext(SchemeDetail);
  const [currentTab, setCurrentTab] = useState("");

  useEffect(() => {
    getProductlist();
  }, []);

  const getProductlist = () => {
    let token = localStorage.getItem("token");
    Api(
      `product/get_ProductList/${schemeDetail.categoryId}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setProductList(Response?.data?.data);
          setCurrentTab(Response?.data?.data[0]?._id);
        }
      }
    });
  };

  return (
    <>
      <Stack sx={{ p: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{ textTransform: "capitalize", background: "#F4F6F8", px: 1 }}
        >
          {productList.map((item: any) => (
            <Tab key={item._id} label={item.productName} value={item._id} />
          ))}
        </Tabs>
        <Stack sx={{ mt: 1 }}>
          {productList.map((tab: any) =>
            tab?.productName == "Credit Cards" ? (
              <EditCreditCard productId={currentTab} />
            ) : (
              ""
            )
          )}
        </Stack>
      </Stack>
    </>
  );
}

export default EditPaymentScheme;
