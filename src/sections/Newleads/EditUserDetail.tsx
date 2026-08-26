import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form/FormProvider";
import { RHFSelect, RHFTextField, RHFUpload } from "src/components/hook-form";
import {
  Typography,
  Button,
  Stack,
  Grid,
  CardHeader,
  CardContent,
  Card,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Beenhere";
import { CustomAvatar } from "src/components/custom-avatar";
import { sentenceCase } from "change-case";
import Image from "src/components/image/Image";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
import MotionModal from "src/components/animate/MotionModal";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import Compressor from "compressorjs";

import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";

export default function EditUserDetail() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const { id } = state || {};
  const [userDetail, setUserDetail] = useState<any>({
    shopAddress: "",
    GSTNumber: "",
    PAN_Company_number: "",
    localityInAadhar: "",
    comapany_vtc: "",
    company_name: "",
    company_address: "",
    constitutionType: "",
    PANFile: "",
    GSTFile: "",
    PANFile_Company: "",
    aadharFileUrl: "",
    aadharBackUrl: "",
    selfie: [""],
    shopImage: [""],
    Cancelled_Cheque_File: "",
    AOA_File: "",
    Board_Resolution_File: "",
    COI_File: "",
    Consent_Letter_File: "",
    DPIN_File: "",
    MOA_File: "",
    Partnership_deed_File: "",
  });

  const updateUser = () => {
    setLoading(true);
    const body = {
      userId: id,
    };
    Api(`admin/getDetail_Agent`, "POST", body, "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setUserDetail(Response.data?.data);
        }
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    const body = {
      userId: id,
    };
    Api(`admin/getDetail_Agent`, "POST", body, "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setUserDetail(Response.data?.data);
        }
        setLoading(false);
      }
    });

    if (!id) {
      navigate("/auth/newleads");
    }
  }, [id]);

  const userDetailFormat = (name: string, value: any) => {
    return (
      <Stack flexDirection={"row"} justifyContent={"space-between"} mt={1}>
        <Typography variant="subtitle1" noWrap>
          {name} :{" "}
        </Typography>
        <Typography variant="subtitle1">{value}</Typography>
      </Stack>
    );
  };

  if (loading) {
    // The screen is a grid of profile cards, not a table.
    return <ApiDataLoading variant="cards" rows={3} />;
  }

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Card sx={{ p: 1 }}>
                <Stack flexDirection={"row"} justifyContent={"center"}>
                  <CustomAvatar
                    name={userDetail?.firstName}
                    alt={userDetail?.selfie && userDetail.selfie[0]}
                    src={userDetail?.selfie && userDetail.selfie[0]}
                    sx={{ width: 250, height: 250 }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" gap={2} mt={2}>
                  <Stack>
                    <Typography variant="subtitle1">
                      {userDetail?.firstName &&
                        sentenceCase(userDetail?.firstName || "")}{" "}
                      {userDetail?.lastName &&
                        sentenceCase(userDetail?.lastName || "")}
                    </Typography>
                    <Typography variant="subtitle2">
                      {userDetail?.role === "agent"
                        ? "Agent"
                        : userDetail?.role === "distributor"
                        ? "Distributor"
                        : userDetail?.role === "m_distributor"
                        ? "Master Distributor"
                        : null}{" "}
                      ({userDetail?.userCode})
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
              <Stack mt={2}>
                {userDetailFormat("Contact No", userDetail?.contact_no || "")}
                {userDetailFormat("Email", userDetail?.email || "")}
                {userDetailFormat("Aadhaar", userDetail?.aadharNumber || "")}
                {userDetailFormat("Pan", userDetail?.PANnumber || "")}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h3">Edit User Detail</Typography>
          <Grid
            display={"grid"}
            gap={2}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            }}
            height={"fit-content"}
          >
            <EdDitInputField
              name="firstName"
              label="First Name"
              isDisabled={false}
              value={userDetail?.firstName}
            />
            <EdDitInputField
              name="lastName"
              label="Last Name"
              isDisabled={false}
              value={userDetail?.lastName}
            />
            <EdDitInputField
              name="shopAddress"
              label="Shop Address"
              isDisabled={false}
              value={userDetail?.shopAddress}
            />
            <EdDitInputField
              name="comapany_vtc"
              label="Company City"
              isDisabled={false}
              value={userDetail?.comapany_vtc}
            />
            <EdDitInputField
              name="GSTNumber"
              label="GST Number"
              isDisabled={false}
              value={userDetail?.GSTNumber}
            />
            <EdDitInputField
              name="PANnumber"
              label="PAN Number"
              isDisabled={false}
              value={userDetail?.PANnumber}
            />
            <EdDitInputField
              name="PAN_Company_number"
              label="Company PAN Number"
              isDisabled={false}
              value={userDetail?.PAN_Company_number}
            />
            <EdDitInputField
              name="localityInAadhar"
              label="Locality In Aadhaar"
              isDisabled={false}
              value={userDetail?.localityInAadhar}
            />
            <EdDitInputField
              name="company_name"
              label="Company Name"
              isDisabled={false}
              value={userDetail?.company_name}
            />
            <EdDitInputField
              name="company_address"
              label="Company Address"
              isDisabled={false}
              value={userDetail?.company_address}
            />
            <EditSelectField
              name="constitutionType"
              label="Constitution Type"
              isDisabled={false}
              value={userDetail?.constitutionType}
            />
          </Grid>
          <Typography variant="h3" mt={3}>
            Documents
          </Typography>
          <Grid
            display={"grid"}
            gap={2}
            mt={2}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            }}
            height={"fit-content"}
          >
            <EditUploadInput
              name="PANFile"
              value={userDetail?.PANFile}
              updateUser={updateUser}
              isDisabled={false}
              label="PAN File"
            />
            <EditUploadInput
              name="GSTFile"
              value={userDetail?.GSTFile}
              updateUser={updateUser}
              isDisabled={false}
              label="GST File"
            />
            <EditUploadInput
              name="PANFile_Company"
              value={userDetail?.PANFile_Company}
              updateUser={updateUser}
              isDisabled={false}
              label="Company PAN File"
            />
            <EditUploadInput
              name="aadharFileUrl"
              value={userDetail?.aadharFileUrl}
              isDisabled={false}
              updateUser={updateUser}
              label="Front Aadhaar File"
            />
            <EditUploadInput
              name="aadharBackUrl"
              value={userDetail?.aadharBackUrl}
              updateUser={updateUser}
              isDisabled={false}
              label="Back Aadhaar File"
            />
            <EditUploadInput
              name="selfie"
              value={userDetail?.selfie[0]}
              updateUser={updateUser}
              isDisabled={false}
              label="Selfie"
            />
            <EditUploadInput
              name="shopImage"
              value={userDetail?.shopImage[0]}
              updateUser={updateUser}
              isDisabled={false}
              label="Shop Image"
            />
            <EditUploadInput
              name="Cancelled_Cheque_File"
              value={userDetail?.Cancelled_Cheque_File}
              updateUser={updateUser}
              isDisabled={false}
              label="Cancelled Cheque File"
            />
            <EditUploadInput
              name="AOA_File"
              value={userDetail?.AOA_File}
              updateUser={updateUser}
              isDisabled={false}
              label="AOA File"
            />
            <EditUploadInput
              name="Board_Resolution_File"
              value={userDetail?.Board_Resolution_File}
              updateUser={updateUser}
              isDisabled={false}
              label="Board Resolution File"
            />
            <EditUploadInput
              name="COI_File"
              value={userDetail?.COI_File}
              updateUser={updateUser}
              isDisabled={false}
              label="COI File"
            />
            <EditUploadInput
              name="Consent_Letter_File"
              value={userDetail?.Consent_Letter_File}
              updateUser={updateUser}
              isDisabled={false}
              label="Consent Letter File"
            />
            <EditUploadInput
              name="DPIN_File"
              value={userDetail?.DPIN_File}
              updateUser={updateUser}
              isDisabled={false}
              label="DPIN File"
            />
            <EditUploadInput
              name="MOA_File"
              value={userDetail?.MOA_File}
              updateUser={updateUser}
              isDisabled={false}
              label="MOA File"
            />
            <EditUploadInput
              name="MOA_File"
              value={userDetail?.MOA_File}
              updateUser={updateUser}
              isDisabled={false}
              label="Partnership deed File"
            />
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

type childProps = {
  name: string;
  label: string;
  isDisabled: boolean;
  updateUser?: any;
  value: string;
};

const EditSelectField = ({
  name,
  label,
  isDisabled,
  updateUser,
  value,
}: childProps) => {
  const { Api } = useAuthContext();
  const [isEdit, setIsEdit] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { state } = useLocation();
  const { id } = state || {};

  type form = {
    name: string;
  };
  const txnSchema = Yup.object().shape({
    [name]: Yup.string().required(`${label} is required`),
  });

  const defaultValues = {
    [name]: value,
  };

  const methods = useForm<form>({
    resolver: yupResolver(txnSchema),
    defaultValues,
    mode: "all",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onUpdate = async (data: form) => {
    await fetchLocation();
    try {
      let token = localStorage.getItem("token");
      let body = { ...data };
      isEdit &&
        (await Api(`admin/edit_user/${id}`, "POST", body, token).then(
          (Response: any) => {
            if (Response?.status == 200) {
              if (Response.data.code == 200) {
                setIsEdit((prevState) => !prevState);
                enqueueSnackbar(Response.data.message);
              } else {
                enqueueSnackbar(Response.data.message, {
                  variant: "error",
                });
              }
            } else {
              enqueueSnackbar("Failed", {
                variant: "error",
              });
            }
          }
        ));
    } catch (e) {}
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onUpdate)}>
      <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
        <RHFSelect
          name={name}
          label={label}
          disabled={isDisabled || !isEdit}
          variant={isDisabled ? "filled" : "outlined"}
          SelectProps={{
            native: false,
            sx: { textTransform: "capitalize" },
          }}
        >
          <MenuItem value="Individual">Individual</MenuItem>
          <MenuItem value="Proprietorship">Proprietorship</MenuItem>
          <MenuItem value="Private Limited Company">
            Private Limited Company
          </MenuItem>
          <MenuItem value="Partnership">Partnership</MenuItem>
          <MenuItem value="Limited Liability Partnership">
            Limited Liability Partnership
          </MenuItem>
          <MenuItem value="One Person Company">One Person Company</MenuItem>
          <MenuItem value="Limited Company">Limited Company</MenuItem>
        </RHFSelect>

        {!isDisabled &&
          (isEdit ? (
            <LoadingButton type="submit" loading={isSubmitting}>
              <SaveIcon sx={{ cursor: "pointer" }} />
            </LoadingButton>
          ) : (
            <Button onClick={() => setIsEdit(true)}>
              <EditIcon sx={{ cursor: "pointer" }} />
            </Button>
          ))}
      </Stack>
    </FormProvider>
  );
};
const EdDitInputField = ({
  name,
  label,
  isDisabled,
  updateUser,
  value,
}: childProps) => {
  const { Api } = useAuthContext();
  const [isEdit, setIsEdit] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { state } = useLocation();
  const { id } = state || {};

  type form = {
    name: string;
  };
  const txnSchema = Yup.object().shape({
    [name]: Yup.string().required(`${label} is required`),
  });

  const defaultValues = {
    [name]: value,
  };

  const methods = useForm<form>({
    resolver: yupResolver(txnSchema),
    defaultValues,
    mode: "all",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onUpdate = async (data: form) => {
    try {
      let token = localStorage.getItem("token");
      let body = { ...data };
      isEdit &&
        (await Api(`admin/edit_user/${id}`, "POST", body, token).then(
          (Response: any) => {
            if (Response?.status == 200) {
              if (Response.data.code == 200) {
                setIsEdit((prevState) => !prevState);
                enqueueSnackbar(Response.data.message);
              } else {
                enqueueSnackbar(Response.data.message, {
                  variant: "error",
                });
              }
            } else {
              enqueueSnackbar("Failed", {
                variant: "error",
              });
            }
          }
        ));
    } catch (e) {}
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onUpdate)}>
      <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
        <RHFTextField
          name={name}
          label={label}
          disabled={isDisabled || !isEdit}
          variant={isDisabled ? "filled" : "outlined"}
        />

        {!isDisabled &&
          (isEdit ? (
            <LoadingButton type="submit" loading={isSubmitting}>
              <SaveIcon sx={{ cursor: "pointer" }} />
            </LoadingButton>
          ) : (
            <Button onClick={() => setIsEdit(true)}>
              <EditIcon sx={{ cursor: "pointer" }} />
            </Button>
          ))}
      </Stack>
    </FormProvider>
  );
};

const EditUploadInput = ({
  name,
  label,
  isDisabled,
  updateUser,
  value,
}: childProps) => {
  const { Api, UploadFileApi } = useAuthContext();
  const [isEdit, setIsEdit] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { state } = useLocation();
  const { id } = state || {};

  const [uploadFile, setUploadFile] = useState<any>();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
    setValue("cover", null);
  };

  type form = {
    cover: string | null;
    imageData: any;
  };
  const txnSchema = Yup.object().shape({});

  const defaultValues = {
    cover: null,
    imageData: null,
  };

  const methods = useForm<form>({
    resolver: yupResolver(txnSchema),
    defaultValues,
    mode: "all",
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setValue("imageData", file);
    const newFile = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });
    if (file) {
      setValue("cover", newFile.preview);
    }
  }, []);

  const handleRemoveFile = () => {
    setValue("cover", null);
  };

  const onUpload = async (data: form) => {
    setUploadLoading(true);
    let token = localStorage.getItem("token");
    new Compressor(data?.imageData, {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: async (compressedResult: any) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "other_documents");
        await UploadFileApi(
          `upload/admin_upload_agent_doc/${id}`,
          formData,
          token
        ).then((Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.status == "success") {
              Api(
                `admin/edit_user/${id}`,
                "POST",
                { [name]: Response.data.filePath },
                token
              ).then((Response: any) => {
                if (Response?.status == 200) {
                  if (Response.data.code == 200) {
                    enqueueSnackbar(Response.data.message);
                  } else {
                    enqueueSnackbar(Response.data.message, {
                      variant: "error",
                    });
                  }
                } else {
                  enqueueSnackbar("Failed", {
                    variant: "error",
                  });
                }
                handleClose1();
                updateUser();
                setUploadLoading(false);
              });
            } else {
              enqueueSnackbar("Server didn`t response", {
                variant: "error",
              });
            }
          } else {
            enqueueSnackbar("Failed", {
              variant: "error",
            });
          }
          setUploadLoading(false);
        });
      },
    });
  };

  return (
    <Card
      sx={{
        p: 1,
        transform: "scale(1)",
        transition: "transform 0.5s",
        "&:hover": {
          transform: "scale(1.05)",
          transition: "transform 0.5s",
        },
      }}
    >
      <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={1}
        mb={0.5}
      >
        <Typography variant="subtitle1">{label}</Typography>
        {!isDisabled &&
          (isEdit ? (
            <SaveIcon sx={{ cursor: "pointer" }} />
          ) : (
            <EditIcon onClick={handleOpen1} sx={{ cursor: "pointer" }} />
          ))}
      </Stack>
      <Stack
        width={350}
        minHeight={300}
        alignItems={"center"}
        justifyContent={"center"}
        flexDirection={"row"}
      >
        <Image
          src={AwsDocSign(value)}
          alt={label}
          sx={{
            maxHeight: 400,
            "&:hover": {
              cursor: "zoom-in",
            },
          }}
          onClick={handleOpen}
        />

        {!value && (
          <Typography variant="subtitle1" textAlign={"center"}>
            No File Uploaded
          </Typography>
        )}
      </Stack>

      <MotionModal open={open}>
        <Stack>
          <Scrollbar sx={{ maxHeight: { xs: 400, md: 700 } }}>
            <Image src={AwsDocSign(value)} alt="lable" />
          </Scrollbar>
        </Stack>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ alignSelf: "end", mt: 1 }}
        >
          Close
        </Button>
      </MotionModal>

      <MotionModal open={open1}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onUpload)}>
          <Stack>
            <RHFUpload
              name="cover"
              maxSize={3145728}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
            />
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"end"} gap={1} mt={1}>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={uploadLoading}
            >
              Upload
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              loading={isSubmitting}
              onClick={handleClose1}
            >
              Close
            </LoadingButton>
          </Stack>
        </FormProvider>
      </MotionModal>
    </Card>
  );
};
