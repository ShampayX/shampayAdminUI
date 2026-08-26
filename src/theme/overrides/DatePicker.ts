import { Theme } from '@mui/material/styles';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

// ----------------------------------------------------------------------

export default function DatePicker(theme: Theme) {
  return {
    MuiDatePicker: {
      defaultProps: {
        inputFormat: 'dd/MM/yyyy',
        /**
         * One calendar glyph for the whole portal. The rounded outline reads
         * with the other filter icons; MUI's default sits a weight heavier.
         */
        components: {
          OpenPickerIcon: CalendarMonthRoundedIcon,
        },
      },
    },
  };
}
