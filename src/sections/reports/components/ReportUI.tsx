/**
 * Compatibility shim.
 *
 * The report chrome now lives in `src/components/page-kit` so every screen can
 * share it. The two report pages keep importing these names from here.
 * New screens should import from `src/components/page-kit` directly.
 */
export {
  PageHeader as ReportHeader,
  FilterBar as ReportFilterBar,
  FilterSlot,
  PageActionButton as ReportActionButton,
  KitHeadCell as ReportHeadCell,
  KitRow as ReportRow,
  StatusPill,
  ModeLabel,
} from "src/components/page-kit";
