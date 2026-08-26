import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardProps,
  Link,
  Stack,
  TableCell,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
import { fDateTime } from "src/utils/formatTime";
import React from "react";
import { useNavigate } from "react-router";
import { PATH_DASHBOARD } from "src/routes/paths";
import { CustomAvatar } from "src/components/custom-avatar";
import MotionModal from "src/components/animate/MotionModal";
import Iconify from "src/components/iconify/Iconify";

type RowProps = {
  shopAddress: string;
  aadharpincode: string;
  distInAadhar: string;
  localityInAadhar: string;
  addressInAadhar: string;
  locality: string;
  city: string;
  district: string;
  postalCode: string;
  aadharNumber: string;
  PANnumber: string;
  GSTNumber: string;
  isGST: boolean;
  userCode: string;

  firstName: string;
  lastName: string;
  email: string;
  cityInAadhar: string;
  mobileVerify: boolean;
  emailVerify: boolean;
  _id: string;
  selfie: string;
  referralCode: string;
  contact_no: string;
  role: string;
  createdAt: string;
  constitutionType: string;
  state: string;
  isAadhaarVerified: string;
  isPANVerified: string;
  is_CID_Docs: string;
  is_PID_Docs: string;
  finalStatus: string;
  metaData: any;
  latitude: any;
  longitude: any;
};

interface Props extends CardProps {
  row: RowProps;
}

const StyledIcon = styled(Iconify)(({ theme }) => ({
  width: 20,
  height: 20,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

function NewLeadsTable({ row }: Props) {
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const latitude = row?.metaData?.latitude;
  const longitude = row?.metaData?.longitude;

  const handleMapClick = () => {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapUrl, "_blank");
  };

  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border

    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[300],
    },
  }));

  return (
      <>
    <StyledTableRow sx={{ maxWidth: "100%" }}>
        <TableCell>
          <Stack direction="row" alignItems="center">
            <CustomAvatar
              name={row.firstName}
              alt={row.firstName}
              src={row.selfie[0]}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2">
                {" "}
                {row.firstName} {row.lastName}{" "}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {row.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {fDateTime(row.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography>
            {row.cityInAadhar || "-"}/{row.state || "-"}
          </Typography>
          <ButtonBase onClick={handleMapClick}>
            <Stack direction="row" gap={1}>
              <Typography variant="subtitle2" noWrap>
                Lat:
              </Typography>
              <Typography variant="body2" noWrap>
                {latitude}
              </Typography>
            </Stack>
          </ButtonBase>
          <Stack direction="row" gap={1}>
            <ButtonBase onClick={handleMapClick}>
              <Typography variant="subtitle2" noWrap>
                Long:
              </Typography>
              <Typography variant="body2" noWrap>
                {longitude}
              </Typography>
            </ButtonBase>
          </Stack>
        </TableCell>

        <TableCell>
          {row.constitutionType != "" ? row.constitutionType : "NA"}
        </TableCell>
        <TableCell>
          {row.role == "m_distributor"
            ? "Master Distributor"
            : row.role == "distributor"
            ? "Distributor"
            : row.role == "agent"
            ? "Agent"
            : row.role == "API_User"
            ? "Api User"
            : "Direct Agent"}
        </TableCell>

        <TableCell>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography whiteSpace={"nowrap"}>Mobile :</Typography>
            <Typography>
              {row.mobileVerify ? (
                <VerifiedIcon color={"success"} sx={{ verticalAlign: "top" }} />
              ) : (
                <CancelIcon color={"error"} sx={{ verticalAlign: "top" }} />
              )}
            </Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography whiteSpace={"nowrap"}>Email :</Typography>
            <Typography>
              {row.emailVerify ? (
                <VerifiedIcon color={"success"} sx={{ verticalAlign: "top" }} />
              ) : (
                <CancelIcon color={"error"} sx={{ verticalAlign: "top" }} />
              )}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography whiteSpace={"nowrap"}>Aadhaar :</Typography>
            <Typography>
              {row.isAadhaarVerified ? (
                <VerifiedIcon color={"success"} sx={{ verticalAlign: "top" }} />
              ) : (
                <CancelIcon color={"error"} sx={{ verticalAlign: "top" }} />
              )}
            </Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography whiteSpace={"nowrap"}>Pan :</Typography>
            <Typography>
              {row.isPANVerified ? (
                <VerifiedIcon color={"success"} sx={{ verticalAlign: "top" }} />
              ) : (
                <CancelIcon color={"error"} sx={{ verticalAlign: "top" }} />
              )}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography whiteSpace={"nowrap"}>Personal Docs :</Typography>
            <Typography>
              {row.is_PID_Docs ? (
                <VerifiedIcon color={"success"} sx={{ verticalAlign: "top" }} />
              ) : (
                <CancelIcon color={"error"} sx={{ verticalAlign: "top" }} />
              )}
            </Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography whiteSpace={"nowrap"}>Constitution Docs :</Typography>
            <Typography>
              {row.is_CID_Docs ? (
                <VerifiedIcon color={"success"} sx={{ verticalAlign: "top" }} />
              ) : (
                <CancelIcon color={"error"} sx={{ verticalAlign: "top" }} />
              )}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>{row.contact_no}</TableCell>
        <TableCell>Yes</TableCell>
        {row.finalStatus == "" && (
          <TableCell>
            <Stack gap={1}>
              <Button
                onClick={() =>
                  navigate(PATH_DASHBOARD.newleadsteps, {
                    state: { id: row._id },
                  })
                }
                variant="contained"
              >
                Approve
              </Button>
              <Button
                onClick={() =>
                  navigate(PATH_DASHBOARD.edit, {
                    state: { id: row._id },
                  })
                }
                variant="contained"
              >
                Update
              </Button>
            </Stack>
          </TableCell>
        )}
        {row.finalStatus == "approved" && (
          <TableCell>
            <Button
              onClick={() =>
                navigate(PATH_DASHBOARD.edit, {
                  state: { id: row._id },
                })
              }
              variant="contained"
            >
              View
            </Button>
          </TableCell>
        )}
      </StyledTableRow>
    </>
  );
}

export default React.memo(NewLeadsTable);
