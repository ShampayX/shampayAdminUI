// @mui
import { Box, Chip, Stack, TableCell, Typography } from "@mui/material";
// utils
import { fDateTime } from "src/utils/formatTime";
import { CustomAvatar } from "src/components/custom-avatar";
// page kit
import { KitRow, StackedCell, CopyText } from "src/components/page-kit";

// ----------------------------------------------------------------------
// One account -> loan plan mapping.
//
// `admin/loan/mapped_user_scheme` returns the account (name, role, userCode)
// and the plan it holds. There is no status flag and no mapping timestamp on
// the payload - `loanScheme.createdAt` is when the PLAN was created, not when
// it was mapped, so it is labelled that way rather than as "Updated".
//
// `admin/loan/map_scheme` only creates; there is no update or unmap endpoint,
// so rows carry no actions.
// ----------------------------------------------------------------------

export type LoanMappingRow = {
  _id: string;
  userCode: string;
  role: string;
  firstName: string;
  lastName: string;
  selfie: [string];
  loanSchemeId: string;
  loanScheme: {
    _id: string;
    schemeId: string;
    schemeDescription: string;
    schemeType: string;
    createdAt: string;
  };
};

export const ROLE_LABELS: Record<string, string> = {
  agent: "Agent",
  distributor: "Distributor",
  m_distributor: "Master Distributor",
  directagent: "Direct Agent",
};

export const roleLabel = (role: string) => ROLE_LABELS[role] || "API User";

export default function MapLoanSchemeRow({ row }: { row: LoanMappingRow }) {
  return (
    <KitRow>
      {/* Entity */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CustomAvatar
            name={row.firstName}
            alt={row.firstName}
            src={row.selfie?.[0] || ""}
            sx={{ width: 34, height: 34 }}
          />
          <StackedCell
            bold
            primary={`${row.firstName || ""} ${row.lastName || ""}`.trim() || "—"}
            secondary={row.userCode || undefined}
          />
        </Stack>
      </TableCell>

      {/* Entity type */}
      <TableCell>
        <Chip
          size="small"
          variant="outlined"
          label={roleLabel(row.role)}
          sx={{ fontSize: 11, fontWeight: 600 }}
        />
      </TableCell>

      {/* Assigned plan */}
      <TableCell>
        <CopyText value={row.loanScheme?.schemeId}>
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 700, fontFamily: "monospace" }}
          >
            {row.loanScheme?.schemeId || "-"}
          </Typography>
        </CopyText>
        {row.loanScheme?.schemeDescription && (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            {row.loanScheme.schemeDescription}
          </Typography>
        )}
      </TableCell>

      {/* Plan type */}
      <TableCell>
        {row.loanScheme?.schemeType ? (
          <Typography sx={{ fontSize: 13 }}>
            {row.loanScheme.schemeType}
          </Typography>
        ) : (
          <Box component="span" sx={{ fontSize: 13, color: "text.disabled" }}>
            -
          </Box>
        )}
      </TableCell>

      {/* When the plan itself was created */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: 13 }}>
          {row.loanScheme?.createdAt ? fDateTime(row.loanScheme.createdAt) : "-"}
        </Typography>
      </TableCell>
    </KitRow>
  );
}
