import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// @mui
import {
  Button,
  Card,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
// sections
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "../../../components/snackbar";
import { PATH_DASHBOARD } from "src/routes/paths";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import * as Yup from "yup";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { LoadingButton } from "@mui/lab";
import Iconify from "src/components/iconify/Iconify";

import { it } from "date-fns/locale";
import BusinessLoanIcon from "src/assets/icons/loan/BusinessLoanIcon";
import PersonalLoanIcon from "src/assets/icons/loan/PersonalLoanIcon";
import HomeLoanIcon from "src/assets/icons/loan/HomeLoanIcon";
import GoldLoanIcon from "src/assets/icons/loan/GoldLoanIcon";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";
// ----------------------------------------------------------------------

export const SchemeDetail = React.createContext({});
export const SubcategoryDetail = React.createContext({});

type FormValuesProps = {
  subcategoryId: string;
  productId: string;
  schemeDescription: string;
  commissionSettingsPostDisbursal: {
    slabLowerLimit: number | null;
    slabUpperLimit: number | null;
    agent: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
    distributor: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
    masterDistributor: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
    partner: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
  }[];
  settlementSettingForDisbursal: {
    type: string;
    scheduledFor: string;
    dayOfMonth: number | null;
  };
  settlementSettingForLeadGeneration: {
    type: string;
    scheduledFor: string;
    dayOfMonth: number | null;
  };
  commissionSettingsForLeadGeneration: {
    agent: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
    distributor: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
    masterDistributor: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
    partner: {
      transactionType: string;
      rateType: string;
      rate: number | null;
    };
  };
};

export default function EditLoanScheme() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [rendering, setrendering] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("");
  const [subCurrentTab, setSubCurrentTab] = useState("");
  const [category, setCategory] = useState({
    _id: "",
    category_name: "",
    sub_category: [],
  });
  const [productList, setProductList] = useState([]);
  const { state } = useLocation();
  const { schemeFor, desc, rowDetail } = state || {};

  const tableLabels = [
    {
      id: "Agent charge/commission type",
      label: "Agent charge/commission type",
    },

    {
      id: "Agent charge/ commission Value",
      label: "Agent charge/ commission Value",
    },
    {
      id: "Distributor commission value",
      label: "Distributor commission value",
    },
    {
      id: "Master Distributor commission Value",
      label: "Master Distributor commission Value",
    },
    {
      id: "Api User charge/commission type",
      label: "Api User charge/commission type",
    },
    {
      id: "Api User charge/ commission Value",
      label: "Api User charge/ commission Value",
    },
  ];

  const accountValidate = Yup.object().shape({
    commissionSettingsPostDisbursal: Yup.array().of(
      Yup.object().shape({
        slabLowerLimit: Yup.number().required("Field is required"),
        slabUpperLimit: Yup.number()
          .when("slabLowerLimit", (slabLowerLimit, schema) => {
            return Yup.number()
              .required("field is required")
              .min(slabLowerLimit + 1, "Please enter valid Max Slab");
          })
          .required("Field is required"),
        agent: Yup.object().shape({
          transactionType: Yup.string().required("Field is required"),
          rateType: Yup.string().required("Field is required"),
          rate: Yup.number()
            .when("rateType", {
              is: "Percentage",
              then: Yup.number()
                .max(2, "Max Value is 2")
                .required("Field is required"),
            })
            .required("Field is required"),
        }),
        distributor: Yup.object().shape({
          transactionType: Yup.string().required("Field is required"),
          rateType: Yup.string().required("Field is required"),
          rate: Yup.number()
            .when("rateType", {
              is: "Percentage",
              then: Yup.number()
                .max(2, "Max Value is 2")
                .required("Field is required"),
            })
            .required("Field is required"),
        }),
        masterDistributor: Yup.object().shape({
          transactionType: Yup.string().required("Field is required"),
          rateType: Yup.string().required("Field is required"),
          rate: Yup.number()
            .when("rateType", {
              is: "Percentage",
              then: Yup.number()
                .max(2, "Max Value is 2")
                .required("Field is required"),
            })
            .required("Field is required"),
        }),
        partner: Yup.object().shape({
          transactionType: Yup.string().required("Field is required"),
          rateType: Yup.string().required("Field is required"),
          rate: Yup.number()
            .when("rateType", {
              is: "Percentage",
              then: Yup.number()
                .max(2, "Max Value is 2")
                .required("Field is required"),
            })
            .required("Field is required"),
        }),
      })
    ),
    settlementSettingForLeadGeneration: Yup.object().shape({
      type: Yup.string().required("Field is required"),
      scheduledFor: Yup.string().when("type", {
        is: "Scheduled",
        then: Yup.string().required("Field is required"),
      }),
      // dayOfMonth: Yup.number().when("scheduledFor", {
      //   is: "Next Month",
      //   then: Yup.number().required("Field is required"),
      // }),
    }),
    settlementSettingForDisbursal: Yup.object().shape({
      type: Yup.string().required("Field is required"),
      scheduledFor: Yup.string().when("type", {
        is: "Scheduled",
        then: Yup.string().required("Field is required"),
      }),
      // dayOfMonth: Yup.number().when("scheduledFor", {
      //   is: "Next Month",
      //   then: Yup.number().required("Field is required"),
      // }),
    }),
    commissionSettingsForLeadGeneration: Yup.object().shape({
      agent: Yup.object().shape({
        transactionType: Yup.string().required("Field is required"),
        rateType: Yup.string().required("Field is required"),
        rate: Yup.number().required("Field is required"),
      }),
      distributor: Yup.object().shape({
        transactionType: Yup.string().required("Field is required"),
        rateType: Yup.string().required("Field is required"),
        rate: Yup.number().required("Field is required"),
      }),
      masterDistributor: Yup.object().shape({
        transactionType: Yup.string().required("Field is required"),
        rateType: Yup.string().required("Field is required"),
        rate: Yup.number().required("Field is required"),
      }),
      partner: Yup.object().shape({
        transactionType: Yup.string().required("Field is required"),
        rateType: Yup.string().required("Field is required"),
        rate: Yup.number().required("Field is required"),
      }),
    }),
  });

  const defaultValues = {
    commissionSettingsPostDisbursal: [
      {
        slabLowerLimit: 0,
        slabUpperLimit: 0,
        agent: {
          transactionType: "",
          rateType: "",
          rate: 0,
        },
        distributor: {
          transactionType: "Commission",
          rateType: "",
          rate: 0,
        },
        masterDistributor: {
          transactionType: "Commission",
          rateType: "",
          rate: 0,
        },
        partner: {
          transactionType: "",
          rateType: "",
          rate: 0,
        },
      },
    ],
    settlementSettingForDisbursal: {
      type: "",
      scheduledFor: "",
      dayOfMonth: 0,
    },
    settlementSettingForLeadGeneration: {
      type: "",
      scheduledFor: "",
      dayOfMonth: 0,
    },
    commissionSettingsForLeadGeneration: {
      agent: {
        transactionType: "",
        rateType: "Flat",
        rate: 0,
      },
      distributor: {
        transactionType: "Commission",
        rateType: "Flat",
        rate: 0,
      },
      masterDistributor: {
        transactionType: "Commission",
        rateType: "Flat",
        rate: 0,
      },
      partner: {
        transactionType: "",
        rateType: "Flat",
        rate: 0,
      },
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
    mode: "all",
  });

  const {
    setValue,
    reset,
    resetField,
    control,
    watch,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const { fields, append, remove }: any = useFieldArray({
    name: "commissionSettingsPostDisbursal",
    control,
  });

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (isOk(Response)) {
        Response.data.data.map((item: any) => {
          if (item.category_name == "LOAN") {
            setCategory({
              _id: item._id,
              category_name: item.category_name,
              sub_category: item.sub_category,
            });
            setCurrentTab(item.sub_category[0]._id);
            getProductFilter(item._id, item.sub_category[0]._id);
          }
        });
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getSchemeById = (val: string) => {
    let token = localStorage.getItem("token");
    Api(
      `admin/loan/get_loan_scheme_by_id/` + rowDetail._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          Response.data.data.subSchemes.map((item: any) => {
            if (item.productId == val) {
              setValue(
                "commissionSettingsPostDisbursal",
                item.commissionSettingsPostDisbursal
              );
              setValue(
                "settlementSettingForDisbursal",
                item.settlementSettingForDisbursal
              );
              setValue(
                "commissionSettingsForLeadGeneration",
                item.commissionSettingsForLeadGeneration
              );
              setValue(
                "settlementSettingForLeadGeneration",
                item.settlementSettingForLeadGeneration
              );
            }
          });
          setrendering((prevState) => prevState + 1);
        }
      }
    });
  };

  const getProductFilter = (category: string, subcategory: string) => {
    let body = {
      category: category,
      subcategory: subcategory,
      productFor: "",
    };
    Api("product/product_Filter", "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        setProductList(Response.data.data);
        setSubCurrentTab(Response.data.data[0]._id);
        getSchemeById(Response.data.data[0]._id);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const onSubmit = (data: FormValuesProps) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      subcategoryId: currentTab,
      productId: subCurrentTab,
      commissionSettingsPostDisbursal: data.commissionSettingsPostDisbursal,
      settlementSettingForDisbursal: {
        type: data.settlementSettingForDisbursal.type,
        scheduledFor:
          data.settlementSettingForDisbursal.type == "Instant"
            ? "NA"
            : data.settlementSettingForDisbursal.scheduledFor,
        dayOfMonth:
          data.settlementSettingForDisbursal.type == "Instant" ||
          data.settlementSettingForDisbursal.scheduledFor ==
            "End Of Every Month"
            ? 0
            : data.settlementSettingForDisbursal.dayOfMonth,
      },
      settlementSettingForLeadGeneration: {
        type: data.settlementSettingForLeadGeneration.type,
        scheduledFor:
          data.settlementSettingForLeadGeneration.type == "Instant"
            ? "NA"
            : data.settlementSettingForLeadGeneration.scheduledFor,
        dayOfMonth:
          data.settlementSettingForLeadGeneration.type == "Instant" ||
          data.settlementSettingForLeadGeneration.scheduledFor ==
            "End Of Every Month"
            ? 0
            : data.settlementSettingForLeadGeneration.dayOfMonth,
      },
      commissionSettingsForLeadGeneration:
        data.commissionSettingsForLeadGeneration,
    };
    Api("admin/loan/edit_subscheme/" + rowDetail._id, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar(Response.data.message);
          setEdit(false);
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        setIsLoading(false);
      }
    );
  };

  const submit = () => {
    let token = localStorage.getItem("token");
    let body = {
      subcategoryId: currentTab,
      productId: subCurrentTab,
      commissionSettingsPostDisbursal: getValues(
        "commissionSettingsPostDisbursal"
      ),
      settlementSettingForDisbursal: {
        type: getValues("settlementSettingForDisbursal.type"),
        scheduledFor:
          getValues("settlementSettingForDisbursal.type") == "Instant"
            ? "NA"
            : getValues("settlementSettingForDisbursal.scheduledFor"),
        dayOfMonth:
          getValues("settlementSettingForDisbursal.type") == "Instant" ||
          getValues("settlementSettingForDisbursal.scheduledFor") ==
            "End Of Every Month"
            ? 0
            : getValues("settlementSettingForDisbursal.dayOfMonth"),
      },
      settlementSettingForLeadGeneration: {
        type: getValues("settlementSettingForLeadGeneration.type"),
        scheduledFor:
          getValues("settlementSettingForLeadGeneration.type") == "Instant"
            ? "NA"
            : getValues("settlementSettingForLeadGeneration.scheduledFor"),
        dayOfMonth:
          getValues("settlementSettingForLeadGeneration.type") == "Instant" ||
          getValues("settlementSettingForLeadGeneration.scheduledFor") ==
            "End Of Every Month"
            ? 0
            : getValues("settlementSettingForLeadGeneration.dayOfMonth"),
      },
      commissionSettingsForLeadGeneration: getValues(
        "commissionSettingsForLeadGeneration"
      ),
    };
    Api("admin/loan/edit_subscheme/" + rowDetail._id, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setEdit(false);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };
  // *************************share data from product filter api and send this data to component wise

  return (
    <>
      <Helmet>
        <title>Create BBPS Scheme | Shampay Admin</title>
      </Helmet>
      <CustomBreadcrumbs
        links={[
          { name: `Loan Scheme`, href: "" },
          {
            name: `All Loan Scheme`,
            href: PATH_DASHBOARD.scheme.AllbbpsScheme,
          },
          { name: `Create Loan Scheme`, href: "" },
          { name: ` ${schemeFor} Scheme (${desc})`, href: "" },
          // { name: user?.displayName },
        ]}
      />
      <SchemeDetail.Provider value={schemeFor}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ borderRadius: 0.5, p: 0.5 }}>
            <Stack flexDirection={"row"}>
              {category.sub_category.map((item: any) => {
                return (
                  <Stack
                    height={100}
                    mr={2}
                    alignItems={"center"}
                    justifyContent={"center"}
                    onClick={() => {
                      setCurrentTab(item._id);
                      getProductFilter(category._id, item._id);
                      reset(defaultValues);
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    {item.sub_category_name == "Personal Loan" ? (
                      <PersonalLoanIcon active={currentTab == item._id} />
                    ) : item.sub_category_name == "Business Loan" ? (
                      <BusinessLoanIcon active={currentTab == item._id} />
                    ) : item.sub_category_name == "Home Loan" ? (
                      <HomeLoanIcon active={currentTab == item._id} />
                    ) : item.sub_category_name == "Gold Loan" ? (
                      <GoldLoanIcon active={currentTab == item._id} />
                    ) : null}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: currentTab == item._id ? "#C52031" : "#333333",
                      }}
                    >
                      {item.sub_category_name}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Card>
          <Card sx={{ borderRadius: 0.5, p: 0.5, mt: 1 }}>
            <Stack flexDirection={"row"} justifyContent={"space-between"}>
              <Tabs
                value={subCurrentTab}
                onChange={(event: any, newValue: string) => {
                  reset(defaultValues);
                  setSubCurrentTab(newValue);
                  getSchemeById(newValue);
                }}
                aria-label="wrapped label tabs example"
              >
                {productList.map((item: any) => {
                  return (
                    <Tab
                      value={item._id}
                      label={item.productName}
                      sx={{ fontSize: 14 }}
                    />
                  );
                })}
              </Tabs>
              {edit ? (
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={isLoading}
                >
                  Save
                </LoadingButton>
              ) : (
                <LoadingButton
                  variant="contained"
                  onClick={() => setEdit(true)}
                >
                  edit
                </LoadingButton>
              )}
            </Stack>
          </Card>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1">Onlead Generation</Typography>
            <Card sx={{ mt: 2 }}>
              <TableContainer sx={{ overflow: "unset" }}>
                <Scrollbar sx={{ pb: 2 }}>
                  <Table sx={{ minWidth: 720 }} size="small">
                    <TableHead>
                      <TableRow>
                        {tableLabels.map((item: any) => {
                          return (
                            <TableCell>
                              <Typography variant="subtitle2">
                                {item.label}
                              </Typography>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      <TableRow sx={{ verticalAlign: "baseline" }}>
                        <TableCell>
                          {edit ? (
                            <RHFSelect
                              name="commissionSettingsForLeadGeneration.agent.transactionType"
                              label="Type"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="Charge">Charge</MenuItem>
                              <MenuItem value="Commission">Commission</MenuItem>
                            </RHFSelect>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "commissionSettingsForLeadGeneration.agent.transactionType"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {edit ? (
                            <RHFTextField
                              name="commissionSettingsForLeadGeneration.agent.rate"
                              label="Value"
                              type="number"
                            />
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "commissionSettingsForLeadGeneration.agent.rate"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {edit ? (
                            <RHFTextField
                              name="commissionSettingsForLeadGeneration.distributor.rate"
                              label="Commission Value"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "commissionSettingsForLeadGeneration.distributor.rate"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {edit ? (
                            <RHFTextField
                              name="commissionSettingsForLeadGeneration.masterDistributor.rate"
                              label="Commission Value"
                              type="number"
                            />
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "commissionSettingsForLeadGeneration.masterDistributor.rate"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {edit ? (
                            <RHFSelect
                              name="commissionSettingsForLeadGeneration.partner.transactionType"
                              label="Type"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="Charge">Charge</MenuItem>
                              <MenuItem value="Commission">Commission</MenuItem>
                            </RHFSelect>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "commissionSettingsForLeadGeneration.partner.transactionType"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {edit ? (
                            <RHFTextField
                              name="commissionSettingsForLeadGeneration.partner.rate"
                              label="Value"
                              type="number"
                            />
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "commissionSettingsForLeadGeneration.partner.rate"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
            <Card sx={{ mt: 4, width: 720 }}>
              <TableContainer sx={{ overflow: "unset" }}>
                <Scrollbar>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Settlement Type</TableCell>
                        {watch("settlementSettingForLeadGeneration.type") ==
                          "Scheduled" && (
                          <>
                            <TableCell>Settlement Month</TableCell>
                            {watch(
                              "settlementSettingForLeadGeneration.scheduledFor"
                            ) == "Next Month" && (
                              <TableCell>Settlement Date</TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      <TableRow sx={{ verticalAlign: "baseline" }}>
                        <TableCell>
                          {edit ? (
                            <RHFSelect
                              name="settlementSettingForLeadGeneration.type"
                              label="Settlement Type"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="Scheduled">Scheduled</MenuItem>
                              <MenuItem
                                value="Instant"
                                onClick={() => {
                                  resetField(
                                    "settlementSettingForLeadGeneration.scheduledFor"
                                  );
                                  resetField(
                                    "settlementSettingForLeadGeneration.dayOfMonth"
                                  );
                                }}
                              >
                                Instant
                              </MenuItem>
                            </RHFSelect>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch(
                                "settlementSettingForLeadGeneration.type"
                              ) || "-"}
                            </Typography>
                          )}
                        </TableCell>
                        {watch("settlementSettingForLeadGeneration.type") ==
                          "Scheduled" && (
                          <>
                            <TableCell>
                              {edit ? (
                                <RHFSelect
                                  name="settlementSettingForLeadGeneration.scheduledFor"
                                  label="Settlement Month"
                                  SelectProps={{
                                    native: false,
                                    sx: { textTransform: "capitalize" },
                                  }}
                                >
                                  <MenuItem
                                    value="End of Every Month"
                                    onClick={() =>
                                      resetField(
                                        "settlementSettingForLeadGeneration.dayOfMonth"
                                      )
                                    }
                                  >
                                    End of every Month
                                  </MenuItem>
                                  <MenuItem value="Next Month">
                                    Next Month
                                  </MenuItem>
                                </RHFSelect>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{ alignSelf: "center" }}
                                >
                                  {watch(
                                    "settlementSettingForLeadGeneration.scheduledFor"
                                  ) || "-"}
                                </Typography>
                              )}
                            </TableCell>

                            {watch(
                              "settlementSettingForLeadGeneration.scheduledFor"
                            ) == "Next Month" && (
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name="settlementSettingForLeadGeneration.dayOfMonth"
                                    label="Settlement Date"
                                    InputLabelProps={{
                                      shrink:
                                        watch(
                                          "settlementSettingForLeadGeneration.dayOfMonth"
                                        ) !== null &&
                                        watch(
                                          "settlementSettingForLeadGeneration.dayOfMonth"
                                        )! > 0,
                                    }}
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                  >
                                    {[...Array(28)].map((item, index) => {
                                      return (
                                        <MenuItem value={index + 1}>
                                          {index + 1}
                                        </MenuItem>
                                      );
                                    })}
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {watch(
                                      "settlementSettingForLeadGeneration.dayOfMonth"
                                    ) || "-"}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
          </Card>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1">On Disbursal</Typography>
            <Card sx={{ mt: 2 }}>
              {/* <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} /> */}

              <TableContainer sx={{ overflow: "unset" }}>
                <Scrollbar sx={{ pb: 2 }}>
                  <Table sx={{ minWidth: 720 }} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Min Rs.</TableCell>
                        <TableCell>Max Rs.</TableCell>
                        <TableCell>Agent Charge/ Commission</TableCell>
                        <TableCell>Type(Agent)</TableCell>
                        <TableCell>Value(Agent)</TableCell>
                        <TableCell>Commission Type(Distributor)</TableCell>
                        <TableCell>Commission value(Distributor)</TableCell>
                        <TableCell>
                          Commission Type(Master Distributor)
                        </TableCell>
                        <TableCell>
                          Commission value(Master Distributor)
                        </TableCell>
                        <TableCell>Api User Charge/ Commission</TableCell>
                        <TableCell>Type(Api User)</TableCell>
                        <TableCell>Value(Api User)</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {fields.length &&
                        fields.map((item: any, index: number) => {
                          return (
                            <TableRow
                              key={index}
                              sx={{ verticalAlign: "baseline" }}
                            >
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSettingsPostDisbursal.${index}.slabLowerLimit`}
                                    label="Min value"
                                    type="number"
                                    sx={{ minWidth: 100 }}
                                    disabled={
                                      index > 0 || !(fields.length - 1 == index)
                                    }
                                  />
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.slabLowerLimit}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSettingsPostDisbursal.${index}.slabUpperLimit`}
                                    label="Max value"
                                    type="number"
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  />
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.slabUpperLimit || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`commissionSettingsPostDisbursal.${index}.agent.transactionType`}
                                    label="charge/commission"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                    disabled={!(fields.length - 1 == index)}
                                    sx={{ minWidth: 100 }}
                                  >
                                    <MenuItem value="Charge">Charge</MenuItem>
                                    <MenuItem value="Commission">
                                      Commission
                                    </MenuItem>
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.agent.transactionType || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`commissionSettingsPostDisbursal.${index}.agent.rateType`}
                                    label="Type"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  >
                                    <MenuItem value="Percentage">%</MenuItem>
                                    <MenuItem value="Flat">Rs.</MenuItem>
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.agent.rateType || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSettingsPostDisbursal.${index}.agent.rate`}
                                    label="Value"
                                    type="number"
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  />
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.agent.rate || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`commissionSettingsPostDisbursal.${index}.distributor.rateType`}
                                    label="Type"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  >
                                    <MenuItem value="Percentage">%</MenuItem>
                                    <MenuItem value="Flat">Rs.</MenuItem>
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.distributor.rateType || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSettingsPostDisbursal.${index}.distributor.rate`}
                                    label="Value"
                                    type="number"
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  />
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.distributor.rate || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`commissionSettingsPostDisbursal.${index}.masterDistributor.rateType`}
                                    label="Type"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  >
                                    <MenuItem value="Percentage">%</MenuItem>
                                    <MenuItem value="Flat">Rs.</MenuItem>
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.masterDistributor.rateType || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSettingsPostDisbursal.${index}.masterDistributor.rate`}
                                    label="Value"
                                    type="number"
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  />
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.masterDistributor.rate || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`commissionSettingsPostDisbursal.${index}.partner.transactionType`}
                                    label="charge/commission"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  >
                                    <MenuItem value="Charge">Charge</MenuItem>
                                    <MenuItem value="Commission">
                                      Commission
                                    </MenuItem>
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.partner.transactionType || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name={`commissionSettingsPostDisbursal.${index}.partner.rateType`}
                                    label="Type"
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  >
                                    <MenuItem value="Percentage">%</MenuItem>
                                    <MenuItem value="Flat">Rs.</MenuItem>
                                  </RHFSelect>
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.partner.rateType || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {edit ? (
                                  <RHFTextField
                                    name={`commissionSettingsPostDisbursal.${index}.partner.rate`}
                                    label="Value"
                                    type="number"
                                    sx={{ minWidth: 100 }}
                                    disabled={!(fields.length - 1 == index)}
                                  />
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ alignSelf: "center" }}
                                  >
                                    {item.partner.rate || "-"}{" "}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ verticalAlign: "middle" }}>
                                {fields.length - 1 === index && (
                                  <Stack
                                    flexDirection={"row"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                  >
                                    <IconButton
                                      disabled={
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.slabLowerLimit`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.slabUpperLimit`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.agent.transactionType`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.agent.rateType`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.agent.rate`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.distributor.rateType`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.distributor.rate`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.masterDistributor.rateType`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.masterDistributor.rate`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.partner.transactionType`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.partner.rateType`
                                        ) ||
                                        !watch(
                                          `commissionSettingsPostDisbursal.${index}.partner.rate`
                                        ) ||
                                        !!errors
                                          ?.commissionSettingsPostDisbursal
                                          ?.length
                                      }
                                      onClick={() =>
                                        append({
                                          slabLowerLimit:
                                            +watch(
                                              `commissionSettingsPostDisbursal.${index}.slabUpperLimit`
                                            )! + 1,
                                          slabUpperLimit: 0,
                                          agent: {
                                            transactionType: "",
                                            rateType: "",
                                            rate: 0,
                                          },
                                          distributor: {
                                            transactionType: "Commission",
                                            rateType: "",
                                            rate: 0,
                                          },
                                          masterDistributor: {
                                            transactionType: "Commission",
                                            rateType: "",
                                            rate: 0,
                                          },
                                          partner: {
                                            transactionType: "",
                                            rateType: "",
                                            rate: 0,
                                          },
                                        })
                                      }
                                    >
                                      <Iconify icon="ph:plus-bold" />
                                    </IconButton>
                                    {index >= 1 && (
                                      <IconButton onClick={() => remove(index)}>
                                        <Iconify icon="ph:minus-bold" />
                                      </IconButton>
                                    )}
                                  </Stack>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>

            <Card sx={{ mt: 4, width: 720 }}>
              <TableContainer sx={{ overflow: "unset" }}>
                <Scrollbar>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Settlement Type</TableCell>
                        {watch("settlementSettingForDisbursal.type") ==
                          "Scheduled" && (
                          <>
                            <TableCell>Settlement Month</TableCell>
                            {watch(
                              "settlementSettingForDisbursal.scheduledFor"
                            ) == "Next Month" && (
                              <TableCell>Settlement Date</TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      <TableRow sx={{ verticalAlign: "baseline" }}>
                        <TableCell>
                          {edit ? (
                            <RHFSelect
                              name="settlementSettingForDisbursal.type"
                              label="Settlement Type"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="Scheduled">Scheduled</MenuItem>
                              <MenuItem
                                value="Instant"
                                onClick={() => {
                                  resetField(
                                    "settlementSettingForDisbursal.scheduledFor"
                                  );
                                  resetField(
                                    "settlementSettingForDisbursal.dayOfMonth"
                                  );
                                }}
                              >
                                Instant
                              </MenuItem>
                            </RHFSelect>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{ alignSelf: "center" }}
                            >
                              {watch("settlementSettingForDisbursal.type") ||
                                "-"}
                            </Typography>
                          )}
                        </TableCell>
                        {watch("settlementSettingForDisbursal.type") ==
                          "Scheduled" && (
                          <>
                            <TableCell>
                              {edit ? (
                                <RHFSelect
                                  name="settlementSettingForDisbursal.scheduledFor"
                                  label="Settlement Month"
                                  SelectProps={{
                                    native: false,
                                    sx: { textTransform: "capitalize" },
                                  }}
                                >
                                  <MenuItem
                                    value="End of Every Month"
                                    onClick={() =>
                                      resetField(
                                        "settlementSettingForDisbursal.dayOfMonth"
                                      )
                                    }
                                  >
                                    End of every Month
                                  </MenuItem>
                                  <MenuItem value="Next Month">
                                    Next Month
                                  </MenuItem>
                                </RHFSelect>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{ alignSelf: "center" }}
                                >
                                  {watch(
                                    "settlementSettingForDisbursal.scheduledFor"
                                  ) || "-"}
                                </Typography>
                              )}
                            </TableCell>

                            {watch(
                              "settlementSettingForDisbursal.scheduledFor"
                            ) == "Next Month" && (
                              <TableCell>
                                {edit ? (
                                  <RHFSelect
                                    name="settlementSettingForDisbursal.dayOfMonth"
                                    label="Settlement Date"
                                    InputLabelProps={{
                                      shrink:
                                        watch(
                                          "settlementSettingForLeadGeneration.dayOfMonth"
                                        ) !== null &&
                                        watch(
                                          "settlementSettingForLeadGeneration.dayOfMonth"
                                        )! > 0,
                                    }}
                                    SelectProps={{
                                      native: false,
                                      sx: { textTransform: "capitalize" },
                                    }}
                                  >
                                    {[...Array(28)].map((item, index) => {
                                      return (
                                        <MenuItem value={index + 1}>
                                          {index + 1}
                                        </MenuItem>
                                      );
                                    })}
                                  </RHFSelect>
                                ) : (
                                  (
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ alignSelf: "center" }}
                                    >
                                      {watch(
                                        "settlementSettingForDisbursal.dayOfMonth"
                                      )}
                                    </Typography>
                                  ) || "-"
                                )}
                              </TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
          </Card>
        </FormProvider>
      </SchemeDetail.Provider>
    </>
  );
}
