import { useCallback, useState } from "react";
// @mui
import { Box, Stack, MenuItem, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
// components
import Upload from "src/components/upload/Upload";
import { useSnackbar } from "src/components/snackbar";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import { FormGrid, FormActions, PageGhostButton } from "src/components/page-kit";
//
import {
  Provider,
  AVAILABLE_FOR,
  REMIND_VIA,
  COMMISSION_TYPES,
  TRANSACTION_TYPES,
} from "./providerCatalog";

// ----------------------------------------------------------------------
// The one provider form. Create and edit both go through it, so the field
// vocabulary lives in exactly one place.
//
// Endpoints are the ones the old Add New Vendor screen used, unchanged:
//   POST vendor/add_Vendor
//   POST vendor/edit_Vendor/:id
//   POST upload/upload_admin_file   (multipart, agreement document)
//
// The old screen sent every field on both paths and left validation entirely
// to the backend (its Yup rules were all commented out). Provider name is
// required here because a nameless provider renders as a blank row everywhere
// downstream; nothing else was tightened, so no payload that used to be
// accepted is now rejected.
// ----------------------------------------------------------------------

type Props = {
  /** Omit to create. Pass a provider to edit it. */
  provider?: Provider | null;
  onSaved: () => void;
  onCancel?: () => void;
};

type FormValuesProps = {
  vendorName: string;
  vendor_gst: string;
  vendorContactName: string;
  vendor_email: string;
  vendorContact: string;
  paymentTerms: string;
  commissionType: string;
  vendortransactionType: string;
  vendorAvailableFor: string;
  remindVia: string;
  reminderSubject: string;
  reminderMessage: string;
  vendorApiDocument: string;
};

const ProviderSchema = Yup.object().shape({
  vendorName: Yup.string().trim().required("Provider name is required"),
});

export default function ProviderForm({ provider, onSaved, onCancel }: Props) {
  const { Api, UploadFileApi } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const isEdit = Boolean(provider?._id);

  /* Agreement document. `agreementPath` is what actually gets posted - the
     file has to be uploaded first, exactly as the old screen did it. */
  const [agreementFile, setAgreementFile] = useState<any>(null);
  const [agreementPath, setAgreementPath] = useState<string>(
    provider?.vendorAgreementFile || ""
  );
  const [uploading, setUploading] = useState(false);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ProviderSchema),
    defaultValues: {
      vendorName: provider?.vendorName || "",
      vendor_gst: provider?.vendor_gst || "",
      vendorContactName: provider?.vendorContactName || "",
      vendor_email: provider?.vendor_email || "",
      vendorContact: provider?.vendorContact || "",
      paymentTerms: provider?.paymentTerms || "",
      commissionType: provider?.commissionType || "",
      vendortransactionType: provider?.vendortransactionType || "",
      vendorAvailableFor: provider?.vendorAvailableFor || "",
      remindVia: provider?.remindVia || "",
      reminderSubject: provider?.reminderSubject || "",
      reminderMessage: provider?.reminderMessage || "",
      vendorApiDocument: provider?.vendorApiDocument || "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setAgreementFile(
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
  }, []);

  const uploadAgreement = async () => {
    if (!agreementFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("document", agreementFile);
    formData.append("directoryName", "other_documents");

    const response: any = await UploadFileApi(
      "upload/upload_admin_file",
      formData,
      ""
    );

    if (response?.status === 200 && response.data.status === "success") {
      setAgreementPath(response.data.filePath);
      enqueueSnackbar("Agreement uploaded");
    } else if (response?.status === 200) {
      enqueueSnackbar("Server did not respond", { variant: "error" });
    } else {
      enqueueSnackbar("File must be less than 1MB", { variant: "error" });
    }

    setUploading(false);
  };

  const onSubmit = async (data: FormValuesProps) => {
    const body = {
      ...data,
      /* Keep whatever was already on file when nothing new was uploaded, so
         editing the contact number cannot silently drop the agreement. */
      vendorAgreementFile: agreementPath,
    };

    const url = isEdit
      ? `vendor/edit_Vendor/${provider?._id}`
      : "vendor/add_Vendor";

    const response: any = await Api(url, "POST", body, "");

    if (response?.status === 200 && response.data.code === 200) {
      enqueueSnackbar(
        response.data.message || (isEdit ? "Provider updated" : "Provider added")
      );
      onSaved();
      return;
    }

    enqueueSnackbar(response?.data?.message || "Could not save the provider", {
      variant: "error",
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3.5}>
        <Section title="Identity">
          <FormGrid>
            <RHFTextField name="vendorName" label="Provider name" size="small" />
            <RHFTextField name="vendor_gst" label="GSTIN" size="small" />
          </FormGrid>
        </Section>

        <Section title="Contact">
          <FormGrid>
            <RHFTextField
              name="vendorContactName"
              label="Contact person"
              size="small"
            />
            <RHFTextField name="vendor_email" label="Email" size="small" />
            <RHFTextField
              name="vendorContact"
              label="Contact number"
              size="small"
            />
            <RHFTextField
              name="paymentTerms"
              label="Payment terms"
              size="small"
            />
          </FormGrid>
        </Section>

        <Section title="Commercials">
          <FormGrid>
            <RHFSelect
              name="commissionType"
              label="Commission structure"
              size="small"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              <MenuItem value="">
                <em>Not set</em>
              </MenuItem>
              {COMMISSION_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="vendortransactionType"
              label="Transaction type"
              size="small"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              <MenuItem value="">
                <em>Not set</em>
              </MenuItem>
              {TRANSACTION_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="vendorAvailableFor"
              label="Available for"
              size="small"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              <MenuItem value="">
                <em>Not set</em>
              </MenuItem>
              {AVAILABLE_FOR.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="remindVia"
              label="Reminder via"
              size="small"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              <MenuItem value="">
                <em>Not set</em>
              </MenuItem>
              {REMIND_VIA.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </FormGrid>
        </Section>

        <Section title="Reminders">
          <FormGrid>
            <RHFTextField
              name="reminderSubject"
              label="Reminder subject"
              size="small"
            />
            <RHFTextField
              name="reminderMessage"
              label="Reminder content"
              size="small"
            />
          </FormGrid>
        </Section>

        <Section title="Documents">
          <Stack spacing={2}>
            <RHFTextField
              name="vendorApiDocument"
              label="API documentation"
              size="small"
              multiline
              rows={4}
            />

            <Box>
              <Typography
                sx={{ mb: 1, fontSize: 12.5, color: "text.secondary" }}
              >
                Signed agreement
                {agreementPath ? " - a document is on file" : ""}
              </Typography>

              <Upload
                file={agreementFile}
                onDrop={handleDrop}
                onDelete={() => setAgreementFile(null)}
              />

              {agreementFile && (
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                  <LoadingButton
                    variant="outlined"
                    loading={uploading}
                    onClick={uploadAgreement}
                    startIcon={<UploadFileOutlinedIcon />}
                  >
                    Upload agreement
                  </LoadingButton>
                </Stack>
              )}
            </Box>
          </Stack>
        </Section>
      </Stack>

      <FormActions>
        {onCancel && (
          <PageGhostButton onClick={onCancel}>Cancel</PageGhostButton>
        )}
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ height: 42, px: 3 }}
        >
          {isEdit ? "Save changes" : "Add provider"}
        </LoadingButton>
      </FormActions>
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

/** Labelled block inside the form - keeps the long form scannable. */
function Section({ title, children }: { title: string; children: any }) {
  return (
    <Box>
      <Typography
        sx={{
          mb: 1.75,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
