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
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import { TableHeadCustom } from "src/components/table";
import { useEffect, useState } from "react";

import CustomPagination from "../../components/CustomFunction/CustomPagination";
import AwsDocSign from "../../components/CustomFunction/AwsDocSign";
import ApiDataLoading from "../../components/CustomFunction/ApiDataLoading";
import { fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "src/components/snackbar";

import { LEAD_COLUMNS } from "./leadColumns";
import { isOk, notifyFailure } from "src/utils/apiResult";
type RowProps = {
  firstName: string;
  lastName: string;
  email: string;
  cityInAadhar: string;
  mobileVerify: boolean;
  emailVerify: boolean;
  _id: string;
  selfie: string;
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

export default function Rejected() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [rejectedData, setRejectedData] = useState<RowProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [txnCount, setTxnCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => getRejectedUsers(pageSize, currentPage), [currentPage]);

  const getRejectedUsers = (pageSize: number, currentPage: number) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`admin/get_RejectedList`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setRejectedData(Response.data.data);
        setTxnCount(Response.data.count);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsLoading(false);
    });
  };
  return (
    <Card>
      {isLoading ? (
        <ApiDataLoading variant="table" columns={LEAD_COLUMNS} minWidth={720} />
      ) : (
        <Table size="small">
          <TableHeadCustom headLabel={LEAD_COLUMNS} />

          <TableBody>
            {rejectedData.map((row) => (
              <RejectedRow key={row._id} row={row} />
            ))}
          </TableBody>
        </Table>
      )}
      <CustomPagination
        pageSize={pageSize}
        onChange={(event: React.ChangeEvent<unknown>, value: number) => {
          setCurrentPage(value);
        }}
        page={currentPage}
        Count={txnCount}
      />
    </Card>
  );
}

type ChildProps = {
  row: RowProps;
};

const RejectedRow = ({ row }: ChildProps) => {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center">
          <Avatar alt={row.firstName} src={AwsDocSign(row.selfie[0]) || ""} />

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
        {row.cityInAadhar || "-"}/{row.state || "-"}
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
    </TableRow>
  );
};
