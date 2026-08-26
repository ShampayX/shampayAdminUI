import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { Stack, Box, Typography, Modal } from "@mui/material";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import { useSnackbar } from "src/components/snackbar";
import SmsTemplateTable from "./SmsTemplateTable";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
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
  Title: string;
  Template_ID: string;
  Subtitle: string;
  SLUG: string;
  For: string;
  Template_Name: string;
  Message: string;
  Lenth: number;
  Status: string;
  VAR_1: string;
  VAR_2: string;
  VAR_3: string;
  VAR_4: string;
  Subject: string;
  Email: string;
  Reference_message: string;
  Header_Name: string;
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
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

function SmsTemplate() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [Email, setEmail] = useState("");
  const [smsValue, setSmsValue] = useState("");
  const [templateList, setTemplateList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [Loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [open1, setOpen1] = React.useState(false);
  const [pageCount, setPageCount] = React.useState<any>(0);
  const [pageSize, setPageSize] = React.useState<any>(10);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);

  const [open2, setOpen2] = React.useState(false);

  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  const setEditorEmailValue = (val: any) => {
    setEmail(val);
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
    GetSmsTemp();
  }, [currentPage]);

  const style = {
    position: "absolute" as "absolute",
    top: "135%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "200px",
    bgcolor: "background.paper",
    border: "2px solid #D3D3D3 ",
    boxShadow: 4,
    // padding: '10px 32px',
    overflow: "auto",
    marginTop: "-40px",
  };

  const addSmsTemp = (data: FormValuesProps) => {
    const body = {
      Title: data.Title,
      Template_ID: data.Template_ID,
      Subtitle: data.Subtitle,
      SLUG: data.SLUG,
      For: data.For,
      Template_Name: data.Template_Name,
      Message: data.Message,
      Lenth: data.Lenth,
      Status: data.Status,
      VAR_1: data.VAR_1,
      VAR_2: data.VAR_2,
      VAR_3: data.VAR_3,
      VAR_4: data.VAR_4,
      Subject: data.Subject,
      Email: Email,
      Reference_message: data.Reference_message,
    };
    Api(`SMSTemplate/addSMSTemplate`, "POST", body, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          enqueueSnackbar(Response.data.message);
          handleClose1();
        } else {
        }
      }
    );
  };

  // /SMSTemplate/getSMSTemplate?pageSize=20&currentPage=1
  const GetSmsTemp = () => {
    Api(
      `SMSTemplate/getSMSTemplate?pageSize=${pageSize}&currentPage=${currentPage}`,
      "GET",
      "",
      ""
    ).then((Response: any) => {
      if (Response?.status == 200) {
        enqueueSnackbar(Response.data.message);
        setTemplateList(Response.data.SMSTemplate);

        setPageCount(Response.data.count);
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
      <PageHeader
        title="Email / SMS Templates"
        subtitle="Message copy, DLT template ids and the variables each one expects."
        actions={
          <>
            <PageGhostButton startIcon={<RefreshIcon />} onClick={GetSmsTemp}>
              Refresh
            </PageGhostButton>
            <PageActionButton startIcon={<AddIcon />} onClick={handleOpen1}>
              Add SMS Template
            </PageActionButton>
          </>
        }
      />

      <Box>
        <SmsTemplateTable
          tableData={templateList}
          /* order matches the cells in SmsTemplateTable exactly - the old
             header had Template_Name sitting over the Subtitle column */
          tableLabels={[
            { id: "edit", label: "Action" },
            { id: "Title", label: "Title", sortKey: "Title" },
            { id: "Subtitle", label: "Subtitle", sortKey: "Subtitle" },
            { id: "SLUG", label: "Slug", sortKey: "SLUG" },
            { id: "For", label: "For", sortKey: "For" },
            {
              id: "Template_Name",
              label: "Template Name",
              sortKey: "Template_Name",
            },
            { id: "Lenth", label: "Length", sortKey: "Lenth" },
            { id: "Status", label: "Status", sortKey: "Status" },
            { id: "Template_ID", label: "Template Id", sortKey: "Template_ID" },
            { id: "VAR_1", label: "Var 1" },
            { id: "VAR_2", label: "Var 2" },
            { id: "Header_Name", label: "Header Name" },
            { id: "Email", label: "Email" },
            { id: "Reference_message", label: "Reference" },
          ]}
        />
        {!Loading && (
          <CustomPagination
            page={currentPage - 1}
            count={pageCount}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              setCurrentPage(newPage + 1);
            }}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              setPageSize(parseInt(event.target.value));
              setCurrentPage(1);
            }}
          />
        )}
      </Box>
      <Modal
        open={open1}
        // onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <FormProvider methods={methods} onSubmit={handleSubmit(addSmsTemp)}>
            <ModalShell
              title="Add SMS Template"
              subtitle="DLT details, the variables it expects and an optional email body."
              onClose={handleClose1}
              width={980}
              actions={
                <>
                  <PageGhostButton onClick={handleClose1}>Close</PageGhostButton>
                  <PageActionButton type="submit">Add Template</PageActionButton>
                </>
              }
            >
              <FormGrid columns={3}>
                <RHFTextField
                  type="text"
                  name="Title"
                  label="Title"
                  size="small"
                  placeholder="Title"
                />
                <RHFTextField
                  type="text"
                  name="Template_ID"
                  label="Template Id"
                  size="small"
                  placeholder="Template Id"
                />
                <RHFTextField
                  type="text"
                  name="Subtitle"
                  label="Subtitle"
                  size="small"
                  placeholder="Subtitle"
                />
                <RHFTextField
                  type="text"
                  name="SLUG"
                  label="Slug"
                  size="small"
                  placeholder="Slug"
                />
                <RHFTextField
                  type="text"
                  name="Template_Name"
                  label="Template Name"
                  size="small"
                  placeholder="Template Name"
                />
                <RHFTextField
                  type="text"
                  name="For"
                  label="For"
                  size="small"
                  placeholder="For"
                />
                <RHFTextField
                  type="text"
                  name="Message"
                  label="Message"
                  size="small"
                  placeholder="Message"
                />
                <RHFTextField
                  type="text"
                  name="Lenth"
                  label="Length"
                  size="small"
                  placeholder="Length"
                />
                <RHFTextField
                  type="text"
                  name="Status"
                  label="Status"
                  size="small"
                  placeholder="Status"
                />
                <RHFTextField
                  type="text"
                  name="VAR_1"
                  label="Var 1"
                  size="small"
                  placeholder="Var 1"
                />{" "}
                <RHFTextField
                  type="text"
                  name="VAR_2"
                  label="Var 2"
                  size="small"
                  placeholder="Var 2"
                />
                <RHFTextField
                  type="text"
                  name="VAR_3"
                  label="Var 3"
                  size="small"
                  placeholder="Var 3"
                />
                <RHFTextField
                  type="text"
                  name="VAR_4"
                  label="Var 4"
                  size="small"
                  placeholder="Var 4"
                />
                <RHFTextField
                  type="text"
                  name="Subject"
                  label=" Email Subject"
                  size="small"
                  placeholder="Subject"
                />
                <RHFTextField
                  type="text"
                  name="Reference_message"
                  label="Reference Message"
                  size="small"
                  placeholder="Reference Message"
                />
                {/* <RHFTextField type="text" name="Email" label="Email" placeholder="Email" /> */}
              </FormGrid>

              <Stack sx={{ mt: 3 }}>
                <Typography
                  sx={{ mb: 1, fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}
                >
                  EMAIL BODY
                </Typography>
                <Stack sx={{ height: 340 }}>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    value={Email}
                    onChange={(e) => setEditorEmailValue(e)}
                    style={{ height: "280px" }}
                  />
                </Stack>
              </Stack>
            </ModalShell>
          </FormProvider>
        </Box>
      </Modal>
      {/* <Pagination
        sx={{ display: "flex", justifyContent: "center" }}
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

export default SmsTemplate;
