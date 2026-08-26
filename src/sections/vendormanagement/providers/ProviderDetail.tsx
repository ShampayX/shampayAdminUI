import { useMemo, useState, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
// @mui
import {
  Box,
  Tab,
  Card,
  Chip,
  Modal,
  Stack,
  Divider,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
// routes
import { PATH_DASHBOARD } from "src/routes/paths";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  KitTabs,
  FormCard,
  ModalShell,
  EmptyState,
  LoadingState,
  CopyText,
} from "src/components/page-kit";
//
import ProviderForm from "./ProviderForm";
import { ServiceBadges } from "./ProviderDirectory";
import { useProviders } from "./useProviders";
import {
  availableForLabel,
  commissionLabel,
  providerName,
  remindViaLabel,
  transactionTypeLabel,
} from "./providerCatalog";

// ----------------------------------------------------------------------
// Providers > Provider Directory > <provider>  (Provider Configuration)
//
// One screen per provider, reached from the directory rather than from its own
// sidebar entry. Tabs are the sections the backend actually has fields for:
//
//   Overview     identity, audience, service coverage
//   Services     which service catalogues list this provider
//   Commercials  commission structure, transaction type, payment terms
//   Alerts       reminder channel, subject, content
//   Documents    API documentation text, signed agreement
//
// Two tabs from the brief are deliberately absent:
//
//   Credentials - there is no credential field anywhere in the provider API
//     (`vendor/add_Vendor` takes name, GST, contact, commercial and reminder
//     fields only) and no endpoint that reads or writes a secret. Rendering a
//     masked "API key" box would be inventing a store that does not exist.
//
//   Limits - amount slabs are configured per SERVICE, not per provider: none
//     of the thirteen slab endpoints accepts a vendor id. They live on
//     Service Configuration, and the Services tab links there.
// ----------------------------------------------------------------------

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "services", label: "Services" },
  { value: "commercials", label: "Commercials" },
  { value: "alerts", label: "Alerts" },
  { value: "documents", label: "Documents" },
];

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { providers, loading, error, reload } = useProviders();
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);

  /* There is no get-one endpoint - `vendor/get_VendorList` is the only read -
     so the provider is picked out of the same list the directory uses. */
  const provider = useMemo(
    () => providers.find((row) => String(row._id) === String(id)) || null,
    [providers, id]
  );

  const backToDirectory = () => navigate(PATH_DASHBOARD.vendor.directory);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <LoadingState label="Loading provider..." height={340} />
      </Box>
    );
  }

  if (error || !provider) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <EmptyState
          icon={<StorefrontOutlinedIcon />}
          title={error ? "Could not load providers" : "Provider not found"}
          description={
            error
              ? "The provider list did not come back. Try again from the directory."
              : "This provider is no longer in the directory. It may have been removed."
          }
          action={
            <PageGhostButton
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={backToDirectory}
            >
              Back to directory
            </PageGhostButton>
          }
        />
      </Box>
    );
  }

  const name = providerName(provider);

  return (
    <>
      <Helmet>
        <title> {name} | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title={name}
          subtitle="Provider configuration. Service slabs and routing are shared across providers - the Services tab links to both."
          actions={
            <>
              <PageGhostButton
                startIcon={<ArrowBackOutlinedIcon />}
                onClick={backToDirectory}
              >
                Directory
              </PageGhostButton>
              <PageActionButton
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditing(true)}
              >
                Edit provider
              </PageActionButton>
            </>
          }
        />

        {/* Identity strip - the facts worth having on screen in every tab. */}
        <Card
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === "light"
                ? "0 2px 12px rgba(15,23,42,0.05)"
                : "none",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.5}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
          >
            <Stack direction="row" spacing={1.75} sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  flexShrink: 0,
                  display: "flex",
                  borderRadius: 1.5,
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  "& svg": { fontSize: 24 },
                }}
              >
                <StorefrontOutlinedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 15.5, fontWeight: 700 }}>
                  {name}
                </Typography>
                <CopyText value={provider._id}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "text.secondary",
                      wordBreak: "break-all",
                    }}
                  >
                    {provider._id}
                  </Typography>
                </CopyText>
              </Box>
            </Stack>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FieldLabel>Available for</FieldLabel>
              <Chip
                size="small"
                label={availableForLabel(provider.vendorAvailableFor) || "Not set"}
                sx={{ mt: 0.5, height: 24, fontSize: 11.5, fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ flex: 1.4, minWidth: 0 }}>
              <FieldLabel>Services</FieldLabel>
              <Box sx={{ mt: 0.75 }}>
                <ServiceBadges services={provider.services} max={4} />
              </Box>
            </Box>
          </Stack>
        </Card>

        <KitTabs value={tab} onChange={(_, value) => setTab(value)}>
          {TABS.map((entry) => (
            <Tab key={entry.value} value={entry.value} label={entry.label} />
          ))}
        </KitTabs>

        {tab === "overview" && (
          <FormCard
            title="Identity"
            subtitle="Who this provider is on paper."
          >
            <DetailGrid>
              <Detail label="Provider name" value={provider.vendorName} />
              <Detail label="Provider ID" value={provider._id} copyable />
              <Detail label="GSTIN" value={provider.vendor_gst} />
              <Detail
                label="Available for"
                value={availableForLabel(provider.vendorAvailableFor)}
              />
              <Detail label="Contact person" value={provider.vendorContactName} />
              <Detail label="Email" value={provider.vendor_email} />
              <Detail label="Contact number" value={provider.vendorContact} />
              <Detail
                label="Added"
                value={
                  provider.createdAt
                    ? new Date(provider.createdAt).toLocaleString()
                    : ""
                }
              />
            </DetailGrid>
          </FormCard>
        )}

        {tab === "services" && (
          <Stack spacing={2.5}>
            <FormCard
              title="Service coverage"
              subtitle="The service catalogues this provider is listed in. A provider appears here once it has been published to that service's vendor list."
            >
              {provider.services.length ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <ServiceBadges services={provider.services} max={99} />
                </Stack>
              ) : (
                <EmptyState
                  boxed={false}
                  icon={<HubOutlinedIcon />}
                  title="Not published to any service"
                  description="This provider exists but no service catalogue lists it, so no traffic can be routed through it yet."
                />
              )}
            </FormCard>

            <FormCard
              title="Where the rest lives"
              subtitle="Both of these are shared across every provider, so they are configured once rather than per provider."
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                flexWrap="wrap"
                useFlexGap
              >
                <PageGhostButton
                  startIcon={<TuneOutlinedIcon />}
                  onClick={() => navigate(PATH_DASHBOARD.vendor.services)}
                >
                  Service configuration
                </PageGhostButton>
                <PageGhostButton
                  startIcon={<AltRouteOutlinedIcon />}
                  onClick={() => navigate(PATH_DASHBOARD.vendor.routing)}
                >
                  Provider routing
                </PageGhostButton>
              </Stack>

              <Typography
                sx={{ mt: 2, fontSize: 12.5, color: "text.secondary" }}
              >
                Amount slabs are set per service - no slab endpoint takes a
                provider id - and routing is decided per product, so both are
                platform-level rather than provider-level settings.
              </Typography>
            </FormCard>
          </Stack>
        )}

        {tab === "commercials" && (
          <FormCard
            title="Commercial terms"
            subtitle="How this provider is settled."
          >
            <DetailGrid>
              <Detail
                label="Commission structure"
                value={commissionLabel(provider.commissionType)}
              />
              <Detail
                label="Transaction type"
                value={transactionTypeLabel(provider.vendortransactionType)}
              />
              <Detail label="Payment terms" value={provider.paymentTerms} />
            </DetailGrid>
          </FormCard>
        )}

        {tab === "alerts" && (
          <FormCard
            title="Reminders"
            subtitle="The message sent to this provider on the reminder schedule."
          >
            <DetailGrid>
              <Detail
                label="Reminder via"
                value={remindViaLabel(provider.remindVia)}
              />
              <Detail label="Subject" value={provider.reminderSubject} />
            </DetailGrid>

            <Box sx={{ mt: 2.5 }}>
              <FieldLabel>Content</FieldLabel>
              <Typography
                sx={{ mt: 0.75, fontSize: 13.5, whiteSpace: "pre-wrap" }}
              >
                {provider.reminderMessage || "-"}
              </Typography>
            </Box>
          </FormCard>
        )}

        {tab === "documents" && (
          <Stack spacing={2.5}>
            <FormCard
              title="API documentation"
              subtitle="Free text kept against the provider - integration notes, endpoints, contacts."
            >
              {provider.vendorApiDocument ? (
                <Typography
                  sx={{
                    p: 2,
                    fontSize: 13,
                    borderRadius: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                  }}
                >
                  {provider.vendorApiDocument}
                </Typography>
              ) : (
                <EmptyState
                  boxed={false}
                  icon={<DescriptionOutlinedIcon />}
                  title="No documentation recorded"
                  description="Add integration notes from Edit provider."
                />
              )}
            </FormCard>

            <FormCard
              title="Signed agreement"
              subtitle="Uploaded through Edit provider."
            >
              {provider.vendorAgreementFile ? (
                <Detail
                  label="Stored file"
                  value={provider.vendorAgreementFile}
                  copyable
                />
              ) : (
                <EmptyState
                  boxed={false}
                  icon={<DescriptionOutlinedIcon />}
                  title="No agreement on file"
                  description="Upload the signed agreement from Edit provider."
                />
              )}
            </FormCard>
          </Stack>
        )}
      </Box>

      <Modal open={editing} onClose={() => setEditing(false)}>
        <Box>
          <ModalShell
            title={`Edit ${name}`}
            subtitle="Updates the provider profile through vendor/edit_Vendor."
            width={780}
            onClose={() => setEditing(false)}
          >
            <ProviderForm
              provider={provider}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
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

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.7,
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}

/** Read-only field grid - three across on desktop, one on phone. */
function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        rowGap: 2.5,
        columnGap: 2.5,
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
      }}
    >
      {children}
    </Box>
  );
}

function Detail({
  label,
  value,
  copyable,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
}) {
  const text = value?.trim();

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>

      {text ? (
        copyable ? (
          <Box sx={{ mt: 0.5 }}>
            <CopyText value={text}>
              <Typography sx={{ fontSize: 13.5, wordBreak: "break-all" }}>
                {text}
              </Typography>
            </CopyText>
          </Box>
        ) : (
          <Typography
            sx={{ mt: 0.5, fontSize: 13.5, wordBreak: "break-word" }}
          >
            {text}
          </Typography>
        )
      ) : (
        <Typography sx={{ mt: 0.5, fontSize: 13.5, color: "text.disabled" }}>
          -
        </Typography>
      )}
    </Box>
  );
}
