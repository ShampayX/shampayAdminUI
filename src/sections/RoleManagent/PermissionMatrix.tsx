// @mui
import {
  Box,
  Table,
  Paper,
  Stack,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

// ----------------------------------------------------------------------
// Module x action grid, shared by the "add user" form and the profile view.
//
// The axes are the real ones the backend understands: module codes from
// `adminUserData.modules` (or the full set for a root admin) crossed with the
// four actions `create-admin-user` accepts. Nothing here is decorative - an
// unchecked box means the permission is absent from the payload.
// ----------------------------------------------------------------------

/** Actions the API stores against a module. */
export const PERMISSION_ACTIONS = ["VIEW", "CREATE", "UPDATE", "DELETE"];

export type ModulePermission = {
  code: string;
  permissions: string[];
};

/** Human label for a module code, falling back to the code itself. */
export const MODULE_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  FINANCE: "Finance",
  RECONCILIATION: "Reconciliation",
};

export const moduleLabel = (code: string) => MODULE_LABELS[code] || code;

export const permissionsFor = (
  modules: ModulePermission[],
  code: string
): string[] => modules.find((m) => m.code === code)?.permissions || [];

// ----------------------------------------------------------------------

type Props = {
  /** Module codes to show as rows. */
  modules: string[];
  /** Currently granted permissions. */
  value: ModulePermission[];
  /**
   * Read-only renders ticks instead of checkboxes. Used in the profile view
   * because the backend has no endpoint to change an existing user's modules.
   */
  readOnly?: boolean;
  /** Modules the row checkboxes are enabled for (editable mode only). */
  enabledModules?: string[];
  onToggleModule?: (code: string) => void;
  onTogglePermission?: (code: string, action: string) => void;
  onToggleAll?: () => void;
  error?: boolean;
  emptyMessage?: string;
};

export default function PermissionMatrix({
  modules,
  value,
  readOnly,
  enabledModules,
  onToggleModule,
  onTogglePermission,
  onToggleAll,
  error,
  emptyMessage = "No modules available.",
}: Props) {
  const theme = useTheme();

  const allSelected =
    modules.length > 0 && (enabledModules?.length || 0) === modules.length;
  const someSelected =
    (enabledModules?.length || 0) > 0 && !allSelected;

  if (modules.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          textAlign: "center",
          borderRadius: 1.5,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${
          error ? theme.palette.error.main : theme.palette.divider
        }`,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#F4F6FA"
                  : alpha(theme.palette.common.white, 0.06),
            }}
          >
            <TableCell
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.7,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {!readOnly && onToggleAll ? (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={onToggleAll}
                  />
                  <span>Module</span>
                </Stack>
              ) : (
                "Module"
              )}
            </TableCell>

            {PERMISSION_ACTIONS.map((action) => (
              <TableCell
                key={action}
                align="center"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                {action}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {modules.map((code) => {
            const granted = permissionsFor(value, code);
            const rowEnabled = readOnly
              ? true
              : (enabledModules || []).includes(code);

            return (
              <TableRow
                key={code}
                sx={{
                  backgroundColor:
                    !readOnly && rowEnabled
                      ? alpha(theme.palette.primary.main, 0.04)
                      : "transparent",
                }}
              >
                <TableCell sx={{ fontSize: 13.5, fontWeight: 600 }}>
                  {readOnly || !onToggleModule ? (
                    moduleLabel(code)
                  ) : (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Checkbox
                        size="small"
                        checked={rowEnabled}
                        onChange={() => onToggleModule(code)}
                      />
                      <span>{moduleLabel(code)}</span>
                    </Stack>
                  )}
                </TableCell>

                {PERMISSION_ACTIONS.map((action) => {
                  const active = granted.includes(action);

                  if (readOnly) {
                    return (
                      <TableCell key={action} align="center">
                        <Box
                          component="span"
                          sx={{
                            width: 26,
                            height: 26,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 0.75,
                            color: active
                              ? theme.palette.success.main
                              : theme.palette.text.disabled,
                            backgroundColor: alpha(
                              active
                                ? theme.palette.success.main
                                : theme.palette.grey[500],
                              0.12
                            ),
                          }}
                        >
                          {active ? (
                            <CheckRoundedIcon sx={{ fontSize: 17 }} />
                          ) : (
                            <RemoveRoundedIcon sx={{ fontSize: 17 }} />
                          )}
                        </Box>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={action} align="center" padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={active}
                        disabled={!rowEnabled}
                        onChange={() => onTogglePermission?.(code, action)}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
