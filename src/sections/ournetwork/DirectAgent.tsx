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
  Typography,
  TableContainer,
  Pagination,
  Button,
  Modal,
} from "@mui/material";
// components
import { useSnackbar } from "../../components/snackbar";

import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import { Upload } from "../../components/upload";
import React, { useEffect, useState, useCallback } from "react";
import { fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  city: string;
  mobileVerify: boolean;
  emailVerify: boolean;
  _id: any;
  verificationStatus: string;
  avatar: string;
  category: string;
  flag: string;
  total: number;
  rank: string;
  finalStatus: string;
  contact_no: string;
  role: string;
  createdAt: string;
  selfie: any;
  company_name: any;
};

export default function DirectAgent() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [appdata, setAppdata] = useState([]);
  const [currentPage, setCurrentPage] = useState<any>(1);

  const tableLabels: any = [
    { id: "product", label: "Name" },
    { id: "shopname", label: "Shop Name" },
    { id: "commission", label: "City/State" },
    { id: "Type", label: "User Type" },
    { id: "maxComm", label: "Mobile Verified" },
    { id: "mobileNumber", label: "Mobile Number", align: "center" },
    { id: "maxComm", label: "Email Verified" },
    { id: "status", label: "Status", align: "right" },
    { id: "consentagreed", label: "Consent Agreed", align: "right" },
  ];

  useEffect(() => {
    ApprovedList();
  }, []);

  const ApprovedList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/get_ApprovedList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setAppdata(
          Response.data.data.filter((item: any) => {
            // Item 3d: `referralCode` was removed from the user record. The
            // old condition `referralCode == ""` meant "an agent with no
            // referrer"; against the new payload it is `undefined == ""`,
            // which is false for every row, so this list rendered EMPTY.
            return item.role == "agent";
          })
        );
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Card>
        <TableContainer
          sx={{ border: "1px", height: "70vh", overflowY: "scroll" }}
        >
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={tableLabels} />

              <TableBody>
                {appdata.map((row) => (
                  <EcommerceBestSalesmanRow key={row} row={row} />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <Pagination
          sx={{ display: "flex", justifyContent: "center" }}
          // count={pageSize}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
};
// sd
function EcommerceBestSalesmanRow({ row }: EcommerceBestSalesmanRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center">
          <Avatar alt={row.name} src={row.selfie} />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2"> {row.firstName} </Typography>
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
        <Typography variant="body2">
          {" "}
          {row?.company_name || "No shop name"}{" "}
        </Typography>
      </TableCell>

      <TableCell>{row.city}</TableCell>
      <TableCell>{"Direct Agent"}</TableCell>

      <TableCell>{row.mobileVerify ? "Verified" : "Unverified"}</TableCell>
      <TableCell>{row.contact_no}</TableCell>
      <TableCell>{row.emailVerify ? "Verified" : "Unverified"}</TableCell>
      <TableCell align="right">{row.verificationStatus}</TableCell>
      <TableCell sx={{ textAlign: "center" }}>Yes</TableCell>
    </TableRow>
  );
}
