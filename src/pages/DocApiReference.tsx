import { useEffect, useState } from "react";
//ReactQuill
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
// @mui
import {
  Card,
  Stack,
  Grid,
  Tabs,
  Button,
  Tab,
  TextField,
  Modal,
  Box,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
// sections
import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useAuthContext } from "src/auth/useAuthContext";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  category: string;
  question: string;
  answer: string;
};

export default function DocApiReference() {
  const { Api } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState("active");
  const [apiDocData, setApiDocData] = useState<any>([]);
  const [tabBody, setTabBody] = useState("");
  const [tabHead, setTabHead] = useState("");
  const [tabId, setTabId] = useState("");

  // modal for add api reference
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // modal for edit api reference
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = (val: any) => {
    setOpen1(true);
    setTabHead(val.tabName);
    setTabBody(val.tabContent);
    setTabId(val._id);
  };
  const handleClose1 = () => setOpen1(false);

  const FilterSchema = Yup.object().shape({
    category: Yup.string().required(),
    question: Yup.string().required(),
    answer: Yup.string().required(),
  });

  const defaultValues = {
    category: "",
    question: "",
    answer: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      ["link", "image"], //link and image
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const quillConfig = {
    toolbar: false, // Disable the toolbar
  };

  useEffect(() => {
    getAPIDocumentation();
  }, []);

  const getAPIDocumentation = () => {
    Api(`admin/get_APIDocumentation`, "GET", "", "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setApiDocData(Response.data.data);
          setCurrentTab(Response.data.data[0].tabName);
        } else {
        }
      }
    });
  };

  const addReference = () => {
    let body = {
      tabName: tabHead,
      tabContent: tabBody,
    };
    Api(`admin/add_APIDocumentation`, "POST", body, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setApiDocData([
              ...apiDocData,
              { tabName: tabHead, tabContent: tabBody },
            ]);
            handleClose();
          } else {
          }
        }
      }
    );
  };

  const updateReference = () => {
    let body = {
      tabName: tabHead,
      tabContent: tabBody,
    };
    Api(`admin/update_APIDocumentaion/${tabId}`, "POST", body, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 400) {
            handleClose1();
            let updated: any = apiDocData.map((item: any) => {
              if (item._id === tabId) {
                return { ...item, tabName: tabHead, tabContent: tabBody };
              }
              return item;
            });

            setApiDocData(updated);
          } else {
          }
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Reference | Shampay Admin</title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Stack justifyContent={"right"} flexDirection={"row"}>
          <Button variant="contained" sx={{ m: 1 }} onClick={handleOpen}>
            Add New Reference
          </Button>
        </Stack>
        <Tabs
          value={currentTab}
          aria-label="basic tabs example"
          sx={{ background: "#F4F6F8" }}
          onChange={(event, newValue) => setCurrentTab(newValue)}
        >
          {apiDocData.map((tab: any) => (
            <Tab
              key={tab._id}
              sx={{ mx: 3 }}
              label={tab.tabName}
              value={tab.tabName}
            />
          ))}
        </Tabs>
      </Box>
      <Box m={2}>
        <Card sx={{ p: 2 }}>
          {apiDocData.map((item: any) => {
            if (currentTab == item.tabName)
              return (
                <>
                  <Stack flexDirection={"row"} justifyContent={"end"}>
                    <Button
                      variant="contained"
                      onClick={() => handleOpen1(item)}
                    >
                      Edit
                    </Button>
                  </Stack>
                  <Stack my={2}>
                    <ReactQuill
                      modules={quillConfig}
                      value={item.tabContent}
                      style={{ height: "fit-content", display: "block" }}
                    />
                  </Stack>
                </>
              );
          })}
        </Card>
      </Box>

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
            p: 4,
            width: {
              sm: "100%",
              md: "50%",
            },
          }}
        >
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            <TextField
              name="Tabname"
              label="Tab Name"
              placeholder="Tab Name"
              value={tabHead}
              onChange={(e) => setTabHead(e.target.value)}
            />
            <Stack my={2} height={"500px"}>
              <ReactQuill
                modules={modules}
                theme="snow"
                value={tabBody}
                onChange={(e) => setTabBody(e)}
                style={{ height: "80%", display: "block" }}
              />
            </Stack>
            <Button
              sx={{ margin: "auto" }}
              size="large"
              type="submit"
              variant="contained"
              onClick={addReference}
            >
              Add API Reference
            </Button>
          </Grid>
        </Box>
      </Modal>

      <Modal
        open={open1}
        onClose={handleClose1}
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
            p: 4,
            width: {
              sm: "100%",
              md: "50%",
            },
          }}
        >
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            <TextField
              name="Tabname"
              label="Tab Name"
              placeholder="Tab Name"
              value={tabHead}
              onChange={(e) => setTabHead(e.target.value)}
            />
            <Stack my={2} height={"500px"}>
              <ReactQuill
                modules={modules}
                theme="snow"
                value={tabBody}
                onChange={(e) => setTabBody(e)}
                style={{ height: "80%", display: "block" }}
              />
            </Stack>
            <Button
              sx={{ margin: "auto" }}
              size="large"
              onClick={updateReference}
              variant="contained"
            >
              Update API Reference
            </Button>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
