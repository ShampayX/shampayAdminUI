import { useState, useEffect } from "react";
import {
  MenuItem,
  Typography,
  Stack,
  Switch,
  Box,
  IconButton,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import { Modal, TextField } from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import {
  FormCard,
  ModalShell,
  PageActionButton,
  PageGhostButton,
} from "src/components/page-kit";
import { VendorLane, VendorValue } from "./VendorLane";

// ----------------------------------------------------------------------

type FormValuesProps = {
  vendorMode: "GLOBAL" | "USER_WISE";
  neoNetworkVendor: {
    vendorId: string;
    vendorName: string;
  };
  apiUserVendor: {
    vendorId: string;
    vendorName: string;
  };
  directAgentVendor: {
    vendorId: string;
    vendorName: string;
  };
};

function PayoutComponet(props: any) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [isEdit, setIsEdit] = useState(false);

  const [slabWiseEnabled, setSlabWiseEnabled] = useState(false);
  const [slabs, setSlabs] = useState<any[]>([]);
  const [openSlabModal, setOpenSlabModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // ✅ SINGLE SOURCE OF TRUTH
  const product = props?.ProdectData;
  const productId = product?._id;

  // ✅ VendorId → VendorName helper
  const getVendorName = (vendorId?: string) =>
    props?.vendorList?.find((v: any) => v.vendorId === vendorId)?.vendorName ||
    "";

  // ✅ Default values directly from PRODUCT API
  const defaultValues: FormValuesProps = {
    vendorMode: product?.vendorMode ?? "GLOBAL",

    neoNetworkVendor: {
      vendorId: product?.neoNetworkVendor ?? "",
      vendorName: getVendorName(product?.neoNetworkVendor),
    },

    apiUserVendor: {
      vendorId: product?.apiUserVendor ?? "",
      vendorName: getVendorName(product?.apiUserVendor),
    },

    directAgentVendor: {
      vendorId: product?.directAgentVendor ?? "",
      vendorName: getVendorName(product?.directAgentVendor),
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(Yup.object().shape({})),
    defaultValues: {
      vendorMode: "GLOBAL",
      neoNetworkVendor: { vendorId: "", vendorName: "" },
      apiUserVendor: { vendorId: "", vendorName: "" },
      directAgentVendor: { vendorId: "", vendorName: "" },
    },
  });

  useEffect(() => {
    if (!product || !props.vendorList?.length) return;

    methods.reset({
      vendorMode: product.vendorMode ?? "GLOBAL",

      neoNetworkVendor: {
        vendorId: product.neoNetworkVendor ?? "",
        vendorName: getVendorName(product.neoNetworkVendor),
      },

      apiUserVendor: {
        vendorId: product.apiUserVendor ?? "",
        vendorName: getVendorName(product.apiUserVendor),
      },

      directAgentVendor: {
        vendorId: product.directAgentVendor ?? "",
        vendorName: getVendorName(product.directAgentVendor),
      },
    });
  }, [product, props.vendorList, methods]);

  useEffect(() => {
    getVendorName();
  });

  useEffect(() => {
    if (!product) return;
    setSlabWiseEnabled(!!product?.SlabWiseVendor);
  }, [product]);

  const fetchSlabs = async () => {
    const token = localStorage.getItem("token");

    const res = await Api(
      `product/getSlabVendorSwitch/${productId}`,
      "GET",
      {},
      token
    );

    if (res?.status === 200 && res?.data?.code === 200) {
      const slabData = res.data.data.slabs || [];
      setSlabs(slabData);
      // setSlabWiseEnabled(slabData.length > 0);
    }
  };

  const { watch } = methods;

  const {
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const validateSlabs = () => {
    if (!slabs.length) return "At least one slab required";

    const sorted = [...slabs].sort(
      (a, b) => Number(a.minAmount) - Number(b.minAmount)
    );

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];

      if (
        !current.minAmount ||
        !current.maxAmount ||
        !current.apiUserVendorId
      ) {
        return "All slab fields are required";
      }

      if (Number(current.minAmount) >= Number(current.maxAmount)) {
        return `Min must be less than Max (Slab ${i + 1})`;
      }

      if (i > 0) {
        const previous = sorted[i - 1];

        if (Number(current.minAmount) <= Number(previous.maxAmount)) {
          return "Slab amounts overlapping detected";
        }
      }
    }

    return null;
  };

  const saveSlabs = async () => {
    const error = validateSlabs();
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    const token = localStorage.getItem("token");

    await Api(
      "product/setSlabWiseVendorSwitch",
      "POST",
      {
        productId,
        slabs: slabs.sort((a, b) => Number(a.minAmount) - Number(b.minAmount)),
      },
      token
    );

    // After saving slabs → enable slab mode in active vendor
    // await Api(
    //   "product/setActiveVendor",
    //   "POST",
    //   {
    //     productId,
    //     vendorMode: methods.getValues("vendorMode"),
    //     neoNetworkVendorId: methods.getValues("neoNetworkVendor.vendorId"),
    //     apiUserVendorId: methods.getValues("apiUserVendor.vendorId"),
    //     directAgentVendorId: methods.getValues("directAgentVendor.vendorId"),
    //     slabWiseVendor: true,
    //   },
    //   token
    // );

    setOpenSlabModal(false);
    enqueueSnackbar("Slabs Saved");
  };

  const onSubmit = async (data: FormValuesProps) => {
    if (!isEdit) {
      setIsEdit(true);
      return;
    }

    const token = localStorage.getItem("token");

    const body = {
      productId,
      vendorMode: data.vendorMode,
      neoNetworkVendorId: data.neoNetworkVendor.vendorId,
      apiUserVendorId: data.apiUserVendor.vendorId,
      directAgentVendorId: data.directAgentVendor.vendorId,
      slabWiseVendor: slabWiseEnabled,
    };

    const res = await Api("product/setActiveVendor", "POST", body, token);

    if (res?.status === 200 && res.data.code === 200) {
      enqueueSnackbar(res.data.message);
      setIsEdit(false);
      props?.refetchProducts?.();
    }
  };

  return (
    <>
      <Helmet>
        <title>Vendor Switch | Shampay Admin</title>
      </Helmet>

      <Box sx={{ maxWidth: 760, mt: 3 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <FormCard
            title={product?.productName}
            subtitle="Payout routing for this product."
            actions={
              isEdit ? (
                <PageActionButton
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting}
                >
                  Save
                </PageActionButton>
              ) : (
                <PageGhostButton type="submit" startIcon={<EditIcon />}>
                  Edit
                </PageGhostButton>
              )
            }
          >
            {/* Neo Network */}
            <Row
              title="Neo Network Vendor"
              hint="Retail network users on the platform."
              isEdit={isEdit}
              value={getVendorName(product?.neoNetworkVendor)}
              name="neoNetworkVendor.vendorId"
              vendorList={props.vendorList}
            />

            {/* Direct Agent */}
            <Row
              title="Direct Agent Vendor"
              hint="Agents onboarded directly, without a distributor."
              isEdit={isEdit}
              value={getVendorName(product?.directAgentVendor)}
              name="directAgentVendor.vendorId"
              vendorList={props.vendorList}
            />

            {/* API User */}
            <Row
              title="API User Vendor"
              hint="Partners integrating over the public API."
              isEdit={isEdit}
              value={getVendorName(product?.apiUserVendor)}
              name="apiUserVendor.vendorId"
              vendorList={props.vendorList}
            />

            {/* Vendor Mode */}
            <VendorLane
              label="Vendor Mode"
              hint="Global applies one vendor to everyone; User Wise follows per-user overrides."
            >
              {isEdit ? (
                <RHFSelect
                  name="vendorMode"
                  label="Vendor Mode"
                  SelectProps={{ native: false }}
                >
                  <MenuItem value="GLOBAL">Global</MenuItem>
                  <MenuItem value="USER_WISE">User Wise</MenuItem>
                </RHFSelect>
              ) : (
                <VendorValue
                  value={
                    getValues("vendorMode") === "GLOBAL" ? "Global" : "User Wise"
                  }
                />
              )}
            </VendorLane>

            {/* Slab Wise Vendor with Eye Icon */}
            <VendorLane
              label="Slab Wise Vendor"
              hint="Route payouts to a different vendor per amount band."
              divider={false}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Switch
                  checked={slabWiseEnabled}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setSlabWiseEnabled(checked);

                    const token = localStorage.getItem("token");

                    await Api(
                      "product/setActiveVendor",
                      "POST",
                      {
                        productId,
                        vendorMode: methods.getValues("vendorMode"),
                        neoNetworkVendorId: methods.getValues(
                          "neoNetworkVendor.vendorId"
                        ),
                        apiUserVendorId: methods.getValues(
                          "apiUserVendor.vendorId"
                        ),
                        directAgentVendorId: methods.getValues(
                          "directAgentVendor.vendorId"
                        ),
                        slabWiseVendor: checked,
                      },
                      token
                    );
                  }}
                />

                <IconButton
                  size="small"
                  title="View slab configuration"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSlabModal(true);
                    setIsReadOnly(false);
                    fetchSlabs();
                  }}
                  type="button"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Stack>
            </VendorLane>

            {product?.createdBy && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mt: 2.5,
                  pt: 2,
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  Updated By:
                </Typography>
                <Typography variant="caption" fontWeight={500}>
                  {product.createdBy.email}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  •
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(product.createdBy.date).toLocaleString()}
                </Typography>
              </Stack>
            )}
          </FormCard>
        </FormProvider>
      </Box>

      {/* Slab Modal - Read-only or Edit Mode */}

      <Modal open={openSlabModal} onClose={() => setOpenSlabModal(false)}>
        <Box>
          <ModalShell
            title={
              isReadOnly ? "Slab wise vendors" : "Configure slab wise vendors"
            }
            subtitle="Each band routes to one vendor. Bands must not overlap."
            onClose={() => setOpenSlabModal(false)}
            width={680}
            actions={
              isReadOnly ? (
                <PageGhostButton onClick={() => setOpenSlabModal(false)}>
                  Close
                </PageGhostButton>
              ) : (
                <>
                  <PageGhostButton onClick={() => setOpenSlabModal(false)}>
                    Cancel
                  </PageGhostButton>
                  <PageActionButton startIcon={<SaveIcon />} onClick={saveSlabs}>
                    Save slabs
                  </PageActionButton>
                </>
              )
            }
          >
            <Stack spacing={2.5}>
              {!isReadOnly && (
                <Stack direction="row" justifyContent="flex-end">
                  <PageGhostButton
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setSlabs([
                        ...slabs,
                        {
                          apiUserVendorId: "",
                          minAmount: "",
                          maxAmount: "",
                          priority: 1,
                          isActive: true,
                        },
                      ])
                    }
                  >
                    Add slab
                  </PageGhostButton>
                </Stack>
              )}

              {slabs.length === 0 && (
                <Typography
                  sx={{ py: 4, textAlign: "center", color: "text.disabled" }}
                >
                  No slab configuration found.
                </Typography>
              )}

              {slabs.map((slab, index) => (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  key={index}
                >
                  <TextField
                    label="Min Amount"
                    type="number"
                    size="small"
                    fullWidth
                    value={slab.minAmount === 0 ? "" : slab.minAmount}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        const updated = [...slabs];
                        updated[index].minAmount =
                          e.target.value === "" ? "" : Number(e.target.value);
                        setSlabs(updated);
                      }
                    }}
                  />

                  <TextField
                    label="Max Amount"
                    type="number"
                    size="small"
                    fullWidth
                    value={slab.maxAmount === 0 ? "" : slab.maxAmount}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        const updated = [...slabs];
                        updated[index].maxAmount =
                          e.target.value === "" ? "" : Number(e.target.value);
                        setSlabs(updated);
                      }
                    }}
                  />

                  <TextField
                    select
                    label="Vendor"
                    size="small"
                    fullWidth
                    value={slab.apiUserVendorId}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        const updated = [...slabs];
                        updated[index].apiUserVendorId = e.target.value;
                        setSlabs(updated);
                      }
                    }}
                  >
                    {props.vendorList.map((v: any) => (
                      <MenuItem key={v.vendorId} value={v.vendorId}>
                        {v.vendorName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              ))}
            </Stack>
          </ModalShell>
        </Box>
      </Modal>
    </>
  );
}

export default PayoutComponet;

// ----------------------------------------------------------------------
// 🔹 Small reusable row
function Row({ title, hint, isEdit, value, name, vendorList }: any) {
  return (
    <VendorLane label={title} hint={hint}>
      {isEdit ? (
        <RHFSelect
          name={name}
          label="Active Vendor"
          SelectProps={{ native: false }}
        >
          {vendorList.map((item: any) => (
            <MenuItem key={item.vendorId} value={item.vendorId}>
              {item.vendorName}
            </MenuItem>
          ))}
        </RHFSelect>
      ) : (
        <VendorValue value={value} />
      )}
    </VendorLane>
  );
}
