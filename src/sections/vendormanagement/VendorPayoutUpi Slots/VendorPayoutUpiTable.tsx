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
import { TableHeadCustom } from "../../../components/table";
import * as Yup from "yup";

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

export default function VendorPayoutUpiDataTable({
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
  const FilterSchema = Yup.object().shape({
    category: Yup.string(),
    subcategory: Yup.string(),
    productName: Yup.string(),
  });
  type FormValuesProps = {
    subcategory: string;
    productName: string;
  };

  return (
    <TableRow>
      <TableCell>Slot.{index + 1}</TableCell>
      <TableCell>Rs.{row.minSlab}</TableCell>
      <TableCell>Rs.{row.maxSlab}</TableCell>
      {/* <TableCell>Rs.{row.max}</TableCell> */}
    </TableRow>
  );
}
