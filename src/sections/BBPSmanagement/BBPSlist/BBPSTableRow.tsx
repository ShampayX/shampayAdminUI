// import { useState } from "react";
// // @mui
// import { TableRow, TableCell } from "@mui/material";
// // utils
// import { fDate, fDateTime } from "../../../utils/formatTime";
// import { fIndianCurrency } from "../../../utils/formatNumber";
// // components
// import Label from "../../../components/label";
// import { sentenceCase } from "change-case";
// import dayjs from "dayjs";

// // ----------------------------------------------------------------------

// type Props = {
//   row: any;
// };

// export default function BBPSTableRow({ row }: Props) {
//   const {
//     clientRefId,
//     productName,
//     mobileNumber,
//     date,
//     dueDate,
//     status,
//     number,
//     amount,
//     param1,
//     param2,
//     param3,
//     param4,
//   } = row;

//   const [datePart, timePart] = date.split(" ");
//   const [year, month, day] = datePart.split("-");
//   const [hours, minutes, seconds] = timePart.split(":");
//   const formattedDate = new Date(year, month - 1, day, hours, minutes, seconds);

//   const updatedDate = dayjs(formattedDate)
//   .add(5, "hour")
//   .add(30, "minute");
// const updatedHours = updatedDate.hour();
// const updatedMinutes = updatedDate.minute();
// const updatedSeconds = updatedDate.second();
// const updatedHours12 = updatedHours % 12 || 12;
// const period = updatedHours < 12 ? "AM" : "PM";

// const newTimeFormat = `${updatedHours12}:${updatedMinutes}:${updatedSeconds} ${period}`;
// const newDateTime = `${year}-${month}-${day} ${newTimeFormat}`;

//   return (
//     <>
//       <TableRow hover key={clientRefId}>
//           <TableCell align="left">{newDateTime || "-"}</TableCell>
//         <TableCell align="left">{clientRefId || "-"}</TableCell>
//         <TableCell align="left">{productName || "-"}</TableCell>
//         <TableCell align="left">{mobileNumber || "-"}</TableCell>
// <TableCell align="left">{fDate(dueDate) || "-"}</TableCell>
//         <TableCell align="left">{number || "-"}</TableCell>
//         <TableCell align="left">{param1 || "-"}</TableCell>
//         <TableCell align="left">{param2 || "-"}</TableCell>
//         <TableCell align="left">{param3 || "-"}</TableCell>
//         <TableCell align="left">{param4 || "-"}</TableCell>

//         <TableCell align="left">{fIndianCurrency(amount)}</TableCell>

//         <TableCell align="left">
//           <Label
//             variant="soft"
//             color={
//               (sentenceCase(status) === sentenceCase("pending") && "warning") ||
//               (sentenceCase(status) === sentenceCase("Initiated") &&
//                 "success") ||
//               (sentenceCase(status) === sentenceCase("in process") &&
//                 "error") ||
//               "default"
//             }
//           >
//             {sentenceCase(status)}
//           </Label>
//         </TableCell>
//       </TableRow>
//     </>
//   );
// }

import { useMemo } from "react";
import { TableRow, TableCell } from "@mui/material";
import { fIndianCurrency } from "../../../utils/formatNumber";
import Label from "../../../components/label";
import { sentenceCase } from "change-case";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type Props = { row: any };

export default function BBPSTableRow({ row }: Props) {
  const {
    clientRefId,
    productName,
    mobileNumber,
    date,
    dueDate,
    status,
    number,
    amount,
    param1,
    param2,
    param3,
    param4,
  } = row;

  // --- robust date parsing & IST formatting -----------------------------
  const newDateTime = useMemo(() => {
    if (!date) return "-";

    // Normalize common backend shapes:
    // "YYYY-MM-DD HH:mm:ss"  -> "YYYY-MM-DDTHH:mm:ss"
    // Add 'Z' to treat as UTC if there is no timezone info.
    const raw = String(date).trim();
    if (!raw) return "-";

    const hasT = raw.includes("T");
    const hasZone = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(raw); // ends with Z or +05:30 etc.
    const normalized = hasT ? raw : raw.replace(" ", "T");
    const assumeUtc = hasZone ? normalized : normalized + "Z";

    const d = dayjs.utc(assumeUtc);
    if (!d.isValid()) return "-";

    // Format in Asia/Kolkata
    return d.tz("Asia/Kolkata").format("YYYY-MM-DD h:mm:ss A");
  }, [date]);
  // ----------------------------------------------------------------------

  // Optional: format dueDate with dayjs too (avoids your previous crash paths)
  const dueDateLabel = useMemo(() => {
    if (!dueDate && dueDate !== 0) return "-";
    const raw = String(dueDate).trim();

    if (!raw) return "-";

    const hasT = raw.includes("T");
    const hasZone = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(raw);
    const normalized = hasT ? raw : raw.replace(" ", "T");
    const assumeUtc = hasZone ? normalized : normalized + "Z";

    const d = dayjs.utc(assumeUtc);
    return d.isValid() ? d.tz("Asia/Kolkata").format("DD MMM YYYY") : "-";
  }, [dueDate]);

  const statusColor =
    (sentenceCase(status) === "Pending" && "warning") ||
    (sentenceCase(status) === "Initiated" && "success") ||
    (sentenceCase(status) === "In Process" && "error") ||
    "default";

  return (
    <TableRow hover key={clientRefId}>
      <TableCell align="left">{newDateTime}</TableCell>
      <TableCell align="left">{clientRefId || "-"}</TableCell>
      <TableCell align="left">{productName || "-"}</TableCell>
      <TableCell align="left">{mobileNumber || "-"}</TableCell>
      <TableCell align="left">{dueDateLabel}</TableCell>
      <TableCell align="left">{number || "-"}</TableCell>
      <TableCell align="left">{param1 || "-"}</TableCell>
      <TableCell align="left">{param2 || "-"}</TableCell>
      <TableCell align="left">{param3 || "-"}</TableCell>
      <TableCell align="left">{param4 || "-"}</TableCell>
      <TableCell align="left">{fIndianCurrency(amount)}</TableCell>
      <TableCell align="left">
        <Label variant="soft" color={statusColor}>
          {sentenceCase(status || "-")}
        </Label>
      </TableCell>
    </TableRow>
  );
}
