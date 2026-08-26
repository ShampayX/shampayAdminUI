// import React, { useEffect, useState } from "react";
// import { useAuthContext } from "src/auth/useAuthContext";
// interface JobStatusResponse {
//   message: string;
//   processedTxns: string[];
//   unprocessedTxns: string[];
//   totalProcessedTxn: number;
//   totalUnprocessedTxn: number;
//   currentTxns: number;
// }

// const todayFormatted = () => {
//   const d = new Date();
//   return `${String(d.getDate()).padStart(2, "0")}/${String(
//     d.getMonth() + 1,
//   ).padStart(2, "0")}/${d.getFullYear()}`;
// };
// const TODAY = todayFormatted();

// const TxCard: React.FC<{ tid: string }> = ({ tid }) => (
//   <div style={S.txCard}>
//     {/* <div style={S.txIdLabel}>Transaction ID</div> */}
//     <div style={S.txIdLabel} title={tid}>
//       {tid}
//     </div>
//     {/* <div style={S.txDate}>{TODAY}</div> */}
//   </div>
// );

// function BulkCheck2() {
//   const [data, setData] = useState<JobStatusResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { Api } = useAuthContext();
//   const getJobStatus = () => {
//     setLoading(true);
//     setError(null);

//     let token = localStorage.getItem("token");

//     Api("admin/BulkCheckStatus/getJobStatus", "GET", "", token).then(
//       (Response: any) => {
//
//         if (Response?.status === 200) {
//           if (Response.data.code === 200) {
//             setData(Response.data.data);
//           } else {
//             setError("No Data Found");
//           }
//         } else {
//           setError("Failed to load job status");
//         }

//         setLoading(false);
//       },
//     );
//   };

//   useEffect(() => {
//     getJobStatus();
//   }, []);

//   /* ── Loading state ─────────────────────────── */
//   if (loading)
//     return (
//       <div
//         style={{
//           ...S.container,
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <div style={S.spinner} />
//         <p style={{ color: "#6b7280", fontSize: 14, marginTop: 14 }}>
//           Loading job status…
//         </p>
//         <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//       </div>
//     );

//   /* ── Error state ──────────────────────────── */
//   if (error || !data)
//     return (
//       <div
//         style={{
//           ...S.container,
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <p style={{ color: "#dc2626", fontSize: 14 }}>{error ?? "No data"}</p>
//         <button style={S.retryBtn} onClick={getJobStatus}>
//           Retry
//         </button>
//       </div>
//     );

//   const maxRows = Math.max(
//     data.processedTxns.length,
//     data.unprocessedTxns.length,
//   );

//   /* ── Main layout ──────────────────────────── */
//   return (
//     <div style={S.container}>
//       <div style={S.pageHeader}>
//         <div>
//           <h2 style={S.pageTitle}>File Management</h2>
//           <p style={S.pageSubtitle}>Manage and track your uploaded files</p>
//         </div>
//         <button style={S.refreshBtn} onClick={getJobStatus} title="Refresh">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//             <path
//               d="M1 4v6h6M23 20v-6h-6"
//               stroke="#6b7280"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
//               stroke="#6b7280"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* SUMMARY CARDS */}
//       <div style={S.summaryRow}>
//         {/* Processed */}
//         <div style={S.summaryCard}>
//           <div
//             style={{ ...S.blobDecor, background: "rgba(134,239,172,0.25)" }}
//           />
//           <div style={S.summaryTop}>
//             <div style={{ ...S.iconWrap, background: "#dcfce7" }}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <circle
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="#16a34a"
//                   strokeWidth="2"
//                 />
//                 <path
//                   d="M8 12l3 3 5-5"
//                   stroke="#16a34a"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//             <span
//               style={{ ...S.badge, background: "#dcfce7", color: "#16a34a" }}
//             >
//               Processed
//             </span>
//           </div>
//           <p style={{ ...S.summaryCount, color: "#16a34a" }}>
//             {data.totalProcessedTxn.toLocaleString()}
//           </p>
//           <div style={S.summaryFooter}>
//             <span style={S.footerLabel}>Processed Transactions</span>
//             <span style={{ ...S.footerCount, background: "#16a34a" }}>
//               {data.processedTxns.length}
//             </span>
//           </div>
//         </div>

//         {/* Unprocessed */}
//         <div style={S.summaryCard}>
//           <div
//             style={{ ...S.blobDecor, background: "rgba(252,165,165,0.25)" }}
//           />
//           <div style={S.summaryTop}>
//             <div style={{ ...S.iconWrap, background: "#fee2e2" }}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <circle
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="#dc2626"
//                   strokeWidth="2"
//                 />
//                 <line
//                   x1="12"
//                   y1="8"
//                   x2="12"
//                   y2="13"
//                   stroke="#dc2626"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                 />
//                 <circle cx="12" cy="16.5" r="1.2" fill="#dc2626" />
//               </svg>
//             </div>
//             <span
//               style={{ ...S.badge, background: "#fee2e2", color: "#dc2626" }}
//             >
//               Unprocessed
//             </span>
//           </div>
//           <p style={{ ...S.summaryCount, color: "#dc2626" }}>
//             {data.totalUnprocessedTxn.toLocaleString()}
//           </p>
//           <div style={S.summaryFooter}>
//             <span style={S.footerLabel}>Unprocessed Transactions</span>
//             <span style={{ ...S.footerCount, background: "#dc2626" }}>
//               {data.unprocessedTxns.length}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div style={S.tableWrap}>
//         {/* Sticky header */}
//         <div style={S.tableHead}>
//           <div style={S.tableHeadCell}>Processed Transactions</div>
//           <div style={{ ...S.tableHeadCell, borderLeft: "1px solid #e5e7eb" }}>
//             Unprocessed Transactions
//           </div>
//         </div>

//         {/* Scrollable body — ONLY this element scrolls */}
//         <div style={S.tableBody}>
//           {Array.from({ length: maxRows }).map((_, i) => (
//             <div key={i} style={S.tableRow}>
//               <div style={S.tableCell}>
//                 {data.processedTxns[i] ? (
//                   <TxCard tid={data.processedTxns[i]} />
//                 ) : (
//                   <div style={S.emptyCell} />
//                 )}
//               </div>
//               <div style={{ ...S.tableCell, borderLeft: "1px solid #f0f0f0" }}>
//                 {data.unprocessedTxns[i] ? (
//                   <TxCard tid={data.unprocessedTxns[i]} />
//                 ) : (
//                   <div style={S.emptyCell} />
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }

// const S: Record<string, React.CSSProperties> = {
//   container: {
//     height: "100vh",
//     overflow: "hidden",
//     display: "flex",
//     flexDirection: "column",
//     gap: 14,
//     // background: "#f0f4ff",
//     padding: "14px 14px",
//     fontFamily: "'Segoe UI', sans-serif",
//     fontSize: "12px",
//     boxSizing: "border-box",
//   },

//   /* Header row */
//   pageHeader: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     flexShrink: 0,
//   },
//   pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
//   pageSubtitle: { fontSize: 13, color: "#6b7280", margin: "3px 0 0" },
//   refreshBtn: {
//     background: "white",
//     border: "1px solid #e5e7eb",
//     borderRadius: 10,
//     padding: "7px 9px",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
//     flexShrink: 0,
//   },

//   /* Summary cards row */
//   summaryRow: {
//     display: "flex",
//     gap: 14,
//     flexShrink: 0,
//   },
//   summaryCard: {
//     flex: 1,
//     background: "white",
//     borderRadius: 16,
//     padding: "16px 18px",
//     position: "relative",
//     overflow: "hidden",
//     boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
//   },
//   blobDecor: {
//     position: "absolute",
//     top: -30,
//     right: -30,
//     width: 100,
//     height: 100,
//     borderRadius: "50%",
//     pointerEvents: "none",
//   },
//   summaryTop: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//     position: "relative",
//   },
//   iconWrap: {
//     width: 38,
//     height: 38,
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badge: {
//     fontSize: 11,
//     fontWeight: 600,
//     borderRadius: 20,
//     padding: "4px 12px",
//   },
//   summaryCount: {
//     fontSize: 34,
//     fontWeight: 800,
//     margin: "0 0 10px",
//     lineHeight: 1.1,
//     position: "relative",
//   },
//   summaryFooter: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     position: "relative",
//   },
//   footerLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
//   footerCount: {
//     color: "white",
//     fontSize: 11,
//     fontWeight: 700,
//     borderRadius: 20,
//     padding: "2px 9px",
//   },

//   /* Two-column table */
//   tableWrap: {
//     flex: 1, // fills remaining vertical space
//     overflow: "hidden", // clip; child handles scroll
//     background: "white",
//     borderRadius: 16,
//     boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
//     display: "flex",
//     flexDirection: "column",
//   },
//   tableHead: {
//     display: "flex",
//     borderBottom: "2px solid #f0f0f0",
//     flexShrink: 0, // never shrink
//   },
//   tableHeadCell: {
//     flex: 1,
//     padding: "13px 16px",
//     fontSize: 14,
//     fontWeight: 700,
//     color: "#374151",
//     background: "#fafafa",
//   },
//   tableBody: {
//     flex: 1,
//     overflowY: "auto", // ← ONLY this element scrolls
//   },
//   tableRow: {
//     display: "flex",
//     borderBottom: "1px solid #f5f5f5",
//   },
//   tableCell: {
//     flex: 1,
//     padding: "10px 12px",
//   },
//   emptyCell: { height: 76 },

//   /* Transaction card inside each cell */
//   txCard: {
//     borderRadius: 10,
//     border: "1px solid #f0f0f0",
//     padding: "10px 14px",
//     background: "#fafafa",
//   },
//   txIdLabel: {
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#111827",
//     marginBottom: 2,
//   },
//   txId: {
//     fontSize: 11,
//     color: "#9ca3af",
//     fontFamily: "monospace",
//     marginBottom: 3,
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//   },
//   txDate: { fontSize: 12, color: "#6b7280" },

//   /* Loading / error helpers */
//   spinner: {
//     width: 36,
//     height: 36,
//     border: "3px solid #e5e7eb",
//     borderTop: "3px solid #6366f1",
//     borderRadius: "50%",
//     animation: "spin 0.8s linear infinite",
//   },
//   retryBtn: {
//     marginTop: 12,
//     padding: "8px 22px",
//     background: "#6366f1",
//     color: "white",
//     border: "none",
//     borderRadius: 8,
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: "pointer",
//   },
// };

// export default BulkCheck2;

import React, { useEffect, useState } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
// theme
import { brandPreset } from "src/components/settings/presets";

interface JobStatusResponse {
  message: string;
  processedTxns: string[];
  unprocessedTxns: string[];
  totalProcessedTxn: number;
  totalUnprocessedTxn: number;
  currentTxns: number;
}

const todayFormatted = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};
const TODAY = todayFormatted();

const TxCard: React.FC<{ tid: string }> = ({ tid }) => (
  <div style={S.txCard}>
    <div style={S.txIdLabel} title={tid}>
      {tid}
    </div>
  </div>
);

function BulkCheck2() {
  const [data, setData] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { Api } = useAuthContext();

  const getJobStatus = () => {
    setLoading(true);
    setError(null);

    let token = localStorage.getItem("token");

    Api("admin/BulkCheckStatus/getJobStatus", "GET", "", token)
      .then((Response: any) => {
        if (Response?.status === 200) {
          let responseData = null;
          if (Response.data?.data && typeof Response.data.data === "object") {
            responseData = Response.data.data;
          } else if (
            Response.data &&
            (Response.data.processedTxns || Response.data.unprocessedTxns)
          ) {
            responseData = Response.data;
          } else if (Response.processedTxns || Response.unprocessedTxns) {
            responseData = Response;
          }

          if (responseData) {
            setData(responseData);
          } else {
            setError(Response.data?.message || "No Data Found");
          }
        } else {
          setError(Response?.data?.message || "Failed to load job status");
        }

        setLoading(false);
      })
      .catch((err: any) => {
        console.error("API Error:", err);
        setError("Network error occurred");
        setLoading(false);
      });
  };

  useEffect(() => {
    getJobStatus();
  }, []);

  if (loading)
    return (
      <div
        style={{
          ...S.container,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={S.spinner} />
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 14 }}>
          Loading job status…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (error || !data)
    return (
      <div
        style={{
          ...S.container,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#dc2626", fontSize: 14 }}>{error ?? "No data"}</p>
        <button style={S.retryBtn} onClick={getJobStatus}>
          Retry
        </button>
      </div>
    );

  const maxRows = Math.max(
    data.processedTxns?.length || 0,
    data.unprocessedTxns?.length || 0
  );

  /* ── Main layout ──────────────────────────── */
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <h2 style={S.pageTitle}>File Management</h2>
          <p style={S.pageSubtitle}>Manage and track your uploaded files</p>
        </div>
        <button style={S.refreshBtn} onClick={getJobStatus} title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M1 4v6h6M23 20v-6h-6"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={S.summaryRow}>
        {/* Processed */}
        <div style={S.summaryCard}>
          <div
            style={{ ...S.blobDecor, background: "rgba(134,239,172,0.25)" }}
          />
          <div style={S.summaryTop}>
            <div style={{ ...S.iconWrap, background: "#dcfce7" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#16a34a"
                  strokeWidth="2"
                />
                <path
                  d="M8 12l3 3 5-5"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{ ...S.badge, background: "#dcfce7", color: "#16a34a" }}
            >
              Processed
            </span>
          </div>
          <p style={{ ...S.summaryCount, color: "#16a34a" }}>
            {data.totalProcessedTxn?.toLocaleString() || 0}
          </p>
          <div style={S.summaryFooter}>
            <span style={S.footerLabel}>Processed Transactions</span>
            <span style={{ ...S.footerCount, background: "#16a34a" }}>
              {data.processedTxns?.length || 0}
            </span>
          </div>
        </div>

        {/* Unprocessed */}
        <div style={S.summaryCard}>
          <div
            style={{ ...S.blobDecor, background: "rgba(252,165,165,0.25)" }}
          />
          <div style={S.summaryTop}>
            <div style={{ ...S.iconWrap, background: "#fee2e2" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#dc2626"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="13"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16.5" r="1.2" fill="#dc2626" />
              </svg>
            </div>
            <span
              style={{ ...S.badge, background: "#fee2e2", color: "#dc2626" }}
            >
              Unprocessed
            </span>
          </div>
          <p style={{ ...S.summaryCount, color: "#dc2626" }}>
            {data.totalUnprocessedTxn?.toLocaleString() || 0}
          </p>
          <div style={S.summaryFooter}>
            <span style={S.footerLabel}>Unprocessed Transactions</span>
            <span style={{ ...S.footerCount, background: "#dc2626" }}>
              {data.unprocessedTxns?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div style={S.tableWrap}>
        {/* Sticky header */}
        <div style={S.tableHead}>
          <div style={S.tableHeadCell}>Processed Transactions</div>
          <div style={{ ...S.tableHeadCell, borderLeft: "1px solid #e5e7eb" }}>
            Unprocessed Transactions
          </div>
        </div>

        <div style={S.tableBody}>
          {maxRows > 0 ? (
            Array.from({ length: maxRows }).map((_, i) => (
              <div key={i} style={S.tableRow}>
                <div style={S.tableCell}>
                  {data.processedTxns?.[i] ? (
                    <TxCard tid={data.processedTxns[i]} />
                  ) : (
                    <div style={S.emptyCell} />
                  )}
                </div>
                <div
                  style={{ ...S.tableCell, borderLeft: "1px solid #f0f0f0" }}
                >
                  {data.unprocessedTxns?.[i] ? (
                    <TxCard tid={data.unprocessedTxns[i]} />
                  ) : (
                    <div style={S.emptyCell} />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={S.noDataMessage}>No transactions to display</div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    height: "93vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "14px 14px",
    fontFamily: "'Segoe UI', sans-serif",
    fontSize: "12px",
    boxSizing: "border-box",
    width: "100%",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#6b7280", margin: "3px 0 0" },
  refreshBtn: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "7px 9px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    flexShrink: 0,
  },
  summaryRow: {
    display: "flex",
    gap: 14,
    flexShrink: 0,
  },
  summaryCard: {
    flex: 1,
    background: "white",
    borderRadius: 16,
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  blobDecor: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: "50%",
    pointerEvents: "none",
  },
  summaryTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    position: "relative",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 20,
    padding: "4px 12px",
  },
  summaryCount: {
    fontSize: 34,
    fontWeight: 800,
    margin: "0 0 10px",
    lineHeight: 1.1,
    position: "relative",
  },
  summaryFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  footerLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  footerCount: {
    color: "white",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: "2px 9px",
  },
  tableWrap: {
    flex: 1,
    overflow: "hidden",
    background: "white",
    borderRadius: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
  },
  tableHead: {
    display: "flex",
    borderBottom: "2px solid #f0f0f0",
    flexShrink: 0,
  },
  tableHeadCell: {
    flex: 1,
    padding: "13px 16px",
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
    background: "#fafafa",
  },
  tableBody: {
    flex: 1,
    overflowY: "auto",
  },
  tableRow: {
    display: "flex",
    borderBottom: "1px solid #f5f5f5",
  },
  tableCell: {
    flex: 1,
    padding: "10px 12px",
  },
  emptyCell: { height: 76 },
  txCard: {
    borderRadius: 10,
    border: "1px solid #f0f0f0",
    padding: "10px 14px",
    background: "#fafafa",
  },
  txIdLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 2,
  },
  noDataMessage: {
    padding: "40px 16px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e5e7eb",
    borderTop: `3px solid ${brandPreset.main}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  retryBtn: {
    marginTop: 12,
    padding: "8px 22px",
    background: brandPreset.main,
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default BulkCheck2;
