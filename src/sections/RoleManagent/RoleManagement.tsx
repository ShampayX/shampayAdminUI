import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Tab,
  Chip,
  Grid,
  Card,
  Stack,
  Paper,
  Avatar,
  Button,
  Divider,
  Dialog,
  MenuItem,
  Switch,
  TableCell,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  FormHelperText,
  TablePagination,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "src/components/snackbar";
import ConfirmDialog from "src/components/confirm-dialog";
// page kit
import {
  PageHeader,
  PageActionButton,
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
  EmptyState,
  LoadingState,
  StatGridSkeleton,
  FilterBarSkeleton,
  TableSkeleton,
  useDataTable,
} from "src/components/page-kit";
//
import PermissionMatrix, {
  ModulePermission,
  PERMISSION_ACTIONS,
  moduleLabel,
  permissionsFor,
} from "./PermissionMatrix";

// ----------------------------------------------------------------------
// Access & permission management.
//
// Everything on this screen is backed by the existing admin-user endpoints:
//
//   get-users-by-parent/:parentId                 list admin users
//   create-admin-user                             create (role + modules)
//   updateAdminUserDetails                        rename / reset password
//   updateAdminUserStatus/:id                     activate / deactivate
//   getAdminUserDetailsModulePermission/:id       read a user's modules
//   admin/info/:parentId                          who created a user
//
// Roles are the four levels the backend recognises; there is no role-CRUD
// endpoint, so roles are presented as they are rather than as editable records.
// There is also no endpoint to change an existing user's modules, so the matrix
// is editable while creating and read-only afterwards - see PermissionMatrix.
// ----------------------------------------------------------------------

const ALL_MODULE_OPTIONS = ["SUPPORT", "FINANCE", "RECONCILIATION"];

type RoleOption = {
  value: string;
  label: string;
  level: number;
  description: string;
};

/** The four levels the API recognises, most privileged first. */
const ALL_ROLE_OPTIONS: RoleOption[] = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    level: 0,
    description:
      "Platform owner. Every module and every action, and can create any other role.",
  },
  {
    value: "ROOT_ADMIN",
    label: "Root Admin",
    level: 1,
    description:
      "Full access across all modules. Created without a module selection.",
  },
  {
    value: "TL",
    label: "TL",
    level: 2,
    description:
      "Team lead. Scoped to the modules granted at creation, and can create team members.",
  },
  {
    value: "TEAM_MEMBER",
    label: "Team Member",
    level: 3,
    description:
      "Operator. Scoped to the modules and actions granted at creation.",
  },
];

interface ApiUser {
  updatedBy: any;
  _id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  roleLevel: number;
  parentType: string;
  parentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  modules?: ModulePermission[];
}

interface NewUserForm {
  roleName: string;
  name: string;
  password: string;
  email: string;
  modules: ModulePermission[];
}

interface FormErrors {
  roleName?: string;
  name?: string;
  email?: string;
  password?: string;
  modules?: string;
}

interface EditForm {
  name: string;
  password: string;
}

interface EditFormErrors {
  name?: string;
  password?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const roleOptionFor = (level: number): RoleOption =>
  ALL_ROLE_OPTIONS.find((r) => r.level === level) ||
  ALL_ROLE_OPTIONS[ALL_ROLE_OPTIONS.length - 1];

const roleLabel = (level: number) => roleOptionFor(level).label;

/** Levels 0 and 1 are unscoped; 2 and 3 only see the modules they were given. */
const isFullAccess = (level: number) => level <= 1;

const accessLabel = (level: number) =>
  isFullAccess(level) ? "Full access" : "Module scoped";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (
  form: NewUserForm,
  selectedModules: string[]
): FormErrors => {
  const errors: FormErrors = {};

  if (!form.roleName) errors.roleName = "Role is required";

  if (!form.name.trim()) errors.name = "Name is required";
  else if (form.name.trim().length < 3)
    errors.name = "Name must be at least 3 characters";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!emailRegex.test(form.email.trim()))
    errors.email = "Enter a valid email address";

  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 12)
    errors.password = "Password must be at least 12 characters";
  else if (!/[A-Z]/.test(form.password))
    errors.password = "Password needs an uppercase letter";
  else if (!/[0-9]/.test(form.password))
    errors.password = "Password needs a number";
  else if (!/[^A-Za-z0-9]/.test(form.password))
    errors.password = "Password needs a special character";

  /* Root admins are created without modules - the API grants them everything. */
  if (form.roleName && form.roleName !== "ROOT_ADMIN") {
    if (selectedModules.length === 0) {
      errors.modules = "Select at least one module";
    } else {
      const missing = selectedModules.filter(
        (code) => permissionsFor(form.modules, code).length === 0
      );
      if (missing.length) {
        errors.modules = `Select at least one action for ${missing
          .map(moduleLabel)
          .join(", ")}`;
      }
    }
  }

  return errors;
};

const validateEditForm = (form: EditForm): EditFormErrors => {
  const errors: EditFormErrors = {};

  if (!form.name.trim()) errors.name = "Name is required";
  else if (form.name.trim().length < 3)
    errors.name = "Name must be at least 3 characters";

  /* Blank password means "leave it alone", so only validate a typed one. */
  if (form.password.trim()) {
    if (form.password.length < 12)
      errors.password = "Password must be at least 12 characters";
    else if (!/[A-Z]/.test(form.password))
      errors.password = "Password needs an uppercase letter";
    else if (!/[0-9]/.test(form.password))
      errors.password = "Password needs a number";
    else if (!/[^A-Za-z0-9]/.test(form.password))
      errors.password = "Password needs a special character";
  }

  return errors;
};

const initialOf = (name?: string) => (name || "?").charAt(0).toUpperCase();

// ----------------------------------------------------------------------

export default function RoleManagement() {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const adminUserData = JSON.parse(
    localStorage.getItem("adminUserData") || "{}"
  );
  const loggedInUser = adminUserData?.user || {};
  const adminToken = adminUserData?.token || "";
  const parentId = loggedInUser?._id || "";
  const myRoleLevel: number = loggedInUser?.roleLevel ?? 0;

  const loginModules: string[] = (adminUserData?.modules || []).map(
    (m: any) => m.code
  );

  /* A root admin can hand out every module; anyone else only what they hold. */
  const MODULE_OPTIONS: string[] = isFullAccess(myRoleLevel)
    ? ALL_MODULE_OPTIONS
    : loginModules;

  const ALL_PERMISSIONS: ModulePermission[] = MODULE_OPTIONS.map((code) => ({
    code,
    permissions: [...PERMISSION_ACTIONS],
  }));

  /* You can only create roles below your own. */
  const ROLE_OPTIONS = ALL_ROLE_OPTIONS.filter((r) => r.level > myRoleLevel);

  // ── State ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  /* A refresh over existing rows - keeps the table on screen. */
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  /* Drops a late response from a request that has been superseded. */
  const usersRequestRef = useRef(0);
  const [tab, setTab] = useState<"roles" | "users">("roles");
  const [roleFilter, setRoleFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [profilePerms, setProfilePerms] = useState<ModulePermission[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [createdBy, setCreatedBy] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    password: "",
  });
  const [editFormErrors, setEditFormErrors] = useState<EditFormErrors>({});
  const [editSubmitAttempted, setEditSubmitAttempted] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [newUser, setNewUser] = useState<NewUserForm>({
    roleName: "",
    name: "",
    password: "",
    email: "",
    modules: [],
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  /* Deactivating an admin cuts their access, so it is confirmed first. */
  const [pendingStatus, setPendingStatus] = useState<ApiUser | null>(null);

  // ── Fetch users ────────────────────────────────────────────────────────────
  /**
   * `get-users-by-parent` is the only request this screen makes on load, so
   * there is no frontend waterfall left to remove - if the screen is slow, the
   * time is being spent inside that endpoint. See BACKEND_PERFORMANCE_ISSUES.md
   * issue A.
   *
   * What the frontend can do is fail and refresh gracefully:
   *
   *   - a REFRESH keeps the rows already on screen instead of blanking the
   *     table and showing a skeleton again. Only the very first load, when
   *     there is nothing to keep, shows the skeleton.
   *   - a failure that had previous data keeps that data and surfaces a
   *     non-blocking error bar, so a transient 500 on refresh does not wipe the
   *     screen.
   *   - a failure with nothing to fall back on gets a real error state with
   *     Retry, instead of an empty table that looks like "no users exist".
   *   - a stale response from a superseded request is dropped.
   */
  const fetchUsers = useCallback(
    async (options?: { background?: boolean }) => {
      if (!parentId) return;

      const requestId = (usersRequestRef.current += 1);
      const isCurrent = () => usersRequestRef.current === requestId;

      if (options?.background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setLoadError(false);

      try {
        const res: any = await Api(
          `admin/API_User_Management/get-users-by-parent/${parentId}`,
          "POST",
          { roleLevel: myRoleLevel },
          adminToken
        );

        if (!isCurrent()) return;

        if (res?.data?.users) {
          setUsers(res.data.users);
        } else {
          /* A shaped-but-empty response is a real "no users", not a failure. */
          setUsers([]);
        }
      } catch (e) {
        console.error("Fetch Users Error:", e);
        if (!isCurrent()) return;
        setLoadError(true);
        /* Deliberately NOT clearing `users` - stale rows beat a blank screen. */
      } finally {
        if (isCurrent()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parentId, adminToken, myRoleLevel]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Real-time validation after first submit attempt ────────────────────────
  useEffect(() => {
    if (submitAttempted) {
      setFormErrors(validateForm(newUser, selectedModules));
    }
  }, [newUser, selectedModules, submitAttempted]);

  useEffect(() => {
    if (editSubmitAttempted) {
      setEditFormErrors(validateEditForm(editForm));
    }
  }, [editForm, editSubmitAttempted]);

  // ── Toggle active ──────────────────────────────────────────────────────────
  const toggleActive = async (user: ApiUser) => {
    try {
      const res: any = await Api(
        `admin/API_User_Management/updateAdminUserStatus/${user._id}`,
        "POST",
        { isActive: !user.isActive },
        adminToken
      );
      if (res?.data?.updatedUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, isActive: !u.isActive } : u
          )
        );
        enqueueSnackbar(
          user.isActive
            ? `${user.name} deactivated`
            : `${user.name} activated`
        );
      } else {
        enqueueSnackbar(res?.message || "Failed to update status", {
          variant: "error",
        });
      }
    } catch (e: any) {
      enqueueSnackbar(
        e?.response?.data?.message || e?.message || "Failed to update status",
        { variant: "error" }
      );
    }
  };

  // ── Open profile ───────────────────────────────────────────────────────────
  const openProfile = async (user: ApiUser, startEdit = false) => {
    setSelectedUser(user);
    setProfilePerms([]);
    setCreatedBy(null);
    setShowProfile(true);
    setProfileLoading(true);
    setIsEditing(startEdit);
    setEditForm(
      startEdit
        ? { name: user.name, password: user.password }
        : { name: "", password: "" }
    );
    setEditFormErrors({});
    setEditSubmitAttempted(false);

    try {
      /* Levels 0/1 hold everything and the API has no module row for them, so
         the permission call is skipped entirely for those users. */
      const needsPermissions = !isFullAccess(user.roleLevel);

      /* Creator info and module permissions are independent - they used to be
         awaited one after the other, so opening a profile cost two sequential
         round trips. */
      const [creatorRes, permsRes]: any[] = await Promise.all([
        user.parentId
          ? Api(
              `admin/API_User_Management/admin/info/${user.parentId}`,
              "GET",
              null,
              adminToken
            )
          : Promise.resolve(null),
        needsPermissions
          ? Api(
              `admin/API_User_Management/getAdminUserDetailsModulePermission/${user._id}`,
              "GET",
              null,
              adminToken
            )
          : Promise.resolve(null),
      ]);

      if (creatorRes?.data) {
        setCreatedBy({
          name: creatorRes?.data?.adminInfo?.name,
          email: creatorRes.data?.adminInfo?.email,
        });
      }

      if (!needsPermissions) {
        setProfilePerms(ALL_PERMISSIONS);
      } else if (permsRes?.data?.modules) {
        setProfilePerms(permsRes.data.modules);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const startEditing = () => {
    if (!selectedUser) return;
    setEditForm({ name: selectedUser.name, password: selectedUser.password });
    setEditFormErrors({});
    setEditSubmitAttempted(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({ name: "", password: "" });
    setEditFormErrors({});
    setEditSubmitAttempted(false);
  };

  // ── Update user details ────────────────────────────────────────────────────
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setEditSubmitAttempted(true);
    const errors = validateEditForm(editForm);
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setUpdateLoading(true);
    try {
      const payload: any = { name: editForm.name, email: selectedUser.email };
      if (editForm.password.trim()) payload.password = editForm.password;

      const res: any = await Api(
        `admin/API_User_Management/updateAdminUserDetails`,
        "POST",
        payload,
        adminToken
      );

      if (res?.data?.updatedUser || res?.success || res?.data?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  name: editForm.name,
                  ...(editForm.password ? { password: editForm.password } : {}),
                }
              : u
          )
        );
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                name: editForm.name,
                ...(editForm.password ? { password: editForm.password } : {}),
              }
            : prev
        );
        setIsEditing(false);
        enqueueSnackbar("User updated successfully");
      } else {
        enqueueSnackbar(
          res?.message || res?.data?.message || "Failed to update user",
          { variant: "error" }
        );
      }
    } catch (e: any) {
      enqueueSnackbar(
        e?.response?.data?.message ||
          e?.data?.message ||
          e?.message ||
          "Something went wrong",
        { variant: "error" }
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── Create user ────────────────────────────────────────────────────────────
  const handleAddUser = async () => {
    setSubmitAttempted(true);
    const errors = validateForm(newUser, selectedModules);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreateLoading(true);
    try {
      const payload: any = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        roleName: newUser.roleName,
      };
      if (newUser.roleName !== "ROOT_ADMIN") {
        const filteredModules = newUser.modules.filter((m) =>
          selectedModules.includes(m.code)
        );
        if (filteredModules.length > 0) payload.modules = filteredModules;
      }

      const res: any = await Api(
        "admin/API_User_Management/create-admin-user",
        "POST",
        payload,
        adminToken
      );

      if (res?.data?.newUser) {
        fetchUsers();
        resetAddForm();
        setShowAddModal(false);
        enqueueSnackbar("User created successfully");
      } else {
        enqueueSnackbar(
          res?.message || res?.data?.message || "Failed to create user",
          { variant: "error" }
        );
      }
    } catch (e: any) {
      enqueueSnackbar(
        e?.response?.data?.message ||
          e?.data?.message ||
          e?.message ||
          "Something went wrong",
        { variant: "error" }
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const resetAddForm = () => {
    setNewUser({
      roleName: "",
      name: "",
      password: "",
      email: "",
      modules: [],
    });
    setSelectedModules([]);
    setFormErrors({});
    setSubmitAttempted(false);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetAddForm();
  };

  // ── Matrix toggles (create flow only) ──────────────────────────────────────
  const toggleModulePerm = (code: string, perm: string) => {
    setNewUser((prev) => {
      const modules = [...prev.modules];
      const idx = modules.findIndex((m) => m.code === code);
      if (idx === -1) {
        modules.push({ code, permissions: [perm] });
      } else {
        const perms = modules[idx].permissions;
        modules[idx] = {
          ...modules[idx],
          permissions: perms.includes(perm)
            ? perms.filter((p) => p !== perm)
            : [...perms, perm],
        };
        if (modules[idx].permissions.length === 0) modules.splice(idx, 1);
      }
      return { ...prev, modules };
    });
  };

  const toggleSelectModule = (code: string) => {
    setSelectedModules((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    setSelectedModules((prev) =>
      prev.length === MODULE_OPTIONS.length ? [] : [...MODULE_OPTIONS]
    );
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  /**
   * Roles as they exist for this admin: the levels below their own, each with
   * the live user count, activity and most recent change taken from `users`.
   */
  const roles = useMemo(
    () =>
      ROLE_OPTIONS.map((role) => {
        const members = users.filter((u) => u.roleLevel === role.level);
        const activeCount = members.filter((u) => u.isActive).length;
        const lastUpdated = members.reduce<string>((latest, user) => {
          const stamp = user.updatedAt || user.createdAt;
          return stamp && stamp > latest ? stamp : latest;
        }, "");

        return {
          ...role,
          members,
          userCount: members.length,
          activeCount,
          lastUpdated,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, myRoleLevel]
  );

  const scopedUsers = useMemo(
    () =>
      roleFilter
        ? users.filter((u) => roleLabel(u.roleLevel) === roleFilter)
        : users,
    [users, roleFilter]
  );

  const userTable = useDataTable<ApiUser>(scopedUsers, {
    storageKey: "permissions-users",
    searchKeys: ["name", "email"],
  });

  const totals = useMemo(
    () => ({
      roles: roles.filter((role) => role.userCount > 0).length,
      users: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
    }),
    [roles, users]
  );

  const viewRole = (label: string) => {
    setRoleFilter(label);
    setTab("users");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const profileRole = selectedUser ? roleOptionFor(selectedUser.roleLevel) : null;

  return (
    <>
      <Helmet>
        <title> Permissions | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Permissions"
          subtitle="Roles, module access and the admin users each role is assigned to."
          actions={
            <>
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                disabled={refreshing}
                onClick={() => fetchUsers({ background: true })}
              >
                {refreshing ? "Refreshing" : "Refresh"}
              </PageGhostButton>
              {ROLE_OPTIONS.length > 0 && (
                <PageActionButton
                  startIcon={<PersonAddAltOutlinedIcon />}
                  onClick={() => setShowAddModal(true)}
                >
                  Add User
                </PageActionButton>
              )}
            </>
          }
        />

        {/* A failed refresh keeps the table on screen and says so here, rather
            than replacing real rows with an error page. */}
        {loadError && users.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{
              px: 2,
              py: 1.25,
              mb: 2.5,
              borderRadius: 1.5,
              border: (t) => `1px solid ${alpha(t.palette.warning.main, 0.4)}`,
              backgroundColor: (t) => alpha(t.palette.warning.main, 0.08),
            }}
          >
            <Typography sx={{ fontSize: 13 }}>
              Could not refresh the user list. Showing the last data that
              loaded.
            </Typography>
            <PageGhostButton
              startIcon={<RefreshOutlinedIcon />}
              onClick={() => fetchUsers({ background: true })}
            >
              Retry
            </PageGhostButton>
          </Stack>
        )}

        {loadError && users.length === 0 && !loading ? (
          <EmptyState
            icon={<AdminPanelSettingsOutlinedIcon />}
            title="Could not load users"
            description="The admin user list did not come back. Nothing was changed - try again."
            action={
              <PageGhostButton
                startIcon={<RefreshOutlinedIcon />}
                onClick={() => fetchUsers()}
              >
                Retry
              </PageGhostButton>
            }
          />
        ) : loading ? (
          <>
            <StatGridSkeleton />
            <FilterBarSkeleton slots={2} />
            <TableSkeleton
              columns={[
                { id: "user", label: "User" },
                { id: "role", label: "Role" },
                { id: "modules", label: "Modules" },
                { id: "status", label: "Status", align: "center" },
                { id: "action", label: "", align: "right" },
              ]}
              rows={8}
              minWidth={900}
            />
          </>
        ) : (
          <>
            <StatGrid>
              <StatCard
                label="Roles In Use"
                value={`${totals.roles} / ${roles.length}`}
                caption="Assignable below your level"
                icon={<AdminPanelSettingsOutlinedIcon />}
              />
              <StatCard
                label="Admin Users"
                value={totals.users}
                caption="Created under your account"
                tone="neutral"
                icon={<GroupsOutlinedIcon />}
              />
              <StatCard
                label="Active"
                value={totals.active}
                caption="Can sign in right now"
                tone="success"
                icon={<VerifiedUserOutlinedIcon />}
              />
              <StatCard
                label="Deactivated"
                value={totals.inactive}
                caption="Access withdrawn"
                tone={totals.inactive > 0 ? "warning" : "neutral"}
                icon={<BlockOutlinedIcon />}
              />
            </StatGrid>

            <KitTabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab value="roles" label={`Roles (${roles.length})`} />
              <Tab value="users" label={`Assignments (${users.length})`} />
            </KitTabs>

            {/* ── Roles ──────────────────────────────────────────────── */}
            {tab === "roles" &&
              (roles.length === 0 ? (
                <EmptyState
                  icon={<ShieldOutlinedIcon />}
                  title="No assignable roles"
                  description="Your own role is the lowest level, so there is no role below it to grant."
                />
              ) : (
                <Grid container spacing={2}>
                  {roles.map((role) => (
                    <Grid item xs={12} md={6} key={role.value}>
                      <Card
                        sx={{
                          p: 2.5,
                          height: "100%",
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow:
                            theme.palette.mode === "light"
                              ? "0 2px 12px rgba(15,23,42,0.05)"
                              : "none",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" spacing={1.5}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                                display: "flex",
                                borderRadius: 1.25,
                                alignItems: "center",
                                justifyContent: "center",
                                color: "primary.main",
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.12
                                ),
                              }}
                            >
                              {isFullAccess(role.level) ? (
                                <ShieldOutlinedIcon />
                              ) : (
                                <AdminPanelSettingsOutlinedIcon />
                              )}
                            </Box>

                            <Box>
                              <Typography
                                sx={{ fontSize: 15.5, fontWeight: 700 }}
                              >
                                {role.label}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: 0.6,
                                  textTransform: "uppercase",
                                  color: "text.secondary",
                                }}
                              >
                                Level {role.level} • {accessLabel(role.level)}
                              </Typography>
                            </Box>
                          </Stack>

                          <StatusPill
                            status={role.userCount > 0 ? "active" : "unused"}
                          />
                        </Stack>

                        <Typography
                          sx={{
                            mt: 1.5,
                            fontSize: 13.5,
                            color: "text.secondary",
                          }}
                        >
                          {role.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Stack
                          direction="row"
                          spacing={3}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                letterSpacing: 0.6,
                                textTransform: "uppercase",
                                color: "text.secondary",
                              }}
                            >
                              Users
                            </Typography>
                            <Typography
                              sx={{ fontSize: 15, fontWeight: 700 }}
                            >
                              {role.userCount}
                              <Typography
                                component="span"
                                sx={{ fontSize: 12, color: "text.secondary" }}
                              >
                                {` (${role.activeCount} active)`}
                              </Typography>
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                letterSpacing: 0.6,
                                textTransform: "uppercase",
                                color: "text.secondary",
                              }}
                            >
                              Last Updated
                            </Typography>
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                              {role.lastUpdated
                                ? new Date(
                                    role.lastUpdated
                                  ).toLocaleDateString("en-IN")
                                : "-"}
                            </Typography>
                          </Box>

                          <Box sx={{ flexGrow: 1 }} />

                          <PageGhostButton
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => viewRole(role.label)}
                            disabled={role.userCount === 0}
                          >
                            View Users
                          </PageGhostButton>
                        </Stack>

                        <Box sx={{ mt: 2.5 }}>
                          <Typography
                            sx={{
                              mb: 1,
                              fontSize: 10.5,
                              fontWeight: 700,
                              letterSpacing: 0.6,
                              textTransform: "uppercase",
                              color: "text.secondary",
                            }}
                          >
                            Grantable Modules
                          </Typography>

                          {isFullAccess(role.level) ? (
                            <Chip
                              size="small"
                              color="primary"
                              variant="outlined"
                              label="All modules, all actions"
                              sx={{ fontSize: 11, fontWeight: 700 }}
                            />
                          ) : MODULE_OPTIONS.length === 0 ? (
                            <Typography
                              sx={{ fontSize: 12.5, color: "text.disabled" }}
                            >
                              None available to you
                            </Typography>
                          ) : (
                            <Stack
                              direction="row"
                              spacing={0.75}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              {MODULE_OPTIONS.map((code) => (
                                <Chip
                                  key={code}
                                  size="small"
                                  variant="outlined"
                                  label={moduleLabel(code)}
                                  sx={{ fontSize: 11 }}
                                />
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ))}

            {/* ── Assignments ────────────────────────────────────────── */}
            {tab === "users" && (
              <>
                <FilterBar>
                  <SearchField
                    value={userTable.query}
                    onChange={userTable.setQuery}
                    placeholder="Search by name or email"
                    count={userTable.total}
                    total={userTable.grandTotal}
                  />

                  <FilterSlot
                    icon={<AdminPanelSettingsOutlinedIcon />}
                    minWidth={210}
                  >
                    <TextField
                      select
                      fullWidth
                      variant="standard"
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      InputProps={{ disableUnderline: true }}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.label}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FilterSlot>
                </FilterBar>

                <DataTable
                  minWidth={980}
                  columns={[
                    { id: "user", label: "User", sortKey: "name" },
                    { id: "email", label: "Email", sortKey: "email" },
                    { id: "role", label: "Role", sortKey: "roleLevel" },
                    { id: "modules", label: "Modules" },
                    { id: "access", label: "Access" },
                    { id: "status", label: "Status", align: "center" },
                    { id: "action", label: "Actions", align: "center" },
                  ]}
                  isEmpty={userTable.isEmpty}
                  emptyMessage={
                    userTable.isFiltered
                      ? "No users match this search."
                      : "No admin users created yet."
                  }
                  sortBy={userTable.sortBy}
                  sortDir={userTable.sortDir}
                  onSort={userTable.toggleSort}
                  footer={
                    <TablePagination
                      component="div"
                      count={userTable.total}
                      page={userTable.page}
                      rowsPerPage={userTable.rowsPerPage}
                      onPageChange={(_, page) => userTable.setPage(page)}
                      onRowsPerPageChange={(event) =>
                        userTable.changeRowsPerPage(Number(event.target.value))
                      }
                      rowsPerPageOptions={[10, 25, 50]}
                    />
                  }
                >
                  {userTable.paged.map((user) => (
                    <KitRow key={user._id}>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: 13,
                              fontWeight: 700,
                              bgcolor: "primary.lighter",
                              color: "primary.dark",
                            }}
                          >
                            {initialOf(user.name)}
                          </Avatar>
                          <StackedCell
                            bold
                            primary={user.name}
                            secondary={
                              user.createdAt
                                ? `Added ${new Date(
                                    user.createdAt
                                  ).toLocaleDateString("en-IN")}`
                                : undefined
                            }
                          />
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ fontSize: 13.5 }}>
                        {user.email}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={roleLabel(user.roleLevel)}
                          sx={{ fontSize: 11, fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell>
                        {isFullAccess(user.roleLevel) ? (
                          <Typography
                            sx={{ fontSize: 12.5, color: "text.secondary" }}
                          >
                            All modules
                          </Typography>
                        ) : user.modules && user.modules.length > 0 ? (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {user.modules.map((m) => (
                              <Chip
                                key={m.code}
                                size="small"
                                variant="outlined"
                                label={moduleLabel(m.code)}
                                sx={{ fontSize: 10.5, height: 20 }}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography
                            sx={{ fontSize: 12.5, color: "text.disabled" }}
                          >
                            None
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ fontSize: 12.5 }}>
                        {accessLabel(user.roleLevel)}
                      </TableCell>

                      <TableCell align="center">
                        <Stack alignItems="center">
                          <Switch
                            size="small"
                            color="success"
                            checked={user.isActive}
                            onChange={() => setPendingStatus(user)}
                          />
                          <StatusPill status={user.isActive} />
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                        >
                          <IconButton
                            size="small"
                            title="View access"
                            onClick={() => openProfile(user, false)}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Edit details"
                            onClick={() => openProfile(user, true)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </KitRow>
                  ))}
                </DataTable>
              </>
            )}
          </>
        )}

        {/* ── Add user ───────────────────────────────────────────────── */}
        <Dialog
          open={showAddModal}
          onClose={closeAddModal}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
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
                Add Admin User
              </Typography>
              <Typography
                sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}
              >
                Role and module access are set here - they cannot be changed
                afterwards.
              </Typography>
            </Box>

            <IconButton
              onClick={closeAddModal}
              size="small"
              sx={{ mt: -0.5, mr: -1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ px: 3, py: 2.5, maxHeight: "70vh", overflowY: "auto" }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role *"
                  value={newUser.roleName}
                  error={!!formErrors.roleName}
                  helperText={
                    formErrors.roleName ||
                    ALL_ROLE_OPTIONS.find((r) => r.value === newUser.roleName)
                      ?.description
                  }
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, roleName: e.target.value }))
                  }
                >
                  <MenuItem value="">Select role</MenuItem>
                  {ROLE_OPTIONS.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Name *"
                  placeholder="Enter full name"
                  value={newUser.name}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, name: e.target.value }))
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email *"
                  placeholder="Enter email"
                  value={newUser.email}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, email: e.target.value }))
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Password *"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 12 chars, incl. uppercase, number, special char"
                  value={newUser.password}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, password: e.target.value }))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Root admins are granted everything by the API, so no matrix. */}
              {newUser.roleName && newUser.roleName !== "ROOT_ADMIN" && (
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      Module Permissions *
                    </Typography>
                    {formErrors.modules && (
                      <FormHelperText error>
                        {formErrors.modules}
                      </FormHelperText>
                    )}
                  </Stack>

                  <PermissionMatrix
                    modules={MODULE_OPTIONS}
                    value={newUser.modules}
                    enabledModules={selectedModules}
                    onToggleModule={toggleSelectModule}
                    onTogglePermission={toggleModulePerm}
                    onToggleAll={toggleSelectAll}
                    error={!!formErrors.modules}
                    emptyMessage="You hold no modules to grant."
                  />
                </Grid>
              )}

              {newUser.roleName === "ROOT_ADMIN" && (
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(
                        theme.palette.warning.main,
                        0.4
                      )}`,
                      backgroundColor: alpha(theme.palette.warning.main, 0.08),
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <LockOutlinedIcon
                        sx={{ fontSize: 20, color: "warning.main" }}
                      />
                      <Typography sx={{ fontSize: 13 }}>
                        A Root Admin receives every module and every action. No
                        module selection is sent for this role.
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{
              px: 3,
              py: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button variant="outlined" color="inherit" onClick={closeAddModal}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              loading={createLoading}
              onClick={handleAddUser}
            >
              Create User
            </LoadingButton>
          </Stack>
        </Dialog>

        {/* ── Profile / access detail ────────────────────────────────── */}
        <Dialog
          open={showProfile}
          onClose={() => {
            setShowProfile(false);
            setIsEditing(false);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selectedUser && (
            <>
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
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: 19,
                      fontWeight: 700,
                      bgcolor: "primary.lighter",
                      color: "primary.dark",
                    }}
                  >
                    {initialOf(isEditing ? editForm.name : selectedUser.name)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                      {isEditing
                        ? editForm.name || selectedUser.name
                        : selectedUser.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        variant="outlined"
                        label={profileRole?.label}
                        sx={{ fontSize: 10.5, height: 20, fontWeight: 700 }}
                      />
                      <StatusPill status={selectedUser.isActive} />
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  {!isEditing ? (
                    <PageGhostButton
                      startIcon={<EditOutlinedIcon />}
                      onClick={startEditing}
                    >
                      Edit
                    </PageGhostButton>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                      <LoadingButton
                        size="small"
                        variant="contained"
                        startIcon={<SaveOutlinedIcon />}
                        loading={updateLoading}
                        onClick={handleUpdateUser}
                      >
                        Save
                      </LoadingButton>
                    </>
                  )}

                  <IconButton
                    size="small"
                    onClick={() => {
                      setShowProfile(false);
                      setIsEditing(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Box
                sx={{ px: 3, py: 2.5, maxHeight: "70vh", overflowY: "auto" }}
              >
                <Grid container spacing={2}>
                  {isEditing && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Name *"
                          value={editForm.name}
                          error={!!editFormErrors.name}
                          helperText={editFormErrors.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Password"
                          type={showEditPassword ? "text" : "password"}
                          value={editForm.password}
                          error={!!editFormErrors.password}
                          helperText={
                            editFormErrors.password ||
                            "Leave unchanged to keep the current password"
                          }
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              password: e.target.value,
                            }))
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowEditPassword((s) => !s)}
                                  edge="end"
                                  size="small"
                                >
                                  {showEditPassword ? (
                                    <VisibilityOffOutlinedIcon fontSize="small" />
                                  ) : (
                                    <VisibilityOutlinedIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {(
                    [
                      ["Email", selectedUser.email],
                      ["Role", profileRole?.label || "-"],
                      ["Access Level", accessLabel(selectedUser.roleLevel)],
                      ["Parent Type", selectedUser.parentType || "-"],
                      ["Created By", createdBy?.email || "-"],
                      [
                        "Created At",
                        selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "-",
                      ],
                      ["Updated By", selectedUser?.updatedBy?.email || "-"],
                      [
                        "Status",
                        selectedUser.isActive ? "Active" : "Deactivated",
                      ],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <Grid item xs={6} sm={4} key={label}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          height: "100%",
                          borderRadius: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                          backgroundColor: alpha(
                            theme.palette.grey[500],
                            0.04
                          ),
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 0.25,
                            fontSize: 10.5,
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            color: "text.secondary",
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            wordBreak: "break-word",
                          }}
                        >
                          {value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    Assigned Permissions
                  </Typography>
                  {isFullAccess(selectedUser.roleLevel) && (
                    <Chip
                      size="small"
                      color="primary"
                      label="Full Access"
                      sx={{ fontSize: 10.5, height: 20, fontWeight: 700 }}
                    />
                  )}
                </Stack>

                {profileLoading ? (
                  <LoadingState height={140} />
                ) : (
                  <>
                    <PermissionMatrix
                      readOnly
                      modules={profilePerms.map((m) => m.code)}
                      value={profilePerms}
                      emptyMessage="No permissions assigned."
                    />

                    <Typography
                      sx={{ mt: 1.5, fontSize: 12, color: "text.secondary" }}
                    >
                      Module access is granted when the user is created. The
                      admin API exposes no endpoint to change it afterwards, so
                      it is shown read-only here.
                    </Typography>
                  </>
                )}
              </Box>
            </>
          )}
        </Dialog>

        {/* ── Confirm activate / deactivate ──────────────────────────── */}
        <ConfirmDialog
          open={Boolean(pendingStatus)}
          onClose={() => setPendingStatus(null)}
          title={
            pendingStatus?.isActive ? "Deactivate user?" : "Activate user?"
          }
          content={
            pendingStatus?.isActive
              ? `${pendingStatus?.name} will lose access to the portal immediately.`
              : `${pendingStatus?.name} will be able to sign in again with their existing permissions.`
          }
          action={
            <Button
              variant="contained"
              color={pendingStatus?.isActive ? "error" : "primary"}
              onClick={() => {
                if (pendingStatus) toggleActive(pendingStatus);
                setPendingStatus(null);
              }}
            >
              {pendingStatus?.isActive ? "Deactivate" : "Activate"}
            </Button>
          }
        />
      </Box>
    </>
  );
}
