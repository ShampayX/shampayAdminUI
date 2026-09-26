import * as React from "react";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import * as Yup from "yup";
import Typography from "@mui/material/Typography";
import {
  Card,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "notistack";
import { TableHeadCustom } from "src/components/table";
import AddIcon from "@mui/icons-material/Add";
import {
  PageHeader,
  PageActionButton,
  FilterBar,
  DataTable,
  ModalShell,
  FormGrid,
  PageGhostButton,
  KitRow,
  SearchField,
  useDataTable,
  exportToExcel,
} from "src/components/page-kit";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";

function BankMaster() {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 400,
    bgcolor: "background.paper",
    border: "2px ",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  const accountValidate = Yup.object().shape({
    bankName: Yup.string().required(`Bank Name is Required Field`),
    masterIFSC: Yup.string().required(`IFSC is Required Field`),
    shortCode: Yup.string().required(`Short Code is Required Field`),
  });
  type FormValuesProps = {
    bankName: string;
    masterIFSC: string;
    shortCode: string;
    isVerificationAvailable: string;
    ekoBankId: string;
    status: string;
    impsStatus: string;
    neftStatus: string;
    internalShortCode: string;
    name: string;
  };

  const defaultValues = {
    bankName: "",
    masterIFSC: "",
    shortCode: "",
    isVerificationAvailable: "",
    ekoBankId: "",
    status: "",
    impsStatus: "",
    neftStatus: "",
    internalShortCode: "",
    name: "",
  };

  const [open, setOpen] = React.useState(false);
  const { Api } = useAuthContext();
  const [bankList, setBankList] = useState<any>([]);
  const handleOpen = () => setOpen(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const { enqueueSnackbar } = useSnackbar();
  const handleClose = () => {
    reset();
    setOpen(false);
  };
  const tableLabels = [
    { id: "Action", label: "Action" },
    { id: "bankName", label: "Bank Name", sortKey: "bankName" },
    { id: "shortCode", label: "Short Code", sortKey: "shortCode" },
    {
      id: "FingpayAEPSIIN",
      label: "Fingpay AEPSIIN",
      sortKey: "FingpayAEPSIIN",
    },
    { id: "FingpayAPIIN", label: "Fingpay APIIN", sortKey: "FingpayAPIIN" },
    { id: "masterIFSC", label: "Master IFSC", sortKey: "masterIFSC" },
    { id: "ekoBankId", label: "Eko Bank Id", sortKey: "ekoBankId" },
    { id: "name", label: "Name", sortKey: "name" },
  ];

  /* instant search + sort + paging, all client-side */
  const table = useDataTable<any>(bankList, {
    searchKeys: ["bankName", "shortCode", "masterIFSC", "ekoBankId", "name"],
    storageKey: "bank-master",
  });

  const exportBanks = () => {
    const ok = exportToExcel(
      table.results.map((row: any) => ({
        "Bank Name": row?.bankName || "",
        "Short Code": row?.shortCode || "",
        "Fingpay AEPSIIN": row?.FingpayAEPSIIN || "",
        "Fingpay APIIN": row?.FingpayAPIIN || "",
        "Master IFSC": row?.masterIFSC || "",
        "Eko Bank Id": row?.ekoBankId || "",
        Name: row?.name || "",
      })),
      "bank-master",
      "Banks"
    );
    if (!ok) enqueueSnackbar("Nothing to export", { variant: "warning" });
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
    GetBankData();
  }, []);

  const GetBankData = () => {
    let token = localStorage.getItem("token");
    Api(`bankManagement/get_bank`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response?.data?.message);

        setBankList(Response?.data?.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const AddBank = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      bankName: data?.bankName,
      shortCode: data?.shortCode,
      masterIFSC: data?.masterIFSC,
      ekoBankId: data?.ekoBankId,
      status: data?.status,
      impsStatus: data?.impsStatus,
      neftStatus: data?.neftStatus,
      isVerificationAvailable: data?.isVerificationAvailable,
      // Item 3f: this field was `tramoShortCode`. `create_bank` reads
      // `internalShortCode` straight off the request body, so the old name saved
      // successfully with the value silently dropped - no error, no warning.
      internalShortCode: data?.internalShortCode,
      name: data?.name,
    };

    Api(`bankManagement/create_bank`, "POST", body, token).then(
      (Response: any) => {
        // Item 1b: success was toasted on the transport status alone. The failure
        // branch read `data.err`, which the `{ code, message }` contract does not
        // set, so a refused create showed an empty toast.
        if (isOk(Response)) {
          notifyOk(enqueueSnackbar, Response, "Bank created.");
          handleClose();
          GetBankData();
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  return (
    <>
      <PageHeader
        title="Bank Master"
        subtitle="Bank codes, IFSC masters and verification modes used across services."
        actions={
          <>
            <PageGhostButton startIcon={<RefreshIcon />} onClick={GetBankData}>
              Refresh
            </PageGhostButton>
            <PageActionButton
              tone="alt"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={exportBanks}
            >
              Export
            </PageActionButton>
            <PageActionButton
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Add New Bank
            </PageActionButton>
          </>
        }
      />

      <FilterBar>
        <SearchField
          value={table.query}
          onChange={table.setQuery}
          placeholder="Search bank name, short code, IFSC, Eko ID"
          count={table.total}
          total={table.grandTotal}
        />
      </FilterBar>

      <DataTable
        columns={tableLabels}
        isEmpty={table.isEmpty}
        emptyMessage={
          table.isFiltered
            ? `No banks match "${table.query}".`
            : "No banks configured yet."
        }
        minWidth={980}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
        footer={
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={table.total}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={(event, newPage) => table.setPage(newPage)}
            onRowsPerPageChange={(event) =>
              table.changeRowsPerPage(parseInt(event.target.value, 10))
            }
          />
        }
      >
        {table.paged.map((row: any) => (
          <BankRow key={row._id} row={row} GetBankData={GetBankData} />
        ))}
      </DataTable>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <ModalShell
            title="Add New Bank"
            subtitle="Create a bank entry with its codes and verification mode."
            onClose={handleClose}
            width={720}
          >
            <FormProvider methods={methods} onSubmit={handleSubmit(AddBank)}>
              <FormGrid columns={2}>
                <RHFTextField
                  name="bankName"
                  label="Bank Name"
                  placeholder="Bank Name"
                  size="small"
                />
                <RHFTextField
                  name="masterIFSC"
                  label="IFSC"
                  placeholder="IFSC"
                  size="small"
                />
                <RHFTextField
                  name="shortCode"
                  label="Short Code"
                  size="small"
                  placeholder="Short Code"
                />
                <RHFTextField
                  name="ekoBankId"
                  label="Eko BankId"
                  placeholder="Eko Bank Id"
                  size="small"
                />
                <RHFTextField
                  name="status"
                  label="Status"
                  placeholder="Status"
                  size="small"
                />
                <RHFSelect
                  name="isVerificationAvailable"
                  label="Mode"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </RHFSelect>
                <RHFTextField
                  name="impsStatus"
                  label="Imps Status"
                  placeholder="Imps Status"
                  size="small"
                />
                <RHFTextField
                  name="neftStatus"
                  label="Neft Status"
                  placeholder="Neft Status"
                  size="small"
                />
                <RHFTextField
                  name="internalShortCode"
                  label="Shampay ShortCode"
                  size="small"
                  placeholder="Shampay ShortCode"
                />
                <RHFTextField
                  name="name"
                  label="Name"
                  size="small"
                  placeholder="Name"
                />
              </FormGrid>

              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <PageGhostButton onClick={handleClose}>Cancel</PageGhostButton>
                <PageActionButton type="submit" onClick={handleOpen}>
                  Add Bank
                </PageActionButton>
              </Stack>
            </FormProvider>
          </ModalShell>
        </Box>
      </Modal>
    </>
  );
}

type childProps = {
  row: any;
  GetBankData: () => void;
};

function BankRow({ row, GetBankData }: childProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [editTrue, setEditTrue] = useState(true);

  const updateBank = (val: any) => {
    let token = localStorage.getItem("token");
    let body = {
      masterIFSC: row?.masterIFSC,
      bankName: row?.bankName,
      name: row?.name,
      shortCode: row?.shortCode,
      internalShortCode: row?.internalShortCode,
      ekoBankId: row?.ekoBankId,
      bankId: val._id,
      FingpayAEPSIIN: row?.FingpayAEPSIIN,
      FingpayAPIIN: row?.FingpayAPIIN,
    };
    if (row.masterIFSC != "") {
      Api(`bankManagement/updateBank`, "POST", body, token).then(
        (Response: any) => {
          if (isOk(Response)) {
            setEditTrue(!editTrue);
            enqueueSnackbar(Response.data.message);
            GetBankData(); // Refresh the table after updating a bank
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    }
  };

  const DelteBank = (val: any) => {
    let token = localStorage.getItem("token");
    let body = {
      bankId: val._id,
    };
    if (row.masterIFSC != "") {
      Api(`bankManagement/delete`, "POST", body, token).then(
        (Response: any) => {
          if (isOk(Response)) {
            enqueueSnackbar(Response.data.message);
            GetBankData(); // Refresh the table after deleting a bank
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    }
  };

  return (
    <KitRow>
      {/* Action first, matching the reports convention */}
      <TableCell>
        {editTrue ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setEditTrue(!editTrue)}
            sx={{ fontSize: 11.5, fontWeight: 700 }}
          >
            Edit
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={() => updateBank(row)}
            sx={{ fontSize: 11.5, fontWeight: 700 }}
          >
            Save
          </Button>
        )}
      </TableCell>
      <TableCell>
        <Typography>
          {editTrue ? (
            <Typography>{row.bankName}</Typography>
          ) : (
            <TextField
              size="medium"
              area-autoComplete="off"
              id="outlined-basic"
              variant="outlined"
              aria-autocomplete="none"
              label={row.bankName}
              onChange={(e) => (row.bankName = e.target.value)}
            />
          )}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>
          {editTrue ? (
            <Typography>{row.shortCode}</Typography>
          ) : (
            <TextField
              size="medium"
              area-autoComplete="off"
              id="outlined-basic"
              variant="outlined"
              aria-autocomplete="none"
              label={row.shortCode}
              onChange={(e) => (row.shortCode = e.target.value)}
            />
          )}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography>
          {editTrue ? (
            <Typography>{row.FingpayAEPSIIN}</Typography>
          ) : (
            <TextField
              size="medium"
              area-autoComplete="off"
              id="outlined-basic"
              variant="outlined"
              aria-autocomplete="none"
              label={row.FingpayAEPSIIN}
              onChange={(e) => (row.FingpayAEPSIIN = e.target.value)}
            />
          )}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography>
          {editTrue ? (
            <Typography>{row.FingpayAPIIN}</Typography>
          ) : (
            <TextField
              size="medium"
              area-autoComplete="off"
              id="outlined-basic"
              variant="outlined"
              aria-autocomplete="none"
              label={row.FingpayAPIIN}
              onChange={(e) => (row.FingpayAPIIN = e.target.value)}
            />
          )}
        </Typography>
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
        <Typography>
          {editTrue ? (
            <Typography>{row.ekoBankId}</Typography>
          ) : (
            <TextField
              size="medium"
              area-autoComplete="off"
              id="outlined-basic"
              variant="outlined"
              aria-autocomplete="none"
              label={row.ekoBankId}
              onChange={(e) => (row.ekoBankId = e.target.value)}
            />
          )}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography>
          {editTrue ? (
            <Typography>{row.name}</Typography>
          ) : (
            <TextField
              size="medium"
              area-autoComplete="off"
              id="outlined-basic"
              variant="outlined"
              aria-autocomplete="none"
              label={row.name}
              onChange={(e) => (row.name = e.target.value)}
            />
          )}
        </Typography>
      </TableCell>
    </KitRow>
  );
}

export default BankMaster;
