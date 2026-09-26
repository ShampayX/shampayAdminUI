import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { Fragment, useEffect, useState } from "react";
// @mui
import { Stack, Grid, Button } from "@mui/material";
import * as Yup from "yup";
// form
import { useFieldArray, useForm } from "react-hook-form";
import FormProvider, { RHFTextField } from "../../../components/hook-form";

import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";
import { TableHeadCustom } from "src/components/table";
import { fDateTime } from "src/utils/formatTime";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// import VendorMoneyTransferTable from './VendorMoneyTransferDataTable';

// ----------------------------------------------------------------------
type FormValuesProps = {
  slabs: { minSlab: number; maxSlab: number }[];
  _id: string;
};

export default function BBPS() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [bbpsSlot, setBBPSslot] = useState([]);

  const FilterSchema = Yup.object().shape({});
  const methods = useForm<FormValuesProps>({
    // resolver: yupResolver(FilterSchema),
  });
  const defaultValues = {
    slabs: [],
  };
  const {
    control,
    reset,
    watch,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append, remove }: any = useFieldArray({
    name: "slabs",
    control,
  });

  useEffect(() => {
    getBBPSslots();
  }, []);

  const getBBPSslots = () => {
    let token = localStorage.getItem("token");
    Api(`vendor/show_bbps_slots`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setBBPSslot(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        bbpsSlotData: data.slabs,
      };
      Api(
        `${
          bbpsSlot.length ? "vendor/edit_bbps_slot" : "vendor/add_bbps_slot"
        } `,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (isOk(Response)) {
          reset(defaultValues);
          setBBPSslot(Response.data.data);
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const setMode = () => {
    append({
      minSlab: "",
      maxSlab: "",
    });
  };

  return (
    <>
      <Helmet>
        <title> Vendor Money Transfer Data | Shampay Admin</title>
      </Helmet>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            sm: "repeat(1, 0.5fr)",
          }}
          mt={1}
        >
          {watch("slabs")?.length > 0 && (
            <Fragment>
              <Stack
                flexDirection={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
                sx={{ borderBottom: "1px solid #dadada" }}
              >
                <Typography variant="subtitle1" textAlign={"start"}>
                  Min. Slab
                </Typography>
                <Typography variant="subtitle1" textAlign={"start"}>
                  Max. Slab
                </Typography>
                <Typography variant="subtitle1" textAlign={"start"}>
                  Delete
                </Typography>
              </Stack>
              {fields.map((field: any, index: any) => (
                <Stack
                  flexDirection={"row"}
                  gap={1}
                  alignItems={"center"}
                  key={field.id}
                >
                  <RHFTextField
                    name={`slabs.${index}.minSlab`}
                    id="outlined-basic"
                    label="Min. Amount"
                    variant="outlined"
                    size="small"
                  />
                  <RHFTextField
                    name={`slabs.${index}.maxSlab`}
                    id="outlined-basic"
                    label="Max. Amount"
                    variant="outlined"
                    size="small"
                  />
                  <DeleteIcon
                    color={"primary"}
                    onClick={() => remove(index)}
                    sx={{ cursor: "pointer", mx: 2 }}
                  />
                </Stack>
              ))}
            </Fragment>
          )}
          <Button
            variant="contained"
            onClick={setMode}
            sx={{ width: "fit-content" }}
          >
            Add New Slots
          </Button>
          {watch("slabs")?.length > 0 && (
            <Stack flexDirection={"row"} gap={1} sx={{ justifyContent: "end" }}>
              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
                sx={{ whiteSpace: "nowrap" }}
              >
                Upload Slots
              </LoadingButton>
            </Stack>
          )}
        </Grid>
      </FormProvider>
      <TableContainer sx={{ overflow: "unset", mt: 1 }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom
            headLabel={[
              { id: 1, label: "Created At" },
              { id: 2, label: "Min Slab" },
              { id: 3, label: "Max Slab" },
            ]}
          />
          <TableBody sx={{ overflow: "auto" }}>
            {bbpsSlot.map((row: any) => (
              <SlotsRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function SlotsRow({ row }: any) {
  return (
    <TableRow>
      <TableCell>{fDateTime(row.createdAt)}</TableCell>
      <TableCell>{row.minSlab}</TableCell>
      <TableCell>{row.maxSlab}</TableCell>
    </TableRow>
  );
}
