import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
// form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
// @mui
import { LoadingButton } from "@mui/lab";
// routes
import { PATH_AUTH } from "../../routes/paths";
// components
import FormProvider, { RHFTextField } from "../../components/hook-form";

import { useSnackbar } from "notistack";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
};

export default function ResetPasswordForm() {
  const { Api } = useAuthContext();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email must be a valid email address")
      .required("Email is required"),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ResetPasswordSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    localStorage.setItem("email", data.email);
    try {
      const body = {
        email: data.email,
      };
      await fetchLocation();
      await Api(`admin/admin_forgotPassword`, "POST", body, "").then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              sessionStorage.setItem("email-recovery", data.email);
              localStorage.setItem("user", Response.data.data.user);
              enqueueSnackbar(Response.data.message);
              navigate(PATH_AUTH.newpassword);
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <RHFTextField name="email" label="Email address" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ mt: 3 }}
      >
        Send Request
      </LoadingButton>
    </FormProvider>
  );
}
