import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { Stack, Box, Modal } from "@mui/material";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import { useSnackbar } from "src/components/snackbar";
import EmailTemplateTable from "./EmailTemplateTable";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  ModalShell,
  FormGrid,
} from "src/components/page-kit";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

type FormValuesProps = {
  SUBJECT: string;
  SOURCE_EMAIL: string;
  EMAIL_SERVICE: string;
  TEMPLATE_NAME: string;
  TEMPLATE_ID: string;
  DLT_MESSAGE_TYPE: string;
  EMAIL_TYPE: string;
  BUSINESS_CATEGORY: string;
  IS_TRANSACTIONAL: string;
  MASK: string;
  TEMPLATE_CONTENT: string;
  CAUSE_ID: string;
  REPLY_TO: string;
};

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    ["link", "image"], //link and image
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

function EmailTemplate() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [emailValue, setEmailValue] = useState("");
  const [smsValue, setSmsValue] = useState("");
  const [templateList, setTemplateList] = useState([]);
  // modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const setEditorEmailValue = (val: any) => {
    setEmailValue(val);
  };
  const setEditorSmsValue = (val: any) => {
    setSmsValue(val);
  };

  const defaultValues = {};

  const textScheme = Yup.object().shape({});

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(textScheme),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    GetEmailTemp();
  }, []);

  const addEmailTemp = (data: FormValuesProps) => {
    const body = {
      SUBJECT: data.SUBJECT,
      SOURCE_EMAIL: data.SOURCE_EMAIL,
      EMAIL_SERVICE: data.EMAIL_SERVICE,
      TEMPLATE_NAME: data.TEMPLATE_NAME,
      TEMPLATE_ID: data.TEMPLATE_ID,
      DLT_MESSAGE_TYPE: data.DLT_MESSAGE_TYPE,
      EMAIL_TYPE: data.EMAIL_TYPE,
      BUSINESS_CATEGORY: data.BUSINESS_CATEGORY,
      IS_TRANSACTIONAL: data.IS_TRANSACTIONAL,
      MASK: data.MASK,
      TEMPLATE_CONTENT: emailValue,
      CAUSE_ID: data.CAUSE_ID,
      REPLY_TO: data.REPLY_TO,
    };
    Api(`EmailTemplate/addEmailTemplate`, "POST", body, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          enqueueSnackbar(Response.data.message);
          handleClose();
        } else {
        }
      }
    );
  };

  const GetEmailTemp = () => {
    Api("EmailTemplate/getEmailTemplate", "GET", "", "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          enqueueSnackbar(Response.data.message);
          setTemplateList(Response.data.EmailTemplate);
        } else {
        }
      }
    );
  };

  return (
    <>
      <PageHeader
        title="Email Templates"
        subtitle="Transactional email copy, senders and delivery settings."
        actions={
          <>
            <PageGhostButton startIcon={<RefreshIcon />} onClick={GetEmailTemp}>
              Refresh
            </PageGhostButton>
            <PageActionButton startIcon={<AddIcon />} onClick={handleOpen}>
              Add Email Template
            </PageActionButton>
          </>
        }
      />

      <EmailTemplateTable
        tableData={templateList}
        tableLabels={[
          { id: "action", label: "Action" },
          { id: "TEMPLATE_NAME", label: "Template Name", sortKey: "TEMPLATE_NAME" },
          { id: "TEMPLATE_ID", label: "Template Id", sortKey: "TEMPLATE_ID" },
          { id: "SUBJECT", label: "Subject", sortKey: "SUBJECT" },
          { id: "SOURCE_EMAIL", label: "Source Email", sortKey: "SOURCE_EMAIL" },
          {
            id: "BUSINESS_CATEGORY",
            label: "Business Category",
            sortKey: "BUSINESS_CATEGORY",
          },
          { id: "REPLY_TO", label: "Reply To" },
          { id: "MASK", label: "Mask" },
          { id: "IS_TRANSACTIONAL", label: "Transactional" },
          { id: "IS_ACTIVE", label: "Active", sortKey: "IS_ACTIVE" },
          { id: "EMAIL_TYPE", label: "Email Type", sortKey: "EMAIL_TYPE" },
          { id: "EMAIL_SERVICE", label: "Email Service", sortKey: "EMAIL_SERVICE" },
          { id: "CAUSE_ID", label: "Cause Id" },
          { id: "TEMPLATE_CONTENT", label: "Content" },
        ]}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <FormProvider methods={methods} onSubmit={handleSubmit(addEmailTemp)}>
            <ModalShell
              title="Add Email Template"
              subtitle="Sender, delivery settings and the body of the email."
              onClose={handleClose}
              width={980}
              actions={
                <>
                  <PageGhostButton onClick={handleClose}>Cancel</PageGhostButton>
                  <PageActionButton type="submit">Add Template</PageActionButton>
                </>
              }
            >
              <FormGrid columns={3}>
                <RHFTextField
                  type="text"
                  name="SUBJECT"
                  label="Subject"
                  placeholder="Subject"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="REPLY_TO"
                  label="Reply To"
                  placeholder="Reply To"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="SOURCE_EMAIL"
                  label="Source Email"
                  placeholder="Source Email"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="EMAIL_SERVICE"
                  label="Email Service"
                  placeholder="Email Service"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="TEMPLATE_NAME"
                  label="Template Name"
                  placeholder="Template Name"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="TEMPLATE_ID"
                  label="Template Id"
                  placeholder="Template Id"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="DLT_MESSAGE_TYPE"
                  label="DLT Message Type"
                  placeholder="DLT Message Type"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="EMAIL_TYPE"
                  label="Email Type"
                  placeholder="Email Type"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="BUSINESS_CATEGORY"
                  label="Business Category"
                  placeholder="Business Category"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="IS_TRANSACTIONAL"
                  label="Is Transactional"
                  placeholder="Is Transactional"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="MASK"
                  label="Mask"
                  placeholder="Mask"
                  size="small"
                />
                <RHFTextField
                  type="text"
                  name="CAUSE_ID"
                  label="Cause Id"
                  placeholder="Cause Id"
                  size="small"
                />
              </FormGrid>

              <Stack sx={{ mt: 3, height: 420 }}>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  value={emailValue}
                  onChange={(e) => setEditorEmailValue(e)}
                  style={{ height: "80%", display: "block" }}
                />
              </Stack>
            </ModalShell>
          </FormProvider>
        </Box>
      </Modal>
    </>
  );
}

export default EmailTemplate;
