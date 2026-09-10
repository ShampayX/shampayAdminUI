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
  FormControl,
  Stack,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

type FormValuesProps = {
  vendorType: string;
  vendorID: any;
};

export default function Panneydrop() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [vlist, setVList] = useState([]);
  const [vlist2, setVList2] = useState([]);
  const [activeV, setActiveV] = useState([]);
  const [inputValue, setInputValue] = useState({
    vendorType: "",
    vendorID: "",
    vendorName: "",
  });
  const [inputValue2, setInputValue2] = useState({
    vendorType: "",
    vendorID: "",
    vendorName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditing2, setIsEditing2] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAPIDocumentation();
    userActive();
  }, []);

  const getAPIDocumentation = () => {
    let token = localStorage.getItem("token");
    Api(`admin/vendor/penny_drop/list`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setVList(Response.data.data);
          setVList2(Response.data.data);
          // setInputValue( Response.data.data);
          // setInputValue2(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const userActive = () => {
    let token = localStorage.getItem("token");
    Api(`admin/vendor/penny_drop/active`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setInputValue({
            vendorType: "API_User",
            vendorID: Response.data.data.API_User._id,
            vendorName: Response.data.data.API_User.vendorName,
          });
          setInputValue2({
            vendorType: "Distribution_Network",
            vendorID: Response.data.data.Distribution_Network._id,
            vendorName: Response.data.data.Distribution_Network.vendorName,
          });
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const SetVender = (val: any) => {
    let token = localStorage.getItem("token");
    setIsLoading(true);
    let body = {
      vendorType: val.vendorType,
      vendorID: val.vendorID,
    };
    Api("admin/vendor/penny_drop/switch", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setIsLoading(false);
          setIsEditing(false);
          setIsEditing2(false);
          enqueueSnackbar(Response.data.message);
        } else {
          notifyFailure(enqueueSnackbar, Response);
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
          <InputLabel id="demo-simple-select-label">API User</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={inputValue.vendorName}
            label="API_User"
            disabled={!isEditing}
            // onChange={(e: any) => setBank(e.target.value)}
          >
            {vlist.map((item: any, ind: number) => {
              return (
                <MenuItem
                  key={item._id}
                  value={item.vendorName}
                  onClick={() => {
                    setInputValue({
                      vendorType: "API_User",
                      vendorID: item._id,
                      vendorName: item.vendorName,
                    });
                  }}
                >
                  {item.vendorName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {isEditing ? (
          <LoadingButton
            variant="contained"
            onClick={() => SetVender(inputValue)}
          >
            Save
          </LoadingButton>
        ) : (
          <LoadingButton variant="contained" onClick={() => setIsEditing(true)}>
            Edit
          </LoadingButton>
        )}
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            Distribution Network
          </InputLabel>
          <Select
            fullWidth
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={inputValue2.vendorName}
            label="API_User"
            disabled={!isEditing2}
            // onChange={(e: any) => setBank(e.target.value)}
          >
            {vlist2.map((item: any, ind: number) => {
              return (
                <MenuItem
                  key={item._id}
                  value={item.vendorName}
                  onClick={() => {
                    setInputValue2({
                      vendorType: "Distribution_Network",
                      vendorID: item._id,
                      vendorName: item.vendorName,
                    });
                  }}
                >
                  {item.vendorName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {isEditing2 ? (
          <LoadingButton
            variant="contained"
            onClick={() => SetVender(inputValue2)}
          >
            Save
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="contained"
            onClick={() => setIsEditing2(true)}
          >
            Edit
          </LoadingButton>
        )}
      </Stack>
    </>
  );
}
