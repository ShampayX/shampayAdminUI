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
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";
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
      // Item 3d: the route is `admin-forgot-password`, beside the login route -
      // NOT under `/admin`, which sits behind the admin-only guard. An admin who
      // has forgotten their password has no session to present, so the old path
      // could never have worked.
      await Api(`admin-forgot-password`, "POST", body, "").then(
        (Response: any) => {
          if (isOk(Response)) {
            sessionStorage.setItem("email-recovery", data.email);
            // The reply is deliberately identical whether or not the address
            // belongs to an admin - a different answer would let anyone
            // enumerate admin accounts. So show it verbatim rather than
            // claiming "OTP sent", which would be a claim we cannot make.
            notifyOk(enqueueSnackbar, Response);
            navigate(PATH_AUTH.newpassword);
          } else {
            notifyFailure(enqueueSnackbar, Response);
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
