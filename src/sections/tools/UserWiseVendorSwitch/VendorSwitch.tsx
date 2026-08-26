// @mui
import { Tabs, Tab } from "@mui/material";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Box, CardProps, Typography } from "@mui/material";

import React from "react";

import ServicesVenderSwitch from "./ServicesVenderSwitch";
import OtherVenderSwitch from "./OtherVenderSwitch";

// ----------------------------------------------------------------------
type RowProps = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  commType: string;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function VendorSwitch() {
  type FormValuesProps = {
    product: string;
    apiProvider: string;
    commType: string;
    commIn: string;
    search: string;
    afterSubmit?: string;
  };

  const FilterSchema = Yup.object().shape({
    product: Yup.string(),
    apiProvider: Yup.string(),
    commType: Yup.string(),
    commIn: Yup.string(),
  });

  const defaultValues = {
    product: "",
    apiProvider: "",
    commType: "",
    commIn: "",
    search: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

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
      <Box sx={{ width: "100%" }}>
        <Box>
          <Tabs
            value={valueTabs}
            onChange={handleChangePanels}
            aria-label="basic tabs example"
          >
            <Tab
              style={{ fontSize: "18px" }}
              label={<h4> services</h4>}
              {...a11yProps(0)}
            />
            <Tab
              style={{ fontSize: "18px" }}
              label={<h4>Others</h4>}
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
      </Box>
      <TabPanel value={valueTabs} index={0}>
        <ServicesVenderSwitch />
      </TabPanel>
      <TabPanel value={valueTabs} index={1}>
        <OtherVenderSwitch />
      </TabPanel>
    </>
  );
}
