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
  TableContainer,
  Button,
  Modal,
  TextField,
  styled,
  Switch,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
} from "@mui/material";
// utils

import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { PATH_DASHBOARD } from "src/routes/paths";
import { useSnackbar } from "../../../components/snackbar";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type RowProps = {
  _id: string;
  productId: string;
  productName: string;
  subcategoryName: string;
  vendors: string;
  apiUserVendor: string;
  directAgentVendor: string;
  neoNetworkVendor: string;
  operatorid: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: any;
  tableLabels: any;
}
export default function RechargeVendorSwitchTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row: any) => (
                <VendorRow
                  key={row.id}
                  row={row.productId}
                  vendor={row.vendors}
                />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type VendorRowProps = {
  row: RowProps;
  vendor: any;
};
// sd
function VendorRow({ row, vendor }: VendorRowProps) {
  var updatedVendor: any = [...vendor];
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [editTrue, setEditTrue] = useState(false);
  const [apiVendor, setApiVendor] = useState(row.apiUserVendor);
  const [distribution, setDistribution] = useState(row.neoNetworkVendor);
  const [directAgent, setDirectAgent] = useState(row.directAgentVendor);
  const [distId, setDistId] = useState("");
  const [apiId, setApiId] = useState("");
  const [directAgId, setDirectAgId] = useState("");

  const saveTab = (val: any, product: any) => {
    let token = localStorage.getItem("token");

    var arr: any = [];
    updatedVendor.map((item: any) => {
      let obj: any = {
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        shortCode: item.shortCode,
        services: item.services,
        commission: item.commission,
      };
      arr.push(obj);
    });

    let body = {
      apiUserVendor: apiId ? apiId : row.apiUserVendor,
      neoNetworkVendor: distId ? distId : row.neoNetworkVendor,
      directAgentVendor: directAgId ? directAgId : row.directAgentVendor,
      vendors: vendor,
    };
    Api(
      `admin/rechargeControl/rechargeController/${product._id}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.data.res == 200) {
        enqueueSnackbar(Response.data.message);
        setEditTrue(false);
      } else {
      }
    });
  };

  type FormValuesProps = {};

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {};
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  // function handleChange(row: any, mdist: any, key: any) {
  //   for (let i = 0; i < updated_Content.length; i++) {
  //     if (updated_Content[i]._id == row._id) {
  //       updated_Content[i][key] = mdist.target.value;
  //
  //     }
  //   }
  // }

  function handleChange(row: any, e: any, key: any, i: any) {
    row[key] = e.target.value;
    updatedVendor[i][key] = e.target.value;
    updatedVendor.splice(i, 1, row);
  }

  return (
    <TableRow hover>
      <TableCell>
        <Typography>{row.productName}</Typography>
        <Typography>{row.subcategoryName}</Typography>
      </TableCell>
      <TableCell>{row.operatorid}</TableCell>
      {vendor.map((item: any, index: number) => {
        return (
          item.services.toLowerCase() == "yes" && (
            <>
              <TableCell>
                {editTrue ? (
                  <TextField
                    id="outlined-basic"
                    label={item.shortCode}
                    defaultValue={item.shortCode}
                    variant="outlined"
                    sx={{ width: 100 }}
                    onChange={(e) => handleChange(item, e, "shortCode", index)}
                    // onChange={(e) => {
                    //   item.shortCode = e.target.value;
                    // }}
                  />
                ) : (
                  <Typography key={item._id}>{item.shortCode}</Typography>
                )}
              </TableCell>
            </>
          )
        );
      })}
      <TableCell>
        {editTrue ? (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel htmlFor="direct-Vendor">DirectAgent Vendor</InputLabel>
            <Select
              autoFocus
              value={directAgent == "" ? row.directAgentVendor : directAgent}
              onChange={(e) => setDirectAgent(e.target.value)}
              label="Direct Agent Vendor"
              inputProps={{
                name: "direct-Vendor",
                id: "direct-Vendor",
              }}
            >
              {vendor.map((item: any) => {
                return (
                  item.services.toLowerCase() == "yes" && (
                    <MenuItem
                      key={item._id}
                      value={item.vendorId}
                      onClick={() => setDirectAgId(item.vendorId)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  )
                );
              })}
            </Select>
          </FormControl>
        ) : (
          vendor.map((item: any) => {
            if (item.vendorId == directAgent) {
              return (
                <Typography key={item.vendorId}> {item.vendorName}</Typography>
              );
            }
          })
        )}
      </TableCell>
      <TableCell>
        {editTrue ? (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel htmlFor="Neo-Vendor">Neo Vendor</InputLabel>
            <Select
              autoFocus
              value={distribution == "" ? row.neoNetworkVendor : distribution}
              onChange={(e) => setDistribution(e.target.value)}
              label="Neo Vendor"
              inputProps={{
                name: "Neo-Vendor",
                id: "Neo-Vendor",
              }}
            >
              {vendor.map((item: any) => {
                return (
                  item.services.toLowerCase() == "yes" && (
                    <MenuItem
                      key={item._id}
                      value={item.vendorId}
                      onClick={() => setDistId(item.vendorId)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  )
                );
              })}
            </Select>
          </FormControl>
        ) : (
          vendor.map((item: any) => {
            if (item.vendorId == distribution) {
              return (
                <Typography key={item.vendorId}> {item.vendorName}</Typography>
              );
            }
          })
        )}
      </TableCell>
      <TableCell>
        {editTrue ? (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel htmlFor="api-Vendor">API Vendor</InputLabel>
            <Select
              autoFocus
              value={apiVendor == "" ? row.apiUserVendor : apiVendor}
              onChange={(e) => setApiVendor(e.target.value)}
              label="API Vendor"
              inputProps={{
                name: "api-Vendor",
                id: "api-Vendor",
              }}
            >
              {vendor.map((item: any) => {
                return (
                  item.services.toLowerCase() == "yes" && (
                    <MenuItem
                      key={item._id}
                      value={item.vendorId}
                      onClick={() => setApiId(item.vendorId)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  )
                );
              })}
            </Select>
          </FormControl>
        ) : (
          vendor.map((item: any) => {
            if (item.vendorId == apiVendor) {
              return (
                <Typography key={item.vendorId}> {item.vendorName}</Typography>
              );
            }
          })
        )}
      </TableCell>
      <TableCell>
        {editTrue == false ? (
          <Button variant="contained" onClick={() => setEditTrue(!editTrue)}>
            Edit
          </Button>
        ) : (
          <Button variant="contained" onClick={() => saveTab(vendor, row)}>
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
