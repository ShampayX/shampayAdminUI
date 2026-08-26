// @mui
import { DialogProps } from "@mui/material";

// ----------------------------------------------------------------------

export interface ConfirmDialogProps extends Omit<any, "title"> {
  title: React.ReactNode;
  content?: React.ReactNode;
  action: React.ReactNode;
  open: boolean;
  onClose: VoidFunction;
}
