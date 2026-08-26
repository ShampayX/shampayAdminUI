import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
// @mui
import { Stack, Tabs, Button, Tab, Modal } from "@mui/material";
// redux
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Helmet } from "react-helmet-async";

import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Upload } from "src/components/upload";

import {
  Box,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  Typography,
  TableContainer,
} from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import Iconify from "src/components/iconify";
import React from "react";

import { ReadStream } from "fs";
import { MapSchemeSetting } from "src/routes/elements";
import { useAuthContext } from "src/auth/useAuthContext";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  category: string;
  question: string;
  answer: string;
};
type childProps = {
  vendorList: any;
  activeVendor: any;
  ProductId: string;
};

export default function VendorSwitchDetail({
  vendorList,
  activeVendor,
  ProductId,
}: childProps) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [vendorLists, setVendorList] = useState([]);
  const [venId, setVenId] = useState({ vendorName: "", _id: "" });
  const [activeV, setActiveV] = useState<any>();

  const [open, setOpen] = React.useState(false);
  const handleOpen = (val: any) => {
    setOpen(true);
    setVenId(val);
  };
  const handleClose = () => setOpen(false);

  const FilterSchema = Yup.object().shape({
    category: Yup.string().required(),
    question: Yup.string().required(),
    answer: Yup.string().required(),
  });

  const defaultValues = {
    category: "",
    question: "",
    answer: "",
  };
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

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    // border: '4px solid #00AB55',
    borderRadius: 3,
    boxShadow: 24,
    padding: "40px 32px",
    overflow: "auto",
  };

  useEffect(() => {
    setVendorList(vendorList);
    setActiveV(activeVendor);
  }, [vendorList]);

  const setActiveVendor = () => {
    let body = {
      productId: ProductId,
      vendorId: venId._id,
    };
    Api(`product/setActiveVendor`, "POST", body, "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setActiveV((item: any) => ({
            ...item,
            _id: venId._id,
          }));
          handleClose();
        } else {
        }
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            sm: "repeat(1, 0.5fr)",
          }}
          mt={5}
          ml={1}
        >
          {vendorLists.map((item: any) => {
            return (
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                key={item._id}
              >
                <Stack>
                  <Typography variant="h4">{item.vendorName}</Typography>
                  <Typography variant="body2">{item._id}</Typography>
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  {activeV._id == item._id ? (
                    <Button variant="contained" disabled>
                      Active
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleOpen(item)}
                    >
                      {" "}
                      Activate Now
                    </Button>
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Box>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
            }}
          >
            <Stack sx={{ whiteSpace: "nowrap" }}>
              <Typography sx={{ margin: "auto" }}>
                Are you sure to activate{" "}
                <span style={{ fontSize: "120%", fontWeight: 500 }}>
                  {venId.vendorName}
                </span>{" "}
                ?
              </Typography>
            </Stack>
          </Box>
          <Stack
            justifyContent={"center"}
            width={"fit-content"}
            flexDirection={"row"}
            gap={1}
            margin={"20px auto 0"}
          >
            <Button variant="contained" onClick={setActiveVendor}>
              Sure
            </Button>
            <Button variant="contained" onClick={handleClose}>
              Cancle
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}

// Test pipeline devops
