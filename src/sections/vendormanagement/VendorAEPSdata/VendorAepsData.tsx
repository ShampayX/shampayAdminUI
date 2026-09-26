import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
// @mui
import { Grid, Pagination, MenuItem } from "@mui/material";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import FormProvider, { RHFSelect } from "../../../components/hook-form";

import { useSnackbar } from "notistack";
import VendorAepsDataTable from "./VendorAepsDataTable";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

export default function VendorAepsData() {
  const { Api } = useAuthContext();
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
  const FilterSchema = Yup.object().shape({});
  type FormValuesProps = {
    vendorName: string;
    _id: string;
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  const { enqueueSnackbar } = useSnackbar();
  const [uploadFile, setUploadFile] = useState<any>();
  const [pData, setPdata] = useState([]);
  const [aepsSlotData, setAepsSlotData] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [vdata, setVdata] = useState([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const onSubmit = () => {};

  useEffect(() => {
    getvendorlist();
    aepsSlotFormat();
  }, []);

  const getvendorlist = () => {
    let token = localStorage.getItem("token");
    Api(`vendor/get_VendorList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setVdata(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const aepsSlotFormat = () => {
    let token = localStorage.getItem("token");
    Api(`vendor/showAepsSlot`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        // enqueueSnackbar(Response.data?.message);
        setAepsSlotData(Response.data?.data?.slotsData?.vendor_slots);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };
  return (
    <>
      <Helmet>
        <title> Vendor AEPS Data | Shampay Admin</title>
      </Helmet>
      <Box sx={{ mx: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 0.5fr)",
              }}
            >
              <RHFSelect
                name="vendorName"
                label="Select Vendor"
                placeholder="Select Vendor"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize", minWidth: 300 },
                }}
                size="small"
              >
                {vdata.map((item: any, index: any) => {
                  return (
                    <MenuItem
                      key={index}
                      value={item.vendorName}
                      onClick={() => setVendorId(item._id)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
            </Grid>
          </Box>
        </FormProvider>
        <Grid xs={12} md={6} lg={8} mt={2}>
          <VendorAepsDataTable
            tableData={aepsSlotData}
            pData={pData}
            tableLabels={[
              { id: "minslab", label: "Min Slab" },
              { id: "maxslab", label: "Max Slab" },
              { id: "bankmaxpayout", label: "Bank Max Payout" },
              { id: "gst", label: "GST" },
              { id: "tds", label: "TDS" },
              { id: "aepsvendorpayout", label: "AEPS Vendor Payout" },
              { id: "netpayout", label: "Net Payout" },
              { id: "action", label: "Action" },
            ]}
          />
        </Grid>
      </Box>
    </>
  );
}
