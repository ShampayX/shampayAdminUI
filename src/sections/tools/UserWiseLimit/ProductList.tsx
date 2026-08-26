import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthContext } from "src/auth/useAuthContext";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import EditLimitsDialog from "./EditLimitDilouge";
import { ApiUser, Category, Product } from "./types";

// Mirrors the real table header below, so the skeleton and the loaded table
// have the same columns in the same order.
const LIMIT_COLUMNS = [
  { id: "user", label: "User" },
  { id: "product", label: "Product" },
  { id: "dailyUsed", label: "Daily Used", align: "right" as const },
  { id: "dailyLimit", label: "Daily Limit", align: "right" as const },
  { id: "monthlyUsed", label: "Monthly Used", align: "right" as const },
  { id: "monthlyLimit", label: "Monthly Limit", align: "right" as const },
  { id: "action", label: "Action", align: "right" as const },
];

export default function ApiLimitsPage() {
  const { Api } = useAuthContext();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  // ================================
  // FETCH ALL DATA
  // ================================
  const fetchAll = async () => {
    setLoading(true);
    await fetchCategories();
    await fetchUsersWithLimits();
    setLoading(false);
  };

  // ================================
  // FETCH USERS WITH LIMITS
  // ================================
  const fetchUsersWithLimits = async () => {
    const token = localStorage.getItem("token");

    const res = await Api(
      "product/getAllUsersTransactionLimits",
      "GET",
      "",
      token
    );

    if (res?.status === 200 && Array.isArray(res.data.data)) {
      const normalizedUsers: ApiUser[] = res.data.data.map((u: any) => {
        const limitsMap: any = {};

        (u.limits || []).forEach((l: any) => {
          limitsMap[l.product.productId] = {
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

  // ================================
  // FETCH CATEGORIES
  // ================================
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    const res = await Api("category/get_CategoryList", "GET", "", token);

    const allowed = ["ADMT", "MONEY TRANSFER", "PAYOUT PAYMENTS"];
    const list = res.data.data.filter((c: Category) =>
      allowed.includes(c.category_name)
    );

    setCategories(list);
    list.forEach(fetchProducts);
  };

  // ================================
  // FETCH PRODUCTS
  // ================================
  const fetchProducts = async (category: Category) => {
    const token = localStorage.getItem("token");
    const res = await Api(
      `product/get_ProductList/${category._id}`,
      "GET",
      "",
      token
    );

    setProductsByCategory((prev) => ({
      ...prev,
      [category._id]: res.data.data,
    }));
  };

  // ================================
  // SEARCH FILTER
  // ================================
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const q = search.toLowerCase();

    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        u.userCode.toLowerCase().includes(q) ||
        u.company_name.toLowerCase().includes(q)
      );
    });
  }, [search, users]);

  const openEdit = (user: ApiUser) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} fontWeight={600}>
        API User Limits
      </Typography>

      {/* SEARCH */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, code, company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* TABLE */}
      {loading ? (
        <ApiDataLoading variant="table" columns={LIMIT_COLUMNS} minWidth={720} />
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#fafafa",
                  "& th": { fontWeight: 600, fontSize: 13 },
                }}
              >
                <TableCell>User</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Daily Used</TableCell>
                <TableCell align="right">Daily Limit</TableCell>
                <TableCell align="right">Monthly Used</TableCell>
                <TableCell align="right">Monthly Limit</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const limitEntries = Object.entries(user.limits);

                  if (limitEntries.length === 0) {
                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell colSpan={5}>No limits assigned</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return limitEntries.map(([productId, limit], index) => (
                    <TableRow key={productId}>
                      {index === 0 && (
                        <TableCell
                          rowSpan={limitEntries.length}
                          sx={{ verticalAlign: "top" }}
                        >
                          <Typography fontWeight={600}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {user.userCode}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {user.company_name}
                          </Typography>
                        </TableCell>
                      )}

                      <TableCell>{productId}</TableCell>

                      <TableCell align="right">₹{limit.dailyUsed ?? 0}</TableCell>

                      <TableCell align="right">₹{limit.day ?? 0}</TableCell>

                      <TableCell align="right">
                        ₹{limit.monthlyUsed ?? 0}
                      </TableCell>

                      <TableCell align="right">₹{limit.month ?? 0}</TableCell>

                      {index === 0 && (
                        <TableCell
                          align="right"
                          rowSpan={limitEntries.length}
                          sx={{ verticalAlign: "top" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ));
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editOpen && selectedUser && (
        <EditLimitsDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          userId={selectedUser._id}
          categories={categories}
          productsByCategory={productsByCategory}
          currentLimits={selectedUser.limits}
          onProductSave={() => {}}
        />
      )}
    </Box>
  );
}
