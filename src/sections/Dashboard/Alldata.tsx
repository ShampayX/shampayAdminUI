import { Helmet } from "react-helmet-async";
// @mui
import { useTheme } from "@mui/material/styles";
import {
  Container,
  Grid,
  Stack,
  Button,
  Typography,
  Card,
  Box,
  CardContent,
} from "@mui/material";

import Framegreen from "../../assets/images/Frame green.svg";
import Frameorange from "../../assets/images/Frame orange.svg";
import Graphgreen from "../../assets/images/Graph green.svg";
import Graphorange from "../../assets/images/Graph orange.svg";
import AppAreaInstalled from "../../sections/Dashboard/components/AppAreaInstalled";
import { useEffect, useState } from "react";

import { fIndianCurrency } from "src/utils/formatNumber";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------
export default function Alldata(props: any) {
  const { Api } = useAuthContext();
  const theme = useTheme();

  const [userData, setUserData] = useState<any>([]);
  const [fundRequest, setfundRequest] = useState<any>([]);
  const [Success, setSuccess] = useState<any>({
    status: "Success",
    volume: "",
    count: "",
    color: "#36B37E",
    logo: Framegreen,
    graph: Graphgreen,
  });
  const [Pending, setPending] = useState<any>({
    status: "Pending",
    volume: "",
    count: "",
    color: "#FFAB00",
    logo: Framegreen,
    graph: Graphgreen,
  });
  const [Failed, setFailed] = useState<any>({
    status: "Failed",
    volume: "",
    count: "",
    color: "#FF5630",
    logo: Frameorange,
    bngraph: Graphorange,
  });

  const [Total, setTotal] = useState<any>({
    status: "Transactions",
    volume: "",
    count: "",
    color: "#3340A1",
    logo: Framegreen,
    graph: Graphgreen,
  });

  const Client = [
    {
      status: "Agents",
      value: userData[0]?.count,
      color: "#36B37E",
      logo: Framegreen,
      graph: Graphgreen,
      amount: userData[0]?.main_Wallet_Balance,
    },
    {
      status: "Distributors",
      value: userData[1]?.count,
      color: "#FFAB00",
      logo: Frameorange,
      graph: Graphorange,
      amount: userData[1]?.main_Wallet_Balance,
    },
    {
      status: "Master Distributors",
      value: userData[2]?.count,
      color: "#FF5630",
      logo: Framegreen,
      graph: Graphgreen,
      amount: userData[2]?.main_Wallet_Balance,
    },
  ];

  const Wallet = [
    {
      status: "Agents",
      value: fundRequest[0]?.count,
      color: "#36B37E",
      logo: Framegreen,
      graph: Graphgreen,
      amount: fundRequest[0]?.amount,
    },
    {
      status: "Distributors",
      value: fundRequest[1]?.count,
      color: "#FFAB00",
      logo: Frameorange,
      graph: Graphorange,
      amount: fundRequest[1]?.amount,
    },
    {
      status: "Master Distributors",
      value: fundRequest[2]?.count,
      color: "#FF5630",
      logo: Framegreen,
      graph: Graphgreen,
      amount: fundRequest[1]?.amount,
    },
  ];

  const Charge = [
    {
      status: "Beneficiaries Registered",
      value: "0",
      color: "#FF6600",
      logo: Framegreen,
      graph: Graphgreen,
    },
    {
      status: "Daily Disputes",
      value: "0",
      color: "#E03E87",
      logo: Framegreen,
      graph: Graphgreen,
    },
    {
      status: "Monthly Disputes",
      value: "0",
      color: "#303981",
      logo: Framegreen,
      graph: Graphgreen,
    },
  ];

  useEffect(() => {
    userdata();
  }, []);
  const userdata = async () => {
    let token = localStorage.getItem("token");
    await Api(`dashboard/totalSuccessTransaction`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSuccess({
              ...Success,
              count: Response.data.totalTransactions,
              volume: Response.data.volume,
            });
          } else {
            let msg = Response.data.message;
          }
        }
      }
    );
  };

  useEffect(() => {
    userValue();
  }, []);
  const userValue = async () => {
    let token = localStorage.getItem("token");
    await Api(`dashboard/totalPendingTransaction`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setPending({
              ...Pending,
              count: Response.data.totalTransactions,
              volume: Response.data.volume,
            });
          } else {
            let msg = Response.data.message;
          }
        }
      }
    );
  };

  useEffect(() => {
    userCode();
  }, []);
  const userCode = async () => {
    let token = localStorage.getItem("token");
    await Api(`dashboard/totalFailedTransaction`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setFailed({
              ...Failed,
              count: Response.data.totalTransactions,
              volume: Response.data.volume,
            });
          } else {
            let msg = Response.data.message;
          }
        }
      }
    );
  };

  useEffect(() => {
    userTotal();
  }, []);
  const userTotal = async () => {
    let token = localStorage.getItem("token");
    await Api(`dashboard/totalTransactions`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setTotal({
              ...Total,
              count: Response.data.totalTransactions,
              volume: Response.data.volume,
            });
          } else {
            let msg = Response.data.message;
          }
        }
      }
    );
  };

  useEffect(() => {
    userOrReachargeTotal();
    TotalFundRequest();
  }, []);
  const userOrReachargeTotal = async () => {
    let token = localStorage.getItem("token");
    await Api(`dashboard/userStats`, "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setUserData(Response.data.data);
        } else {
          let msg = Response.data.message;
        }
      }
    });
  };
  const TotalFundRequest = async () => {
    let token = localStorage.getItem("token");
    await Api(`dashboard/userFundRequestStats`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setfundRequest(Response.data.data);
          } else {
            let msg = Response.data.message;
          }
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title> Summary | Shampay Admin </title>
      </Helmet>
      <Typography variant="h5">Number of Transaction</Typography>
      <Grid width={"100%"}>
        <Stack sx={{ flexDirection: "row", gap: 1, marginTop: "10px" }}>
          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "15px",
              boxShadow: "30px",
              width: "33%",
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
                <Typography style={{ color: Success.color }}>
                  {Success.status}
                </Typography>
                <Typography>{Success.count}</Typography>
              </Stack>
              <Stack
                sx={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <img
                  src={Success.logo}
                  alt="logo"
                  style={{
                    width: "40px",
                    height: "30px",
                  }}
                />
                <img
                  src={Success.graph}
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
                  fontSize: "15px",
                  fontWeight: 100,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>{"Transaction Value"}</Typography>
                <Typography>
                  {fIndianCurrency(Success?.volume || "0")}
                </Typography>
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "15px",
              boxShadow: "30px",
              width: "33%",
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
                <Typography style={{ color: Pending.color }}>
                  {Pending.status}
                </Typography>
                <Typography>{Pending.count}</Typography>
              </Stack>
              <Stack
                sx={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <img
                  src={Pending.logo}
                  alt="logo"
                  style={{
                    width: "40px",
                    height: "30px",
                  }}
                />
                <img
                  src={Pending.graph}
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
                  fontSize: "15px",
                  fontWeight: 100,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>{"Transaction Value"}</Typography>
                <Typography>
                  {fIndianCurrency(Pending?.volume || "0")}
                </Typography>
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "15px",
              boxShadow: "30px",
              width: "33%",
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
                <Typography style={{ color: Failed.color }}>
                  {Failed.status}
                </Typography>
                <Typography>{Failed.count}</Typography>
              </Stack>
              <Stack
                sx={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <img
                  src={Failed.logo}
                  alt="logo"
                  style={{
                    width: "40px",
                    height: "30px",
                  }}
                />
                <img
                  src={Failed?.bngraph}
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
                  fontSize: "15px",
                  fontWeight: 100,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>{"Transaction Value"}</Typography>
                <Typography>
                  {fIndianCurrency(Failed?.volume || "0")}
                </Typography>
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "15px",
              boxShadow: "30px",
              width: "33%",
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
                <Typography style={{ color: Total.color }}>
                  {Total.status}
                </Typography>
                <Typography>{Total.count}</Typography>
              </Stack>
              <Stack
                sx={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <img
                  src={Total.logo}
                  alt="logo"
                  style={{
                    width: "40px",
                    height: "30px",
                  }}
                />
                <img
                  src={Total.graph}
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
                  fontSize: "15px",
                  fontWeight: 100,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>{"Transaction Value"}</Typography>
                <Typography>{fIndianCurrency(Total?.volume || "0")}</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Typography variant="h5">Number of Users</Typography>
      <Grid sx={{ display: "flex", gap: 1, marginTop: "10px" }}>
        {Client.map((item, index) => {
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
                    <Typography>{"Wallet Balance"}</Typography>
                    <Typography>{fIndianCurrency(item.amount)}</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h5">Fund Request</Typography>
      <Grid sx={{ display: "flex", gap: 1, marginTop: "10px" }}>
        {Wallet.map((item, index) => {
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
                    <Typography>{"Transaction Value"}</Typography>
                    <Typography>{`₹ ${fIndianCurrency(
                      item?.amount || "0"
                    )}`}</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid sx={{ display: "grid", gap: 1, marginTop: "10px" }}>
        {Charge.map((item, index) => {
          return (
            <Grid item key={index} xs={4} width={"30%"}>
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
                    <Typography>{"Solved Cases"}</Typography>
                    <Typography>{"₹0"}</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid
        sx={{
          width: "65vw",
          backgroundColor: "#FFFFF",
          borderRadius: "15px",
          boxShadow: "0px 2px 2px #00000040",
          justifyItems: "right",
          marginLeft: "30vw",
          marginTop: "-390px",
        }}
      >
        <AppAreaInstalled
          title="Services"
          subheader="(+43%) than last year"
          chart={{
            series: [
              {
                year: "Hours",
                data: [
                  { name: "Rechrge", data: [] },
                  { name: "AEPS", data: [] },
                  { name: "Bill Payment", data: [] },
                  { name: "Money Transfer", data: [] },
                  { name: "Payot", data: [] },
                  { name: "Aadhar pay", data: [] },
                  { name: "mATM", data: [] },
                  { name: "Indo Nepal", data: [] },
                ],
              },
              {
                year: "2022",
                data: [
                  { name: "Rechrge", data: [] },
                  { name: "AEPS", data: [] },
                  { name: "Bill Payment", data: [] },
                  { name: "Money Transfer", data: [] },
                  { name: "Payot", data: [] },
                  { name: "Aadhar pay", data: [] },
                  { name: "mATM", data: [] },
                  { name: "Indo Nepal", data: [] },
                ],
              },
              {
                year: "Month",
                data: [
                  { name: "Rechrge", data: [] },
                  { name: "AEPS", data: [] },
                  { name: "Bill Payment", data: [] },
                  { name: "Money Transfer", data: [] },
                  { name: "Payot", data: [] },
                  { name: "Aadhar pay", data: [] },
                  { name: "mATM", data: [] },
                  { name: "Indo Nepal", data: [] },
                ],
              },
              {
                year: "Week",
                data: [
                  { name: "Rechrge", data: [] },
                  { name: "AEPS", data: [] },
                  { name: "Bill Payment", data: [] },
                  { name: "Money Transfer", data: [] },
                  { name: "Payot", data: [] },
                  { name: "Aadhar pay", data: [] },
                  { name: "mATM", data: [] },
                  { name: "Indo Nepal", data: [] },
                ],
              },
            ],
          }}
        />
      </Grid>
    </>
  );
}
