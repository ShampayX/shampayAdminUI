// @mui
import { Chip, Stack, TableCell, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// utils
import { fDateTime } from "src/utils/formatTime";
// page kit
import {
  KitRow,
  StackedCell,
  CopyText,
  PageGhostButton,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// One loan plan.
//
// `admin/loan/get_loan_scheme` returns only schemeId, schemeType,
// schemeDescription and createdAt - there is no status, interest rate or tenure
// on the payload, so none of those columns exist. Editing the description is
// the only mutation the API supports (`scheme/edit_scheme/:id`).
// ----------------------------------------------------------------------

export type LoanSchemeRowProps = {
  _id: string;
  schemeId: string;
  schemeType: string;
  schemeDescription: string;
  createdAt: string;
  role?: string;
};

export default function LoanSchemeRow({
  row,
  onEdit,
}: {
  row: LoanSchemeRowProps;
  onEdit: (row: LoanSchemeRowProps) => void;
}) {
  return (
    <KitRow>
      <TableCell>
        <CopyText value={row.schemeId}>
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 700, fontFamily: "monospace" }}
          >
            {row.schemeId || "-"}
          </Typography>
        </CopyText>
      </TableCell>

      <TableCell>
        {row.schemeType ? (
          <Chip
            size="small"
            variant="outlined"
            label={row.schemeType}
            sx={{ fontSize: 11, fontWeight: 600 }}
          />
        ) : (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>-</Typography>
        )}
      </TableCell>

      <TableCell sx={{ maxWidth: 380 }}>
        <Typography sx={{ fontSize: 13.5 }}>
          {row.schemeDescription || "—"}
        </Typography>
      </TableCell>

      <TableCell>
        <StackedCell
          primary={fDateTime(row.createdAt)}
          secondary={new Date(row.createdAt).toLocaleTimeString()}
        />
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <PageGhostButton
            startIcon={<EditOutlinedIcon />}
            onClick={() => onEdit(row)}
          >
            Edit
          </PageGhostButton>
        </Stack>
      </TableCell>
    </KitRow>
  );
}
