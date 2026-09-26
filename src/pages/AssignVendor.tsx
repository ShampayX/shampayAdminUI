import * as Yup from "yup";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { LoadingButton } from "@mui/lab";
import { Box, Card, Grid, Stack, Modal, MenuItem } from "@mui/material";
import { IUserAccountGeneral } from "../@types/user";
import { CustomFile } from "../components/upload";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "../components/snackbar";
import FormProvider, { RHFSelect } from "../components/hook-form";
import { Upload } from "../components/upload";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------

interface FormValuesProps extends Omit<IUserAccountGeneral, "avatarUrl"> {
  avatarUrl: CustomFile | string | null;
}

type Props = {
  isEdit?: boolean;
  currentUser?: IUserAccountGeneral;
};

export default function AssignVendor({ isEdit = false, currentUser }: Props) {
  const { Api, UploadFileApi } = useAuthContext();
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const [vdata, setVdata] = useState([]);
  const [cdata, setCdata] = useState([]);
  const [subcdata, setSubCdata] = useState([]);
  const [pdata, setPdata] = useState([]);
  const [nvdata, setNvdata] = useState([]);
  const [open, setModalEdit] = React.useState(false);
  const [downloadBtn, setDownloadBtn] = React.useState(false);
  const [imgpath, setImgpath] = useState("");
  const [docfile, setDocfile] = useState<any>();
  const openEditModal = (val: any) => {
    setModalEdit(true);
  };
  const handleClose = () => setModalEdit(false);
  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const docfile = acceptedFiles[0];
    if (docfile) {
      setDocfile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  type FormValuesProps = {
    category: string;
    subcategory: string;
    productName: string;
    vendors: string;
    afterSubmit?: string;
  };

  const NewUserSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string().required("productName is required"),
    vendors: Yup.string(),
  });

  const defaultValues = {
    category: "",
    subcategory: "",
    productName: "",
    vendors: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    getvendorlist();
    categoryList();
    // getProductlist();
  }, [isEdit, currentUser]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const body = {
        productId: data.productName,
        vendors: nvdata,
      };
      Api(`product/map_productWithVendor`, "POST", body, "").then(
        (Response: any) => {
          if (isOk(Response)) {
            enqueueSnackbar("Vendor Assigned Successfully !");
            reset(defaultValues);
            setNvdata([]);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getvendorlist = () => {
    Api(`vendor/get_VendorList/`, "GET", "", "").then((Response: any) => {
      if (isOk(Response)) {
        setVdata(Response.data.data);

        let tempArr: any = [];
        {
          Response.data.data.map((item: any, index: any) => {
            let obj = {
              vendorId: item._id,
              vendorName: item.vendorName,
              services: "No",
            };
            tempArr.push(obj);
          });
        }
        setNvdata(tempArr);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const categoryList = async () => {
    const token = localStorage.getItem("token");
    try {
      await Api(`category/get_CategoryList`, "GET", "", token).then(
        (Response: any) => {
          if (isOk(Response)) {
            setCdata(Response.data.data);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  const getProductlist = (val: string) => {
    Api(`product/get_ProductList/${val}`, "GET", "", "").then(
      (Response: any) => {
        if (isOk(Response)) {
          setPdata(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };
  const getCatId = async (id: any) => {
    getProductlist(id);
    setDownloadBtn(true);
    try {
      const body = {
        categoryId: id,
      };
      await Api(`category/get_SubCategoryList`, "POST", body, "").then(
        (Response: any) => {
          if (isOk(Response)) {
            setSubCdata(Response.data.data.sub_category);
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  const csvDownload: any = () => {
    window.open(
      "https://api.shampay.pro/product/download_Product_Csv",
      "_blank"
    );
  };

  const docupload = () => {
    let doc = docfile;
    let formData = new FormData();
    formData.append("productCsv", doc);
    UploadFileApi(`product/uploadProductCSV`, formData, "").then(
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

  const serviceChange = (e: any) => {
    // let vId = e.target.value;
    nvdata.map((item: any, index: any) => {
      let tempid = item.vendorId;
      if (e == tempid) {
        item.services = "Yes";
      }
    });
    setNvdata([...nvdata]);
  };
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "4px solid #00AB55",
    boxShadow: 24,
    padding: "10px 32px",
    overflow: "auto",
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Helmet>
        <title>Vendor Assign | Shampay Admin</title>
      </Helmet>
      <Stack
        style={{
          flexDirection: "row",
          marginBottom: "10px",
          justifyContent: "flex-end",
        }}
      >
        <LoadingButton
          variant="contained"
          onClick={openEditModal}
          style={{ marginLeft: "5px" }}
        >
          Upload CSV File to Update
        </LoadingButton>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Upload
            file={docfile}
            onDrop={handleDropSingleFile}
            onDelete={() => setDocfile(null)}
          />
          {docfile ? (
            <LoadingButton
              variant="contained"
              component="span"
              style={{
                margin: "0 8px 0 auto",
                marginTop: "10px",
                marginLeft: "250px",
              }}
              onClick={() => docupload()}
            >
              Upload
            </LoadingButton>
          ) : null}
        </Box>
      </Modal>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <RHFSelect
                fullWidth
                name="category"
                label="Product Category"
                size="small"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {cdata.map((item: any, index: any) => {
                  return (
                    <MenuItem
                      value={item._id}
                      key={index}
                      onClick={() => getCatId(item._id)}
                    >
                      {item.category_name}
                    </MenuItem>
                  );
                })}
              </RHFSelect>

              <RHFSelect
                name="subcategory"
                label="Subcategory"
                size="small"
                placeholder="Subcategory"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {subcdata.map((item: any, index: any) => (
                  <MenuItem key={index} value={item._id}>
                    {item.sub_category_name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                name="productName"
                label="Product Name"
                size="small"
                placeholder="Product Name"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {pdata.map((item: any, index: any) => (
                  <MenuItem key={index} value={item._id}>
                    {item.productName}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                name="vendors"
                label="Vendors"
                size="small"
                placeholder="Vendors"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {vdata.map((item: any, index: any) => (
                  <MenuItem
                    key={item._id}
                    value={item._id}
                    onClick={(e) => serviceChange(item._id)}
                  >
                    {item.vendorName}
                  </MenuItem>
                ))}
                {/* <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {vdata.map((index: any, item: any) => {
                  return (
                    MenuItem<MenuItem value={item.vendorName} key={index} onClick={()=>getCatId(item._id)}>{item.vendorName}</MenuItem>
           
                  )
                })
                } */}
              </RHFSelect>

              {/* <RHFTextField name="state" label="State/Region" />
              <RHFTextField name="city" label="City" />
              <RHFTextField name="address" label="Address" />
              <RHFTextField name="zipCode" label="Zip/Code" />
              <RHFTextField name="company" label="Company" />
              <RHFTextField name="role" label="Role" /> */}
            </Box>

            <div
              style={{
                width: "100%",
                margin: "auto",
                marginTop: "5px",
                display: "inline-block",
              }}
            >
              {nvdata.map((item: any, index: any) => {
                if (item.services == "Yes") {
                  // alert(item.services)
                  return (
                    <span
                      key={index}
                      style={{
                        margin: "5px",
                        border: "1px solid",
                        borderColor: "#00AB55",
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "end",
                        padding: "5px 13px",
                        display: "inline-block",
                      }}
                    >
                      {item.vendorName}
                    </span>
                  );
                }
                //)
                // ) :null}
              })}
            </div>

            <Stack alignItems="flex-start" flexDirection={"row"} sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Vendor Assigned
              </LoadingButton>
              {downloadBtn ? (
                <LoadingButton
                  variant="contained"
                  onClick={() =>
                    window.open(
                      "https://api.shampay.pro/product/download_Product_Csv",
                      "_blank"
                    )
                  }
                  sx={{ ml: 1 }}
                >
                  Download CSV File
                </LoadingButton>
              ) : null}
            </Stack>
          </Card>
        </Grid>
      </Grid>
      {/* <input type='submit' value='submit' /> */}
    </FormProvider>
  );
}
