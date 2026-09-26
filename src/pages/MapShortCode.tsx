import { useEffect, useState, useCallback } from "react";
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
  FormControl,
  Pagination,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Modal,
} from "@mui/material";
// redux
import { useSettingsContext } from "../components/settings";
import { Helmet } from "react-helmet-async";

import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Label from "../components/label";
import { Upload } from "src/components/upload";

import {
  Box,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  Typography,
  TableContainer,
} from "@mui/material";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify";
import React from "react";
import ProductTable from "../sections/productmanagement/MapShortCodeTable";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// import { Label } from '@mui/icons-material';

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
  productLogoUrl: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function MapShortCode() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();

  const { themeStretch } = useSettingsContext();

  const params = useParams();
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pdata, setPdata] = useState([
    {
      id: "",
      category: "",
      subcategory: "",
      subcategoryName: "",
      name: "",
      productLogoUrl: "",
      productName: "",
      productId: "",
      createdOn: "",
      directAgentVendor: "",
      directAgentVendorName: "",
      neoNetworkVendor: "",
      neoNetworktVendorName: "",
      apiUserVendor: "",
      apiUserVendorName: "",
      actionWallet: "",
      vendors: [{ vendorName: "", vendorId: "", shortCode: "", services: "" }],
    },
  ]);
  const [vdata, setVdata] = useState([]);
  const [tableLabels, setTableLabels] = useState([
    { id: "product", label: "Product Details" },
    { id: "subcategory", label: "Subcategory" },

    // { id: 'SCTSprint', label: 'SCTSprint'},
    // { id: 'RazorPay', label: 'RazorPay' },
    // { id: 'PayUMoney', label: 'PayUMoney'},
    // { id: 'SCPaySprint', label: 'SCPaySprint' },
    { id: "DirectAgents", label: "Direct Agents" },
    { id: "NeoNetwork", label: "Neo Network" },
    { id: "apiUsers", label: "API Users" },
    { id: "ActionWallet", label: "Action Wallet" },
    { id: "Action", label: "Action" },
  ]);

  const [tablab, setTablab] = useState([]);
  const [open, setModalEdit] = React.useState(false);
  const [imgfile, setImgfile] = useState<any>();
  const openEditModal = (val: any) => {
    setModalEdit(true);
  };
  const handleClose = () => setModalEdit(false);
  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const imgfile = acceptedFiles[0];
    if (imgfile) {
      setImgfile(
        Object.assign(imgfile, {
          preview: URL.createObjectURL(imgfile),
        })
      );
    }
  }, []);

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
  const [age, setAge] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };
  useEffect(() => {
    // getProductlist();
    getvendorlist();
    getShortCodeAndRoute();
  }, []);

  const getShortCodeAndRoute = () => {
    Api(`product/get_product_shortCodeAndRoute`, "GET", "", "").then(
      (Response: any) => {
        if (isOk(Response)) {
          setPdata(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };
  // const getProductlist = () => {

  //   Api(`product/get_ProductList`, "GET", '', '').then((Response: any) => {
  //
  //     if (Response?.status == 200) {
  //       if (Response.data.code == 200) {
  //         setPdata(Response.data.data)
  //

  //       } else {
  //

  //       }
  //     }
  //   })

  // }

  const getvendorlist = () => {
    Api(`vendor/get_VendorList`, "GET", "", "").then((Response: any) => {
      if (isOk(Response)) {
        setVdata(Response.data.data);
        //

        // tableLabels.splice(2,item.vendorName)
        {
          let tableLabels: any = [
            { id: "product", label: "Product Details" },
            { id: "subcategory", label: "Subcategory" },

            // { id: 'SCTSprint', label: 'SCTSprint'},
            // { id: 'RazorPay', label: 'RazorPay' },
            // { id: 'PayUMoney', label: 'PayUMoney'},
            // { id: 'SCPaySprint', label: 'SCPaySprint' },
            { id: "DirectAgents", label: "Direct Agents" },
            { id: "NeoNetwork", label: "Neo Network" },
            { id: "apiUsers", label: "API Users" },
            { id: "ActionWallet", label: "Action Wallet" },
            { id: "Action", label: "Action" },
          ];
          Response.data.data.map((item: any, index: any) => {
            // console.log('====>',item.vendorName)
            let obj: any = { id: item.vendorName, label: item.vendorName };
            tableLabels.splice(2, 0, obj);
            setTablab(tableLabels);
          });
        }
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const csvDownload = () => {
    window.open(
      "https://api.shampay.pro/product/download_Product_Csv",
      "_blank"
    );
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: '40%',
    // height: '40%',
    bgcolor: "background.paper",
    border: "4px solid #00AB55",
    boxShadow: 24,
    padding: "10px 32px",
    overflow: "auto",
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
        <title>Map ShortCode | Shampay Admin</title>
      </Helmet>
      <Stack
        style={{
          flexDirection: "row",
          marginBottom: "10px",
          justifyContent: "flex-end",
        }}
      >
        <LoadingButton variant="contained" onClick={() => csvDownload()}>
          Download CSV File
        </LoadingButton>

        <LoadingButton
          variant="contained"
          onClick={openEditModal}
          style={{ marginLeft: "5px" }}
        >
          Upload CSV File to Update
        </LoadingButton>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Upload
            file={imgfile}
            onDrop={handleDropSingleFile}
            onDelete={() => setImgfile(null)}
          />
          {imgfile ? (
            <LoadingButton
              variant="contained"
              component="span"
              style={{
                margin: "0 8px 0 auto",
                marginTop: "10px",
                marginLeft: "250px",
              }}
              // onClick={()=>imgupload()}
            >
              Upload
            </LoadingButton>
          ) : null}
        </Box>
      </Modal>
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
            sx={{ background: "#F4F6F8", padding: "0 20px", height: "48px" }}
          >
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginRight: "5px" }}
                  >
                    23
                  </Label>
                  Bill Payments
                </h4>
              }
              {...a11yProps(0)}
            />
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"info"}
                    style={{ marginRight: "5px" }}
                  >
                    24
                  </Label>
                  AEPS & mATM
                </h4>
              }
              {...a11yProps(1)}
            />
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"warning"}
                    style={{ marginRight: "5px" }}
                  >
                    8
                  </Label>
                  Recharge
                </h4>
              }
              {...a11yProps(2)}
            />
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"success"}
                    style={{ marginRight: "5px" }}
                  >
                    4
                  </Label>
                  Money Transfer{" "}
                </h4>
              }
              {...a11yProps(3)}
            />
            <Tab
              style={{ fontSize: "18px" }}
              label={
                <h4 style={{ marginBlockStart: "10px" }}>
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginRight: "5px" }}
                  >
                    8
                  </Label>
                  Others
                </h4>
              }
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>
      </Box>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {/* <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}> */}
        <div>
          <FormControl sx={{ m: 1, minWidth: "15%" }}>
            <InputLabel id="demo-simple-select-helper-label">
              Subcategory
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={age}
              label="API Provider Zeta"
              size="small"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "15%" }}>
            <InputLabel id="demo-simple-select-helper-label">
              Available For
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={age}
              label="API Provider Zeta"
              size="small"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "15%" }}>
            <InputLabel id="demo-simple-select-helper-label">
              Commission Type
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={age}
              label="API Provider Zeta"
              size="small"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "15%" }}>
            <InputLabel id="demo-simple-select-helper-label">
              Commission in
            </InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={age}
              label="API Provider Zeta"
              size="small"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "28%", float: "right" }}>
            <RHFTextField
              name="search"
              label="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton>
                      <Iconify icon={"eva:search-outline"} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </FormControl>
        </div>
        {/* </Stack> */}
      </FormProvider>
      <Container maxWidth={themeStretch ? false : "xl"}>
        <Grid item xs={12} md={6} lg={8}>
          <ProductTable tableData={pdata} tableLabels={tablab} />
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
