import {
  Button,
  Card,
  Stack,
  TableBody,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as Yup from "yup";
import React, { useState, useEffect } from "react";
import DateRangePicker from "src/components/date-range-picker/DateRangePicker";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { fDateFormatForApi } from "src/utils/formatTime";
import FormProvider from "src/components/hook-form/FormProvider";
import { LoadingButton } from "@mui/lab";
import AWS from "aws-sdk";
import dayjs from "dayjs";
import WalletLadger from "./WalletLadger";
import { useAuthContext } from "src/auth/useAuthContext";

type FormValuesProps = {
  startDate: Date | null;
  endDate: Date | null;
};

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

export default function Temporaryreport() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [sdata, setSdata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    startDate: null,
    endDate: null,
  };

  const methods = useForm<FormValuesProps, any>({
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = methods;

  // Effect to reset end date when start date changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "startDate" && value.startDate) {
        setValue("endDate", null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  //   const DownloadReport = (val: string) => {
  //     const s3 = new AWS.S3();
  //     const params = {
  //       Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //       Key: val !== "" && val?.split("/").splice(4, 4).join("/"),
  //       Expires: 600,
  //     };

  //     s3.getSignedUrl("getObject", params, (err, url) => {
  //       window.open(url);
  //     });
  //   };

  function fDateFormatForApi(date: any) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    return `${year}/${month}/${day}`;
  }

  const startDate = fDateFormatForApi(getValues("startDate"));
  const endDate = fDateFormatForApi(getValues("endDate"));

  const ExportData = async () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      startDate: startDate,
      endDate: endDate,
    };
    await Api(
      `dashboard/getTransactionReportByAdmin
 `,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          //   DownloadReport(Response.data.filePath);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <FormProvider methods={methods} onSubmit={handleSubmit(ExportData)}>
        <Card sx={{ width: 500, height: "30vh" }}>
          <Stack justifyContent={"center"} alignItems={"center"} padding={4}>
            <Typography variant="h4">
              Master Transaction Report Export
            </Typography>
          </Stack>
          <Stack direction={"row"} gap={1} justifyContent={"center"}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start date"
                inputFormat="YYYY/MM/DD"
                value={watch("startDate")}
                maxDate={new Date()}
                onChange={(newValue: any) => setValue("startDate", newValue)}
                renderInput={(params: any) => (
                  <TextField {...params} size={"small"} sx={{ width: 150 }} />
                )}
              />
              <DatePicker
                label="End date"
                inputFormat="YYYY/MM/DD"
                disabled={!watch("startDate")}
                value={watch("endDate")}
                minDate={dayjs(watch("startDate"))}
                maxDate={dayjs(watch("startDate")).add(7, "day")}
                onChange={(newValue: any) => setValue("endDate", newValue)}
                renderInput={(params: any) => (
                  <TextField {...params} size={"small"} sx={{ width: 150 }} />
                )}
              />
            </LocalizationProvider>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
      <Stack mt={2}>
        <Ladgerexport />
      </Stack>
    </div>
  );
}

// ----------------------------------------

type FormValuesProps1 = {
  startDate: Date | null;
  endDate: Date | null;
};

const Ladgerexport = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",
  });
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [sdata, setSdata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    startDate: null,
    endDate: null,
  };

  const methods = useForm<FormValuesProps1, any>({
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = methods;

  // Effect to reset end date when start date changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "startDate" && value.startDate) {
        setValue("endDate", null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  //   const DownloadReport = (val: string) => {
  //     const s3 = new AWS.S3();
  //     const params = {
  //       Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
  //       Key: val !== "" && val?.split("/").splice(4, 4).join("/"),
  //       Expires: 600,
  //     };

  //     s3.getSignedUrl("getObject", params, (err, url) => {
  //       window.open(url);
  //     });
  //   };

  function fDateFormatForApi(date: any) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    return `${year}/${month}/${day}`;
  }

  const startDate = fDateFormatForApi(getValues("startDate"));
  const endDate = fDateFormatForApi(getValues("endDate"));

  const LadgerExport = async () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      startDate: startDate,
      endDate: endDate,
    };
    await Api(
      `dashboard/getWalletLedgerReportByAdmin
   `,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          //   DownloadReport(Response.data.filePath);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <FormProvider methods={methods} onSubmit={handleSubmit(LadgerExport)}>
        <Card sx={{ width: 500, height: "30vh" }}>
          <Stack justifyContent={"center"} alignItems={"center"} padding={4}>
            <Typography variant="h4">Wallet Ladger Report Export</Typography>
          </Stack>
          <Stack direction={"row"} gap={1} justifyContent={"center"}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start date"
                inputFormat="YYYY/MM/DD"
                value={watch("startDate")}
                maxDate={new Date()}
                onChange={(newValue: any) => setValue("startDate", newValue)}
                renderInput={(params: any) => (
                  <TextField {...params} size={"small"} sx={{ width: 150 }} />
                )}
              />
              <DatePicker
                label="End date"
                inputFormat="YYYY/MM/DD"
                disabled={!watch("startDate")}
                value={watch("endDate")}
                minDate={dayjs(watch("startDate"))}
                maxDate={dayjs(watch("startDate")).add(7, "day")}
                onChange={(newValue: any) => setValue("endDate", newValue)}
                renderInput={(params: any) => (
                  <TextField {...params} size={"small"} sx={{ width: 150 }} />
                )}
              />
            </LocalizationProvider>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </div>
  );
};
