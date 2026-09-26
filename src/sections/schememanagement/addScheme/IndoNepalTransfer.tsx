// @mui
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  Button,
  TextField,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAuthContext } from "src/auth/useAuthContext";
import { notifyResult } from "src/utils/apiResult";

// ----------------------------------------------------------------------
type RowProps = {
  agentCommission: any;
  masterDistributorCommission: any;
  distributorCommission: any;
  transaction_amount: any;
  net_payout: any;
};

interface Props extends CardProps {
  tableData: RowProps[];
}
let updated_Content: any = [];
export default function IndoNepalTransfer({ tableData }: Props) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [tabWise, setTabWise] = useState([]);
  const tableLabels = [
    { id: "transactionAmount", label: "Transaction Amount" },
    { id: "netpayout", label: "Net Payout" },
    { id: "mdis", label: "Master Distributor" },
    { id: "dis", label: "Distributor" },
    { id: "Agcommission", label: "Agent Commission" },
  ];
  const tableLabels1 = [
    { id: "transactionAmount", label: "Transaction Amount" },
    { id: "netpayout", label: "Net Payout" },
    { id: "Agcommission", label: "Agent Commission" },
  ];
  useEffect(() => {
    let filterTable: any = tableData.filter((item: any) => {
      return item.category == "";
    });
    setTabWise(filterTable);
    updated_Content = filterTable;
  }, []);

  const create_subscheme = () => {
    const body = {
      categoryId: localStorage.getItem("cateId"),
      mainSchemeId: localStorage.getItem("schId"),
      commissionSetting: updated_Content,
    };
    Api(`scheme/create_subscheme`, "POST", body, "").then((Response: any) => {
      // Item 1b/1c: every response body is `{ code, message }` now, so
      // `responseCode` is never set - this success branch could not fire and a
      // failed save was toasted exactly like a successful one.
      notifyResult(enqueueSnackbar, Response, "Sub-scheme created.");
    });
  };

  return (
    <Card>
      <Stack m={1}>
        <Button
          variant="contained"
          style={{ alignSelf: "flex-end" }}
          onClick={() => create_subscheme()}
        >
          <Icon
            icon="material-symbols:save"
            color="white"
            style={{ fontSize: 30, marginRight: 5 }}
          />{" "}
          save Indo Nepal scheme
        </Button>
      </Stack>
      <TableContainer>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }} size="small">
            <TableHeadCustom
              headLabel={
                "directagent" != "directagent" ? tableLabels : tableLabels1
              }
            />

            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row: any) => (
                <ProductRow key={row._id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <div style={{ justifyContent: "center", alignItems: "center" }}></div>
    </Card>
  );
}

type ProductRowProps = {
  row: RowProps;
};
// sd
function ProductRow({ row }: ProductRowProps) {
  const [sType, setSType] = useState(localStorage.getItem("schtype"));
  function handleChange(row: any, mdist: any, key: any) {
    for (let i = 0; i < updated_Content.length; i++) {
      if (updated_Content[i].slotId == row.slotId) {
        updated_Content[i][key] = mdist.target.value;
      }
    }
  }

  return (
    <TableRow>
      <TableCell>Rs.{row.transaction_amount}</TableCell>
      <TableCell>Rs.{row.net_payout}</TableCell>

      {sType == "neonetwork" ? (
        <TableCell>
          <TextField
            label="Master Distributor"
            onChange={(mdist) =>
              handleChange(row, mdist, "masterDistributorCommission")
            }
          />
        </TableCell>
      ) : null}
      {sType == "neonetwork" ? (
        <TableCell>
          <TextField
            label="Distributor"
            onChange={(dist) =>
              handleChange(row, dist, "distributorCommission")
            }
          />
        </TableCell>
      ) : null}

      <TableCell>
        <TextField
          label="Agent Commission"
          onChange={(agent) => handleChange(row, agent, "agentCommission")}
        />
      </TableCell>
    </TableRow>
  );
}
