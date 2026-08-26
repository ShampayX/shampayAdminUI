import { ReactNode } from "react";
// @mui
import { Box, Card, Stack, Skeleton, TableCell, TableRow } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// ----------------------------------------------------------------------
// One skeleton system for the whole portal.
//
// The rule these follow: a skeleton stands in for the SHAPE of the content
// that is about to arrive, at the same size and in the same place, so the page
// does not jump when the data lands. A spinner tells the user "wait"; these
// tell them what they are waiting for.
//
// Deliberately quiet: MUI's default `pulse` at the theme's own divider tint, no
// shimmer sweep, no staggered timing. Dense operational tables look broken when
// forty rows shimmer independently.
// ----------------------------------------------------------------------

/** Shared look for every bar in the system. */
function Bar({
  width,
  height = 14,
  radius = 0.75,
}: {
  width: number | string;
  height?: number;
  radius?: number;
}) {
  const theme = useTheme();

  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      sx={{
        borderRadius: radius,
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(145, 158, 171, 0.16)"
            : "rgba(145, 158, 171, 0.20)",
      }}
    />
  );
}

// ----------------------------------------------------------------------

/** Stand-in for <PageHeader>: title bar, subtitle bar, action cluster. */
export function HeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      sx={{ mb: 2.5 }}
    >
      <Box sx={{ width: "100%", maxWidth: 460 }}>
        <Bar width="42%" height={24} radius={1} />
        <Box sx={{ mt: 1.25 }}>
          <Bar width="82%" height={13} />
        </Box>
      </Box>

      <Stack direction="row" spacing={1.5}>
        {Array.from({ length: actions }).map((_, index) => (
          <Bar key={index} width={116} height={42} radius={1.5} />
        ))}
      </Stack>
    </Stack>
  );
}

/** Stand-in for <FilterBar>: the rounded rail with a row of controls. */
export function FilterBarSkeleton({ slots = 3 }: { slots?: number }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1.25,
        mb: 2.5,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
        {Array.from({ length: slots }).map((_, index) => (
          <Bar
            key={index}
            width={index === 0 ? 300 : 190}
            height={48}
            radius={1.5}
          />
        ))}
      </Stack>
    </Box>
  );
}

/** Stand-in for a <StatGrid> row of <StatCard>s. */
export function StatGridSkeleton({ cards = 4 }: { cards?: 2 | 3 | 4 }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        mb: 2.5,
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: `repeat(${cards}, 1fr)`,
        },
      }}
    >
      {Array.from({ length: cards }).map((_, index) => (
        <Card
          key={index}
          sx={{
            p: 2.25,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Bar width={38} height={38} radius={1.25} />
            <Box sx={{ flexGrow: 1 }}>
              <Bar width="58%" height={10} />
              <Box sx={{ mt: 1 }}>
                <Bar width="40%" height={20} radius={1} />
              </Box>
              <Box sx={{ mt: 0.75 }}>
                <Bar width="72%" height={10} />
              </Box>
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}

/**
 * Stand-in for a <DataTable>: real header cells with the real column labels,
 * then placeholder rows. Passing the same `columns` array the table uses keeps
 * the header identical before and after load, so only the rows swap.
 */
export function TableSkeleton({
  columns,
  rows = 8,
  minWidth = 900,
}: {
  columns: { id: string | number; label: string; align?: "left" | "center" | "right" }[];
  rows?: number;
  minWidth?: number;
}) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  // Legacy screens hand over their live `headLabel` array, which is not always
  // well formed: several build it with `cond && { ... }` (leaving a literal
  // `false`) or end it with a stray comma (leaving a hole). Drop those rather
  // than render a blank column. Keys are positional for the same reason - ids
  // repeat across these arrays and are not unique.
  const cols = columns.filter(Boolean);

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: isLight ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
      }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", minWidth, borderCollapse: "collapse" }}>
          <Box component="thead">
            <TableRow>
              {cols.map((column, columnIndex) => (
                <TableCell
                  key={columnIndex}
                  align={column.align || "left"}
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: theme.palette.text.secondary,
                    backgroundColor: isLight
                      ? "#F4F6FA"
                      : "rgba(255, 255, 255, 0.06)",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: theme.spacing(1.75, 2),
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </Box>

          <Box component="tbody">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {cols.map((column, columnIndex) => (
                  <TableCell
                    key={columnIndex}
                    align={column.align || "left"}
                    sx={{
                      borderBottom:
                        rowIndex === rows - 1
                          ? "none"
                          : `1px solid ${theme.palette.divider}`,
                      padding: theme.spacing(1.75, 2),
                    }}
                  >
                    <Stack
                      alignItems={
                        column.align === "center"
                          ? "center"
                          : column.align === "right"
                          ? "flex-end"
                          : "flex-start"
                      }
                    >
                      {/* First column reads as a label + caption, the rest as
                          single values - mirrors how these tables render. */}
                      {columnIndex === 0 ? (
                        <Box sx={{ width: "100%" }}>
                          <Bar width="72%" height={13} />
                          <Box sx={{ mt: 0.75 }}>
                            <Bar width="46%" height={10} />
                          </Box>
                        </Box>
                      ) : (
                        <Bar width={`${52 + ((rowIndex + columnIndex) % 4) * 9}%`} />
                      )}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** Stand-in for a stack of <FormCard>s or record cards. */
export function CardListSkeleton({
  cards = 3,
  lines = 3,
}: {
  cards?: number;
  lines?: number;
}) {
  const theme = useTheme();

  return (
    <Stack spacing={2}>
      {Array.from({ length: cards }).map((_, index) => (
        <Card
          key={index}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Bar width="34%" height={16} radius={1} />
            <Bar width={96} height={36} radius={1.5} />
          </Stack>

          <Stack spacing={1.5}>
            {Array.from({ length: lines }).map((_, line) => (
              <Stack
                key={line}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Bar width={`${28 + (line % 3) * 8}%`} height={13} />
                <Bar width={140} height={13} />
              </Stack>
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

/** Stand-in for a list of records - the Ecosystem / record-row shape. */
export function RecordListSkeleton({ rows = 6 }: { rows?: number }) {
  const theme = useTheme();

  return (
    <Stack spacing={1.25}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            px: 2,
            py: 1.75,
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Bar width={38} height={38} radius={99} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Bar width="30%" height={13} />
              <Box sx={{ mt: 0.75 }}>
                <Bar width="52%" height={10} />
              </Box>
            </Box>
            <Bar width={78} height={22} radius={0.75} />
            <Bar width={96} height={32} radius={1.5} />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------

/**
 * Whole-screen skeleton for a list page: header + filters + table.
 * Most screens only need this one.
 */
export function ListPageSkeleton({
  columns,
  rows = 8,
  stats = 0,
  filters = 3,
  minWidth,
  children,
}: {
  columns: { id: string | number; label: string; align?: "left" | "center" | "right" }[];
  rows?: number;
  /** Number of stat cards above the filters, 0 for none. */
  stats?: 0 | 2 | 3 | 4;
  filters?: number;
  minWidth?: number;
  /** Rendered instead of the table, for pages that are not tabular. */
  children?: ReactNode;
}) {
  return (
    <Box>
      <HeaderSkeleton />
      {stats > 0 && <StatGridSkeleton cards={stats as 2 | 3 | 4} />}
      {filters > 0 && <FilterBarSkeleton slots={filters} />}
      {children ?? (
        <TableSkeleton columns={columns} rows={rows} minWidth={minWidth} />
      )}
    </Box>
  );
}
