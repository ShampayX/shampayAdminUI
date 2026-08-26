import React, { useEffect, useState } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import { Typography, TableContainer, Stack, Tabs, Tab } from "@mui/material";
import VendorCreditCardData from "../paymentsData/VendorCreditCardData";

function Payements() {
  const { Api } = useAuthContext();
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedTab, setSelectedTab] = useState("");
  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setCategoryList(Response.data.data);

          Response?.data?.data?.map((item: any) => {
            if (item.category_name == "PAYMENTS") {
              getProductlist(item?._id);
            }
          });
        }
      }
    });
  };

  const getProductlist = (val: any) => {
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setProductList(Response?.data?.data);
          } else {
          }
        }
      }
    );
  };

  const handleTabChange = () => {};

  return (
    <>
      <Stack sx={{ p: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ textTransform: "capitalize", background: "#F4F6F8" }}
        >
          <Stack sx={{ ml: 2 }}>
            <Typography variant="body1">
              {productList.map((item: any, index) => (
                <Tab key={item._id} label={item.productName} value={item._id} />
              ))}
            </Typography>
          </Stack>
        </Tabs>

        {productList.map((tab: any) =>
          tab?.productName == "Credit Cards" ? <VendorCreditCardData /> : ""
        )}
      </Stack>
    </>
  );
}

export default Payements;
