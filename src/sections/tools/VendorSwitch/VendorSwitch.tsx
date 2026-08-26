import { SyntheticEvent, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import { Box, Tab } from "@mui/material";
// page kit
import { PageHeader, KitTabs } from "src/components/page-kit";
//
import ServicesVenderSwitch from "./ServicesVenderSwitch";
import OtherVenderSwitch from "./OtherVenderSwitch";

// ----------------------------------------------------------------------
// Utilities > Vendor Switch.
//
// Shell only: a header and the two groups of services. Every actual switch
// lives in the panel for its service and calls the same endpoint it always
// did - this file has no API calls of its own.
//
// Services  category/get_CategoryList      -> one panel per category
// Others    category/getOtherCategoryList  -> KYC, Penny drop
// ----------------------------------------------------------------------

const TABS = [
  { value: "services", label: "Services" },
  { value: "others", label: "Others" },
];

export default function VendorSwitch() {
  const [tab, setTab] = useState("services");

  const handleChange = (_: SyntheticEvent, value: string) => setTab(value);

  return (
    <>
      <Helmet>
        <title> Vendor Switch | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Vendor Switch"
          subtitle="Choose which provider handles each service, per customer lane. Changes here are the platform default - per-user overrides live under People > Vendor Routing."
        />

        <KitTabs value={tab} onChange={handleChange}>
          {TABS.map((entry) => (
            <Tab key={entry.value} value={entry.value} label={entry.label} />
          ))}
        </KitTabs>

        {tab === "services" ? <ServicesVenderSwitch /> : <OtherVenderSwitch />}
      </Box>
    </>
  );
}
