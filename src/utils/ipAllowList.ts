// ----------------------------------------------------------------------
// Item 2b: client-side mirror of the backend's IP allow-list validation.
//
// The backend compares a client address against the stored list literally, so a
// CIDR range like `10.0.0.0/8` can never match anything - it would sit in the
// list looking configured while the partner is refused on every call. The
// backend rejects it with `400 Not a valid IP address: 10.0.0.0/8`; this mirror
// exists so the operator finds out before submitting, not after.
//
// IPv4 and IPv6 only. Nothing else is accepted - not a hostname, not a range.
// ----------------------------------------------------------------------

/** Dotted-quad, each octet 0-255, no leading zeros beyond a bare "0". */
const IPV4 =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/**
 * IPv6, including the `::` compressed forms and the IPv4-mapped tail
 * (`::ffff:127.0.0.1`), which is the form a loopback call actually arrives as.
 */
const IPV6 = new RegExp(
  "^(" +
    "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|" +
    "([0-9a-fA-F]{1,4}:){1,7}:|" +
    "([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|" +
    "([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|" +
    "([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|" +
    "([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|" +
    "([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|" +
    "[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|" +
    ":((:[0-9a-fA-F]{1,4}){1,7}|:)|" +
    "fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|" +
    "::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\\d)?\\d)\\.){3}(25[0-5]|(2[0-4]|1?\\d)?\\d)|" +
    "([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\\d)?\\d)\\.){3}(25[0-5]|(2[0-4]|1?\\d)?\\d)" +
    ")$"
);

export function isValidIp(value: string): boolean {
  const raw = String(value || "").trim();
  if (!raw) return false;
  return IPV4.test(raw) || IPV6.test(raw);
}

/** True when the entry looks like a CIDR range, which the backend refuses. */
export function looksLikeCidr(value: string): boolean {
  return String(value || "").includes("/");
}

/**
 * Why this entry cannot be used, or "" when it is fine. Written to be shown
 * next to the field.
 */
export function ipEntryError(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "Enter an IP address.";
  if (looksLikeCidr(raw)) {
    return "Ranges are not supported. The platform compares addresses exactly, so a range would look configured and never match. Enter each address separately.";
  }
  if (!isValidIp(raw)) return "Not a valid IPv4 or IPv6 address.";
  return "";
}
