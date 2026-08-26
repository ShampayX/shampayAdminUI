import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
} from "@mui/material";
import { ApiUser, Category, Product } from "./types";

type Props = {
  users: ApiUser[];
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  onEdit: (user: ApiUser) => void;
};

export default function ApiUsersTable({
  users,
  categories,
  productsByCategory,
  onEdit,
}: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>User</TableCell>

          {categories.map((c) => (
            <TableCell key={c._id} sx={{ fontWeight: 600 }}>
              {c.category_name}
            </TableCell>
          ))}

          <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={categories.length + 2}
              align="center"
              sx={{ py: 4 }}
            >
              No users found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user._id} hover>
              {/* USER */}
              <TableCell>
                <Typography fontWeight={500}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.userCode}
                </Typography>
              </TableCell>

              {/* CATEGORY → PRODUCTS → LIMITS */}
              {categories.map((category) => {
                const products = productsByCategory[category._id] || [];

                if (!products.length) {
                  return (
                    <TableCell key={category._id}>
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={category._id}>
                    {products.map((p) => {
                      const limit = user.limits?.[p._id];
                      return (
                        <Typography
                          key={p._id}
                          variant="caption"
                          display="block"
                        >
                          {p.productName}: ₹{limit?.day ?? 0}/₹
                          {limit?.month ?? 0}
                        </Typography>
                      );
                    })}
                  </TableCell>
                );
              })}

              {/* ACTION */}
              <TableCell>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onEdit(user)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
