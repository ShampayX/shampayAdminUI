import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
// @mui
import {
  Stack,
  TextField,
  Button,
  Tab,
  FormHelperText,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
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

import FormProvider, { RHFTextField } from "../../components/hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

type FormValuesProps = {};

export default function WaitingAreaForDuplicateTxn() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [sec, setSec] = useState<any>(0);
  const [min, setMin] = useState<any>(0);
  const [time, setTime] = useState<any>([]);
  const [psec, setPsec] = useState<any>(0);
  const [pmin, setPmin] = useState<any>(0);

  const limitSchema = Yup.object().shape({});
  const defaultValues = {};
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(limitSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getAdminDetail();
    const secondsArray = [];
    for (let i = 0; i <= 59; i++) {
      const secondsObject = {
        value: i < 10 ? `0${i}` : `${i}`,
        label: i < 10 ? `0${i}` : `${i}`,
      };
      secondsArray.push(secondsObject);
    }
    setTime(secondsArray);
  }, []);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: "fit-content",
      },
    },
  };

  const setLimit = () => {
    let token = localStorage.getItem("token");
    let body = {
      timestamp: min * 60 + sec,
    };
    Api("admin/setTxnTimestampForDistributor", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const setLimitp = () => {
    let token = localStorage.getItem("token");
    let body = {
      timestamp: pmin * 60 + psec,
    };
    Api("admin/setTxnTimestampForPartner", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getAdminDetail = () => {
    let token = localStorage.getItem("token");
    Api(`admin/adminDetails`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        // enqueueSnackbar("Limit fetch Succesfully");
        setMin(
          Math.round(Response.data.data.distributorTransactionTimestamp / 60)
        );
        setSec(
          Math.round(Response.data.data.distributorTransactionTimestamp % 60)
        );
        setPmin(
          Math.round(Response.data.data.partnerTransactionTimestamp / 60)
        );
        setPsec(
          Math.round(Response.data.data.partnerTransactionTimestamp % 60)
        );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Hold Management | Shampay Admin</title>
      </Helmet>
      <Stack m={2}>
        <Typography variant="h4">Hold Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Duplicate transaction time limit held against an agent.
        </Typography>
        <FormProvider methods={methods}>
          <Stack flexDirection={"row"} gap={1} alignItems={"center"} mt={3}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-error-label">
                Minute
              </InputLabel>
              <Select
                labelId="demo-simple-select-error-label"
                id="demo-simple-select-error"
                value={min}
                label="Minute"
                MenuProps={MenuProps}
                onChange={(e) => setMin(Number(e.target.value))}
                renderValue={(value) => min + " Min" || value}
                size="small"
              >
                {time.map((item: any) => {
                  return (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label + " Min"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Typography variant="h4">:</Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-error-label">
                Second
              </InputLabel>
              <Select
                labelId="demo-simple-select-error-label"
                id="demo-simple-select-error"
                value={sec}
                label="Second"
                MenuProps={MenuProps}
                onChange={(e) => setSec(Number(e.target.value))}
                renderValue={(value) => sec + " Sec" || value}
                size="small"
              >
                {time.map((item: any) => {
                  return (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label + " Sec"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
          <Typography m={2}>Total Seconds : {min * 60 + sec}</Typography>
        </FormProvider>
        <Stack width={"fit-content"} m={1}>
          <Button variant="contained" onClick={setLimit}>
            Set Limit
          </Button>
        </Stack>
      </Stack>

      <Stack m={2}>
        <Typography variant="h4">
          Duplicate Transaction Time Limit for Partner
        </Typography>
        <FormProvider methods={methods}>
          <Stack flexDirection={"row"} gap={1} alignItems={"center"} mt={3}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-error-label">
                Minute
              </InputLabel>
              <Select
                labelId="demo-simple-select-error-label"
                id="demo-simple-select-error"
                value={pmin}
                label="Minute"
                MenuProps={MenuProps}
                onChange={(e) => setPmin(Number(e.target.value))}
                renderValue={(value) => pmin + " Min" || value}
                size="small"
              >
                {time.map((item: any) => {
                  return (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label + " Min"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Typography variant="h4">:</Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-error-label">
                Second
              </InputLabel>
              <Select
                labelId="demo-simple-select-error-label"
                id="demo-simple-select-error"
                value={sec}
                label="Second"
                MenuProps={MenuProps}
                onChange={(e) => setPsec(Number(e.target.value))}
                renderValue={(value) => psec + " Sec" || value}
                size="small"
              >
                {time.map((item: any) => {
                  return (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label + " Sec"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
          <Typography m={2}>Total Seconds : {pmin * 60 + psec}</Typography>
        </FormProvider>
        <Stack width={"fit-content"} m={1}>
          <Button variant="contained" onClick={setLimitp}>
            Set Limit
          </Button>
        </Stack>
      </Stack>
    </>
  );
}
