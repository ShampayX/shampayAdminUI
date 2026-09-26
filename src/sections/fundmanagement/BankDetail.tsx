import { useEffect, useState, ChangeEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
// @mui
import {
  Container,
  Card,
  Stack,
  Grid,
  InputAdornment,
  Tabs,
  CardContent,
  Button,
  Tab,
  TextField,
  Modal,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  Typography,
} from "@mui/material";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
// sections

import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
// form
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Box, TableRow, TableCell, CardProps } from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFAutocomplete,
  RHFCheckbox,
  RHFRadioGroup,
} from "src/components/hook-form";
import React from "react";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import Scrollbar from "src/components/scrollbar/Scrollbar";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// ----------------------------------------------------------------------
type FormValuesProps = {
  bankName: string;
  accountNumber: string;
  branch: string;
  ifsc: string;
  bankaddress: string;
  minDepositeAmount: string;
  maxDepositeAmount: string;
  modetype: string[];
  visibleto: string[];
  // cashDepositeCharges: string;
  modes_of_transfer: {
    modeId: string;
    modeName: string;
    transactionFeeType: string;
    transactionFeeOption: {
      for_API_user: string;
      for_Agent: string;
      for_Distributor: string;
      for_M_Distributor: string;
    };
    transactionFeeValue: {
      for_API_user: string;
      for_Agent: string;
      for_Distributor: string;
      for_M_Distributor: string;
    };
  }[];
};

export default function BankDetail() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState("active");
  const [bankList, setBankList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [openMode, setOpenMode] = React.useState(false);
  const [openModeEdit, setOpenModelEdit] = React.useState(false);
  const [vlist, setVList] = useState([
    "RTGS",
    "IMPS",
    "NEFT",
    "Cash deposit at branch",
    "Cash deposit at CDM",
    "Fund Transfer",
  ]);

  const [selectBank, setSelectBank] = useState<any>({
    bank_details: { bank_name: "" },
    account_number: "",
    branch_name: "",
    ifsc: "",
    address: "",
    min_Deposit_Amount: "",
    max_Deposit_Amount: "",
  });

  const [visibleto, setVisibleTo] = useState([
    "Api User",
    "Agent",
    "Distributor",
    "Master Distributor",
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<any>([]);
  const [selectedclient, setSelectedClient] = useState<any>([]);
  const [showDetail, setShowDetail] = useState(false);
  const handleOpen = () => setOpen(true);
  const [modeid, setModeId] = useState();
  const [bankUpdId, setBankUpdId] = useState();
  const [openbANKEdit, setOpenbANKEdit] = React.useState(false);
  const handleCloseBankEdit = () => setOpenbANKEdit(false);
  const handleOpenMode = () => setOpenMode(true);
  const handleOpenEdit = (idModes: any) => {
    setModeId(idModes);
    setOpenModelEdit(true);
  };

  type FormValuesPropsEdit = {
    bank_name: string;
    account_number: string;
    branch_name: string;
    ifsc: string;
    address: string;
    min_Deposit_Amount: string;
    max_Deposit_Amount: string;

    // cashDepositeCharges: string;
    // modes_of_transfer: {
    //   modeId: string;
    //   modeName: string;
    //   transactionFeeType: string;
    //   transactionFeeOption: {
    //     for_API_user: string;
    //     for_Agent: string;
    //     for_Distributor: string;
    //     for_M_Distributor: string;
    //   };
    //   transactionFeeValue: {
    //     for_API_user: string;
    //     for_Agent: string;
    //     for_Distributor: string;
    //     for_M_Distributor: string;
    //   };
    // }
  };
  const defaultValuesEdit = {
    // modetype: [],
    // visibleto: [],
    // modes_of_transfer: [],
    bank_name: selectBank?.bank_details?.bank_name,
    account_number: selectBank?.account_number,
    branch_name: selectBank?.branch_name,
    ifsc: selectBank?.ifsc,
    address: selectBank?.address,
    min_Deposit_Amount: selectBank?.min_Deposit_Amount,
    max_Deposit_Amount: selectBank?.max_Deposit_Amount,
    // cashDepositeCharges: '',
  };
  const methodsedit = useForm<FormValuesPropsEdit>({});

  const handleEditBank = (bankupdateId: any) => {
    // setBankUpdId(bankupdateId);

    setOpenbANKEdit(true);
  };

  const DeleteBank = (bankupdateId: any) => {
    let token = localStorage.getItem("token");
    Api(
      `admin/fundManagement/delete_bank/` + bankupdateId,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          getBankList();
          setShowDetail(false);
        } else {
        }
      }
    });
  };

  const handleCloseMode = () => setOpenMode(false);
  const handleCloseEdit = () => setOpenModelEdit(false);

  const handleClose = () => setOpen(false);
  const [open1, setOpen1] = React.useState(false);

  const [modeList, setModeList] = useState([]);
  const [ModeListBank, setModeListBank] = useState<any>([]);

  const handleClose1 = () => setOpen1(false);

  const accountValidate = Yup.object().shape({
    bankName: Yup.string().required("Bank Name is required Field"),
    accountNumber: Yup.string().required("Account Number is required Field"),
    branch: Yup.string().required("Branch is required Field"),
    ifsc: Yup.string().required("IFSC is required Field"),
    bankaddress: Yup.string().required("Bank Address is required Field"),
    minDepositeAmount: Yup.string().required(
      "Minimum Deposite Amount is required Field"
    ),
    maxDepositeAmount: Yup.string().required(
      "Maximum Deposite Amount is required Field"
    ),
    // modetype: Yup.string().required('Mode Type is required Field'),
    // visibleto: Yup.string().required('Mode Type is required Field'),
    // cashDepositeCharges: Yup.string().required('Cash Deposite Charges is required Field'),
  });

  const defaultValues = {
    modetype: [],
    visibleto: [],
    modes_of_transfer: [],
    bankName: "",
    accountNumber: "",
    branch: "",
    ifsc: "",
    bankaddress: "",
    minDepositeAmount: "",
    maxDepositeAmount: "",
    // cashDepositeCharges: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });
  const {
    reset,
    setError,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const { fields, append, remove }: any = useFieldArray({
    name: "modes_of_transfer",
    control,
  });

  const category = [
    { _id: 1, status: "active", name: "Active Bank Accounts" },
    { _id: 2, status: "disable", name: "Modes" },
  ];

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 400,
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const [selectedValue, setSelectedValue] = useState("");

  const [selectedModeOption, setSelectedModeOption] = useState("");
  const handleRadioChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const handleRadioOption = (event: any) => {
    setSelectedModeOption(event.target.value);
  };
  useEffect(() => {
    getBankList();
    getModesList();
  }, []);

  const addBank = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      bank_details: {
        ifsc: data.ifsc,
        account_number: data.accountNumber,
        bank_name: data.bankName,
        branch_name: data.branch,
        address: data.bankaddress,
      },
      visibleTo_Agent: watch("visibleto").includes("Agent") ? true : false,
      visibleTo_Distributor: watch("visibleto").includes("Distributor")
        ? true
        : false,
      visibleTo_M_Dist: watch("visibleto").includes("Master Distributor")
        ? true
        : false,
      visibleTo_API_User: watch("visibleto").includes("Api User")
        ? true
        : false,
      min_Deposit_Amount: data.minDepositeAmount,
      max_Deposit_Amount: data.maxDepositeAmount,
      modes_of_transfer: data.modes_of_transfer,
    };

    Api("admin/fundManagement/add_bank", "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          handleClose();
          getBankList();
          reset(defaultValues);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const handleAutocompleteChange = (event: any, newValue: any) => {
    setInputValue(newValue);
  };

  const handleMode = (event: any, newValue: any) => {
    setSelectedMode(newValue);
  };
  const handleVisibility = (event: any, newValue: any) => {
    setSelectedClient(newValue);
  };

  const getBankList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/fundManagement/get_banks` + "", "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setBankList(Response.data.data);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const GetBankByiD = (_id: Number) => {
    let token = localStorage.getItem("token");

    Api(`admin/fundManagement/get_bank/` + _id, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setSelectBank(Response.data.data);
          setShowDetail(true);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const getModesList = () => {
    let token = localStorage.getItem("token");

    Api(`admin/fundManagement/get_modes/`, "GET", "", token).then(
      (Response: any) => {
        if (isOk(Response)) {
          setModeList(Response.data.data);
          setModeListBank(Response.data.data.map((item: any) => item));
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const SetMode = () => {
    let body = {
      transfer_mode_name: inputValue,
      isCommision: selectedValue == "Charge" ? false : true,
      isCharge: selectedValue == "Charge" ? true : false,
    };
    Api("admin/fundManagement/add_mode", "POST", body, "").then(
      (Response: any) => {
        if (isOk(Response)) {
          handleCloseMode();
          getModesList();
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const setMode = (event: any, newValue: any) => {
    setValue("modetype", newValue);

    let modeid = "";
    let modetype = "";
    ModeListBank.map((item: any) => {
      if (item.transfer_mode_name == event.target.textContent) {
        modeid = item._id;
        modetype = item.isCharge ? "Charge" : "Commission";
      }
    });
    watch("modes_of_transfer").length < watch("modetype").length
      ? append({
          modeId: modeid,
          modeName: event.target.textContent,
          transactionFeeType: modetype,
          transactionFeeOption: {
            for_API_user: "",
            for_Agent: "",
            for_Distributor: "",
            for_M_Distributor: "",
          },
          transactionFeeValue: {
            for_API_user: "",
            for_Agent: "",
            for_Distributor: "",
            for_M_Distributor: "",
          },
        })
      : watch("modes_of_transfer").map((item: any, index: any) => {
          if (!newValue.includes(item.modeName)) {
            remove(index);
          }
        });
  };

  return (
    <>
      <Helmet>
        <title>View Update Bank Detail | Shampay Admin</title>
      </Helmet>
      <Box>
        <Stack justifyContent={"right"} flexDirection={"row"}>
          <Button variant="contained" sx={{ m: 1 }} onClick={handleOpen}>
            {" "}
            Add New Bank
          </Button>
        </Stack>
        <Scrollbar>
          <Tabs
            value={currentTab}
            aria-label="basic tabs example"
            sx={{ background: "#F4F6F8", width: "fit-content" }}
            onChange={(event, newValue) => setCurrentTab(newValue)}
          >
            {category.map((tab: any) => (
              <Tab
                key={tab._id}
                sx={{ mx: 3 }}
                label={tab.name}
                value={tab.status}
              />
            ))}
          </Tabs>
        </Scrollbar>

        {category.map(
          (tab: any) =>
            tab.status == currentTab && (
              <Box key={tab.status} sx={{ m: 3 }}>
                {currentTab == "active" ? (
                  <Box
                    rowGap={3}
                    columnGap={10}
                    display="grid"
                    gridTemplateColumns={{
                      xs: "repeat(1, 1fr)",
                      sm: "0.2fr 0.8fr",
                    }}
                  >
                    <Grid
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      height={"fit-content"}
                      gridTemplateColumns={{
                        xs: "repeat(1, 1fr)",
                        // sm: 'repeat(2, 1fr)'
                      }}
                    >
                      <Box>
                        {bankList.map((item: any) => {
                          return (
                            <Button
                              sx={{ display: "inline-flex", margin: "1vw" }}
                              variant={
                                item._id == item._id ? "contained" : "outlined"
                              }
                              key={item._id}
                              value={item._id}
                              onClick={() => GetBankByiD(item._id)}
                            >
                              {item.bank_details.bank_name}
                            </Button>
                          );
                        })}

                        {showDetail ? (
                          <Card
                            sx={{
                              maxHeight: "112vh",
                              width: "57vw",
                              bgcolor: "#F4F6F8",
                              borderRadius: "4px",
                            }}
                          >
                            <CardContent>
                              <Grid container xs={12}>
                                <TableRow>
                                  <TableCell>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Bank Name :
                                      </Typography>
                                      <Typography>
                                        {selectBank.bank_details.bank_name}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    {/* Account Number : {selectBank.bank_details.account_number} */}
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Account Number :
                                      </Typography>
                                      <Typography>
                                        {selectBank.bank_details.account_number}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Branch Name :
                                      </Typography>
                                      <Typography>
                                        {selectBank.bank_details.branch_name}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        IFSC:
                                      </Typography>
                                      <Typography>
                                        {selectBank.bank_details.ifsc}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Bank Address :
                                      </Typography>
                                      <Typography>
                                        {selectBank.bank_details.address}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Min Deposit Amount :
                                      </Typography>
                                      <Typography>
                                        {selectBank.min_Deposit_Amount}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  {" "}
                                  <TableCell>
                                    <Stack direction="row" spacing={1}>
                                      <Typography
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Max Deposit Amount :
                                      </Typography>
                                      <Typography>
                                        {selectBank.max_Deposit_Amount}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    <Typography style={{ fontWeight: "bold" }}>
                                      Visible To :
                                    </Typography>
                                    {selectBank.visibleTo_Agent == true ? (
                                      <>
                                        <Typography
                                          style={{ fontWeight: "bold" }}
                                        >
                                          Agent
                                        </Typography>{" "}
                                        Fee Option:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeOption.for_Agent
                                        }{" "}
                                        , Fee Value:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeValue.for_Agent
                                        }{" "}
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    {selectBank.visibleTo_Distributor ==
                                    true ? (
                                      <>
                                        <Typography
                                          style={{ fontWeight: "bold" }}
                                        >
                                          Distributor
                                        </Typography>{" "}
                                        Fee Option:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeOption
                                            .for_Distributor
                                        }{" "}
                                        , Fee Value:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeValue.for_Distributor
                                        }{" "}
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    {selectBank.visibleTo_M_Distributor ==
                                    true ? (
                                      <>
                                        <Typography
                                          style={{ fontWeight: "bold" }}
                                        >
                                          Master Distributor
                                        </Typography>{" "}
                                        Fee Option:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeOption
                                            .for_M_Distributor
                                        }{" "}
                                        , Fee Value:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeValue
                                            .for_M_Distributor
                                        }{" "}
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    {selectBank.visibleTo_API_User == true ? (
                                      <>
                                        <Typography
                                          style={{ fontWeight: "bold" }}
                                        >
                                          API User
                                        </Typography>{" "}
                                        Fee Option:{" "}
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeOption.for_API_user
                                        }{" "}
                                        , Fee Value:
                                        {
                                          selectBank.modes_of_transfer[0]
                                            .transactionFeeValue.for_API_user
                                        }
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </TableCell>
                                </TableRow>
                                <TableRow></TableRow>
                              </Grid>
                              {selectBank.modes_of_transfer.map((item: any) => {
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "200" }}>
                                    Mode Of Transfer : {item.modeName} ,
                                    Transfer Fee Type :{" "}
                                    {item.transactionFeeType}
                                  </TableCell>
                                </TableRow>;
                              })}
                              <Stack
                                justifyContent={"left"}
                                flexDirection={"row"}
                              >
                                <Button
                                  sx={{ marginRight: "10px" }}
                                  variant="contained"
                                  onClick={() => handleEditBank(selectBank)}
                                >
                                  Edit Bank
                                </Button>
                                <Button
                                  sx={{ marginRight: "10px" }}
                                  variant="contained"
                                  onClick={() => DeleteBank(selectBank._id)}
                                >
                                  Delete Bank
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        ) : (
                          ""
                        )}
                      </Box>
                    </Grid>
                  </Box>
                ) : (
                  <Box
                    rowGap={3}
                    columnGap={10}
                    sx={{
                      display: "grid",
                      justifyContent: "start",
                      alignItems: "center",
                    }}
                    gridTemplateColumns={{
                      // xs: 'repeat(1, 1fr)',
                      sm: "0.2fr 0.8fr",
                    }}
                  >
                    <Grid
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      height={100}
                      gridTemplateColumns={
                        {
                          // xs: 'repeat(1, 1fr)',
                          // sm: 'repeat(2, 1fr)'
                        }
                      }
                    >
                      <Button
                        variant="contained"
                        sx={{ m: 1 }}
                        onClick={handleOpenMode}
                      >
                        Add Modes
                      </Button>
                      {modeList.map((modesName: any) => (
                        <TableRow key={modesName._id} sx={{ width: "90%" }}>
                          <TableCell sx={{ fontWeight: "200" }}>
                            {modesName.transfer_mode_name}
                          </TableCell>
                          {modesName.isCharge == true ? (
                            <TableCell>Charge </TableCell>
                          ) : (
                            <TableCell>Commission </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )
        )}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid width={50}>
          <FormProvider methods={methods} onSubmit={handleSubmit(addBank)}>
            <Box
              sx={style}
              style={{ borderRadius: "20px", overflow: "auto" }}
              width={{ sm: "95%", md: "50%" }}
            >
              <Scrollbar sx={{ maxHeight: 600 }}>
                <Grid
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  }}
                  mb={2}
                >
                  <RHFTextField
                    name="bankName"
                    label="Bank Name"
                    size="small"
                    placeholder="Bank Name"
                  />
                  <RHFTextField
                    name="accountNumber"
                    label="Account Number"
                    size="small"
                    placeholder="Account Number"
                  />
                  <RHFTextField
                    name="branch"
                    label="Branch Name"
                    size="small"
                    placeholder="Branch Name"
                  />
                  <RHFTextField
                    name="ifsc"
                    label="IFSC code"
                    size="small"
                    placeholder="IFSC code"
                  />
                  <RHFTextField
                    name="bankaddress"
                    label="Bank Address"
                    size="small"
                    placeholder="Bank Address"
                  />

                  <RHFTextField
                    name="minDepositeAmount"
                    label="Min Deposite Amount"
                    size="small"
                    placeholder="Min Deposite Amount"
                  />
                  <RHFTextField
                    name="maxDepositeAmount"
                    label="Max Deposite Amount"
                    size="small"
                    placeholder="Max Deposite Amount"
                  />

                  <RHFAutocomplete
                    name="modetype"
                    multiple
                    freeSolo
                    size="small"
                    onChange={setMode}
                    options={ModeListBank.map(
                      (option: any) => option.transfer_mode_name
                    )}
                    renderInput={(params) => (
                      <TextField
                        name="modetype"
                        label="Select Mode"
                        {...params}
                      />
                    )}
                  />
                  <RHFAutocomplete
                    name="visibleto"
                    multiple
                    freeSolo
                    size="small"
                    onChange={(event, newValue: any) =>
                      setValue("visibleto", newValue)
                    }
                    options={visibleto.map((option: string) => option)}
                    renderInput={(params) => (
                      <TextField
                        name="visibleto"
                        label="Visible To"
                        {...params}
                      />
                    )}
                  />

                  {/* <RHFTextField
                    name="cashDepositeCharges"
                    label="Cash Deposite Charges (Rs.3/Rs.1000)"
                    size="small"
                    placeholder="Cash Deposite Charges"
                  /> */}
                </Grid>

                {watch("visibleto").length > 0 &&
                  watch("visibleto").map((client: any, clientIndex: any) => (
                    <Accordion key={clientIndex} sx={{ bgcolor: "#F4F6F8" }}>
                      <AccordionSummary sx={{ fontWeight: 600 }}>
                        {client}
                      </AccordionSummary>
                      {fields.map((field: any, index: any) => (
                        <AccordionDetails key={field.id}>
                          <Stack flexDirection={"row"} alignItems={"center"}>
                            <Typography sx={{ fontWeight: 600 }}>
                              {watch("modes_of_transfer")[index].modeName}
                            </Typography>
                            (
                            <Typography variant="caption">
                              {
                                watch("modes_of_transfer")[index]
                                  .transactionFeeType
                              }
                            </Typography>
                            )
                          </Stack>
                          <Box sx={{ display: "flex" }}>
                            <Grid>
                              <Typography fontWeight={500}>Option</Typography>
                              <RHFRadioGroup
                                name={`modes_of_transfer.${index}.transactionFeeOption.${
                                  client === "Agent"
                                    ? "for_Agent"
                                    : client === "Distributor"
                                    ? "for_Distributor"
                                    : client === "Master Distributor"
                                    ? "for_M_Distributor"
                                    : "for_API_user"
                                }`}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                                options={[
                                  { label: "Flat", value: "flat" },
                                  { label: "Percentage", value: "percentage" },
                                ]}
                              />
                            </Grid>
                            {/* <Grid>
                              <Typography fontWeight={500}>FeeType</Typography>
                              <RHFRadioGroup
                                name={`modes_of_transfer.${index}.transactionFeeType.${
                                  client === 'Agent'
                                    ? 'for_Agent'
                                    : client === 'Distributor'
                                    ? 'for_Distributor'
                                    : client === 'Master Distributor'
                                    ? 'for_M_Distributor'
                                    : 'for_API_user'
                                }`}
                                sx={{ display: 'flex', flexDirection: 'column' }}
                                options={[
                                  { label: 'Flat', value: 'flat' },
                                  { label: 'Percentage', value: 'percentage' },
                                ]}
                              />
                            </Grid> */}
                            <Grid>
                              <Typography fontWeight={500}>FeeValue</Typography>
                              <RHFTextField
                                name={`modes_of_transfer.${index}.transactionFeeValue.${
                                  client === "Agent"
                                    ? "for_Agent"
                                    : client === "Distributor"
                                    ? "for_Distributor"
                                    : client === "Master Distributor"
                                    ? "for_M_Distributor"
                                    : "for_API_user"
                                }`}
                                variant="outlined"
                                placeholder="Value"
                                label="Value"
                                size="small"
                              />
                            </Grid>
                          </Box>
                        </AccordionDetails>
                      ))}
                    </Accordion>
                  ))}

                <Button
                  fullWidth
                  size="medium"
                  type="submit"
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Add Bank Account
                </Button>
              </Scrollbar>
            </Box>
          </FormProvider>
        </Grid>
      </Modal>

      <Modal
        open={openMode}
        onClose={handleCloseMode}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ borderRadius: "20px", width: "70%" }}>
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={vlist}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Select Mode Type" size="small" />
              )}
              onChange={handleAutocompleteChange}
            />
          </Grid>
          <div>
            <h2>Select Charge/ Commission</h2>
            <RadioGroup
              aria-label="modeVal"
              name="modeVal"
              value={selectedValue}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                value="Charge"
                control={<Radio />}
                label="Charge"
              />
              <FormControlLabel
                value="Commission"
                control={<Radio />}
                label=" Commission"
              />
            </RadioGroup>
          </div>

          <Button
            size="small"
            type="submit"
            variant="contained"
            sx={{ mt: 1 }}
            onClick={SetMode}
          >
            Add Mode
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openbANKEdit}
        onClose={handleCloseBankEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid width={50}>
          <FormProvider methods={methods} onSubmit={handleSubmit(addBank)}>
            <Box sx={style} style={{ borderRadius: "20px", width: "70%" }}>
              <Grid
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                }}
              >
                <RHFTextField
                  name="bankName"
                  label="Bank Name"
                  size="small"
                  placeholder="Bank Name"
                  // value = {selectBank.bank_details.bank_name}
                />
                <RHFTextField
                  name="accountNumber"
                  label="Account Number"
                  size="small"
                  placeholder="Account Number"
                  // value = {selectBank.bank_details.account_number}
                />
                <RHFTextField
                  name="Branch"
                  label="Branch Name"
                  size="small"
                  placeholder="Branch Name"
                  // value = {selectBank.bank_details.branch_name}
                />
                <RHFTextField
                  name="ifsc"
                  label="IFSC code"
                  size="small"
                  placeholder="IFSC code"
                  //  value = {selectBank.bank_details.ifsc}
                />
                <RHFTextField
                  name="bankaddress"
                  label="Bank Address"
                  size="small"
                  placeholder="Bank Address"
                  // value = {selectBank.bank_details.address}
                />

                <RHFTextField
                  name="minDepositeAmount"
                  label="Min Deposite Amount"
                  size="small"
                  placeholder="Min Deposite Amount"
                  // value = {selectBank.min_Deposit_Amount}
                />
                <RHFTextField
                  name="maxDepositeAmount"
                  label="Max Deposite Amount"
                  size="small"
                  placeholder="Max Deposite Amount"
                  // value = {selectBank.max_Deposit_Amount}
                />
                <Autocomplete
                  multiple
                  disablePortal
                  id="combo-box-demo"
                  options={ModeListBank}
                  sx={{ width: 300 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Mode" size="small" />
                  )}
                  onChange={handleMode}
                />
                <Autocomplete
                  multiple
                  disablePortal
                  id="combo-box-demo"
                  options={visibleto}
                  sx={{ width: 300 }}
                  renderInput={(params) => (
                    <TextField label="Visible To" size="small" />
                  )}
                  onChange={handleVisibility}
                />

                {/* <RHFTextField
                  name="cashDepositeCharges"
                  label="Cash Deposite Charges (Rs.3/Rs.1000)"
                  size="small"
                  placeholder="Cash Deposite Charges"
                /> */}
              </Grid>

              {selectedclient.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {item}{" "}
                    {selectedMode.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: "flex" }}>
                            {item}
                            <h6>Option</h6>
                            <RadioGroup
                              aria-label="Option"
                              name="modeVal"
                              value={selectedValue}
                              onChange={handleRadioOption}
                            >
                              <FormControlLabel
                                value="Charge"
                                control={<Radio />}
                                label="Charge"
                              />
                              <FormControlLabel
                                value="Commission"
                                control={<Radio />}
                                label=" Commission"
                              />
                            </RadioGroup>
                            <h6>FeeType</h6>
                            <RadioGroup
                              aria-label="Option"
                              name="modeVal"
                              value={selectedValue}
                              onChange={handleRadioOption}
                            >
                              <FormControlLabel
                                value="flate"
                                control={<Radio />}
                                label="Flate"
                              />
                              <FormControlLabel
                                value="percentage"
                                control={<Radio />}
                                label=" Percentage"
                              />
                            </RadioGroup>
                            <RHFTextField
                              name="ifsc"
                              label="Fee Value"
                              size="small"
                              placeholder="Fee Value"
                            />
                          </Box>{" "}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableCell>
                </TableRow>
              ))}

              <Button
                fullWidth
                size="medium"
                type="submit"
                variant="contained"
                sx={{ mt: 1 }}
              >
                Update Bank
              </Button>
            </Box>
          </FormProvider>
        </Grid>
      </Modal>
    </>
  );
}
