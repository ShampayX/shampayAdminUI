import { ReactNode } from "react";
// @mui
import { Box, Stack, TextField, Typography, IconButton, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
//
import { FilterSlot } from "./PageChrome";
import { useSlashFocus } from "./useDataTable";
import { useSnackbar } from "../snackbar";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

// ----------------------------------------------------------------------

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Matches after filtering - rendered as a live count chip. */
  count?: number;
  /** Rows before filtering. */
  total?: number;
  minWidth?: number;
};

/**
 * Instant search box for the filter bar. Filters in memory as you type,
 * shows a live match count, clears with Esc or the X, focuses on "/".
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Search",
  count,
  total,
  minWidth = 260,
}: SearchFieldProps) {
  const theme = useTheme();
  const inputRef = useSlashFocus<HTMLInputElement>();

  const showCount = count != null && value.trim().length > 0;

  return (
    <FilterSlot icon={<SearchIcon />} grow minWidth={minWidth}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <TextField
          fullWidth
          inputRef={inputRef}
          variant="standard"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onChange("");
          }}
          InputProps={{ disableUnderline: true }}
        />

        {showCount && (
          <Typography
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 99,
              fontSize: 11.5,
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.grey[500], 0.14),
            }}
          >
            {count}
            {total != null ? ` / ${total}` : ""}
          </Typography>
        )}

        {value ? (
          <IconButton size="small" onClick={() => onChange("")} sx={{ p: 0.25 }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        ) : (
          <Tooltip title="Press / to search">
            <Box
              sx={{
                px: 0.75,
                borderRadius: 0.75,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: "18px",
                color: theme.palette.text.disabled,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              /
            </Box>
          </Tooltip>
        )}
      </Stack>
    </FilterSlot>
  );
}

// ----------------------------------------------------------------------

/** Text with a one-click copy button - use for IDs, codes, UTRs. */
export function CopyText({
  value,
  children,
  size = 15,
}: {
  value?: string | number;
  children?: ReactNode;
  size?: number;
}) {
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();

  if (value == null || value === "") return <>-</>;

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
      <Box sx={{ minWidth: 0 }}>{children ?? String(value)}</Box>
      <Tooltip title="Copy">
        <IconButton
          sx={{ p: 0.25 }}
          onClick={(event) => {
            event.stopPropagation();
            copy(String(value));
            enqueueSnackbar("Copied");
          }}
        >
          <ContentCopyIcon sx={{ fontSize: size }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
