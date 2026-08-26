import { format, getTime, formatDistanceToNow } from "date-fns";

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null;

export function fDateFormatForApi(date: InputValue, newFormat?: string) {
  const fm = newFormat || "dd/MM/yyyy";

  return date ? format(new Date(date), fm) : "";
}
export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || "dd MMM yyyy";

  return date ? format(new Date(date), fm) : "";
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || "dd MMM yyyy pp";

  return date ? format(new Date(date), fm) : "";
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : "";
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : "";
}

// ----------------------------------------------------------------------
// Test

//  // e.g., "25/09/2023"
// Test 2 pipeline
