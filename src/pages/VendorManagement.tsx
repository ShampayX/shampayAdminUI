import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
// @mui
import { Tabs, Tab } from "@mui/material";
import Iconify from "src/components/iconify";
import React from "react";
import AddNewVendor from "../sections/vendormanagement/AddNewVendor";
import ViewVendors from "../sections/vendormanagement/ViewVendors";

// sections

// ----------------------------------------------------------------------

export default function VendorManagement() {
  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box style={{ padding: "24px 0" }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const [valueTabs, setvalueTabs] = React.useState(0);
  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };

  return (
    <>
      <Helmet>
        <title> Vendor | Shampay Admin</title>
      </Helmet>

      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            marginBottom: "20px",
            fontSize: "20px",
          }}
        >
          <Tabs
            value={valueTabs}
            onChange={handleChangePanels}
            aria-label="basic tabs example"
          >
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4>
                  {" "}
                  <Iconify
                    icon={"eva:plus-outline"}
                    style={{ marginRight: "5px" }}
                  />
                  Add New Vendor
                </h4>
              }
              {...a11yProps(0)}
            />
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4>
                  <Iconify
                    icon={"eva:eye-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  View All Vendors
                </h4>
              }
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
      </Box>
      <TabPanel value={valueTabs} index={0}>
        <AddNewVendor />
      </TabPanel>
      <TabPanel value={valueTabs} index={1}>
        <ViewVendors />
      </TabPanel>
    </>
  );
}
