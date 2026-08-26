import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import { Box, Stack, Modal, MenuItem, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
// components
import { Upload } from "src/components/upload";
import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  ModalShell,
  FormGrid,
  DataTable,
  EmptyState,
} from "src/components/page-kit";
//
import { Apiuser } from "../sections/ournetwork";
import UserDetail from "src/sections/ournetwork/UserDetail";

// ----------------------------------------------------------------------
// Ecosystem - the platform's API user estate.
//
// The page owns two cross-cutting tools (bulk upload and a directory lookup
// across every platform user); the estate itself is rendered by <Apiuser />.
// ----------------------------------------------------------------------

type FormValuesProps = {
  searchval: string;
  fromsearchby: string;
};

const SEARCH_FIELDS = [
  { value: "userCode", label: "User Code" },
  { value: "firstName", label: "First Name" },
  { value: "contact_no", label: "Contact Number" },
  { value: "email", label: "Email" },
];

export default function OurNetwork() {
  const { Api, UploadFileApi } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  //upload bulk user modal
  const [open, setModal] = React.useState(false);
  const openModal = () => setModal(true);
  const handleClose = () => setModal(false);

  //user search Modal
  const [open1, setModal1] = React.useState(false);
  const openModal1 = () => setModal1(true);
  const handleClose1 = () => {
    setModal1(false);
    reset(defaultValues);
    setFilteredData([]);
  };

  const [filteredData, setFilteredData] = React.useState([]);
  const [docfile, setDocfile] = React.useState<any>();
  const [uploading, setUploading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const docfile = acceptedFiles[0];
    if (docfile) {
      setDocfile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  const tableLabels = [
    { id: "product", label: "Name" },
    { id: "type", label: "User Type" },
    { id: "referredby", label: "Referred By" },
    { id: "mobileverified", label: "Mobile Verified" },
    { id: "mobileNumber", label: "Mobile Number", align: "center" as const },
    { id: "emailverified", label: "Email Verified" },
    { id: "walletbal", label: "Wallet Balance", align: "right" as const },
    { id: "consent", label: "Consent Agreed", align: "right" as const },
  ];

  // Form Controller
  const FilterSchema = Yup.object().shape({
    fromsearchby: Yup.string().required("Search by is required field"),
    searchval: Yup.string()
      .when("fromsearchby", {
        is: "userCode",
        then: Yup.string().required("User Code is required field"),
      })
      .when("fromsearchby", {
        is: "firstName",
        then: Yup.string().required("First Name is required field"),
      })
      .when("fromsearchby", {
        is: "contact_no",
        then: Yup.string().required("Contact Number is required field"),
      })
      .when("fromsearchby", {
        is: "email",
        then: Yup.string().required("Email is required field"),
      }),
  });
  const defaultValues = {
    searchval: "",
    fromsearchby: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const docupload = () => {
    let token = localStorage.getItem("token");
    let doc = docfile;
    let formData = new FormData();

    setUploading(true);
    formData.append("bulkUpload", doc);
    formData.append("directoryName", "other_documents");
    UploadFileApi(`auth/bulkUpload`, formData, token).then((Response: any) => {
      setUploading(false);
      if (Response?.status == 200) {
        if (Response.data.status == "success") {
          enqueueSnackbar("Bulk upload complete");
          setDocfile(null);
          handleClose();
        } else {
          enqueueSnackbar("Server didn`t response", { variant: "error" });
        }
      } else {
        enqueueSnackbar("file must be less then 1mb", { variant: "error" });
      }
    });
  };

  const FilterUser = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      searchBy: data.fromsearchby, // possible values -- firstName, email, contact_no, userCode
      searchInput: data.searchval,
      finalStatus: "approved",
    };
    {
      Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
        setSearched(true);
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setFilteredData(Response.data.data);
          } else {
            setFilteredData([]);
          }
        }
      });
    }
  };

  const searchLabel =
    SEARCH_FIELDS.find((field) => field.value === watch("fromsearchby"))
      ?.label || "value";

  return (
    <>
      <Helmet>
        <title> Ecosystem | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Ecosystem"
          subtitle="API users integrated with the platform, and the directory behind them."
          actions={
            <>
              <PageGhostButton
                startIcon={<UploadFileOutlinedIcon />}
                onClick={openModal}
              >
                Upload CSV
              </PageGhostButton>
              <PageActionButton
                startIcon={<PersonSearchOutlinedIcon />}
                onClick={openModal1}
              >
                Directory Lookup
              </PageActionButton>
            </>
          }
        />

        <Apiuser />
      </Box>

      {/* ── Bulk user upload ───────────────────────────────────────────── */}
      <Modal open={open} onClose={handleClose}>
        <ModalShell
          title="Bulk User Upload"
          subtitle="One CSV, up to 1 MB. Rows are created as approved users."
          onClose={handleClose}
          width={560}
          actions={
            <>
              <LoadingButton
                variant="outlined"
                color="inherit"
                onClick={handleClose}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                variant="contained"
                disabled={!docfile}
                loading={uploading}
                onClick={docupload}
              >
                Upload
              </LoadingButton>
            </>
          }
        >
          <Upload
            file={docfile}
            onDrop={handleDropSingleFile}
            onDelete={() => setDocfile(null)}
          />
        </ModalShell>
      </Modal>

      {/* ── Directory lookup ───────────────────────────────────────────── */}
      <Modal open={open1} onClose={handleClose1}>
        <ModalShell
          title="Directory Lookup"
          subtitle="Search every approved user on the platform, not just API users."
          onClose={handleClose1}
          width={filteredData.length ? 1100 : 560}
        >
          <FormProvider methods={methods} onSubmit={handleSubmit(FilterUser)}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "flex-start" }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <FormGrid columns={2}>
                  <RHFSelect
                    fullWidth
                    name="fromsearchby"
                    label="Search By"
                    placeholder="Search By"
                    SelectProps={{ native: false }}
                  >
                    {SEARCH_FIELDS.map((field) => (
                      <MenuItem key={field.value} value={field.value}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>

                  <RHFTextField
                    name="searchval"
                    label={`User's ${searchLabel}`}
                  />
                </FormGrid>
              </Box>

              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
                sx={{ height: 56, px: 3, flexShrink: 0 }}
              >
                Search
              </LoadingButton>
            </Stack>
          </FormProvider>

          <Box sx={{ mt: 3 }}>
            {filteredData.length > 0 ? (
              <DataTable columns={tableLabels} minWidth={980} maxHeight={460}>
                {filteredData.map((row: any, index: number) => (
                  <UserDetail key={row?._id || index} row={row} />
                ))}
              </DataTable>
            ) : searched ? (
              <EmptyState
                boxed={false}
                icon={<GroupsOutlinedIcon />}
                title="No users found"
                description="Nothing matched that value. Check the field you searched by and try again."
              />
            ) : (
              <Typography
                sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}
              >
                Pick a field and a value to search the directory.
              </Typography>
            )}
          </Box>
        </ModalShell>
      </Modal>
    </>
  );
}
