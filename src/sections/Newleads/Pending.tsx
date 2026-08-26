import {
  Card,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Avatar,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { PATH_DASHBOARD } from "src/routes/paths";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import { TableHeadCustom } from "src/components/table";
import { useNavigate } from "react-router";
import { Fragment, useEffect, useState } from "react";

import CustomPagination from "../../components/CustomFunction/CustomPagination";
import AwsDocSign from "../../components/CustomFunction/AwsDocSign";
import ApiDataLoading from "../../components/CustomFunction/ApiDataLoading";
import { fDateTime } from "src/utils/formatTime";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { useAuthContext } from "src/auth/useAuthContext";

import { LEAD_COLUMNS_WITH_ACTION } from "./leadColumns";
type RowProps = {
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
};

export default function Pending() {
  const { Api } = useAuthContext();
  const [pendingData, setPendingData] = useState<RowProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      getPendingUsers(pageSize, currentPage);
    }, 500);
  }, [currentPage]);

  const getPendingUsers = (pageSize: number, currentPage: number) => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`admin/get_pendingList`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setPendingData(Response.data.data);
          setTxnCount(Response.data.count);
        } else {
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  };
  return (
    <Fragment>
      {isLoading ? (
        <ApiDataLoading
          variant="table"
          columns={LEAD_COLUMNS_WITH_ACTION}
          minWidth={720}
        />
      ) : (
        <Scrollbar sx={{ minWidth: 720 }}>
          <Table size="small">
            <TableHeadCustom headLabel={LEAD_COLUMNS_WITH_ACTION} />

            <TableBody>
              {pendingData.map((row) => (
                <PendingRow key={row._id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      )}
      <CustomPagination
        pageSize={pageSize}
        onChange={(event: React.ChangeEvent<unknown>, value: number) => {
          setCurrentPage(value);
        }}
        page={currentPage}
        Count={txnCount}
      />
    </Fragment>
  );
}

type ChildProps = {
  row: RowProps;
};

const PendingRow = ({ row }: ChildProps) => {
  const navigate = useNavigate();

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center">
          <Avatar alt={row.firstName} src={AwsDocSign(row.selfie[0]) || ""} />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2">
              {row.firstName} {row.lastName}
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

      <TableCell>{row.cityInAadhar || "-"}</TableCell>

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
      <TableCell>
        <Button
          onClick={() =>
            navigate(PATH_DASHBOARD.newleadsteps, { state: { id: row._id } })
          }
          variant="contained"
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};
