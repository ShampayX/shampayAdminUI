// @mui
import {
  Box,
  Stack,
  TableCell,
  CardProps,
  Typography,
  Button,
  Modal,
  MenuItem,
  TablePagination,
} from "@mui/material";
// components
import { useSnackbar } from "src/components/snackbar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// ----------------------------------------------------------------------

import { useAuthContext } from "src/auth/useAuthContext";
import {
  DataTable,
  KitRow,
  FilterBar,
  SearchField,
  StatusPill,
  ModalShell,
  PageActionButton,
  PageGhostButton,
  useDataTable,
} from "src/components/page-kit";
import EditIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";

type RowProps = {
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
  _id: string;
  IS_ACTIVE: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function EmailTemplateTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  /* instant search + sort + paging, all client-side */
  const table = useDataTable<RowProps>(tableData, {
    searchKeys: [
      "TEMPLATE_NAME",
      "TEMPLATE_ID",
      "SUBJECT",
      "SOURCE_EMAIL",
      "BUSINESS_CATEGORY",
      "EMAIL_TYPE",
    ],
    storageKey: "email-templates",
  });

  return (
    <>
      <FilterBar>
        <SearchField
          value={table.query}
          onChange={table.setQuery}
          placeholder="Search template name, id, subject or sender"
          count={table.total}
          total={table.grandTotal}
        />
      </FilterBar>

      <DataTable
        columns={tableLabels}
        isEmpty={table.isEmpty}
        emptyMessage={
          table.isFiltered
            ? `No templates match "${table.query}".`
            : "No email templates yet."
        }
        minWidth={1600}
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
        {table.paged.map((row) => (
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
// sd
function VendorRow({ row }: VendorRowProps) {
  const { Api } = useAuthContext();
  //   modal
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [isActive, setIsActive] = React.useState("");
  const [emailData, setEmailData] = React.useState({
    TEMPLATE_CONTENT: "",
    IS_ACTIVE: "",
    _id: "",
  });
  const [emailValue, setEmailValue] = useState<any>("");
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = (val: string) => {
    setOpen(true);
    setContent(val);
  };
  const handleClose = () => setOpen(false);
  // modal1
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = (val: any) => {
    setOpen1(true);
    setEmailData(val);
    setEmailValue(val.TEMPLATE_CONTENT);
    setIsActive(val.IS_ACTIVE);
  };
  const handleClose1 = () => setOpen1(false);
  const FilterSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string(),
  });

  const setEditorEmailValue = (val: any) => {
    setEmailValue(val);
  };

  type FormValuesProps = {
    subcategory: string;
    productName: string;
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

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

  const UpdateEmailTemp = () => {
    let id = emailData._id;
    const body = {
      TEMPLATE_CONTENT: emailValue,
      IS_ACTIVE: isActive,
    };
    Api(`EmailTemplate/updateEmailTemplate/` + id, "POST", body, "").then(
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

  const DeleteEmailTemp = () => {
    let token = localStorage.getItem("token");
    let id = emailData._id;
    let body = {};
    Api(`EmailTemplate/deleteEmailTemplate/` + id, "POST", body, token).then(
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
            onClick={() => handleOpen1(row)}
          >
            Edit
          </PageGhostButton>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {row.TEMPLATE_NAME}
          </Typography>
        </TableCell>
        <TableCell>{row.TEMPLATE_ID}</TableCell>
        <TableCell>{row.SUBJECT}</TableCell>
        <TableCell>{row.SOURCE_EMAIL}</TableCell>
        <TableCell>{row.BUSINESS_CATEGORY}</TableCell>
        <TableCell>{row.REPLY_TO}</TableCell>
        <TableCell>{row.MASK}</TableCell>
        <TableCell>{row.IS_TRANSACTIONAL}</TableCell>
        <TableCell>
          <StatusPill
            status={String(row.IS_ACTIVE) === "true" ? "Active" : "Inactive"}
          />
        </TableCell>
        <TableCell>{row.EMAIL_TYPE}</TableCell>
        <TableCell>{row.EMAIL_SERVICE}</TableCell>
        <TableCell>{row.CAUSE_ID}</TableCell>
        <TableCell>
          <PageGhostButton
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpen(row.TEMPLATE_CONTENT)}
          >
            View
          </PageGhostButton>
        </TableCell>
      </KitRow>

      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(UpdateEmailTemp)}
          >
            <ModalShell
              title={`Edit ${row.TEMPLATE_NAME || "template"}`}
              subtitle="Body and active state. Other fields are set at creation."
              onClose={handleClose1}
              width={900}
              actions={
                <>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={DeleteEmailTemp}
                    sx={{
                      px: 2,
                      height: 42,
                      borderRadius: 1.5,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    Delete
                  </Button>
                  <PageActionButton type="submit">
                    Update Template
                  </PageActionButton>
                </>
              }
            >
              <Stack sx={{ height: 420 }}>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  value={emailValue}
                  onChange={(e) => setEditorEmailValue(e)}
                  style={{ height: "80%", display: "block" }}
                />
              </Stack>
              <Stack sx={{ mt: 2 }}>
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
                  <MenuItem value="true">TRUE</MenuItem>
                  <MenuItem value="false">FALSE</MenuItem>
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
            subtitle="Markup stripped - this is the plain text the recipient reads."
            onClose={handleClose}
            width={720}
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
    </>
  );
}
