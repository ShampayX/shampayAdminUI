import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
// @mui
import {
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  TextField,
  Grid,
  Typography,
  Button,
  Select,
  MenuItem,
  Switch,
} from "@mui/material";
import Scrollbar from "../../../components/scrollbar";
import { TableHeadCustom } from "../../../components/table";

import { useSnackbar } from "../../../components/snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuthContext } from "src/auth/useAuthContext";
type RowProps = {
  _id: string;
  agentCommissionType: string;
  agentCommission: string;
  distributorCommissionType: string;
  distributorCommission: string;
  masterDistributorCommissionType: string;
  masterDistributorCommission: string;
  minSlab: string;
  maxSlab: string;
  apiuser: string;
};

interface Props extends CardProps {
  tableData: RowProps[];
  schType: string;
  handleChange: any;
  setData: boolean;
  isEdit: boolean;
}
let updated_Content: any = [];
export default function EditBillPaymentstable({
  tableData,
  schType,
  setData,
  handleChange,
  isEdit,
  ...other
}: Props) {
  const { Api } = useAuthContext();
  const tableLabels = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "agentCommissionType", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
    { id: "distributorCommissionType", label: "Distributor Commission Type" },
    { id: "dis", label: "Distributor Commission" },
    {
      id: "masterdistributorCommissionType",
      label: " Master Distributor Commission Type",
    },
    { id: "mdis", label: "Master Distributor Commission" },
  ];
  const tableLabels1 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "agentCommissionType", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
  ];

  const [edit, setEdit] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    updated_Content = tableData;
  }, [tableData]);

  function editFun() {
    if (!edit) {
      setEdit(true);
    } else if (edit) {
      const body = {
        categoryId: localStorage.getItem("cateId"),
        mainSchemeId: localStorage.getItem("schId"),
        subcategoryId: updated_Content[0].subcategoryId,
        commissionSetting: updated_Content,
      };
      const token = localStorage.getItem("token");
      Api(`scheme/edit_subscheme`, "POST", body, token).then(
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

  return (
    <Grid {...other}>
      {/* {tableData.length ? ( */}
      <Stack m={1}>
        <Button
          variant="contained"
          style={{ alignSelf: "flex-end" }}
          onClick={() => editFun()}
        >
          {edit ? "save" : "edit"}
        </Button>
      </Stack>
      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }} size="small">
            <TableHeadCustom
              headLabel={schType != "directagent" ? tableLabels : tableLabels1}
            />

            <TableBody sx={{ overflow: "auto" }}>
              {tableData.map((row: any) => (
                <ProductRow
                  key={row._id}
                  row={row}
                  sType={schType}
                  setData={setData}
                  isEdit={edit}
                  handleChange={handleChange}
                />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      {/* ) : (
        <Stack justifyContent={'center'} alignItems={'center'} width={'100vw'} height={'70vh'}>
          <CircularProgress color="success" />
        </Stack>
      )} */}
    </Grid>
  );
}
type ProductRowProps = {
  row: RowProps;
  setData: boolean;
  isEdit: boolean;
  sType: string;
  handleChange: any;
};
// sd

function ProductRow({ row, setData, sType, isEdit }: ProductRowProps) {
  function handleChange(row: any, mdist: any, key: any) {
    for (let i = 0; i < updated_Content.length; i++) {
      if (updated_Content[i].productId == row.productId) {
        updated_Content[i][key] = mdist.target.value;
      }
    }
  }

  return (
    <>
      <TableRow>
        <TableCell>Rs. {row?.minSlab}</TableCell>
        <TableCell>Rs. {row?.maxSlab}</TableCell>

        {sType == "neonetwork" && (
          <>
            <TableCell>
              {isEdit ? (
                <Select
                  fullWidth
                  name="agentCommissionType"
                  label="Agent Commission Type"
                  size="small"
                  placeholder="Commission Type"
                  defaultValue={row.agentCommissionType}
                  // onChange={(e) => setEntry({ ...entry, agentCommissionType: e.target.value })}
                  onChange={(mdist) =>
                    handleChange(row, mdist, "agentCommissionType")
                  }
                >
                  <MenuItem value="flat">Rs.</MenuItem>
                  <MenuItem value="percentage">%</MenuItem>
                </Select>
              ) : (
                <span>
                  {row.agentCommissionType == "flat"
                    ? "Rs."
                    : row.agentCommissionType == "percentage"
                    ? "%"
                    : "-"}
                </span>
              )}
            </TableCell>
            <TableCell>
              {isEdit ? (
                <TextField
                  label="Agent Commission"
                  size="small"
                  defaultValue={row.agentCommission}
                  onChange={(agent) =>
                    handleChange(row, agent, "agentCommission")
                  }
                />
              ) : (
                <Typography>{row.agentCommission}</Typography>
              )}
            </TableCell>
            <TableCell>
              {isEdit ? (
                <Select
                  fullWidth
                  name="distributorCommissionType"
                  label="Distributor Commission Type"
                  size="small"
                  placeholder="Commission Type"
                  defaultValue={row.distributorCommissionType}
                  // onChange={(e) => setEntry({ ...entry, distributorCommissionType: e.target.value })}
                  onChange={(mdist) =>
                    handleChange(row, mdist, "distributorCommissionType")
                  }
                >
                  <MenuItem value="flat">Rs.</MenuItem>
                  <MenuItem value="percentage">%</MenuItem>
                </Select>
              ) : (
                <span>
                  {row.distributorCommissionType == "flat"
                    ? "Rs."
                    : row.distributorCommissionType == "percentage"
                    ? "%"
                    : "-"}
                </span>
              )}
            </TableCell>

            <TableCell>
              {isEdit ? (
                <TextField
                  label="Distributor"
                  size="small"
                  defaultValue={row.distributorCommission}
                  onChange={(dist) =>
                    handleChange(row, dist, "distributorCommission")
                  }
                />
              ) : (
                <Typography>{row.distributorCommission}</Typography>
              )}
            </TableCell>
            <TableCell>
              {isEdit ? (
                <Select
                  fullWidth
                  name="masterDistributorCommissionType"
                  label="Master Distributor Commission Type"
                  size="small"
                  placeholder="Commission Type"
                  defaultValue={row.masterDistributorCommissionType}
                  // onChange={(e) => setEntry({ ...entry, masterDistributorCommissionType: e.target.value })}
                  onChange={(mdist) =>
                    handleChange(row, mdist, "masterDistributorCommissionType")
                  }
                >
                  <MenuItem value="flat">Rs.</MenuItem>
                  <MenuItem value="percentage">%</MenuItem>
                </Select>
              ) : (
                <span>
                  {row.masterDistributorCommissionType == "flat"
                    ? "Rs."
                    : row.masterDistributorCommissionType == "percentage"
                    ? "%"
                    : "-"}
                </span>
              )}
            </TableCell>
            <TableCell>
              {isEdit ? (
                <TextField
                  label="Master Distributor"
                  size="small"
                  defaultValue={row.masterDistributorCommission}
                  onChange={(mdist) =>
                    handleChange(row, mdist, "masterDistributorCommission")
                  }
                />
              ) : (
                <Typography>{row.masterDistributorCommission}</Typography>
              )}
            </TableCell>
          </>
        )}

        {sType == "directagent" && (
          <>
            <TableCell>
              {isEdit ? (
                <Select
                  fullWidth
                  name="agentCommissionType"
                  label="Agent Commission Type"
                  size="small"
                  placeholder="Commission Type"
                  defaultValue={row.agentCommissionType}
                  // onChange={(e) => setEntry({ ...entry, agentCommissionType: e.target.value })}
                  onChange={(mdist) =>
                    handleChange(row, mdist, "agentCommissionType")
                  }
                >
                  <MenuItem value="flat">Rs.</MenuItem>
                  <MenuItem value="percentage">%</MenuItem>
                </Select>
              ) : (
                <span>
                  {row.agentCommissionType == "flat"
                    ? "Rs."
                    : row.agentCommissionType == "percentage"
                    ? "%"
                    : "-"}
                </span>
              )}
            </TableCell>
            <TableCell>
              {isEdit ? (
                <TextField
                  label="Agent Commission"
                  size="small"
                  defaultValue={row.apiuser !== "0" ? row.apiuser : null}
                  onChange={(agent) =>
                    handleChange(row, agent, "agentCommission")
                  }
                />
              ) : (
                <Typography>{row.agentCommission}</Typography>
              )}
            </TableCell>
          </>
        )}
        {sType == "apiuser" && (
          <TableCell>
            {isEdit ? (
              <TextField
                label="Agent Commission"
                size="small"
                defaultValue={
                  row.distributorCommission !== "0"
                    ? row.distributorCommission
                    : null
                }
                onChange={(agent) => handleChange(row, agent, "apiuser")}
              />
            ) : (
              <Typography>{row.apiuser}</Typography>
            )}
          </TableCell>
        )}

        {/* <TableCell>
            <AntSwitch
              inputProps={{ 'aria-label': 'ant design' }}
              sx={{ width: '30px', marginTop: '5px' }}
              onChange={(tds) => handleChange(row, tds, 'TDS')}
            />
          </TableCell>

          <TableCell>
            <AntSwitch
              inputProps={{ 'aria-label': 'ant design' }}
              sx={{ width: '30px', marginTop: '5px' }}
              onChange={(gst) => handleChange(row, gst, 'GST')}
            />
          </TableCell> */}
      </TableRow>
    </>
  );
}
