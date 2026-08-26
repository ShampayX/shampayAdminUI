import { Helmet } from "react-helmet-async";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Stack,
  Button,
  Typography,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  MenuItem,
  Modal,
  Grid,
  Box,
} from "@mui/material";
import { PATH_DASHBOARD } from "src/routes/paths";
import * as React from "react";
import { useSnackbar } from "../components/snackbar";

// ----------------------------------------------------------------------

import Image from "src/components/image/Image";
import { LoadingButton } from "@mui/lab";
import FormProvider from "src/components/hook-form/FormProvider";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import demoImage from "../assets/icons/IMG.svg";

import AwsDocSign from "../components/CustomFunction/AwsDocSign";
import { fDateTime } from "src/utils/formatTime";

import AWS from "aws-sdk";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";

type FormValuesProps = {
  //aadhaar Front
  aadhaarFrontIsApproved: boolean | null;
  aadhaarFrontReason: string;
  aadhaarFrontAdditional_comment: string;

  //aadhaar Back
  aadhaarBackIsApproved: boolean | null;
  aadhaarBackReason: string;
  aadhaarBackAdditional_comment: string;

  //pan
  panIsApproved: boolean | null;
  panReason: string;
  panAdditional_comment: string;

  //gst
  gstIsApproved: boolean | null;
  gstReason: string;
  gstAdditional_comment: string;

  //DPIN_FileIsApproved
  DPIN_FileIsApproved: boolean | null;
  DPIN_FileReason: string;
  DPIN_FileIsAdditional_comment: string;

  //MOA_FileIsApproved
  MOA_FileIsApproved: boolean | null;
  MOA_FileReason: string;
  MOA_FileAdditional_comment: string;

  //COI_FileAdditional_comment
  COI_FileIsApproved: boolean | null;
  COI_FileReason: string;
  COI_FileAdditional_comment: string;

  //AOA_File
  AOA_FileIsApproved: boolean | null;
  AOA_FileReason: string;
  AOA_FileAdditional_comment: string;

  //Board_Resolution_File
  Board_Resolution_FileIsApproved: boolean | null;
  Board_Resolution_FileReason: string;
  Board_Resolution_FileAdditional_comment: string;

  //pan business
  panBusinessIsApproved: boolean | null;
  panBusinessReason: string;
  panBusinessAdditional_comment: string;

  // Consent Letter FileReason
  Consent_Letter_FileIsApproved: boolean | null;
  Consent_Letter_FileReason: string;
  Consent_Letter_FileAdditional_comment: string;

  //Partnership_deed_File
  Partnership_deed_FileIsApproved: boolean | null;
  Partnership_deed_FileReason: string;
  Partnership_deed_FileAdditional_comment: string;

  //cancelled check
  cancelledChequeIsApproved: boolean | null;
  cancelledChequeReason: string;
  cancelledChequeAdditional_comment: string;

  //selfie
  selfieIsApproved: boolean | null;
  selfieReason: string;
  selfieAdditional_comment: string;

  //shop image
  shopImageIsApproved: boolean | null;
  shopImageReason: string;
  shopImageAdditional_comment: string;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  boxShadow: 24,
  borderRadius: 1,
  p: 4,
};

export default function NewLeadSteps() {
  const { Api } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [img, setImg] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [open, setOpen] = React.useState(false);
  const handleOpen = (val: string) => {
    setImg(val);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const { state } = useLocation();
  const { id } = state || {};
  const [value, setValues] = useState({
    userCode: "",
    application_no: "",
    role: "",
    firstName: "",
    lastName: "",
    contact_no: "",
    email: "",
    GSTNumber: "",
    GSTFile: "",
    DPIN_File: "",
    AOA_File: "",
    COI_File: "",
    MOA_File: "",
    Board_Resolution_File: "",
    PANFile_Company: "",
    Consent_Letter_File: "",
    Partnership_deed_File: "",
    PAN_Company_number: "",
    PANnumber: "",
    PANFile: "",
    Cancelled_Cheque_File: "",
    dob: "",
    aadharNumber: "",
    aadharFileUrl: "",
    aadharBackUrl: "",
    addressInAadhar: "",
    localityInAadhar: "",
    aadharpincode: "",
    cityInAadhar: "",
    distInAadhar: "",
    docFileUrl: "",
    selfie: [""],
    shopImage: ["", "", ""],
    shopAddStatus: "",
    governanceStatus: "",
    identityStatus: "",
    verificationStatus: "",
    approvalNotes: "",
    referralCode: "",
    referralList: [],
    company_name: "",
    constitutionType: "",
    isGST: null,
  });

  const accountValidate = Yup.object().shape({
    //aadhaar front
    aadhaarFrontIsApproved: Yup.boolean().required(
      `Please Check Aadhaar Front`
    ),
    aadhaarFrontReason: Yup.string().when("aadhaarFrontIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    aadhaarFrontAdditional_comment: Yup.string().when("aadhaarFrontReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //aadhaar back
    aadhaarBackIsApproved: Yup.boolean().required(`Please Check Aadhaar Back`),
    aadhaarBackReason: Yup.string().when("aadhaarBackIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    aadhaarBackAdditional_comment: Yup.string().when("aadhaarBackReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //pan
    panIsApproved: Yup.boolean().required(`Please Check Pan`),
    panReason: Yup.string().when("panIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    panAdditional_comment: Yup.string().when("panReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //gst
    gstIsApproved: Yup.boolean().required(`Please Check GST`),
    gstReason: Yup.string().when("gstIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    gstAdditional_comment: Yup.string().when("gstReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //gst
    DPIN_FileIsApproved: Yup.boolean().required(`Please Check GST`),
    DPIN_FileReason: Yup.string().when("DPIN_FileIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    DPIN_FileIsAdditional_comment: Yup.string().when("DPIN_FileReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //AOA_FileIsApproved
    AOA_FileIsApproved: Yup.boolean().required(`Please Check GST`),
    AOA_FileReason: Yup.string().when("AOA_FileIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    AOA_FileAdditional_comment: Yup.string().when("AOA_FileReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //MOA_FileIsApproved
    MOA_FileIsApproved: Yup.boolean().required(`Please Check GST`),
    MOA_FileReason: Yup.string().when("MOA_FileIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    MOA_FileAdditional_comment: Yup.string().when("MOA_FileReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //COI_FileIsApproved
    COI_FileIsApproved: Yup.boolean().required(`Please Check GST`),
    COI_FileReason: Yup.string().when("COI_FileIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    COI_FileAdditional_comment: Yup.string().when("COI_FileReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //Board_Resolution_FileReason
    Board_Resolution_FileIsApproved: Yup.boolean().required(`Please Check GST`),
    Board_Resolution_FileReason: Yup.string().when(
      "Board_Resolution_FileIsApproved",
      {
        is: false,
        then: Yup.string().required("Please select Reason"),
      }
    ),
    Board_Resolution_FileAdditional_comment: Yup.string().when(
      "Board_Resolution_FileReason",
      {
        is: "Other",
        then: Yup.string().required("Please provide Additional Comment"),
      }
    ),

    //pan business
    panBusinessIsApproved: Yup.boolean().required(`Please Check Pan business`),
    panBusinessReason: Yup.string().when("panBusinessIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    panBusinessAdditional_comment: Yup.string().when("panBusinessReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //Consent Letter FileReason
    Consent_Letter_FileIsApproved: Yup.boolean().required(
      `Please Check Pan business`
    ),
    Consent_Letter_FileReason: Yup.string().when(
      "Consent_Letter_FileIsApproved",
      {
        is: false,
        then: Yup.string().required("Please select Reason"),
      }
    ),
    Consent_Letter_FileAdditional_comment: Yup.string().when(
      "Consent_Letter_FileReason",
      {
        is: "Other",
        then: Yup.string().required("Please provide Additional Comment"),
      }
    ),

    //Partner Deed
    Partnership_deed_FileIsApproved: Yup.boolean().required(
      `Please Check Pan business`
    ),
    Partnership_deed_FileReason: Yup.string().when(
      "Partnership_deed_FileIsApproved",
      {
        is: false,
        then: Yup.string().required("Please select Reason"),
      }
    ),
    Partnership_deed_FileAdditional_comment: Yup.string().when(
      "Partnership_deed_FileReason",
      {
        is: "Other",
        then: Yup.string().required("Please provide Additional Comment"),
      }
    ),

    //cancelled check
    cancelledChequeIsApproved: Yup.boolean().required(
      `Please Check Cancelled cheque`
    ),
    cancelledChequeReason: Yup.string().when("cancelledChequeIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    cancelledChequeAdditional_comment: Yup.string().when(
      "cancelledChequeReason",
      {
        is: "Other",
        then: Yup.string().required("Please provide Additional Comment"),
      }
    ),

    //selfie
    selfieIsApproved: Yup.boolean().required(`Please Check Selfie`),
    selfieReason: Yup.string().when("selfieIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    selfieAdditional_comment: Yup.string().when("selfieReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),

    //shop image
    shopImageIsApproved: Yup.boolean().required(`Please Check Shop image`),
    shopImageReason: Yup.string().when("shopImageIsApproved", {
      is: false,
      then: Yup.string().required("Please select Reason"),
    }),
    shopImageAdditional_comment: Yup.string().when("shopImageReason", {
      is: "Other",
      then: Yup.string().required("Please provide Additional Comment"),
    }),
  });

  const defaultValues = {
    aadhaarFrontIsApproved: null,
    aadhaarFrontReason: "",
    aadhaarFrontAdditional_comment: "",
    aadhaarBackIsApproved: null,
    aadhaarBackReason: "",
    aadhaarBackAdditional_comment: "",
    panIsApproved: null,
    panReason: "",
    panAdditional_comment: "",
    gstIsApproved: null,
    DPIN_FileIsApproved: null,
    AOA_FileIsApproved: null,
    COI_FileIsApproved: null,
    MOA_FileIsApproved: null,
    Board_Resolution_FileIsApproved: null,
    gstReason: "",
    DPIN_FileReason: "",
    AOA_FileReason: "",
    COI_FileReason: "",
    MOA_FileReason: "",
    Board_Resolution_FileReason: "",
    gstAdditional_comment: "",
    DPIN_FileIsAdditional_comment: "",
    AOA_FileAdditional_comment: "",
    COI_FileAdditional_comment: "",
    MOA_FileAdditional_comment: "",
    Board_Resolution_FileAdditional_comment: "",
    panBusinessIsApproved: null,
    Consent_Letter_FileIsApproved: null,
    Partnership_deed_FileIsApproved: null,
    panBusinessReason: "",
    Consent_Letter_FileReason: "",
    Partnership_deed_FileReason: "",
    panBusinessAdditional_comment: "",
    Consent_Letter_FileAdditional_comment: "",
    Partnership_deed_FileAdditional_comment: "",
    cancelledChequeIsApproved: null,
    cancelledChequeReason: "",
    cancelledChequeAdditional_comment: "",
    selfieIsApproved: null,
    selfieReason: "",
    selfieAdditional_comment: "",
    shopImageIsApproved: null,
    shopImageReason: "",
    shopImageAdditional_comment: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
    mode: "all",
  });
  const {
    setValue,
    watch,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getAgentDetail(id);
  }, []);

  const getAgentDetail = (val: string) => {
    const body = {
      userId: val,
    };
    Api(`admin/getDetail_Agent`, "POST", body, "").then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setValues(Response.data?.data || {});
        } else {
        }
      }
    });
  };

  const submitProfile = async (data: FormValuesProps) => {
    try {
      const body = {
        userId: id,
        role: value.role,
        approvalNotes: [
          {
            notes: {
              documentName: "aadharfront",
              isApproved: data.aadhaarFrontIsApproved,
              reason: data.aadhaarFrontReason,
              additional_comment: data.aadhaarFrontAdditional_comment,
            },
          },
          {
            notes: {
              documentName: "aadharback",
              isApproved: data.aadhaarBackIsApproved,
              reason: data.aadhaarBackReason,
              additional_comment: data.aadhaarBackAdditional_comment,
            },
          },
          {
            notes: {
              documentName: "pan card",
              isApproved: data.panIsApproved,
              reason: data.panReason,
              additional_comment: data.panAdditional_comment,
            },
          },
          {
            notes: {
              documentName: "GST",
              isApproved: data.gstIsApproved,
              reason: data.gstReason,
              additional_comment: data.gstAdditional_comment,
            },
          },
          {
            notes: {
              documentName: "DPIN File",
              isApproved: data.DPIN_FileIsApproved,
              reason: data.DPIN_FileReason,
              additional_comment: data.DPIN_FileIsAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "AOA File",
              isApproved: data.AOA_FileIsApproved,
              reason: data.AOA_FileReason,
              additional_comment: data.AOA_FileAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "COI File",
              isApproved: data.COI_FileIsApproved,
              reason: data.COI_FileReason,
              additional_comment: data.COI_FileAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "MOA File",
              isApproved: data.MOA_FileIsApproved,
              reason: data.MOA_FileReason,
              additional_comment: data.MOA_FileAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "Board Resolution FileIsApproved",
              isApproved: data.Board_Resolution_FileIsApproved,
              reason: data.Board_Resolution_FileReason,
              additional_comment: data.Board_Resolution_FileAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "PAN Buss",
              isApproved: data.panBusinessIsApproved,
              reason: data.panBusinessReason,
              additional_comment: data.panBusinessAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "Consent Letter File",
              isApproved: data.Consent_Letter_FileIsApproved,
              reason: data.Consent_Letter_FileReason,
              additional_comment: data.Consent_Letter_FileAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "Partner Deed",
              isApproved: data.Partnership_deed_FileIsApproved,
              reason: data.Partnership_deed_FileReason,
              additional_comment: data.Partnership_deed_FileAdditional_comment,
            },
          },

          {
            notes: {
              documentName: "Cancelled Cheque",
              isApproved: data.cancelledChequeIsApproved,
              reason: data.cancelledChequeReason,
              additional_comment: data.cancelledChequeAdditional_comment,
            },
          },
          {
            notes: {
              documentName: "Selfie",
              isApproved: data.selfieIsApproved,
              reason: data.selfieReason,
              additional_comment: data.selfieAdditional_comment,
            },
          },
          {
            notes: {
              documentName: "Shop Images",
              isApproved: data.shopImageIsApproved,
              reason: data.shopImageReason,
              additional_comment: data.shopImageAdditional_comment,
            },
          },
        ],
        status:
          data.aadhaarFrontIsApproved &&
          data.aadhaarBackIsApproved &&
          data.panIsApproved &&
          data.gstIsApproved &&
          data.DPIN_FileIsApproved &&
          data.AOA_FileIsApproved &&
          data.COI_FileIsApproved &&
          data.MOA_FileIsApproved &&
          data.Board_Resolution_FileIsApproved &&
          data.panBusinessIsApproved &&
          data.Consent_Letter_FileIsApproved &&
          data.Partnership_deed_FileIsApproved &&
          data.cancelledChequeIsApproved &&
          data.selfieIsApproved &&
          data.shopImageIsApproved
            ? "approved"
            : "clarification",
      };
      await fetchLocation();
      await Api(`admin/update_ApprovalNotes_LTS`, "POST", body, "").then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              navigate(PATH_DASHBOARD.newleads, { state: { data: body } });
            } else {
              enqueueSnackbar(Response.data.message);
            }
          } else {
            enqueueSnackbar("Failed");
          }
        }
      );
    } catch (err) {
      enqueueSnackbar("Please check all documents");
    }
  };

  const [expanded, setExpanded] = React.useState<string | false>("panel1");

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  useEffect(() => {
    if (
      errors.hasOwnProperty("aadhaarFrontIsApproved") ||
      errors.hasOwnProperty("aadhaarFrontReason") ||
      errors.hasOwnProperty("aadhaarFrontAdditional_comment") ||
      errors.hasOwnProperty("aadhaarBackIsApproved") ||
      errors.hasOwnProperty("aadhaarBackReason") ||
      errors.hasOwnProperty("aadhaarBackAdditional_comment") ||
      errors.hasOwnProperty("panIsApproved") ||
      errors.hasOwnProperty("panReason") ||
      errors.hasOwnProperty("panAdditional_comment")
    ) {
      setExpanded("panel1");
    } else if (
      errors.hasOwnProperty("gstIsApproved") ||
      errors.hasOwnProperty("DPIN_FileIsApproved") ||
      errors.hasOwnProperty("AOA_FileIsApproved") ||
      errors.hasOwnProperty("COI_FileIsApproved") ||
      errors.hasOwnProperty("MOA_FileIsApproved") ||
      errors.hasOwnProperty("Board_Resolution_FileIsApproved") ||
      errors.hasOwnProperty("gstReason") ||
      errors.hasOwnProperty("DPIN_FileReason") ||
      errors.hasOwnProperty("AOA_FileReason") ||
      errors.hasOwnProperty("COI_FileReason") ||
      errors.hasOwnProperty("MOA_FileReason") ||
      errors.hasOwnProperty("Board_Resolution_FileReason") ||
      errors.hasOwnProperty("gstAdditional_comment") ||
      errors.hasOwnProperty("DPIN_FileIsAdditional_comment") ||
      errors.hasOwnProperty("AOA_FileAdditional_comment") ||
      errors.hasOwnProperty("COI_FileAdditional_comment") ||
      errors.hasOwnProperty("MOA_FileAdditional_comment") ||
      errors.hasOwnProperty("Board_Resolution_FileAdditional_comment") ||
      errors.hasOwnProperty("panBusinessIsApproved") ||
      errors.hasOwnProperty("Consent_Letter_FileIsApproved") ||
      errors.hasOwnProperty("Partnership_deed_FileIsApproved") ||
      errors.hasOwnProperty("panBusinessReason") ||
      errors.hasOwnProperty("Consent_Letter_FileReason") ||
      errors.hasOwnProperty("Partnership_deed_FileReason") ||
      errors.hasOwnProperty("panBusinessAdditional_comment") ||
      errors.hasOwnProperty("Consent_Letter_FileAdditional_comment") ||
      errors.hasOwnProperty("Partnership_deed_FileAdditional_comment")
    ) {
      setExpanded("panel2");
    } else if (
      errors.hasOwnProperty("cancelledChequeIsApproved") ||
      errors.hasOwnProperty("cancelledChequeReason") ||
      errors.hasOwnProperty("cancelledChequeAdditional_comment") ||
      errors.hasOwnProperty("selfieIsApproved") ||
      errors.hasOwnProperty("selfieReason") ||
      errors.hasOwnProperty("selfieAdditional_comment") ||
      errors.hasOwnProperty("shopImageIsApproved") ||
      errors.hasOwnProperty("shopImageReason") ||
      errors.hasOwnProperty("shopImageAdditional_comment")
    ) {
      setExpanded("panel3");
    }
  }, [errors]);

  async function getS3BlobUrl(s3Url: string) {
    const response = await fetch(s3Url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }

  const downloadImage = async (val: string) => {
    setDownloadLoading(true);
    // Configure AWS credentials
    AWS.config.update({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      region: "ap-south-1",
    });

    const s3 = new AWS.S3();

    // Specify the parameters for the getObject operation
    const params: any = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: val?.split("/").splice(4, 4).join("/"),
    };

    try {
      const url = await new Promise((resolve, reject) => {
        s3.getSignedUrl("getObject", params, (err, url) => {
          if (err) {
            reject(err);
          } else {
            resolve(url);
          }
        });
      });

      const link: any = document.createElement("a");
      link.href = url;
      // Set the download attribute to specify the filename
      link.setAttribute("download", "image.png");
      // Append the anchor element to the document body
      document.body.appendChild(link);
      // Trigger a click event on the anchor element
      link.click();
      // Remove the anchor element from the document body
      document.body.removeChild(link);
      setDownloadLoading(false);
    } catch (error) {
      console.error("Error downloading image from S3:", error);
      setDownloadLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title> General: File | Shampay Admin</title>
      </Helmet>

      <FormProvider methods={methods} onSubmit={handleSubmit(submitProfile)}>
        {/* Personal Detail */}
        <Accordion
          expanded={expanded == "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            aria-controls="panel1d-content"
            id="panel1d-header"
            sx={{ bgcolor: "#F4F6F6" }}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="h5">Personal Detail</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid sx={{ display: "flex", justifyContent: "space-between" }}>
              <Grid sx={{ flexGrow: 1, marginRight: 2 }}>
                <Typography variant="body1" mt={3}>
                  Full Name
                </Typography>
                <Typography variant="subtitle1">{`${value?.firstName} ${value?.lastName}`}</Typography>
                <Typography variant="body1" mt={3}>
                  Email
                </Typography>
                <Typography variant="subtitle1">{value.email}</Typography>
                <Typography variant="body1" mt={3}>
                  Locality
                </Typography>
                <Typography variant="subtitle1">
                  {value.localityInAadhar}
                </Typography>

                <Typography variant="body1" mt={3}>
                  {" "}
                  Address
                </Typography>
                <Typography variant="subtitle1" maxWidth={220}>
                  {value?.addressInAadhar}
                </Typography>
              </Grid>
              <Grid sx={{ flexGrow: 1, marginRight: 2, marginLeft: 2 }}>
                <Typography variant="body1" mt={3}>
                  Date of Birth
                </Typography>
                <Typography variant="subtitle1">
                  {fDateTime(value.dob)}
                </Typography>
                <Typography variant="body1" mt={3}>
                  City
                </Typography>
                <Typography variant="subtitle1">
                  {value.cityInAadhar}
                </Typography>
                <Typography variant="body1" mt={3}>
                  Aadhar Number
                </Typography>
                <Typography variant="subtitle1">
                  {value.aadharNumber}
                </Typography>
                <Typography variant="body1" mt={3}>
                  PinCode
                </Typography>
                <Typography variant="subtitle1">
                  {value.aadharpincode}
                </Typography>
              </Grid>
              <Grid sx={{ flexGrow: 1, marginLeft: 2 }}>
                <Typography variant="body1" mt={3}>
                  Contact
                </Typography>
                <Typography variant="subtitle1">{value.contact_no}</Typography>
                <Typography variant="body1" mt={3}>
                  Referred by
                </Typography>
                <Typography variant="subtitle1">
                  {value.referralCode}
                </Typography>
                <Typography variant="body1" mt={3}>
                  Shop District
                </Typography>
                <Typography variant="subtitle1">
                  {value.distInAadhar}
                </Typography>
                <Typography variant="body1" mt={3}>
                  PAN Number
                </Typography>
                <Typography variant="subtitle1">{value.PANnumber}</Typography>
              </Grid>
            </Grid>

            {/* Images for Personal Profile */}
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={3}
            >
              <Stack gap={1}>
                <Typography variant="subtitle1">Aadhaar Front</Typography>
                <Image
                  src={AwsDocSign(value.aadharFileUrl) || demoImage}
                  onClick={() =>
                    value.aadharFileUrl && handleOpen(value.aadharFileUrl)
                  }
                  sx={{
                    cursor: value.aadharFileUrl ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={watch("aadhaarFrontIsApproved") == true}
                    onClick={() => setValue("aadhaarFrontIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("aadhaarFrontIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("aadhaarFrontIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="aadhaarFrontReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("aadhaarFrontReason") == "Other" && (
                      <RHFTextField
                        name="aadhaarFrontAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
              <Stack gap={1} marginRight={1}>
                <Typography variant="subtitle1">Aadhaar Back</Typography>
                <Image
                  src={AwsDocSign(value.aadharBackUrl) || demoImage}
                  onClick={() =>
                    value.aadharBackUrl && handleOpen(value.aadharBackUrl)
                  }
                  sx={{
                    cursor: value.aadharBackUrl ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={watch("aadhaarBackIsApproved") == true}
                    onClick={() => setValue("aadhaarBackIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("aadhaarBackIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("aadhaarBackIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="aadhaarBackReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("aadhaarBackReason") == "Other" && (
                      <RHFTextField
                        name="aadhaarBackAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
              <Stack gap={1} marginRight={38}>
                <Typography variant="subtitle1">Pan card</Typography>
                <Image
                  src={AwsDocSign(value.PANFile) || demoImage}
                  onClick={() => value.PANFile && handleOpen(value.PANFile)}
                  sx={{
                    cursor: value.PANFile ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={watch("panIsApproved") == true}
                    onClick={() => setValue("panIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("panIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("panIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="panReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("panReason") == "Other" && (
                      <RHFTextField
                        name="panAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Constitution Indentification */}
        <Accordion
          expanded={expanded == "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            aria-controls="panel2d-content"
            id="panel2d-header"
            sx={{ bgcolor: "#F4F6F6" }}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="h5">Constitution Identification</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid sx={{ display: "flex", justifyContent: "space-between" }}>
              <Grid sx={{ flexGrow: 1, marginRight: 2 }}>
                <Typography variant="body1" mt={3}>
                  Company Name{" "}
                </Typography>
                <Typography variant="subtitle1">
                  {value.company_name}
                </Typography>
                <Typography variant="body1" mt={3}>
                  Constitution{" "}
                </Typography>
                <Typography variant="subtitle1">
                  {value.constitutionType}{" "}
                </Typography>
              </Grid>
              <Grid sx={{ flexGrow: 1, marginRight: 2, marginLeft: 2 }}>
                <Typography variant="body1" mt={3}>
                  GST Number{" "}
                </Typography>
                <Typography variant="subtitle1">{value.GSTNumber} </Typography>
                <Typography variant="body1" mt={3}>
                  Shop Address{" "}
                </Typography>
                <Typography variant="subtitle1">
                  {" "}
                  {value?.company_name || "No shop name"}{" "}
                </Typography>
              </Grid>
              <Grid sx={{ flexGrow: 1, marginLeft: 2 }}>
                <Typography variant="body1" mt={3}>
                  Pan Number{" "}
                </Typography>
                <Typography variant="subtitle1">
                  {" "}
                  {value.PAN_Company_number}{" "}
                </Typography>
              </Grid>
            </Grid>

            {/* Images for Constitution Indentification */}
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={5}
              mr={40}
            >
              <Stack gap={1}>
                <Typography variant="subtitle1">GST</Typography>
                <Image
                  src={AwsDocSign(value.GSTFile) || demoImage}
                  onClick={() => value.GSTFile && handleOpen(value.GSTFile)}
                  sx={{
                    cursor: value.GSTFile ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("gstIsApproved") == true ||
                      value.GSTFile == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("gstIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("gstIsApproved", false)}
                    disabled={
                      value.GSTFile == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("gstIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="gstReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("gstReason") == "Other" && (
                      <RHFTextField
                        name="gstAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>

              <Stack gap={1}>
                <Typography variant="subtitle1">Pan Card</Typography>
                <Image
                  src={AwsDocSign(value.PANFile_Company) || demoImage}
                  onClick={() =>
                    value.PANFile_Company && handleOpen(value.PANFile_Company)
                  }
                  sx={{
                    cursor: value.PANFile_Company ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("panBusinessIsApproved") == true ||
                      value.PANFile_Company == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("panBusinessIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    disabled={
                      value.PANFile_Company == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("panBusinessIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("panBusinessIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="panBusinessReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("panBusinessReason") == "Other" && (
                      <RHFTextField
                        name="panBusinessAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>

              <Stack gap={1}>
                <Typography variant="subtitle1">
                  Partnership Deed File
                </Typography>
                <Image
                  src={AwsDocSign(value.Partnership_deed_File) || demoImage}
                  onClick={() =>
                    value.Partnership_deed_File &&
                    handleOpen(value.Partnership_deed_File)
                  }
                  sx={{
                    cursor: value.Partnership_deed_File
                      ? "zoom-in"
                      : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    // disabled={
                    //   watch("Partnership_deed_FileIsApproved") == true ||
                    //   value.Partnership_deed_File == ""
                    // }
                    disabled={
                      watch("Partnership_deed_FileIsApproved") == true ||
                      value.Partnership_deed_File == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() =>
                      setValue("Partnership_deed_FileIsApproved", true)
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() =>
                      setValue("Partnership_deed_FileIsApproved", false)
                    }
                    disabled={
                      value.Partnership_deed_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("Partnership_deed_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="Partnership_deed_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("Partnership_deed_FileReason") == "Other" && (
                      <RHFTextField
                        name="Partnership_deed_FileAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={5}
              mr={40}
            >
              <Stack gap={1}>
                <Typography variant="subtitle1">Consent Letter File</Typography>
                <Image
                  src={AwsDocSign(value.Consent_Letter_File) || demoImage}
                  onClick={() =>
                    value.Consent_Letter_File &&
                    handleOpen(value.Consent_Letter_File)
                  }
                  sx={{
                    cursor: value.Consent_Letter_File
                      ? "zoom-in"
                      : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("Consent_Letter_FileIsApproved") == true ||
                      value.Partnership_deed_File == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() =>
                      setValue("Consent_Letter_FileIsApproved", true)
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() =>
                      setValue("Consent_Letter_FileIsApproved", false)
                    }
                    disabled={
                      value.Partnership_deed_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("Consent_Letter_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="Consent_Letter_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("Consent_Letter_FileReason") == "Other" && (
                      <RHFTextField
                        name="Consent_Letter_FileAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>

              <Stack gap={1}>
                <Typography variant="subtitle1">
                  Board Resolution File
                </Typography>
                <Image
                  src={AwsDocSign(value.Board_Resolution_File) || demoImage}
                  onClick={() =>
                    value.Board_Resolution_File &&
                    handleOpen(value.Board_Resolution_File)
                  }
                  sx={{
                    cursor: value.Board_Resolution_File
                      ? "zoom-in"
                      : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("Board_Resolution_FileIsApproved") == true ||
                      value.Board_Resolution_File == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() =>
                      setValue("Board_Resolution_FileIsApproved", true)
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() =>
                      setValue("Board_Resolution_FileIsApproved", false)
                    }
                    disabled={
                      value.Board_Resolution_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("Board_Resolution_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="Board_Resolution_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("Board_Resolution_FileReason") == "Other" && (
                      <RHFTextField
                        name="Board_Resolution_FileAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>

              <Stack gap={1}>
                <Typography variant="subtitle1">MOA File</Typography>
                <Image
                  src={AwsDocSign(value.MOA_File) || demoImage}
                  onClick={() => value.MOA_File && handleOpen(value.MOA_File)}
                  sx={{
                    cursor: value.MOA_File ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      value.MOA_File == "" ||
                      watch("MOA_FileIsApproved") == true ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("MOA_FileIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("MOA_FileIsApproved", false)}
                    disabled={
                      value.MOA_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("MOA_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="MOA_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("MOA_FileReason") == "Other" && (
                      <RHFTextField
                        name="MOA_FileAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
            </Stack>

            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={5}
              mr={40}
            >
              <Stack gap={1}>
                <Typography variant="subtitle1">COI File</Typography>
                <Image
                  src={AwsDocSign(value.COI_File) || demoImage}
                  onClick={() => value.COI_File && handleOpen(value.COI_File)}
                  sx={{
                    cursor: value.COI_File ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("COI_FileIsApproved") == true ||
                      value.COI_File == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("COI_FileIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("COI_FileIsApproved", false)}
                    disabled={
                      value.COI_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("COI_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="COI_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("COI_FileReason") == "Other" && (
                      <RHFTextField
                        name="COI_FileAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>

              <Stack gap={1}>
                <Typography variant="subtitle1">AOA File</Typography>
                <Image
                  src={AwsDocSign(value.AOA_File) || demoImage}
                  onClick={() => value.AOA_File && handleOpen(value.AOA_File)}
                  sx={{
                    cursor: value.AOA_File ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("AOA_FileIsApproved") == true ||
                      value.AOA_File == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("AOA_FileIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("AOA_FileIsApproved", false)}
                    disabled={
                      value.AOA_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("AOA_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name=" AOA_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("AOA_FileReason") == "Other" && (
                      <RHFTextField
                        name="AOA_FileAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>

              {/* kjglksjdjlkfjdglkfkljglngndgnsdnm,fnsdnf,mndsm,fnnmbdsmnfbmsdbmnfbsnmdbfnmsbdmnfbsdnmbfmnsdbfnmbdsmnfb */}
              <Stack gap={1}>
                <Typography variant="subtitle1">
                  Partnership Deed File
                </Typography>
                <Image
                  src={AwsDocSign(value.DPIN_File) || demoImage}
                  onClick={() => value.DPIN_File && handleOpen(value.DPIN_File)}
                  sx={{
                    cursor: value.DPIN_File ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={
                      watch("DPIN_FileIsApproved") == true ||
                      value.DPIN_File == "" ||
                      value.constitutionType == "Individual"
                    }
                    onClick={() => setValue("DPIN_FileIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("DPIN_FileIsApproved", false)}
                    disabled={
                      value.DPIN_File == "" ||
                      value.constitutionType == "Individual"
                    }
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("DPIN_FileIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="DPIN_FileReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("DPIN_FileReason") == "Other" && (
                      <RHFTextField
                        name="DPIN_FileIsAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Other Documents */}
        <Accordion
          expanded={expanded == "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            aria-controls="panel3d-content"
            id="panel3d-header"
            sx={{ bgcolor: "#F4F6F6" }}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="h5">Other Documents</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Images for Other documents */}
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mr={20}
            >
              <Stack gap={1}>
                <Typography variant="subtitle1">Cancelled Cheque</Typography>
                <Image
                  onClick={() =>
                    value.Cancelled_Cheque_File &&
                    handleOpen(value.Cancelled_Cheque_File)
                  }
                  src={AwsDocSign(value.Cancelled_Cheque_File) || demoImage}
                  sx={{
                    cursor: value.Cancelled_Cheque_File
                      ? "zoom-in"
                      : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={watch("cancelledChequeIsApproved") == true}
                    onClick={() => setValue("cancelledChequeIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("cancelledChequeIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("cancelledChequeIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="cancelledChequeReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("cancelledChequeReason") == "Other" && (
                      <RHFTextField
                        name="cancelledChequeAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
              <Stack gap={1}>
                <Typography variant="subtitle1">Selfie</Typography>
                <Image
                  onClick={() => value.selfie[0] && handleOpen(value.selfie[0])}
                  sx={{
                    cursor: value.selfie[0] ? "zoom-in" : "not-allowed",
                    width: 200,
                    height: 100,
                  }}
                  src={AwsDocSign(value.selfie[0]) || demoImage}
                />
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={watch("selfieIsApproved") == true}
                    onClick={() => setValue("selfieIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("selfieIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("selfieIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="selfieReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("selfieReason") == "Other" && (
                      <RHFTextField
                        name="selfieAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
              <Stack gap={1}>
                <Typography variant="subtitle1">Shop Images</Typography>
                <Stack flexDirection={"row"} gap={1}>
                  <Image
                    onClick={() =>
                      value.shopImage[0] && handleOpen(value.shopImage[0])
                    }
                    sx={{
                      cursor: value.shopImage[0] ? "zoom-in" : "not-allowed",
                      width: 200,
                      height: 100,
                    }}
                    src={AwsDocSign(value.shopImage[0]) || demoImage}
                  />
                  <Image
                    onClick={() =>
                      value?.shopImage[1] && handleOpen(value?.shopImage[1])
                    }
                    sx={{
                      cursor: value?.shopImage[1] ? "zoom-in" : "not-allowed",
                      width: 200,
                      height: 100,
                    }}
                    src={AwsDocSign(value?.shopImage[1]) || demoImage}
                  />
                  <Image
                    onClick={() =>
                      value?.shopImage[2] && handleOpen(value?.shopImage[2])
                    }
                    sx={{
                      cursor: value?.shopImage[2] ? "zoom-in" : "not-allowed",
                      width: 200,
                      height: 100,
                    }}
                    src={AwsDocSign(value?.shopImage[2]) || demoImage}
                  />
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    color={"success"}
                    disabled={watch("shopImageIsApproved") == true}
                    onClick={() => setValue("shopImageIsApproved", true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={"warning"}
                    onClick={() => setValue("shopImageIsApproved", false)}
                  >
                    Ask for Clarification
                  </Button>
                </Stack>
                {watch("shopImageIsApproved") == false && (
                  <>
                    <RHFSelect
                      name="shopImageReason"
                      label="Reason"
                      placeholder="Reason"
                      size={"small"}
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem value="Document Not Clear">
                        Document Not Clear
                      </MenuItem>
                      <MenuItem value="Worng Document Upload">
                        Worng Document Upload{" "}
                      </MenuItem>
                      <MenuItem value="Incomplete Document">
                        Incomplete Document
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </RHFSelect>
                    {watch("shopImageReason") == "Other" && (
                      <RHFTextField
                        name="shopImageAdditional_comment"
                        label="Additional Note"
                        placeholder="Additional Note"
                        size="small"
                      />
                    )}
                  </>
                )}
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Stack mt={2} flexDirection={"row"} justifyContent={"start"}>
          <LoadingButton
            variant="contained"
            type="submit"
            loading={isSubmitting}
          >
            Update KYC
          </LoadingButton>
        </Stack>
      </FormProvider>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          width={{ sm: "75%", md: "60%", lg: "50%" }}
          maxHeight="60%"
          overflow="scroll"
        >
          <Image src={AwsDocSign(img)} alt={"IMAGE"} />

          <Stack flexDirection={"row"} gap={1}>
            <LoadingButton
              variant="contained"
              onClick={() => downloadImage(img)}
              loading={downloadLoading}
            >
              Download
            </LoadingButton>

            <Button variant="contained" onClick={handleClose}>
              close
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
