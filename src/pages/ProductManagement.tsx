import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
// @mui
import { Stack, Tabs, Tab, Modal } from "@mui/material";
// components
import { useSettingsContext } from "../components/settings";
import { Box, CardProps, Typography } from "@mui/material";
import Iconify from "src/components/iconify";
import React from "react";
import ViewProduct from "../sections/productmanagement/ViewProduct";
import AddNewProduct from "../sections/productmanagement/AddNewProduct";
import { LoadingButton } from "@mui/lab";
import { Upload } from "src/components/upload";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";

import MotionModal from "src/components/animate/MotionModal";
import { useAuthContext } from "src/auth/useAuthContext";
// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type RowProps = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  commType: string;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function ProductManagement() {
  const { Api, UploadFileApi } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();
  const [open, setModal] = React.useState(false);
  const openModal = () => setModal(true);
  const handleClose = () => setModal(false);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box style={{ padding: "24px 0" }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const [valueTabs, setvalueTabs] = React.useState(0);
  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };

  const [isLoading, setIsLoading] = useState<any>(false);
  const [csvFile, setCsvFile] = useState<any>();
  const [successCsvFile, setSuccessCsvFile] = useState("upload");
  const [csvFilePath, setCsvFilePath] = useState<any>("");

  const AFhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessCsvFile("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setCsvFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  const UploadCsv = () => {
    setSuccessCsvFile("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("productCsv", csvFile);
    formData.append("directoryName", "productCsv");
    UploadFileApi(`bbps/updateBbpsProductCSV`, formData, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setCsvFilePath(Response.data.filePath);
            setSuccessCsvFile("success");
            handleClose();
          } else {
            setSuccessCsvFile("upload");
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessCsvFile("upload");
        }
      }
    );
  };

  return (
    <>
      <Stack
        flexDirection={{ xs: "column-reverse", md: "row" }}
        justifyContent={"space-between"}
      >
        <Tabs
          value={valueTabs}
          onChange={handleChangePanels}
          aria-label="basic tabs example"
        >
          <Tab
            label={
              <Typography variant="subtitle1">
                {" "}
                <Iconify
                  icon={"eva:plus-fill"}
                  style={{ marginRight: "5px" }}
                />{" "}
                Add New Products
              </Typography>
            }
            {...a11yProps(0)}
          />
          <Tab
            label={
              <Typography variant="subtitle1">
                <Iconify icon={"eva:eye-fill"} style={{ marginRight: "5px" }} />{" "}
                View All Products
              </Typography>
            }
            {...a11yProps(1)}
          />
        </Tabs>
        <Stack flexDirection={"row"} gap={1}>
          <LoadingButton variant="contained" size="small" onClick={openModal}>
            Upload Products
          </LoadingButton>
          <LoadingButton
            variant="contained"
            size="small"
            loading={isLoading}
            onClick={() =>
              window.open(
                process.env.REACT_APP_BASE_URL + "bbps/downloadBbpsProducts"
              )
            }
          >
            Download Products
          </LoadingButton>
        </Stack>
      </Stack>

      <TabPanel value={valueTabs} index={0}>
        <AddNewProduct />
      </TabPanel>
      <TabPanel value={valueTabs} index={1}>
        <ViewProduct />
      </TabPanel>

      <MotionModal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Stack>
          <p>Choose Product Csv(comma delimated) file</p>
          <Upload
            file={csvFile}
            onDrop={AFhandleDropSingleFile}
            onDelete={() => setCsvFile(null)}
          />
          {csvFile && (
            <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
              {successCsvFile == "upload" ? (
                <LoadingButton
                  variant="contained"
                  component="span"
                  onClick={() => successCsvFile == "upload" && UploadCsv()}
                >
                  Upload File
                </LoadingButton>
              ) : successCsvFile == "wait" ? (
                <LoadingButton variant="contained" loading component="span">
                  success
                </LoadingButton>
              ) : (
                <Icon
                  icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                  color="green"
                  fontSize={40}
                  style={{ marginRight: 15 }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </MotionModal>
    </>
  );
}
