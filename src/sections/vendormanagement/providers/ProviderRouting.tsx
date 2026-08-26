import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
// @mui
import {
  Box,
  Stack,
  MenuItem,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
// routes
import { PATH_DASHBOARD } from "src/routes/paths";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  PageHeader,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  DataTable,
  KitRow,
  StatusPill,
  StackedCell,
  StatCard,
  StatGrid,
  EmptyState,
  LoadingState,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Providers > Provider Routing.
//
// Answers "which provider handles which service" in one table, for the whole
// platform. Built from endpoints that already exist:
//
//   services  GET category/get_CategoryList
//   products  GET product/get_ProductList/<categoryId>
//   routing   GET product/getActiveVendor/<productId>
//             -> { neoNetworkVendor, apiUserVendor, directAgentVendor,
//                  vendorMode }
//
// This screen is READ-ONLY on purpose. The write (`product/setActiveVendor`)
// is owned by Utilities > Vendor Switch, which also carries the routing that
// does not fit this shape - KYC, penny drop, settlement, slab-wise routing -
// and is reachable by FINANCE and SUPPORT roles that cannot see the Providers
// category at all. Duplicating the write here would mean two places to keep
// correct, so each row links out to the screen that owns it instead.
//
// Per-USER overrides are a different thing again and live under
// People > Vendor Routing. This table is the platform default.
//
// There is no priority field anywhere on this payload - routing is one active
// provider per lane, not a ranked list - so there is no Priority column and no
// backup provider column.
// ----------------------------------------------------------------------

type Service = { _id: string; category_name: string };

/** The three lanes `getActiveVendor` reports, in the order it returns them. */
const LANES = [
  { key: "neoNetworkVendor", label: "Neo Network" },
  { key: "directAgentVendor", label: "Direct Agent" },
  { key: "apiUserVendor", label: "API User" },
];

type RouteRow = {
  productId: string;
  productName: string;
  lanes: Record<string, string | undefined>;
  vendorMode?: string;
  routedCount: number;
  status: "routed" | "partial" | "unrouted";
};

export default function ProviderRouting() {
  const { Api } = useAuthContext();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [servicesLoading, setServicesLoading] = useState(true);

  const [rows, setRows] = useState<RouteRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    const token = localStorage.getItem("token");

    const response: any = await Api(
      "category/get_CategoryList",
      "GET",
      "",
      token
    );

    if (response?.status === 200 && response.data.code === 200) {
      const list: Service[] = response.data.data || [];
      setServices(list);
      setServiceId((current) => current || (list.length ? list[0]._id : ""));
    } else {
      setServices([]);
    }

    setServicesLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const loadRouting = useCallback(async () => {
    if (!serviceId) return;

    setRowsLoading(true);
    const token = localStorage.getItem("token");

    const productRes: any = await Api(
      `product/get_ProductList/${serviceId}`,
      "GET",
      "",
      token
    );

    const products: any[] =
      productRes?.status === 200 && productRes.data.code === 200
        ? productRes.data.data || []
        : [];

    const routes = await Promise.all(
      products.map(async (product: any) => {
        const activeRes: any = await Api(
          `product/getActiveVendor/${product._id}`,
          "GET",
          "",
          token
        );

        const ok =
          activeRes?.status === 200 &&
          (activeRes.data.code === 200 || activeRes.data.success === true);

        const data = ok ? activeRes.data.data : null;

        const lanes: RouteRow["lanes"] = {};
        LANES.forEach((lane) => {
          lanes[lane.key] = data?.[lane.key]?.vendorName || undefined;
        });

        const routedCount = LANES.filter((lane) => lanes[lane.key]).length;

        return {
          productId: product._id,
          productName: product.productName,
          lanes,
          vendorMode: data?.vendorMode,
          routedCount,
          status:
            routedCount === LANES.length
              ? "routed"
              : routedCount > 0
              ? "partial"
              : "unrouted",
        } as RouteRow;
      })
    );

    setRows(routes);
    setRowsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    loadRouting();
  }, [loadRouting]);

  const selectedService = useMemo(
    () => services.find((service) => service._id === serviceId) || null,
    [services, serviceId]
  );

  const totals = useMemo(() => {
    const fully = rows.filter((row) => row.status === "routed").length;
    const partial = rows.filter((row) => row.status === "partial").length;
    const providers = new Set<string>();
    rows.forEach((row) =>
      LANES.forEach((lane) => {
        const name = row.lanes[lane.key];
        if (name) providers.add(name);
      })
    );

    return {
      products: rows.length,
      fully,
      unrouted: rows.length - fully - partial,
      providers: providers.size,
    };
  }, [rows]);

  return (
    <>
      <Helmet>
        <title> Provider Routing | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Provider Routing"
          subtitle="Which provider handles each service, per downstream lane. This is the platform default - per-user overrides live under People > Vendor Routing."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={loadRouting}
                disabled={!serviceId}
              >
                Refresh
              </PageGhostButton>
              <PageGhostButton
                startIcon={<TuneOutlinedIcon />}
                onClick={() => navigate(PATH_DASHBOARD.vendor.services)}
              >
                Service config
              </PageGhostButton>
              <PageGhostButton
                startIcon={<OpenInNewOutlinedIcon />}
                onClick={() => navigate(PATH_DASHBOARD.tools.vendorswitch)}
              >
                Change routing
              </PageGhostButton>
            </>
          }
        />

        {servicesLoading ? (
          <LoadingState label="Loading services..." height={320} />
        ) : services.length === 0 ? (
          <EmptyState
            icon={<CategoryOutlinedIcon />}
            title="No services configured"
            description="Routing is set per product under a service, and the platform has no service categories yet."
          />
        ) : (
          <>
            <StatGrid>
              <StatCard
                label="Products"
                value={totals.products}
                caption={`Under ${selectedService?.category_name || "this service"}`}
                icon={<HubOutlinedIcon />}
              />
              <StatCard
                label="Fully Routed"
                value={totals.fully}
                caption="All three lanes assigned"
                tone="success"
                icon={<AltRouteOutlinedIcon />}
              />
              <StatCard
                label="Unrouted"
                value={totals.unrouted}
                caption="No lane assigned"
                tone={totals.unrouted > 0 ? "warning" : "neutral"}
                icon={<LinkOffOutlinedIcon />}
              />
              <StatCard
                label="Providers In Use"
                value={totals.providers}
                caption="Distinct providers on this service"
                tone="neutral"
                icon={<StorefrontOutlinedIcon />}
              />
            </StatGrid>

            <FilterBar>
              <FilterSlot icon={<CategoryOutlinedIcon />} grow minWidth={300}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                >
                  {services.map((service) => (
                    <MenuItem key={service._id} value={service._id}>
                      {service.category_name}
                    </MenuItem>
                  ))}
                </TextField>
              </FilterSlot>
            </FilterBar>

            {rowsLoading ? (
              <LoadingState label="Loading routing..." />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={<AltRouteOutlinedIcon />}
                title="No products under this service"
                description={`${
                  selectedService?.category_name || "This service"
                } has no products, so there is nothing to route.`}
              />
            ) : (
              <DataTable
                minWidth={1020}
                columns={[
                  { id: "product", label: "Service / Product" },
                  ...LANES.map((lane) => ({ id: lane.key, label: lane.label })),
                  { id: "mode", label: "Mode" },
                  { id: "status", label: "Status", align: "center" as const },
                  { id: "action", label: "", align: "right" as const },
                ]}
              >
                {rows.map((row) => (
                  <KitRow key={row.productId}>
                    <TableCell>
                      <StackedCell
                        bold
                        primary={row.productName}
                        secondary={selectedService?.category_name}
                      />
                    </TableCell>

                    {LANES.map((lane) => (
                      <TableCell key={lane.key}>
                        {row.lanes[lane.key] ? (
                          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                            {row.lanes[lane.key]}
                          </Typography>
                        ) : (
                          <Typography
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          >
                            Not routed
                          </Typography>
                        )}
                      </TableCell>
                    ))}

                    <TableCell>
                      <Typography sx={{ fontSize: 13 }}>
                        {row.vendorMode || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Stack alignItems="center" spacing={0.5}>
                        <StatusPill status={row.status} />
                        <Typography
                          sx={{ fontSize: 11, color: "text.secondary" }}
                        >
                          {row.routedCount}/{LANES.length} lanes
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <PageGhostButton
                        startIcon={<OpenInNewOutlinedIcon />}
                        onClick={() =>
                          navigate(PATH_DASHBOARD.tools.vendorswitch)
                        }
                      >
                        Change
                      </PageGhostButton>
                    </TableCell>
                  </KitRow>
                ))}
              </DataTable>
            )}
          </>
        )}
      </Box>
    </>
  );
}
