import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// @mui
import {
  Container,
  Button,
  styled,
  Switch,
  FormControl,
  Box,
  CardProps,
  Typography,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "../../components/snackbar";
import { useSettingsContext } from "../../components/settings";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Helmet } from "react-helmet-async";
import Check from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";

import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import React from "react";
import Upload from "src/components/upload/Upload";
import { useAuthContext } from "src/auth/useAuthContext";
// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type RowProps = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  commType: string;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#00AB55",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#00AB55",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: "#00AB55",
    }),
    "& .QontoStepIcon-completedIcon": {
      color: "#00AB55",
      zIndex: 1,
      fontSize: 18,
    },
    "& .QontoStepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
  })
);
function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}
const steps = [
  "Basic Info",
  "Category and Services",
  "Product Shortcodes",
  "Alerts and Reminders",
];
export default function AddNewVendor(props: any) {
  const { Api, UploadFileApi } = useAuthContext();
  const { themeStretch } = useSettingsContext();
  const [imgfile, setImgfile] = useState<any>();
  const [mess, setMess] = useState("");
  const [active, setActive] = useState(0);
  const [imgpath, setImgpath] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const params = useParams();

  type FormValuesProps = {
    vendorName: string;
    vendor_gst: string;
    vendorContactName: string;
    vendorContact: string;
    commissionType: string;
    vendortransactionType: string;
    remindVia: string;
    reminderSubject: string;
    reminderMessage: string;
    vendorApiDocument: string;
    vendor_email: string;
    vendorAvailableFor: string;
    paymentTerms: string;
    afterSubmit?: string;
  };

  const FilterSchema = Yup.object().shape({
    // vendorName: Yup.string().required('Vendor Name is required'),
    // vendor_gst: Yup.string().required(),
    // vendorContactName: Yup.string().required(),
    // vendorContact: Yup.string().required(),
    // commissionType: Yup.string().required(),
    // vendortransactionType: Yup.string().required(),
    // remindVia: Yup.string().required(),
    // reminderSubject: Yup.string().required(),
    // reminderMessage: Yup.string().required(),
    // vendorApiDocument: Yup.string().required(),
    // vendor_email: Yup.string().required(),
    // vendorAvailableFor: Yup.string().required(),
    // paymentTerms: Yup.string().required(),
  });

  const defaultValues = {
    vendorName: props.vdData ? props.vdData.vendorName : "",
    vendor_gst: props.vdData ? props.vdData.vendor_gst : "",
    vendorContactName: props.vdData ? props.vdData.vendorContactName : "",
    vendorContact: props.vdData ? props.vdData.vendorContact : "",
    commissionType: props.vdData ? props.vdData.commissionType : "",
    vendortransactionType: props.vdData
      ? props.vdData.vendortransactionType
      : "",
    remindVia: props.vdData ? props.vdData.remindVia : "",
    reminderSubject: props.vdData ? props.vdData.reminderSubject : "",
    reminderMessage: props.vdData ? props.vdData.reminderMessage : "",
    vendorApiDocument: props.vdData ? props.vdData.vendorApiDocument : "",
    vendor_email: props.vdData ? props.vdData.vendor_email : "",
    vendorAvailableFor: props.vdData ? props.vdData.vendorAvailableFor : "",
    paymentTerms: props.vdData ? props.vdData.paymentTerms : "",
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

  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": {
        width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(9px)",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(12px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor:
            theme.palette.mode === "dark" ? "#177ddc" : "#00AB55",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 12,
      height: 12,
      borderRadius: 6,
      transition: theme.transitions.create(["width"], {
        duration: 200,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,.35)"
          : "rgba(0,0,0,.25)",
      boxSizing: "border-box",
    },
  }));
  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box style={{ padding: "24px 0" }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const [valueTabs, setvalueTabs] = React.useState(0);
  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };
  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const imgfile = acceptedFiles[0];
    if (imgfile) {
      setImgfile(
        Object.assign(imgfile, {
          preview: URL.createObjectURL(imgfile),
        })
      );
    }
  }, []);
  const [myStep, setStep] = useState(1);
  const onSubmit2 = async (data: FormValuesProps) => {
    try {
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };
  const onSubmit3 = async (data: FormValuesProps) => {
    try {
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };
  const onSubmit4 = async (data: FormValuesProps) => {
    try {
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };
  const onSubmit5 = async (data: FormValuesProps) => {
    try {
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  const imgupload = () => {
    let img = imgfile;
    // let token = localStorage.getItem('token');
    let formData = new FormData();
    formData.append("document", img);
    formData.append("directoryName", "other_documents");
    UploadFileApi(`upload/upload_admin_file`, formData, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("success");

            setImgpath(Response.data.filePath);
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  const onSubmit = async (data: FormValuesProps) => {
    // alert(imgpath)
    setMess("Loading...");
    try {
      const body = {
        vendorName: data.vendorName,
        vendor_gst: data.vendor_gst,
        vendorContactName: data.vendorContactName,
        vendorContact: data.vendorContact,
        commissionType: data.commissionType,
        vendortransactionType: data.vendortransactionType,
        remindVia: data.remindVia,
        reminderSubject: data.reminderSubject,
        reminderMessage: data.reminderMessage,
        vendorApiDocument: data.vendorApiDocument,
        vendor_email: data.vendor_email,
        paymentTerms: data.paymentTerms,
        vendorAvailableFor: data.vendorAvailableFor,
        vendorAgreementFile: imgpath,
      };
      if (props.vdData) {
        await Api(
          `vendor/edit_Vendor/${props.vdData._id}`,
          "POST",
          body,
          ""
        ).then((Response: any) => {
          //
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              // setStep(2)
              // setActive(1)
              // setMess(Response.data.message)
              reset();
              props.closeModel();
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        });
      } else {
        await Api(`vendor/add_Vendor`, "POST", body, "").then(
          (Response: any) => {
            //
            if (Response?.status == 200) {
              if (Response.data.code == 200) {
                enqueueSnackbar(Response.data.message);
                reset();
                // setStep(2)
                // setActive(1)
                // setMess(Response.data.message)
              } else {
                enqueueSnackbar(Response.data.message);
              }
            }
          }
        );
      }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };
  const [age, setAge] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };
  return (
    <>
      <Helmet>
        <title>Add New Vendor | Shampay Admin</title>
      </Helmet>
      <Container maxWidth={themeStretch ? false : "xl"}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <div>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              <RHFTextField
                name="vendorName"
                label="Vendor Name"
                size="small"
              />
            </FormControl>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              <RHFTextField
                name="vendor_gst"
                label="Vendor GST #"
                size="small"
              />
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              <RHFTextField
                name="vendorContactName"
                label="Contact Person Name"
                size="small"
              />
            </FormControl>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              <RHFTextField name="vendor_email" label="Email ID" size="small" />
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              <RHFTextField
                name="vendorContact"
                label="Contact Number"
                size="small"
              />
            </FormControl>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              <RHFTextField
                name="paymentTerms"
                label="Payment Terms"
                size="small"
              />
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1, minWidth: "48%", marginTop: "25px" }}>
              {/* <InputLabel id="demo-simple-select-helper-label">Commission/ Surcharge Structure</InputLabel> */}
              <RHFSelect
                fullWidth
                name="commissionType"
                label="Commission Structure"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                size="small"
              >
                {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
                <MenuItem value="changeAtValue">Change at value</MenuItem>
              </RHFSelect>
            </FormControl>
            <FormControl sx={{ m: 1, marginTop: "25px", minWidth: "48%" }}>
              {/* <InputLabel id="demo-simple-select-helper-label">Transition Types</InputLabel> */}
              <RHFSelect
                fullWidth
                name="vendortransactionType"
                label="Transition Types"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                size="small"
              >
                {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
                <MenuItem value="commission">Commission</MenuItem>
                <MenuItem value="surcharge">Surcharge</MenuItem>
              </RHFSelect>
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1, minWidth: "48%", marginTop: "25px" }}>
              {/* <InputLabel id="demo-simple-select-helper-label">Vendor Available For</InputLabel> */}
              <RHFSelect
                name="vendorAvailableFor"
                label="Vendor Available For"
                // value={props.vendorAvailableFor}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                size="small"
              >
                {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
                <MenuItem value="directagent">Direct Agent</MenuItem>
                <MenuItem value="neonetwork">Neo Network</MenuItem>
                <MenuItem value="apiuser">API User</MenuItem>
                <MenuItem value="everyone">Everyone</MenuItem>
              </RHFSelect>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: "48%", marginTop: "25px" }}>
              {/* <InputLabel id="demo-simple-select-helper-label">Reminder Via</InputLabel> */}
              <RHFSelect
                name="remindVia"
                label="Reminder Via"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                size="small"
              >
                {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
                <MenuItem value="automailer">Automailer</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
              </RHFSelect>
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1, minWidth: "48%", marginTop: "25px" }}>
              {/* <InputLabel id="demo-simple-select-helper-label">Reminder Subject</InputLabel> */}
              {/* <RHFSelect
          name="reminderSubject"
          label="Reminder Subject"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
        > */}
              {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
              {/* <MenuItem value='Paysprint Monthly Wallet Alert'>Paysprint Monthly Wallet Alert</MenuItem>

        </RHFSelect> */}
              <RHFTextField
                name="reminderSubject"
                label="Reminder Subject"
                size="small"
              />
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: "48%", marginTop: "25px" }}>
              <RHFTextField
                name="reminderMessage"
                label="Content"
                size="small"
              />
            </FormControl>
          </div>
          <div style={{ display: "flex" }}>
            <Box
              component="form"
              sx={{
                "& .MuiTextField-root": {
                  marginTop: "50px",
                  width: "45ch",
                  marginBottom: "30px",
                  marginLeft: "8px",
                },
              }}
              noValidate
              autoComplete="off"
            >
              <div>
                <RHFTextField
                  name="vendorApiDocument"
                  label="Vendor API Documentation"
                  multiline
                  defaultValue="Vendor API Documentation"
                  inputProps={{
                    style: {
                      height: "120px",
                    },
                  }}
                  size="small"
                />
              </div>
            </Box>

            <div
              style={{ width: "35%", marginTop: "25px", marginLeft: "20px" }}
            >
              <label style={{ fontSize: "14px", color: "#919EAB" }}>
                Vendor Agreement Signed
              </label>
              <Upload
                file={imgfile}
                onDrop={handleDropSingleFile}
                onDelete={() => setImgfile(null)}
              />
              {/* <div style={{marginLeft:'340px',marginTop:'10px'}}>
                  <Button type='submit' variant="contained" name="img" onClick={()=>imgupload() } >Upload</Button>
                  </div> */}
              {imgfile ? (
                <LoadingButton
                  variant="contained"
                  component="span"
                  style={{
                    margin: "0 8px 0 auto",
                    marginTop: "10px",
                    marginLeft: "320px",
                  }}
                  onClick={() => imgupload()}
                >
                  Upload
                </LoadingButton>
              ) : null}
            </div>
          </div>
          <Button
            variant="contained"
            type="submit"
            sx={{ marginTop: "10px", marginLeft: "12px" }}
          >
            Save
          </Button>
        </FormProvider>

        {/* <Stack sx={{ width: '100%', marginBottom:'40px'}} spacing={4}>
      <Stepper alternativeLabel activeStep={active} connector={<QontoConnector />}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon} >{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      </Stack>
      {myStep==1 ? (
      
       <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:'35px'}}>
          <RHFTextField name="vendorName" label="Vendor Name" />
          <RHFTextField name="personName" label="Contact Person Name" />
          </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:'35px'}}>
          <RHFTextField name="email" label="Email ID" />
          <RHFTextField name="mobile" label="Mobile Number" />
         
        </Stack>
        <RHFTextField name="gst" label="GSTIN" />
        <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': { marginTop:'35px' },
                }}
                noValidate
                autoComplete="off"
              >
                <div>
                <TextField
                  id="outlined-multiline-static" name="description"
                  label="Vendor Description/Notes"  multiline  fullWidth 
                  inputProps={{
                  style: {
                  height: "100px",
                  },
                 }}
                />
                </div>
              </Box>
              <Button variant="contained"  type="submit"   sx={{float:'right', marginTop:'35px'}} >Next</Button>
              </FormProvider>
       
      ):
      myStep==2 ? (
        
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit2)}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:'35px'}}>
          <RHFTextField name="category" label="Select Categories" />
          <RHFTextField name="commType" label="Select Commission Type" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:'35px'}}>
          <RHFTextField name="transactionType" label="Select Transaction Type" />
          <RHFTextField name="paymentTerms" label="Select Payment Terms" />
        </Stack> 
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:'35px'}}>
          <RHFTextField name="vendorFor" label="Select Vendor For" />
          <RHFTextField name="walletBlnc" label="Minimum Wallet Balance" />
        </Stack>
        <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': {  },
                }}
                noValidate
                autoComplete="off"
              >
                <div>
                <TextField
                  id="outlined-multiline-static1"
                  label="API Documentation"  multiline  fullWidth defaultValue="API Documentation"
                  inputProps={{
                  style: {
                  height: "100px",
                  },
                 }}
                />
                </div>
              </Box>
              <Button variant="contained" sx={{float:'right', marginTop:'35px'}} onClick={() => setStep(3)}>Next</Button>
       </FormProvider>
      ):
      myStep==3 ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit3)}>
        <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider',marginBottom:'20px' ,fontSize:'20px'}}>
        <Tabs value={valueTabs} onChange={handleChangePanels} aria-label="basic tabs example">
          <Tab style={{fontSize:'18px'}} label={ <h4> <Iconify icon={'eva:plus-fill'} style={{marginRight:'5px'}} />Add One by one</h4>} {...a11yProps(0)} />
          <Tab style={{fontSize:'18px'}} label={<h4><Iconify icon={'eva:cloud-upload-fill'} style={{marginRight:'5px'}} />Upload a .csv file</h4>} {...a11yProps(1)} />
        </Tabs>

      </Box>
      </Box>
      <TabPanel value={valueTabs} index={0}>
        <div>
      <FormControl sx={{ m: 1, minWidth: '40%' }}>
        <InputLabel id="demo-simple-select-helper-label">Select Product</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          label="Select Product"
         
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl> 
      <FormControl sx={{ m: 1, minWidth: '40%' }}>
        <InputLabel id="demo-simple-select-helper-label">Enter Short Codes</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          label="Enter Short Codes"
         
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl> 
      </div>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
         <div style={{display:'flex',height: '110px',background: '#EBF8F1',padding: '13px 20px',width: '35%',borderRadius: '8px',marginLeft:'8px',marginTop:'10px'}}>
         <img
              src={'/assets/illustrations/dummy.png'}
              style={{ borderRadius: '8px', width: '85px', height: '85px', marginRight:'10px' }}
            ></img>
            <div>
            <Typography><strong>AIRTEL PREPAID</strong></Typography>
            <Typography>UP WEST</Typography>
            <div style={{display:'flex',marginTop:'8px'}}>
            <img src={`/assets/illustrations/archivetick.png`} ></img>
            <img src={`/assets/illustrations/bitcoinrefresh.png`} ></img>
            <img src={`/assets/illustrations/filtersearch.png`} ></img>
            <img src={`/assets/illustrations/candle.png`} ></img>
            </div>
            </div>
            <div style={{display:'flex',width: '120px',alignItems: 'center',justifyContent: 'end'}}>
            <Typography sx={{marginRight: '25px'}}><strong>TR</strong></Typography>
            <Iconify icon={'eva:close-circle-fill'} style={{color:'#00AB55'}} />
            </div>
         </div>
         <div style={{display:'flex',height: '110px',background: '#EBF8F1',padding: '13px 20px',width: '35%',borderRadius: '8px',marginLeft:'8px',marginTop:'10px'}}>
         <img
              src={'/assets/illustrations/dummy.png'}
              style={{ borderRadius: '8px', width: '85px', height: '85px', marginRight:'10px' }}
            ></img>
            <div>
            <Typography><strong>AIRTEL PREPAID</strong></Typography>
            <Typography>UP WEST</Typography>
            <div style={{display:'flex',marginTop:'8px'}}>
            <img src={`/assets/illustrations/archivetick.png`} ></img>
            <img src={`/assets/illustrations/bitcoinrefresh.png`} ></img>
            <img src={`/assets/illustrations/filtersearch.png`} ></img>
            <img src={`/assets/illustrations/candle.png`} ></img>
            </div>
            </div>
            <div style={{display:'flex',width: '120px',alignItems: 'center',justifyContent: 'end'}}>
            <Typography sx={{marginRight: '25px'}}><strong>TR</strong></Typography>
            <Iconify icon={'eva:close-circle-fill'} style={{color:'#00AB55'}} />
            </div>
         </div>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
         <div style={{display:'flex',height: '110px',background: '#EBF8F1',padding: '13px 20px',width: '35%',borderRadius: '8px',marginLeft:'8px',marginTop:'10px'}}>
         <img
              src={'/assets/illustrations/dummy.png'}
              style={{ borderRadius: '8px', width: '85px', height: '85px', marginRight:'10px' }}
            ></img>
            <div>
            <Typography><strong>AIRTEL PREPAID</strong></Typography>
            <Typography>UP WEST</Typography>
            <div style={{display:'flex',marginTop:'8px'}}>
            <img src={`/assets/illustrations/archivetick.png`} ></img>
            <img src={`/assets/illustrations/bitcoinrefresh.png`} ></img>
            <img src={`/assets/illustrations/filtersearch.png`} ></img>
            <img src={`/assets/illustrations/candle.png`} ></img>
            </div>
            </div>
            <div style={{display:'flex',width: '120px',alignItems: 'center',justifyContent: 'end'}}>
            <Typography sx={{marginRight: '25px'}}><strong>TR</strong></Typography>
            <Iconify icon={'eva:close-circle-fill'} style={{color:'#00AB55'}} />
            </div>
         </div>
         <div style={{display:'flex',height: '110px',background: '#EBF8F1',padding: '13px 20px',width: '35%',borderRadius: '8px',marginLeft:'8px',marginTop:'10px'}}>
         <img
              src={'/assets/illustrations/dummy.png'}
              style={{ borderRadius: '8px', width: '85px', height: '85px', marginRight:'10px' }}
            ></img>
            <div>
            <Typography><strong>AIRTEL PREPAID</strong></Typography>
            <Typography>UP WEST</Typography>
            <div style={{display:'flex',marginTop:'8px'}}>
            <img src={`/assets/illustrations/archivetick.png`} ></img>
            <img src={`/assets/illustrations/bitcoinrefresh.png`} ></img>
            <img src={`/assets/illustrations/filtersearch.png`} ></img>
            <img src={`/assets/illustrations/candle.png`} ></img>
            </div>
            </div>
            <div style={{display:'flex',width: '120px',alignItems: 'center',justifyContent: 'end'}}>
            <Typography sx={{marginRight: '25px'}}><strong>TR</strong></Typography>
            <Iconify icon={'eva:close-circle-fill'} style={{color:'#00AB55'}} />
            </div>
         </div>
        </Stack>
        <Button variant="contained" sx={{ marginTop:'35px'}} onClick={() => setStep(4)}>Next</Button>

      </TabPanel>
      <TabPanel value={valueTabs} index={1}>
        <div style={{padding:'0 15rem'}}>
        <Upload 
              file={gstfile} 
              onDrop={handleDropSingleFile} 
              onDelete={() => setGstfile(null)}
               />
        </div>
      
                <Button variant="contained" sx={{ marginTop:'35px'}} onClick={() => setStep(4)}>Next</Button>
        </TabPanel>
       </FormProvider>
      ):
      myStep==4 ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit4)}>
        <Stack direction="row" spacing={1} sx={{margin: '30px 0'}}>
        <Typography>AUTO ALERT</Typography>
        <AntSwitch inputProps={{ 'aria-label': 'ant design' }}  />
        </Stack>
        <Typography>
        ADD MONTHLY REMINDER
      </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:'35px',marginTop:'25px'}}>
          <RHFTextField name="reminderVia" label="Reminder Via" />
          <RHFTextField name="reminderDay" label="Reminder Day" />
          <RHFTextField name="subject" label="Subject" />
        </Stack>
      
        <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': { marginTop:'35px', width: '136ch' },
                }}
                noValidate
                autoComplete="off"
              >
                <div>
                <TextField
                  id="outlined-multiline-static"
                  label="Body"  multiline  fullWidth defaultValue="Body"
                  inputProps={{
                  style: {
                  height: "100px",
                  },
                 }}
                />
                </div>
              </Box>
              <Button variant="contained" sx={{float:'right', marginTop:'35px'}} onClick={() => setStep(5)}>Next</Button>
        </FormProvider>
      ):
      myStep==5 ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit5)}>
        <Box sx={{ marginTop:2 }}>
            <Alert severity="success" style={{width:'40%'}}><strong> Vendor Created Successfully</strong></Alert>
            </Box> 
       
        <Box sx={{ width: '100%' }}>
          
            <div style={{ margin: '0 auto' }}>
            
              <div style={{ width: '500px', height: '375px', textAlign: 'left', marginTop:'40px'}}>
              <VendorSuccess />
                <Button variant="contained"  sx={{marginTop:'40px',}}>View All Vendors</Button>

              </div>
            </div>
        
        </Box>
        </FormProvider>
      ):null
} */}
      </Container>
    </>
  );
}
