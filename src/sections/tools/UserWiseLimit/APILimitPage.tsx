import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Tab,
  Stack,
  Avatar,
  MenuItem,
  TextField,
  Typography,
  TablePagination,
  TableCell,
} from "@mui/material";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import TollOutlinedIcon from "@mui/icons-material/TollOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  PageHeader,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  SearchField,
  KitTabs,
  DataTable,
  KitRow,
  StatusPill,
  StackedCell,
  StatCard,
  StatGrid,
  UsageMeter,
  EmptyState,
  LoadingState,
  StatGridSkeleton,
  FilterBarSkeleton,
  TableSkeleton,
  useDataTable,
} from "src/components/page-kit";
//
import EditLimitsDialog from "./EditLimitDilouge";
import { ApiUser, Category, Product } from "./types";

// ----------------------------------------------------------------------
// People > Limits.
//
// Shows the transaction limits configured per API user per service. Every
// figure on this screen comes from `product/getAllUsersTransactionLimits` -
// daily / monthly ceiling and the amount already consumed against each. The
// backend exposes nothing else (no per-transaction cap, no effective date), so
// nothing else is shown.
// ----------------------------------------------------------------------

/** One user + one service = one configured limit. */
type LimitRow = {
  id: string;
  user: ApiUser;
  userName: string;
  userCode: string;
  company: string;
  productId: string;
  productName: string;
  categoryName: string;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  dailyPercent: number;
  utilisation: string;
};

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/**
 * Utilisation band for the day. Derived from used/limit - the API has no status
 * field, so this describes headroom rather than claiming a backend state.
 */
const utilisationOf = (used: number, limit: number): string => {
  if (!limit) return "unused";
  const percent = (used / limit) * 100;
  if (percent >= 100) return "exhausted";
  if (percent >= 75) return "near limit";
  return "healthy";
};

const initialsOf = (first?: string, last?: string) =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";

/* Column shape shared by the real table and its skeleton, so the header does
   not shift when the rows swap in. */
const LIMIT_COLUMNS: { id: string; label: string; align?: "left" | "center" | "right" }[] = [
  { id: "entity", label: "User / Entity" },
  { id: "service", label: "Limit Type" },
  { id: "daily", label: "Daily Limit", align: "right" },
  { id: "used", label: "Used", align: "right" },
  { id: "monthly", label: "Monthly Limit", align: "right" },
  { id: "status", label: "Status", align: "center" },
  { id: "action", label: "", align: "right" },
];

export default function ApiLimitsPage() {
  const { Api } = useAuthContext();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);
  /* Categories + products only feed the edit dialog, so they load in the
     background and never hold the table up. See loadReferenceData(). */
  const [referenceLoaded, setReferenceLoaded] = useState(false);
  const [tab, setTab] = useState<"configured" | "unset">("configured");
  const [service, setService] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= API - unchanged contracts ================= */

  /**
   * The table only needs `getAllUsersTransactionLimits`. Categories and their
   * products are used by the edit dialog alone, so they are fired off in
   * parallel and awaited by nobody - the table paints as soon as the limits
   * land instead of after a category -> products -> limits waterfall.
   *
   * Before: fetchCategories() awaited, which itself kicked off one
   * product/get_ProductList per category, then fetchUsersWithLimits() awaited.
   * Two blocking round trips plus three unawaited ones before first paint.
   */
  const fetchAll = async () => {
    setLoading(true);
    loadReferenceData();
    await fetchUsersWithLimits();
    setLoading(false);
  };

  const fetchUsersWithLimits = async () => {
    const token = localStorage.getItem("token");

    const res = await Api(
      "product/getAllUsersTransactionLimits",
      "GET",
      "",
      token
    );

    if (res?.status === 200) {
      const normalizedUsers: ApiUser[] = res.data.data.map((u: any) => {
        const limitsMap: any = {};

        (u.limits || []).forEach((l: any) => {
          limitsMap[l.product.productId] = {
            productName: l.product.productName,
            day: l.dailyLimit,
            month: l.monthlyLimit,
            dailyUsed: l.dailyUsed ?? 0,
            monthlyUsed: l.monthlyUsed ?? 0,
            categoryId: l.categories.categoriesId,
            categoryName: l.categories.categoriesName,
          };
        });

        return {
          _id: u.userId,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          userCode: u.userCode || "",
          company_name: u.company_name || "",
          limits: limitsMap,
        };
      });

      setUsers(normalizedUsers);
    }
  };

  /**
   * Categories + one product list per category, for the edit dialog.
   *
   * The three product calls now run together and commit in ONE setState. They
   * used to be fired from inside a forEach, each with its own
   * `setProductsByCategory(prev => ...)`, so the page re-rendered three extra
   * times while the (large) limits table was already mounted.
   */
  const loadReferenceData = async () => {
    const token = localStorage.getItem("token");

    const res: any = await Api("category/get_CategoryList", "GET", "", token);

    if (res?.status !== 200 || res.data?.code !== 200) return;

    const allowed = ["ADMT", "MONEY TRANSFER", "PAYOUT PAYMENTS"];
    const list: Category[] = (res.data.data || []).filter((c: Category) =>
      allowed.includes(c.category_name)
    );

    setCategories(list);

    const products = await Promise.all(
      list.map(async (category) => {
        const productRes: any = await Api(
          `product/get_ProductList/${category._id}`,
          "GET",
          "",
          token
        );

        return {
          categoryId: category._id,
          list:
            productRes?.status === 200 && productRes.data?.code === 200
              ? productRes.data.data || []
              : [],
        };
      })
    );

    setProductsByCategory(
      products.reduce(
        (map, entry) => ({ ...map, [entry.categoryId]: entry.list }),
        {} as Record<string, Product[]>
      )
    );
    setReferenceLoaded(true);
  };

  /* ================= DERIVED ================= */

  /* One row per configured user x service pair. */
  const rows = useMemo<LimitRow[]>(() => {
    const out: LimitRow[] = [];

    users.forEach((user) => {
      Object.entries(user.limits || {}).forEach(([productId, limit]: any) => {
        const dailyLimit = Number(limit.day ?? 0);
        const monthlyLimit = Number(limit.month ?? 0);
        const dailyUsed = Number(limit.dailyUsed ?? 0);
        const monthlyUsed = Number(limit.monthlyUsed ?? 0);

        out.push({
          id: `${user._id}-${productId}`,
          user,
          userName: `${user.firstName} ${user.lastName}`.trim() || "-",
          userCode: user.userCode,
          company: user.company_name,
          productId,
          productName: limit.productName,
          categoryName: limit.categoryName,
          dailyLimit,
          monthlyLimit,
          dailyUsed,
          monthlyUsed,
          dailyRemaining: Math.max(dailyLimit - dailyUsed, 0),
          monthlyRemaining: Math.max(monthlyLimit - monthlyUsed, 0),
          dailyPercent: dailyLimit ? (dailyUsed / dailyLimit) * 100 : 0,
          utilisation: utilisationOf(dailyUsed, dailyLimit),
        });
      });
    });

    return out;
  }, [users]);

  /* Users the API returned with no limit configured at all. */
  const unsetUsers = useMemo(
    () => users.filter((user) => Object.keys(user.limits || {}).length === 0),
    [users]
  );

  /* Service filter options, taken from the limits actually returned. */
  const serviceOptions = useMemo(() => {
    const names = new Set<string>();
    rows.forEach((row) => row.categoryName && names.add(row.categoryName));
    return Array.from(names).sort();
  }, [rows]);

  const scopedRows = useMemo(
    () => (service ? rows.filter((row) => row.categoryName === service) : rows),
    [rows, service]
  );

  const totals = useMemo(() => {
    const configured = rows.length;
    const active = rows.filter((row) => row.dailyLimit > 0).length;
    const used = rows.reduce((sum, row) => sum + row.dailyUsed, 0);
    const remaining = rows.reduce((sum, row) => sum + row.dailyRemaining, 0);
    return { configured, active, used, remaining };
  }, [rows]);

  const limitTable = useDataTable<LimitRow>(scopedRows, {
    storageKey: "user-limits",
    searchKeys: [
      "userName",
      "userCode",
      "company",
      "productName",
      "categoryName",
    ],
  });

  const unsetTable = useDataTable<ApiUser>(unsetUsers, {
    storageKey: "user-limits-unset",
    searchKeys: ["firstName", "lastName", "userCode", "company_name"],
  });

  const active = tab === "configured" ? limitTable : unsetTable;

  const openEditor = (user: ApiUser) => {
    /* The dialog needs the category/product reference data. It normally landed
       while the table was being read; if the user got here first, fetch it now
       - the dialog re-syncs when productsByCategory arrives. */
    if (!referenceLoaded) loadReferenceData();
    setSelectedUser(user);
    setEditOpen(true);
  };

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Limits | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Limits"
          subtitle="Daily and monthly transaction ceilings configured per API user and service."
          actions={
            <PageGhostButton startIcon={<TuneOutlinedIcon />} onClick={fetchAll}>
              Refresh
            </PageGhostButton>
          }
        />

        {loading ? (
          <>
            <StatGridSkeleton />
            <FilterBarSkeleton slots={2} />
            <TableSkeleton columns={LIMIT_COLUMNS} rows={8} minWidth={1080} />
          </>
        ) : (
          <>
            <StatGrid>
              <StatCard
                label="Configured Limits"
                value={totals.configured}
                caption={`${users.length} API users returned`}
                icon={<TollOutlinedIcon />}
              />
              <StatCard
                label="Active Limits"
                value={totals.active}
                caption="Daily ceiling above zero"
                tone="success"
                icon={<SpeedOutlinedIcon />}
              />
              <StatCard
                label="Amount Utilised"
                value={money(totals.used)}
                caption="Against today's ceilings"
                tone="warning"
                icon={<TrendingUpOutlinedIcon />}
              />
              <StatCard
                label="Remaining Capacity"
                value={money(totals.remaining)}
                caption="Headroom left today"
                tone="primary"
                icon={<SavingsOutlinedIcon />}
              />
            </StatGrid>

            <KitTabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab value="configured" label={`Configured (${rows.length})`} />
              <Tab
                value="unset"
                label={`Awaiting setup (${unsetUsers.length})`}
              />
            </KitTabs>

            <FilterBar>
              <SearchField
                value={active.query}
                onChange={active.setQuery}
                placeholder="Search user, code, company or service"
                count={active.total}
                total={active.grandTotal}
              />

              {tab === "configured" && (
                <FilterSlot icon={<CategoryOutlinedIcon />} minWidth={210}>
                  <TextField
                    select
                    fullWidth
                    variant="standard"
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    InputProps={{ disableUnderline: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">All Services</MenuItem>
                    {serviceOptions.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FilterSlot>
              )}
            </FilterBar>

            {tab === "configured" ? (
              <DataTable
                minWidth={1080}
                columns={[
                  { id: "entity", label: "User / Entity", sortKey: "userName" },
                  { id: "service", label: "Limit Type", sortKey: "productName" },
                  {
                    id: "daily",
                    label: "Daily Limit",
                    align: "right",
                    sortKey: "dailyLimit",
                  },
                  {
                    id: "used",
                    label: "Used",
                    align: "right",
                    sortKey: "dailyUsed",
                  },
                  {
                    id: "remaining",
                    label: "Remaining",
                    align: "right",
                    sortKey: "dailyRemaining",
                  },
                  { id: "monthly", label: "Monthly", align: "right" },
                  {
                    id: "status",
                    label: "Status",
                    align: "center",
                    sortKey: "utilisation",
                  },
                  { id: "action", label: "Action", align: "center" },
                ]}
                isEmpty={limitTable.isEmpty}
                emptyMessage={
                  limitTable.isFiltered
                    ? "No limits match this search."
                    : "No limits configured yet."
                }
                sortBy={limitTable.sortBy}
                sortDir={limitTable.sortDir}
                onSort={limitTable.toggleSort}
                footer={
                  <TablePagination
                    component="div"
                    count={limitTable.total}
                    page={limitTable.page}
                    rowsPerPage={limitTable.rowsPerPage}
                    onPageChange={(_, page) => limitTable.setPage(page)}
                    onRowsPerPageChange={(event) =>
                      limitTable.changeRowsPerPage(Number(event.target.value))
                    }
                    rowsPerPageOptions={[10, 25, 50, 100]}
                  />
                }
              >
                {limitTable.paged.map((row) => (
                  <KitRow key={row.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: 12,
                            fontWeight: 700,
                            bgcolor: "primary.lighter",
                            color: "primary.dark",
                          }}
                        >
                          {initialsOf(
                            row.user.firstName,
                            row.user.lastName
                          )}
                        </Avatar>
                        <StackedCell
                          bold
                          primary={row.userName}
                          secondary={
                            [row.userCode, row.company]
                              .filter(Boolean)
                              .join(" • ") || undefined
                          }
                        />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <StackedCell
                        primary={row.productName}
                        secondary={row.categoryName}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                        {money(row.dailyLimit)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ minWidth: 140 }}>
                      <Typography sx={{ fontSize: 13.5 }}>
                        {money(row.dailyUsed)}
                      </Typography>
                      <Box sx={{ mt: 0.75 }}>
                        <UsageMeter
                          used={row.dailyUsed}
                          total={row.dailyLimit}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color:
                            row.dailyLimit && row.dailyRemaining <= 0
                              ? "error.main"
                              : "text.primary",
                        }}
                      >
                        {money(row.dailyRemaining)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <StackedCell
                        primary={money(row.monthlyLimit)}
                        secondary={`${money(row.monthlyUsed)} used`}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <StatusPill status={row.utilisation} />
                    </TableCell>

                    <TableCell align="center">
                      <PageGhostButton
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => openEditor(row.user)}
                      >
                        Edit
                      </PageGhostButton>
                    </TableCell>
                  </KitRow>
                ))}
              </DataTable>
            ) : unsetUsers.length === 0 ? (
              <EmptyState
                icon={<TollOutlinedIcon />}
                title="Every user has limits"
                description="No API user is left without a configured transaction limit."
              />
            ) : (
              <DataTable
                minWidth={720}
                columns={[
                  { id: "entity", label: "User / Entity", sortKey: "firstName" },
                  { id: "code", label: "User Code", sortKey: "userCode" },
                  { id: "company", label: "Company", sortKey: "company_name" },
                  { id: "status", label: "Status", align: "center" },
                  { id: "action", label: "Action", align: "center" },
                ]}
                isEmpty={unsetTable.isEmpty}
                emptyMessage="No users match this search."
                sortBy={unsetTable.sortBy}
                sortDir={unsetTable.sortDir}
                onSort={unsetTable.toggleSort}
                footer={
                  <TablePagination
                    component="div"
                    count={unsetTable.total}
                    page={unsetTable.page}
                    rowsPerPage={unsetTable.rowsPerPage}
                    onPageChange={(_, page) => unsetTable.setPage(page)}
                    onRowsPerPageChange={(event) =>
                      unsetTable.changeRowsPerPage(Number(event.target.value))
                    }
                    rowsPerPageOptions={[10, 25, 50, 100]}
                  />
                }
              >
                {unsetTable.paged.map((user) => (
                  <KitRow key={user._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: 12,
                            fontWeight: 700,
                            bgcolor: "primary.lighter",
                            color: "primary.dark",
                          }}
                        >
                          {initialsOf(user.firstName, user.lastName)}
                        </Avatar>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {`${user.firstName} ${user.lastName}`.trim() || "-"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13.5 }}>
                      {user.userCode || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13.5 }}>
                      {user.company_name || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <StatusPill status="unused" />
                    </TableCell>
                    <TableCell align="center">
                      <PageGhostButton
                        startIcon={<TuneOutlinedIcon />}
                        onClick={() => openEditor(user)}
                      >
                        Configure
                      </PageGhostButton>
                    </TableCell>
                  </KitRow>
                ))}
              </DataTable>
            )}
          </>
        )}

        {editOpen && selectedUser && (
          <EditLimitsDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            userId={selectedUser._id}
            categories={categories}
            productsByCategory={productsByCategory}
            currentLimits={selectedUser.limits}
            onProductSave={() => {
              fetchUsersWithLimits();
            }}
          />
        )}
      </Box>
    </>
  );
}
