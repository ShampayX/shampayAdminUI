import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  MenuItem,
  Modal,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { InvoiceTableRow } from "../sections/BBPSmanagement/BBPSlist";
import { PATH_DASHBOARD } from "src/routes/paths";
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  getComparator,
  useTable,
} from "src/components/table";
import { sumBy } from "lodash";
import { _invoices } from "src/_mock/arrays";
import { fTimestamp } from "src/utils/formatTime";
import { IInvoice } from "src/@types/invoice";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs/CustomBreadcrumbs";
import Iconify from "src/components/iconify/Iconify";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import InvoiceAnalytic from "../sections/BBPSmanagement/BBPSlist/InvoiceAnalytic";
import Label from "../components/label";

import { Upload } from "src/components/upload";
import MenuPopover from "../components/menu-popover";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import CustomPagination from "src/components/CustomFunction/CustomPagination";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  KitTabs,
  StatCard,
  StatGrid,
  EmptyState,
  TableSkeleton,
  StatGridSkeleton,
} from "src/components/page-kit";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";

const TABLE_HEAD = [
  { id: "Date", label: "Date", align: "left" },
  { id: "ClientRefId", label: "ClientRefId", align: "left" },
  { id: "ProductName", label: "Product Name", align: "left" },
  { id: "MobileNumber", label: "Mobile Number", align: "center" },
  { id: "DueDate", label: "Due date", align: "left" },
  { id: "number", label: "Number", align: "left" },
  { id: "param1", label: "param1", align: "left" },
  { id: "param2", label: "param2", align: "left" },
  { id: "param3", label: "param3", align: "left" },
  { id: "param4", label: "param4", align: "left" },
  { id: "AMount", label: "Amount", align: "left" },
  { id: "Status", label: "Status", align: "left" },
];

function BBPSmanagement() {
  const { Api } = useAuthContext();

  const theme = useTheme();
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: "createDate" });

  const { enqueueSnackbar } = useSnackbar();

  let token = localStorage.getItem("token");

  const [tableData, setTableData] = useState<any>([]);

  const [filterName, setFilterName] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");

  const [filterService, setFilterService] = useState("all");

  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const [xlPreview, setXlPreview] = useState([]);
  const [labelHead, setLabelHead] = useState([]);
  const [error, setError] = useState("");

  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const [csvFile, setCsvFile] = useState<any>();
  const [successCsvFile, setSuccessCsvFile] = useState("upload");
  const [csvFilePath, setCsvFilePath] = useState<any>("");

  const [open, setModal] = React.useState(false);
  const openModal = () => setModal(true);
  const handleClose = () => {
    setXlPreview([]);
    setError("");
    setModal(false);
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const getLengthByStatus = (status: string) =>
    tableData.filter((item: any) => item.status === status).length;

  const getTotalPriceByStatus = (status: string) =>
    sumBy(
      tableData.filter((item: any) => item.status === status),
      "amount"
    );

  const getPercentByStatus = (status: string) =>
    (getLengthByStatus(status) / tableData.length) * 100;

  const TABS = [
    { value: "all", label: "All", color: "info", count: tableData.length },
    {
      value: "initiated",
      label: "Initiated",
      color: "success",
      count: getLengthByStatus("initiated"),
    },
    {
      value: "in_process",
      label: "in_process",
      color: "warning",
      count: getLengthByStatus("in_process"),
    },
    {
      value: "pending",
      label: "Pending",
      color: "error",
      count: getLengthByStatus("pending"),
    },
  ] as const;

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleFilterStatus = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    console.log("newValue", newValue);
    setPage(0);
    setFilterStatus(newValue);
  };

  //preview and check validation in csv file

  const readUploadFile = (event: any) => {
    const file = event[0];
    const reader = new FileReader();
    const isSubset = (array1: any, array2: any) => {
      console.log(array1, array2);
      return array2.every((element: any) => array1.includes(element));
    };

    reader.onload = async (e: any) => {
      const content: any = e.target.result;
      const rows = content.split("\n");
      let Heads = [
        "clientRefId",
        "productName",
        "number",
        "amount",
        "transactionId",
        "vendorUtr",
        "status",
        "remarks",
      ];
      let status = ["success", "failed", "pending"];

      if (rows.length > 0) {
        const csvHeaders = rows[0].split(",").map((header: any) => {
          return { id: header.trim(), label: header.trim() };
        });
        setLabelHead(csvHeaders);

        const jsonData: any = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(",");
          const obj: any = {};
          for (let j = 0; j < csvHeaders.length; j++) {
            obj[csvHeaders[j].label] = row[j];
          }
          if (obj.status !== undefined) jsonData.push(obj);
        }
        console.log(jsonData);
        setXlPreview(jsonData);

        //check file limit for 250 line Items
        if (jsonData?.length > 250) {
          setError(
            "Limit exceed. Please select 250 line Items in a single upload."
          );

          return;
        }
        //check headers in csv
        if (
          !(await csvHeaders.every((element: any) =>
            Heads.includes(element.label)
          ))
        ) {
          setError("Please Check Headers in CSV");

          return;
        }

        //check client Ref Id in csv
        if (await jsonData.some((element: any) => element.clientRefId == "")) {
          setError("Empty clientRefId not accepted");

          return;
        }

        //check Transaction Id in csv
        if (
          await jsonData.some((element: any) => element.transactionId == "")
        ) {
          setError("Empty TransactionId not accepted");

          return;
        }

        //check status in csv
        if (
          !(await jsonData.every((element: any) =>
            status.includes(element.status)
          ))
        ) {
          setError("Please Check Status Field");

          return;
        }

        // check transactionId (not empty neither duplicate)
        var valueArr1 = await jsonData.map(function (item: any, index: number) {
          return item.clientRefId;
        });
        var isDuplicate = await valueArr1.some(function (item: any, idx: any) {
          return valueArr1.indexOf(item) != idx;
        });
        if (isDuplicate) {
          setError("Duplicate ClientRefID Found ! Please check");

          return;
        }

        //check clientRefId
        (await isSubset(
          tableData.map((item: any) => item.clientRefId),
          jsonData
            .filter((item: any) => item.clientRefId !== "")
            .map((item1: any) => item1.clientRefId)
        ))
          ? setXlPreview(jsonData)
          : setError("clientRefId Not found for mapping");
      }
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    BBPSdata();
  }, []);

  const BBPSdata = () => {
    Api("bbpsManagement/offline_transactions", "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setTableData(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const handleDownload = (filtedVal: string) => {
    window.open(
      process.env.REACT_APP_BASE_URL +
        `bbpsManagement/download_offline_transactions?status=${filtedVal}`
    );
    window.location.reload();
    handleClosePopover();
  };

  const upload = async () => {
    setIsUploadLoading(true);
    let body = {
      transactionToUpdate: xlPreview,
    };
    await fetchLocation();
    await Api(
      "bbpsManagement/update_offline_transaction_status",
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (isOk(Response)) {
        notifyOk(enqueueSnackbar, Response, "Offline transactions updated.");
        BBPSdata();
        handleClose();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsUploadLoading(false);
    });
  };

  return (
    <React.Fragment>
      <PageHeader
        title="Bill Payments"
        subtitle="Offline BBPS transactions - upload a status file, review what is still open, and export by state."
        actions={
          <>
            <PageGhostButton
              startIcon={<DescriptionOutlinedIcon />}
              onClick={() =>
                window.open(
                  process.env.REACT_APP_BASE_URL +
                    "bbpsManagement/download_template_to_update_offline_transaction_status"
                )
              }
            >
              Template
            </PageGhostButton>

            <PageGhostButton
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleOpenPopover}
            >
              Download
            </PageGhostButton>

            <PageActionButton
              startIcon={<UploadFileOutlinedIcon />}
              onClick={openModal}
            >
              Upload statuses
            </PageActionButton>
          </>
        }
      />
      {/* <Stack flexDirection={{ xs: "column", md: "row" }}>
        <CustomBreadcrumbs
          heading="BBPS Management"
          links={[
            {
              name: "BBPS Offline",
              href: "",
            },
          ]}
          action={""}
        />
        <Stack flexDirection={"row"} gap={1}>
          <LoadingButton
            variant="contained"
            onClick={() =>
              window.open(
                process.env.REACT_APP_BASE_URL +
                  "bbpsManagement/download_template_to_update_offline_transaction_status"
              )
            }
          >
            Sample for Upload
          </LoadingButton>
          <LoadingButton variant="contained" onClick={openModal}>
            Upload
          </LoadingButton>
          <LoadingButton variant="contained" onClick={handleOpenPopover}>
            Download
          </LoadingButton>
        </Stack>
      </Stack> */}

      {/* Real counts, same helpers as before - the old strip was the generic
          invoice-template analytic band, four coloured icons on a scrolling
          rail that said nothing about bill payments. */}
      <StatGrid>
        <StatCard
          label="Total Transactions"
          value={tableData.length}
          caption={"Rs." + sumBy(tableData, "amount").toLocaleString("en-IN")}
          icon={<ReceiptLongOutlinedIcon />}
        />
        <StatCard
          label="Initiated"
          value={getLengthByStatus("initiated")}
          caption={getPercentByStatus("initiated") + "% of records"}
          tone="success"
          icon={<PlayCircleOutlineOutlinedIcon />}
        />
        <StatCard
          label="In Process"
          value={getLengthByStatus("in_process")}
          caption={getPercentByStatus("in_process") + "% of records"}
          tone="warning"
          icon={<HourglassEmptyOutlinedIcon />}
        />
        <StatCard
          label="Pending"
          value={getLengthByStatus("pending")}
          caption={getPercentByStatus("pending") + "% of records"}
          tone={getLengthByStatus("pending") > 0 ? "error" : "neutral"}
          icon={<PendingActionsOutlinedIcon />}
        />
      </StatGrid>

      <KitTabs value={filterStatus} onChange={handleFilterStatus}>
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label + " (" + tab.count + ")"}
          />
        ))}
      </KitTabs>

      <Card
        sx={{
          borderRadius: 2,
          border: (t) => "1px solid " + t.palette.divider,
          boxShadow: "none",
        }}
      >
        <TableContainer
          sx={{ position: "relative", overflow: "unset", mb: 10 }}
        >
          <TableSelectedAction
            dense={dense}
            numSelected={selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) =>
              onSelectAllRows(
                checked,
                tableData.map((row: any) => row?.id)
              )
            }
            /* Sent / Download / Print were rendered with no onClick at all -
               three buttons that did nothing when clicked. Only Delete was
               ever wired, so it is the only one kept. */
            action={
              <Tooltip title="Delete">
                <IconButton color="error" onClick={handleOpenConfirm}>
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table size={dense ? "small" : "medium"} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={selected.length}
                // onSort={onSort}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    tableData.map((row: any) => row?.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <InvoiceTableRow key={row.id} row={row} />
                  ))}

                <TableNoData isNotFound={isNotFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <CustomPagination
          page={page}
          count={dataFiltered.length}
          onPageChange={onChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      </Card>

      {/* for filter download csv */}
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem onClick={() => handleDownload("initiated")}>
          <Iconify icon="eva:download-fill" />
          Initiated
        </MenuItem>

        <MenuItem onClick={() => handleDownload("in_process")}>
          <Iconify icon="uit:process" />
          In Process
        </MenuItem>

        <MenuItem onClick={() => handleDownload("pending")}>
          <Iconify icon="mdi:receipt-text-pending" />
          Pending
        </MenuItem>
      </MenuPopover>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {error ? (
          <Box
            sx={style}
            width={{ xs: "100%", sm: xlPreview.length ? "90%" : 450 }}
          >
            <Stack justifyContent={"center"} gap={4}>
              <Iconify
                icon="bxs:error"
                width={60}
                alignSelf={"center"}
                sx={{ color: "#fc0" }}
              />
              <Typography
                variant="h5"
                color="text.disabled"
                textAlign={"center"}
              >
                {error}
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={style}
            width={{ xs: "100%", sm: xlPreview.length ? "90%" : 450 }}
          >
            <Stack>
              {xlPreview?.length ? (
                <Stack>
                  <TableContainer sx={{ overflow: "unset" }}>
                    <Scrollbar sx={{ maxHeight: 500 }}>
                      <Table sx={{ minWidth: 720 }}>
                        <TableHeadCustom headLabel={labelHead} />
                        <TableBody sx={{ overflow: "auto" }}>
                          {xlPreview.map((row: any) => (
                            <ProductRow key={row.id} row={row} />
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                  <LoadingButton
                    variant="contained"
                    sx={{ alignSelf: "end" }}
                    onClick={upload}
                    loading={isUploadLoading}
                  >
                    Upload
                  </LoadingButton>
                </Stack>
              ) : (
                <Stack>
                  <Typography variant="subtitle2">
                    Choose BBPS Product Csv(comma delimated) file
                  </Typography>
                  <Upload
                    file={csvFile}
                    onDrop={readUploadFile}
                    onDelete={() => setCsvFile(null)}
                  />
                </Stack>
              )}
            </Stack>
          </Box>
        )}
      </Modal>
    </React.Fragment>
  );
}

export default BBPSmanagement;

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}: {
  inputData: IInvoice[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStatus: string;
  filterService: string;
  filterStartDate: Date | null;
  filterEndDate: Date | null;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber
          .toLowerCase()
          .indexOf(filterName.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name
          .toLowerCase()
          .indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== "all") {
    inputData = inputData.filter((invoice) => invoice.status === filterStatus);
  }

  if (filterService !== "all") {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((c: any) => c.service === filterService)
    );
  }

  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (invoice) =>
        fTimestamp(invoice.createDate) >= fTimestamp(filterStartDate) &&
        fTimestamp(invoice.createDate) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}

function ProductRow({ row }: any) {
  return (
    <TableRow key={row?.clientRefId}>
      <TableCell>{row?.clientRefId}</TableCell>
      <TableCell>{row?.productName}</TableCell>
      <TableCell>{row?.number}</TableCell>
      <TableCell>{row?.amount}</TableCell>
      <TableCell>{row?.transactionId}</TableCell>
      <TableCell>{row?.vendorUtr}</TableCell>
      <TableCell>{row?.status}</TableCell>
      <TableCell>{row?.remarks}</TableCell>
    </TableRow>
  );
}
