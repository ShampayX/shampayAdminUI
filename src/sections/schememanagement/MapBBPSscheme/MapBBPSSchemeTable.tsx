// @mui
import { Box, Chip, Stack, TableCell, Typography } from "@mui/material";
// utils
import { fDateTime } from "src/utils/formatTime";
import { CustomAvatar } from "src/components/custom-avatar";
// page kit
import { KitRow, StackedCell, CopyText } from "src/components/page-kit";

// ----------------------------------------------------------------------
// One account -> bill payment plan mapping.
//
// `bbpsManagement/bbpsScheme/mapped_user_scheme` returns the account and the
// plan it holds. There is no status flag, no category and no mapping timestamp
// on the payload - `bbpsScheme.createdAt` is when the PLAN was created, so it is
// labelled that way. `map_scheme` only creates, so rows carry no actions.
// ----------------------------------------------------------------------

export type BbpsMappingRow = {
  _id: string;
  userCode: string;
  role: string;
  firstName: string;
  lastName: string;
  selfie: [string];
  bbpsSchemeId: string;
  bbpsScheme: {
    _id: string;
    schemeId: string;
    schemeDescription: string;
    schemeType: string;
    createdAt: string;
  };
  company_name: string;
};

/* Roles are { Admin, API_User }. Agent, distributor, master distributor and
   direct agent are gone, so a row can only be one of these two. */
const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
};

export const roleLabel = (role: string) => ROLE_LABELS[role] || "API User";

/** Plan audiences the BBPS scheme payload uses. `apiUser` is the only type the
    backend still accepts; legacy rows may carry the retired ones. */
const PLAN_TYPE_LABELS: Record<string, string> = {
  apiuser: "API User",
};

export const planTypeLabel = (type: string) =>
  PLAN_TYPE_LABELS[type] || type || "—";

export default function MapBBPSSchemeRow({ row }: { row: BbpsMappingRow }) {
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
            secondary={
              [row.userCode, row.company_name].filter(Boolean).join(" • ") ||
              undefined
            }
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
        <CopyText value={row.bbpsScheme?.schemeId}>
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 700, fontFamily: "monospace" }}
          >
            {row.bbpsScheme?.schemeId || "-"}
          </Typography>
        </CopyText>
      </TableCell>

      {/* Plan description */}
      <TableCell sx={{ maxWidth: 320 }}>
        <Typography sx={{ fontSize: 13 }}>
          {row.bbpsScheme?.schemeDescription || "—"}
        </Typography>
      </TableCell>

      {/* Plan audience */}
      <TableCell>
        {row.bbpsScheme?.schemeType ? (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={planTypeLabel(row.bbpsScheme.schemeType)}
            sx={{ fontSize: 10.5, fontWeight: 600 }}
          />
        ) : (
          <Box component="span" sx={{ fontSize: 13, color: "text.disabled" }}>
            -
          </Box>
        )}
      </TableCell>

      {/* When the plan itself was created */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: 13 }}>
          {row.bbpsScheme?.createdAt ? fDateTime(row.bbpsScheme.createdAt) : "-"}
        </Typography>
      </TableCell>
    </KitRow>
  );
}
