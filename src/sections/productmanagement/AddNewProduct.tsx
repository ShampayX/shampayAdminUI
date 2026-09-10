import { useCallback, useEffect, useState } from "react";
// @mui
import {
  InputAdornment,
  IconButton,
  Button,
  Box,
  CardProps,
  Typography,
} from "@mui/material";
// components
import { useSnackbar } from "../../components/snackbar";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";

import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFUpload,
} from "src/components/hook-form";
import Iconify from "src/components/iconify";
import { Helmet } from "react-helmet-async";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { CustomFile } from "src/components/upload";

import states from "src/states.json";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

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
export default function AddNewProduct(props: any) {
  const { Api, UploadFileApi } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [success, setSuccess] = useState("upload");
  const [cdata, setCdata] = useState([]);
  const [subdata, setSubCdata] = useState([]);
  const [vendors, setVdata] = useState([]);
  const [imgpath, setImgpath] = useState("");
  const [sign, setSign] = useState("");

  type FormValuesProps = {
    category: string;
    subcategory: string;
    productName: string;
    rechargeCircle: string;
    MaxRechargeLimit: string;
    transactionType: string;
    planProvider: string;
    commissionStructure: string;
    commSurchMax: string;
    productFor: string;
    actionWallet: string;
    productDescription: string;
    highcommisionchannel: string;
    operatorid: string;
    cover: CustomFile | string | any;
  };

  const FilterSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string(),
    rechargeCircle: Yup.string(),
    MaxRechargeLimit: Yup.string(),
    transactionType: Yup.string(),
    planProvider: Yup.string(),
    commissionStructure: Yup.string(),
    commSurchMax: Yup.string(),
    productFor: Yup.string(),
    actionWallet: Yup.string(),
    productDescription: Yup.string(),
    highcommisionchannel: Yup.string(),
    operatorid: Yup.string(),
    cover: Yup.mixed().required("Cover is required").nullable(true),
  });

  const defaultValues = {
    category: props.pdData ? props.pdData.category : "",
    subcategory: props.pdData ? props.pdData.subcategory : "",
    productName: props.pdData ? props.pdData.productName : "",
    rechargeCircle: props.pdData ? props.pdData.rechargeCircle : "",
    MaxRechargeLimit: props.pdData ? props.pdData.MaxRechargeLimit : "",
    transactionType: props.pdData ? props.pdData.transactionType : "",
    planProvider: props.pdData ? props.pdData.planProvider : "",
    commissionStructure: props.pdData ? props.pdData.commissionStructure : "",
    commSurchMax: props.pdData ? props.pdData.commSurchMax : "",
    productFor: props.pdData ? props.pdData.productFor : "",
    actionWallet: props.pdData ? props.pdData.actionWallet : "",
    productDescription: props.pdData ? props.pdData.productDescription : "",
    highcommisionchannel: props.pdData ? props.pdData.highcommisionchannel : "",
    operatorid: props.pdData ? props.pdData.operatorid : "",
    cover: props.pdData ? AwsDocSign(props.pdData.productLogoUrl) : "",
  };

  useEffect(() => {
    categoryList();
    vendorList();
    if (props.pdData) {
      getCatId(props.pdData.category);
      setSign(props.pdData.commissionStructure);
    }
  }, []);
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const imgupload = () => {
    setSuccess("wait");
    let img: any = watch("cover");
    let formData = new FormData();
    formData.append("document", img);
    formData.append("directoryName", "other_documents");
    UploadFileApi(`upload/upload_admin_file`, formData, "").then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("success");

            setImgpath(Response.data.filePath);
            setSuccess("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });

            setSuccess("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccess("upload");
        }
      }
    );
  };
  const onSubmit = async (data: FormValuesProps) => {
    try {
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
      const body = {
        category: data.category,
        subcategory: data.subcategory,
        productName: data.productName,
        rechargeCircle: data.rechargeCircle,
        MaxRechargeLimit: data.MaxRechargeLimit,
        transactionType: data.transactionType,
        planProvider: data.planProvider,
        commissionStructure: data.commissionStructure,
        commSurchMax: data.commSurchMax,
        productFor: data.productFor,
        actionWallet: data.actionWallet,
        productDescription: data.productDescription,
        productLogoUrl: imgpath,
        operatorid: data.operatorid,
      };
      if (props.pdData) {
        await Api(
          `product/edit_Product/${props.pdData._id}`,
          "POST",
          body,
          ""
        ).then((Response: any) => {
          if (isOk(Response)) {
            enqueueSnackbar(Response.data.message);
            props.closeModal();
            reset(defaultValues);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        });
      } else {
        await Api(`product/add_Product`, "POST", body, "").then(
          (Response: any) => {
            if (isOk(Response)) {
              enqueueSnackbar(Response.data.message);

              reset(defaultValues);
            } else {
              notifyFailure(enqueueSnackbar, Response);
            }
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const categoryList = async () => {
    try {
      const token = localStorage.getItem("token");
      await Api(`category/get_CategoryList`, "GET", "", "").then(
        (Response: any) => {
          if (isOk(Response)) {
            setCdata(Response.data.data || []);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  async function getCatId(id: any) {
    // alert(event.target.value)
    try {
      const body = {
        categoryId: id,
      };
      await Api(`category/get_SubCategoryList`, "POST", body, "").then(
        (Response: any) => {
          if (isOk(Response)) {
            setSubCdata(Response.data.data.sub_category || []);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
  const vendorList = async () => {
    try {
      await Api(`vendor/get_VendorList`, "GET", "", "").then(
        (Response: any) => {
          if (isOk(Response)) {
            setVdata(Response.data.data || []);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("cover", newFile);
      }
    },
    [setValue]
  );

  const handleRemoveFile = () => {
    setValue("cover", null);
  };

  return (
    <>
      <Helmet>
        <title>Add New Product | Shampay Admin</title>
      </Helmet>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <FormControl sx={{ m: 1, minWidth: "32%" }}>
            <RHFSelect
              fullWidth
              name="category"
              label="Product Category"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              size="small"
            >
              {cdata.length ? (
                cdata.map((item: any, index: any) => {
                  return (
                    <MenuItem
                      value={item._id}
                      key={index}
                      onClick={() => getCatId(item._id)}
                    >
                      {item.category_name}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
              )}
            </RHFSelect>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%" }}>
            <RHFSelect
              fullWidth
              name="subcategory"
              label="Subcategory"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              size="small"
            >
              {subdata.length ? (
                subdata.map((temp: any, index: any) => {
                  return (
                    <MenuItem value={temp._id} key={index}>
                      {temp.sub_category_name}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
              )}
            </RHFSelect>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%" }}>
            <RHFTextField
              name="productName"
              label="Product Name"
              size="small"
            />
          </FormControl>
        </div>
        <div>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFSelect
              fullWidth
              name="rechargeCircle"
              label="Circle/Area"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              size="small"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {states.map((temp: any, index: any) => {
                return (
                  <MenuItem value={temp.name} key={index}>
                    {temp.name}
                  </MenuItem>
                );
              })}
            </RHFSelect>
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFTextField
              name="MaxRechargeLimit"
              label="Max Recharge/Transaction Limit"
              size="small"
            />
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFSelect
              fullWidth
              name="transactionType"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              label="Transaction Types"
              size="small"
            >
              <MenuItem value="commission">Commission</MenuItem>
              <MenuItem value="surcharge">Surcharge</MenuItem>
            </RHFSelect>
          </FormControl>
        </div>
        <div>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            {/* <InputLabel id="demo-simple-select-helper-label">Commission/ Surcharge Structure</InputLabel> */}
            <RHFSelect
              fullWidth
              name="commissionStructure"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              label="Commission/ Surcharge Structure"
              // onChange={(e) => setSign(e.target.value)}
              // value={sign}
              size="small"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem
                onClick={() => setSign("percentage")}
                value="percentage"
              >
                Percentage
              </MenuItem>
              <MenuItem onClick={() => setSign("flat")} value="flat">
                Flat
              </MenuItem>
              <MenuItem
                onClick={() => setSign("changeAtValue")}
                value="changeAtValue"
              >
                Change at value
              </MenuItem>
            </RHFSelect>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFTextField
              name="commSurchMax"
              label="Commission/ Surcharge Max"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {sign === "percentage" ? (
                      <IconButton>
                        <Iconify icon={"eva:percent-outline"} />
                      </IconButton>
                    ) : (
                      <IconButton>
                        <Typography>Rs</Typography>
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            {/* <InputLabel id="demo-simple-select-helper-label">Product For</InputLabel> */}
            <RHFSelect
              fullWidth
              name="productFor"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              label="Product For"
              size="small"
            >
              {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
              {/* Item 3d: agent-network types retired - only API users remain. */}
              <MenuItem value="apiuser">API User</MenuItem>
              <MenuItem value="everyone">Everyone</MenuItem>
            </RHFSelect>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFTextField
              name="planProvider"
              label="Plan Provider"
              size="small"
            />
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFTextField
              name="highcommisionchannel"
              label="High Commission Channel"
              size="small"
            />
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            <RHFTextField name="operatorid" label="Operator Id" size="small" />
          </FormControl>
        </div>
        <div>
          <FormControl sx={{ m: 1, minWidth: "32%", marginTop: "25px" }}>
            {/* <InputLabel id="demo-simple-select-helper-label">Action Wallet</InputLabel> */}
            <RHFSelect
              fullWidth
              name="actionWallet"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              label="Action Wallet"
              size="small"
            >
              {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
              <MenuItem value="Main Wallet">Main Wallet</MenuItem>
              <MenuItem value="AEPS Wallet">AEPS Wallet</MenuItem>
            </RHFSelect>
          </FormControl>
        </div>
        {/* </Stack> */}
        {/* <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}> */}
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
                id="outlined-multiline-static"
                name="productDescription"
                label="Description"
                multiline
                defaultValue="Description of Product and Services"
                inputProps={{
                  style: {
                    height: "50px",
                  },
                }}
              />
            </div>
          </Box>

          <div style={{ width: "35%", marginTop: "15px", marginLeft: "20px" }}>
            <label style={{ fontSize: "10px", color: "#919EAB" }}>
              Upload Product image/ Logo
            </label>

            <RHFUpload
              name="cover"
              maxSize={3145728}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
            />

            {watch("cover") ? (
              <div style={{ marginTop: "5px" }}>
                {success == "upload" ? (
                  <LoadingButton
                    variant="contained"
                    component="span"
                    // style={{ width: 'fit-content' }}
                    onClick={() => imgupload()}
                  >
                    Upload File
                  </LoadingButton>
                ) : success == "wait" ? (
                  <LoadingButton
                    variant="contained"
                    loading
                    component="span"
                    style={{ width: "fit-content" }}
                  >
                    success
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    variant="contained"
                    component="span"
                    style={{ width: "fit-content" }}
                  >
                    success
                  </LoadingButton>
                )}
              </div>
            ) : null}

            {/* <Upload
              file={imgfile}
              onDrop={handleDropSingleFile}
              onDelete={() => setImgfile(null)}
            />
            {imgfile ? (
              <div style={{ marginTop: '5px' }}>
                {success == 'upload' ? (
                  <LoadingButton
                    variant="contained"
                    component="span"
                    // style={{ width: 'fit-content' }}
                    onClick={() => imgupload()}
                  >
                    Upload File
                  </LoadingButton>
                ) : success == 'wait' ? (
                  <LoadingButton
                    variant="contained"
                    loading
                    component="span"
                    style={{ width: 'fit-content' }}
                  >
                    success
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    variant="contained"
                    component="span"
                    style={{ width: 'fit-content' }}
                  >
                    success
                  </LoadingButton>
                )}
              </div>
            ) : null} */}
          </div>
        </div>

        {/* </Stack> */}
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </FormProvider>
    </>
  );
}
