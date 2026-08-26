import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import {
  Stack,
  Chip,
  Button,
  TextField,
  Modal,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
// form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSnackbar } from "src/components/snackbar";
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Pagination,
  Typography,
  TableContainer,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";

import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
} from "../../../components/hook-form";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------

type FormValuesProps = {
  tags: string[];
  masterIFSC: string;
  bankName: string;
  SearchBankName: string;
  shortCode: string;
};

export default function BMmoneyTransfer() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [bankList, setBankList] = useState([]);
  const [bankData, setBankData] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [searchName, setSearchName] = useState("");

  const tableLabels = [
    { id: 1, label: "Bank Name" },
    { id: 2, label: "Short Code" },
    { id: 3, label: "Master IFSC" },
    { id: 4, label: "Action" },
  ];

  const NewBlogSchema = Yup.object().shape({});
  const defaultValues = {};
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewBlogSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getBank();
  }, []);

  const getBank = () => {
    setBankData(false);
    Api(`bankManagement/get_bank`, "GET", "", "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setBankList(Response.data.data);
          setBankData(true);
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  const addBank = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      bankName: data.bankName,
      shortCode: data.shortCode,
      masterIFSC: data.masterIFSC,
    };
    Api(`bankManagement/create_bank`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            handleClose();
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  useEffect(() => {
    setBankData(false);
    let filteredItem = bankList.filter((item: any) => {
      return item.bankName == searchName;
    });
    setBankList(filteredItem);
    setBankData(true);
    if (!searchName) {
      getBank();
    }
  }, [searchName]);
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };
  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        mb={1}
        gap={1}
      >
        <FormProvider methods={methods}>
          <Stack flexDirection={"row"} gap={1}>
            <RHFAutocomplete
              name="SearchBankName"
              freeSolo
              sx={{ maxWidth: 500, width: 500 }}
              onChange={(event, newValue) => setSearchName(newValue)}
              options={bankList.map((option: any) => option.bankName)}
              renderTags={(searchName, getTagProps) =>
                searchName.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    size="small"
                    label={option.bankName}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField label="Search Bank Name" {...params} size="small" />
              )}
            />
          </Stack>
        </FormProvider>
        <Button variant="contained" onClick={handleOpen}>
          Add New Bank
        </Button>
      </Stack>
      <Card>
        <TableContainer
          sx={{ border: "1px", maxHeight: "350px", overflowY: "scroll" }}
        >
          <Scrollbar>
            {bankData ? (
              <Table sx={{ minWidth: 720 }}>
                <TableHeadCustom headLabel={tableLabels} />
                <TableBody sx={{ overflow: "auto" }}>
                  {bankList.map((row: any) => (
                    <BankRow key={row._id} row={row} />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <ApiDataLoading variant="table" columns={tableLabels} />
            )}
          </Scrollbar>
        </TableContainer>
      </Card>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            borderRadius: "20px",
            p: 2,
            width: {
              xs: "100%",
              md: "50%",
            },
          }}
        >
          <Grid
            rowGap={3}
            columnGap={1}
            display="grid"
            pt={1}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            <FormProvider methods={methods} onSubmit={handleSubmit(addBank)}>
              <Scrollbar sx={{ maxHeight: "560px" }}>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  pt={1}
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                  }}
                >
                  <RHFTextField
                    name="bankName"
                    label="Bank Name"
                    placeholder="Bank Name"
                  />
                  <RHFTextField
                    name="shortCode"
                    label="short Code"
                    placeholder="short Code"
                  />
                  <RHFTextField
                    name="masterIFSC"
                    label="master IFSC"
                    placeholder="master IFSC"
                  />
                </Box>
                <Stack justifyContent={"center"} mt={2}>
                  <Button
                    sx={{ margin: "auto", marginBottom: "10px" }}
                    size="medium"
                    type="submit"
                    variant="contained"
                  >
                    Add Bank Account
                  </Button>
                </Stack>
              </Scrollbar>
            </FormProvider>
          </Grid>
        </Box>
      </Modal>
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
    </>
  );
}

type childProps = {
  row: any;
};

function BankRow({ row }: childProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [editTrue, setEditTrue] = useState(true);

  const updateBank = (val: any) => {
    let token = localStorage.getItem("token");
    let body = {
      masterIFSC: row.masterIFSC,
    };
    if (row.masterIFSC != "") {
      Api(`bankManagement/edit_bank_IFSC/${val._id}`, "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              setEditTrue(!editTrue);
              enqueueSnackbar(Response.data.message);
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        <Typography>{row.bankName}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{row.shortCode}</Typography>
      </TableCell>
      <TableCell>
        {editTrue ? (
          <Typography>{row.masterIFSC}</Typography>
        ) : (
          <TextField
            size="medium"
            area-autoComplete="off"
            id="outlined-basic"
            variant="outlined"
            aria-autocomplete="none"
            label={row.masterIFSC}
            onChange={(e) => (row.masterIFSC = e.target.value)}
          />
        )}
      </TableCell>
      <TableCell>
        {editTrue ? (
          <Button variant="contained" onClick={() => setEditTrue(!editTrue)}>
            Edit
          </Button>
        ) : (
          <Button variant="contained" onClick={() => updateBank(row)}>
            save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
