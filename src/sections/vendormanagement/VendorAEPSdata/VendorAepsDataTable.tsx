// @mui
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  Typography,
  TableContainer,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useEffect, useState } from "react";

interface Props extends CardProps {
  tableData: any;
  tableLabels: any;
  pData: any;
}

export default function VendorAepsDataTable({
  pData,
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
              {tableData.map((row: any) => (
                <VendorRow key={row._id} row={row} />
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
  row: any;
};
// sd
function VendorRow({ row }: VendorRowProps) {
  const [edit, setEdit] = useState(false);
  const [objRow, setObjRow] = useState(row || {});

  return (
    <TableRow hover>
      <TableCell>₹{objRow.minSlab}</TableCell>
      <TableCell>₹{objRow.maxSlab}</TableCell>
      <TableCell>₹{objRow.BankMaxPayout}</TableCell>
      <TableCell style={edit ? { padding: 0 } : {}}>
        {edit ? (
          <TextField
            size="small"
            sx={{ width: 100 }}
            value={objRow.GST}
            onChange={(e) =>
              setObjRow({
                ...objRow,
                GST: e.target.value,
              })
            }
          />
        ) : (
          <Typography> ₹{objRow.GST}</Typography>
        )}
      </TableCell>
      <TableCell style={edit ? { padding: 0 } : {}}>
        {edit ? (
          <TextField
            size="small"
            sx={{ width: 100 }}
            value={objRow.TDS}
            onChange={(e) =>
              setObjRow({
                ...objRow,
                TDS: e.target.value,
              })
            }
          />
        ) : (
          <Typography>
            {" "}
            {objRow.TDS && "₹"}
            {objRow.TDS}
          </Typography>
        )}
      </TableCell>
      <TableCell style={edit ? { padding: 0 } : {}}>
        {edit ? (
          <TextField
            size="small"
            sx={{ width: 100 }}
            value={objRow.AEPSVendorPayout}
            onChange={(e) =>
              setObjRow({
                ...objRow,
                AEPSVendorPayout: e.target.value,
              })
            }
          />
        ) : (
          <Typography>₹{objRow.AEPSVendorPayout}</Typography>
        )}
      </TableCell>
      <TableCell>
        {edit ? (
          <TextField
            size="small"
            sx={{ width: 100 }}
            value={objRow.OurNetPayout}
            onChange={(e) =>
              setObjRow({
                ...objRow,
                OurNetPayout: e.target.value,
              })
            }
          />
        ) : (
          <Typography>₹{objRow.OurNetPayout}</Typography>
        )}
      </TableCell>
      <TableCell>
        {edit ? (
          <Button variant="contained" onClick={() => setEdit(!edit)}>
            save
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setEdit(!edit)}>
            Edit
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
