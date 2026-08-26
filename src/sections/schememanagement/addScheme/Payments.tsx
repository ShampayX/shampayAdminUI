import React, { useContext, useEffect, useState } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import { SchemeDetail } from "../ManageScheme/AddNewScheme";
import CreditCard from "../Paymentsscheme/CreditCard";
import { Card, Stack, Tab, Tabs, Typography } from "@mui/material";

export const ProductContext = React.createContext({});

export default function Payments() {
  const schemeDetail: any = useContext(SchemeDetail);
  const { Api } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [currentTab, setCurrentTab] = useState("");

  useEffect(() => {
    getProductlist(schemeDetail?.categoryId);
  }, []);

  const getProductlist = (val: string) => {
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setProductList(Response?.data?.data);
            setCurrentTab(Response?.data?.data[0]?._id);
          }
        }
      }
    );
  };

  return (
    <>
      <Card>
        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{ textTransform: "capitalize", background: "#F4F6F8", px: 1 }}
        >
          {productList.map((item: any) => (
            <Tab key={item._id} label={item.productName} value={item._id} />
          ))}
        </Tabs>

        <Stack>
          {productList.map((tab: any) => (
            <ProductContext.Provider
              value={{ productName: tab.productName, productId: tab._id }}
            >
              {tab?.productName == "Credit Cards" ? <CreditCard /> : ""}
            </ProductContext.Provider>
          ))}
        </Stack>
      </Card>
    </>
  );
}
