import { Box, Typography } from "@mui/material";
import { ApiUser } from "./types";

interface UsersListProps {
  users: ApiUser[];
  selectedUser: ApiUser | null;
  onSelectUser: (user: ApiUser) => void;
}

export default function UsersList({
  users,
  selectedUser,
  onSelectUser,
}: UsersListProps) {
  return (
    <Box sx={{ flex: 1, overflowY: "auto" }}>
      {users.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          mt={2}
        >
          No users found
        </Typography>
      ) : (
        users.map((user) => {
          const active = selectedUser?._id === user._id;

          return (
            <Box
              key={user._id}
              onClick={() => onSelectUser(user)}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                cursor: "pointer",
                bgcolor: active ? "grey.200" : "transparent",
                transition: "bgcolor 0.2s",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <Typography fontWeight={600}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.userCode || "—"}
              </Typography>
            </Box>
          );
        })
      )}
    </Box>
  );
}
