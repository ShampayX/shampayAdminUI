import {
  Autocomplete,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import { CustomAvatar } from "../custom-avatar";
import { sentenceCase } from "change-case";

type childProps = {
  payload: {
    searchBy: string;
    role: string;
    finalStatus: string;
  };
  onSelect: (value: any) => void;
};

var timer: any;
export default function CustomUserAutocomplete({
  payload,
  onSelect,
  ...other
}: childProps) {
  const { Api } = useAuthContext();
  const ref = React.useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = React.useState<string[] | undefined>();
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [options, setOptions] = React.useState([]);

  useEffect(() => {
    timer = setTimeout(() => {
      if (inputValue.length >= 3) {
        fetchOptions(inputValue);
      } else {
        setOptions([]);
        setIsLoading(false);
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  const fetchOptions = async (val: string | null) => {
    let body = {
      ...payload,
      searchInput: inputValue,
    };
    const token = localStorage.getItem("token");
    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setOptions(Response.data.data);
        }
      } else {
        enqueueSnackbar("Server Error", { variant: "error" });
      }
      setIsLoading(false);
    });
  };

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        (ref.current as any).blur();
        onSelect(newValue[0]);
        setValue(newValue);
      }}
      multiple
      freeSolo
      size="small"
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        value?.length !== 1
          ? setInputValue(newInputValue)
          : (ref.current as any).blur();
        value?.length !== 1 ? setIsLoading(true) : (ref.current as any).blur();
      }}
      loading={isLoading}
      disabled={!payload?.searchBy}
      options={options}
      getOptionLabel={(option: any) =>
        payload?.searchBy == "firstName"
          ? option?.firstName + " " + option?.lastName
          : payload?.searchBy == "userCode"
          ? option?.userCode
          : payload?.searchBy == "company_name"
          ? option?.company_name
          : payload?.searchBy == "email"
          ? option?.email
          : payload?.searchBy == "contact_no"
          ? option?.contact_no
          : null
      }
      renderOption={(props, option: any) => (
        <Stack
          component="li"
          {...props}
          flexDirection={"row"}
          alignItems={"center"}
          gap={1}
        >
          <CustomAvatar
            src={option?.selfie[0]}
            alt={option?.firstName}
            name={option?.firstName}
          />
          <Stack>
            <Typography variant="body2">
              {sentenceCase(option?.firstName || "")}{" "}
              {sentenceCase(option?.lastName || "")}
            </Typography>
            <Typography variant="body2">
              {sentenceCase(
                option?.role == "m_distributor"
                  ? "Master Distributor"
                  : option?.role || ""
              )}{" "}
              ({option?.userCode})
            </Typography>
          </Stack>
        </Stack>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={
            sentenceCase(payload?.searchBy || "") || "Please select searchBy"
          }
          variant="outlined"
          inputRef={ref}
          sx={{
            minWidth: 200,
          }}
          autoComplete="off"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      {...other}
    />
  );
}
