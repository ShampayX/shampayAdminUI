import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
// @mui
import { Stack, Grid, Button, MenuItem, Checkbox } from "@mui/material";
import { Helmet } from "react-helmet-async";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Box, TableRow, Typography } from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "src/components/snackbar";
import { isOk, notifyFailure } from "src/utils/apiResult";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  MDBankAccount: string;
  DBankAccount: string;
  ABankAccount: string;
};
const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function AccountLimit() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [MDlimit, setMDlimit] = useState("");
  const [Dlimit, setDlimit] = useState("");
  const [Alimit, setAlimit] = useState("");
  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    MDBankAccount: "",
    DBankAccount: "",
    ABankAccount: "",
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
    getLimit();
  }, []);

  const setLimit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      email: "admin@asmforex.in",
      setting: [
        { role: "master", limit: MDlimit },
        { role: "distributor", limit: Dlimit },
        { role: "agent", limit: Alimit },
      ],
    };

    Api(`admin/setLimit`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getLimit = () => {
    let token = localStorage.getItem("token");
    let body = {
      email: "admin@asmforex.in",
    };
    Api(`admin/getLimit`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        Response.data.data[0].setting.map((item: any) => {
          if (item.role == "master") {
            setMDlimit(item.limit);
          }
          if (item.role == "distributor") {
            setDlimit(item.limit);
          }
          if (item.role == "agent") {
            setAlimit(item.limit);
          }
        });
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>View Update Bank Detail | Shampay Admin</title>
      </Helmet>
      <Box sx={{ m: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(setLimit)}>
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <Grid>
              <Typography fontSize={24} my={3}>
                Limit Accounts for Users
              </Typography>
              <Stack
                flexDirection={"row"}
                justifyContent="space-between"
                sx={{ my: 1 }}
              >
                <Typography sx={{ fontSize: "70%" }}>
                  Master Distributor can add maximum
                </Typography>
                <Typography sx={{ fontSize: "70%" }}>Limit : 1</Typography>
              </Stack>
              <RHFSelect
                name="MDBankAccount"
                label="Select Account"
                placeholder="Select Account"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize", mb: 3 },
                }}
                value={MDlimit}
                onChange={(e) => setMDlimit(e.target.value)}
                size="small"
              >
                <MenuItem value="3">3 Bank Account</MenuItem>
                <MenuItem value="2">2 Bank Account</MenuItem>
                <MenuItem value="1">1 Bank Account</MenuItem>
              </RHFSelect>
              <Stack
                flexDirection={"row"}
                justifyContent="space-between"
                sx={{ my: 1 }}
              >
                <Typography sx={{ fontSize: "70%" }}>
                  Distributor can add maximum
                </Typography>
                <Typography sx={{ fontSize: "70%" }}>Limit : 1</Typography>
              </Stack>
              <RHFSelect
                name="DBankAccount"
                label="Select Account"
                placeholder="Select Account"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize", mb: 3 },
                }}
                value={Dlimit}
                onChange={(e) => setDlimit(e.target.value)}
                size="small"
              >
                <MenuItem value="2">2 Bank Account</MenuItem>
                <MenuItem value="1">1 Bank Account</MenuItem>
              </RHFSelect>
              <Stack
                flexDirection={"row"}
                justifyContent="space-between"
                sx={{ my: 1 }}
              >
                <Typography sx={{ fontSize: "70%" }}>
                  Agent can add maximum
                </Typography>
                <Typography sx={{ fontSize: "70%" }}>Limit : 1</Typography>
              </Stack>
              <RHFSelect
                name="ABankAccount"
                label="Select Account"
                placeholder="Select Account"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize", mb: 3 },
                }}
                value={Alimit}
                onChange={(e) => setAlimit(e.target.value)}
                size="small"
              >
                <MenuItem value="1">1 Bank Account</MenuItem>
              </RHFSelect>
            </Grid>
          </Grid>
          <TableRow>
            <Checkbox {...label} defaultChecked style={{ color: "#EE8022" }} />
            NEFT
            <Checkbox {...label} defaultChecked style={{ color: "#EE8022" }} />
            RTGS
            <Checkbox {...label} defaultChecked style={{ color: "#EE8022" }} />
            IMPS
          </TableRow>
          <Button size="small" type="submit" variant="contained" sx={{ mt: 1 }}>
            update Limits
          </Button>
        </FormProvider>
      </Box>
    </>
  );
}
