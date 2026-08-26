import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  Typography,
} from "@mui/material";
import { TableHeadCustom } from "../../../components/table";

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: any;
  tableLabels: any;
}

export default function VendorPBPSDataTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <TableContainer sx={{ overflow: "unset" }}>
        {/* <Scrollbar> */}
        {tableData.length ? (
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />
            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row: any, index: number) => (
                <VendorRow key={row._id} row={row} index={index} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <NoData />
        )}
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type VendorRowProps = {
  row: any;
  index: number;
};
function VendorRow({ row, index }: VendorRowProps) {
  return (
    <TableRow>
      <TableCell>Slot.{index + 1}</TableCell>
      <TableCell>Rs.{row.minSlab}</TableCell>
      <TableCell>Rs.{row.maxSlab}</TableCell>
    </TableRow>
  );
}

function NoData() {
  return (
    <Typography variant="h6" textAlign={"center"} p={3}>
      Slots Not upload yet
    </Typography>
  );
}
