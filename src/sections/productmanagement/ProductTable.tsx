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
  styled,
  Switch,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
  Tab,
} from "@mui/material";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";

import AddNewProduct from "./AddNewProduct";

import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import AwsDocSign from "src/components/CustomFunction/AwsDocSign";
type RowProps = {
  id: string;
  name: string;
  productId: string;
  productName: string;
  createdOn: string;
  subcategory: string;
  subcategoryName: string;
  rechargeCircle: string;
  MaxRechargeLimit: string;
  transactionType: string;
  _id: string;
  commissionStructure: string;
  commSurchMax: string;
  productFor: string;
  planProvider: string;
  actionWallet: string;
  productLogoUrl: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
  categoryData: any;
}

export default function ProductTable({
  title,
  subheader,
  tableData,
  tableLabels,
  categoryData,
  ...other
}: Props) {
  const [subCategory, setSubCategory] = useState([]);
  const [tabWise, setTabWise] = useState([]);
  const [valueTabs, setvalueTabs] = React.useState<any>(0);
  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  useEffect(() => {
    let filterTable: any = tableData.filter((item: any) => {
      return item.category == categoryData._id;
    });
    setTabWise(filterTable);
    setvalueTabs(0);
    if (categoryData._id == "643e4ebc48a0d747ff263b14") {
      let data: any = [];
      data = tableData.filter((item: any) => {
        return item.subcategory == "643fde1041de8b5bc5c3a55a";
      });
      setTabWise(data);
    }
  }, [tableData, categoryData._id]);

  return (
    <TableContainer sx={{ overflow: "unset" }}>
      <Scrollbar>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom headLabel={tableLabels} />
          <TableBody sx={{ overflow: "auto" }}>
            {tableData.map((row: any) => (
              <ProductRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}

// ----------------------------------------------------------------------

type ProductRowProps = {
  row: RowProps;
};
// sd
function ProductRow({ row }: ProductRowProps) {
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
  const fieldStyle = { m: 1, minWidth: "48%" };
  const [open, setModalEdit] = React.useState(false);
  const [open1, setModalEdit1] = React.useState(false);
  const [age, setAge] = React.useState("");
  const [pd, setPd] = React.useState({});

  const handleClose = () => {
    setModalEdit(false);
  };
  const handleClose1 = () => setModalEdit1(false);

  const openEditModal = (val: any) => {
    setModalEdit(true);
    setPd(row);
  };

  const FilterSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string(),
    rechargeCircle: Yup.string(),
    MaxRechargeLimit: Yup.number(),
  });
  type FormValuesProps = {
    category: string;
    subcategory: string;
    productName: string;
    rechargeCircle: string;
    MaxRechargeLimit: number;
    subcategoryName: string;
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
    <>
      <TableRow>
        <Modal
          open={open1}
          onClose={handleClose1}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {/* <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}> */}
            <Stack direction="row" alignItems="center">
              <Avatar alt={row.name} src={AwsDocSign(row.productLogoUrl)} />

              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2"> {row.productName} </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {row.productId}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Updated on {row.createdOn}
                </Typography>
              </Box>
            </Stack>
            <hr></hr>
            <Typography
              variant="h4"
              sx={{ textAlign: "center", marginTop: "25px" }}
            >
              SHORT CODES
            </Typography>
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Vendor Name
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Shortcode
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Vendor Name
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Shortcode
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Vendor Name
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Shortcode
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Vendor Name
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Shortcode
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <Typography
              variant="h4"
              sx={{ textAlign: "center", marginTop: "25px" }}
            >
              API ROUTES
            </Typography>

            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  User Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Select Vendor
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  User Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Select Vendor
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  User Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Select Vendor
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            <div>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  User Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={fieldStyle}>
                <InputLabel id="demo-simple-select-helper-label">
                  Select Vendor
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={age}
                  label="API Provider Zeta"
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
            {/* </FormProvider> */}
          </Box>
        </Modal>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Box style={{ marginTop: 10 }}>
              <AddNewProduct pdData={pd} closeModal={handleClose} />
            </Box>
          </Box>
        </Modal>
        <TableCell>
          <Stack direction="row" alignItems="center">
            <Avatar alt={row.name} src={AwsDocSign(row.productLogoUrl)} />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2"> {row.productName} </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {row.productId}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Updated on {row.createdOn}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>{row.subcategoryName}</TableCell>
        <TableCell>{row.rechargeCircle}</TableCell>
        <TableCell>{row.MaxRechargeLimit}</TableCell>
        <TableCell>{row.transactionType}</TableCell>
        <TableCell>{row.commissionStructure}</TableCell>
        <TableCell>{row.commSurchMax}</TableCell>
        <TableCell>{row.productFor}</TableCell>
        <TableCell>{row.planProvider}</TableCell>
        <TableCell>{row.actionWallet}</TableCell>
        <TableCell>
          {/* <Button variant="contained" >Edit</Button> */}

          <Button variant="contained" onClick={openEditModal}>
            Edit
          </Button>
          <AntSwitch
            inputProps={{ "aria-label": "ant design" }}
            sx={{ width: "28px", marginTop: "5px" }}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
