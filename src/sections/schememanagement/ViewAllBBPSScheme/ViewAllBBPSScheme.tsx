import { useEffect, useState } from "react";
// @mui
import {
  Stack,
  Grid,
  Tabs,
  Tab,
  Button,
  Modal,
  Box,
  TextField,
  Pagination,
  Divider,
  Card,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Typography,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Table,
  TableCell,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { Helmet } from "react-helmet-async";
import React from "react";
import { PATH_DASHBOARD } from "src/routes/paths";

import ViewBBPSSchemeRow, {
  BbpsSchemeRow,
  bbpsTypeLabel,
} from "./ViewSchemeTable";
// page kit
import {
  PageHeader,
  DataTable,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
  PageGhostButton,
} from "src/components/page-kit";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs/CustomBreadcrumbs";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import ApiDataLoading from "../../../components/CustomFunction/CustomPagination";
import MotionModal from "src/components/animate/MotionModal";
import { Upload } from "src/components/upload";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";
import MenuPopover from "src/components/menu-popover/MenuPopover";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

export default function ViewAllBBPSScheme() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isFetchForUpload, setIsFetchForUpload] = useState(false);
  const [worker, setWorker] = useState<any>(null);
  const [headers, setHeaders] = useState<any>();
  const [csvFile, setCsvFile] = useState<any>();
  const [allScheme, setAllScheme] = useState([]);
  const [sdata, setSdata] = useState([]);
  const [description, setDescription] = useState("");
  /* ------------------------------------------------------------------
     BBPS schemes are `apiUser` only.

     The backend rejects every other schemeType with
     { code: 500, message: 'Invalid Scheme Type' }, and it dropped the six
     agent / distributor / master-distributor commission columns from the
     scheme payload, the CSV template, the download and the upload parser.
     Those fields are now IGNORED rather than rejected - so a form that still
     edited distributor commission would report success and change nothing.

     The "Distribution Network" and "Direct Agent" tabs, their sample CSVs and
     their upload option are therefore gone, and the one audience left is the
     only one the API accepts.
     ------------------------------------------------------------------ */
  const [value, setValue] = React.useState("API user");
  const [schemeId, setSchemeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvToJson, setCsvToJson] = useState([]);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [schemeDesc, setSchemeDesc] = useState("");
  const [schemeType, setSchemeType] = useState("apiuser");

  const [isLoadingList, setIsLoadingList] = useState(false);

  /* Audience behind the visible tab, and the newest plan inside it. */
  const schemeTypeForTab = "apiuser";

  const newestPlan = React.useMemo(() => {
    const newest = (sdata as any[]).reduce(
      (latest: string, row: any) =>
        row?.createdAt > latest ? row.createdAt : latest,
      ""
    );
    return newest ? new Date(newest).toLocaleDateString("en-IN") : "-";
  }, [sdata]);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  //modal for clone scheme
  const [open, setModal] = React.useState(false);
  const handleOpen = () => setModal(true);
  const handleClose = () => {
    setModal(false);
    setDescription("");
  };

  //upload scheme modal
  const [open2, setClose2] = React.useState(false);
  const handleOpen2 = () => setClose2(true);
  const handleClose2 = () => {
    setClose2(false);
    setCsvFile(null);
    setCsvToJson([]);
  };

  const [openEdit, setModalEdit] = React.useState(false);
  const openEditModal = () => setModalEdit(true);
  const handleCloseEdit = () => {
    setModalEdit(false);
    setDescription("");
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    setSdata(allScheme.filter((item: any) => item.schemeType == "apiuser"));
  };

  // useEffect(() => {
  //   getSchemeList();

  //   // Create a new web worker
  //   // const myWorker = new Worker(
  //   //   "src/sections/schememanagement/ViewAllBBPSScheme/worker.js"
  //   // );
  //   const myWorker = new Worker(new URL("./worker.js", import.meta.url), {
  //     type: "module",
  //   });

  //   console.log(myWorker);

  //   // Set up event listener for messages from the worker
  //   // myWorker.onmessage = function (event) {
  //   //   console.log("Received result from worker:", event.data);
  //   //   readUploadFile(event.data);
  //   // };

  //   myWorker.onmessage = (event) => {
  //     const { header, bodyData } = event.data;

  //     setHeaders(header);
  //     setCsvToJson(bodyData);
  //     setIsFetchForUpload(false);
  //   };
  //   // Save the worker instance to state
  //   setWorker(myWorker);

  //   // Clean up the worker when the component unmounts
  //   return () => {
  //     myWorker.terminate();
  //   };
  // }, []);

  useEffect(() => {
    getSchemeList();

    const myWorker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    myWorker.onmessage = (event) => {
      const { header, bodyData, error } = event.data;

      console.log("Worker response:", event.data);

      if (error) {
        enqueueSnackbar(error);
        setIsFetchForUpload(false);
        return;
      }

      setHeaders(header || []);
      setCsvToJson(bodyData || []);
      setIsFetchForUpload(false);
    };

    setWorker(myWorker);

    return () => {
      myWorker.terminate();
    };
  }, []);

  const handleDrop = (files: File[]) => {
    if (!files?.length) return;

    if (!worker) {
      enqueueSnackbar("Worker not ready. Please try again.");
      return;
    }

    setCsvFile(files[0]);
    setIsFetchForUpload(true);
    worker.postMessage(files);
  };

  const createScheme = () => {
    handleCloseEdit();
    navigate(PATH_DASHBOARD.scheme.AddNewbbpsScheme, {
      state: {
        schemeFor: value,
        desc: description,
      },
    });
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "4px solid #00AB55",
    boxShadow: 24,
    padding: 2,
  };
  // const readUploadFile = (event: any) => {
  //   setIsFetchForUpload(true);
  //   const file = event[0];
  //   const reader = new FileReader();
  //   const isSubset = (array1: any, array2: any) => {
  //     console.log(array1, array2);
  //     return array2.every((element: any) => array1.includes(element));
  //   };

  //   if (file.type !== "text/csv") {
  //     enqueueSnackbar("Invalid file format");
  //     return;
  //   }

  //   reader.onload = async (e: any) => {
  //     const content: any = e.target.result;
  //     const rows = content.split("\n");
  //     let Heads = [
  //       "clientRefId",
  //       "productName",
  //       "number",
  //       "amount",
  //       "transactionId",
  //       "vendorUtr",
  //       "status",
  //       "remarks",
  //     ];

  //     if (rows.length > 0) {
  //       const csvHeaders = await rows[0].split(",").map((header: any) => {
  //         return { id: header.trim(), label: header.trim() };
  //       });
  //       setHeaders(csvHeaders);

  //       const jsonData: any = [];
  //       for (let i = 1; i < rows.length; i++) {
  //         const row = rows[i].split(",");
  //         const obj: any = {};
  //         for (let j = 0; j < csvHeaders.length; j++) {
  //           obj[csvHeaders[j].label] = [
  //             "agentCommission",
  //             "distributorCommission",
  //             "masterDistributorCommission",
  //             "apiUserCommission",
  //           ].includes(csvHeaders[j].label)
  //             ? parseFloat(row[j]) + ""
  //             : row[j];
  //         }
  //         // obj.productId !== "" &&
  //         //   obj.productId !== undefined &&
  //         //   jsonData.push(obj);
  //         jsonData.push(obj);
  //       }
  //       console.log("Json Data Ankur", jsonData);
  //       setCsvToJson(jsonData);
  //       setIsFetchForUpload(false);
  //     }
  //   };
  //   reader.readAsText(file);
  // };

  const getSchemeList = () => {
    setIsLoadingList(true);
    Api(`bbpsManagement/bbpsScheme/schemes`, "GET", "", "").then(
      (Response: any) => {
        console.log("====getUser==response====>" + Response);
        if (isOk(Response)) {
          setAllScheme(Response.data.data);
          setSdata(
            Response.data.data.filter(
              (item: any) => item.schemeType == "apiuser"
            )
          );
          setIsLoadingList(false);

          console.log("====getUser==data.data sdata===>", Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const cloneScheme = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = { schemeId: schemeId, newSchemeDescription: description };
    Api(`bbpsManagement/bbpsScheme/clone_scheme`, "POST", body, token).then(
      (Response: any) => {
        console.log("====getUser==response 123456====>", Response);
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            getSchemeList();
            console.log("====getUser==data.data sdata===>", Response.data.data);
          } else {
            enqueueSnackbar(Response.data.message);
            console.log("====getUser=====>" + Response);
          }
          handleClose();
          setIsLoading(false);
        } else {
          enqueueSnackbar("Failed");
          setIsLoading(false);
        }
      }
    );
  };

  const upload = async () => {
    let token = localStorage.getItem("token");
    setIsUploadLoading(true);
    let body = {
      schemeType: schemeType,
      schemeDescription: schemeDesc,
      bbpsScheme: csvToJson,
    };
    await Api(
      "bbpsManagement/bbpsScheme/upload_bbps_Scheme",
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        handleClose2();
        getSchemeList();
        setValue("API user");
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsUploadLoading(false);
      setIsUploadLoading(false);
    });
  };

  return (
    <>
      <Helmet>
        <title> Bill Payment Plans | Shampay Admin </title>
      </Helmet>
      <PageHeader
        title="Bill Payment Plans"
        subtitle="BBPS commission plans, one catalogue per audience."
        actions={
          <PageGhostButton
            startIcon={<RefreshOutlinedIcon />}
            onClick={getSchemeList}
          >
            Refresh
          </PageGhostButton>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          label="Plans In This Catalogue"
          value={sdata.length}
          caption={value}
          icon={<ReceiptLongOutlinedIcon />}
        />
        <StatCard
          label="Total Plans"
          value={allScheme.length}
          caption="Across all three audiences"
          tone="neutral"
          icon={<CategoryOutlinedIcon />}
        />
        <StatCard
          label="Newest Plan"
          value={newestPlan}
          caption={bbpsTypeLabel(schemeTypeForTab)}
          tone="primary"
          icon={<UpdateOutlinedIcon />}
        />
      </StatGrid>

      <Card
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* Row 1: Tabs + Primary Action */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 0.5 }}>
            <Tabs
              value={value}
              onChange={handleChange}
              sx={{
                minHeight: 38,
                "& .MuiTab-root": {
                  fontSize: 13,
                  fontWeight: 500,
                  minHeight: 38,
                  px: 2,
                  borderRadius: 1.5,
                  textTransform: "none",
                  color: "#64748b",
                },
                "& .Mui-selected": { fontWeight: 700, color: "primary.main" },
                "& .MuiTabs-indicator": {
                  backgroundColor: "primary.main",
                  height: 3,
                  borderRadius: 2,
                },
              }}
            >
              <Tab value="API user" label="API user" />
            </Tabs>
          </Box>

          <Button
            size="small"
            variant="contained"
            onClick={openEditModal}
            startIcon={
              <Icon
                icon="zondicons:add-solid"
                color="white"
                style={{ fontSize: 14 }}
              />
            }
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 2,
              fontSize: 12,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 12px rgba(99,102,241,0.4)" },
            }}
          >
            Add {value} Scheme
          </Button>
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        {/* Row 2: Secondary Actions */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          gap={1}
          flexWrap="wrap"
        >
          {/* One template left. `/download_scheme_template/distribution`
              answers "Invalid Scheme Type" now, and the apiUser template lost
              its six agent/distributor/master-distributor commission columns -
              so a CSV saved before that change will not re-import. Re-download
              before every bulk upload. */}
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              window.open(
                process.env.REACT_APP_BASE_URL +
                  "bbpsManagement/bbpsScheme/download_scheme_template/apiUser",
                "_blank"
              )
            }
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 2,
              fontSize: 12,
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": { backgroundColor: "primary.lighter" },
            }}
          >
            Download Sample
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleOpen2}
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 2,
              fontSize: 12,
              borderColor: "#22c55e",
              color: "#22c55e",
              "&:hover": { backgroundColor: "#f0fdf4" },
            }}
          >
            Upload Bulk Scheme
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleOpen}
            startIcon={
              <Icon icon="zondicons:add-solid" style={{ fontSize: 14 }} />
            }
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 2,
              fontSize: 12,
              borderColor: "#8b5cf6",
              color: "#8b5cf6",
              "&:hover": { backgroundColor: "#f5f3ff" },
            }}
          >
            Clone {value} Scheme
          </Button>
        </Stack>
      </Card>
      {/* 
      <Stack
        flexDirection={{ sm: "column-reverse", md: "row" }}
        justifyContent={"space-between"}
        gap={1}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="wrapped label tabs example"
        >
          <Tab
            value="Distribution Network"
            label="Distribution Network"
            sx={{ fontSize: { xs: 14, md: 18 } }}
          />
          <Tab
            value="Direct Agent"
            label="Direct Agent"
            sx={{ fontSize: { xs: 14, md: 18 } }}
          />
          <Tab
            value="API user"
            label="API user"
            sx={{ fontSize: { xs: 14, md: 18 } }}
          />
        </Tabs>
        <Stack gap={1} flexDirection={{ xs: "column-reverse", md: "row" }}>
          <Button
            size="small"
            variant="contained"
            sx={{ whiteSpace: "nowrap" }}
            onClick={handleOpenPopover}
          >
            Download Sample for Upload
          </Button>
          <MenuPopover
            open={openPopover}
            onClose={handleClosePopover}
            arrow="left-bottom"
            sx={{ width: "fit-content" }}
          >
            <MenuItem
              onClick={() => {
                window.open(
                  process.env.REACT_APP_BASE_URL +
                    "bbpsManagement/bbpsScheme/download_scheme_template/distribution",
                  "_blank"
                );
                handleClosePopover();
              }}
            >
              Sample for Distribution Network
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open(
                  process.env.REACT_APP_BASE_URL +
                    "bbpsManagement/bbpsScheme/download_scheme_template/apiUser",
                  "_blank"
                );
                handleClosePopover();
              }}
            >
              Sample for API User
            </MenuItem>
          </MenuPopover>
          <Button
            size="small"
            variant="contained"
            sx={{ whiteSpace: "nowrap" }}
            onClick={handleOpen2}
          >
            Upload Bulk Scheme
          </Button>
          <Button
            size="small"
            variant="contained"
            sx={{ whiteSpace: "nowrap" }}
            onClick={openEditModal}
          >
            <Icon
              icon="zondicons:add-solid"
              color="white"
              style={{ marginRight: 5, fontSize: 20 }}
            />
            BBPS {value} Scheme
          </Button>
          <Button
            size="small"
            variant="contained"
            sx={{ whiteSpace: "nowrap" }}
            onClick={handleOpen}
          >
            <Icon
              icon="zondicons:add-solid"
              color="white"
              style={{ marginRight: 5, fontSize: 20 }}
            />
            Clone BBPS {value} Scheme
          </Button>
        </Stack>
      </Stack> */}
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack
            spacing={2}
            style={{ marginTop: 10, flexDirection: "column", padding: "20px" }}
          >
            <TextField
              multiline
              maxRows={6}
              name="dis"
              label="Scheme Discription"
              size="small"
              sx={{ width: { xs: "95%", md: 500 } }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              variant="contained"
              disabled={description.length < 5}
              onClick={createScheme}
            >
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>

      <MotionModal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Stack
          spacing={2}
          style={{ marginTop: 10, flexDirection: "column", padding: "20px" }}
        >
          <FormControl>
            <InputLabel id="demo-simple-select-label">Scheme Name</InputLabel>
            <Select
              label="scheme Name"
              size="small"
              value={schemeId}
              onChange={(e) => setSchemeId(e.target.value)}
            >
              {sdata.length ? (
                sdata.map((item: any) => {
                  return (
                    <MenuItem key={item._id} value={item._id}>
                      {item.schemeId}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem>Scheme Not Found</MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            multiline
            maxRows={6}
            name="dis"
            label="Scheme Discription"
            size="small"
            sx={{ width: 500 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <LoadingButton
            variant="contained"
            disabled={description.length < 5}
            onClick={cloneScheme}
            loading={isLoading}
          >
            Create Scheme Clone
          </LoadingButton>
        </Stack>
      </MotionModal>
      <MotionModal
        open={open2}
        width={{ xs: csvToJson.length ? "95%" : { xs: "95%", md: 500 } }}
      >
        {csvToJson.length ? (
          <Stack>
            <TableContainer sx={{ overflow: "unset" }}>
              <Scrollbar sx={{ maxHeight: 650 }}>
                <Table sx={{ minWidth: "95%" }} stickyHeader>
                  <TableHeadCustom headLabel={headers} />
                  <TableBody sx={{ overflow: "auto" }}>
                    {csvToJson.map((row: any) => (
                      <ProductRow key={row.id} row={row} schType={schemeType} />
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <Stack flexDirection={"row"} gap={1}>
              <LoadingButton
                variant="contained"
                sx={{ alignSelf: "end" }}
                onClick={upload}
                loading={isUploadLoading}
              >
                Upload
              </LoadingButton>
              <LoadingButton
                variant="contained"
                sx={{ alignSelf: "end" }}
                onClick={handleClose2}
              >
                Close
              </LoadingButton>
            </Stack>
          </Stack>
        ) : (
          <Stack gap={2}>
            <Select
              label="Scheme Type"
              value={schemeType}
              onChange={(e) => setSchemeType(e.target.value)}
            >
              {/* Item 3d: the distribution network scheme type is retired. */}
              <MenuItem value="apiuser">API User</MenuItem>
            </Select>
            <TextField
              label="Scheme Description"
              value={schemeDesc}
              onChange={(e) => setSchemeDesc(e.target.value)}
            />
            {schemeDesc && schemeType && (
              <>
                <Typography variant="subtitle2">
                  Choose BBPS Product Csv(comma delimated) file
                </Typography>
                {/* <Upload
                  file={csvFile}
                  onDrop={worker.postMessage}
                  onDelete={() => setCsvFile(null)}
                /> */}

                <Upload
                  file={csvFile}
                  onDrop={handleDrop}
                  onDelete={() => setCsvFile(null)}
                />
              </>
            )}
            <LoadingButton
              variant="contained"
              onClick={handleClose2}
              sx={{ alignSelf: "start" }}
              loading={isFetchForUpload}
            >
              Close
            </LoadingButton>
          </Stack>
        )}
      </MotionModal>

      {isLoadingList ? (
        <LoadingState label="Loading bill payment plans..." height={300} />
      ) : sdata.length === 0 ? (
        <EmptyState
          icon={<ReceiptLongOutlinedIcon />}
          title={`No ${value} plans`}
          description="Create a plan for this audience, or clone an existing one."
        />
      ) : (
        <DataTable
          minWidth={1040}
          columns={[
            { id: "schemeId", label: "Plan Code" },
            { id: "schType", label: "Audience" },
            { id: "schdis", label: "Description" },
            { id: "create", label: "Created" },
            { id: "action", label: "Actions", align: "center" },
          ]}
        >
          {(sdata as BbpsSchemeRow[]).map((row) => (
            <ViewBBPSSchemeRow
              key={row._id}
              row={row}
              onUpdated={getSchemeList}
            />
          ))}
        </DataTable>
      )}
    </>
  );
}

function ProductRow({ row, schType }: any) {
  console.log(schType);
  return (
    <TableRow key={row?.productId}>
      <TableCell>{row?.productId}</TableCell>
      <TableCell>{row?.subCategoryName}</TableCell>
      <TableCell>{row?.minSlab}</TableCell>
      <TableCell>{row?.maxSlab}</TableCell>
      <TableCell>{row?.activeVendorName}</TableCell>
      {schType !== "apiuser" && (
        <>
          <TableCell>{row?.agentCommissionType}</TableCell>
          <TableCell>{row?.agentCommission}</TableCell>
          <TableCell>{row?.distributorCommissionType}</TableCell>
          <TableCell>{row?.distributorCommission}</TableCell>
          <TableCell>{row?.masterDistributorCommissionType}</TableCell>
          <TableCell>{row?.masterDistributorCommission}</TableCell>
        </>
      )}
      {schType == "apiuser" && (
        <>
          <TableCell>{row?.apiUserCommissionType}</TableCell>
          <TableCell>{row?.apiUserCommission}</TableCell>
        </>
      )}
    </TableRow>
  );
}
