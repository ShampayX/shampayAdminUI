
// @mui
import { Theme } from "@mui/material/styles";
import {
  Box,
  SxProps,
  Checkbox,
  TableRow,
  TableCell,
  TableHead,
  TableSortLabel,
  styled,
} from "@mui/material";

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: "1px",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
} as const;

// ----------------------------------------------------------------------

type Props = {
  order?: "asc" | "desc";
  orderBy?: string;
  headLabel: any[];
  rowCount?: number;
  numSelected?: number;
  onSort?: (id: string) => void;
  onSelectAllRows?: (checked: boolean) => void;
  sx?: SxProps<Theme>;
};

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
}: Props) {
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
      fontWeight: 600,
      fontSize: 14,
      backgroundColor: theme.palette.grey[400],
      color: theme.palette.common.black,
      padding: 8,
    },
  }));

  return (
    <TableHead sx={sx}>
      <StyledTableRow>
        {/* {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected == rowCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSelectAllRows(event.target.checked)
              }
            />
          </TableCell>
        )} */}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || "left"}
            sortDirection={orderBy == headCell.id ? order : false}
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 120, 
              width: headCell.width,
              minWidth: headCell.minWidth,
            }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy == headCell.id}
                direction={orderBy == headCell.id ? order : "asc"}
                onClick={() => onSort(headCell.id)}
                sx={{ textTransform: "capitalize" }}
              >
                {headCell.label}

                {orderBy == headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order == "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
}

