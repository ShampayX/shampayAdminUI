import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// @mui
import {
  Container,
  Card,
  Stack,
  Grid,
  InputAdornment,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Button,
  Link,
} from "@mui/material";
// redux
// routes
// components
// sections

import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Helmet } from "react-helmet-async";

import { useDropzone } from "react-dropzone";
import {
  Box,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  Pagination,
  CardHeader,
  Typography,
  TableContainer,
} from "@mui/material";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify";
import React from "react";
import { useSettingsContext } from "src/components/settings";
import Label from "src/components/label";
import VendorTable from "./ViewVendorTable";
import { useAuthContext } from "src/auth/useAuthContext";

// import { Label } from '@mui/icons-material';
// ----------------------------------------------------------------------
const vendors = [
  {
    id: "1234",
    name: "V",
    vendorId: "123",
    vendorName: "Vendor Name",
    date: "23 Dec 2022",
    gst: "03GDS78009Y",
    contact: "SANJEEV KUMAR",
    vendorfor: "Everyone",
    transactionType: "Commission",
    _id: "123405",
    commstruc: "Change at Value",
    paymentterms: "Prepaid",
    reminder: "Every 31st",
    apiDoc: "Click to View",
    // agreement: 'Doc Icon' ,
    avatar: "",
  },
  {
    id: "4567",
    name: "V",
    vendorId: "564",
    vendorName: "Vendor Name",
    date: "23 Dec 2022",
    gst: "03GDS78009Y",
    contact: "SANJEEV KUMAR",
    vendorfor: "Everyone",
    transactionType: "Commission",
    _id: "128345",
    commstruc: "Change at Value",
    paymentterms: "Prepaid",
    reminder: "Every 31st",
    apiDoc: "Click to View",
    // agreement: 'Doc Icon' ,
    avatar: "",
  },
];
type RowProps = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function ViewVendors() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { themeStretch } = useSettingsContext();
  const [currentPage, setCurrentPage] = useState<any>(1);
  const params = useParams();
  const [vdata, setVdata] = useState([]);

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
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };
  useEffect(() => {}, []);

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
  useEffect(() => {
    getvendorlist();
  }, []);

  const getvendorlist = () => {
    Api(`vendor/get_VendorList`, "GET", "", "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setVdata(Response.data.data);
        } else {
        }
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
        <title>View All Vendors | Shampay Admin</title>
      </Helmet>
      <Box sx={{ width: "100%", marginBottom: "-10px" }}>
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
            sx={{
              background: "#F4F6F8",
              padding: "0 20px",
              height: "48px",
              marginTop: "-30px",
            }}
          >
            {/* <Tab style={{fontSize:'20px', color:'#212B36'}} label={ <h5 style={{color:'primary'}}> <Iconify icon={'eva:star-fill'} style={{marginRight:'5px'}} />All Leads<Label variant="soft"  color={('info')} style={{marginLeft:'5px'}}>5K</Label></h5>} {...a11yProps(0)} /> */}
            <Tab
              style={{ fontSize: "20px" }}
              label={
                <h5 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginRight: "5px" }}
                  >
                    {vdata.length}
                  </Label>
                  All
                </h5>
              }
              {...a11yProps(1)}
            />

            <Tab
              style={{ fontSize: "20px" }}
              label={
                <h5 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"success"}
                    style={{ marginRight: "5px" }}
                  ></Label>
                  Recharge
                </h5>
              }
              {...a11yProps(2)}
            />
            <Tab
              style={{ fontSize: "20px" }}
              label={
                <h5 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"warning"}
                    style={{ marginRight: "5px" }}
                  ></Label>
                  Money Transfer
                </h5>
              }
              {...a11yProps(3)}
            />
            <Tab
              style={{ fontSize: "20px" }}
              label={
                <h5 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"warning"}
                    style={{ marginRight: "5px" }}
                  ></Label>
                  Bill Payment
                </h5>
              }
              {...a11yProps(4)}
            />
            <Tab
              style={{ fontSize: "20px" }}
              label={
                <h5 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginRight: "5px" }}
                  ></Label>
                  AEPS and mATM
                </h5>
              }
              {...a11yProps(5)}
            />
            <Tab
              style={{ fontSize: "20px" }}
              label={
                <h5 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginRight: "5px" }}
                  ></Label>
                  Others
                </h5>
              }
              {...a11yProps(6)}
            />
          </Tabs>
        </Box>
      </Box>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          style={{ padding: "0 25px", marginBottom: "10px" }}
        >
          <RHFTextField name="role" label="Subcategory" size="small" />
          <RHFTextField name="role" label="Available For" size="small" />
          <RHFTextField name="role" label="Commission Type" size="small" />
          <RHFTextField name="role" label="Commission in" size="small" />
          <RHFTextField
            name="search"
            label="Search"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <Iconify icon={"eva:search-outline"} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </FormProvider>

      <Container maxWidth={themeStretch ? false : "xl"}>
        <Grid
          item
          xs={12}
          md={6}
          lg={8}
          sx={{ border: "1px", height: "70vh", overflowY: "auto" }}
        >
          <VendorTable
            tableData={vdata}
            tableLabels={[
              { id: "vendorName", label: "Vendor Details" },
              { id: "gst", label: "GSTIN" },
              { id: "contact", label: "Contact" },
              { id: "vendorfor", label: "Vendor For" },
              { id: "transactionType", label: "Transaction Type" },
              { id: "commstruc", label: "Comm. Structure" },
              { id: "paymentterms", label: "Payment Terms" },
              { id: "reminder", label: "Reminder" },
              { id: "apiDoc", label: "API Documentation" },
              // { id: 'agreement', label: 'Agreement' },
              { id: "due", label: "Action" },
            ]}

            //  tableData={[]}
          />
        </Grid>
      </Container>
      <Pagination
        sx={{ display: "flex", justifyContent: "center" }}
        // count={pageSize}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </>
  );
}
function gotoPage() {
  throw new Error("Function not implemented.");
}
