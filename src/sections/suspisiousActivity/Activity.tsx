import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "src/components/hook-form";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tableCellClasses,
  TextField,
  Zoom,
  tooltipClasses,
  useTheme,
  TablePagination,
  TableFooter,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAuthContext } from "src/auth/useAuthContext";
import { TableHeadCustom, TableNoData } from "src/components/table";

// ─── Types ───────────────────────────────────────────────────────────────────
type FormValuesProps = {
  startDate: Date | null;
  endDate: Date | null;
};

type ActivityRow = {
  _id: string;
  type: string;
  ip: string;
  xForwardedFor?: string;
  endpoint: string;
  userAgent?: string;
  reason: string;
  createdAt: string;
};

type ActiveFilter = {
  startDate: string;
  endDate: string;
};

// ─── Threat config ────────────────────────────────────────────────────────────
const THREAT_META: Record<
  string,
  { label: string; color: "error" | "warning" | "info" | "default" }
> = {
  ACCESS_KEY_MISMATCH: { label: "Key Mismatch", color: "info" },
  UNAUTHORIZED: { label: "Unauthorized", color: "warning" },
  MULTIPLE_IP: { label: "Multiple IP", color: "error" },
  IP_WHITELIST_VIOLATION: { label: "IP Violation", color: "warning" },
  RATE_LIMIT: { label: "Rate Limit", color: "info" },
};

const getThreatMeta = (type: string) =>
  THREAT_META[type] ?? {
    label: type.replace(/_/g, " "),
    color: "default" as const,
  };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuspiciousActivity() {
  const { Api } = useAuthContext();
  const token = localStorage.getItem("token");

  const [activityData, setActivityData] = useState<ActivityRow[]>([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({
    startDate: "",
    endDate: "",
  });

  const defaultValues: FormValuesProps = {
    startDate: null,
    endDate: null,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(Yup.object().shape({})),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const tableLabels = [
    { id: "sno", label: "S.No" },
    { id: "type", label: "Threat Type" },
    { id: "ip", label: "IP Address" },
    { id: "endpoint", label: "Endpoint" },
    { id: "reason", label: "Reason" },
    { id: "agent", label: "User Agent" },
    { id: "time", label: "Created At" },
  ];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  // Format date as YYYY-MM-DD
  const formatDateForApi = (date: Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatSafeDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const buildQuery = (page: number, limit: number, filter: ActiveFilter) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (filter.startDate) params.set("startDate", filter.startDate);
    if (filter.endDate) params.set("endDate", filter.endDate);
    return params.toString();
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchActivity = (filter: ActiveFilter, page: number, limit: number) => {
    const query = buildQuery(page, limit, filter);
    Api(
      `admin/API_User_Management/getattacking_suspicious?${query}`,
      "GET",
      {},
      token
    ).then((Response: any) => {
      if (Response?.status === 200) {
        setActivityData(Response.data.suspiciousActivities ?? []);
        setCount(Response.data.total ?? 0);
      }
    });
  };

  useEffect(() => {
    fetchActivity(activeFilter, currentPage, pageSize);
  }, [currentPage, pageSize]);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = (data: FormValuesProps) => {
    const filter: ActiveFilter = {
      startDate: formatDateForApi(getValues("startDate")),
      endDate: formatDateForApi(getValues("endDate")),
    };
    setActiveFilter(filter);
    setCurrentPage(1);
    fetchActivity(filter, 1, pageSize);
  };

  const handleClear = () => {
    const empty: ActiveFilter = {
      startDate: "",
      endDate: "",
    };
    reset(defaultValues);
    setActiveFilter(empty);
    setCurrentPage(1);
    fetchActivity(empty, 1, pageSize);
  };

  return (
    <>
      {/* ── Filter Bar ── */}
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack
          flexDirection={{ xs: "column", sm: "row" }}
          m={1}
          gap={1}
          flexWrap="wrap"
          alignItems={{ sm: "center" }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              inputFormat="DD/MM/YYYY"
              value={watch("startDate")}
              maxDate={new Date()}
              onChange={(v: any) => setValue("startDate", v)}
              renderInput={(params: any) => (
                <TextField {...params} size="small" sx={{ width: 170 }} />
              )}
            />
            <DatePicker
              label="End date"
              inputFormat="DD/MM/YYYY"
              value={watch("endDate")}
              minDate={watch("startDate")}
              maxDate={new Date()}
              onChange={(v: any) => setValue("endDate", v)}
              renderInput={(params: any) => (
                <TextField {...params} size="small" sx={{ width: 170 }} />
              )}
            />
          </LocalizationProvider>

          <Stack flexDirection="row" gap={1}>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
            >
              Search
            </LoadingButton>
            <LoadingButton variant="contained" onClick={handleClear}>
              Clear
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>

      {/* ── Table ── */}
      <TableContainer sx={{ m: 1 }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHeadCustom headLabel={tableLabels} />
          <TableBody>
            {activityData.map((row, index) => (
              <ActivityTableRow
                key={row._id}
                row={row}
                index={(currentPage - 1) * pageSize + index + 1}
                formatSafeDate={formatSafeDate}
              />
            ))}
          </TableBody>
          <TableNoData isNotFound={!activityData.length} />
          <TableFooter>
            <TableRow>
              <TablePagination
                count={count}
                page={currentPage - 1}
                rowsPerPage={pageSize}
                onPageChange={(
                  _: React.MouseEvent<HTMLButtonElement> | null,
                  newPage: number
                ) => setCurrentPage(newPage + 1)}
                onRowsPerPageChange={(
                  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                ) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                rowsPerPageOptions={[10, 20, 25, 50, 100]}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "& .MuiTablePagination-toolbar": { minHeight: 44 },
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
const ActivityTableRow = React.memo(
  ({
    row,
    index,
    formatSafeDate,
  }: {
    row: ActivityRow;
    index: number;
    formatSafeDate: (d: string) => string;
  }) => {
    const theme = useTheme();
    const meta = getThreatMeta(row.type);

    const StyledTableCell = styled(TableCell)(() => ({
      [`&.${tableCellClasses.body}`]: {
        fontSize: 12,
        padding: "8px 12px",
      },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
      "&:nth-of-type(even)": {
        backgroundColor: theme.palette.grey[100],
      },
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&:last-child td, &:last-child th": {
        border: 0,
      },
    }));

    const CustomWidthTooltip = styled(
      ({ className, ...props }: TooltipProps) => (
        <Tooltip
          {...props}
          classes={{ popper: className }}
          TransitionComponent={Zoom}
          placement="top"
        />
      )
    )({
      [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 500,
        backgroundColor: theme.palette.grey[800],
        color: theme.palette.common.white,
        fontSize: 11,
      },
    });

    return (
      <StyledTableRow>
        {/* S.No */}
        <StyledTableCell>
          <Typography variant="body2" color="text.secondary">
            {index}
          </Typography>
        </StyledTableCell>

        {/* Threat Type */}
        <StyledTableCell>
          <Chip
            label={meta.label}
            color={meta.color}
            size="small"
            sx={{ fontSize: 11, fontWeight: 600, borderRadius: 1 }}
          />
        </StyledTableCell>

        {/* IP Address */}
        <StyledTableCell>
          <Stack spacing={0.3}>
            <Typography
              variant="body2"
              fontWeight={600}
              whiteSpace="nowrap"
              color="text.primary"
            >
              {row.ip}
            </Typography>
            {row.xForwardedFor && row.xForwardedFor !== row.ip && (
              <CustomWidthTooltip
                title={`X-Forwarded-For: ${row.xForwardedFor}`}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    maxWidth: 170,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "default",
                  }}
                >
                  ↳ {row.xForwardedFor}
                </Typography>
              </CustomWidthTooltip>
            )}
          </Stack>
        </StyledTableCell>

        {/* Endpoint */}
        <StyledTableCell>
          <CustomWidthTooltip title={row.endpoint}>
            <Box
              component="code"
              sx={{
                display: "block",
                maxWidth: 240,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 11,
                bgcolor: "grey.100",
                px: 0.8,
                py: 0.3,
                borderRadius: 0.5,
                color: "text.secondary",
                cursor: "default",
                border: "1px solid",
                borderColor: "grey.300",
              }}
            >
              {row.endpoint}
            </Box>
          </CustomWidthTooltip>
        </StyledTableCell>

        {/* Reason */}
        <StyledTableCell>
          <Typography variant="body2" whiteSpace="nowrap">
            {row.reason}
          </Typography>
        </StyledTableCell>

        {/* User Agent */}
        <StyledTableCell>
          {row.userAgent ? (
            <CustomWidthTooltip title={row.userAgent}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "default",
                }}
              >
                {row.userAgent}
              </Typography>
            </CustomWidthTooltip>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )}
        </StyledTableCell>

        {/* Created At */}
        <StyledTableCell>
          <Typography
            variant="body2"
            color="text.secondary"
            whiteSpace="nowrap"
          >
            {formatSafeDate(row.createdAt)}
          </Typography>
        </StyledTableCell>
      </StyledTableRow>
    );
  }
);
