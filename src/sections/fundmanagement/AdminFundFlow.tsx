import React, { ReactNode, useEffect, useState } from "react";
import {
  Stack,
  MenuItem,
  Typography,
  TextField,
  FormHelperText,
  Modal,
  Box,
  Divider,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";

import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import { useAuthContext } from "src/auth/useAuthContext";
import ConfirmDialog from "src/components/confirm-dialog/ConfirmDialog";
import { LoadingButton } from "@mui/lab";
import { CustomAvatar } from "src/components/custom-avatar";
import { fetchLocation } from "src/utils/fetchLocation";
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FormCard,
  FormActions,
  ModalShell,
} from "src/components/page-kit";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { isOk, notifyFailure } from "src/utils/apiResult";

/** Label / value line used in the success receipt. */
function ReceiptRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      sx={{ py: 1.25 }}
    >
      <Typography
        sx={{ fontSize: 12.5, fontWeight: 700, color: "text.secondary" }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, textAlign: "right" }}>
        {children}
      </Typography>
    </Stack>
  );
}

type FormValuesProps = {
  transactionType: string;
  from: string;
  fromsearchby: string;
  to: string;
  tosearchby: string;
  reason: string;
  transactionid: string;
  amount: string;
  remarks: string;
};

export default function AdminFundFlow() {
  const { user, Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [creditReason, setCreditReason] = useState("");
  const [txntype, setTxntype] = useState("");
  const [toSearchBy, setToSearchBy] = useState("");
  const [FromSearchBy, setFromSearchBy] = useState("");
  const [txnAmount, setTxnAmount] = useState("");
  const [tousers, setToUsers] = useState([]);
  const [fromusers, setFromUsers] = useState([]);
  const [txnId, setTxnId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txnresponse, setTxnResponse] = useState({
    from: "",
    fromName: "",
    to: "",
    toName: "",
    txnId: "",
    amount: "",
    reason: "",
    remarks: "",
    walletId: "",
    _id: "",
  });
  const [selectFromUser, setSelectFromUser] = useState({
    userName: "",
    _id: "",
  });
  const [selectToUser, setSelectToUser] = useState({ userName: "", _id: "" });

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };

  // ..confirm modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleOpenDetails = () => setOpenConfirm(true);

  const handleCloseDetails = () => {
    setOpenConfirm(false);
    reset(defaultValues);
  };

  const FilterSchema = Yup.object().shape({
    transactionType: Yup.string().required("Transaction Type is required"),
    from:
      txntype == "credit"
        ? Yup.string()
        : Yup.string().required("From is required"),
    fromsearchby:
      txntype == "debit"
        ? Yup.string().required("Search by is required")
        : Yup.string(),
    to:
      txntype == "debit"
        ? Yup.string()
        : Yup.string().required("to is required"),
    tosearchby:
      txntype == "credit"
        ? Yup.string().required("Search by is required")
        : Yup.string(),
    reason: Yup.string().required("Reason is required"),
    // transactionid:
    //   creditReason == 'wrongdebit' ||
    //   creditReason == 'wrongcredit' ||
    //   creditReason == 'creditreturn' ||
    //   creditReason == 'chargeback'
    //     ? Yup.string().required('Transaction Id is required')
    //     : Yup.string(),
    amount:
      creditReason == "wrongdebit" ||
      creditReason == "wrongcredit" ||
      creditReason == "creditreturn" ||
      creditReason == "chargeback"
        ? Yup.string()
        : Yup.string().required("Amount is required"),
    remarks: Yup.string().required("Remark is required"),
  });
  const defaultValues = {
    transactionType: "",
    from: txntype == "credit" ? user?.email : "",
    fromsearchby: "",
    to: txntype == "debit" ? user?.email : "",
    tosearchby: "",
    reason: "",
    transactionid: "",
    amount: txnAmount ? txnAmount : "",
    remarks: "",
  };
  const methods = useForm<FormValuesProps>({
    mode: "all",
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    register,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
    setSelectFromUser({
      userName: "",
      _id: "",
    });
    setSelectToUser({
      userName: "",
      _id: "",
    });
    setTxnId("");
  }, [txntype]);

  const searchToUser = (val: string) => {
    const token = localStorage.getItem("token");

    setSelectToUser({ ...selectToUser, userName: val });
    let body = {
      searchBy: toSearchBy, // possible values -- firstName, email, contact_no, userCode
      searchInput: val,
      finalStatus: "approved",
    };
    {
      val.length
        ? Api(`admin/search_user`, "POST", body, token).then(
            (Response: any) => {
              if (isOk(Response)) {
                setToUsers(Response.data.data);
              } else {
                notifyFailure(enqueueSnackbar, Response);
              }
            }
          )
        : setToUsers([]);
    }
  };

  const searchFromUser = (val: string) => {
    const token = localStorage.getItem("token");

    setSelectFromUser({ ...selectFromUser, userName: val });
    let body = {
      searchBy: FromSearchBy,
      searchInput: val,
      finalStatus: "approved",
    };
    {
      val.length
        ? Api(`admin/search_user`, "POST", body, token).then(
            (Response: any) => {
              if (isOk(Response)) {
                setFromUsers(Response.data.data);
              } else {
                notifyFailure(enqueueSnackbar, Response);
              }
            }
          )
        : setFromUsers([]);
    }
  };

  const gettransaction = (val: string) => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: "10",
        currentPage: "1",
      },
      clientRefId: val,
      status: "",
      transactionType: "",
      userId: "",
    };
    Api(`adminTransaction/get_transaction`, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          setValue("amount", String(Response.data?.data?.data[0]?.amount));
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
      }
    );
  };

  const onSubmit = (data: FormValuesProps) => {
    handleOpenDetails();
  };

  const confirmTransfer = async () => {
    setIsLoading(true);
    let body = {
      from: txntype == "credit" ? user?._id : selectFromUser._id,
      fromName: txntype == "credit" ? user?.email : selectFromUser.userName,
      to: txntype == "debit" ? user?._id : selectToUser._id,
      toName: txntype == "debit" ? user?.email : selectToUser.userName,
      txnId:
        creditReason == "wrongdebit" ||
        creditReason == "wrongcredit" ||
        creditReason == "creditreturn" ||
        creditReason == "chargeback"
          ? getValues("transactionid")
          : "",
      amount: getValues("amount"),
      reason: getValues("reason"),
      remarks: getValues("remarks"),
    };
    await fetchLocation();
    const token = localStorage.getItem("token");
    await Api(`admin/fund_flow`, "POST", body, token).then((Response: any) => {
      if (isOk(Response)) {
        setIsLoading(false);
        enqueueSnackbar(Response.data.message);
        handleOpen();
        handleCloseDetails();
        setTxnResponse(Response.data.data);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setIsLoading(false);
    });
  };

  function setFromValue(val: any) {
    setSelectFromUser({
      userName: val.firstName + " " + val.lastName,
      _id: val._id,
    });
    setFromUsers([]);
  }
  function setToValue(val: any) {
    setSelectToUser({
      userName: val.firstName + " " + val.lastName,
      _id: val._id,
    });
    setToUsers([]);
  }

  return (
    <>
      <PageHeader
        title="Admin Fund Flow"
        subtitle="Move funds between the admin wallet and a user. Every transfer needs a reason and a remark."
      />

      <Box sx={{ maxWidth: 620 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <FormCard
            title="New transfer"
            subtitle="Pick the direction first — the From / To fields follow it."
          >
            <Stack spacing={2.5}>
              <RHFSelect
                fullWidth
                label="Transaction Type"
                size="small"
                placeholder="transaction Type"
                // InputLabelProps={{ shrink: true }}
                value={txntype}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                {...register("transactionType", {
                  onChange: (e: any) => setTxntype(e.target.value),
                  required: true,
                })}
              >
                <MenuItem value={"credit"}>Credit</MenuItem>
                <MenuItem value={"debit"}>Debit</MenuItem>
                <MenuItem value={"usertouser"}>User to User</MenuItem>
              </RHFSelect>
              {txntype && (
                <>
                  {txntype == "credit" ? (
                    <RHFTextField
                      name="from"
                      label="From"
                      placeholder="From"
                      size="small"
                      disabled
                      variant="filled"
                    />
                  ) : (
                    <>
                      <RHFSelect
                        fullWidth
                        name="fromsearchby"
                        label="From Search By"
                        size="small"
                        placeholder="From Search By"
                        sx={{ flexBasis: 200 }}
                        // InputLabelProps={{ shrink: true }}
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize" },
                        }}
                      >
                        <MenuItem
                          value={"usercode"}
                          onClick={() => setFromSearchBy("userCode")}
                        >
                          User Code
                        </MenuItem>
                        <MenuItem
                          value={"firstName"}
                          onClick={() => setFromSearchBy("firstName")}
                        >
                          First Name
                        </MenuItem>
                        <MenuItem
                          value={"contact_no"}
                          onClick={() => setFromSearchBy("contact_no")}
                        >
                          Contact Number
                        </MenuItem>
                        <MenuItem
                          value={"email"}
                          onClick={() => setFromSearchBy("email")}
                        >
                          Email
                        </MenuItem>
                      </RHFSelect>
                      <Stack
                        style={{
                          position: "relative",
                          maxHeight: 300,
                          width: "100%",
                        }}
                      >
                        <TextField
                          placeholder={FromSearchBy || "usercode"}
                          label={"From"}
                          size="small"
                          error={!!errors.from}
                          value={selectFromUser.userName}
                          {...register("from", {
                            onChange: (e: any) =>
                              searchFromUser(e.target.value),
                            required: true,
                          })}
                        />
                        {fromusers.length ? (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 44,
                              zIndex: 999,
                              width: "100%",
                              maxHeight: 300,
                              overflowY: "auto",
                              borderRadius: 1.5,
                              backgroundColor: "background.paper",
                              border: (t) => `1px solid ${t.palette.divider}`,
                              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
                            }}
                          >
                            {fromusers.map((item: any) => {
                              return (
                                <Stack
                                  flexDirection={"row"}
                                  alignItems="center"
                                  gap={1}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                      cursor: "pointer",
                                    },
                                    padding: 1,
                                  }}
                                  onClick={() => setFromValue(item)}
                                >
                                  <CustomAvatar
                                    name={item.firstName}
                                    alt={item.firstName}
                                    src={item.selfie[0] || ""}
                                  />
                                  <Typography
                                    key={item._id}
                                    sx={{ fontSize: 14 }}
                                  >
                                    {`${
                                      item.firstName + " " + item.lastName
                                    } (${item.role})`}
                                  </Typography>
                                </Stack>
                              );
                            })}
                          </Box>
                        ) : null}
                      </Stack>
                    </>
                  )}

                  {txntype == "debit" ? (
                    <RHFTextField
                      name="to"
                      label="To"
                      placeholder="To"
                      size="small"
                      disabled
                      variant="filled"
                      value={user?.email}
                    />
                  ) : (
                    <>
                      <RHFSelect
                        fullWidth
                        name="tosearchby"
                        label="To Search By"
                        size="small"
                        placeholder="To Search By"
                        sx={{ flexBasis: 200 }}
                        // InputLabelProps={{ shrink: true }}
                        SelectProps={{
                          native: false,
                          sx: { textTransform: "capitalize" },
                        }}
                      >
                        <MenuItem
                          value={"usercode"}
                          onClick={() => setToSearchBy("userCode")}
                        >
                          User Code
                        </MenuItem>
                        <MenuItem
                          value={"firstName"}
                          onClick={() => setToSearchBy("firstName")}
                        >
                          First Name
                        </MenuItem>
                        <MenuItem
                          value={"contact_no"}
                          onClick={() => setToSearchBy("contact_no")}
                        >
                          Contact Number
                        </MenuItem>
                        <MenuItem
                          value={"email"}
                          onClick={() => setToSearchBy("email")}
                        >
                          Email
                        </MenuItem>
                      </RHFSelect>
                      <Stack
                        style={{
                          position: "relative",
                          maxHeight: 300,
                          width: "100%",
                        }}
                      >
                        <TextField
                          placeholder={toSearchBy || "usercode"}
                          label={"To"}
                          error={!!errors.to}
                          size="small"
                          value={selectToUser.userName}
                          {...register("to", {
                            onChange: (e: any) => searchToUser(e.target.value),
                            required: true,
                          })}
                        />

                        {tousers.length ? (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 44,
                              zIndex: 999,
                              width: "100%",
                              maxHeight: 300,
                              overflowY: "auto",
                              borderRadius: 1.5,
                              backgroundColor: "background.paper",
                              border: (t) => `1px solid ${t.palette.divider}`,
                              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
                            }}
                          >
                            {tousers.map((item: any) => {
                              return (
                                <Stack
                                  flexDirection={"row"}
                                  alignItems="center"
                                  gap={1}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                      cursor: "pointer",
                                    },
                                    padding: 1,
                                  }}
                                  onClick={() => setToValue(item)}
                                >
                                  <CustomAvatar
                                    name={item.firstName}
                                    alt={item.firstName}
                                    src={item.selfie[0] || ""}
                                  />
                                  <Typography
                                    key={item._id}
                                    sx={{ fontSize: 14 }}
                                  >
                                    {`${
                                      item.firstName + " " + item.lastName
                                    } (${item.role})`}
                                  </Typography>
                                </Stack>
                              );
                            })}
                          </Box>
                        ) : null}
                      </Stack>
                    </>
                  )}
                </>
              )}
              <RHFSelect
                fullWidth
                name="reason"
                label="Reasons"
                size="small"
                placeholder="Reasons"
                // InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem
                  value={"gstcredit"}
                  onClick={(e) => setCreditReason("gstcredit")}
                >
                  GST Credit
                </MenuItem>
                <MenuItem
                  value={"Incentive"}
                  onClick={(e) => setCreditReason("Incentive")}
                >
                  Incentive
                </MenuItem>
                <MenuItem
                  value={"wrongdebit"}
                  onClick={(e) => setCreditReason("wrongdebit")}
                >
                  Wrong Debit
                </MenuItem>
                <MenuItem
                  value={"creditgiven"}
                  onClick={(e) => setCreditReason("creditgiven")}
                >
                  Credit given
                </MenuItem>
                <MenuItem
                  value={"wrongcredit"}
                  onClick={(e) => setCreditReason("wrongcredit")}
                >
                  Wrong Credit
                </MenuItem>
                <MenuItem
                  value={"creditreturn"}
                  onClick={(e) => setCreditReason("creditreturn")}
                >
                  Credit Return
                </MenuItem>
                <MenuItem
                  value={"chargeback"}
                  onClick={(e) => setCreditReason("chargeback")}
                >
                  Charge Back
                </MenuItem>
                <MenuItem
                  value={"others"}
                  onClick={(e) => setCreditReason("others")}
                >
                  Others
                </MenuItem>
              </RHFSelect>
              {(creditReason == "wrongdebit" ||
                creditReason == "wrongcredit" ||
                creditReason == "creditreturn" ||
                creditReason == "chargeback") && (
                <Stack flexDirection={"row"} gap={1.5} alignItems="flex-start">
                  <RHFTextField
                    label="Transaction ID"
                    placeholder="Transaction ID"
                    size="small"
                    error={!!errors.transactionid}
                    value={txnId}
                    {...register("transactionid", {
                      onChange: (e: any) => setTxnId(e.target.value),
                      required: true,
                    })}
                  />
                  {!!errors.transactionid && (
                    <FormHelperText error sx={{ pl: 2 }}>
                      Code is required
                    </FormHelperText>
                  )}
                  <PageGhostButton onClick={() => gettransaction(txnId)}>
                    Find
                  </PageGhostButton>
                </Stack>
              )}
              {creditReason == "wrongdebit" ||
              creditReason == "wrongcredit" ||
              creditReason == "creditreturn" ||
              creditReason == "chargeback" ? (
                <TextField
                  name="amount"
                  label="Amount"
                  placeholder="Amount"
                  variant="filled"
                  disabled
                  size="small"
                  value={watch("amount")}
                />
              ) : (
                <RHFTextField
                  type="number"
                  name="amount"
                  label="Amount"
                  placeholder="Amount"
                  size="small"
                />
              )}
              <RHFTextField
                name="remarks"
                label="Remarks"
                placeholder="Remarks"
                size="small"
              />
            </Stack>

            <FormActions>
              <PageActionButton type="submit" startIcon={<SendOutlinedIcon />}>
                Proceed
              </PageActionButton>
            </FormActions>
          </FormCard>

          <ConfirmDialog
            open={openConfirm}
            onClose={handleCloseDetails}
            title="Fund Transfer Confirmation"
            content="Are you sure to Transfer Fund ?"
            action={
              <LoadingButton
                variant="contained"
                color="error"
                loading={isLoading}
                onClick={confirmTransfer}
              >
                Sure
              </LoadingButton>
            }
          />
        </FormProvider>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <ModalShell
            title="Transfer complete"
            subtitle="Keep this reference for reconciliation."
            onClose={handleClose}
            width={520}
            actions={
              <PageGhostButton onClick={handleClose}>Close</PageGhostButton>
            }
          >
            <Stack alignItems="center" sx={{ pb: 1, color: "success.main" }}>
              <Icon icon="icon-park-solid:success" style={{ fontSize: 44 }} />
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: "success.dark",
                }}
              >
                Success
              </Typography>
            </Stack>

            <ReceiptRow label="FROM">
              {txntype == "credit" ? `${user?.email}` : selectFromUser.userName}
            </ReceiptRow>
            <Divider />
            <ReceiptRow label="TO">
              {txntype == "debit" ? `${user?.email}` : selectToUser.userName}
            </ReceiptRow>
            <Divider />
            <ReceiptRow label="REASON">{txnresponse.reason}</ReceiptRow>
            {txnresponse.txnId && (
              <>
                <Divider />
                <ReceiptRow label="TRANSACTION ID">
                  {txnresponse.txnId}
                </ReceiptRow>
              </>
            )}
            <Divider />
            <ReceiptRow label="AMOUNT">
              <Box component="span" sx={{ fontSize: 16, fontWeight: 700 }}>
                {watch("amount")}
              </Box>
            </ReceiptRow>

            {txnresponse.remarks && (
              <Typography
                sx={{
                  mt: 2,
                  fontSize: 13,
                  fontStyle: "italic",
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                Remark: {txnresponse.remarks}
              </Typography>
            )}
          </ModalShell>
        </Box>
      </Modal>
    </>
  );
}
