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
  CardHeader,
  Typography,
  Popover,
  TableContainer,
  Button,
  Switch,
  styled,
  Modal,
} from "@mui/material";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import { PATH_DASHBOARD } from "src/routes/paths";

import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import React from "react";
import Iconify from "src/components/iconify";
import AddNewVendor from "./AddNewVendor";
// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  name: string;
  vendorID: string;
  vendorName: string;
  vendorCreatedOn: string;
  vendor_gst: string;
  vendorContact: string;
  vendorAvailableFor: string;
  vendortransactionType: string;
  _id: string;
  commissionType: string;
  paymentTerms: string;
  remindVia: string;
  vendorApiDocument: string;
  // vendorAgreementFile: string;
  avatar: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function ViewVendorTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  return (
    <Card {...other}>
      {/* <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} /> */}

      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row) => (
                <VendorRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

type vendorRowProps = {
  row: RowProps;
};
// sd
function VendorRow({ row }: vendorRowProps) {
  const navigate = useNavigate();
  // const [bdy , setbdy] = useState('')

  const [open, setModalEdit] = React.useState(false);
  const [vd, setVd] = React.useState({});

  const handleClose = () => setModalEdit(false);
  // ----------------------------------------------------------------------
  const openEditModal = (val: any) => {
    setModalEdit(true);
    setVd(row);
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open1 = Boolean(anchorEl);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    height: "85%",
    bgcolor: "background.paper",
    border: "4px solid #00AB55",
    boxShadow: 24,
    padding: "10px 32px",
    overflow: "auto",
  };
  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": {
        width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(9px)",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(12px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor:
            theme.palette.mode === "dark" ? "#177ddc" : "#00AB55",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 12,
      height: 12,
      borderRadius: 6,
      transition: theme.transitions.create(["width"], {
        duration: 200,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,.35)"
          : "rgba(0,0,0,.25)",
      boxSizing: "border-box",
    },
  }));
  return (
    <TableRow>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box style={{ marginTop: 10 }}>
            <AddNewVendor vdData={vd} closeModel={handleClose} />
          </Box>
        </Box>
      </Modal>

      <TableCell>
        <Stack direction="row" alignItems="center">
          <Avatar alt={row.name} src={row.avatar} />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ width: "175px" }}>
              {row.vendorName}{" "}
              <Iconify
                icon={"eva:info-fill"}
                aria-owns={open1 ? "mouse-over-popover" : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              />
            </Typography>
            <Popover
              id="mouse-over-popover"
              sx={{
                pointerEvents: "none",
              }}
              open={open1}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <Typography sx={{ p: 1 }}>{row.vendorApiDocument}</Typography>
            </Popover>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row._id}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>{row.vendor_gst}</TableCell>
      <TableCell>{row.vendorContact}</TableCell>
      <TableCell>{row.vendorAvailableFor}</TableCell>
      <TableCell>{row.vendortransactionType}</TableCell>
      <TableCell>{row.commissionType}</TableCell>
      <TableCell>{row.paymentTerms}</TableCell>
      <TableCell>{row.remindVia}</TableCell>
      <TableCell>{row.vendorApiDocument}</TableCell>
      {/* <TableCell>{row.vendorAgreementFile}</TableCell> */}
      <TableCell>
        <Button variant="contained" onClick={openEditModal}>
          Edit
        </Button>
        {/* <AntSwitch inputProps={{ 'aria-label': 'ant design' }} sx={{width:'68px',marginTop:'5px'}} /> */}
      </TableCell>

      {/* <TableCell>
          <Image src={row.flag} alt="country flag" sx={{ maxWidth: 28, mx: 'auto' }} />
          {"refferCode"}
        </TableCell>
   */}
      {/* <TableCell>{row.mobileVerify?'Verified':'Unverified'}</TableCell>
        <TableCell>{row.emailVerify?'Verified':'Unverified'}</TableCell>
   */}
      {/* <TableCell align="right">
          <Label
            variant="soft"
            color={
              (row.rank === 'Top 1' && 'primary') ||
              (row.rank === 'Top 2' && 'info') ||
              (row.rank === 'Top 3' && 'success') ||
              (row.rank === 'Top 4' && 'warning') ||
              'error'
            }
          >
            {row.rank}
          </Label>
          {row.verificationStatus}
        </TableCell> */}
    </TableRow>
  );
}
