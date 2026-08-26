import { Pagination, Stack, TablePagination } from "@mui/material";

export default function CustomPagination({ ...other }: any) {
  return (
    <Stack
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        bgcolor: "white",
        width: "100%",
      }}
    >
      <TablePagination size="small" component="div" {...other} />
      
    </Stack>
  );
}
