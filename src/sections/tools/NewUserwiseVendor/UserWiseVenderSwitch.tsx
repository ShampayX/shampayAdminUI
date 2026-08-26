import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import {
  Box,
  Stack,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// page kit
import {
  PageHeader,
  PageGhostButton,
  FilterBar,
  FilterSlot,
  EmptyState,
  LoadingState,
  FilterBarSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "src/components/page-kit";
//
import { Service, routableServices } from "./ServiceList";
import VendorConfigContainer from "./VendorConfigContainer";

// ----------------------------------------------------------------------
// People > Vendor Routing.
//
// Picks an API user and a service, then shows which vendor handles that
// service for each downstream channel. Same three endpoints as before -
// user list, category list, then the routing table does the rest.
// ----------------------------------------------------------------------

type ApiUser = {
  _id: string;
  firstName: string;
  lastName: string;
  userCode: string;
  company_name?: string;
};

const userLabel = (user: ApiUser) =>
  [
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed user",
    user.userCode,
    user.company_name,
  ]
    .filter(Boolean)
    .join(" • ");

export default function UserwiseVendorSwitchPage() {
  const { Api } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  /**
   * Users and services are independent, so both go out on mount together.
   *
   * `fetchServices` used to run on [selectedUser]: the category list was
   * re-fetched every time the admin picked a different user even though it
   * does not depend on the user, and each refetch reset selectedServiceId back
   * to the first service - so changing user silently threw away which service
   * you were looking at. Now it runs once.
   */
  useEffect(() => {
    fetchUsers();
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= API - unchanged contracts ================= */

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await Api(
      "admin/API_User_Management/list_API_users",
      "GET",
      "",
      token
    );

    if (res?.status === 200 && res.data.code === 200) {
      const list: ApiUser[] = res.data.data || [];
      setUsers(list);

      /* Preselect the first user so the screen is never empty on open. */
      if (list.length) setSelectedUser(list[0]);
    }
    setLoading(false);
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    const token = localStorage.getItem("token");

    const res = await Api("category/get_CategoryList", "GET", "", token);

    if (res?.status === 200 && res.data.code === 200) {
      const list = routableServices(res.data.data || []);
      setServices(list);
      setSelectedServiceId(list.length ? list[0]._id : "");
    } else {
      setServices([]);
      setSelectedServiceId("");
    }

    setServicesLoading(false);
  };

  const selectedService = useMemo(
    () => services.find((service) => service._id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title> Vendor Routing | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Vendor Routing"
          subtitle="Which provider handles each service, per API user and channel."
          actions={
            <PageGhostButton
              startIcon={<RefreshOutlinedIcon />}
              onClick={fetchUsers}
            >
              Refresh
            </PageGhostButton>
          }
        />

        {loading ? (
          <>
            <FilterBarSkeleton slots={2} />
            <StatGridSkeleton />
            <TableSkeleton
              columns={[
                { id: "product", label: "Service" },
                { id: "neoNetwork", label: "Neo Network" },
                { id: "directAgent", label: "Direct Agent" },
                { id: "apiUser", label: "API User" },
                { id: "status", label: "Status", align: "center" },
                { id: "updated", label: "Last Updated" },
                { id: "action", label: "Action", align: "center" },
              ]}
              rows={6}
              minWidth={980}
            />
          </>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<GroupsOutlinedIcon />}
            title="No API users"
            description="Routing is configured per API user. Add one in Ecosystem first."
          />
        ) : (
          <>
            <FilterBar>
              <FilterSlot
                icon={<PersonSearchOutlinedIcon />}
                grow
                minWidth={320}
              >
                <Autocomplete
                  fullWidth
                  options={users}
                  value={selectedUser}
                  disableClearable={false}
                  getOptionLabel={userLabel}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  onChange={(_, value) => {
                    setSelectedUser(value);
                    setSelectedServiceId("");
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box sx={{ py: 0.25 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                          {`${option.firstName || ""} ${
                            option.lastName || ""
                          }`.trim() || "Unnamed user"}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 11.5, color: "text.secondary" }}
                        >
                          {[option.userCode, option.company_name]
                            .filter(Boolean)
                            .join(" • ") || "-"}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Select API user"
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                      }}
                    />
                  )}
                />
              </FilterSlot>

              <FilterSlot icon={<CategoryOutlinedIcon />} minWidth={230}>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={selectedServiceId}
                  disabled={servicesLoading || services.length === 0}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  InputProps={{ disableUnderline: true }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled>
                    {servicesLoading ? "Loading services..." : "Select service"}
                  </MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service._id} value={service._id}>
                      {service.category_name}
                    </MenuItem>
                  ))}
                </TextField>
              </FilterSlot>
            </FilterBar>

            {servicesLoading ? (
              <LoadingState label="Loading services..." />
            ) : !selectedUser || !selectedService ? (
              <EmptyState
                icon={<CategoryOutlinedIcon />}
                title="Pick a user and a service"
                description="Choose an API user and one of the routable services to see and edit its vendor routing."
              />
            ) : (
              <Stack spacing={0}>
                <VendorConfigContainer
                  key={`${selectedUser._id}-${selectedService._id}`}
                  userId={selectedUser._id}
                  service={selectedService}
                />
              </Stack>
            )}
          </>
        )}
      </Box>
    </>
  );
}
