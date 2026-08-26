import { Helmet } from "react-helmet-async";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import * as Yup from "yup";
import {
  Stack,
  MenuItem,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
} from "@mui/material";
import FormProvider from "src/components/hook-form/FormProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import AWS from "aws-sdk";
import Transactions from "./Transactions";
import TransactionsCSV from "./TransactionsCsv";
import GstTds from "./GstTds";
import TdsGstReport from "./TdsGstReport";
import WalletLadgertxt from "./WalletLadgertxt";

export default function AccountStatement() {
  const { Api } = useAuthContext();
  const [userList, setUserList] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const accountValidate = Yup.object().shape({
    // searchBy: Yup.string().required("Search By is required"),
    // usersearchby: Yup.string().when("searchBy", {
    //   is: (val: string) => val && val.length > 0,
    //   then: Yup.string().required("User Search By is required"),
    // }),
    // User: Yup.string().required("User is required"),
    selectedDate: Yup.date().nullable().required("selected Date is required"),
    // endDate: Yup.date().nullable().required("End Date is required"),
  });

  type FormValuesProps = {
    searchBy: string;
    usersearchby: string;
    User: string;
    agent: string;
    distributor: string;
    m_distributor: string;
    Admin: string;
    selectedDate: Date | null;
  };

  const defaultValues = {
    searchBy: "",
    usersearchby: "",
    User: "",
    agent: "",
    distributor: "",
    m_distributor: "",
    Admin: "",
    selectedDate: null,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (getValues("User")?.length > 2) searchFromUser(getValues("User"));
  }, [watch("User")]);

  const searchFromUser = (val: string) => {
    const body = {
      searchBy: watch("usersearchby"),
      role: getValues("searchBy"),
      searchInput: val,
    };

    Api(`admin/search_user`, "POST", body).then((Response: any) => {
      if (Response?.status === 200 && Response.data.code === 200) {
        setUserList(Response.data.data);
      } else {
        setUserList([]);
      }
    });
  };

  const Downloaddata = (data: FormValuesProps) => {
    const from_date = dayjs(data.selectedDate).format("DD/MM/YYYY");
    const to_date = dayjs(data.selectedDate).format("DD/MM/YYYY");
    window.open(
      `${process.env.REACT_APP_BASE_URL}adminTransaction/downloadMasterTransactionReportExcel?from_date=${from_date}&to_date=${to_date}`
    );
  };

  return (
    <>
      <Helmet>
        <title> Quick Downloads | Shampay Admin </title>
      </Helmet>
      <Card>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Stack sx={{ maxWidth: "30%", p: 2 }}>
            <Stack alignItems={"center"} mt={1}>
              <Typography variant="h6">
                All Transactions Report Export In Excel
              </Typography>
            </Stack>
            <CardContent>
              <FormProvider
                methods={methods}
                onSubmit={handleSubmit(Downloaddata)}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select Date"
                        inputFormat="YYYY/MM/DD"
                        value={watch("selectedDate")}
                        maxDate={new Date()}
                        onChange={(newValue: any) =>
                          setValue("selectedDate", newValue)
                        }
                        renderInput={(params: any) => (
                          <TextField {...params} size={"small"} fullWidth />
                        )}
                      />
                    </LocalizationProvider>
                  </Stack>
                  <Stack flexDirection="row" gap={2}>
                    <LoadingButton
                      variant="contained"
                      onClick={() => {
                        reset(defaultValues);
                      }}
                    >
                      Clear
                    </LoadingButton>
                    <LoadingButton
                      variant="contained"
                      type="submit"
                      loading={isSubmitting}
                    >
                      Download
                    </LoadingButton>
                  </Stack>
                </Stack>
              </FormProvider>
            </CardContent>
          </Stack>
          <Grid>
            <TransactionsCSV />
          </Grid>
          <Grid>
            <Transactions />
          </Grid>
        </Stack>
        <Stack flexDirection={"row"} mt={2} justifyContent={"space-between"}>
          <GstTds />
          <TdsGstReport />

          <WalletLadgertxt />
        </Stack>
        {/* <Stack flexDirection={"row"} mt={2} gap={15}>
          <FundRequestTxt />
          <FundFlowTxt />
        </Stack> */}
      </Card>
    </>
  );
}
