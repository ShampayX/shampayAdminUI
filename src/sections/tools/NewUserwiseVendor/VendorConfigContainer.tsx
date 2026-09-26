import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// @mui
import { Box, Stack, TableCell, Typography } from "@mui/material";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  DataTable,
  KitRow,
  StatusPill,
  StackedCell,
  StatCard,
  StatGrid,
  EmptyState,
  PageGhostButton,
  StatGridSkeleton,
  TableSkeleton,
} from "src/components/page-kit";
//
import { Service, vendorListUrl } from "./ServiceList";
import VendorRoutingDialog from "./VendorConfigCard";
import {
  getServiceReference,
  prefetchRouting,
  getRouting,
  invalidateRouting,
  runPool,
} from "./routingCache";
import VendorWarnings from "src/components/VendorWarnings";

/** How many routing lookups may be in flight at once. */
const ROUTING_CONCURRENCY = 6;

// ----------------------------------------------------------------------
// Routing table for one user + one service.
//
// The vendor catalogue is fetched once per service here rather than once per
// product, then each product's current route is read from
// `product/getUserVendorSwitch`. Same endpoints as before, fewer calls.
// ----------------------------------------------------------------------

export type Vendor = {
  vendorId: string;
  vendorName: string;
};

type ChannelKey = "neoNetwork" | "directAgent" | "apiUser";

/** The three downstream channels `setUserVendorSwitch` accepts. */
export const CHANNELS: {
  key: ChannelKey;
  field: "neoNetworkVendorId" | "directAgentVendorId" | "apiUserVendorId";
  /** Key on the getUserVendorSwitch payload. */
  source: string;
  label: string;
  hint: string;
}[] = [
  {
    key: "neoNetwork",
    field: "neoNetworkVendorId",
    source: "neoNetworkVendor",
    label: "Neo Network Vendor",
    hint: "Handles traffic from the distribution network.",
  },
  {
    key: "directAgent",
    field: "directAgentVendorId",
    source: "directAgentVendor",
    label: "Direct Agent Vendor",
    hint: "Handles traffic from direct agents.",
  },
  {
    key: "apiUser",
    field: "apiUserVendorId",
    source: "apiUserVendor",
    label: "API User Vendor",
    hint: "Handles traffic from API integrations.",
  },
];

export type RoutingRow = {
  productId: string;
  productName: string;
  categoryName: string;
  channels: Partial<Record<ChannelKey, Vendor | undefined>>;
  /** How many of the three channels have a vendor assigned. */
  routedCount: number;
  status: "routed" | "partial" | "unrouted";
  updatedBy?: { email: string; date: string };
  /** True until this row's routing lookup has come back. */
  pending?: boolean;
};

interface Props {
  userId: string;
  service: Service;
}

/* Shared by the table and its skeleton so the header does not shift. */
const ROUTING_COLUMNS: {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
}[] = [
  { id: "product", label: "Service" },
  { id: "neoNetwork", label: "Neo Network" },
  { id: "directAgent", label: "Direct Agent" },
  { id: "apiUser", label: "API User" },
  { id: "status", label: "Status", align: "center" },
  { id: "updated", label: "Last Updated" },
  { id: "action", label: "Action", align: "center" },
];

/** Inline stand-in for a cell whose routing lookup has not landed yet. */
function CellPlaceholder({ width = "70%" }: { width?: number | string }) {
  return (
    <Box
      sx={{
        width,
        height: 12,
        borderRadius: 0.75,
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? "rgba(145, 158, 171, 0.16)"
            : "rgba(145, 158, 171, 0.20)",
      }}
    />
  );
}

export default function VendorConfigContainer({ userId, service }: Props) {
  const { Api } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  /** Item 3b: what the dropdown endpoint could not resolve. */
  const [vendorWarnings, setVendorWarnings] = useState<string[]>([]);
  const [rows, setRows] = useState<RoutingRow[]>([]);
  const [editing, setEditing] = useState<RoutingRow | null>(null);

  /* Monotonic id so a late response from a previous selection is dropped
     instead of overwriting the current one. */
  const requestRef = useRef(0);

  const categoryId = service._id;
  const categoryName = service.category_name;

  /**
   * Loads in two visible stages instead of one blocking wait.
   *
   * Stage 1: the product list arrives (cached per service, so switching user
   * costs nothing) and every product is rendered immediately as a pending row.
   * The table, its columns and its row count are on screen at this point.
   *
   * Stage 2: routing is looked up per product through a small concurrency pool
   * and each row fills itself in as its answer lands. Previously the whole
   * table waited on Promise.all over all N lookups, so one slow product held
   * up every other row.
   *
   * Still N requests - there is no batch endpoint. See
   * BACKEND_PERFORMANCE_ISSUES.md issue C.
   */
  const loadData = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (!categoryId || !userId) return;

      /* Discards results from a previous user/service if the selection changed
         while requests were still in flight. */
      const requestId = (requestRef.current += 1);
      const isCurrent = () => requestRef.current === requestId;

      if (options?.refresh) invalidateRouting(userId);

      setLoading(true);
      setFailed(false);

      try {
        const { catalogue, products, warnings } = await getServiceReference(
          Api,
          categoryId,
          vendorListUrl(categoryName)
        );

        if (!isCurrent()) return;

        setVendors(catalogue);
        setVendorWarnings(warnings);

        /* Stage 1 - structure on screen straight away. */
        const skeletonRows: RoutingRow[] = products.map((product: any) => ({
          productId: product._id,
          productName: product.productName,
          categoryName,
          channels: {},
          routedCount: 0,
          status: "unrouted",
          pending: true,
        }));

        setRows(skeletonRows);
        setLoading(false);

        if (!products.length) return;

        /* Stage 3: one batch request resolves routing for every product and
           seeds the cache, so the pool below turns into cache hits instead of
           one HTTP request per product. Best-effort - anything it misses falls
           through to the per-product lookup unchanged. */
        await prefetchRouting(
          Api,
          userId,
          products.map((product: any) => product._id)
        );

        if (!isCurrent()) return;

        /* Stage 2 - fill each row in as its lookup returns. */
        await runPool(products, ROUTING_CONCURRENCY, async (product: any) => {
          const data = await getRouting(Api, userId, product._id);

          if (!isCurrent()) return;

          const channels: RoutingRow["channels"] = {};
          CHANNELS.forEach((channel) => {
            const assigned = data?.[channel.source];
            /* Only count a vendor still present in the catalogue - a stale id
               would otherwise read as routed while resolving to nothing. */
            if (
              assigned?.vendorId &&
              catalogue.some((v: any) => v.vendorId === assigned.vendorId)
            ) {
              channels[channel.key] = {
                vendorId: assigned.vendorId,
                vendorName: assigned.vendorName,
              };
            }
          });

          const routedCount = CHANNELS.filter(
            (channel) => channels[channel.key]
          ).length;

          setRows((previous) =>
            previous.map((row) =>
              row.productId === product._id
                ? {
                    ...row,
                    channels,
                    routedCount,
                    status:
                      routedCount === CHANNELS.length
                        ? "routed"
                        : routedCount > 0
                        ? "partial"
                        : "unrouted",
                    updatedBy: data?.createdBy
                      ? {
                          email: data.createdBy.email,
                          date: data.createdBy.date,
                        }
                      : undefined,
                    pending: false,
                  }
                : row
            )
          );
        });
      } catch (error) {
        console.error("Error loading routing data:", error);
        if (!isCurrent()) return;
        setRows([]);
        setVendors([]);
        setVendorWarnings([]);
        setFailed(true);
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryId, categoryName, userId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    const active = rows.filter((row) => row.routedCount > 0).length;
    return {
      products: rows.length,
      active,
      unrouted: rows.length - active,
      vendors: vendors.length,
    };
  }, [rows, vendors]);

  if (loading) {
    return (
      <>
        <StatGridSkeleton />
        <TableSkeleton columns={ROUTING_COLUMNS} rows={6} minWidth={980} />
      </>
    );
  }

  if (failed) {
    return (
      <EmptyState
        icon={<AltRouteOutlinedIcon />}
        title="Could not load routing"
        description="The routing lookup for this service did not come back. Nothing was changed - try again."
        action={
          <PageGhostButton onClick={() => loadData({ refresh: true })}>
            Retry
          </PageGhostButton>
        }
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<AltRouteOutlinedIcon />}
        title="No products under this service"
        description={`${categoryName} has no products configured, so there is nothing to route yet.`}
      />
    );
  }

  return (
    <>
      <VendorWarnings warnings={vendorWarnings} sx={{ mb: 1 }} />

      <StatGrid>
        <StatCard
          label="Active Routes"
          value={totals.active}
          caption="At least one channel routed"
          tone="success"
          icon={<AltRouteOutlinedIcon />}
        />
        <StatCard
          label="Unrouted"
          value={totals.unrouted}
          caption="No vendor assigned"
          tone={totals.unrouted > 0 ? "warning" : "neutral"}
          icon={<LinkOffOutlinedIcon />}
        />
        <StatCard
          label="Available Vendors"
          value={totals.vendors}
          caption={`Published for ${categoryName}`}
          icon={<StorefrontOutlinedIcon />}
        />
        <StatCard
          label="Services Configured"
          value={totals.products}
          caption={`Products under ${categoryName}`}
          tone="neutral"
          icon={<HubOutlinedIcon />}
        />
      </StatGrid>

      <DataTable
        minWidth={980}
        columns={[
          { id: "product", label: "Service" },
          { id: "neoNetwork", label: "Neo Network" },
          { id: "directAgent", label: "Direct Agent" },
          { id: "apiUser", label: "API User" },
          { id: "status", label: "Status", align: "center" },
          { id: "updated", label: "Last Updated" },
          { id: "action", label: "Action", align: "center" },
        ]}
        emptyMessage="No routing rows."
      >
        {rows.map((row) => (
          <KitRow key={row.productId}>
            <TableCell>
              <StackedCell
                bold
                primary={row.productName}
                secondary={row.categoryName}
              />
            </TableCell>

            {CHANNELS.map((channel) => {
              const vendor = row.channels[channel.key];
              return (
                <TableCell key={channel.key}>
                  {row.pending ? (
                    <CellPlaceholder />
                  ) : vendor ? (
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                      {vendor.vendorName}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                      Not routed
                    </Typography>
                  )}
                </TableCell>
              );
            })}

            <TableCell align="center">
              {row.pending ? (
                <Stack alignItems="center">
                  <CellPlaceholder width={64} />
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={0.5}>
                  <StatusPill status={row.status} />
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    {row.routedCount}/{CHANNELS.length} channels
                  </Typography>
                </Stack>
              )}
            </TableCell>

            <TableCell>
              {row.updatedBy ? (
                <StackedCell
                  primary={row.updatedBy.email}
                  secondary={new Date(row.updatedBy.date).toLocaleString()}
                />
              ) : (
                <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                  -
                </Typography>
              )}
            </TableCell>

            <TableCell align="center">
              <PageGhostButton
                startIcon={<EditOutlinedIcon />}
                disabled={row.pending}
                onClick={() => setEditing(row)}
              >
                Edit
              </PageGhostButton>
            </TableCell>
          </KitRow>
        ))}
      </DataTable>

      {editing && (
        <VendorRoutingDialog
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          userId={userId}
          row={editing}
          vendors={vendors}
          onSaved={() => {
            /* The write invalidates only the product that changed; every other
               row keeps its cached answer. */
            invalidateRouting(userId, editing.productId);
            loadData();
          }}
        />
      )}
    </>
  );
}
