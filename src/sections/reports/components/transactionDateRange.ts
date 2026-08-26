import dayjs from "dayjs";

// ----------------------------------------------------------------------
// Date bounds for the transaction reports (Detailed Transaction Report /
// All Transactions). Those reports read from a rolling 3-month window -
// anything older is served by the Archive / Historical Data Export screens.
//
// Kept in one place so the pickers, the range guard and any future
// transaction filter agree. Do NOT reuse this on non-transaction screens.
// ----------------------------------------------------------------------

export const TRANSACTION_RANGE_MONTHS = 3;

/** Oldest date a transaction report may start from (today - 3 months). */
export function transactionMinDate(): Date {
  return dayjs()
    .subtract(TRANSACTION_RANGE_MONTHS, "month")
    .startOf("day")
    .toDate();
}

/** Newest selectable date - a transaction cannot be reported in the future. */
export function transactionMaxDate(): Date {
  return dayjs().endOf("day").toDate();
}

/** Lower bound of the "to" field: the chosen start, else the window floor. */
export function transactionEndMinDate(start?: Date | null): Date {
  return start ? dayjs(start).startOf("day").toDate() : transactionMinDate();
}

/**
 * Upper bound of the "to" field: 3 months after the chosen start, never later
 * than today - so a selected range can never span more than the window even if
 * the floor moves.
 */
export function transactionEndMaxDate(start?: Date | null): Date {
  const latest = transactionMaxDate();
  if (!start) return latest;
  const capped = dayjs(start).add(TRANSACTION_RANGE_MONTHS, "month").toDate();
  return capped.getTime() < latest.getTime() ? capped : latest;
}

/** True when `date` sits inside the allowed window (null counts as allowed). */
export function isWithinTransactionWindow(date?: Date | null): boolean {
  if (!date) return true;
  const value = dayjs(date);
  if (!value.isValid()) return false;
  return (
    !value.isBefore(dayjs(transactionMinDate())) &&
    !value.isAfter(dayjs(transactionMaxDate()))
  );
}

/**
 * Pins a picked value into the window. Typing a date straight into the field
 * bypasses the disabled calendar days, so every `onChange` runs through this
 * and the state can never hold an out-of-window date.
 */
export function clampToTransactionWindow(date: Date | null): Date | null {
  if (!date) return null;
  const value = dayjs(date);
  if (!value.isValid()) return date;

  const min = dayjs(transactionMinDate());
  const max = dayjs(transactionMaxDate());

  if (value.isBefore(min)) return min.toDate();
  if (value.isAfter(max)) return max.toDate();
  return date;
}
