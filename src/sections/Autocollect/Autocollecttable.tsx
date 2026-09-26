import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fDateTime } from "src/utils/formatTime";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Card,
  Box,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
import { useSnackbar } from "src/components/snackbar";

export default function Autocollecttable() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const [category, setCategory] = useState<any>([]);
  const [open, setModalEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    AuttoCollect();
  }, []);

  const AuttoCollect = () => {
    let token = localStorage.getItem("token");
    Api(`admin/autoCollect/fetch`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        setCategory(Response?.data?.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const handleClose = () => setModalEdit(false);

  const openEditModal = (row: any) => {
    setSelectedRow(row);
    setModalEdit(true);
  };

  const handleSave = () => {
    setModalEdit(false);
  };

  const handleEditButtonClick = (row: any) => {
    navigate("/auth/autocollect/editautocollect", {
      state: { selectedRow: row },
    });
  };

  return (
    <>
      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 720 }}
            stickyHeader
            size="small"
            aria-label="customized table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Auto Collect Identifier</TableCell>
                <TableCell>Services</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {category.map((row: any) => (
                <TableRow key={row.autoCollectIdentifier}>
                  <TableCell>{row.autoCollectIdentifier}</TableCell>
                  <TableCell>
                    {row.services.map((service: any, index: number) => (
                      <Fragment key={index}>
                        {service.serviceName}
                        {index !== row.services.length - 1 && ", "}
                      </Fragment>
                    ))}
                  </TableCell>
                  <TableCell>{fDateTime(row.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleEditButtonClick(row)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
}
