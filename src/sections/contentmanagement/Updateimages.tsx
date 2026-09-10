import React, { useEffect, useState, useCallback } from "react";
import {
  Stack,
  Grid,
  Button,
  MenuItem,
  styled,
  SwitchProps,
  Checkbox,
  Switch,
  Box,
  Card,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TableRow, Typography } from "@mui/material";
import FormProvider, { RHFSelect } from "src/components/hook-form";
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

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 62,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(32px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default function Updateimages() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [value, setValue] = React.useState("one");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const [currentTab, setCurrentTab] = useState("active");
  const [active, setActive] = useState(true);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  const category = [
    { _id: 1, status: "active", name: "Active Bank Accounts" },
    { _id: 2, status: "disable", name: "Disabled Bank Accounts" },
  ];

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    getBank();
  }, []);

  const addBank = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      email: "admin@shampay.pro",
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

  const getBank = () => {
    let token = localStorage.getItem("token");
    let body = {
      email: "admin@shampay.pro",
    };
    Api(`admin/getLimit`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        Response.data.data[0]?.setting?.map((item: any) => {
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
        <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(addBank)}>
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
              <Checkbox {...label} defaultChecked color="success" />
              NEFT
              <Checkbox {...label} defaultChecked color="success" />
              RTGS
              <Checkbox {...label} defaultChecked color="success" />
              IMPS
            </TableRow>
            <Button
              size="small"
              type="submit"
              variant="contained"
              sx={{ mt: 1 }}
            >
              update Limits
            </Button>
          </FormProvider>
        </Card>
      </Box>
    </>
  );
}
