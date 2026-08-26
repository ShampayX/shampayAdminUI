import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
// @mui
import { Box, Chip, Stack, MenuItem, TextField, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
// routes
import { PATH_DASHBOARD } from "src/routes/paths";
import { useNavigate } from "react-router-dom";
// page kit
import {
  PageHeader,
  PageGhostButton,
  FilterBar,
  FilterSlot,
} from "src/components/page-kit";
//
import SlabSlotPanel from "./SlabSlotPanel";
import AepsSlotPanel from "./AepsSlotPanel";
import VendorPaymentSlotPanel from "./VendorPaymentSlotPanel";
import { SLOT_SERVICES, slotServiceByKey } from "./providerCatalog";

// ----------------------------------------------------------------------
// Providers > Service Configuration.
//
// One screen in place of thirteen. The old sidebar carried a separate entry,
// route, page and table component for Credit Card Slots, Money Transfer Slots,
// Vendor Payment Slots, DMT1, DMT2, Payin, AEPS, PBPS, BBPS, Transfer, Payout,
// Payout UPI and ADMT - eleven of which were the same file with two endpoint
// names swapped.
//
// The service lives in the url (`?service=dmt1`) so a particular service is
// still linkable and the browser Back button still works. Every legacy
// `/vendor/<x>slots` route redirects here with its service preselected.
//
// The service list is a frontend registry (providerCatalog) rather than an API
// call because the slab endpoints are individually named - there is no
// "list configurable services" endpoint to drive it from.
// ----------------------------------------------------------------------

const DEFAULT_SERVICE = SLOT_SERVICES[0].key;

export default function ServiceConfiguration() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("service") || "";
  const service = useMemo(
    () => slotServiceByKey(requested) || slotServiceByKey(DEFAULT_SERVICE)!,
    [requested]
  );

  /* Normalise an unknown or missing ?service= so the url always names the
     service actually on screen. */
  useEffect(() => {
    if (requested !== service.key) {
      setSearchParams({ service: service.key }, { replace: true });
    }
  }, [requested, service.key, setSearchParams]);

  return (
    <>
      <Helmet>
        <title> Service Configuration | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Service Configuration"
          subtitle="Amount slabs for every service, in one place. Slabs are set per service - they apply to whichever provider is routed to it."
          actions={
            <>
              <PageGhostButton
                startIcon={<StorefrontOutlinedIcon />}
                onClick={() => navigate(PATH_DASHBOARD.vendor.directory)}
              >
                Directory
              </PageGhostButton>
              <PageGhostButton
                startIcon={<AltRouteOutlinedIcon />}
                onClick={() => navigate(PATH_DASHBOARD.vendor.routing)}
              >
                Routing
              </PageGhostButton>
            </>
          }
        />

        <FilterBar>
          <FilterSlot icon={<CategoryOutlinedIcon />} grow minWidth={280}>
            <TextField
              select
              fullWidth
              variant="standard"
              value={service.key}
              onChange={(event) =>
                setSearchParams({ service: event.target.value })
              }
              InputProps={{ disableUnderline: true }}
            >
              {SLOT_SERVICES.map((entry) => (
                <MenuItem key={entry.key} value={entry.key}>
                  {entry.label}
                </MenuItem>
              ))}
            </TextField>
          </FilterSlot>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: 0.5, minWidth: 0 }}
          >
            <TuneOutlinedIcon
              sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }}
            />
            <Typography
              sx={{ fontSize: 12.5, color: "text.secondary", minWidth: 0 }}
            >
              {service.hint}
            </Typography>
            {service.editor !== "slab" && (
              <Chip
                size="small"
                label="Per product"
                sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
              />
            )}
          </Stack>
        </FilterBar>

        {/* One reusable editor per configuration shape, chosen by the registry.
            Keyed on the service so switching services remounts rather than
            carrying the previous service's staged state across. */}
        {service.editor === "aeps" ? (
          <AepsSlotPanel key={service.key} />
        ) : service.editor === "vendorPayment" ? (
          <VendorPaymentSlotPanel key={service.key} />
        ) : (
          <SlabSlotPanel key={service.key} service={service} />
        )}
      </Box>
    </>
  );
}
