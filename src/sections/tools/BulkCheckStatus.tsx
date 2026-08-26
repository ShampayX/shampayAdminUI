// import React, { useState, useEffect, useRef } from "react";
// import { useAuthContext } from "src/auth/useAuthContext";
// import BulkCheck2 from "./BulkCheck2";

// type TxStatus = "success" | "pending" | "failed" | "info";

// interface Transaction {
//   index: number;
//   tid: string;
//   status: TxStatus;
//   message: string;
//   time: string;
// }

// const getStatusType = (raw: string): TxStatus => {
//   const s = raw.toLowerCase().trim();
//   if (s === "success") return "success";
//   if (s === "pending") return "pending";
//   if (
//     s === "failed" ||
//     s === "undefined" ||
//     s.includes("error") ||
//     s.includes("failed") ||
//     s.includes("not allowed") ||
//     s.includes("no api") ||
//     s.includes("configuration") ||
//     s.includes("cannot read") ||
//     s.includes("check after")
//   )
//     return "failed";
//   return "info";
// };

// const STATUS_COLOR: Record<TxStatus, string> = {
//   success: "#16a34a",
//   pending: "#d97706",
//   failed: "#dc2626",
//   info: "#6366f1",
// };

// const STATUS_LABEL: Record<TxStatus, string> = {
//   success: "Success",
//   pending: "Pending",
//   failed: "Failed",
//   info: "Info",
// };

// const nowDate = () => {
//   const d = new Date();
//   return `${String(d.getDate()).padStart(2, "0")}/${String(
//     d.getMonth() + 1,
//   ).padStart(2, "0")}/${d.getFullYear()}`;
// };

// const BulkCheckStatus = () => {
//   const siteUrl = process.env.REACT_APP_BASE_URL;
//   const { Api } = useAuthContext();

//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [stopping, setStopping] = useState(false);
//   const [summary, setSummary] = useState<string | null>(null);
//   const [totalTransactions, setTotalTransactions] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [remainingSeconds, setRemainingSeconds] = useState(0);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const totalRef = useRef(0);
//   const indexRef = useRef(0);
//   const abortRef = useRef(false);
//   const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
//     null,
//   );

//   // Countdown ticker
//   useEffect(() => {
//     if (!loading) return;
//     const interval = setInterval(() => {
//       if (totalRef.current > 0) {
//         const rem = Math.max(totalRef.current - indexRef.current, 0);
//         setRemainingSeconds(Math.ceil(rem / 1));
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [loading]);

//   // Stop job on mount
//   useEffect(() => {
//     const stop = async () => {
//       try {
//         const token = localStorage.getItem("token") ?? "";
//         await fetch(siteUrl + "admin/BulkCheckStatus/stop-jobStatus", {
//           method: "GET",
//           headers: { "Content-Type": "application/json", token },
//         });
//       } catch {}
//     };
//     stop();
//   }, []);

//   // handleStop — called when user clicks "Stop" during processing
//   const handleStop = async () => {
//     setStopping(true);
//     abortRef.current = true;
//     // cancel the active reader so the fetch loop unblocks immediately
//     try {
//       readerRef.current?.cancel();
//     } catch {}

//     try {
//       const token = localStorage.getItem("token") ?? "";
//       await fetch(siteUrl + "admin/BulkCheckStatus/stop-jobStatus", {
//         method: "GET",
//         headers: { "Content-Type": "application/json", token },
//       });
//     } catch (err) {
//       console.error("Stop error:", err);
//     } finally {
//       setLoading(false);
//       setRemainingSeconds(0);
//       setStopping(false);
//       setIsCompleted(true); // renders <BulkCheck2 />
//     }
//   };

//   // parseLine — unchanged from doc3
//   const parseLine = (line: string) => {
//     const trimmed = line.trim();
//     if (!trimmed || trimmed === ":") return;

//     if (trimmed.toLowerCase().includes("bulk checkstatus complete")) {
//       setSummary(trimmed.replace(/^data:\s*/i, ""));
//       setIsCompleted(true);
//       return;
//     }

//     if (!trimmed.includes("|")) return;

//     const firstPipe = trimmed.indexOf("|");
//     const secondPipe = trimmed.indexOf("|", firstPipe + 1);
//     const thirdPipe = trimmed.indexOf("|", secondPipe + 1);

//     if (firstPipe === -1 || secondPipe === -1) return;

//     const rawTotal = trimmed.slice(0, firstPipe).trim();
//     const rawIndex = trimmed.slice(firstPipe + 1, secondPipe).trim();
//     const msgPart =
//       thirdPipe > secondPipe
//         ? trimmed.slice(secondPipe + 1, thirdPipe).trim()
//         : trimmed.slice(secondPipe + 1).trim();
//     const rawStatus =
//       thirdPipe > secondPipe ? trimmed.slice(thirdPipe + 1).trim() : "";

//     if (rawTotal && !isNaN(Number(rawTotal)) && Number(rawTotal) > 0) {
//       const t = Number(rawTotal);
//       if (t !== totalRef.current) {
//         totalRef.current = t;
//         setTotalTransactions(t);
//         if (indexRef.current === 0) setRemainingSeconds(Math.ceil(t / 2));
//       }
//     }

//     if (rawIndex && !isNaN(Number(rawIndex))) {
//       const idx = Number(rawIndex);
//       indexRef.current = idx;
//       setCurrentIndex(idx);
//     }

//     const tidMatch =
//       msgPart.match(/Processing transactionId:\s*(\S+)/) ??
//       msgPart.match(/Processing\s+(\S+)/);
//     const tid = tidMatch?.[1] ?? "";
//     if (!tid) return;

//     setTransactions((prev) => [
//       {
//         index: Number(rawIndex) || 0,
//         tid,
//         status: getStatusType(rawStatus),
//         message: rawStatus || "Processing",
//         time: nowDate(),
//       },
//       ...prev,
//     ]);
//   };

//   // readStream — checks abortRef every chunk
//   const readStream = async (response: Response) => {
//     if (!response.body) return;
//     const reader = response.body.getReader();
//     readerRef.current = reader;
//     const decoder = new TextDecoder("utf-8");
//     let buffer = "";
//     try {
//       while (true) {
//         if (abortRef.current) {
//           reader.cancel();
//           break;
//         }

//         const { value, done } = await reader.read();
//         if (done) break;

//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split("\n");
//         if (
//           lines[0].split("|")[0].trim() === "data: Bulk checkstatus complete"
//         ) {
//           setIsCompleted(true);
//         }
//         buffer = lines.pop() ?? "";
//         for (const line of lines) parseLine(line);
//         await new Promise((r) => setTimeout(r, 0));
//       }
//       if (buffer && !abortRef.current) parseLine(buffer);
//     } catch (err) {
//       if (!abortRef.current) console.error("Stream error:", err);
//     }
//   };

//   // handleUpload — unchanged from doc3, + resets abortRef
//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a file");
//       return;
//     }

//     totalRef.current = 0;
//     indexRef.current = 0;
//     abortRef.current = false;
//     readerRef.current = null;
//     setTotalTransactions(0);
//     setCurrentIndex(0);
//     setTransactions([]);
//     setRemainingSeconds(0);
//     setSummary(null);
//     setIsCompleted(false);
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token") ?? "";
//       const formData = new FormData();
//       formData.append("file", file);
//       const response = await fetch(siteUrl + "admin/BulkCheckStatus/upload", {
//         method: "POST",
//         headers: { token },
//         body: formData,
//       });
//       await readStream(response);
//     } catch (err) {
//       console.error("Upload error:", err);
//     } finally {
//       if (!abortRef.current) {
//         setLoading(false);
//         setRemainingSeconds(0);
//       }
//     }
//   };

//   const hours = Math.floor(remainingSeconds / 3600);
//   const minutes = Math.floor((remainingSeconds % 3600) / 60);
//   const seconds = remainingSeconds % 60;
//   const progressPct =
//     totalTransactions > 0
//       ? Math.min(Math.round((currentIndex / totalTransactions) * 100), 100)
//       : 0;

//   return (
//     <div style={S.page}>
//       <div style={S.layout}>
//         {/* ══════════════ LEFT COLUMN ══════════════ */}
//         <div style={S.leftCol}>
//           <div style={S.card}>
//             <div style={S.blobTR} />
//             <div style={S.blobBL} />

//             <div style={S.iconCircle}>
//               <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   fill="none"
//                 />
//                 <path
//                   d="M14 2v6h6"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   fill="none"
//                 />
//                 <circle
//                   cx="10"
//                   cy="14"
//                   r="2.5"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   fill="none"
//                 />
//                 <path
//                   d="M13 16.5l1.5 1.5"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//               </svg>
//             </div>

//             <p style={S.chooseLabel}>Choose File</p>

//             <label style={S.uploadBox}>
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 style={{ marginBottom: 4 }}
//               >
//                 <path
//                   d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//                 <polyline
//                   points="17 8 12 3 7 8"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <line
//                   x1="12"
//                   y1="3"
//                   x2="12"
//                   y2="15"
//                   stroke="#9ca3af"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <span style={S.uploadText}>{file ? file.name : "Upload"}</span>
//               <input
//                 type="file"
//                 style={{ display: "none" }}
//                 onChange={(e: any) => setFile(e.target.files[0])}
//               />
//             </label>

//             {!loading ? (
//               <button style={S.submitBtn} onClick={handleUpload}>
//                 Submit
//               </button>
//             ) : (
//               <button
//                 style={{
//                   ...S.submitBtn,
//                   background: stopping ? "#9ca3af" : "#ef4444",
//                   cursor: stopping ? "not-allowed" : "pointer",
//                 }}
//                 onClick={handleStop}
//                 disabled={stopping}
//               >
//                 {stopping ? "Stopping..." : "Stop"}
//               </button>
//             )}

//             {loading && (
//               <div style={{ marginTop: 14 }}>
//                 <div style={S.progressTrack}>
//                   <div
//                     style={{ ...S.progressFill, width: `${progressPct}%` }}
//                   />
//                 </div>
//                 <p style={S.progressLabel}>
//                   {currentIndex.toLocaleString()} /{" "}
//                   {totalTransactions.toLocaleString()} · {progressPct}%
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Stat cards */}
//           <div style={S.statsRow}>
//             <div style={{ ...S.statCard, flex: 1 }}>
//               <div style={S.blobTR2} />
//               <div
//                 style={{
//                   ...S.statIcon,
//                   background: "linear-gradient(135deg,#f97316,#ef4444)",
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                   <rect
//                     x="2"
//                     y="7"
//                     width="20"
//                     height="14"
//                     rx="2"
//                     stroke="white"
//                     strokeWidth="1.5"
//                   />
//                   <path
//                     d="M16 7V5a2 2 0 0 0-4 0v2"
//                     stroke="white"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                   <circle cx="16" cy="14" r="1.5" fill="white" />
//                 </svg>
//               </div>
//               <p style={S.statLabel}>Total Transaction</p>
//               <p style={S.statValue}>
//                 {totalTransactions > 0
//                   ? totalTransactions.toLocaleString()
//                   : "00"}
//               </p>
//             </div>

//             <div style={{ ...S.statCard, flex: 1 }}>
//               <div style={S.blobTR2} />
//               <div
//                 style={{
//                   ...S.statIcon,
//                   background: "linear-gradient(135deg,#ef4444,#ec4899)",
//                 }}
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                   <circle
//                     cx="9"
//                     cy="7"
//                     r="4"
//                     stroke="white"
//                     strokeWidth="1.5"
//                   />
//                   <path
//                     d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
//                     stroke="white"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                   <path
//                     d="M16 11l2 2 4-4"
//                     stroke="white"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </div>
//               <p style={S.statLabel}>Current Transaction</p>
//               <p style={S.statValue}>
//                 {currentIndex > 0 ? currentIndex.toLocaleString() : "00"}
//               </p>
//             </div>
//           </div>

//           {/* Countdown card */}
//           <div style={S.countdownCard}>
//             <div style={S.blobBL2} />
//             <div style={S.clockWrap}>
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//                 <circle
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="#ef4444"
//                   strokeWidth="2"
//                 />
//                 <polyline
//                   points="12 6 12 12 16 14"
//                   stroke="#ef4444"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//             <p style={S.countdownLabel}>Live Countdown</p>
//             <div style={S.timerRow}>
//               {[
//                 { v: hours, l: "Hours" },
//                 { v: minutes, l: "Minutes" },
//                 { v: seconds, l: "Seconds" },
//               ].map((item, i) => (
//                 <React.Fragment key={i}>
//                   <div style={S.timerBlock}>
//                     <span style={S.timerNum}>
//                       {String(item.v).padStart(2, "0")}
//                     </span>
//                     <span style={S.timerLabel}>{item.l}</span>
//                   </div>
//                   {i < 2 && <span style={S.timerColon}>:</span>}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ══════════════ RIGHT COLUMN ══════════════ */}
//         {isCompleted ? (
//           <BulkCheck2 />
//         ) : (
//           <div style={S.rightCol}>
//             <p style={S.rightTitle}>Recent Transactions</p>
//             <p style={S.rightSubtitle}>
//               Track and monitor all your financial activities
//             </p>

//             {summary && (
//               <div style={S.summaryBanner}>
//                 <span>🎉</span>
//                 <span>{summary}</span>
//               </div>
//             )}

//             <div style={S.txList}>
//               {transactions.length === 0 ? (
//                 <div style={S.emptyState}>
//                   <svg
//                     width="44"
//                     height="44"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     style={{ marginBottom: 12 }}
//                   >
//                     <rect
//                       x="3"
//                       y="3"
//                       width="18"
//                       height="18"
//                       rx="3"
//                       stroke="#d1d5db"
//                       strokeWidth="1.5"
//                       fill="none"
//                     />
//                     <path
//                       d="M8 12h8M8 8h5M8 16h3"
//                       stroke="#d1d5db"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                   <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
//                     No transactions yet. Upload a file to begin.
//                   </p>
//                 </div>
//               ) : (
//                 transactions.map((tx) => (
//                   <div key={`${tx.index}-${tx.tid}`} style={S.txRow}>
//                     <div>
//                       <p style={S.txTitle}>Transaction #{tx.index}</p>
//                       <p style={S.txDate}>{tx.time}</p>
//                     </div>
//                     <div style={S.txRight}>
//                       <p style={S.txTid}>{tx.tid}</p>
//                       <p
//                         style={{
//                           ...S.txStatus,
//                           color: STATUS_COLOR[tx.status],
//                         }}
//                       >
//                         {STATUS_LABEL[tx.status]}
//                       </p>
//                       {tx.message && tx.message.toLowerCase() !== tx.status && (
//                         <p style={S.txMessage}>{tx.message}</p>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const S: Record<string, React.CSSProperties> = {
//   page: {
//     height: "100vh",
//     padding: "20px",
//     fontFamily: "'Segoe UI', system-ui, sans-serif",
//     boxSizing: "border-box",
//     overflow: "hidden",
//   },
//   layout: {
//     display: "flex",
//     gap: "20px",
//     height: "100%",
//     maxWidth: "1100px",
//     margin: "0 auto",
//   },
//   leftCol: {
//     width: "360px",
//     flexShrink: 0,
//     display: "flex",
//     flexDirection: "column",
//     gap: "14px",
//     // overflowY: "auto",
//   },
//   rightCol: {
//     flex: 1,
//     minWidth: 0,
//     display: "flex",
//     flexDirection: "column",
//     background: "white",
//     borderRadius: "20px",
//     padding: "22px 20px",
//     boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
//     overflow: "hidden",
//     height: "100%",
//   },
//   card: {
//     background: "white",
//     borderRadius: "20px",
//     padding: "26px 22px",
//     position: "relative",
//     overflow: "hidden",
//     textAlign: "center",
//     flexShrink: 0,
//     border: "1px solid #E5E7EB",
//   },
//   blobTR: {
//     position: "absolute",
//     top: -40,
//     right: -40,
//     width: 130,
//     height: 130,
//     borderRadius: "50%",
//     pointerEvents: "none",
//   },
//   blobBL: {
//     position: "absolute",
//     bottom: -25,
//     left: -25,
//     width: 90,
//     height: 90,
//     borderRadius: "50%",
//     pointerEvents: "none",
//   },
//   iconCircle: {
//     width: 76,
//     height: 76,
//     borderRadius: "50%",
//     background: "#f3f4f6",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     margin: "0 auto 14px",
//   },
//   chooseLabel: {
//     fontSize: 16,
//     fontWeight: 600,
//     color: "#111827",
//     margin: "0 0 14px",
//   },
//   uploadBox: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     border: "1.5px solid #e5e7eb",
//     borderRadius: "10px",
//     padding: "18px",
//     cursor: "pointer",
//     marginBottom: "14px",
//     background: "#fafafa",
//   },
//   uploadText: {
//     fontSize: 13,
//     color: "#9ca3af",
//     marginTop: 4,
//     maxWidth: 220,
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//   },
//   submitBtn: {
//     width: "100%",
//     padding: "12px",
//     background: "#22c55e",
//     color: "white",
//     border: "none",
//     borderRadius: "10px",
//     fontSize: 15,
//     fontWeight: 600,
//     cursor: "pointer",
//   },
//   progressTrack: {
//     height: 5,
//     background: "#e5e7eb",
//     borderRadius: 99,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     background: "linear-gradient(90deg,#ef4444,#dc2626)",
//     borderRadius: 99,
//     transition: "width 0.4s ease",
//   },
//   progressLabel: {
//     fontSize: 11,
//     color: "#6b7280",
//     margin: "5px 0 0",
//     textAlign: "center",
//   },
//   statsRow: { display: "flex", gap: "12px", flexShrink: 0 },
//   statCard: {
//     background: "white",
//     borderRadius: "16px",
//     padding: "18px 16px",
//     position: "relative",
//     overflow: "hidden",
//     border: "1px solid #E5E7EB",
//   },
//   blobTR2: {
//     position: "absolute",
//     top: -28,
//     right: -28,
//     width: 90,
//     height: 90,
//     borderRadius: "50%",
//     pointerEvents: "none",
//   },
//   statIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: "12px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 10,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#6b7280",
//     margin: "0 0 4px",
//     fontWeight: 500,
//   },
//   statValue: {
//     fontSize: 26,
//     fontWeight: 700,
//     color: "#111827",
//     margin: 0,
//     lineHeight: 1.2,
//   },
//   countdownCard: {
//     background: "white",
//     borderRadius: "16px",
//     padding: "20px 22px",
//     position: "relative",
//     overflow: "hidden",
//     textAlign: "center",
//     flexShrink: 0,
//     border: "1px solid #E5E7EB",
//   },
//   blobBL2: {
//     position: "absolute",
//     bottom: -40,
//     left: -40,
//     width: 130,
//     height: 130,
//     borderRadius: "50%",
//     pointerEvents: "none",
//   },
//   clockWrap: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     margin: "0 auto 10px",
//     width: 44,
//     height: 44,
//   },
//   countdownLabel: {
//     fontSize: 15,
//     fontWeight: 600,
//     color: "#374151",
//     margin: "0 0 18px",
//   },
//   timerRow: {
//     display: "flex",
//     alignItems: "flex-start",
//     justifyContent: "center",
//     gap: "2px",
//   },
//   timerBlock: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: 6,
//     minWidth: 72,
//   },
//   timerNum: {
//     fontSize: 52,
//     fontWeight: 700,
//     color: "#111827",
//     lineHeight: 1,
//     letterSpacing: "-1px",
//   },
//   timerLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 500 },
//   timerColon: {
//     fontSize: 44,
//     fontWeight: 700,
//     color: "#111827",
//     lineHeight: 1,
//     paddingTop: 2,
//   },
//   rightTitle: {
//     fontSize: 22,
//     fontWeight: 700,
//     color: "#111827",
//     margin: "0 0 4px",
//   },
//   rightSubtitle: { fontSize: 13, color: "#6b7280", margin: "0 0 16px" },
//   summaryBanner: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     background: "#f0fdf4",
//     border: "1px solid #bbf7d0",
//     borderRadius: 10,
//     padding: "10px 14px",
//     fontSize: 13,
//     color: "#15803d",
//     fontWeight: 500,
//     marginBottom: 12,
//     flexShrink: 0,
//   },
//   txList: {
//     flex: 1,
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: 0,
//     paddingRight: 4,
//     minHeight: 0,
//   },
//   emptyState: {
//     flex: 1,
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "60px 0",
//   },
//   txRow: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "14px 16px",
//     borderBottom: "1px solid #f3f4f6",
//     background: "white",
//     flexShrink: 0,
//   },
//   txTitle: { fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 },
//   txDate: { fontSize: 12, color: "#9ca3af", margin: "3px 0 0" },
//   txRight: { textAlign: "right" as const, flexShrink: 0 },
//   txTid: {
//     fontSize: 12,
//     fontFamily: "monospace",
//     color: "#374151",
//     margin: 0,
//     fontWeight: 500,
//   },
//   txStatus: { fontSize: 13, fontWeight: 600, margin: "3px 0 0" },
//   txMessage: {
//     fontSize: 11,
//     color: "#6b7280",
//     margin: "2px 0 0",
//     maxWidth: 220,
//     textAlign: "right",
//   },
// };

// export default BulkCheckStatus;
import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
// theme
import { brandPreset } from "src/components/settings/presets";
import BulkCheck2 from "./BulkCheck2";

type TxStatus = "success" | "pending" | "failed" | "info";

interface Transaction {
  index: number;
  tid: string;
  status: TxStatus;
  message: string;
  time: string;
}

const getStatusType = (status: string, message: string): TxStatus => {
  const s = status.toLowerCase().trim();
  const m = message.toLowerCase().trim();

  if (s === "success") return "success";

  if (
    s === "failed" 
    // m.includes("failed") ||
    // m.includes("error") ||
    // m.includes("not allowed") ||
    // m.includes("no api") ||
    // m.includes("configuration") ||
    // m.includes("cannot read")
  ) {
    return "failed";
  }

  if (s === "pending" || m.includes("check after")) {
    return "pending";
  }

  return "info";
};

const STATUS_COLOR: Record<TxStatus, string> = {
  success: "#16a34a",
  pending: "#d97706",
  failed: "#dc2626",
  info: brandPreset.main,
};

const STATUS_LABEL: Record<TxStatus, string> = {
  success: "Success",
  pending: "Pending",
  failed: "Failed",
  info: "Info",
};

const nowDate = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const BulkCheckStatus = () => {
  const siteUrl = process.env.REACT_APP_BASE_URL;
  const { Api } = useAuthContext();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalRef = useRef(0);
  const indexRef = useRef(0);
  const abortRef = useRef(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null,
  );

  // Countdown ticker
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      if (totalRef.current > 0) {
        const rem = Math.max(totalRef.current - indexRef.current, 0);
        setRemainingSeconds(Math.ceil(rem / 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Stop job on mount
  useEffect(() => {
    const stop = async () => {
      try {
        const token = localStorage.getItem("token") ?? "";
        await fetch(siteUrl + "admin/BulkCheckStatus/stop-jobStatus", {
          method: "GET",
          headers: { "Content-Type": "application/json", token },
        });
      } catch {}
    };
    stop();
  }, []);

  const handleStop = async () => {
    setStopping(true);
    abortRef.current = true;
    try {
      readerRef.current?.cancel();
    } catch {}
    try {
      const token = localStorage.getItem("token") ?? "";
      await fetch(siteUrl + "admin/BulkCheckStatus/stop-jobStatus", {
        method: "GET",
        headers: { "Content-Type": "application/json", token },
      });
    } catch (err) {
      console.error("Stop error:", err);
    } finally {
      setLoading(false);
      setRemainingSeconds(0);
      setStopping(false);
      setIsCompleted(true);
    }
  };

  const parseLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === ":") return;

    if (trimmed.toLowerCase().includes("bulk checkstatus complete")) {
      setSummary(trimmed.replace(/^data:\s*/i, ""));
      setIsCompleted(true);
      return;
    }

    if (!trimmed.includes("|")) return;

    // Format: total|index|data: Processing TID|STATUS|message
    const parts = trimmed.split("|");
    // parts[0] = total, parts[1] = index,
    // parts[2] = "data: Processing TID",
    // parts[3] = status (success/pending/failed),
    // parts[4+] = message text (may contain | itself)

    if (parts.length < 3) return;

    const rawTotal = parts[0].trim();
    const rawIndex = parts[1].trim();
    const msgPart = parts[2].trim(); // "data: Processing TID"
    const rawStatus = parts.length >= 4 ? parts[3].trim() : ""; // "success" | "pending" | "failed"
    const rawMessage = parts.length >= 5 ? parts.slice(4).join("|").trim() : ""; // full message

    if (rawTotal && !isNaN(Number(rawTotal)) && Number(rawTotal) > 0) {
      const t = Number(rawTotal);
      if (t !== totalRef.current) {
        totalRef.current = t;
        setTotalTransactions(t);
        if (indexRef.current === 0) setRemainingSeconds(Math.ceil(t / 2));
      }
    }

    if (rawIndex && !isNaN(Number(rawIndex))) {
      const idx = Number(rawIndex);
      indexRef.current = idx;
      setCurrentIndex(idx);
    }

    const tidMatch =
      msgPart.match(/Processing transactionId:\s*(\S+)/) ??
      msgPart.match(/Processing\s+(\S+)/);
    const tid = tidMatch?.[1] ?? "";
    if (!tid) return;

    setTransactions((prev) => [
      {
        index: Number(rawIndex) || 0,
        tid,
        status: getStatusType(rawStatus, rawMessage),
        message: rawMessage || rawStatus || "Processing",
        time: nowDate(),
      },
      ...prev,
    ]);
  };

  const readStream = async (response: Response) => {
    if (!response.body) return;
    const reader = response.body.getReader();
    readerRef.current = reader;
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    try {
      while (true) {
        if (abortRef.current) {
          reader.cancel();
          break;
        }
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        if (
          lines[0].split("|")[0].trim() === "data: Bulk checkstatus complete"
        ) {
          setIsCompleted(true);
        }
        buffer = lines.pop() ?? "";
        for (const line of lines) parseLine(line);
        await new Promise((r) => setTimeout(r, 0));
      }
      if (buffer && !abortRef.current) parseLine(buffer);
    } catch (err) {
      if (!abortRef.current) console.error("Stream error:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    totalRef.current = 0;
    indexRef.current = 0;
    abortRef.current = false;
    readerRef.current = null;
    setTotalTransactions(0);
    setCurrentIndex(0);
    setTransactions([]);
    setRemainingSeconds(0);
    setSummary(null);
    setIsCompleted(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(siteUrl + "admin/BulkCheckStatus/upload", {
        method: "POST",
        headers: { token },
        body: formData,
      });
      await readStream(response);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      if (!abortRef.current) {
        setLoading(false);
        setRemainingSeconds(0);
      }
    }
  };

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const progressPct =
    totalTransactions > 0
      ? Math.min(Math.round((currentIndex / totalTransactions) * 100), 100)
      : 0;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.layout}>
        {/* ══ LEFT COLUMN ══ */}
        <div style={S.leftCol}>
          {/* Upload card */}
          <div style={S.card}>
            <div style={S.blobTR} />
            <div style={S.blobBL} />
            <div style={S.iconCircle}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M14 2v6h6"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="10"
                  cy="14"
                  r="2.5"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M13 16.5l1.5 1.5"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p style={S.chooseLabel}>Choose File</p>
            <label style={S.uploadBox}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginBottom: 4 }}
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <polyline
                  points="17 8 12 3 7 8"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="15"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span style={S.uploadText}>{file ? file.name : "Upload"}</span>
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e: any) => setFile(e.target.files[0])}
              />
            </label>

            {/* Submit → green | Stop → red */}
            {!loading ? (
              <button style={S.submitBtn} onClick={handleUpload}>
                Submit
              </button>
            ) : (
              <button
                style={{
                  ...S.submitBtn,
                  background: stopping ? "#9ca3af" : "#ef4444",
                  cursor: stopping ? "not-allowed" : "pointer",
                }}
                onClick={handleStop}
                disabled={stopping}
              >
                {stopping ? "Stopping..." : "Stop"}
              </button>
            )}

            {loading && (
              <div style={{ marginTop: 14 }}>
                <div style={S.progressTrack}>
                  <div
                    style={{ ...S.progressFill, width: `${progressPct}%` }}
                  />
                </div>
                <p style={S.progressLabel}>
                  {currentIndex.toLocaleString()} /{" "}
                  {totalTransactions.toLocaleString()} · {progressPct}%
                </p>
              </div>
            )}
          </div>

          {/* Stat cards */}
          <div style={S.statsRow}>
            <div style={{ ...S.statCard, flex: 1 }}>
              <div style={S.blobTR2} />
              <div
                style={{
                  ...S.statIcon,
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="7"
                    width="20"
                    height="14"
                    rx="2"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16 7V5a2 2 0 0 0-4 0v2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="16" cy="14" r="1.5" fill="white" />
                </svg>
              </div>
              <p style={S.statLabel}>Total Transaction</p>
              <p style={S.statValue}>
                {totalTransactions > 0
                  ? totalTransactions.toLocaleString()
                  : "00"}
              </p>
            </div>
            <div style={{ ...S.statCard, flex: 1 }}>
              <div style={S.blobTR2} />
              <div
                style={{
                  ...S.statIcon,
                  background: "linear-gradient(135deg,#ef4444,#ec4899)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 11l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p style={S.statLabel}>Current Transaction</p>
              <p style={S.statValue}>
                {currentIndex > 0 ? currentIndex.toLocaleString() : "00"}
              </p>
            </div>
          </div>

          {/* Countdown card */}
          <div style={S.countdownCard}>
            <div style={S.blobBL2} />
            <div style={S.clockWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                <polyline
                  points="12 6 12 12 16 14"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p style={S.countdownLabel}>Live Countdown</p>
            <div style={S.timerRow}>
              {[
                { v: hours, l: "Hours" },
                { v: minutes, l: "Minutes" },
                { v: seconds, l: "Seconds" },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  <div style={S.timerBlock}>
                    <span style={S.timerNum}>
                      {String(item.v).padStart(2, "0")}
                    </span>
                    <span style={S.timerLabel}>{item.l}</span>
                  </div>
                  {i < 2 && <span style={S.timerColon}>:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        {isCompleted ? (
          <BulkCheck2 />
        ) : (
          <div style={S.rightCol}>
            <p style={S.rightTitle}>Recent Transactions</p>
            <p style={S.rightSubtitle}>
              Track and monitor all your financial activities
            </p>

            {summary && (
              <div style={S.summaryBanner}>
                <span>🎉</span>
                <span>{summary}</span>
              </div>
            )}

            <div style={S.txList}>
              {transactions.length === 0 ? (
                <div style={S.emptyState}>
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginBottom: 12 }}
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="3"
                      stroke="#d1d5db"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M8 12h8M8 8h5M8 16h3"
                      stroke="#d1d5db"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
                    No transactions yet. Upload a file to begin.
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={`${tx.index}-${tx.tid}`} style={S.txRow}>
                    {/* Left: Transaction title + date */}
                    <div style={S.txLeft}>
                      <p style={S.txTitle}>Transaction #{tx.index}</p>
                      <p style={S.txDate}>{tx.time}</p>
                    </div>

                    {/* Right: status label + message below */}
                    <div style={S.txRight}>
                      <p
                        style={{
                          ...S.txStatus,
                          color: STATUS_COLOR[tx.status],
                        }}
                      >
                        {STATUS_LABEL[tx.status]}
                      </p>
                      {tx.message && tx.message.toLowerCase() !== tx.status && (
                        <p style={S.txMessage}>{tx.message}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  /* Page — fills 100% of parent, no outer scroll */
  page: {
    height: "100vh",
    overflow: "hidden",
    padding: "clamp(12px, 1.5vw, 24px)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    boxSizing: "border-box",
  },

  layout: {
    display: "flex",
    gap: "clamp(12px, 1.5vw, 24px)",
    height: "100%",
    minHeight: 0,
  },

  leftCol: {
    width: "clamp(260px, 30vw, 420px)",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "clamp(10px, 1.2vw, 16px)",
    // overflowY: "auto",
  },

  rightCol: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background: "white",
    borderRadius: "20px",
    padding: "clamp(16px, 2vw, 28px)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },

  card: {
    background: "white",
    borderRadius: "20px",
    padding: "clamp(18px, 2vw, 28px) clamp(16px, 2vw, 26px)",
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    flexShrink: 0,
    border: "1px solid #E5E7EB",
  },
  blobTR: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: "50%",
    pointerEvents: "none",
  },
  blobBL: {
    position: "absolute",
    bottom: -25,
    left: -25,
    width: 90,
    height: 90,
    borderRadius: "50%",
    pointerEvents: "none",
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: "50%",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  chooseLabel: {
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 14px",
  },
  uploadBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px",
    cursor: "pointer",
    marginBottom: "14px",
    background: "#fafafa",
  },
  uploadText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 4,
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  progressTrack: {
    height: 5,
    background: "#e5e7eb",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#ef4444,#dc2626)",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
    margin: "5px 0 0",
    textAlign: "center",
  },

  statsRow: { display: "flex", gap: "clamp(8px, 1vw, 14px)", flexShrink: 0 },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "clamp(14px, 1.5vw, 20px) clamp(12px, 1.3vw, 18px)",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #E5E7EB",
  },
  blobTR2: {
    position: "absolute",
    top: -28,
    right: -28,
    width: 90,
    height: 90,
    borderRadius: "50%",
    pointerEvents: "none",
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: "#6b7280",
    margin: "0 0 4px",
    fontWeight: 500,
  },
  statValue: {
    fontSize: "clamp(20px, 2.2vw, 28px)" as any,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    lineHeight: 1.2,
  },

  countdownCard: {
    background: "white",
    borderRadius: "16px",
    padding: "clamp(16px, 1.8vw, 24px) clamp(14px, 1.8vw, 24px)",
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    flexShrink: 0,
    border: "1px solid #E5E7EB",
  },
  blobBL2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: "50%",
    pointerEvents: "none",
  },
  clockWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    width: 44,
    height: 44,
  },
  countdownLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#374151",
    margin: "0 0 18px",
  },
  timerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "2px",
  },
  timerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    minWidth: "clamp(56px, 6vw, 80px)" as any,
  },
  timerNum: {
    fontSize: "clamp(36px, 4.5vw, 56px)" as any,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
    letterSpacing: "-1px",
  },
  timerLabel: { fontSize: 13, color: "#9ca3af", fontWeight: 500 },
  timerColon: {
    fontSize: "clamp(30px, 3.8vw, 48px)" as any,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
    paddingTop: 2,
  },

  rightTitle: {
    fontSize: "clamp(18px, 2vw, 24px)" as any,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px",
    flexShrink: 0,
  },
  rightSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    margin: "0 0 16px",
    flexShrink: 0,
  },
  summaryBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 15,
    color: "#15803d",
    fontWeight: 500,
    marginBottom: 12,
    flexShrink: 0,
  },

  txList: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    paddingRight: 6,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },

  txRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(10px, 1.2vw, 16px) clamp(12px, 1.5vw, 20px)",
    borderBottom: "1px solid #f3f4f6",
    background: "white",
    flexShrink: 0,
  },
  txLeft: { flex: 1, minWidth: 0 },
  txTitle: { fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 },
  txDate: {
    fontSize: 15,
    color: "#9ca3af",
    margin: "3px 0 0",
    fontWeight: 400,
  },

  txRight: { textAlign: "right" as const, flexShrink: 0, marginLeft: 12 },
  txStatus: { fontSize: 16, fontWeight: 600, margin: 0 },
  txMessage: {
    fontSize: 15,
    color: "#6b7280",
    margin: "3px 0 0",
    maxWidth: 260,
    textAlign: "right" as const,
    fontWeight: 500,
  },
};

export default BulkCheckStatus;
