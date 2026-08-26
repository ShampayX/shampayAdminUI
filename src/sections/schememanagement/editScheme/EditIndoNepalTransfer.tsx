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
// components
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";
import { useSnackbar } from "../../../components/snackbar";
import { useState, useEffect } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type RowProps = {
  ccf: string;
  commision: string;
  gst: string;
  net_payout: string;
  provider_charge: string;
  transaction_amount: string;
  _id: any;
};

interface Props extends CardProps {
  tableData: RowProps[];
  schType: any;
  rowId: any;
  cateId: any;
}
let updatedData: any = [];

export default function EditIndoNepalTransfer({
  tableData,
  schType,
  rowId,
  cateId,
  ...other
}: Props) {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [edit, setEdit] = useState(false);

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
    updatedData = tableData;
  }, []);

  function editFun() {
    if (edit == false) {
      setEdit(true);
    } else if (edit == true) {
      let id = localStorage.getItem("schId");

      const body = {
        categoryId: cateId,
        mainSchemeId: rowId,
        commissionSetting: updatedData,
      };
      let token = localStorage.getItem("token");
      Api(`scheme/edit_subscheme/`, "POST", body, token).then(
        (Response: any) => {
          if (Response?.status == 200) {
            if (Response.data.code == 200) {
              setEdit(false);
              enqueueSnackbar("Scheme update Successfull !");
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    }
  }

  function handleChange(row: any, mdist: any, key: any, i: any) {
    row[key] = mdist.target.value;
    updatedData.splice(i, 1, row);
  }

  return (
    <Card {...other}>
      <Stack style={{ width: "98%", padding: 10 }}>
        <Button
          variant="contained"
          style={{ alignSelf: "flex-end" }}
          onClick={() => editFun()}
        >
          {edit == false ? "edit" : "save"}
        </Button>
      </Stack>
      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }} size="small">
            <TableHeadCustom
              headLabel={schType != "directagent" ? tableLabels : tableLabels1}
            />

            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row: any, index: any) => (
                <TableRow key={row.id}>
                  <TableCell>Rs.{row.transaction_amount}</TableCell>
                  <TableCell>Rs.{row.net_payout}</TableCell>
                  {schType != "directagent" ? (
                    <TableCell>
                      {edit == true ? (
                        <TextField
                          type="number"
                          inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                          name="masterDistributorCommission"
                          placeholder={row.masterDistributorCommission}
                          onChange={(mdist) =>
                            handleChange(
                              row,
                              mdist,
                              "masterDistributorCommission",
                              index
                            )
                          }
                        />
                      ) : (
                        <span>{row.masterDistributorCommission}</span>
                      )}
                    </TableCell>
                  ) : null}

                  {schType != "directagent" ? (
                    <TableCell>
                      {edit == true ? (
                        <TextField
                          type="number"
                          inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                          placeholder={row.distributorCommission}
                          onChange={(dist) =>
                            handleChange(
                              row,
                              dist,
                              "distributorCommission",
                              index
                            )
                          }
                        />
                      ) : (
                        <span>{row.distributorCommission}</span>
                      )}
                    </TableCell>
                  ) : null}

                  <TableCell>
                    {edit == true ? (
                      <TextField
                        name="agentCommission"
                        type="number"
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        placeholder={row.agentCommission}
                        onChange={(agent) =>
                          handleChange(row, agent, "agentCommission", index)
                        }
                      />
                    ) : (
                      <span>{row.agentCommission}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <div style={{ justifyContent: "center", alignItems: "center" }}></div>
    </Card>
  );
}
