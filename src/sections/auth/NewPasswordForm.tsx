import { useState } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  FormHelperText,
  Typography,
  Link,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// routes
import { PATH_DASHBOARD } from "../../routes/paths";
// components
import Iconify from "../../components/iconify";
import { useSnackbar } from "../../components/snackbar";
import FormProvider, {
  RHFTextField,
  RHFCodes,
} from "../../components/hook-form";

import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type FormValuesProps = {
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
  code6: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function NewPasswordForm() {
  const { Api } = useAuthContext();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const [mess, setMess] = useState("Enter your OTP");

  const [showPassword, setShowPassword] = useState(false);

  const emailRecovery =
    typeof window !== "undefined"
      ? sessionStorage.getItem("email-recovery")
      : "";

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required("Code is required"),
    code2: Yup.string().required("Code is required"),
    code3: Yup.string().required("Code is required"),
    code4: Yup.string().required("Code is required"),
    code5: Yup.string().required("Code is required"),
    code6: Yup.string().required("Code is required"),
    email: Yup.string()
      .email("Email must be a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  });

  const defaultValues = {
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
    code6: "",
    email: emailRecovery || "",
    password: "",
    confirmPassword: "",
  };

  const methods = useForm({
    mode: "onChange",
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const resendOtp = async () => {
    try {
      const body = {
        email: sessionStorage.getItem("email-recovery"),
      };
      await Api(`admin/admin_forgotPassword`, "POST", body, "").then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              localStorage.setItem("user", Response.data.data.user);
              enqueueSnackbar(Response.data.message);
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const body = {
        userId: localStorage.getItem("user"),
        otp:
          data.code1 +
          data.code2 +
          data.code3 +
          data.code4 +
          data.code5 +
          data.code6,
        password: data.password,
      };
      await fetchLocation();
      await Api(`admin/adminOtpVerifyAndResetPassword`, "POST", body, "").then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              setMess(Response.data.responseMessage);
              sessionStorage.removeItem("email-recovery");
              enqueueSnackbar("Change password success!");
              navigate(PATH_DASHBOARD.root);
            } else {
              setMess(Response.data.responseMessage);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>{mess}</strong>
      </Alert>
      <Stack spacing={3}>
        <RHFTextField
          name="email"
          label="Email"
          disabled={!!emailRecovery}
          InputLabelProps={{ shrink: true }}
        />

        <RHFCodes
          keyName="code"
          inputs={["code1", "code2", "code3", "code4", "code5", "code6"]}
        />

        {(!!errors.code1 ||
          !!errors.code2 ||
          !!errors.code3 ||
          !!errors.code4 ||
          !!errors.code5 ||
          !!errors.code6) && (
          <FormHelperText error sx={{ px: 2 }}>
            Code is required
          </FormHelperText>
        )}

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Confirm New Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Update Password
        </LoadingButton>
        <Typography variant="body2" sx={{ my: 3 }}>
          Don’t have a code? &nbsp;
          <Link variant="subtitle2" onClick={resendOtp}>
            Resend code
          </Link>
        </Typography>
      </Stack>
    </FormProvider>
  );
}
