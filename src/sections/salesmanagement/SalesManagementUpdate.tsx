// @mui
import { Box, Stack, Button, MenuItem } from "@mui/material";
// components
import { useSnackbar } from "../../components/snackbar";

import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type RowProps = {
  rowData: any;
  parentFunction: any;
};

export default function SalesManagementUpdate(props: RowProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [degignation, setDegignation] = useState([]);
  const [open, setModalEdit] = React.useState(false);
  const openEditModal = (val: any) => {
    setModalEdit(true);
  };
  const handleClose = () => setModalEdit(false);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  type FormValuesProps = {
    fname: string;
    lname: string;
    contact: string;
    email: string;
    empcode: string;
    designation: string;
    district: string;
    state: string;
    _id: string;
  };

  const accountValidate = Yup.object().shape({});
  const defaultValues = {
    fname: props.rowData ? props.rowData.firstName : "",
    lname: props.rowData ? props.rowData.lastName : "",
    contact: props.rowData ? props.rowData.contact_no : "",
    email: props.rowData ? props.rowData.email_Id : "",
    empcode: props.rowData ? props.rowData.empCode : "",
    designation: props.rowData ? props.rowData.designation : "",
    district: props.rowData ? props.rowData.district : "",
    state: props.rowData ? props.rowData.state : "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    listDesignation();
  }, [props]);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    // border: '4px solid #00AB55',
    borderRadius: 5,
    boxShadow: 24,
    padding: "40px 32px",
    overflow: "auto",
  };
  const updateSales = (data: FormValuesProps) => {
    alert(props.rowData._id);
    const body = {
      firstName: data.fname,
      lastName: data.lname,
      contact_no: data.contact,
      email_Id: data.email,
      empCode: data.empcode,
      designation: data.designation,
      district: data.district,
      state: data.state,
    };
    Api(`admin/Sales/edit/` + props.rowData._id, "POST", body, "").then(
      (Response: any) => {
        if (Response.responseCode == 200) {
          if (Response.data.responseCode == 200) {
            enqueueSnackbar(Response.data.responseMessage);
            props.parentFunction();
          } else {
          }
        }
      }
    );
  };

  const listDesignation = () => {
    Api(`admin/Sales/list_designation`, "GET", "", "").then((Response: any) => {
      if (Response.data.code == 200) {
        enqueueSnackbar(Response.data.message);
        setDegignation(Response.data.data);
      } else {
      }
    });
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(updateSales)}>
        <Box sx={style}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <RHFTextField
              name="fname"
              label="First Name"
              placeholder="First Name"
            />
            <RHFTextField
              name="lname"
              label="Last Name"
              placeholder="Last Name"
            />
            <RHFTextField
              name="contact"
              label="Contact Number"
              placeholder="Contact Number"
            />
            <RHFTextField name="email" label="Email" placeholder="Email" />
            <RHFTextField
              name="empcode"
              label="Emp. Code"
              placeholder="Emp. Code"
            />
            <RHFSelect
              name="designation"
              label="Designation"
              placeholder="Designation"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {degignation.map((item: any) => {
                return (
                  <MenuItem key={item._id} value={item.designationName}>
                    {item.designationName}
                  </MenuItem>
                );
              })}
            </RHFSelect>
            <RHFTextField
              name="district"
              label="District"
              placeholder="District"
            />
            <RHFTextField name="state" label="State" placeholder="State" />
          </Box>
          <Stack justifyContent={"end"} mt={3} width={"fit-content"}>
            <Button variant="contained" type="submit">
              Update User
            </Button>
          </Stack>
        </Box>
      </FormProvider>
    </>
  );
}
