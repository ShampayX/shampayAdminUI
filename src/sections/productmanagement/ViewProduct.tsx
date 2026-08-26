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
  Box,
  CardProps,
  SelectChangeEvent,
  Modal,
} from "@mui/material";
import { useSettingsContext } from "../../components/settings";
import { useSnackbar } from "../../components/snackbar";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import React from "react";
import ProductTable from "./ProductTable";

import { Upload } from "src/components/upload";
import EditBBPSproducts from "./EditBBPSproducts";
import { useAuthContext } from "src/auth/useAuthContext";
// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
const products = [
  {
    id: "12345",
    name: "P",
    productId: "Product ID",
    productName: "Product Name",
    date: "23 Dec 2022",
    subcategory: "DTH",
    paySprint: "AT",
    sctSprint: "AV",
    razorpay: "KD",
    _id: "123",
    payUMoney: "PP",
    directAgent: "Vendor 2",
    neoNetwork: "Paysprint",
    apiUser: "Vendor 3",
    actionWallet: "Main Wallet",
    avatar: "",
  },
  {
    id: "12345",
    name: "P",
    productId: "Product ID",
    productName: "Product Name",
    date: "23 Dec 2022",
    subcategory: "DTH",
    paySprint: "AT",
    sctSprint: "AV",
    razorpay: "KD",
    _id: "123",
    payUMoney: "PP",
    directAgent: "Vendor 2",
    neoNetwork: "Paysprint",
    apiUser: "Vendor 3",
    actionWallet: "Main Wallet",
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
  commissionStructure: string;
  maxComm: number;
  commType: string;
  status: string;
  product_logo: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function ViewProduct() {
  const { Api, UploadFileApi } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettingsContext();
  const [category, setCategory] = useState([]);

  const [openNav, setOpenNav] = useState(false);

  const [imgpath, setImgpath] = useState("");
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [categoryData, setCategoryData] = useState<any>({});
  const [pdata, setPdata] = useState([]);
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

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
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
    getCategory();
  }, []);
  useEffect(() => {
    getProductlist(categoryData._id);
  }, [categoryData._id]);

  const imgupload = () => {
    let doc = imgfile;
    // let token = localStorage.getItem('token');
    let formData = new FormData();
    formData.append("productCsv", doc);
    UploadFileApi(`product/uploadProductCSV`, formData, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("success");

            setImgpath(Response.data.filePath);
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  const getCategory = () => {
    const token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setCategory(Response.data.data);
          setCategoryData(Response.data.data[0]);
        } else {
        }
      }
    });
  };

  const getProductlist = (val: string) => {
    categoryData?.category_name?.toLowerCase() !== "bill payment" &&
      Api(`product/get_ProductList/${val}`, "GET", "", "").then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              setPdata(Response.data.data);
            } else {
            }
          }
        }
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
        <title>View all Product | Shampay Admin</title>
      </Helmet>
      {/* <Stack
        style={{
          flexDirection: 'row',
          marginBottom: '10px',
          justifyContent: 'flex-end',
          marginTop: '-20px',
        }}
      >
        <LoadingButton variant="contained" onClick={() => csvDownload()}>
          Download CSV File
        </LoadingButton>
        <LoadingButton variant="contained" onClick={openEditModal} style={{ marginLeft: '10px' }}>
          Upload CSV File to Update
        </LoadingButton>
      </Stack> */}

      <Box sx={{ width: "100%" }}>
        <Box>
          <Tabs
            value={valueTabs}
            onChange={handleChangePanels}
            aria-label="basic tabs example"
            sx={{ background: "#F4F6F8" }}
          >
            {category.map((item: any, index: number) => {
              let arr: any = [];
              {
                arr = pdata.filter((len: any) => len.category == item._id);
              }
              return (
                <Tab
                  style={{ fontSize: "15px" }}
                  key={item._id}
                  label={<h4>{item.category_name}</h4>}
                  onClick={() => setCategoryData({ ...item })}
                  {...a11yProps(index)}
                />
              );
            })}
          </Tabs>
        </Box>
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
                onClick={() => imgupload()}
              >
                Upload
              </LoadingButton>
            ) : null}
          </Box>
        </Modal>
      </Box>

      <Grid item xs={12} md={6} lg={8}>
        {categoryData?.category_name?.toLowerCase() === "bill payment" ? (
          <EditBBPSproducts categoryData={categoryData} />
        ) : (
          <ProductTable
            tableData={pdata}
            categoryData={categoryData}
            tableLabels={[
              { id: "product", label: "Product Details" },
              { id: "subcategory", label: "Subcategory" },
              { id: "due", label: "Circle/Area" },
              { id: "maxComm", label: "Max. Limit" },
              { id: "commType", label: "Transaction type" },
              { id: "due", label: "Comm. Structure" },
              { id: "commType", label: "Max. Comm." },
              { id: "commType", label: "Product For" },
              { id: "commType", label: "Plan Provider" },
              { id: "commType", label: "Action Wallet" },
              { id: "commType", label: "Action" },
            ]}
          />
        )}
      </Grid>
    </>
  );
}
