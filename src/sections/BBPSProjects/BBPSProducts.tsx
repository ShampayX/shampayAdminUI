import React, { useCallback, useState } from "react";
import { Box, Modal, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Upload } from "src/components/upload";

import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import BBPSProductTable from "./BBPSProductTable";
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  ModalShell,
} from "src/components/page-kit";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

function BBPSProducts() {
  const { Api, UploadFileApi } = useAuthContext();
  const [open, setModal] = React.useState(false);
  const openModal = () => setModal(true);
  const handleClose = () => setModal(false);
  const [isLoading, setIsLoading] = React.useState<any>(false);
  const [jsonFile, setJsonFile] = useState<any>();
  const [successJsonFile, setSuccessJsonFile] = useState("upload");
  const [jsonFilePath, setJsonFilePath] = useState<any>("");
  const { enqueueSnackbar } = useSnackbar();

  const UploadJson = () => {
    setSuccessJsonFile("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("productjson", JSON.stringify(jsonFile));
    formData.append("directoryName", "productjson");
    UploadFileApi(`bbps/updateBbpsProductCSV`, formData, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setJsonFilePath(Response.data.filePath);
            setSuccessJsonFile("success");
            handleClose();
          } else {
            setSuccessJsonFile("upload");
            enqueueSnackbar(Response.data.message);
          }
        } else {
          enqueueSnackbar("file must be less than 1mb", { variant: "error" });
          setSuccessJsonFile("upload");
        }
      }
    );
  };

  const AFhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessJsonFile("upload");
    const csvFile = acceptedFiles[0];
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const csvData = event.target.result;
        const jsonArray = csvToJson(csvData);
        setJsonFile(jsonArray);
      };
      reader.readAsText(csvFile);
    }
  }, []);

  const csvToJson = (csvData: string) => {
    const lines = csvData.split("\n");
    if (lines.length < 2) {
      console.error("Invalid CSV format: CSV should have at least two lines.");
      return [];
    }

    const headers = lines[0].split(",").map((header) => header?.trim());
    const jsonArray = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length !== headers.length) {
        console.warn(
          `Skipping line ${i + 1}: Number of columns does not match headers.`
        );
        continue;
      }
      const entry: any = {};
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = values[j]?.trim();
      }
      jsonArray.push(entry);
    }
    return jsonArray;
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Biller products and the operator ids each downstream provider knows them by."
        actions={
          <>
            <PageGhostButton
              startIcon={<UploadFileOutlinedIcon />}
              onClick={openModal}
            >
              Upload products
            </PageGhostButton>

            <PageActionButton
              startIcon={<FileDownloadOutlinedIcon />}
              disabled={isLoading}
              onClick={() =>
                window.open(
                  process.env.REACT_APP_BASE_URL + "bbps/downloadBbpsProducts"
                )
              }
            >
              Download products
            </PageActionButton>
          </>
        }
      />

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <ModalShell
            title="Upload products"
            subtitle="A comma-delimited CSV. The first row must be the column headers."
            width={520}
            onClose={handleClose}
          >
            <Upload
              file={jsonFile}
              onDrop={AFhandleDropSingleFile}
              onDelete={() => setJsonFile(null)}
            />

            {jsonFile && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 2 }}
              >
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {Array.isArray(jsonFile)
                    ? jsonFile.length + " rows parsed"
                    : "File ready"}
                </Typography>

                {successJsonFile === "upload" ? (
                  <LoadingButton variant="contained" onClick={UploadJson}>
                    Upload file
                  </LoadingButton>
                ) : successJsonFile === "wait" ? (
                  <LoadingButton variant="contained" loading>
                    Uploading
                  </LoadingButton>
                ) : (
                  <Icon
                    icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                    color="green"
                    fontSize={32}
                  />
                )}
              </Stack>
            )}
          </ModalShell>
        </Box>
      </Modal>
      <BBPSProductTable />
    </>
  );
}

export default BBPSProducts;
