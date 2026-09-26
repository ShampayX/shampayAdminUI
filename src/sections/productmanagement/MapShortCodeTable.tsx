// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  Typography,
  TableContainer,
  Button,
  Modal,
  TextField,
  styled,
  Switch,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
} from "@mui/material";
import Iconify from "src/components/iconify";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import { useSnackbar } from "../../components/snackbar";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  name: string;
  productId: string;
  productName: string;
  createdOn: string;
  subcategoryName: string;
  vendors: any;
  directAgentVendor: string;
  directAgentVendorName: string;
  neoNetworkVendor: string;
  neoNetworktVendorName: string;
  apiUserVendor: string;
  apiUserVendorName: string;
  // rechargeCircle: string,
  // MaxRechargeLimit: string,
  // transactionType: string,
  // _id: string,
  // commissionStructure: string;
  // commSurchMax: string;
  // productFor: string;
  // planProvider: string;
  actionWallet: string;
  productLogoUrl: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function MapShortCodeTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  // useEffect(()=>{
  // RowProps[]
  // },[])
  return (
    <Card {...other}>
      {/* <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} /> */}

      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row) => (
                <ProductRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ProductRowProps = {
  row: RowProps;
};
// sd
function ProductRow({ row }: ProductRowProps) {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  // const [bdy , setbdy] = useState('')
  const steppage = () => {
    // useNavigate()
    // navigate(PATH_DASHBOARD.general.step,{state:{id : row._id}})
    // setBdy(row._id);
    // alert(row._id)
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open2 = Boolean(anchorEl);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    height: "85%",
    bgcolor: "background.paper",
    border: "4px solid #00AB55",
    boxShadow: 24,
    padding: "10px 32px",
    overflow: "auto",
  };
  useEffect(() => {}, []);
  const { enqueueSnackbar } = useSnackbar();
  const fieldStyle = { m: 1, minWidth: "48%" };
  const [open, setModalEdit] = React.useState(false);
  const [open1, setModalEdit1] = React.useState(false);
  const [age, setAge] = React.useState("");
  const [pd, setPd] = React.useState({});
  const [pdata, setPdata] = useState([]);

  const handleClose = () => setModalEdit(false);
  const handleClose1 = () => setModalEdit1(false);
  const [editTrue, setEditTrue] = useState(false);
  const [vendor, setVendor] = useState([]);
  const [directAg, setDirectAg] = useState("");
  const [neo, setNeo] = useState("");
  const [wallet, setWallet] = useState("");
  const [apiUser, setApiuser] = useState("");

  const saveTab = (val: any) => {
    try {
      let body = {
        productId: val._id,
        productSetting: {
          directAgentVendor: val.directAgentVendor,
          neoNetworkVendor: val.neoNetworkVendor,
          apiUserVendor: val.apiUserVendor,
          actionWallet: val.actionWallet,
        },
        vendorShortCode: val.vendors,
      };

      Api(`product/map_product_shortCodeAndRoute`, "POST", body, "").then(
        (Response: any) => {
          if (isOk(Response)) {
            enqueueSnackbar(Response.data.message);
            setEditTrue(false);
            // window.location.reload();
            // setVdata(Response.data.data)
            //
          } else {
            notifyFailure(enqueueSnackbar, Response);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const Edittab = (val: any) => {
    let id = val._id;
    if (val != "") {
      setEditTrue(true);
    } else {
      enqueueSnackbar("data not found !", { variant: "error" });
    }

    // Api(`product/vendorViaProductId/`+ id, "GET", '', '').then((Response: any) => {
    //
    //       if (Response?.status == 200) {
    //         if (Response.data.code == 200) {
    //           if(Response.data.data != null){
    //             setEditTrue(true)
    //             setPdata(Response.data.data.vendors)
    //           }else{
    //
    //           }

    //

    //         } else {
    //

    //         }
    //       }
    // })
  };
  const FilterSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string(),
    // rechargeCircle: Yup.string(),
    // MaxRechargeLimit: Yup.number(),
  });
  type FormValuesProps = {
    category: string;
    subcategory: string;
    productName: string;
    // rechargeCircle: string;
    // MaxRechargeLimit: number;
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {};
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

  return (
    <TableRow>
      {/* <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}> */}
      <TableCell>
        <Stack direction="row" alignItems="center">
          <Avatar
            alt={row.name}
            src={row.productLogoUrl || "/assets/illustrations/dummy.png"}
          />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ width: "175px" }}>
              {" "}
              {row.productName} <Iconify icon={"eva:info-fill"} />
            </Typography>
            {/* <Typography variant="subtitle2" sx={{ width: '175px' }} >
              {row.productName} <Iconify icon={'eva:info-fill'} aria-owns={open2 ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose} />
            </Typography>
            <Popover
              id="mouse-over-popover"
              sx={{
                pointerEvents: 'none',
              }}
              open={open1}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <Typography sx={{ p: 1 }}>{row.}</Typography>
            </Popover> */}
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row.productId}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Updated on {row.createdOn}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell> {row.subcategoryName ? row.subcategoryName : "-"}</TableCell>

      {row.vendors.map((item: any, index: any) => {
        return (
          <TableCell key={index}>
            {item.services == "Yes" ? (
              <div>
                {editTrue == true ? (
                  <TextField
                    label=""
                    name="shortCode"
                    onChange={(e) => {
                      item.shortCode = e.target.value;
                    }}
                  />
                ) : (
                  <p>{item.shortCode ? item.shortCode : "-"}</p>
                )}
              </div>
            ) : (
              <p>No Service</p>
            )}
          </TableCell>
        );
      })}

      {/* <TableCell>{row.transactionType}</TableCell>
        <TextField label="Outlined" /> 
        <TableCell>{row.commissionStructure}</TableCell>
        <TableCell>{row.commSurchMax}</TableCell>
        <TableCell>{row.productFor}</TableCell> */}
      <TableCell>
        {editTrue == true ? (
          <Select
            value={row.directAgentVendor}
            label="directAg"
            onChange={(e) => (row.directAgentVendor = e.target.value)}
          >
            {row.vendors.map((item: any, index: any) => {
              return item.services == "Yes" ? (
                <MenuItem value={item.vendorId} key={index}>
                  {item.vendorName}
                </MenuItem>
              ) : null;
            })}
          </Select>
        ) : (
          <p>{row.directAgentVendor ? row.directAgentVendorName : "-"}</p>
        )}
      </TableCell>

      <TableCell>
        {editTrue == true ? (
          <Select
            value={row.neoNetworkVendor}
            label="neo"
            onChange={(e) => (row.neoNetworkVendor = e.target.value)}
          >
            {row.vendors.map((item: any, index: any) => {
              return item.services == "Yes" ? (
                <MenuItem value={item.vendorId} key={index}>
                  {item.vendorName}
                </MenuItem>
              ) : null;
            })}
          </Select>
        ) : (
          <p>{row.neoNetworkVendor ? row.neoNetworktVendorName : "-"}</p>
        )}
      </TableCell>

      <TableCell>
        {editTrue == true ? (
          <Select
            value={row.apiUserVendor}
            label="apiUser"
            onChange={(e) => (row.apiUserVendor = e.target.value)}
          >
            {row.vendors.map((item: any, index: any) => {
              return item.services == "Yes" ? (
                <MenuItem value={item.vendorId} key={index}>
                  {item.vendorName}
                </MenuItem>
              ) : null;
            })}
          </Select>
        ) : (
          <p>{row.apiUserVendor ? row.apiUserVendorName : "-"}</p>
        )}
      </TableCell>

      <TableCell>
        {/* <Select>
          <MenuItem value={'Main Wallet'}>Main Wallet</MenuItem>
          <MenuItem value={'AEPS Wallet'}>AEPS Wallet</MenuItem>
        </Select> */}
        {editTrue == true ? (
          <Select
            value={row.actionWallet}
            label="Wallet"
            onChange={(e) => (row.actionWallet = e.target.value)}
          >
            <MenuItem value={"Main Wallet"}>Main Wallet</MenuItem>
            {/* "AEPS Wallet" removed - not offered anywhere in this console. */}
          </Select>
        ) : (
          <p>{row.actionWallet ? row.actionWallet : "-"}</p>
        )}
      </TableCell>

      <TableCell>
        {/* <Button variant="contained" >Edit</Button> */}
        {editTrue == false ? (
          <Button variant="contained" onClick={() => Edittab(row)}>
            Edit
          </Button>
        ) : (
          <Button variant="contained" onClick={() => saveTab(row)}>
            Save
          </Button>
        )}
        {/* <AntSwitch inputProps={{ 'aria-label': 'ant design' }} sx={{width:'68px',marginTop:'5px'}} /> */}
      </TableCell>

      {/* <TableCell>
          <Image src={row.flag} alt="country flag" sx={{ maxWidth: 28, mx: 'auto' }} />
          {"refferCode"}
        </TableCell>
   */}
      {/* <TableCell>{row.mobileVerify?'Verified':'Unverified'}</TableCell>
        <TableCell>{row.emailVerify?'Verified':'Unverified'}</TableCell>
   */}
      {/* <TableCell align="right">
          <Label
            variant="soft"
            color={
              (row.rank === 'Top 1' && 'primary') ||
              (row.rank === 'Top 2' && 'info') ||
              (row.rank === 'Top 3' && 'success') ||
              (row.rank === 'Top 4' && 'warning') ||
              'error'
            }
          >
            {row.rank}
          </Label>
          {row.verificationStatus}
        </TableCell> */}
      {/* </FormProvider>  */}
    </TableRow>
  );
}
