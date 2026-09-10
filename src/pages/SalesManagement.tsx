// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  Typography,
  TableContainer,
  Pagination,
  Button,
  Modal,
  Checkbox,
  MenuItem,
} from "@mui/material";
// components
import { useSnackbar } from "../components/snackbar";
import { isOk, notifyResult, notifyFailure } from "src/utils/apiResult";

import Scrollbar from "../components/scrollbar";
import { PATH_DASHBOARD } from "src/routes/paths";
import { TableHeadCustom } from "../components/table";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import React, { useEffect, useState, useCallback } from "react";
import SalesManagementUpdate from "../sections/salesmanagement/SalesManagementUpdate";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type RowProps = {
  contact_no: string;
  designation: string;
  district: string;
  email_Id: string;
  empCode: string;
  firstName: boolean;
  lastName: boolean;
  sales_refferal_code: any;
  state: string;
  _id: string;
};

type FormValuesProps = {
  fname: string;
  lname: string;
  contact: string;
  email: string;
  empcode: string;
  designation: string;
  district: string;
  state: string;
};

export default function SalesManagement() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [appdata, setAppdata] = useState([]);
  const [degignation, setDegignation] = useState([]);
  const [open, setModalEdit] = React.useState(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const openEditModal = (val: any) => {
    setModalEdit(true);
    listDesignation();
  };
  const handleClose = () => setModalEdit(false);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const accountValidate = Yup.object().shape({});
  const defaultValues = {
    fname: "",
    lname: "",
    contact: "",
    email: "",
    password: "",
    gst: "",
    pan: "",
    companyname: "",
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
    salesUsers();
  }, []);

  const tableLabels: any = [
    { id: "Name", label: "user Detail" },
    { id: "contact_no", label: "contact_no" },
    { id: "empCode", label: "empCode" },
    { id: "sales_refferal_code", label: "sales_refferal_code" },
    { id: "designation", label: " designation" },
    { id: "state", label: "state" },
    { id: "Action", label: "Action" },
  ];

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

  const addSales = (data: FormValuesProps) => {
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
    // Item 1b/1c: this read `responseCode`, which the `{ code, message }` contract
    // never sets, and swallowed every failure in an empty else - so a profile that
    // was not created looked identical to one that was. It also touched
    // `Response.data` unguarded, which throws when `Api()` resolves to "error".
    Api(`admin/Sales/createProfile`, "POST", body, "").then((Response: any) => {
      if (notifyResult(enqueueSnackbar, Response, "Profile created.")) {
        handleClose();
      }
    });
  };
  const salesUsers = () => {
    Api(`admin/Sales/salesList`, "GET", "", "").then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        setAppdata(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
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
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };
  return (
    <>
      <Card>
        <Stack flexDirection={"row"} m={2} gap={1} justifyContent={"flex-end"}>
          <Button variant="contained" onClick={openEditModal}>
            Add new sales User
          </Button>
        </Stack>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <FormProvider methods={methods} onSubmit={handleSubmit(addSales)}>
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
                  size="small"
                />
                <RHFTextField
                  name="lname"
                  label="Last Name"
                  placeholder="Last Name"
                  size="small"
                />
                <RHFTextField
                  name="contact"
                  label="Contact Number"
                  placeholder="Contact Number"
                  size="small"
                />
                <RHFTextField
                  name="email"
                  label="Email"
                  placeholder="Email"
                  size="small"
                />
                <RHFTextField
                  name="empcode"
                  label="Emp. Code"
                  placeholder="Emp. Code"
                  size="small"
                />
                <RHFSelect
                  name="designation"
                  label="Designation"
                  size="small"
                  placeholder="Designation"
                  // InputLabelProps={{ shrink: true }}
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
                  size="small"
                  placeholder="District"
                />
                <RHFTextField
                  name="state"
                  label="State"
                  size="small"
                  placeholder="State"
                />
              </Box>
              <Stack justifyContent={"end"} mt={3} width={"fit-content"}>
                <Button variant="contained" type="submit">
                  Add User
                </Button>
              </Stack>
            </Box>
          </FormProvider>
        </Modal>

        <TableContainer sx={{ height: "100vh", overflowY: "auto" }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={tableLabels} />
              <TableBody>
                {appdata.map((row) => (
                  <EcommerceBestSalesmanRow key={row} row={row} />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <Pagination
          sx={{ display: "flex", justifyContent: "center" }}
          // count={pageSize}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
};

// sd
function EcommerceBestSalesmanRow({ row }: EcommerceBestSalesmanRowProps) {
  const [editValue, setEditValue] = useState({
    contact_no: "",
    designation: "",
    district: "",
    email_Id: "",
    empCode: "",
    firstName: "",
    lastName: "",
    sales_refferal_code: "",
    state: "",
    _id: "",
  });
  const [open1, setModalEdit1] = React.useState(false);
  const openEditModal1 = (val: any) => {
    setModalEdit1(true);
    setEditValue(val);
  };
  const handleClose1 = () => setModalEdit1(false);

  const parentFunction = () => {
    handleClose1();
  };

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center">
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2"> {row.firstName} </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row.email_Id}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>{row.contact_no}</TableCell>
      <TableCell>{row.empCode}</TableCell>
      <TableCell>{row.sales_refferal_code}</TableCell>
      <TableCell>{row.designation}</TableCell>
      <TableCell>{row.state}</TableCell>
      <TableCell>
        <Button variant="contained" onClick={() => openEditModal1(row)}>
          Edit
        </Button>
      </TableCell>
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <SalesManagementUpdate
          rowData={editValue}
          parentFunction={parentFunction}
        />
      </Modal>
    </TableRow>
  );
}
