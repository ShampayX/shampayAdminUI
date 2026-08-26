import React, { useEffect, useState } from "react";

import Framegreen from "../../assets/images/Frame green.svg";
import Frameorange from "../../assets/images/Frame orange.svg";
import Graphgreen from "../../assets/images/Graph green.svg";
import Graphorange from "../../assets/images/Graph orange.svg";

import {
  Container,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  TableContainer,
  Grid,
  Stack,
  Button,
  Typography,
  Card,
  Box,
  TableHead,
  CardContent,
} from "@mui/material";
import ApiDataLoading from "../../components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";

// Hoisted: a fresh array literal on every render fed both the real header and
// the loading skeleton, so the skeleton remounted on each pass.
const vendorTable = [
  { id: "date/LadgerID", label: "Vendor Name" },
  { id: "fromName", label: "Count of Trasactions" },
  { id: "amount", label: "Success" },
  { id: "opeing", label: "Pending " },
  { id: "productName", label: "Failed " },
];

export default function Moneytransfer(props: any) {
  const { Api } = useAuthContext();
  const [RechargeData, setRechargeData] = useState<any>([]);
  const [VerdorData, setVendorData] = useState<any>([]);
  const [verifyLoding, setVerifyLoading] = useState(false);
  const Value = [
    {
      status: "Success",
      value: RechargeData?.total?.success?.count,
      color: "#36B37E",
      logo: Framegreen,
      graph: Graphgreen,
      amount: RechargeData?.total?.success?.volume,
    },
    {
      status: "Pending",
      value: RechargeData?.total?.pending?.count,
      color: "#FFAB00",
      logo: Frameorange,
      graph: Graphorange,
      amount: RechargeData?.total?.pending?.volume,
    },
    {
      status: "Failed",
      value: RechargeData?.total?.failed?.count,
      color: "#FF5630",
      logo: Frameorange,
      graph: Graphgreen,
      amount: RechargeData?.total?.failed?.volume,
    },
    {
      status: "Total",
      value: RechargeData?.total?.total?.count,
      color: "#3340A1",
      logo: Framegreen,
      graph: Graphgreen,
      amount: RechargeData?.total?.total?.volume,
    },
    {
      status: "Refund",
      value: "0",
      color: "#0000FF",
      logo: Framegreen,
      graph: Graphgreen,
    },
  ];

  useEffect(() => {
    RechargeDetails();
  }, []);
  const RechargeDetails = () => {
    setVerifyLoading(true);
    let token = localStorage.getItem("token");
    Api(`dashboard/moneyTransferStats`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setRechargeData(Response?.data?.data?.recharge);

            setVendorData(Response?.data?.data?.recharge);
            setVerifyLoading(false);
          } else {
            setVerifyLoading(false);
          }
        }
      }
    );
  };

  return (
    <>
      {" "}
      <Typography variant="h5">Number of Transaction</Typography>
      <Grid sx={{ display: "flex", gap: 1, marginTop: "10px" }}>
        {Value.map((item, index) => {
          return (
            <Grid item key={index} xs={4} width={"100%"}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  //  width: '100%',
                  // maxWidth:'100%',
                  borderRadius: "15px",
                  boxShadow: "30px",
                }}
              >
                <CardContent>
                  <Stack
                    sx={{
                      fontFamily: "Public Sans",
                      fontSize: "18px",
                      fontWeight: 600,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography style={{ color: item.color }}>
                      {item.status}
                    </Typography>
                    <Typography>{item.value}</Typography>
                  </Stack>
                  <Stack
                    sx={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <img
                      src={item.logo}
                      alt="logo"
                      style={{
                        width: "40px",
                        height: "30px",
                      }}
                    />
                    <img
                      src={item.graph}
                      alt="logo"
                      style={{
                        width: "40px",
                        height: "30px",
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: "Public Sans",
                      fontSize: "1px",
                      fontWeight: 600,
                      lineHeight: "normal",
                      whiteSpace: "nowrap",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{"Amount"}</Typography>
                    <Typography>{item.amount}</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <TableContainer
        sx={{ p: 3 }}
        style={{ margin: "0 auto", maxHeight: "300px" }}
      >
        {verifyLoding ? (
          <ApiDataLoading
            variant="table"
            columns={vendorTable}
            rows={4}
            minWidth={560}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {vendorTable.map((column: any) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {VerdorData?.vendors?.map((data: any) => (
                <TableRow
                  key={VerdorData?._id}
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  sx={{ borderBottom: "1px solid #dadada" }}
                >
                  <TableCell>
                    <Typography> {data?.vendorName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography> {data?.transactions?.total?.count}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {" "}
                      {data?.transactions?.success?.count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {" "}
                      {data?.transactions?.pending?.count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {" "}
                      {data?.transactions?.failed?.count}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );
}
