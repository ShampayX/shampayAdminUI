import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

// ----------------------------------------------------------------------
// Client-side table behaviour: instant search, sorting, paging, export.
// Everything here works on rows already in memory - no extra API calls,
// so it stays instant even on large pages.
// ----------------------------------------------------------------------

/** Flattens a row to a lowercase haystack once, then reuses it. */
const haystack = (row: any): string => {
  if (row == null) return "";
  if (typeof row !== "object") return String(row).toLowerCase();

  let out = "";
  Object.values(row).forEach((value) => {
    if (value == null) return;
    if (typeof value === "object") {
      // one level deep is enough for these payloads, and keeps it fast
      Object.values(value as any).forEach((nested) => {
        if (nested != null && typeof nested !== "object") {
          out += String(nested).toLowerCase() + " ";
        }
      });
      return;
    }
    out += String(value).toLowerCase() + " ";
  });
  return out;
};

const readPath = (row: any, path: string) =>
  path.split(".").reduce((acc: any, key) => (acc == null ? acc : acc[key]), row);

export type SortDirection = "asc" | "desc";

type Options = {
  /** Restrict search to these keys (supports "a.b"). Default: every field. */
  searchKeys?: string[];
  /** Rows per page. Default 25. */
  rowsPerPage?: number;
  /** Remembers rows-per-page under this key. */
  storageKey?: string;
};

/**
 * One hook for a client-side table.
 *
 * const t = useDataTable(rows);
 * <SearchField value={t.query} onChange={t.setQuery} count={t.total} />
 * <DataTable ... sortBy={t.sortBy} sortDir={t.sortDir} onSort={t.toggleSort}>
 *   {t.paged.map(...)}
 */
export function useDataTable<T = any>(rows: T[] | undefined, options: Options = {}) {
  const { searchKeys, rowsPerPage: initialRows = 25, storageKey } = options;

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    if (!storageKey) return initialRows;
    const saved = Number(localStorage.getItem(`rows:${storageKey}`));
    return saved > 0 ? saved : initialRows;
  });

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  /* search - precomputed haystacks so typing stays instant */
  const indexed = useMemo(
    () =>
      safeRows.map((row) => ({
        row,
        text: searchKeys
          ? searchKeys
              .map((key) => readPath(row, key))
              .filter((v) => v != null)
              .join(" ")
              .toLowerCase()
          : haystack(row),
      })),
    [safeRows, searchKeys]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return safeRows;

    /* every whitespace-separated token must appear somewhere in the row */
    const tokens = term.split(/\s+/);
    return indexed
      .filter((entry) => tokens.every((token) => entry.text.includes(token)))
      .map((entry) => entry.row);
  }, [indexed, query, safeRows]);

  /* sort */
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;

    const copy = [...filtered];
    copy.sort((a: any, b: any) => {
      const left = readPath(a, sortBy);
      const right = readPath(b, sortBy);

      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;

      const leftNum = Number(left);
      const rightNum = Number(right);
      const numeric = !isNaN(leftNum) && !isNaN(rightNum) && left !== "" && right !== "";

      const result = numeric
        ? leftNum - rightNum
        : String(left).localeCompare(String(right), undefined, { numeric: true });

      return sortDir === "asc" ? result : -result;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  /* paging - never strand the user on a page that no longer exists */
  useEffect(() => {
    setPage(0);
  }, [query, sortBy, sortDir]);

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir("asc");
  };

  const changeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setPage(0);
    if (storageKey) localStorage.setItem(`rows:${storageKey}`, String(value));
  };

  return {
    query,
    setQuery,
    sortBy,
    sortDir,
    toggleSort,
    page,
    setPage,
    rowsPerPage,
    changeRowsPerPage,
    /** rows after search + sort (all pages) */
    results: sorted,
    /** rows for the current page */
    paged,
    /** matches after search */
    total: sorted.length,
    /** rows before search */
    grandTotal: safeRows.length,
    isEmpty: sorted.length === 0,
    isFiltered: query.trim().length > 0,
  };
}

// ----------------------------------------------------------------------

/**
 * Download rows as .xlsx. Pass plain objects - keys become column headers.
 * Uses the `xlsx` dependency already in the project, so nothing is fetched.
 */
export function exportToExcel(
  rows: Record<string, any>[],
  fileName: string,
  sheetName = "Sheet1"
) {
  if (!rows?.length) return false;

  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31));
  XLSX.writeFile(book, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
  return true;
}

// ----------------------------------------------------------------------

/**
 * Focuses an element when "/" is pressed (unless the user is already typing).
 * Returns the ref to spread onto the input.
 */
export function useSlashFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;

      const active = document.activeElement as HTMLElement | null;
      const typing =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      if (typing) return;

      event.preventDefault();
      ref.current?.focus();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return ref;
}
