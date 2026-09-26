import { useEffect, useState, useCallback } from "react";
import {
  PageHeader,
  PageActionButton,
  FormCard,
} from "src/components/page-kit";
import { Navigate, useNavigate, useParams } from "react-router-dom";
// @mui
import {
  Stack,
  Box,
  TextField,
  Button,
  Paper,
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

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------

type FormValuesProps = {
  _id: string;
};
export default function Other() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [product, setProduct] = useState({ maxMoneyTransferLimit: 0, _id: "" });
  const [Limit, setLimit] = useState<any>(0);
  const [UpiLimit, SetUpiLimit] = useState<any>(0);
  const [vpaCharge, setVpaCharge] = useState("");
  const [vpaLimit, setVpaLimit] = useState("");
  const [GSTAttempt, setGSTAttempt] = useState(0);
  const [GSTUpdate, setGSTUpdate] = useState<any>(0);
  const [PANAttempt, setPANAttempt] = useState(0);
  const [PANUpdate, setPANUpdate] = useState<any>(0);

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
    getProductFilter();
    CollectVPACharge();
  }, []);

  const getProductFilter = () => {
    let body = {
      category: "6475b558ca22e107b9939c50",
      subcategory: "",
      productFor: "",
    };
    Api("product/product_Filter", "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        let filter = Response.data.data.filter((item: any) => {
          return item.productName == "Money Transfer";
        });
        setProduct(filter[0]);
        setLimit(filter[0].maxMoneyTransferLimit / 25000);
        SetUpiLimit(filter[0].maxUpiTransferLimit / 25000);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  ///////

  const CollectVPACharge = () => {
    let token = localStorage.getItem("token");
    Api(`admin/adminDetails`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setVpaCharge(Response.data.data.vpaCharge);
        setGSTAttempt(Response.data.data.GST_Attempt);
        setPANAttempt(Response.data.data.PAN_Attempt);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const sendLimit = () => {
    let token = localStorage.getItem("token");
    let body = {
      productId: product._id,
      limit: Limit.toString(),
    };
    Api(`product/setMoneyTransferMaxTxnLimit`, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const sendUpiLimit = () => {
    let token = localStorage.getItem("token");
    let body = {
      productId: product._id,
      limit: UpiLimit.toString(),
    };
    Api(`product/setMoneyTransferUpiMaxTxnLimit`, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };
  ///////

  const setAutoCollectVPA = () => {
    let token = localStorage.getItem("token");
    let vpalimitNum = parseInt(vpaLimit);
    let body = {
      vpaCharge: vpalimitNum,
    };
    Api(`admin/setVPACharge`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setVpaCharge(vpaLimit);
        enqueueSnackbar(Response.data.message);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const setGSAttempts = () => {
    let token = localStorage.getItem("token");

    let body = {
      GST_Attempt: GSTUpdate,
      PAN_Attempt: PANUpdate,
    };

    Api(`admin/set_KYC_attempt`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setGSTAttempt(GSTUpdate);
        setPANAttempt(PANUpdate);
        enqueueSnackbar(Response.data.message);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const LIMIT_MULTIPLIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      <Helmet>
        <title>Platform Limits | Shampay Admin</title>
      </Helmet>

      <PageHeader
        title="Platform Limits"
        subtitle="Transfer ceilings, collection charges and verification attempt caps."
      />

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        }}
      >
        {/* ---- money transfer ---- */}
        <FormCard
          title="Money Transfer Maximum Limit"
          subtitle="Multiplier applied to the base sender monthly limit."
        >
          <FormProvider methods={methods}>
            <Stack direction="row" gap={2} alignItems="center">
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="mt-limit-label">Limit Multiplier</InputLabel>
                <Select
                  labelId="mt-limit-label"
                  defaultValue={Limit}
                  value={Limit}
                  label="Limit Multiplier"
                  size="small"
                  onChange={(e) => setLimit(Number(e.target.value))}
                  renderValue={(value) => Limit || value}
                >
                  {LIMIT_MULTIPLIERS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                × 25,000 =
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {Limit ? (Limit * 25000).toLocaleString("en-IN") : "-"}
              </Typography>
            </Stack>
          </FormProvider>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <PageActionButton onClick={sendLimit}>
              Update Limit
            </PageActionButton>
          </Stack>
        </FormCard>

        {/* ---- UPI ---- */}
        <FormCard
          title="UPI Maximum Limit"
          subtitle="Multiplier applied to the base sender monthly UPI limit."
        >
          <FormProvider methods={methods}>
            <Stack direction="row" gap={2} alignItems="center">
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="upi-limit-label">Limit Multiplier</InputLabel>
                <Select
                  labelId="upi-limit-label"
                  defaultValue={UpiLimit}
                  value={UpiLimit}
                  label="Limit Multiplier"
                  size="small"
                  onChange={(e) => SetUpiLimit(Number(e.target.value))}
                  renderValue={(value) => UpiLimit || value}
                >
                  {LIMIT_MULTIPLIERS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                × 25,000 =
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {UpiLimit ? (UpiLimit * 25000).toLocaleString("en-IN") : "-"}
              </Typography>
            </Stack>
          </FormProvider>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <PageActionButton onClick={sendUpiLimit}>
              Update Limit
            </PageActionButton>
          </Stack>
        </FormCard>

        {/* ---- VPA charge ---- */}
        <FormCard
          title="Razorpay Auto Collect VPA Charge"
          subtitle={`Deposits under INR 10,000 via VPA (QR / UPI). Current charge incl. GST: ${vpaCharge}`}
        >
          <FormProvider methods={methods}>
            <TextField
              type="text"
              size="small"
              label="Update charge"
              fullWidth
              onChange={(event) => setVpaLimit(event.target.value)}
            />
          </FormProvider>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <PageActionButton onClick={setAutoCollectVPA}>
              Update Charge
            </PageActionButton>
          </Stack>
        </FormCard>

        {/* ---- GST / PAN attempts ---- */}
        <FormCard
          title="GST & PAN Verification API Limits"
          subtitle={`Onboarding attempt caps. Current: GST ${GSTAttempt}, PAN ${PANAttempt}`}
        >
          <FormProvider methods={methods}>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              <TextField
                type="text"
                size="small"
                label="GST limit"
                fullWidth
                onChange={(event) => setGSTUpdate(event.target.value)}
              />
              <TextField
                type="text"
                size="small"
                label="PAN limit"
                fullWidth
                onChange={(event) => setPANUpdate(event.target.value)}
              />
            </Stack>
          </FormProvider>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <PageActionButton onClick={setGSAttempts}>
              Update Limits
            </PageActionButton>
          </Stack>
        </FormCard>
      </Box>
    </>
  );
}
