import React, { useState } from "react";
import { PageHeader, FilterBar, FilterSlot } from "src/components/page-kit";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import {
  Stack,
  Grid,
  Card,
  Box,
  Typography,
  Tabs,
  Tab,
  Pagination,
  Button,
  Container,
  Modal,
  MenuItem,
} from "@mui/material";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import FormProvider, { RHFTextField } from "src/components/hook-form";

import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

type FormValuesProps = {
  email: any;
};

type FormValuesPropspan = {
  panNumber: any;
};
function PanVarified() {
  const { Api } = useAuthContext();
  const [userData, setUserData] = useState({
    userfName: "",
    userlName: "",
    userEmail: "",
    userMobile: "",
    useID: "",
  });
  const [open, setOpen] = React.useState(false);
  const [userrecord, setUserRecord] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { enqueueSnackbar } = useSnackbar();

  const FilterSchema = Yup.object().shape({});

  const PanSchema = Yup.object().shape({
    panNumber: Yup.string()
      .required("PAN Card Number required")
      .uppercase()
      .matches(/[0-9]/, "Enter valid PAN")
      .matches(/[A-Z]/, "Enter valid PAN")
      .max(10)
      .length(10, "Enter Valid PAN Number"),
  });

  const defaultValues = {
    email: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const defaultValuesapn = {
    panNumber: "",
  };
  const methodspan = useForm<FormValuesPropspan>({
    resolver: yupResolver(PanSchema),
    defaultValues: defaultValuesapn,
  });
  const { reset: resetpan, handleSubmit: handleSubmitpan } = methodspan;

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    height: 250,
    bgcolor: "background.paper",
    border: "2px ",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  const searchTxnFilterData = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      searchBy: "email",
      searchInput: data.email,
    };
    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setUserData({
            userfName: Response?.data?.data[0]?.firstName,
            userlName: Response?.data?.data[0]?.lastName,
            userEmail: Response?.data?.data[0]?.email,
            userMobile: Response?.data?.data[0]?.contact_no,
            useID: Response?.data?.data[0]?._id,
          });
          setUserRecord(true);
          reset(defaultValues);
          enqueueSnackbar("User Detail found successfully", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("No Data Found", { variant: "error" });

          setUserRecord(false);
        }
      } else {
        enqueueSnackbar("No Data Found", { variant: "error" });
        setUserRecord(false);
      }
      // if (Response.code == 200) {
      //   enqueueSnackbar('No Data Found', { variant: 'error' });
      //   setUserRecord(false);
      // }
    });
  };

  const UpdatePan = (data: FormValuesPropspan) => {
    let token = localStorage.getItem("token");
    let body = {
      userId: userData.useID,
      first_name: userData.userfName,
      last_name: userData.userlName,
      PANnumber: data.panNumber,
    };
    Api(`admin/user_pan_update`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        enqueueSnackbar(Response.data.message, { variant: "success" });
        setOpen(false);
        setUserRecord(false);
        resetpan(defaultValuesapn);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Approve User PAN"
        subtitle="Look a user up by email, then review and approve their PAN."
      />

      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(searchTxnFilterData)}
      >
        <FilterBar>
          <FilterSlot icon={<PersonSearchOutlinedIcon />} grow minWidth={280}>
            <RHFTextField
              name="email"
              placeholder="Enter user email"
              variant="standard"
              InputProps={{ disableUnderline: true }}
            />
          </FilterSlot>

          <LoadingButton
            type="submit"
            variant="contained"
            sx={{ height: 48, px: 4, borderRadius: 1.5, fontWeight: 700 }}
          >
            Search
          </LoadingButton>
        </FilterBar>
      </FormProvider>

      {userrecord && (
        <Box
          display="grid"
          width={{
            xs: "50%",
            sm: "25%",
          }}
        >
          <Grid
            sx={{
              p: 2,
              marginTop: "20px",
              border: "1px dashed black",
              borderRadius: "10px",
            }}
          >
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              sx={{ p: 1 }}
            >
              <Typography variant="subtitle1">User Name : </Typography>
              <Typography variant="body1">
                {" "}
                {userData.userfName} {userData.userlName}
              </Typography>
            </Stack>

            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              sx={{ p: 1 }}
            >
              <Typography variant="subtitle1"> Email : </Typography>
              <Typography variant="body1">{userData.userEmail}</Typography>
            </Stack>

            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              sx={{ p: 1 }}
            >
              <Typography variant="subtitle1"> Mobile : </Typography>
              <Typography variant="body1">{userData.userMobile}</Typography>
            </Stack>

            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              sx={{ p: 1 }}
            >
              <Typography variant="subtitle1">User PAN : </Typography>
              <Typography variant="body1">
                <Button onClick={handleOpen} variant="contained">
                  PAN Verify
                </Button>
              </Typography>
            </Stack>
          </Grid>
        </Box>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="transition-modal-title"
            variant="h6"
            component="h2"
            sx={{ marginBottom: 2 }}
          >
            User PAN
          </Typography>
          <FormProvider
            methods={methodspan}
            onSubmit={handleSubmitpan(UpdatePan)}
          >
            <Box
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <RHFTextField
                name="panNumber"
                label="Pan Number"
                placeholder="Ender User PAN"
                size="small"
              />
              <Stack sx={{ p: 4 }}>
                <Button
                  onClick={handleOpen}
                  variant="contained"
                  type="submit"
                  size="medium"
                >
                  Submit
                </Button>
              </Stack>
            </Box>
          </FormProvider>
        </Box>
      </Modal>
    </>
  );
}

export default PanVarified;
