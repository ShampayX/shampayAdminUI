// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  Button,
  styled,
  Zoom,
  Typography,
  TableHead,
  TableContainer,
  Modal,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Select,
  tableCellClasses,
  Icon,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import Image from "../../components/image";

import demoImage from "../../assets/images/Delete-file-icon (1).png";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import React, { useEffect, useState } from "react";

import { useTheme } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { fDate, fDateTime } from "src/utils/formatTime";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { fIndianCurrency } from "src/utils/formatNumber";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import Iconify from "src/components/iconify";
import { useAuthContext } from "src/auth/useAuthContext";
import { ToWords } from "to-words";
import { StatusPill } from "src/components/page-kit";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

type RowProps = {
  amount: string;
  userName: string;
  role: string;
  mobile: string;
  modeName: string;
  bank_name: string;
  date_of_deposit: string;
  Branch: string;
  transactionSlip: string;
  Charge: string;
  Commission: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
  tab: any;
  sendDataToParent: any;
  updtatedData: any;
  // avgAmount?: number | null;
}

export default function FundRequestTable({
  title,
  subheader,
  tableData,
  tableLabels,
  sendDataToParent,
  updtatedData,
  tab,
  // avgAmount,
  ...other
}: Props) {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {tableData.map((row: any) => (
          <Grid item xs={12} md={6} key={row._id}>
            <FundRequestTablleRow
              row={row}
              tab={tab}
              sendDataToParent={sendDataToParent}
              updtatedData={updtatedData}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  // return (
  //   <Card {...other}>
  //     <TableContainer sx={{ overflow: "unset" }}>
  //       <Scrollbar sx={{ scrollbarWidth: "thin" }}>
  //         <Table>
  //           <TableHeadCustom headLabel={tableLabels} />

  //           <TableBody>
  //             {tableData.map((row: any) => {
  //               return (
  //                 <FundRequestTablleRow
  //                   key={row._id}
  //                   row={row}
  //                   tab={tab}
  //                   sendDataToParent={sendDataToParent}
  //                   updtatedData={updtatedData}
  //                   // avgAmount={avgAmount} // <-- add this
  //                 />
  //               );
  //             })}
  //           </TableBody>
  //         </Table>
  //       </Scrollbar>
  //     </TableContainer>
  //   </Card>
  // );
}

// ----------------------------------------------------------------------

type FundRequestTableRowProps = {
  row: any;
  sendDataToParent: any;
  updtatedData: any;
  tab: any;
};

function FundRequestTablleRow({
  row,
  sendDataToParent,
  updtatedData,
  tab,
}: FundRequestTableRowProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const [openHold, setOpenHold] = React.useState(false);
  const handleCloseHold = () => setOpenHold(false);
  const handleClose = () => setOpen(false);
  const [rowId, setRowId] = React.useState("");
  const [userData, setUserData] = useState<any>([]);
  const [amountData, setAmountData] = useState<any>([]);
  const [transactionId, setTransaction] = useState<any>([]);
  const [verifyLoding, setVerifyLoading] = useState(false);
  const [RequestApprove, setRequestApprove] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
  };

  const [holdReq, setHoldReqId] = useState("");
  const [approval, setApproval] = useState("");
  const [remark, setRemark] = useState(false);
  const [reason, setReason] = useState(false);
  const [reasonData, setReasonData] = useState("");
  const [isContinueEnabled, setContinueEnabled] = useState(false);
  const [isModalOpen, setModalOpen2] = useState(false);
  const towords = new ToWords();

  const handleChange = (e: any) => {
    setApproval(e.target.value);

    if (e.target.value === "reject") {
      setRequestApprove("");
    } else if (e.target.value === "approve") {
      setReasonData("");
    }
  };

  const handleContinueClick = () => {
    setModalOpen2(true);
  };

  const handleCloseModal = () => {
    setModalOpen2(false);
  };

  const handleRemarkChange = (e: any) => {
    setRequestApprove(e.target.value);
    setContinueEnabled(!!e.target.value || !!reasonData);
  };

  const handleReasonChange = (e: any) => {
    setReasonData(e.target.value);
    setContinueEnabled(!!remark || !!e.target.value);
  };

  const theme = useTheme();
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      padding: 6,
    },
  }));
  // const theme = useTheme();

  const PRIMARY_LIGHT = theme.palette.primary.main;

  const handleOpen = (val: any) => {
    let token = localStorage.getItem("token");

    setTransaction(val._id);

    Api(
      `admin/fundManagement/get_fund_requests/` + val._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log("======RejectedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setUserData(Response.data.data);

          setOpen(true);
          enqueueSnackbar(Response.data.message);
          console.log("======RejectedList===data.data udata====>", Response);
        } else {
          console.log("======RejectedList==Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
    Api(
      `admin/fundManagement/get_fund_requests_by_amount/` + val.Amount,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log("======RejectedList==User==response=====>" + Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setAmountData(Response.data.data);

          // setOpen(true);
          enqueueSnackbar(Response.data.message);
          console.log("======RejectedList===data.data udata====>", Response);
        } else {
          console.log("======RejectedList==Error======>" + Response);
          enqueueSnackbar(Response.data.responseMessage);
        }
      }
    });
  };

  const HoldRequest = (val: any) => {
    setOpenHold(true);
    setHoldReqId(val?._id);
  };

  const ApprovHoldReq = () => {
    setOpenHold(false);
    let token = localStorage.getItem("token");
    let body = {};

    console.log("nfsdlkfasdfklsdaklf", holdReq);

    Api(
      `admin/autoCollect/settleHoldTransction/${holdReq}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======RejectedList==User==response=====>" + Response);
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message);
        console.log("======RejectedList===data.data udata====>", Response);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const action = (val: any) => {
    setVerifyLoading(true);
    if (val.toLowerCase() == "rejected") {
      setReason(true);
    } else {
      setRemark(true);
    }
    let body = {
      status: val,
      comment: val == "Approved" ? RequestApprove : reasonData,
      userCode: "Admin",
      nPin: "",
    };
    Api(
      "admin/fundManagement/action_fund_requests/" + rowId,
      "POST",
      body,
      ""
    ).then((Response: any) => {
      console.log("==========>>product Filter", Response);
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          // enqueueSnackbar(Response.data.message, {
          //   variant: "error",
          //   content: (key) => (
          //     <div
          //       key={key}
          //       style={{
          //         display: "flex",
          //         alignItems: "center",
          //         backgroundColor: "#fdecea", // Light red background
          //         color: "#d32f2f", // Material error color
          //         padding: "8px 16px",
          //         borderRadius: 4,
          //         fontSize: 14,
          //       }}
          //     >
          //       <CancelIcon style={{ marginRight: 8, color: "#d32f2f" }} />
          //       {Response.data.message}
          //     </div>
          //   ),
          // });
          handleClose();
          sendDataToParent(rowId, val);
          updtatedData(val);
          setRemark(false);
          setReason(false);
          handleCloseModal();
          setVerifyLoading(false);

          console.log("=====product filter code 200", Response.data.data);
        } else {
          console.log("==============>>> post mobile number", Response.massage);
          enqueueSnackbar(Response.data.responseMessage);
          setRemark(false);
          setReason(false);
          setVerifyLoading(false);
        }
      } else {
        setRemark(false);
        setReason(false);
        setVerifyLoading(false);
      }
    });
  };

  const { copy } = useCopyToClipboard();

  // const onCopy = (text: string) => {
  //   if (text) {
  //     enqueueSnackbar("Copied!");
  //     copy(text);
  //   }
  // };

  const onCopy = (text: string) => {
    if (text) {
      // Log the text to debug
      console.log("Copy function called with text:", text);

      // Ensure no duplicate values in the text
      const sanitizedText = text.replace(/\((.*?)\)/g, "").trim();

      enqueueSnackbar("Copied!");
      copy(sanitizedText);
    }
  };

  const parseNumericAmount = (val: any) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    const cleaned = String(val).replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  // Determine numeric amount for this row (prefer Amount then amount)
  const numericAmount = parseNumericAmount(row.Amount ?? row.amount ?? 0);

  // Use per-row avg sent by backend (could be number or string). Null if not present.
  const rowAvg: number | null =
    row?.avg_amount != null ? Number(row.avg_amount) : null;

  // determine highlight:
  // prefer backend boolean if present; else compare with rowAvg
  const highlight =
    typeof row.isMoreThanAvg === "boolean"
      ? row.isMoreThanAvg
      : rowAvg !== null
      ? numericAmount > rowAvg
      : false;
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[200],
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return (
    <>
      <Card
        onClick={() => setRowId(row._id)}
        sx={{
          borderRadius: 3,
          border: highlight ? "1px solid #fbbf24" : "1px solid #f1f5f9",
          boxShadow: highlight
            ? "0 2px 12px rgba(251,191,36,0.2)"
            : "0 2px 12px rgba(0,0,0,0.06)",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
          transition: "box-shadow 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1,
            background: highlight
              ? "linear-gradient(135deg, #fffbeb, #fef3c7)"
              : "linear-gradient(135deg, #f8faff, #f5f3ff)",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                FRID:
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e" }}
              >
                {row?.fund_request_Id || "—"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>•</Typography>
              <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                {fDateTime(row?.date)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.8} alignItems="center">
              {highlight && (
                <Chip
                  size="small"
                  label="> avg"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    bgcolor: "warning.light",
                    fontWeight: 600,
                  }}
                />
              )}
              <StatusPill status={row?.status} />
            </Stack>
          </Stack>
        </Box>

        <Box p={2}>
          {/* Row 1: Amount + User */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#f8faff",
                borderRadius: 2,
                p: 1.2,
                border: "1px solid #e0e7ff",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "primary.dark",
                  lineHeight: 1.3,
                }}
              >
                ₹{numericAmount.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8" }}>
                {towords.convert(Number(row.Amount))}
              </Typography>
              {row.avg_amount != null && (
                <Typography sx={{ fontSize: 10, color: "#94a3b8" }}>
                  Avg: ₹
                  {parseNumericAmount(row.avg_amount).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 }
                  )}
                </Typography>
              )}
            </Box>

            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                User
              </Typography>
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}
                noWrap
              >
                {row["user Name"] || "—"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#64748b" }} noWrap>
                {row["company_name"]}
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.3}>
                <Chip
                  label={row?.role}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: 9,
                    backgroundColor: "primary.lighter",
                    color: "primary.dark",
                    fontWeight: 600,
                  }}
                />
                {row?.userCode && (
                  <Chip
                    label={row?.userCode}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: 9,
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Box>

          {/* Row 2: Deposit Date + Updated Date */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Deposit Date
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
              >
                {fDate(row?.depositDate) || "—"}
              </Typography>
            </Box>
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Updated Date
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
              >
                {fDateTime(row?.actionDate) || "—"}
              </Typography>
            </Box>
          </Box>

          {/* Row 3: Mobile + Mode */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Mobile
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
              >
                {row["Mobile Number"] || "—"}
              </Typography>
            </Box>
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Mode
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
              >
                {row["Mode of Payment"] || "—"}
              </Typography>
            </Box>
          </Box>

          {/* Row 4: Bank + Branch */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Bank
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
                noWrap
              >
                {row["Bank Name"]}{" "}
                {row["Account number"] &&
                  `(...${row["Account number"]?.slice(-4)})`}
              </Typography>
            </Box>
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Branch
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
              >
                {row?.Branch || "—"}
              </Typography>
            </Box>
          </Box>

          {/* Row 5: UTR + Charge/Remark */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                UTR
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography
                  sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
                  noWrap
                >
                  {row?.trxId || "—"}
                </Typography>
                {row?.trxId && (
                  <IconButton
                    size="small"
                    sx={{ p: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(`${row?.trxId}`);
                    }}
                  >
                    <Iconify icon="eva:copy-fill" width={12} />
                  </IconButton>
                )}
              </Stack>
            </Box>

            <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 1.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {row?.status?.toLowerCase() === "pending"
                  ? row.Charge === "NA"
                    ? "Commission"
                    : "Charge"
                  : "Remark"}
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: "#334155" }}
              >
                {row?.status?.toLowerCase() === "pending"
                  ? row.Charge === "NA"
                    ? fIndianCurrency(row.Commission || "0")
                    : row.Charge
                  : row.remark || "—"}
              </Typography>
            </Box>
          </Box>

          {/* Approved comment */}
          {row?.status?.toLowerCase() === "approved" && row?.comments && (
            <Box
              sx={{
                backgroundColor: "#f0fdf4",
                borderRadius: 2,
                p: 1,
                mb: 1.5,
                border: "1px solid #bbf7d0",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#22c55e",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Admin Remark
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#166534" }}>
                {row?.comments}
              </Typography>
            </Box>
          )}

          {/* Rejected reason */}
          {row?.status?.toLowerCase() === "rejected" && row?.comments && (
            <Box
              sx={{
                backgroundColor: "#fef2f2",
                borderRadius: 2,
                p: 1,
                mb: 1.5,
                border: "1px solid #fecaca",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#ef4444",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Rejection Reason
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#991b1b" }}>
                {row?.comments}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          {row?.status === "Pending" && (
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen(row);
              }}
              sx={{
                borderRadius: 1.5,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                color: "#fff",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: "none",
                "&:hover": {
                  background: (theme) => theme.palette.primary.dark,
                  boxShadow: "0 4px 12px rgba(4,120,87,0.35)",
                },
              }}
            >
              View Request
            </Button>
          )}

          {row?.status === "Hold" && (
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                HoldRequest(row);
              }}
              sx={{
                borderRadius: 2,
                fontSize: 11,
                backgroundColor: "#f97316",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#ea580c" },
              }}
            >
              Stalemate
            </Button>
          )}
        </Box>
      </Card>

      {/* Slip Modal - exactly as original */}
      <Modal
        open={modalOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "50%" },
            maxHeight: "90%",
            bgcolor: "#ffffff",
            boxShadow: 24,
            p: 4,
            borderRadius: "20px",
            overflow: "scroll",
          }}
        >
          <Scrollbar>
            {row?.[""] ? (
              <Image alt="My Image" src={AwsDocSign(row[""])} />
            ) : (
              <Typography
                sx={{
                  textAlign: "center",
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                No Slip Uploaded.
              </Typography>
            )}
          </Scrollbar>
          <Stack>
            <Button
              onClick={() => setModalOpen(false)}
              variant="contained"
              sx={{ alignSelf: "flex-end", mt: 2 }}
            >
              Close
            </Button>
          </Stack>
        </Grid>
      </Modal>

      {/* View Request Modal - exactly as original */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 4,
            p: 4,
            borderRadius: "20px",
          }}
          width={{ sm: "95%", md: "90%", lg: "60%", xl: "70%" }}
        >
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gap={2}
            sx={{
              backgroundColor: PRIMARY_LIGHT,
              width: 1,
              borderRadius: "10px",
            }}
          >
            <Box gridColumn="span 4">
              <Stack color="white" ml={4} mt={1}>
                <Typography style={{ fontWeight: "bold" }}>
                  Date&Time:
                </Typography>
                <Typography variant="caption">{fDateTime(row.date)}</Typography>
              </Stack>
            </Box>
            <Box gridColumn="span 4">
              <Stack color="white" mt={1}>
                <Typography style={{ fontWeight: "bold" }}>UTR:</Typography>
                <Typography variant="caption">
                  {userData.transactional_details?.trxId}
                </Typography>
              </Stack>
            </Box>
            <Box gridColumn="span 4">
              <Stack color="white" mt={1}>
                <Typography style={{ fontWeight: "bold" }}>Amount:</Typography>
                <Typography variant="caption">
                  {fIndianCurrency(userData.amount)}
                </Typography>
              </Stack>
            </Box>
            <Box gridColumn="span 4">
              <Stack color="white" ml={4} mb={1}>
                <Typography style={{ fontWeight: "bold" }}>
                  Deposit Bank:
                </Typography>
                <Typography variant="caption">
                  {userData?.bankId?.bank_details?.bank_name}
                </Typography>
              </Stack>
            </Box>
            <Box gridColumn="span 4">
              <Stack color="white" mb={1}>
                <Typography noWrap style={{ fontWeight: "bold" }}>
                  Reference ID:
                </Typography>
                <Typography variant="caption">
                  {userData.request_from?.Id?.userCode}
                </Typography>
              </Stack>
            </Box>
            <Box gridColumn="span 4" mb={1}>
              <Stack color="white">
                <Typography noWrap style={{ fontWeight: "bold" }}>
                  Deposit Branch:
                </Typography>
                <Typography variant="caption">
                  {userData?.bankId?.bank_details?.branch_name}
                </Typography>
              </Stack>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 300 }}>
            <Table style={{ borderRadius: "10px", marginBottom: "2px" }}>
              <TableHead>
                <TableRow sx={{ marginBottom: "4" }}>
                  <TableCell align="center" colSpan={7}>
                    <Typography variant="h4" style={{ color: "#333" }}>
                      Other Trasaction with similar amount
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User Details</TableCell>
                  <TableCell>UTR</TableCell>
                  <TableCell>Mode of Payment</TableCell>
                  <TableCell>Deposite Bank</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {amountData?.slice(0, 10)?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{fDateTime(user.date)}</TableCell>
                    <TableCell>
                      {user["user Name"]} {user.role}
                    </TableCell>
                    <TableCell>{user["Reference ID"]}</TableCell>
                    <TableCell>{user["Mode of Payment"]}</TableCell>
                    <TableCell>{user["Bank Name"]}</TableCell>
                    <TableCell>{user.Amount}</TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={
                          (user?.status === "Rejected" && "error") ||
                          ((user?.status === "Pending" ||
                            user?.status === "Approved") &&
                            "warning") ||
                          "success"
                        }
                        sx={{ textTransform: "capitalize" }}
                      >
                        {user?.status ? sentenceCase(user?.status) : ""}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6">You want to?</Typography>
          <RadioGroup
            aria-label="approval"
            name="approval"
            value={approval}
            onChange={handleChange}
            row
          >
            <FormControlLabel
              value="approve"
              control={<Radio color="primary" />}
              label="Approve"
              labelPlacement="end"
            />
            <FormControlLabel
              value="reject"
              control={<Radio color="primary" />}
              label="Reject"
              labelPlacement="end"
            />
          </RadioGroup>

          {approval === "approve" && (
            <TextField
              label="Remark"
              value={RequestApprove}
              onChange={handleRemarkChange}
              sx={{ width: "40%" }}
              margin="normal"
              size="small"
            />
          )}

          {approval === "reject" && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="demo-simple-select-label">Reason</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={reasonData}
                label="Reason"
                onChange={handleReasonChange}
                size="small"
                sx={{ width: "40%" }}
              >
                <MenuItem value={"Amount not Credited"}>
                  Amount not Credited
                </MenuItem>
                <MenuItem value={"Wrong Bank Selection"}>
                  Wrong Bank Selection
                </MenuItem>
                <MenuItem
                  value={"Invalid Transaction ID/ Bank Reference Number"}
                >
                  Invalid Transaction ID/ Bank Reference Number
                </MenuItem>
                <MenuItem value={"Duplicate Request"}>
                  Duplicate Request
                </MenuItem>
                <MenuItem value={"Currently not clearing Advances"}>
                  Currently not clearing Advances
                </MenuItem>
                <MenuItem value={"Wrong Amount Entered"}>
                  Wrong Amount Entered
                </MenuItem>
                <MenuItem value={"Incorrect deposit date"}>
                  Incorrect deposit date
                </MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleContinueClick}
            disabled={
              !(
                (approval == "approve" && RequestApprove) ||
                (approval == "reject" && reasonData)
              )
            }
          >
            Continue
          </Button>

          <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Grid
              sx={{
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "#ffffff",
                boxShadow: 24,
                p: 4,
                borderRadius: "20px",
              }}
              width={{ sm: "90%", md: "50%" }}
            >
              <Stack
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  marginBottom: "2px",
                }}
              >
                <Box sx={{ width: 1 }}>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={2}
                  >
                    <Box gridColumn="span 4">
                      <Stack ml={4}>
                        <Typography style={{ fontWeight: "bold" }}>
                          Date&Time:
                        </Typography>
                        <Typography variant="caption">
                          {fDateTime(row.date)}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box gridColumn="span 4">
                      <Stack>
                        <Typography style={{ fontWeight: "bold" }}>
                          UTR:
                        </Typography>
                        <Typography variant="caption">
                          {userData.transactional_details?.trxId}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box gridColumn="span 4">
                      <Stack>
                        <Typography style={{ fontWeight: "bold" }}>
                          Amount:
                        </Typography>
                        <Typography variant="caption">
                          {fIndianCurrency(userData.amount)}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box gridColumn="span 4">
                      <Stack ml={4}>
                        <Typography style={{ fontWeight: "bold" }}>
                          Deposit Bank:
                        </Typography>
                        <Typography variant="caption">
                          {userData?.bankId?.bank_details?.bank_name}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box gridColumn="span 4">
                      <Stack>
                        <Typography style={{ fontWeight: "bold" }}>
                          Reference ID:
                        </Typography>
                        <Typography variant="caption">
                          {userData.request_from?.Id?.userCode}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box gridColumn="span 4">
                      <Stack>
                        <Typography style={{ fontWeight: "bold" }}>
                          Deposit Branch:
                        </Typography>
                        <Typography variant="caption">
                          {userData?.bankId?.bank_details?.branch_name}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
                <LoadingButton
                  loading={verifyLoding}
                  variant="contained"
                  onClick={() =>
                    action(approval == "approve" ? "Approved" : "Rejected")
                  }
                >
                  sumbit
                </LoadingButton>
              </Stack>
            </Grid>
          </Modal>
        </Grid>
      </Modal>

      {/* Hold Dialog - exactly as original */}
      <Dialog fullWidth maxWidth="xs" open={openHold}>
        <DialogContent>
          <Stack direction="row" p={4}>
            <Typography variant="h4">
              Please Confirm to Approve Request
            </Typography>
          </Stack>
        </DialogContent>
        <Stack flexDirection="row" gap={2} p={1}>
          <Button variant="contained" onClick={ApprovHoldReq}>
            Approve
          </Button>
          <Button variant="contained" onClick={handleCloseHold}>
            Close
          </Button>
        </Stack>
      </Dialog>
    </>
  );
  // return (
  //   <>
  //     <StyledTableRow
  //       sx={{ borderBottom: "1px solid #00000012" }}
  //       onClick={() => setRowId(row._id)}
  //     >
  //       <Stack direction="row" alignItems="center">
  //         {/* <Avatar alt={row.name} src={row.avatar} /> */}

  //         <Box>
  //           <TableCell>
  //             <Stack direction="row" gap={1}>
  //               <Typography variant="subtitle2" noWrap>
  //                 Created Date:
  //               </Typography>
  //               <Typography variant="body2" noWrap>
  //                 {" "}
  //                 {fDateTime(row?.date)}
  //               </Typography>
  //             </Stack>
  //             <Stack direction="row" gap={1}>
  //               <Typography variant="subtitle2">Deposit Date:</Typography>
  //               <Typography variant="body2">
  //                 {" "}
  //                 {fDate(row?.depositDate)}
  //               </Typography>
  //             </Stack>
  //             <Stack direction="row" gap={1}>
  //               <Typography variant="subtitle2">Updated Date:</Typography>
  //               <Typography variant="body2">
  //                 {" "}
  //                 {fDateTime(row?.actionDate)}
  //               </Typography>
  //             </Stack>

  //             <Stack direction="row">
  //               <Typography variant="subtitle2">FRID: </Typography>
  //               <Typography variant="body2"> {row?.fund_request_Id}</Typography>
  //             </Stack>
  //           </TableCell>
  //         </Box>
  //       </Stack>
  //       <TableCell>
  //         <TableCell sx={{ fontWeight: "bold", fontSize: 20 }}>
  //           <Box display="flex" alignItems="center" gap={1}>
  //             {numericAmount.toLocaleString()}
  //             {highlight && (
  //               <Chip
  //                 size="small"
  //                 label="> avg"
  //                 sx={{ bgcolor: "warning.light", fontWeight: 600 }}
  //               />
  //             )}
  //           </Box>

  //           {/* show avg under amount if available */}
  //           {row.avg_amount != null && (
  //             <Typography
  //               variant="caption"
  //               color="text.secondary"
  //               display="block"
  //             >
  //               Avg: ₹{" "}
  //               {parseNumericAmount(row.avg_amount).toLocaleString(undefined, {
  //                 maximumFractionDigits: 2,
  //               })}
  //             </Typography>
  //           )}
  //         </TableCell>
  //         <Stack direction="row" alignItems="center">
  //           <Box sx={{ ml: 2 }}>
  //             <Typography noWrap>
  //               {" "}
  //               <Typography variant="subtitle2">{row["user Name"]}</Typography>
  //               <Typography variant="subtitle2">
  //                 {row["company_name"]}
  //               </Typography>
  //               <Typography variant="caption" display="block" gutterBottom>
  //                 {" "}
  //                 {row?.role} ({row?.userCode ? row?.userCode : "--"})
  //               </Typography>
  //             </Typography>
  //           </Box>
  //         </Stack>
  //       </TableCell>
  //       <TableCell sx={{ fontWeight: "bold", fontSize: 20 }}>
  //         {Number(row.Amount).toLocaleString()}
  //         <Typography
  //           style={{
  //             width: 120,
  //             fontWeight: "Bold",
  //             fontSize: 15,
  //             color: "black",
  //           }}
  //         >
  //           {towords.convert(Number(row.Amount))}
  //         </Typography>
  //       </TableCell>

  //       <TableCell>{row["Mobile Number"]}</TableCell>
  //       <TableCell>{row["Mode of Payment"]}</TableCell>
  //       <TableCell>
  //         <Typography noWrap>
  //           {row["Bank Name"]} ({row["Account number"].slice(-4)})
  //         </Typography>
  //       </TableCell>
  //       <TableCell>{row?.Branch}</TableCell>
  //       <TableCell>
  //         {row?.trxId ? row?.trxId : "---"}

  //         <IconButton onClick={() => onCopy(`${row?.trxId}(${row?.trxId})`)}>
  //           <Iconify icon="eva:copy-fill" width={20} />
  //         </IconButton>
  //       </TableCell>

  //       {row.status.toLowerCase() === "pending" && (
  //         <TableCell>
  //           {row.Charge == "NA"
  //             ? "Commission: " + fIndianCurrency(row.Commission || "0")
  //             : "Charge: " + row.Charge}
  //         </TableCell>
  //       )}

  //       {/* <TableCell>
  //         <img
  //           src={AwsDocSign(row?.[""]) || demoImage}
  //           alt="Receipt Logo"
  //           onClick={openModal}
  //           height={40}
  //           width={40}
  //           style={{
  //             borderRadius: "5px",
  //           }}
  //         />
  //       </TableCell> */}
  //       <TableCell>{row.remark}</TableCell>
  //       {row.status.toLowerCase() === "approved" && (
  //         <TableCell>{row?.comments}</TableCell>
  //       )}
  //       <Modal
  //         open={modalOpen}
  //         aria-labelledby="modal-modal-title"
  //         aria-describedby="modal-modal-description"
  //       >
  //         <Grid
  //           sx={{
  //             position: "absolute",
  //             top: "50%",
  //             left: "50%",
  //             transform: "translate(-50%, -50%)",
  //             width: { xs: "95%", md: "50%" },
  //             maxHeight: "90%",
  //             bgcolor: "#ffffff",
  //             boxShadow: 24,
  //             p: 4,
  //             borderRadius: "20px",
  //             overflow: "scroll",
  //           }}
  //         >
  //           <Scrollbar>
  //             {row?.[""] ? (
  //               <Image
  //                 alt="My Image"
  //                 src={AwsDocSign(row[""])}
  //                 // sx={{
  //                 //   objectFit: "contain",
  //                 // }}
  //               />
  //             ) : (
  //               <Typography
  //                 sx={{
  //                   textAlign: "center",
  //                   alignItems: "center",
  //                   display: "flex",
  //                   justifyContent: "center",
  //                   flex: 1,
  //                 }}
  //               >
  //                 No Slip Uploaded.
  //               </Typography>
  //             )}
  //           </Scrollbar>

  //           <Stack>
  //             <Button
  //               onClick={() => setModalOpen(false)}
  //               variant="contained"
  //               sx={{
  //                 alignSelf: "flex-end",
  //                 mt: 2,
  //               }}
  //             >
  //               Close
  //             </Button>
  //           </Stack>
  //         </Grid>
  //       </Modal>

  //       {row.status == "Pending" ? (
  //         <TableCell>
  //           <Button
  //             variant="contained"
  //             size="small"
  //             onClick={() => handleOpen(row)}
  //             sx={{ whiteSpace: "nowrap" }}
  //           >
  //             View Request
  //           </Button>
  //         </TableCell>
  //       ) : row.status == "Hold" ? (
  //         <TableCell>
  //           <Button
  //             variant="contained"
  //             size="small"
  //             onClick={() => HoldRequest(row)}
  //             sx={{ whiteSpace: "nowrap" }}
  //           >
  //             Stalemate
  //           </Button>
  //         </TableCell>
  //       ) : row.status.toLowerCase() == "rejected" ? (
  //         <TableCell>
  //           <Typography variant="subtitle2">{row?.comments}</Typography>
  //         </TableCell>
  //       ) : null}
  //     </StyledTableRow>

  //     <Modal
  //       open={open}
  //       onClose={handleClose}
  //       aria-labelledby="modal-modal-title"
  //       aria-describedby="modal-modal-description"
  //     >
  //       <Grid
  //         sx={{
  //           position: "absolute" as "absolute",
  //           top: "50%",
  //           left: "50%",
  //           transform: "translate(-50%, -50%)",
  //           bgcolor: "#ffffff",
  //           boxShadow: 4,
  //           p: 4,

  //           borderRadius: "20px",
  //         }}
  //         width={{
  //           sm: "95%",
  //           md: "90%",
  //           lg: "60%",
  //           xl: "70%",
  //         }}
  //       >
  //         {
  //           <>
  //             <Box
  //               display="grid"
  //               gridTemplateColumns="repeat(12, 1fr)"
  //               gap={2}
  //               sx={{
  //                 backgroundColor: PRIMARY_LIGHT,
  //                 width: 1,

  //                 borderRadius: "10PX",
  //               }}
  //             >
  //               <Box gridColumn="span 4">
  //                 <Stack color="white" ml={4} mt={1}>
  //                   <Typography style={{ fontWeight: "bold" }}>
  //                     {" "}
  //                     Date&Time:
  //                   </Typography>
  //                   <Typography variant="caption">
  //                     {fDateTime(row.date)}{" "}
  //                   </Typography>
  //                 </Stack>
  //               </Box>
  //               <Box gridColumn="span 4">
  //                 {" "}
  //                 <Stack color="white" mt={1}>
  //                   <Typography style={{ fontWeight: "bold" }}>UTR:</Typography>
  //                   <Typography variant="caption">
  //                     {userData.transactional_details?.trxId}
  //                   </Typography>
  //                 </Stack>
  //               </Box>
  //               <Box gridColumn="span 4">
  //                 {" "}
  //                 <Stack color="white" mt={1}>
  //                   <Typography style={{ fontWeight: "bold" }}>
  //                     Amount:
  //                   </Typography>
  //                   <Typography variant="caption">
  //                     {fIndianCurrency(userData.amount)}{" "}
  //                   </Typography>
  //                 </Stack>
  //               </Box>
  //               <Box gridColumn="span 4">
  //                 <Stack color="white" ml={4} mb={1}>
  //                   <Typography style={{ fontWeight: "bold" }}>
  //                     Deposit Bank:
  //                   </Typography>
  //                   <Typography variant="caption">
  //                     {userData?.bankId?.bank_details?.bank_name}{" "}
  //                   </Typography>
  //                 </Stack>
  //               </Box>
  //               <Box gridColumn="span 4">
  //                 <Stack color="white" mb={1}>
  //                   <Typography noWrap style={{ fontWeight: "bold" }}>
  //                     Reference ID:
  //                   </Typography>
  //                   <Typography variant="caption">
  //                     {userData.request_from?.Id?.referralCode}{" "}
  //                   </Typography>
  //                 </Stack>
  //               </Box>
  //               <Box gridColumn="span 4" mb={1}>
  //                 <Stack color="white">
  //                   <Typography noWrap style={{ fontWeight: "bold" }}>
  //                     Deposit Branch:
  //                   </Typography>
  //                   <Typography variant="caption">
  //                     {userData?.bankId?.bank_details?.branch_name}
  //                   </Typography>
  //                 </Stack>
  //               </Box>
  //             </Box>
  //           </>
  //         }

  //         {
  //           <TableContainer sx={{ maxHeight: 300 }}>
  //             <Table
  //               style={{
  //                 borderRadius: "10px",
  //                 marginBottom: "2px",
  //               }}
  //             >
  //               <TableHead>
  //                 <TableRow sx={{ marginBottom: "4" }}>
  //                   <TableCell align="center" colSpan={7}>
  //                     <Typography variant="h4" style={{ color: "#333" }}>
  //                       Other Trasaction with similar amount
  //                     </Typography>
  //                   </TableCell>
  //                 </TableRow>
  //                 <TableRow>
  //                   <TableCell>Date</TableCell>
  //                   <TableCell>User Details</TableCell>
  //                   <TableCell>UTR</TableCell>
  //                   <TableCell>Mode of Payment</TableCell>
  //                   <TableCell>Deposite Bank</TableCell>
  //                   <TableCell>Amount</TableCell>
  //                   <TableCell>Status</TableCell>
  //                 </TableRow>
  //               </TableHead>

  //               <TableBody>
  //                 {amountData?.slice(0, 10)?.map((user: any) => (
  //                   <TableRow key={user.id}>
  //                     <TableCell>{fDateTime(user.date)}</TableCell>
  //                     <TableCell>
  //                       {user["user Name"]} {user.role}
  //                     </TableCell>
  //                     <TableCell>{user["Reference ID"]}</TableCell>
  //                     <TableCell>{user["Mode of Payment"]}</TableCell>
  //                     <TableCell>{user["Bank Name"]}</TableCell>
  //                     <TableCell>{user.Amount}</TableCell>
  //                     <TableCell>
  //                       <Label
  //                         variant="soft"
  //                         color={
  //                           (user?.status === "Rejected" && "error") ||
  //                           ((user?.status === "Pending" ||
  //                             user?.status === "Approved") &&
  //                             "warning") ||
  //                           "success"
  //                         }
  //                         sx={{ textTransform: "capitalize" }}
  //                       >
  //                         {user?.status ? sentenceCase(user?.status) : ""}
  //                       </Label>
  //                     </TableCell>
  //                   </TableRow>
  //                 ))}
  //               </TableBody>
  //             </Table>
  //           </TableContainer>
  //         }
  //         <Typography variant="h6">You want to?</Typography>
  //         <RadioGroup
  //           aria-label="approval"
  //           name="approval"
  //           value={approval}
  //           onChange={handleChange}
  //           row
  //         >
  //           <FormControlLabel
  //             value="approve"
  //             control={<Radio color="primary" />}
  //             label="Approve"
  //             labelPlacement="end"
  //           />
  //           <FormControlLabel
  //             value="reject"
  //             control={<Radio color="primary" />}
  //             label="Reject"
  //             labelPlacement="end"
  //           />
  //         </RadioGroup>

  //         {approval === "approve" && (
  //           <TextField
  //             label="Remark"
  //             value={RequestApprove}
  //             onChange={handleRemarkChange}
  //             sx={{ width: "40%" }}
  //             margin="normal"
  //             size="small"
  //           />
  //         )}

  //         {approval === "reject" && (
  //           <FormControl fullWidth margin="normal">
  //             <InputLabel id="demo-simple-select-label">Reason</InputLabel>
  //             <Select
  //               labelId="demo-simple-select-label"
  //               id="demo-simple-select"
  //               value={reasonData}
  //               label="Reason"
  //               onChange={handleReasonChange}
  //               size="small"
  //               sx={{ width: "40%" }}
  //             >
  //               <MenuItem value={"Amount not Credited"}>
  //                 Amount not Credited
  //               </MenuItem>
  //               <MenuItem value={"Wrong Bank Selection"}>
  //                 Wrong Bank Selection
  //               </MenuItem>
  //               <MenuItem
  //                 value={"Invalid Transaction ID/ Bank Reference Number"}
  //               >
  //                 Invalid Transaction ID/ Bank Reference Number
  //               </MenuItem>
  //               <MenuItem value={"Duplicate Request"}>
  //                 Duplicate Request{" "}
  //               </MenuItem>
  //               <MenuItem value={"Currently not clearing Advances"}>
  //                 Currently not clearing Advances{" "}
  //               </MenuItem>
  //               <MenuItem value={"Wrong Amount Entered"}>
  //                 Wrong Amount Entered{" "}
  //               </MenuItem>
  //               <MenuItem value={"Incorrect deposit date"}>
  //                 Incorrect deposit date{" "}
  //               </MenuItem>
  //             </Select>
  //           </FormControl>
  //         )}

  //         <Button
  //           variant="contained"
  //           color="primary"
  //           onClick={handleContinueClick}
  //           disabled={
  //             !(
  //               (approval == "approve" && RequestApprove) ||
  //               (approval == "reject" && reasonData)
  //             )
  //           }
  //         >
  //           Continue
  //         </Button>

  //         <Modal
  //           open={isModalOpen}
  //           onClose={handleCloseModal}
  //           aria-labelledby="modal-title"
  //           aria-describedby="modal-description"
  //         >
  //           <Grid
  //             sx={{
  //               position: "absolute" as "absolute",
  //               top: "50%",
  //               left: "50%",
  //               transform: "translate(-50%, -50%)",

  //               bgcolor: "#ffffff",
  //               boxShadow: 24,
  //               p: 4,
  //               borderRadius: "20px",
  //             }}
  //             width={{
  //               sm: "90%",
  //               md: "50%",
  //             }}
  //           >
  //             <Stack
  //               style={{
  //                 backgroundColor: "#fff",
  //                 borderRadius: "10px",
  //                 marginBottom: "2px",
  //               }}
  //             >
  //               <Box sx={{ width: 1 }}>
  //                 <Box
  //                   display="grid"
  //                   gridTemplateColumns="repeat(12, 1fr)"
  //                   gap={2}
  //                 >
  //                   <Box gridColumn="span 4">
  //                     <Stack ml={4}>
  //                       <Typography style={{ fontWeight: "bold" }}>
  //                         {" "}
  //                         Date&Time:
  //                       </Typography>
  //                       <Typography variant="caption">
  //                         {fDateTime(row.date)}{" "}
  //                       </Typography>
  //                     </Stack>
  //                   </Box>
  //                   <Box gridColumn="span 4">
  //                     {" "}
  //                     <Stack>
  //                       <Typography style={{ fontWeight: "bold" }}>
  //                         UTR:
  //                       </Typography>
  //                       <Typography variant="caption">
  //                         {userData.transactional_details?.trxId}
  //                       </Typography>
  //                     </Stack>
  //                   </Box>
  //                   <Box gridColumn="span 4">
  //                     {" "}
  //                     <Stack>
  //                       <Typography style={{ fontWeight: "bold" }}>
  //                         Amount:
  //                       </Typography>
  //                       <Typography variant="caption">
  //                         {fIndianCurrency(userData.amount)}{" "}
  //                       </Typography>
  //                     </Stack>
  //                   </Box>
  //                   <Box gridColumn="span 4">
  //                     <Stack ml={4}>
  //                       <Typography style={{ fontWeight: "bold" }}>
  //                         Deposit Bank:
  //                       </Typography>
  //                       <Typography variant="caption">
  //                         {userData?.bankId?.bank_details?.bank_name}{" "}
  //                       </Typography>
  //                     </Stack>
  //                   </Box>
  //                   <Box gridColumn="span 4">
  //                     <Stack>
  //                       <Typography style={{ fontWeight: "bold" }}>
  //                         Reference ID:
  //                       </Typography>
  //                       <Typography variant="caption">
  //                         {userData.request_from?.Id?.referralCode}{" "}
  //                       </Typography>
  //                     </Stack>
  //                   </Box>
  //                   <Box gridColumn="span 4">
  //                     <Stack>
  //                       <Typography style={{ fontWeight: "bold" }}>
  //                         Deposit Branch:
  //                       </Typography>
  //                       <Typography variant="caption">
  //                         {userData?.bankId?.bank_details?.branch_name}
  //                       </Typography>
  //                     </Stack>
  //                   </Box>
  //                 </Box>
  //               </Box>

  //               <LoadingButton
  //                 loading={verifyLoding}
  //                 variant="contained"
  //                 onClick={() =>
  //                   action(approval == "approve" ? "Approved" : "Rejected")
  //                 }
  //               >
  //                 sumbit
  //               </LoadingButton>
  //             </Stack>
  //           </Grid>
  //         </Modal>
  //       </Grid>
  //     </Modal>
  //     <Dialog fullWidth maxWidth="xs" open={openHold}>
  //       <DialogContent>
  //         <Stack direction="row" p={4}>
  //           <Typography variant="h4">
  //             Please Confirm to Approve Request
  //           </Typography>
  //         </Stack>
  //       </DialogContent>

  //       <Stack flexDirection="row" gap={2} p={1}>
  //         <Button variant="contained" onClick={ApprovHoldReq}>
  //           Approve
  //         </Button>
  //         <Button variant="contained" onClick={handleCloseHold}>
  //           Close
  //         </Button>
  //       </Stack>
  //     </Dialog>
  //   </>
  // );
}
function moment(value: any) {
  throw new Error("Function not implemented.");
}
