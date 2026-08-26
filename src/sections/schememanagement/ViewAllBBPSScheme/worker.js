// onmessage = (ev) => {
//   const header = [];
//   const bodyData = [];
//   const file = event[0];
//   const reader = new FileReader();
//   const isSubset = (array1, array2) => {
//
//     return array2.every((element) => array1.includes(element));
//   };

//   if (file.type !== "text/csv") {
//     enqueueSnackbar("Invalid file format");
//     return;
//   }

//   reader.onload = async (e) => {
//     const content = e.target.result;
//     const rows = content.split("\n");
//     let Heads = [
//       "clientRefId",
//       "productName",
//       "number",
//       "amount",
//       "transactionId",
//       "vendorUtr",
//       "status",
//       "remarks",
//     ];

//     if (rows.length > 0) {
//       const csvHeaders = await rows[0].split(",").map((header) => {
//         return { id: header.trim(), label: header.trim() };
//       });
//       header = csvHeaders;

//       const jsonData = [];
//       for (let i = 1; i < rows.length; i++) {
//         const row = rows[i].split(",");
//         const obj = {};
//         for (let j = 0; j < csvHeaders.length; j++) {
//           obj[csvHeaders[j].label] = [
//             "agentCommission",
//             "distributorCommission",
//             "masterDistributorCommission",
//             "apiUserCommission",
//           ].includes(csvHeaders[j].label)
//             ? parseFloat(row[j]) + ""
//             : row[j];
//         }
//         obj.productId !== "" &&
//           obj.productId !== undefined &&
//           jsonData.push(obj);
//       }
//
//       bodyData = jsonData;
//     }
//     postMessage(header, bodyData);
//   };
//   reader.readAsText(file);
// };

/* eslint-disable no-restricted-globals */

self.onmessage = (ev) => {
  const files = ev.data;
  const file = files?.[0];

  if (!file || file.type !== "text/csv") {
    self.postMessage({
      header: [],
      bodyData: [],
      error: "Invalid CSV file",
    });
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const text = reader.result;
    const rows = text.split("\n");

    if (rows.length < 2) {
      self.postMessage({ header: [], bodyData: [] });
      return;
    }

    const header = rows[0]
      .split(",")
      .map((h) => ({ id: h.trim(), label: h.trim() }));

    const bodyData = [];

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;

      const cols = rows[i].split(",");
      const obj = {};

      header.forEach((h, idx) => {
        obj[h.label] = cols[idx]?.trim() ?? "";
      });

      bodyData.push(obj);
    }

    self.postMessage({ header, bodyData });
  };

  reader.readAsText(file);
};
