import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
// @mui
import {
  Box,
  Chip,
  Modal,
  Stack,
  MenuItem,
  TableCell,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
// routes
import { PATH_DASHBOARD } from "src/routes/paths";
// components
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  SearchField,
  DataTable,
  KitRow,
  StackedCell,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
  ModalShell,
  useDataTable,
  exportToExcel,
} from "src/components/page-kit";
//
import ProviderForm from "./ProviderForm";
import { useProviders, ProviderWithServices } from "./useProviders";
import {
  SERVICE_VENDOR_LISTS,
  availableForLabel,
  commissionLabel,
  providerName,
  transactionTypeLabel,
} from "./providerCatalog";

// ----------------------------------------------------------------------
// Providers > Provider Directory.
//
// Replaces the old "Add New Vendor" screen, whose two tabs were a create form
// and a list that filtered nothing (its five filter inputs were all bound to
// the same unused field, and its pagination rendered without a page count).
//
// Fields that do NOT exist on `vendor/get_VendorList`, so are not shown:
//   - no status / active flag. A provider cannot be enabled or disabled: there
//     is no such field on the payload and no endpoint that would set one. The
//     closest real signal is "Available for", which is the channel the
//     provider is published to, so that is what the table shows.
//   - no priority. Priority is a per-product routing concern and lives on
//     `product/getActiveVendor` - see Provider Routing.
//   - no updated timestamp on most rows, so "Added" shows `createdAt` when the
//     payload carries one and nothing when it does not.
// ----------------------------------------------------------------------

const ALL = "__all__";

export default function ProviderDirectory() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { providers, loading, error, coverageUnavailable, reload } =
    useProviders();

  const [serviceFilter, setServiceFilter] = useState(ALL);
  const [audienceFilter, setAudienceFilter] = useState(ALL);
  const [adding, setAdding] = useState(false);

  /* Audience options come from the data, not a hardcoded list, so a value the
     backend starts returning tomorrow still appears in the filter. */
  const audiences = useMemo(() => {
    const seen = new Set<string>();
    providers.forEach((provider) => {
      if (provider.vendorAvailableFor) seen.add(provider.vendorAvailableFor);
    });
    return Array.from(seen);
  }, [providers]);

  const filtered = useMemo(
    () =>
      providers.filter((provider) => {
        if (serviceFilter !== ALL && !provider.services.includes(serviceFilter))
          return false;
        if (
          audienceFilter !== ALL &&
          provider.vendorAvailableFor !== audienceFilter
        )
          return false;
        return true;
      }),
    [providers, serviceFilter, audienceFilter]
  );

  const table = useDataTable<ProviderWithServices>(filtered, {
    rowsPerPage: 25,
    storageKey: "provider-directory",
  });

  const totals = useMemo(() => {
    const published = providers.filter(
      (provider) => provider.services.length > 0
    ).length;

    const covered = new Set<string>();
    providers.forEach((provider) =>
      provider.services.forEach((service) => covered.add(service))
    );

    return {
      providers: providers.length,
      published,
      unpublished: providers.length - published,
      services: covered.size,
    };
  }, [providers]);

  const handleExport = () => {
    const rows = table.results.map((provider) => ({
      Provider: providerName(provider),
      "Provider ID": provider._id,
      GSTIN: provider.vendor_gst || "",
      Services: provider.services.join(", "),
      "Available for": availableForLabel(provider.vendorAvailableFor),
      Commission: commissionLabel(provider.commissionType),
      "Transaction type": transactionTypeLabel(provider.vendortransactionType),
      "Payment terms": provider.paymentTerms || "",
      Contact: provider.vendorContactName || "",
      Email: provider.vendor_email || "",
      Phone: provider.vendorContact || "",
    }));

    if (!exportToExcel(rows, "provider-directory", "Providers")) {
      enqueueSnackbar("Nothing to export", { variant: "warning" });
    }
  };

  return (
    <>
      <Helmet>
        <title> Provider Directory | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Provider Directory"
          subtitle="Every service provider on the platform, the services each one is published for, and the commercial terms behind them."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={reload}
              >
                Refresh
              </PageGhostButton>
              <PageGhostButton
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleExport}
                disabled={table.isEmpty}
              >
                Export
              </PageGhostButton>
              <PageActionButton
                startIcon={<AddOutlinedIcon />}
                onClick={() => setAdding(true)}
              >
                Add provider
              </PageActionButton>
            </>
          }
        />

        {loading ? (
          <LoadingState label="Loading providers..." height={340} />
        ) : error ? (
          <EmptyState
            icon={<StorefrontOutlinedIcon />}
            title="Could not load providers"
            description="The provider list did not come back. Check the connection and try again."
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={reload}
              >
                Retry
              </PageGhostButton>
            }
          />
        ) : providers.length === 0 ? (
          <EmptyState
            icon={<StorefrontOutlinedIcon />}
            title="No providers yet"
            description="Add the first provider to start routing services through it."
            action={
              <PageActionButton
                startIcon={<AddOutlinedIcon />}
                onClick={() => setAdding(true)}
              >
                Add provider
              </PageActionButton>
            }
          />
        ) : (
          <>
            <StatGrid>
              <StatCard
                label="Total Providers"
                value={totals.providers}
                caption="On the platform"
                icon={<StorefrontOutlinedIcon />}
              />
              <StatCard
                label="Published"
                value={totals.published}
                caption="Listed for at least one service"
                tone="success"
                icon={<HubOutlinedIcon />}
              />
              <StatCard
                label="Not Published"
                value={totals.unpublished}
                caption="Not listed for any service"
                tone={totals.unpublished > 0 ? "warning" : "neutral"}
                icon={<GroupsOutlinedIcon />}
              />
              <StatCard
                label="Services Covered"
                value={`${totals.services} / ${SERVICE_VENDOR_LISTS.length}`}
                caption="Services with a provider listed"
                tone="neutral"
                icon={<CategoryOutlinedIcon />}
              />
            </StatGrid>

            <FilterBar>
              <SearchField
                value={table.query}
                onChange={table.setQuery}
                placeholder="Search provider, GSTIN, contact, email..."
                count={table.total}
                total={filtered.length}
              />

              <FilterSlot icon={<CategoryOutlinedIcon />} minWidth={200}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={serviceFilter}
                  onChange={(event) => setServiceFilter(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                >
                  <MenuItem value={ALL}>All services</MenuItem>
                  {SERVICE_VENDOR_LISTS.map((service) => (
                    <MenuItem key={service.label} value={service.label}>
                      {service.label}
                    </MenuItem>
                  ))}
                </TextField>
              </FilterSlot>

              <FilterSlot icon={<FilterAltOutlinedIcon />} minWidth={190}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={audienceFilter}
                  onChange={(event) => setAudienceFilter(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                >
                  <MenuItem value={ALL}>All audiences</MenuItem>
                  {audiences.map((value) => (
                    <MenuItem key={value} value={value}>
                      {availableForLabel(value)}
                    </MenuItem>
                  ))}
                </TextField>
              </FilterSlot>
            </FilterBar>

            {coverageUnavailable && (
              <Typography
                sx={{ mb: 2, fontSize: 12.5, color: "warning.main" }}
              >
                Service catalogues did not load, so the Services column is empty
                for every provider. Everything else on this page is live.
              </Typography>
            )}

            <DataTable
              minWidth={1080}
              isEmpty={table.isEmpty}
              emptyMessage="No provider matches these filters."
              sortBy={table.sortBy}
              sortDir={table.sortDir}
              onSort={table.toggleSort}
              columns={[
                { id: "provider", label: "Provider", sortKey: "vendorName" },
                { id: "services", label: "Services" },
                {
                  id: "audience",
                  label: "Available For",
                  sortKey: "vendorAvailableFor",
                },
                { id: "commercials", label: "Commercials" },
                { id: "contact", label: "Contact" },
                { id: "action", label: "", align: "right" },
              ]}
              footer={
                <TablePagination
                  component="div"
                  count={table.total}
                  page={table.page}
                  rowsPerPage={table.rowsPerPage}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  onPageChange={(_, page) => table.setPage(page)}
                  onRowsPerPageChange={(event) =>
                    table.changeRowsPerPage(Number(event.target.value))
                  }
                />
              }
            >
              {table.paged.map((provider) => (
                <KitRow
                  key={provider._id}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(PATH_DASHBOARD.vendor.provider(provider._id))
                  }
                >
                  <TableCell>
                    <StackedCell
                      bold
                      primary={providerName(provider)}
                      secondary={
                        provider.vendor_gst
                          ? `GSTIN ${provider.vendor_gst}`
                          : undefined
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <ServiceBadges services={provider.services} />
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 13.5 }}>
                      {availableForLabel(provider.vendorAvailableFor) || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <StackedCell
                      primary={
                        commissionLabel(provider.commissionType) || "Not set"
                      }
                      secondary={
                        [
                          transactionTypeLabel(provider.vendortransactionType),
                          provider.paymentTerms,
                        ]
                          .filter(Boolean)
                          .join(" • ") || undefined
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <StackedCell
                      primary={provider.vendorContactName || "-"}
                      secondary={
                        [provider.vendor_email, provider.vendorContact]
                          .filter(Boolean)
                          .join(" • ") || undefined
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <PageGhostButton
                      startIcon={<OpenInNewOutlinedIcon />}
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(
                          PATH_DASHBOARD.vendor.provider(provider._id)
                        );
                      }}
                    >
                      Configure
                    </PageGhostButton>
                  </TableCell>
                </KitRow>
              ))}
            </DataTable>
          </>
        )}
      </Box>

      <Modal open={adding} onClose={() => setAdding(false)}>
        <Box>
          <ModalShell
            title="Add provider"
            subtitle="Creates the provider profile. Publish it to a service from Provider Routing."
            width={780}
            onClose={() => setAdding(false)}
          >
            <ProviderForm
              onCancel={() => setAdding(false)}
              onSaved={() => {
                setAdding(false);
                reload();
              }}
            />
          </ModalShell>
        </Box>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------

/**
 * Service coverage as badges. Capped so a provider on every service cannot
 * stretch the row - the rest are counted in a trailing chip and the full list
 * is on the provider's own screen.
 */
export function ServiceBadges({
  services,
  max = 3,
}: {
  services: string[];
  max?: number;
}) {
  if (!services.length) {
    return (
      <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>
        Not published
      </Typography>
    );
  }

  const shown = services.slice(0, max);
  const rest = services.length - shown.length;

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      {shown.map((service) => (
        <Chip
          key={service}
          size="small"
          label={service}
          icon={<PaymentsOutlinedIcon />}
          sx={{
            height: 24,
            fontSize: 11.5,
            fontWeight: 600,
            color: "primary.main",
            backgroundColor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.mode === "light" ? 0.1 : 0.24
              ),
            "& .MuiChip-icon": { fontSize: 14, color: "inherit", ml: 0.75 },
          }}
        />
      ))}

      {rest > 0 && (
        <Chip
          size="small"
          label={`+${rest}`}
          sx={{ height: 24, fontSize: 11.5, fontWeight: 700 }}
        />
      )}
    </Stack>
  );
}
