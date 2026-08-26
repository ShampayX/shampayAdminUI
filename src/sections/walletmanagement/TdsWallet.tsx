import React from "react";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import {
  Card,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";

function MainWallet() {
  type FormValuesProps = {
    ShopName: string;
    TransactionType: string;
    endDate: Date | null;
    startDate: Date | null;
  };

  const NewUserSchema = Yup.object().shape({
    ShopName: Yup.string().required("ShopName is required"),
  });

  const defaultValues = {
    startDate: null,
    endDate: null,
    ShopName: "",
    TransactionType: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <>
      <FormProvider methods={methods}>
        <Helmet>
          <title>TDS Wallet | Shampay Admin</title>
        </Helmet>
        <Grid>
          <Card sx={{ width: "60%"}}>
            <Stack padding={2}>
              <Typography variant="h5" padding={2}>
                TDS Wallet
              </Typography>
              <Stack flexDirection={"row"} gap={8} mt={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start date"
                    inputFormat="DD/MM/YYYY"
                    value={watch("startDate")}
                    maxDate={new Date()}
                    onChange={(newValue: any) =>
                      setValue("startDate", newValue)
                    }
                    renderInput={(params: any) => (
                      <TextField {...params} size={"small"} fullWidth />
                    )}
                  />
                  <DatePicker
                    label="End date"
                    inputFormat="DD/MM/YYYY"
                    value={watch("endDate")}
                    minDate={watch("startDate")}
                    maxDate={new Date()}
                    onChange={(newValue: any) => setValue("endDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField {...params} size={"small"} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Stack>
              <Stack flexDirection={"row"} gap={8} mt={2}>
              <RHFTextField
                  name="Amount"
                  label="amount"
                />
                <RHFSelect
                  name="Type"
                  label="Type"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem value="Type1">Type1</MenuItem>
                  <MenuItem value="Type2">Type2</MenuItem>
                  <MenuItem value="Type3">Type3</MenuItem>
                </RHFSelect>
              </Stack>
              <Stack flexDirection={"row"} gap={8} mt={3}>
                <RHFTextField
                  name="BankName"
                  label="BankName"
                />
                <RHFTextField
                  name="UTRNumber"
                  label="UTR Number"
                />
              </Stack>
              <Stack flexDirection={"row"} gap={8} mt={3}>
                <RHFTextField
                  name="MobileNumber"
                  label="Mobile Number"
                  sx={{width:"450px"}}
                />
              </Stack>
              <LoadingButton variant="contained" sx={{mt:3 , width:"70px"}}>
                Submit
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </FormProvider>
    </>
  );
}

export default MainWallet;
