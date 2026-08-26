// import * as React from 'react';
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  Switch,
  SwitchProps,
  FormControl,
  Stack,
  Typography,
  styled,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";

export default function PartnerBilling() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [vlist, setVList] = useState([]);
  const [settelementV, setSettelementV] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [activesetellementValue, setActivesetellementValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [issettelementEditing, setIssettelementEditing] = useState(false);
  const [oflineaadhar, setAadharOfline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState();

  useEffect(() => {
    getAPIDocumentation();
    SellementVendor();
  }, []);

  const updateSettelementV = (val: any) => {
    setActivesetellementValue(val?.vendorName);
    setUserId(val?._id);
  };

  const getAPIDocumentation = () => {
    Api(`admin/get_KYC_Vendor`, "GET", "", "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setVList(Response.data.data);

          setInputValue(Response.data.activeVendor);
        } else {
        }
      }
    });
  };
  const SetVender = () => {
    setIsLoading(true);
    let body = {
      vendorName: inputValue,
    };
    Api("admin/set_KYC_Vendor", "POST", body, "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setIsLoading(false);
          setIsEditing(false);
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  const SellementVendor = () => {
    let token = localStorage.getItem("token");
    Api(`admin/get_settlement_vendor`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setSettelementV(Response.data.data);
          } else {
          }
        }
      }
    );
  };

  const SetsettelementVender = () => {
    let token = localStorage.getItem("token");
    Api(`admin/settlement_vendor_switch/${userId}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setIssettelementEditing(false);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  const IOSSwitch = styled((props: SwitchProps) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "#65C466",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#33cf4d",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: "#ff0000",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));

  useEffect(() => {
    let token = localStorage.getItem("token");
    Api(`admin/get_kyc_switch_offline`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setAadharOfline(Response?.data?.isAadhaarOffline);
          } else {
          }
        }
      }
    );
  }, []);

  const updateStatus = () => {
    let body = {
      isAadhaarOffline: !oflineaadhar,
    };
    let token = localStorage.getItem("token");
    Api("admin/kyc_switch_office", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setAadharOfline(Response?.data?.isAadhaarOffline);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  return (
    <>
      <Stack
        flexDirection={"row"}
        gap={2}
        sx={{ width: { xs: "95%", md: 500 } }}
      >
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Active vendor</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={inputValue}
            label="Active vendor"
            disabled={!isEditing}
            // onChange={(e: any) => setBank(e.target.value)}
          >
            {vlist.map((item: any, ind: number) => {
              return (
                <MenuItem
                  key={item}
                  value={item}
                  onClick={() => {
                    setInputValue(item);
                  }}
                >
                  {item}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {isEditing ? (
          <LoadingButton variant="contained" onClick={SetVender}>
            Save
          </LoadingButton>
        ) : (
          <LoadingButton variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </LoadingButton>
        )}
      </Stack>

      <Stack p={2} flexDirection="row" gap={2}>
        <Typography variant="h5">Aadhar Ofline Switch :</Typography>
        <IOSSwitch
          color="error"
          checked={oflineaadhar}
          onChange={() => updateStatus()}
        />
      </Stack>

      {/* <Stack
        flexDirection={"row"}
        gap={2}
        sx={{ width: { xs: "95%", md: 500 } }}
      >
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            Settlement Vendor
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={activesetellementValue}
            label="Active vendor"
            disabled={!issettelementEditing}
          >
            {settelementV.map((item: any, ind: number) => {
              return (
                <MenuItem
                  key={item}
                  value={item?.vendorName}
                  onClick={() => {
                    updateSettelementV(item);
                  }}
                >
                  {item?.vendorName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {issettelementEditing ? (
          <LoadingButton variant="contained" onClick={SetsettelementVender}>
            Save
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="contained"
            onClick={() => setIssettelementEditing(true)}
          >
            Edit
          </LoadingButton>
        )}
      </Stack> */}
    </>
  );
}
