import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
// @mui
import {
  Stack,
  Tabs,
  Button,
  Tab,
  Modal,
  Select,
  MenuItem,
} from "@mui/material";
// redux
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Helmet } from "react-helmet-async";

import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Upload } from "src/components/upload";

import { Box } from "@mui/material";

import React from "react";

// import RechargeVendorSwitch from './RechargeVendorSwitch';
import KYCVender from "./KYCVender";
import { useAuthContext } from "src/auth/useAuthContext";
import Panneydrop from "./Panneydrop";
import { isOk, notifyFailure } from "src/utils/apiResult";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  category: string;
  question: string;
  answer: string;
};
const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function ServicesVenderSwitch() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [pId, setpId] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  const [superCurrentTab, setSuperCurrentTab] = useState("Recharges");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const FilterSchema = Yup.object().shape({
    category: Yup.string().required(),
    question: Yup.string().required(),
    answer: Yup.string().required(),
  });

  const defaultValues = {
    category: "",
    question: "",
    answer: "",
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

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    Api(`category/getOtherCategoryList`, "GET", "", "").then(
      (Response: any) => {
        if (isOk(Response)) {
          setCategoryList(Response.data.data);
          setSuperCurrentTab(Response.data.data[0].category_name);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Tabs
          value={superCurrentTab}
          aria-label="basic tabs example"
          sx={{ background: "#F4F6F8" }}
          onChange={(event, newValue) => setSuperCurrentTab(newValue)}
        >
          {categoryList.map((tab: any) => (
            <Tab
              key={tab._id}
              label={tab.category_name}
              value={tab.category_name}
              sx={{ ml: 2 }}
            />
          ))}
        </Tabs>
        {categoryList.map(
          (tab: any) =>
            tab.category_name == superCurrentTab && (
              <Box key={tab.category_name} sx={{ m: 3 }}>
                {superCurrentTab == "KYC" ? (
                  <KYCVender />
                ) : superCurrentTab == "Penny drop" ? (
                  <Panneydrop />
                ) : null}
              </Box>
            )
        )}
      </Box>
    </>
  );
}
