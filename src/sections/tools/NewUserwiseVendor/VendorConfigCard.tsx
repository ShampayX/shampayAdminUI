import { useEffect } from "react";
// @mui
import {
  Box,
  Chip,
  Stack,
  Dialog,
  Select,
  MenuItem,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
// form
import { useForm, Controller } from "react-hook-form";
import FormProvider from "src/components/hook-form";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "src/components/snackbar";
//
import { CHANNELS, RoutingRow, Vendor } from "./VendorConfigContainer";

// ----------------------------------------------------------------------
// Routing editor for one service product.
//
// A route is "which vendor handles this product" for each of the three
// downstream channels. Those three ids are the entire payload accepted by
// `product/setUserVendorSwitch` - there is no priority or enabled flag behind
// this screen, so none is offered.
// ----------------------------------------------------------------------

type FormValues = {
  neoNetworkVendorId: string;
  directAgentVendorId: string;
  apiUserVendorId: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  row: RoutingRow;
  vendors: Vendor[];
  /** Reload the routing table after a successful save. */
  onSaved: () => void;
}

export default function VendorRoutingDialog({
  open,
  onClose,
  userId,
  row,
  vendors,
  onSaved,
}: Props) {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<FormValues>({
    defaultValues: {
      neoNetworkVendorId: "",
      directAgentVendorId: "",
      apiUserVendorId: "",
    },
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  /* Seed from the route already on the row - a vendor that has since left the
     catalogue is dropped, so the select never holds an unselectable value. */
  useEffect(() => {
    if (!open) return;

    const known = (vendorId?: string) =>
      vendorId && vendors.some((v) => v.vendorId === vendorId) ? vendorId : "";

    reset({
      neoNetworkVendorId: known(row.channels.neoNetwork?.vendorId),
      directAgentVendorId: known(row.channels.directAgent?.vendorId),
      apiUserVendorId: known(row.channels.apiUser?.vendorId),
    });
  }, [open, row, vendors, reset]);

  const onSubmit = async (data: FormValues) => {
    const token = localStorage.getItem("token");

    const body = {
      userId,
      productId: row.productId,
      neoNetworkVendorId: data.neoNetworkVendorId,
      directAgentVendorId: data.directAgentVendorId,
      apiUserVendorId: data.apiUserVendorId,
    };

    const res = await Api("product/setUserVendorSwitch", "POST", body, token);

    if (
      res?.status === 200 &&
      (res.data.code === 200 || res.data.success === true)
    ) {
      enqueueSnackbar(res.data.message || "Routing updated");
      onSaved();
      onClose();
      return;
    }

    enqueueSnackbar(res?.data?.message || "Failed to update routing", {
      variant: "error",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
              Edit Routing
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
              {row.productName}
              {row.categoryName ? ` • ${row.categoryName}` : ""}
            </Typography>
          </Box>

          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, mr: -1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ px: 3, py: 2.5 }}>
          {vendors.length === 0 ? (
            <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
              No vendors are published for this service, so routing cannot be
              changed here yet.
            </Typography>
          ) : (
            <Stack spacing={2.5}>
              {CHANNELS.map((channel) => (
                <Controller
                  key={channel.key}
                  name={channel.field}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>{channel.label}</InputLabel>
                      <Select
                        {...field}
                        label={channel.label}
                        value={field.value || ""}
                      >
                        <MenuItem value="">
                          <em>Not routed</em>
                        </MenuItem>
                        {vendors.map((vendor) => (
                          <MenuItem key={vendor.vendorId} value={vendor.vendorId}>
                            {vendor.vendorName}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{channel.hint}</FormHelperText>
                    </FormControl>
                  )}
                />
              ))}

              {row.updatedBy && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Last updated by ${row.updatedBy.email}`}
                    sx={{ fontSize: 11 }}
                  />
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    {new Date(row.updatedBy.date).toLocaleString()}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <LoadingButton variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </LoadingButton>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={vendors.length === 0}
          >
            Save Routing
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
