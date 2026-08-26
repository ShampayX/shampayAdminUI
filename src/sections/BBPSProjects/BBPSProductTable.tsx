import React, { useEffect, useState } from "react";
// @mui
import {
  Box,
  Tab,
  Stack,
  Button,
  TableCell,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "notistack";
// page kit
import {
  KitTabs,
  FilterBar,
  FilterSlot,
  DataTable,
  KitRow,
  EmptyState,
  TableSkeleton,
  PageGhostButton,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Bill Payments > Products.
//
// The old table put eight operator-id columns side by side - Shampay, Cyrus,
// Eko, Swift service, Swift operator, CardValley service, CardValley operator -
// so the useful part of a row (which provider is this product actually mapped
// to?) was spread across a 1400px horizontal scroll and impossible to scan.
//
// Two of those headers were also wrong: "Shampay Operator ID" appeared twice
// and the fourth column actually rendered the EKO id, while the last column was
// labelled "Status" but held the Edit button.
//
// The row is now Product / Shampay operator / Provider mappings / Action, with
// the provider mappings rendered as labelled pairs inside one cell - the same
// seven fields, grouped by what they mean instead of laid out flat. Editing
// swaps that cell for a small form grid.
//
// Data, endpoints and the save payload are unchanged.
// ----------------------------------------------------------------------

/** The provider id fields `product/editBbpsProductById` accepts. */
const PROVIDER_FIELDS: { key: string; label: string }[] = [
  { key: "cyrusOperatorId", label: "Cyrus operator" },
  { key: "ekoOperatorId", label: "Eko operator" },
  { key: "swiftServiceId", label: "Swift service" },
  { key: "swiftOperatorId", label: "Swift operator" },
  { key: "cardValleyServiceId", label: "CardValley service" },
  { key: "cardValleyOperatorId", label: "CardValley operator" },
];

const COLUMNS: {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
}[] = [
  { id: "product", label: "Product" },
  { id: "operator", label: "Shampay Operator" },
  { id: "mappings", label: "Provider Mappings" },
  { id: "action", label: "", align: "right" },
];

const PAGE_SIZES = [10, 25, 50, 100];

function BBPSProductTable() {
  const { Api } = useAuthContext();

  const [category, setCategory] = useState<any>();
  const [subcategory, setSubcategory] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [txnCount, setTxnCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  /* `product/bbpsProductList` already accepts a productName filter, so search
     is served by the API rather than by pulling every product down first. */
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Waits for a subcategory. The old version fired one request on mount with
     subCategory undefined and then another as soon as a tab was touched - the
     first response was always thrown away. */
  useEffect(() => {
    if (!subcategory) return;
    getBBPSproduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, subcategory, search]);

  const getCategory = () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    Api("category/get_CategoryList", "GET", "", token).then((Response: any) => {
      if (Response?.status === 200 && Response.data.code === 200) {
        const billPayment = Response.data.data.find(
          (entry: any) => entry.category_name === "BILL PAYMENT"
        );

        setCategory(billPayment);

        const first = billPayment?.sub_category?.[0]?._id;
        if (first) {
          setSubcategory(first);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  };

  const getBBPSproduct = () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const body = {
      pageInitData: { pageSize, currentPage },
      productName: search,
      subCategory: subcategory,
    };

    Api("product/bbpsProductList", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          setTableData(Response.data.data || []);
          setTxnCount(Response.data.totalCount || 0);
        } else {
          setTableData([]);
          setTxnCount(0);
        }
        setIsLoading(false);
      }
    );
  };

  const applySearch = () => {
    setCurrentPage(1);
    setSearch(searchDraft.trim());
  };

  const subCategories: any[] = category?.sub_category || [];

  return (
    <>
      {subCategories.length > 0 && (
        <KitTabs
          value={subcategory}
          onChange={(_, value) => {
            setCurrentPage(1);
            setSubcategory(value);
          }}
        >
          {subCategories.map((entry: any) => (
            <Tab
              key={entry._id}
              value={entry._id}
              label={entry.sub_category_name}
            />
          ))}
        </KitTabs>
      )}

      <FilterBar>
        <FilterSlot icon={<SearchOutlinedIcon />} grow minWidth={300}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search product name"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && applySearch()}
            InputProps={{ disableUnderline: true }}
          />
        </FilterSlot>

        <PageGhostButton onClick={applySearch}>Search</PageGhostButton>

        {search && (
          <PageGhostButton
            startIcon={<CloseOutlinedIcon />}
            onClick={() => {
              setSearchDraft("");
              setCurrentPage(1);
              setSearch("");
            }}
          >
            Clear
          </PageGhostButton>
        )}
      </FilterBar>

      {isLoading ? (
        <TableSkeleton columns={COLUMNS} rows={8} minWidth={980} />
      ) : tableData.length === 0 ? (
        <EmptyState
          icon={<Inventory2OutlinedIcon />}
          title={search ? "No matching products" : "No products here"}
          description={
            search
              ? `Nothing matches "${search}" in this sub-category.`
              : "This bill payment sub-category has no products configured yet."
          }
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          minWidth={980}
          footer={
            <TablePagination
              component="div"
              count={txnCount}
              page={currentPage - 1}
              rowsPerPage={pageSize}
              rowsPerPageOptions={PAGE_SIZES}
              onPageChange={(_, page) => setCurrentPage(page + 1)}
              onRowsPerPageChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setCurrentPage(1);
              }}
            />
          }
        >
          {tableData.map((row: any) => (
            <ProductRow key={row._id} row={row} />
          ))}
        </DataTable>
      )}
    </>
  );
}

export default BBPSProductTable;

// ----------------------------------------------------------------------

const ProductRow = React.memo(({ row }: any) => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [item, setItem] = useState(row);
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem({ ...item, [event.target.name]: event.target.value });
  };

  /* Same payload the old row sent, field for field. */
  const handleSave = () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    const body = {
      productId: item?._id,
      ekoOperatorId: item?.ekoOperatorId,
      cyrusOperatorId: item?.cyrusOperatorId,
      swiftOperatorId: item?.swiftOperatorId,
      swiftServiceId: item?.swiftServiceId,
      cardValleyServiceId: item?.cardValleyServiceId,
      cardValleyOperatorId: item?.cardValleyOperatorId,
    };

    Api("product/editBbpsProductById", "POST", body, token).then(
      (Response: any) => {
        if (Response?.status === 200) {
          enqueueSnackbar(Response?.data?.message || "Product updated");
          setEditable(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
        }
        setSaving(false);
      }
    );
  };

  const cancel = () => {
    setItem(row);
    setEditable(false);
  };

  const mapped = PROVIDER_FIELDS.filter((field) => item?.[field.key]);

  return (
    <KitRow>
      <TableCell sx={{ verticalAlign: "top" }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
          {item?.productName || "-"}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
          {mapped.length} of {PROVIDER_FIELDS.length} providers mapped
        </Typography>
      </TableCell>

      <TableCell sx={{ verticalAlign: "top" }}>
        <Typography sx={{ fontSize: 13.5 }}>{item?.operatorid || "-"}</Typography>
      </TableCell>

      <TableCell sx={{ verticalAlign: "top" }}>
        {editable ? (
          <Box
            sx={{
              display: "grid",
              rowGap: 1.5,
              columnGap: 1.5,
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
            }}
          >
            {PROVIDER_FIELDS.map((field) => (
              <TextField
                key={field.key}
                size="small"
                label={field.label}
                name={field.key}
                value={item?.[field.key] ?? ""}
                onChange={handleChange}
              />
            ))}
          </Box>
        ) : mapped.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            No provider mapped
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {mapped.map((field) => (
              <Box
                key={field.key}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.75,
                  backgroundColor: alpha(theme.palette.grey[500], 0.1),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "text.secondary",
                  }}
                >
                  {field.label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                  {item[field.key]}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </TableCell>

      <TableCell align="right" sx={{ verticalAlign: "top" }}>
        {editable ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={cancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              Save
            </Button>
          </Stack>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditable(true)}
          >
            Edit
          </Button>
        )}
      </TableCell>
    </KitRow>
  );
});
