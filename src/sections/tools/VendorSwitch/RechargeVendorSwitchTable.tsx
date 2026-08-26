// @mui
import {
  TableCell,
  CardProps,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
} from "@mui/material";
// utils

import { useSnackbar } from "../../../components/snackbar";

import { useState } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  DataTable,
  KitRow,
  FilterBar,
  SearchField,
  StackedCell,
  PageActionButton,
  PageGhostButton,
  useDataTable,
} from "src/components/page-kit";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
// ----------------------------------------------------------------------

type RowProps = {
  _id: string;
  productId: string;
  productName: string;
  subcategoryName: string;
  vendors: string;
  apiUserVendor: string;
  directAgentVendor: string;
  neoNetworkVendor: string;
  operatorid: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: any;
  tableLabels: any;
}
export default function RechargeVendorSwitchTable({
  title,
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  /* instant search + paging, all client-side */
  const table = useDataTable<any>(tableData, {
    searchKeys: [
      "productId.productName",
      "productId.subcategoryName",
      "productId.operatorid",
    ],
    storageKey: "recharge-vendor-switch",
  });

  return (
    <>
      <FilterBar>
        <SearchField
          value={table.query}
          onChange={table.setQuery}
          placeholder="Search product, sub-category or operator id"
          count={table.total}
          total={table.grandTotal}
        />
      </FilterBar>

      <DataTable
        columns={tableLabels}
        isEmpty={table.isEmpty}
        emptyMessage={
          table.isFiltered
            ? `No products match "${table.query}".`
            : "No products configured for this category."
        }
        minWidth={1100}
        footer={
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={table.total}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={(event, newPage) => table.setPage(newPage)}
            onRowsPerPageChange={(event) =>
              table.changeRowsPerPage(parseInt(event.target.value, 10))
            }
          />
        }
      >
        {table.paged.map((row: any) => (
          <VendorRow key={row.id} row={row.productId} vendor={row.vendors} />
        ))}
      </DataTable>
    </>
  );
}

// ----------------------------------------------------------------------

type VendorRowProps = {
  row: RowProps;
  vendor: any;
};
// sd
function VendorRow({ row, vendor }: VendorRowProps) {
  var updatedVendor: any = [...vendor];
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [editTrue, setEditTrue] = useState(false);
  const [apiVendor, setApiVendor] = useState(row.apiUserVendor);
  const [distribution, setDistribution] = useState(row.neoNetworkVendor);
  const [directAgent, setDirectAgent] = useState(row.directAgentVendor);
  const [distId, setDistId] = useState("");
  const [apiId, setApiId] = useState("");
  const [directAgId, setDirectAgId] = useState("");

  const saveTab = (val: any, product: any) => {
    let token = localStorage.getItem("token");

    var arr: any = [];
    updatedVendor.map((item: any) => {
      let obj: any = {
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        shortCode: item.shortCode,
        services: item.services,
        commission: item.commission,
      };
      arr.push(obj);
    });

    let body = {
      apiUserVendor: apiId ? apiId : row.apiUserVendor,
      neoNetworkVendor: distId ? distId : row.neoNetworkVendor,
      directAgentVendor: directAgId ? directAgId : row.directAgentVendor,
      vendors: vendor,
    };
    Api(
      `admin/rechargeControl/rechargeController/${product._id}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.data.res == 200) {
        enqueueSnackbar(Response.data.message);
        setEditTrue(false);
      } else {
      }
    });
  };

  // function handleChange(row: any, mdist: any, key: any) {
  //   for (let i = 0; i < updated_Content.length; i++) {
  //     if (updated_Content[i]._id == row._id) {
  //       updated_Content[i][key] = mdist.target.value;
  //
  //     }
  //   }
  // }

  function handleChange(row: any, e: any, key: any, i: any) {
    row[key] = e.target.value;
    updatedVendor[i][key] = e.target.value;
    updatedVendor.splice(i, 1, row);
  }

  return (
    <KitRow>
      {/* Action first, matching the reports convention */}
      <TableCell>
        {editTrue == false ? (
          <PageGhostButton
            startIcon={<EditIcon />}
            onClick={() => setEditTrue(!editTrue)}
          >
            Edit
          </PageGhostButton>
        ) : (
          <PageActionButton
            startIcon={<SaveIcon />}
            onClick={() => saveTab(vendor, row)}
          >
            Save
          </PageActionButton>
        )}
      </TableCell>
      <TableCell>
        <StackedCell
          primary={row.productName}
          secondary={row.subcategoryName}
          bold
        />
      </TableCell>
      <TableCell>{row.operatorid}</TableCell>
      {vendor.map((item: any, index: number) => {
        return (
          item.services.toLowerCase() == "yes" && (
            <TableCell key={item._id}>
              {editTrue ? (
                <TextField
                  id="outlined-basic"
                  size="small"
                  label={item.shortCode}
                  defaultValue={item.shortCode}
                  variant="outlined"
                  sx={{ width: 110 }}
                  onChange={(e) => handleChange(item, e, "shortCode", index)}
                  // onChange={(e) => {
                  //   item.shortCode = e.target.value;
                  // }}
                />
              ) : (
                <Typography sx={{ fontSize: 13.5 }}>{item.shortCode}</Typography>
              )}
            </TableCell>
          )
        );
      })}
      <TableCell>
        {editTrue ? (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel htmlFor="direct-Vendor">DirectAgent Vendor</InputLabel>
            <Select
              autoFocus
              value={directAgent == "" ? row.directAgentVendor : directAgent}
              onChange={(e) => setDirectAgent(e.target.value)}
              label="Direct Agent Vendor"
              inputProps={{
                name: "direct-Vendor",
                id: "direct-Vendor",
              }}
            >
              {vendor.map((item: any) => {
                return (
                  item.services.toLowerCase() == "yes" && (
                    <MenuItem
                      key={item._id}
                      value={item.vendorId}
                      onClick={() => setDirectAgId(item.vendorId)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  )
                );
              })}
            </Select>
          </FormControl>
        ) : (
          vendor.map((item: any) => {
            if (item.vendorId == directAgent) {
              return (
                <Typography key={item.vendorId}> {item.vendorName}</Typography>
              );
            }
          })
        )}
      </TableCell>
      <TableCell>
        {editTrue ? (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel htmlFor="Neo-Vendor">Neo Vendor</InputLabel>
            <Select
              autoFocus
              value={distribution == "" ? row.neoNetworkVendor : distribution}
              onChange={(e) => setDistribution(e.target.value)}
              label="Neo Vendor"
              inputProps={{
                name: "Neo-Vendor",
                id: "Neo-Vendor",
              }}
            >
              {vendor.map((item: any) => {
                return (
                  item.services.toLowerCase() == "yes" && (
                    <MenuItem
                      key={item._id}
                      value={item.vendorId}
                      onClick={() => setDistId(item.vendorId)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  )
                );
              })}
            </Select>
          </FormControl>
        ) : (
          vendor.map((item: any) => {
            if (item.vendorId == distribution) {
              return (
                <Typography key={item.vendorId}> {item.vendorName}</Typography>
              );
            }
          })
        )}
      </TableCell>
      <TableCell>
        {editTrue ? (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel htmlFor="api-Vendor">API Vendor</InputLabel>
            <Select
              autoFocus
              value={apiVendor == "" ? row.apiUserVendor : apiVendor}
              onChange={(e) => setApiVendor(e.target.value)}
              label="API Vendor"
              inputProps={{
                name: "api-Vendor",
                id: "api-Vendor",
              }}
            >
              {vendor.map((item: any) => {
                return (
                  item.services.toLowerCase() == "yes" && (
                    <MenuItem
                      key={item._id}
                      value={item.vendorId}
                      onClick={() => setApiId(item.vendorId)}
                    >
                      {item.vendorName}
                    </MenuItem>
                  )
                );
              })}
            </Select>
          </FormControl>
        ) : (
          vendor.map((item: any) => {
            if (item.vendorId == apiVendor) {
              return (
                <Typography key={item.vendorId}> {item.vendorName}</Typography>
              );
            }
          })
        )}
      </TableCell>
    </KitRow>
  );
}
