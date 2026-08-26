// @mui
import {
  Box,
  Stack,
  TableCell,
  CardProps,
  Typography,
  Modal,
  MenuItem,
  TextField,
} from "@mui/material";

// components
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { useSnackbar } from "src/components/snackbar";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  DataTable,
  KitRow,
  FilterBar,
  SearchField,
  StatusPill,
  CopyText,
  ModalShell,
  PageActionButton,
  PageGhostButton,
  useDataTable,
} from "src/components/page-kit";
import EditIcon from "@mui/icons-material/EditOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
// ----------------------------------------------------------------------

type RowProps = {
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
  Subject: string;
  Email: string;
  Header_Name: string;
  Reference_message: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function SmsTemplateTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  /* Search + sort only: the list itself is paged by the server, so the hook
     works on the page that is already loaded. */
  const table = useDataTable<any>(tableData, {
    searchKeys: [
      "Title",
      "Subtitle",
      "SLUG",
      "For",
      "Template_Name",
      "Template_ID",
    ],
  });

  return (
    <>
      <FilterBar>
        <SearchField
          value={table.query}
          onChange={table.setQuery}
          placeholder="Search this page by title, slug or template id"
          count={table.total}
          total={table.grandTotal}
        />
      </FilterBar>

      <DataTable
        columns={tableLabels}
        isEmpty={table.isEmpty}
        emptyMessage={
          table.isFiltered
            ? `No templates on this page match "${table.query}".`
            : "No SMS templates yet."
        }
        minWidth={1500}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
      >
        {table.results.map((row: any) => (
          <VendorRow key={row._id} row={row} />
        ))}
      </DataTable>
    </>
  );
}

// ----------------------------------------------------------------------

type VendorRowProps = {
  row: RowProps;
};

type FormValuesProps = {
  subcategory: string;
  productName: string;
};

function VendorRow({ row }: VendorRowProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [opensms, setOpensms] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [contentEmail, setContentEmail] = React.useState<any>([]);
  const [contentsms, setContentsms] = React.useState<any>([]);
  const [isActive, setIsActive] = React.useState("");
  const [subject, SetSubject] = useState("");
  const [operatorID, setOperratorID] = React.useState("");
  const [smsData, setSmsData] = React.useState({
    TEMPLATE_CONTENT: "",
    STATUS: "",
    _id: "",
  });
  const [smsValue, setSmsValue] = useState<any>("");
  const [subValue, setsubValue] = useState<any>("");
  const handleOpen3 = (val: any) => {
    setOpen1(true);

    setSmsValue(val.Message);
  };

  const handleOpen2 = (val: any) => {
    setOpen2(true);
    setContentEmail(val);
  };

  const handleOpensms = (val: any) => {
    setOpensms(true);
    setContentsms(val);
  };

  const handleClose = () => setOpen(false);
  const handleClose2 = () => setOpen2(false);
  const handleClosesms = () => setOpensms(false);
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = (val: any) => {
    setOpen1(true);
    setContentEmail(val);
    setSmsValue(val.Email);
    setIsActive(val.STATUS);
    setsubValue(val?.Subject);
    setOperratorID(val?._id);
  };

  const setEditorSmsValue = (val: any) => {
    setSmsValue(val);
  };
  const setEditorSubValue = (val: any) => {
    setsubValue(val);
  };

  const handleClose1 = () => setOpen1(false);
  const FilterSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string(),
  });

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

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const UpdateSmsTemp = (data: FormValuesProps) => {
    const body = {
      Email: smsValue,
      Subject: subject,
      IS_ACTIVE: Boolean(isActive),
    };
    Api(`SMSTemplate/updateSMSTemplate/` + operatorID, "POST", body, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          enqueueSnackbar(Response.data.message);
          handleClose1();
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    );
  };

  const DeleteSmsTemp = () => {
    let token = localStorage.getItem("token");
    let id = smsData._id;
    let body = {};
    Api(`SMSTemplate/deleteSMSTemplate/` + id, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          enqueueSnackbar(Response.data.message);
          handleClose1();
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    );
  };

  return (
    <>
      <KitRow>
        {/* Action first, matching the kit convention */}
        <TableCell>
          <PageGhostButton
            startIcon={<EditIcon />}
            disabled={!row.Email}
            onClick={() => handleOpen1(row)}
          >
            Edit
          </PageGhostButton>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {row.Title}
          </Typography>
        </TableCell>
        <TableCell>{row.Subtitle}</TableCell>
        <TableCell>{row.SLUG}</TableCell>
        <TableCell>{row.For}</TableCell>
        <TableCell>{row.Template_Name}</TableCell>
        <TableCell>{row.Lenth}</TableCell>
        <TableCell>
          <StatusPill status={row.Status} />
        </TableCell>
        <TableCell>
          <CopyText value={row.Template_ID} />
        </TableCell>
        <TableCell>{row.VAR_1}</TableCell>
        <TableCell>{row.VAR_2}</TableCell>
        <TableCell>{row.Header_Name}</TableCell>
        <TableCell>
          <PageGhostButton
            startIcon={<MailOutlineIcon />}
            disabled={!row.Email}
            onClick={() => handleOpen2(row)}
          >
            Email
          </PageGhostButton>
        </TableCell>
        <TableCell>
          <PageGhostButton
            startIcon={<VisibilityIcon />}
            disabled={!row?.Reference_message}
            onClick={() => handleOpensms(row)}
          >
            View
          </PageGhostButton>
        </TableCell>
      </KitRow>

      <Modal
        open={open1}
        // onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(UpdateSmsTemp)}
          >
            <ModalShell
              title={`Edit ${row.Title || "template"}`}
              subtitle="Email subject, body and active state."
              onClose={handleClose1}
              width={860}
              actions={
                <>
                  <PageGhostButton onClick={handleClose1}>Close</PageGhostButton>
                  <PageActionButton type="submit">
                    Update Template
                  </PageActionButton>
                </>
              }
            >
              <Stack spacing={2.5}>
                <Stack>
                  <Typography
                    sx={{ mb: 1, fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}
                  >
                    SUBJECT
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    value={subValue}
                    rows={2}
                    variant="outlined"
                    size="small"
                    onChange={(e) => SetSubject(e.target.value)}
                  />
                </Stack>

                <Stack sx={{ height: 340 }}>
                  <Typography
                    sx={{ mb: 1, fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}
                  >
                    EMAIL BODY
                  </Typography>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    value={smsValue}
                    onChange={(e) => setEditorSmsValue(e)}
                    style={{ height: "230px", display: "block" }}
                  />
                </Stack>

                <RHFSelect
                  type="text"
                  name="IS_ACTIVE"
                  label="Active"
                  placeholder="Active"
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem value="ACTIVE">TRUE</MenuItem>
                  <MenuItem value="DEACTIVE">FALSE</MenuItem>
                </RHFSelect>
              </Stack>
            </ModalShell>
          </FormProvider>
        </Box>
      </Modal>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <ModalShell
            title="Template content"
            onClose={handleClose}
            width={640}
            actions={
              <PageGhostButton onClick={handleClose}>Close</PageGhostButton>
            }
          >
            <Typography sx={{ fontSize: 15, whiteSpace: "pre-wrap" }}>
              {content.replace(/<[^>]+>/g, "")}
            </Typography>
          </ModalShell>
        </Box>
      </Modal>

      <Modal
        open={open2}
        onClose={handleClose2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <ModalShell
            title="Email preview"
            subtitle={contentEmail?.Subject}
            onClose={handleClose2}
            width={860}
            actions={
              <PageGhostButton onClick={handleClose2}>Close</PageGhostButton>
            }
          >
            <Typography sx={{ fontSize: 14.5, whiteSpace: "pre-wrap" }}>
              {contentEmail?.Email}
            </Typography>
          </ModalShell>
        </Box>
      </Modal>

      <Modal
        open={opensms}
        onClose={handleClosesms}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <ModalShell
            title="Reference message"
            subtitle="The approved copy this template was registered with."
            onClose={handleClosesms}
            width={720}
            actions={
              <PageGhostButton onClick={handleClosesms}>Close</PageGhostButton>
            }
          >
            <Typography sx={{ fontSize: 14.5, whiteSpace: "pre-wrap" }}>
              {contentsms?.Reference_message}
            </Typography>
          </ModalShell>
        </Box>
      </Modal>
    </>
  );
}
