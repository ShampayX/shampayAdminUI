// @mui
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom, TableNoData } from "../../../components/table";

type RowProps = {
  ccf: string;
  commision: string;
  gst: string;
  net_payout: string;
  minSlab: string;
  maxSlab: string;
  _id: any;
  tds: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: any;
  tableLabels: any;
}

export default function VendorPaymentDataTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row: any, index: number) => (
                <VendorRow key={row._id} row={row} index={index} />
              ))}
            </TableBody>
            <TableNoData isNotFound={!tableData.length} />
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type VendorRowProps = {
  row: RowProps;
  index: number;
};
// sd
function VendorRow({ row, index }: VendorRowProps) {
  return (
    <TableRow>
      <TableCell>Slot.{index + 1}</TableCell>
      <TableCell>Rs.{row.minSlab}</TableCell>
      <TableCell>Rs.{row.maxSlab}</TableCell>
    </TableRow>
  );
}
