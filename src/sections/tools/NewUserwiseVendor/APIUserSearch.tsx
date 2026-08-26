import { useEffect, useState } from "react";
import {
  Stack,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";

interface Props {
  onUserSelect: (userId: string) => void;
}

interface APIUser {
  _id: string;
  name: string;
  mobile?: string;
  email?: string;
  company_name?: string;
}

export default function APIUserSearch({ onUserSelect }: Props) {
  const { Api } = useAuthContext();
  const [searchInput, setSearchInput] = useState("");
  const [options, setOptions] = useState<APIUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<APIUser | null>(null);

  // Debounce search
  useEffect(() => {
    // Only search if input is 3 or more characters
    if (searchInput.length < 3) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(searchInput);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  const searchUsers = async (search: string) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await Api(
        `/admin/API_User_Management/list_API_users_by_search?searchInput=${search}&role=API_User`,
        "GET",
        "",
        token
      );

      if (res?.status === 200 && res.data.data) {
        setOptions(res.data.data || []);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setOptions([]);
    }

    setLoading(false);
  };

  const handleUserSelect = (user: APIUser | null) => {
    setSelectedUser(user);
    if (user) {
      onUserSelect(user._id);
    }
  };

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={selectedUser}
      onChange={(_, newValue) => handleUserSelect(newValue)}
      inputValue={searchInput}
      onInputChange={(_, newInputValue) => setSearchInput(newInputValue)}
      getOptionLabel={(option) => option.name || ""}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      noOptionsText={
        searchInput.length < 3
          ? "Type at least 3 characters to search"
          : "No users found"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search API User"
          placeholder="Type at least 3 characters..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <Stack>
            <strong>{option.name}</strong>
            {option.mobile && <small>{option.mobile}</small>}
            {option.email && <small>{option.email}</small>}
            {option.company_name && <small>{option.company_name}</small>}
          </Stack>
        </li>
      )}
    />
  );
}
