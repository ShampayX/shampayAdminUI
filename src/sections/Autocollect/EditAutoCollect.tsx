import React, { useEffect, useState } from "react";
import FormProvider, {
  RHFAutocomplete,
  RHFRadioGroup,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from "src/components/hook-form";
import * as Yup from "yup";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccordionProps,
  AccordionSummaryProps,
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  styled,
} from "@mui/material";

import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { Icon } from "@iconify/react";
import Iconify from "src/components/iconify/Iconify";
import Agent from "src/sections/Autocollect/Agent";
import Distributor from "src/sections/Autocollect/Distributor";
import MasterDistributor from "src/sections/Autocollect/MasterDistributor";
import Partner from "src/sections/Autocollect/Partner";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { useLocation, useNavigate } from "react-router";
import { fetchLocation } from "src/utils/fetchLocation";
import { useAuthContext } from "src/auth/useAuthContext";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

type FormValuesProps = {
  autoCollectIdentifier: string;
  vendor: string;
  adminBankId: string;
  services: {
    serviceName: string;
    vendorServiceId: string;
    isEnabled: boolean;
    isEnabledForAgent: boolean;
    isEnabledForDistributor: boolean;
    isEnabledForMasterDistributor: boolean;
    isEnabledForPartner: boolean;
    schemeConfigs: {
      agent: {
        minSlab: number;
        maxSlab: number;
        applicableMode: string;
        applicableModeType: string;
        applicableModeValue: number;
      }[];
      distributor: {
        minSlab: number;
        maxSlab: number;
        applicableMode: string;
        applicableModeType: string;
        applicableModeValue: number;
      }[];
      masterDistributor: {
        minSlab: number;
        maxSlab: number;
        applicableMode: string;
        applicableModeType: string;
        applicableModeValue: number;
      }[];
      partner: {
        minSlab: number;
        maxSlab: number;
        applicableMode: string;
        applicableModeType: string;
        applicableModeValue: number;
      }[];
    };
  }[];
};

export default function EditAutoCollect() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [vendors, setVendors] = useState([]);
  const [bank, setBanks] = useState([]);
  const [currentTab, setCurrentTab] = useState("agent");

  const { state } = useLocation();

  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const users = [
    { id: 0, label: "Agent", value: "agent" },
    { id: 1, label: "Distributor", value: "distributor" },
    { id: 2, label: "Master Distributor", value: "masterDistributor" },
    { id: 3, label: "Partner", value: "partner" },
  ];

  const accountValidate = Yup.object().shape({
    autoCollectIdentifier: Yup.string().required("Field is required"),
    vendor: Yup.string().required("Field is required"),
    adminBankId: Yup.string().required("Field is required"),
    services: Yup.array().of(
      Yup.object().shape({
        serviceName: Yup.string().required("Field is required"),
        vendorServiceId: Yup.string().required("Field is required"),
        isEnabled: Yup.bool().required("Field is required"),
        isEnabledForAgent: Yup.bool().required("Field is required"),
        isEnabledForDistributor: Yup.bool().required("Field is required"),
        isEnabledForMasterDistributor: Yup.bool().required("Field is required"),
        isEnabledForPartner: Yup.bool().required("Field is required"),
        schemeConfigs: Yup.object().shape({
          agent: Yup.array().of(
            Yup.object().shape({
              minSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .required("A phone number is required"),
              maxSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .when("minSlab", (minSlab, schema) => {
                  return Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .required("field is required")
                    .min(minSlab + 1, "Please enter valid Max Slab");
                })
                .required("Field is required"),
              applicableMode: Yup.string().required("Field is required"),
              applicableModeType: Yup.string().required("Field is required"),
              applicableModeValue: Yup.number()
                .when("applicableModeType", {
                  is: "percentage",
                  then: Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .max(2, "Max Value is 2")
                    .required("Field is required"),
                })
                .typeError("That doesn't look like a phone number")
                .required("Field is required"),
            })
          ),
          distributor: Yup.array().of(
            Yup.object().shape({
              minSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .required("A phone number is required"),
              maxSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .when("minSlab", (minSlab, schema) => {
                  return Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .required("field is required")
                    .min(minSlab + 1, "Please enter valid Max Slab");
                })
                .required("Field is required"),
              applicableMode: Yup.string().required("Field is required"),
              applicableModeType: Yup.string().required("Field is required"),
              applicableModeValue: Yup.number()
                .when("applicableModeType", {
                  is: "percentage",
                  then: Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .max(2, "Max Value is 2")
                    .required("Field is required"),
                })
                .typeError("That doesn't look like a phone number")
                .required("Field is required"),
            })
          ),
          masterDistributor: Yup.array().of(
            Yup.object().shape({
              minSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .required("A phone number is required"),
              maxSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .when("minSlab", (minSlab, schema) => {
                  return Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .required("field is required")
                    .min(minSlab + 1, "Please enter valid Max Slab");
                })
                .required("Field is required"),
              applicableMode: Yup.string().required("Field is required"),
              applicableModeType: Yup.string().required("Field is required"),
              applicableModeValue: Yup.number()
                .when("applicableModeType", {
                  is: "percentage",
                  then: Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .max(2, "Max Value is 2")
                    .required("Field is required"),
                })
                .typeError("That doesn't look like a phone number")
                .required("Field is required"),
            })
          ),
          partner: Yup.array().of(
            Yup.object().shape({
              minSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .required("A phone number is required"),
              maxSlab: Yup.number()
                .typeError("That doesn't look like a phone number")
                .when("minSlab", (minSlab, schema) => {
                  return Yup.number()
                    .typeError("That doesn't look like a phone number")
                    .required("field is required")
                    .min(minSlab + 1, "Please enter valid Max Slab");
                })
                .required("Field is required"),
              applicableMode: Yup.string().required("Field is required"),
              applicableModeType: Yup.string().required("Field is required"),
              applicableModeValue: Yup.number().when("applicableModeType", {
                is: "percentage",
                then: Yup.number()
                  .typeError("That doesn't look like a phone number")
                  .max(2, "Max Value is 2")
                  .required("Field is required"),
                otherwise: Yup.number()
                  .typeError("That doesn't look like a phone number")
                  .required("Field is required"),
              }),
            })
          ),
        }),
      })
    ),
  });

  const defaultValues = {
    autoCollectIdentifier: state?.selectedRow?.autoCollectIdentifier || "",
    vendor: state?.selectedRow?.vendor || "",
    adminBankId: state?.selectedRow?.adminBankId || "",
    services: state?.selectedRow?.services || [
      {
        serviceName: "",
        vendorServiceId: "",
        isEnabled: false,
        isEnabledForAgent: false,
        isEnabledForDistributor: false,
        isEnabledForMasterDistributor: false,
        isEnabledForPartner: false,
        schemeConfigs: {
          agent: [
            {
              minSlab: 0,
              maxSlab: 0,
              applicableMode: "",
              applicableModeType: "",
              applicableModeValue: 0,
            },
          ],
          distributor: [
            {
              minSlab: 0,
              maxSlab: 0,
              applicableMode: "",
              applicableModeType: "",
              applicableModeValue: 0,
            },
          ],
          masterDistributor: [
            {
              minSlab: 0,
              maxSlab: 0,
              applicableMode: "",
              applicableModeType: "",
              applicableModeValue: 0,
            },
          ],
          partner: [
            {
              minSlab: 0,
              maxSlab: 0,
              applicableMode: "",
              applicableModeType: "",
              applicableModeValue: 0,
            },
          ],
        },
      },
    ],
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    control,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const { fields, append, remove }: any = useFieldArray({
    name: "services",
    control,
  });

  const setServices = (newValue: any, type: string) => {
    type == "increment"
      ? append({
          serviceName: "",
          vendorServiceId: "",
          isEnabled: false,
          isEnabledForAgent: false,
          isEnabledForDistributor: false,
          isEnabledForMasterDistributor: false,
          isEnabledForPartner: false,
          schemeConfigs: {
            agent: [
              {
                minSlab: 0,
                maxSlab: 0,
                applicableMode: "",
                applicableModeType: "",
                applicableModeValue: 0,
              },
            ],
            distributor: [
              {
                minSlab: 0,
                maxSlab: 0,
                applicableMode: "",
                applicableModeType: "",
                applicableModeValue: 0,
              },
            ],
            masterDistributor: [
              {
                minSlab: 0,
                maxSlab: 0,
                applicableMode: "",
                applicableModeType: "",
                applicableModeValue: 0,
              },
            ],
            partner: [
              {
                minSlab: 0,
                maxSlab: 0,
                applicableMode: "",
                applicableModeType: "",
                applicableModeValue: 0,
              },
            ],
          },
        })
      : watch("services").map((item: any, index: any) => {
          if (newValue.includes(item.serviceName)) {
            remove(index);
          }
        });
  };

  useEffect(() => {
    GetAllCategories();
    getAdminBank();
  }, []);

  const getAdminBank = () => {
    let token = localStorage.getItem("token");
    Api(`admin/fundManagement/get_banks` + "", "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setBanks(Response.data.data);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        }
      }
    );
  };

  const GetAllCategories = () => {
    let token = localStorage.getItem("token");
    Api(`admin/autoCollect/fetch/vendors`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setVendors(Response?.data?.data);
          } else {
          }
        }
      }
    );
  };

  const onUpdate = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    try {
      const body = {
        autoCollectId: state?.selectedRow?._id,
        autoCollDataToUpdate: {
          autoCollectIdentifier: data.autoCollectIdentifier,
          vendor: data.vendor,
          adminBankId: data.adminBankId,
          services: data.services,
        },
      };
      await fetchLocation();
      await Api(`admin/autoCollect/update`, "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              reset(defaultValues);
              enqueueSnackbar(Response.data.message);
              navigate("/auth/autocollect/Autocollecttable");
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onUpdate)}>
      <Stack gap={2}>
        <Stack flexDirection={"row"} gap={1}>
          <RHFTextField
            name="autoCollectIdentifier"
            label="Auto Collect"
            sx={{ width: 150 }}
          />
          <RHFSelect
            name="vendor"
            label="Vendor"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
            sx={{ width: 150 }}
          >
            {vendors.map((item: any) => {
              return (
                <MenuItem key={item._id} value={item._id}>
                  {item.vendorName}
                </MenuItem>
              );
            })}
          </RHFSelect>
          <RHFSelect
            name="adminBankId"
            label="Bank Account"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
            sx={{ width: 150 }}
          >
            {bank.map((item: any) => {
              return (
                <MenuItem key={item._id} value={item._id}>
                  {item.bank_details.bank_name}
                </MenuItem>
              );
            })}
          </RHFSelect>
        </Stack>
        {watch("services").map((service: any, serviceIndex: number) => (
          <Accordion
            key={serviceIndex}
            expanded={expanded === `panel${serviceIndex + 1}`}
            onChange={handleChange(`panel${serviceIndex + 1}`)}
          >
            <AccordionSummary
              aria-controls={`panel${serviceIndex}d-content`}
              id={`panel${serviceIndex}d-header`}
            >
              <Stack flexDirection={"row"} gap={2} alignItems={"center"}>
                <Typography>Auto Collect Service </Typography>{" "}
                <Stack flexDirection={"row"}>
                  <IconButton onClick={() => setServices("", "increment")}>
                    <Iconify icon="ph:plus-bold" />
                  </IconButton>
                  {serviceIndex >= 1 && (
                    <IconButton
                      onClick={() =>
                        setServices(service.serviceName, "decrement")
                      }
                    >
                      <Iconify icon="ph:minus-bold" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack flexDirection={"row"} gap={1}>
                <RHFTextField
                  name={`services.${serviceIndex}.serviceName`}
                  label="Service Name"
                  sx={{ width: 150 }}
                />
                <RHFSelect
                  name={`services.${serviceIndex}.vendorServiceId`}
                  label="Service Vendor"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                  sx={{ width: 150 }}
                >
                  {vendors.map((item: any) => {
                    return (
                      item._id === watch("vendor") &&
                      item.autoCollectServices.map((row: any) => {
                        return (
                          <MenuItem value={row._id}>{row.serviceName}</MenuItem>
                        );
                      })
                    );
                  })}
                </RHFSelect>
                <RHFSwitch
                  name={`services.${serviceIndex}.isEnabled`}
                  label=""
                />
              </Stack>
              <Tabs
                value={currentTab}
                variant="scrollable"
                sx={{ background: "#F4F6F8", mt: 1, borderRadius: 1 }}
                onChange={(event, newValue) => setCurrentTab(newValue)}
                aria-label="icon label tabs example"
              >
                {users.map((tab: any) => (
                  <Tab
                    key={tab.id}
                    sx={{ mx: 2, fontSize: { xs: 12, sm: 16 } }}
                    label={tab.label}
                    value={tab.value}
                  />
                ))}
              </Tabs>
              {currentTab == "agent" ? (
                <Agent
                  nestIndex={serviceIndex}
                  {...{ control, currentTab }}
                  methods={methods}
                  changeTab={setCurrentTab}
                />
              ) : currentTab == "distributor" ? (
                <Distributor
                  nestIndex={serviceIndex}
                  {...{ control, currentTab }}
                  methods={methods}
                  changeTab={setCurrentTab}
                />
              ) : currentTab == "masterDistributor" ? (
                <MasterDistributor
                  nestIndex={serviceIndex}
                  {...{ control, currentTab }}
                  methods={methods}
                  changeTab={setCurrentTab}
                />
              ) : (
                <Partner
                  nestIndex={serviceIndex}
                  {...{ control, currentTab }}
                  methods={methods}
                  changeTab={setCurrentTab}
                />
              )}
            </AccordionDetails>
          </Accordion>
        ))}
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={!isValid}
          sx={{ width: "fit-content" }}
        >
          {state?.selectedRow?.autoCollectIdentifier ? "Update" : "submit"}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
