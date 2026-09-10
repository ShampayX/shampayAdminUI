import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
// @mui
import {
  Stack,
  Grid,
  TextField,
  Button,
  Pagination,
  MenuItem,
} from "@mui/material";

import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import FormProvider, { RHFSelect } from "../../../components/hook-form";

import { useSnackbar } from "notistack";
import VendorMoneyTransferTable from "./VendorDmtDataTable";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

export default function VendorDmtData() {
  const { Api } = useAuthContext();
  const refElem = useRef<any>(null);
  const FilterSchema = Yup.object().shape({});
  type FormValuesProps = {
    vendorName: string;
    _id: string;
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  const { enqueueSnackbar } = useSnackbar();

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [slot, setSlot] = useState([]);
  const [PayoutData, setPayoutData] = useState([]);

  useEffect(() => {
    ShowSlots();
  }, []);

  const ShowSlots = () => {
    let token = localStorage.getItem("token");
    Api(`vendor/dmtSlot`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        // enqueueSnackbar(Response.data.message);
        setPayoutData(Response.data.data[0].slots);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const onSubmit = () => {
    let token = localStorage.getItem("token");
    let body = {
      slots: slot,
    };
    Api(
      `${PayoutData.length ? "vendor/edit_dmt_slot" : "vendor/dmtSlot"} `,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        setSlot([]);
        setMinAmount("");
        setMaxAmount("");
        ShowSlots();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  function handleToAdd() {
    let Arr: any = slot;
    Arr.push({ minSlab: minAmount, maxSlab: maxAmount });
    setSlot(Arr);
    setMinAmount("");
    setMaxAmount("");
  }

  return (
    <>
      <Helmet>
        <title> Vendor Money Transfer Data | Shampay Admin</title>
      </Helmet>
      <Box sx={{ mx: 2 }}>
        <Typography variant="h3" my={2}>
          Dmt1 Slots
        </Typography>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 0.5fr)",
                md: "repeat(1, 0.3fr)",
              }}
            >
              {slot.length != 0 ? (
                <Box>
                  <Stack
                    flexDirection={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    sx={{ borderBottom: "1px solid #dadada", my: 1 }}
                  >
                    <Typography variant="h5" textAlign={"start"}>
                      Slot
                    </Typography>
                    <Typography variant="h5" textAlign={"start"}>
                      Min. AMount
                    </Typography>
                    <Typography variant="h5" textAlign={"start"}>
                      Max. Amount
                    </Typography>
                  </Stack>
                  {slot.map((item: any, index: number) => {
                    return (
                      <Stack
                        key={item}
                        flexDirection={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                      >
                        <Typography textAlign={"start"}>
                          Slot {index + 1}
                        </Typography>
                        <Typography textAlign={"start"}>
                          {item.minSlab}
                        </Typography>
                        <Typography textAlign={"start"}>
                          {item.maxSlab}
                        </Typography>
                      </Stack>
                    );
                  })}
                  <Stack
                    my={2}
                    flexDirection={"row"}
                    gap={1}
                    sx={{ justifyContent: "end" }}
                  >
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Upload Slots
                    </Button>
                  </Stack>
                </Box>
              ) : null}

              <Stack
                flexDirection={"row"}
                gap={1}
                alignItems={"center"}
                ref={refElem}
              >
                <TextField
                  id="outlined-basic"
                  label="Min. Amount"
                  variant="outlined"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  size="small"
                />
                <TextField
                  id="outlined-basic"
                  label="Max. Amount"
                  variant="outlined"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  size="small"
                />

                <Button
                  variant="contained"
                  onClick={handleToAdd}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Add Slot
                </Button>
              </Stack>
            </Grid>
          </Box>
        </FormProvider>
        <Grid xs={12} md={6} lg={8} mt={2}>
          <VendorMoneyTransferTable
            tableData={PayoutData}
            tableLabels={[
              { id: "id", label: "Slot" },
              { id: "minamount", label: "Min Amount" },
              { id: "maxamount", label: "Max Amount" },
            ]}
          />
        </Grid>
      </Box>
      {/* <Pagination
        sx={{ display: 'flex', justifyContent: 'center' }}
        // count={pageSize}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
      /> */}
    </>
  );
}
