import { useEffect, useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Link,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Typography,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// auth
import { useAuthContext } from "../../auth/useAuthContext";
// components
import Iconify from "../../components/iconify";
import FormProvider, { RHFTextField } from "../../components/hook-form";

import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { PATH_AUTH } from "src/routes/paths";
import { requestPermission } from "./firebase";
import { fetchLocation } from "src/utils/fetchLocation";
import { MenuItem } from "@mui/material";
import { Select } from "@mui/material";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  afterSubmit?: string;
};

export default function AuthLoginForm() {
  const { Api } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email must be a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const defaultValues = {
    email: "",
    password: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    fetchLocation();
    requestPermission();
  }, []);
  const onSubmit = async (data: FormValuesProps) => {
    if (!role) {
      enqueueSnackbar("Please select a role", { variant: "warning" });
      return;
    }

    try {
      // ─── Admin Role ───────────────────────────────────────────────────────────
      if (role === "admin") {
        const body = {
          email: data.email,
          password: data.password,
        };

        await Api(`login-admin-user`, "POST", body, "").then(
          (Response: any) => {
            if (Response?.status == 200) {
              if (Response.data.code == 200) {
                const token = Response.data.token;
                const user = Response.data.user;
                const modules = Response.data.modules;

                Api("admin/adminDetails", "GET", "", token).then(
                  (resp: any) => {
                    if (resp?.status == 200) {
                      if (resp?.data?.code == 200) {
                        localStorage.setItem("adminToken", token);
                        localStorage.setItem(
                          "adminModules",
                          JSON.stringify(modules)
                        );
                        localStorage.setItem(
                          "adminUserData",
                          JSON.stringify(Response.data)
                        );
                        localStorage.setItem("role", "admin");
                      }
                    }

                    login(token, resp.data.data);

                    //     localStorage.setItem("adminToken", token);
                    //     localStorage.setItem(
                    //       "adminModules",
                    //       JSON.stringify(modules)
                    //     );
                    //     localStorage.setItem(
                    //       "adminUserData",
                    //       JSON.stringify(Response.data)
                    //     );
                    //     localStorage.setItem("role", "admin");
                    //   }
                    // }
                  }
                );
                enqueueSnackbar(Response.data.message);
              } else {
                enqueueSnackbar(Response.data.message, { variant: "warning" });
              }
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
            }
          }
        );

        return;
      }

      // ─── Super Admin Role ─────────────────────────────────────────────────────
      const body = {
        password: data.password,
        email: data.email,
        FCM_Token: sessionStorage.getItem("fcm"),
      };

      await Api(`admin/admin_login`, "POST", body, "").then((Response: any) => {
        if (isOk(Response)) {
          Api("admin/adminDetails", "GET", "", Response.data.data.token).then(
            (resp: any) => {
              if (resp?.status == 200) {
                if (resp?.data?.code == 200) {
                  const { token, user, modules } = Response.data;

                  localStorage.setItem("adminToken", token);
                  localStorage.setItem("adminModules", JSON.stringify(modules));
                  localStorage.setItem(
                    "adminUserData",
                    JSON.stringify(Response.data)
                  );
                  localStorage.setItem("role", "Super_Admin");

                  login(Response.data.data.token, resp.data.data);

                  // const { token, user, modules } = Response.data;
                  // localStorage.setItem("adminToken", token);
                  // localStorage.setItem(
                  //   "adminModules",
                  //   JSON.stringify(modules)
                  // );
                  // localStorage.setItem(
                  //   "adminUserData",
                  //   JSON.stringify(Response.data)
                  // );
                  // localStorage.setItem("role", "Super_Admin");
                }
              }
            }
          );
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      });
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {/* {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>} */}
        <Box>
          <Typography
            sx={{
              fontWeight: 400,
              color: "#2B2F38",
              fontSize: 14,
              lineHeight: 1.25,
              marginBottom: 0.5,
            }}
          >
            Email
          </Typography>
          <RHFTextField name="email" placeholder="Enter your email address" />
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 400,
              color: "#2B2F38",
              fontSize: 14,
              lineHeight: 1.25,
              marginBottom: 0.5,
            }}
          >
            Password
          </Typography>
          <RHFTextField
            name="password"
            placeholder="Enter your password"
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
        </Box>
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography>Select Role</Typography>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select Role</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="superadmin">Super Admin</MenuItem>
        </Select>
      </Box>
      <Stack alignItems="flex-end" sx={{ my: 2 }}>
        <Link
          color="#005BFF"
          variant="body1"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(PATH_AUTH.resetpassword)}
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          mt: 2,
          bgcolor: "#1E1E1E",
          color: (theme) =>
            theme.palette.mode == "light" ? "common.white" : "grey.800",
          "&:hover": {
            bgcolor: "text.primary",
            color: (theme) =>
              theme.palette.mode == "light" ? "common.white" : "grey.800",
          },
        }}
      >
        Login
      </LoadingButton>
    </FormProvider>
  );
}
