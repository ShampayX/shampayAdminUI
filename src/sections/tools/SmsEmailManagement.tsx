import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import {
  Stack,
  Grid,
  Card,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Modal,
  MenuItem,
} from "@mui/material";
import FormProvider, {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
} from "src/components/hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import Scrollbar from "src/components/scrollbar";
import SmsTemplate from "./SmsTemplate";
import EmailTemplate from "./EmailTemplate";

type FormValuesProps = {};

function SmsEmailManagement() {
  const [emailValue, setEmailValue] = useState("");
  const [smsValue, setSmsValue] = useState("");

  const [open1, setOpen1] = React.useState(false);

  const setEditorEmailValue = (val: any) => {
    setEmailValue(val);
  };
  const setEditorSmsValue = (val: any) => {
    setSmsValue(val);
  };

  const defaultValues = {
    mobileNumber: "",
    Circle: "",
    Operator: "",
    Amount: "",
  };

  const textScheme = Yup.object().shape({});

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(textScheme),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const addSmsTemp = () => {};

  return (
    <>
      {/* <Typography fontSize={24} my={3}>
        Email/SMS Template
      </Typography> */}
      {/* <SmsTemplate /> */}
    </>
  );
}

export default SmsEmailManagement;
