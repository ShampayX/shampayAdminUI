// // routes
// import { PATH_DASHBOARD } from "../../../routes/paths";
// // components
// import SvgColor from "../../../components/svg-color";

// // i want to add this
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import InsightsIcon from "@mui/icons-material/Insights";
// import ReportIcon from "@mui/icons-material/Report";
// import GroupAddIcon from "@mui/icons-material/GroupAdd";
// import WalletIcon from "@mui/icons-material/Wallet";
// import ConstructionIcon from "@mui/icons-material/Construction";
// import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
// import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
// import StorefrontIcon from "@mui/icons-material/Storefront";
// import BusinessIcon from "@mui/icons-material/Business";

// import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

// import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

// import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

// import HandshakeIcon from "@mui/icons-material/Handshake";

// import SyncIcon from "@mui/icons-material/Sync";

// import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";

// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

// import BarChartIcon from "@mui/icons-material/BarChart";
// import { title } from "process";
// import path from "path";
// import { Children } from "react";

// // import GroupAddIcon from '@mui/icons-material/GroupAdd';

// // ----------------------------------------------------------------------

// const icon = (name: string) => (
//   <SvgColor
//     src={`/assets/icons/navbar/${name}.svg`}
//     sx={{ width: 1, height: 1 }}
//   />
// );

// const ICONS = {
//   user: icon("ic_user"),
//   ecommerce: icon("ic_ecommerce"),
//   // analytics: icon("ic_analytics"),
//   dashboard: <DashboardIcon />,
//   insights: <BarChartIcon />,
//   report: <ReportIcon />,
//   vendor: <BusinessIcon />,
//   scheme: <AssignmentTurnedInIcon />,

//   fund: <CurrencyRupeeIcon />,
//   newlead: <GroupAddIcon />,
//   bbps: <ReceiptLongIcon />,

//   group: <HandshakeIcon />,
//   wallet: <WalletIcon />,
//   autocollect: <PublishedWithChangesIcon />,
//   construction: <ConstructionIcon />,
//   search: <ContentPasteSearchIcon />,
//   document: <DocumentScannerIcon />,
//   mail: icon("ic_dashboard"),
// };

// const navConfig = [
//   // GENERAL
//   // ----------------------------------------------------------------------
//   {
//     subheader: "",
//     items: [
//       {
//         title: "Dashboard",
//         path: PATH_DASHBOARD.dashboard,
//         icon: ICONS.dashboard,
//       },
//       {
//         title: "analytics",
//         path: PATH_DASHBOARD.analytics,
//         icon: ICONS.insights,
//       },
//       // {
//       //   title: "New Leads",
//       //   path: PATH_DASHBOARD.newleads,
//       //   icon: ICONS.newlead,
//       // },
//       {
//         title: "Our Network",
//         path: PATH_DASHBOARD.ournetwork,
//         icon: ICONS.group,
//       },
//       // {
//       //   title: "User Vendor Switch",
//       //   path: PATH_DASHBOARD.userwise,
//       //   icon: ICONS.vendor,
//       // },
//       {
//         title: "User Management",
//         icon: ICONS.user,
//         path: PATH_DASHBOARD.usermanagement.root,
//         children: [
//           {
//             title: "User Wise Limit",
//             path: PATH_DASHBOARD.usermanagement.userwiselimit,
//           },
//           {
//             title: "User Wise Vendor",
//             path: PATH_DASHBOARD.usermanagement.userwisevendor,
//           },
//         ],
//       },

//       // {
//       //   title: "User Wise Limit",
//       //   path: PATH_DASHBOARD.usersetlimit,
//       //   icon: ICONS.user,
//       // },

//       {
//         title: "reports",
//         path: PATH_DASHBOARD.reports.root,
//         icon: ICONS.report,
//         children: [
//           {
//             title: "All Transaction Records ",
//             path: PATH_DASHBOARD.reports.alltransactionrecord,
//           },
//           {
//             title: "Track Transactions ",
//             path: PATH_DASHBOARD.reports.tracktransactions,
//           },
//           {
//             title: "Fund Flow Transactions",
//             path: PATH_DASHBOARD.reports.fundflow,
//           },

//           {
//             title: "Wallet Ladger ",
//             path: PATH_DASHBOARD.reports.WalletLadger,
//           },
//           {
//             title: "Hold duplicate Transaction Limit ",
//             path: PATH_DASHBOARD.reports.WaitingAreaForDuplicateTxn,
//           },
//           {
//             title: "Historical Data Exports ",
//             path: PATH_DASHBOARD.reports.HistoricalDataExport,
//           },
//           {
//             title: "Instant Report Download",
//             path: PATH_DASHBOARD.reports.AccountStatement,
//           },
//           // {
//           //   title: " TDS & GST New Historical Report",
//           //   path: PATH_DASHBOARD.reports.TdsGstReport,
//           // },
//           {
//             title: "UserWise Opening Balance",
//             path: PATH_DASHBOARD.reports.UserWiseClosingBal,
//           },
//           // {
//           //   title: "GST Ladger ",
//           //   path: PATH_DASHBOARD.reports.GSTLadger,
//           // },
//           // {
//           //   title: "TDS Ladger ",
//           //   path: PATH_DASHBOARD.reports.TDSLadger,
//           // },
//           // {
//           //   title: "Temporary Report Export ",
//           //   path: PATH_DASHBOARD.reports.Temporaryreport,
//           // },
//         ],
//       },
//       {
//         title: "Scheme Management",
//         path: PATH_DASHBOARD.scheme.root,
//         icon: ICONS.scheme,
//         children: [
//           { title: "Manage Scheme", path: PATH_DASHBOARD.scheme.allscheme },
//           { title: "Map Scheme", path: PATH_DASHBOARD.scheme.MapSchemeSetting },
//           {
//             title: "Manage BBPS Scheme",
//             path: PATH_DASHBOARD.scheme.AllbbpsScheme,
//           },
//           {
//             title: "Map BBPS Scheme",
//             path: PATH_DASHBOARD.scheme.mapbbpsScheme,
//           },
//           {
//             title: "Manage Loan Scheme",
//             path: PATH_DASHBOARD.scheme.AllLaonScheme,
//           },
//           {
//             title: "Map Loan Scheme",
//             path: PATH_DASHBOARD.scheme.maploanscheme,
//           },
//         ],
//       },
//       // {
//       //   title: "Product Managments",
//       //   path: PATH_DASHBOARD.product.root,
//       //   icon: ICONS.mail,
//       //   children: [
//       //     {
//       //       title: "Add New Product",
//       //       path: PATH_DASHBOARD.product.productmanagement,
//       //     },
//       //     {
//       //       title: "Assign Vendor",
//       //       path: PATH_DASHBOARD.product.assignvendor,
//       //     },
//       //     {
//       //       title: "Map Short Code",
//       //       path: PATH_DASHBOARD.product.mapshortcode,
//       //     },
//       //   ],
//       // },
//       {
//         title: "Vendor Management",
//         path: PATH_DASHBOARD.vendor.root,
//         icon: ICONS.vendor,
//         children: [
//           {
//             title: "Add New Vendor",
//             path: PATH_DASHBOARD.vendor.vendormanagement,
//           },
//           {
//             title: "Credit Card Slots",
//             path: PATH_DASHBOARD.vendor.creditcardslots,
//           },
//           {
//             title: "Money Transfer Slots",
//             path: PATH_DASHBOARD.vendor.moneytransferslots,
//           },
//           {
//             title: "Vendor Payment Slots",
//             path: PATH_DASHBOARD.vendor.vendorpaymentslots,
//           },
//           {
//             title: "DMT1 Slots",
//             path: PATH_DASHBOARD.vendor.dmtslots,
//           },
//           {
//             title: "DMT2 Slots",
//             path: PATH_DASHBOARD.vendor.dmt2slots,
//           },
//           // {
//           //   title: "AEPS Slots",
//           //   path: PATH_DASHBOARD.vendor.aepsslots,
//           // },
//           {
//             title: "New AEPS Slots",
//             path: PATH_DASHBOARD.vendor.newaepsslots,
//           },
//           {
//             title: "PBPS Slots",
//             path: PATH_DASHBOARD.vendor.pbpsslots,
//           },
//           {
//             title: "BBPS Slots",
//             path: PATH_DASHBOARD.vendor.bbpslots,
//           },
//           {
//             title: "Plan Fetch Records",
//             path: PATH_DASHBOARD.vendor.mplan,
//           },
//           {
//             title: "Transfer Slots",
//             path: PATH_DASHBOARD.vendor.transferslots,
//           },
//           {
//             title: "Payout Slots",
//             path: PATH_DASHBOARD.vendor.payoutslots,
//           },
//           {
//             title: "Payout UPI Slots",
//             path: PATH_DASHBOARD.vendor.payoutupislots,
//           },
//           {
//             title: "ADMT Slots",
//             path: PATH_DASHBOARD.vendor.admtslots,
//           },
//         ],
//       },
//       {
//         title: "Fund Management",
//         path: PATH_DASHBOARD.fundmanagement.root,
//         icon: ICONS.fund,
//         children: [
//           {
//             title: "Add New Bank",
//             path: PATH_DASHBOARD.fundmanagement.addbank,
//           },
//           {
//             title: "Admin Fund Flow",
//             path: PATH_DASHBOARD.fundmanagement.adminfundflow,
//           },
//           {
//             title: "Fund Requests",
//             path: PATH_DASHBOARD.fundmanagement.fundrequest,
//           },
//         ],
//       },
//       // {
//       //   title: "Wallet Management",
//       //   path: PATH_DASHBOARD.walletmanagement.root,
//       //   icon: ICONS.wallet,
//       //   children: [
//       //     {
//       //       title: "Main Wallet",
//       //       path: PATH_DASHBOARD.walletmanagement.mainwallet,
//       //     },
//       //     {
//       //       title: "TDS Wallet",
//       //       path: PATH_DASHBOARD.walletmanagement.tdswallet,
//       //     },
//       //     {
//       //       title: "GST Wallet",
//       //       path: PATH_DASHBOARD.walletmanagement.gstwallet,
//       //     },
//       //   ],
//       // },
//       // {
//       //   title: "BBPS Management",
//       //   path: PATH_DASHBOARD.bbps.bbpsmanagement,
//       //   icon: ICONS.dashboard,
//       // },

//       {
//         title: "BBPS Management",
//         path: PATH_DASHBOARD.bbps.bbpsmamagements,
//         icon: ICONS.bbps,
//         children: [
//           {
//             title: "BBPS",
//             path: PATH_DASHBOARD.bbps.bbpsmamagements,
//           },
//           {
//             title: "BBPS Products",
//             path: PATH_DASHBOARD.bbps.bbpsproducts,
//           },
//         ],
//       },

//       // {
//       //   title: "Auto Collect",
//       //   path: PATH_DASHBOARD.autocollect.addautocollect,
//       //   icon: ICONS.autocollect,
//       //   children: [
//       //     {
//       //       title: "Add Auto Collect Services",
//       //       path: PATH_DASHBOARD.autocollect.addautocollect,
//       //     },
//       //     {
//       //       title: "Services",
//       //       path: PATH_DASHBOARD.autocollect.services,
//       //     },
//       //     {
//       //       title: "Auto Collect Table",
//       //       path: PATH_DASHBOARD.autocollect.autocollecttable,
//       //     },
//       //   ],
//       // },

//       // {
//       //   title: "Roll Management",
//       //   path: PATH_DASHBOARD.rollmanagement,
//       //   icon: ICONS.dashboard,
//       // },

//       // {
//       //   title: "Content Management",
//       //   path: PATH_DASHBOARD.contentmanagement.root,
//       //   icon: ICONS.search,
//       //   children: [
//       //     {
//       //       title: "FAQ Management",
//       //       path: PATH_DASHBOARD.contentmanagement.faqmanagement,
//       //     },
//       //     {
//       //       title: "Update Images",
//       //       path: PATH_DASHBOARD.contentmanagement.updateimage,
//       //     },
//       //   ],
//       // },
//       {
//         title: "Tools",
//         path: PATH_DASHBOARD.tools.root,
//         icon: ICONS.construction,
//         children: [
//           {
//             title: "SMS/Email Management ",
//             path: PATH_DASHBOARD.tools.smsmanagement,
//           },
//           { title: "Approve User PAN", path: PATH_DASHBOARD.tools.panvarified },
//           { title: "Update DocuSign", path: PATH_DASHBOARD.tools.docusign },
//           { title: "Vendor Switch ", path: PATH_DASHBOARD.tools.vendorswitch },
//           { title: "Bank Master ", path: PATH_DASHBOARD.tools.bankmaster },
//           { title: "ReProcess", path: PATH_DASHBOARD.tools.detailofids },
//           { title: "NewsFlash", path: PATH_DASHBOARD.tools.newsflash },
//           { title: "NewsSummary", path: PATH_DASHBOARD.tools.newssummary },
//           {
//             title: "Enable/Disable categories",
//             path: PATH_DASHBOARD.tools.enablediscategories,
//           },
//           {
//             title: "Wallet To Wallet Control",
//             path: PATH_DASHBOARD.tools.walletToWallet,
//           },
//           { title: "AEPS", path: PATH_DASHBOARD.tools.aeps },
//           { title: "Other ", path: PATH_DASHBOARD.tools.Other },
//         ],
//       },

//       // {
//       //   title: "testreports",
//       //   path: PATH_DASHBOARD.testreports.root,
//       //   icon: ICONS.mail,
//       //   children: [
//       //     {
//       //       title: "All Transaction Records",
//       //       path: PATH_DASHBOARD.testreports.alltransactionrecordtest,
//       //     },
//       //     {
//       //       title: "Fund Reports",
//       //       path: PATH_DASHBOARD.testreports.fundreports,
//       //     },
//       //   ],
//       // },
//       {
//         title: "Doc Api Reference",
//         path: PATH_DASHBOARD.docapireference,
//         icon: ICONS.document,
//       },
//       // {
//       //   title: "Sales Management",
//       //   path: PATH_DASHBOARD.salesmanagement,
//       //   icon: ICONS.dashboard,
//       // },
//     ],
//   },

//   // MANAGEMENT
//   // ----------------------------------------------------------------------
//   // {
//   //   subheader: "management",
//   //   items: [
//   //     {
//   //       title: "user",
//   //       path: PATH_DASHBOARD.user.root,
//   //       icon: ICONS.user,
//   //       children: [
//   //         { title: "Four", path: PATH_DASHBOARD.user.four },
//   //         { title: "Five", path: PATH_DASHBOARD.user.five },
//   //         { title: "Six", path: PATH_DASHBOARD.user.six },
//   //       ],
//   //     },
//   //   ],
//   // },
// ];

// export default navConfig;

// routes
import { PATH_DASHBOARD } from "../../../routes/paths";
// components
import SvgColor from "../../../components/svg-color";

// i want to add this
import DashboardIcon from "@mui/icons-material/Dashboard";
import InsightsIcon from "@mui/icons-material/Insights";
import ReportIcon from "@mui/icons-material/Report";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import WalletIcon from "@mui/icons-material/Wallet";
import ConstructionIcon from "@mui/icons-material/Construction";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BusinessIcon from "@mui/icons-material/Business";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import HandshakeIcon from "@mui/icons-material/Handshake";

import SyncIcon from "@mui/icons-material/Sync";

import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import BarChartIcon from "@mui/icons-material/BarChart";
import { title } from "process";
import path from "path";
import { Children } from "react";

// import GroupAddIcon from '@mui/icons-material/GroupAdd';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const ICONS = {
  user: icon("ic_user"),
  ecommerce: icon("ic_ecommerce"),
  // analytics: icon("ic_analytics"),
  dashboard: <DashboardIcon />,
  insights: <BarChartIcon />,
  report: <ReportIcon />,
  vendor: <BusinessIcon />,
  scheme: <AssignmentTurnedInIcon />,

  fund: <CurrencyRupeeIcon />,
  newlead: <GroupAddIcon />,
  bbps: <ReceiptLongIcon />,

  group: <HandshakeIcon />,
  wallet: <WalletIcon />,
  autocollect: <PublishedWithChangesIcon />,
  construction: <ConstructionIcon />,
  search: <ContentPasteSearchIcon />,
  document: <DocumentScannerIcon />,
  mail: icon("ic_dashboard"),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: "",
    items: [
      {
        title: "Dashboard",
        path: PATH_DASHBOARD.dashboard,
        icon: ICONS.dashboard,
      },
      // {
      //   title: "New Leads",
      //   path: PATH_DASHBOARD.newleads,
      //   icon: ICONS.newlead,
      // },
      {
        title: "Our Network",
        path: PATH_DASHBOARD.ournetwork,
        icon: ICONS.group,
      },
      // {
      //   title: "User Vendor Switch",
      //   path: PATH_DASHBOARD.userwise,
      //   icon: ICONS.vendor,
      // },
      {
        title: "User Management",
        icon: ICONS.user,
        path: PATH_DASHBOARD.usermanagement.root,
        children: [
          {
            title: "User Wise Limit",
            path: PATH_DASHBOARD.usermanagement.userwiselimit,
          },
          {
            title: "User Wise Vendor",
            path: PATH_DASHBOARD.usermanagement.userwisevendor,
          },
        ],
      },

      {
        title: "Role Management",
        path: PATH_DASHBOARD.rolemanagement,
        icon: ICONS.user,
      },

      // {
      //   title: "User Wise Limit",
      //   path: PATH_DASHBOARD.usersetlimit,
      //   icon: ICONS.user,
      // },

      {
        title: "reports",
        path: PATH_DASHBOARD.reports.root,
        icon: ICONS.report,
        children: [
          {
            title: "All Transaction Records ",
            path: PATH_DASHBOARD.reports.alltransactionrecord,
          },
          {
            title: "Track Transactions ",
            path: PATH_DASHBOARD.reports.tracktransactions,
          },
          {
            title: "Fund Flow Transactions",
            path: PATH_DASHBOARD.reports.fundflow,
          },

          {
            title: "Wallet Ladger ",
            path: PATH_DASHBOARD.reports.WalletLadger,
          },
          /* "Hold duplicate Transaction Limit " (Duplicate Holds) and
             "Instant Report Download" (Quick Downloads) were removed from the
             Records menu. Their routes, pages and APIs are untouched, so the
             screens stay reachable by URL - re-add an entry here to bring one
             back. */
          {
            title: "Historical Data Exports ",
            path: PATH_DASHBOARD.reports.HistoricalDataExport,
          },
          // {
          //   title: " TDS & GST New Historical Report",
          //   path: PATH_DASHBOARD.reports.TdsGstReport,
          // },
          {
            title: "UserWise Opening Balance",
            path: PATH_DASHBOARD.reports.UserWiseClosingBal,
          },
          // {
          //   title: "GST Ladger ",
          //   path: PATH_DASHBOARD.reports.GSTLadger,
          // },
          // {
          //   title: "TDS Ladger ",
          //   path: PATH_DASHBOARD.reports.TDSLadger,
          // },
          // {
          //   title: "Temporary Report Export ",
          //   path: PATH_DASHBOARD.reports.Temporaryreport,
          // },
        ],
      },
      {
        title: "Scheme Management",
        path: PATH_DASHBOARD.scheme.root,
        icon: ICONS.scheme,
        children: [
          { title: "Manage Scheme", path: PATH_DASHBOARD.scheme.allscheme },
          { title: "Map Scheme", path: PATH_DASHBOARD.scheme.MapSchemeSetting },
          {
            title: "Manage BBPS Scheme",
            path: PATH_DASHBOARD.scheme.AllbbpsScheme,
          },
          {
            title: "Map BBPS Scheme",
            path: PATH_DASHBOARD.scheme.mapbbpsScheme,
          },
          {
            title: "Manage Loan Scheme",
            path: PATH_DASHBOARD.scheme.AllLaonScheme,
          },
          {
            title: "Map Loan Scheme",
            path: PATH_DASHBOARD.scheme.maploanscheme,
          },
        ],
      },
      // {
      //   title: "Product Managments",
      //   path: PATH_DASHBOARD.product.root,
      //   icon: ICONS.mail,
      //   children: [
      //     {
      //       title: "Add New Product",
      //       path: PATH_DASHBOARD.product.productmanagement,
      //     },
      //     {
      //       title: "Assign Vendor",
      //       path: PATH_DASHBOARD.product.assignvendor,
      //     },
      //     {
      //       title: "Map Short Code",
      //       path: PATH_DASHBOARD.product.mapshortcode,
      //     },
      //   ],
      // },
      {
        // ------------------------------------------------------------------
        // Providers (labelled by NAV_META in NavSidebar.tsx).
        //
        // This used to be fifteen entries: an Add New Vendor screen, Plan
        // Fetch Records, and thirteen per-service "Slots" screens - eleven of
        // which were the same file with two endpoint names swapped.
        //
        // They are now four screens. The removed entries were:
        //
        //   Add New Vendor        -> Provider Directory (list + add + edit)
        //   Credit Card Slots     -> Service Configuration ?service=credit-card
        //   Money Transfer Slots  -> ...                  ?service=money-transfer
        //   Vendor Payment Slots  -> ...                  ?service=vendor-payments
        //   DMT1 Slots            -> ...                  ?service=dmt1
        //   DMT2 Slots            -> ...                  ?service=dmt2
        //   Payin Slots           -> ...                  ?service=payin
        //   New AEPS Slots        -> ...                  ?service=aeps
        //   PBPS Slots            -> ...                  ?service=pbps
        //   BBPS Slots            -> ...                  ?service=bbps
        //   Transfer Slots        -> ...                  ?service=transfer
        //   Payout Slots          -> ...                  ?service=payout
        //   Payout UPI Slots      -> ...                  ?service=payout-upi
        //   ADMT Slots            -> ...                  ?service=admt
        //   Plan Fetch Records    -> Provider Activity
        //
        // Every old path still resolves - routes/index.tsx redirects each one
        // into the screen that took it over, and the old components are still
        // on disk. To restore one, re-add its entry here and swap its
        // <Navigate> back for the element named in that file.
        //
        // "Vendor Management" is not listed in MODULE_NAV_CONFIG below, so
        // this whole category is visible to roleLevel 0/1 only and changing
        // these children cannot affect TL / team-member navigation.
        // ------------------------------------------------------------------
        title: "Vendor Management",
        path: PATH_DASHBOARD.vendor.root,
        icon: ICONS.vendor,
        children: [
          {
            title: "Provider Directory",
            path: PATH_DASHBOARD.vendor.directory,
          },
          {
            title: "Service Configuration",
            path: PATH_DASHBOARD.vendor.services,
          },
          {
            title: "Provider Routing",
            path: PATH_DASHBOARD.vendor.routing,
          },
          {
            title: "Provider Activity",
            path: PATH_DASHBOARD.vendor.activity,
          },
        ],
      },
      {
        title: "Fund Management",
        path: PATH_DASHBOARD.fundmanagement.root,
        icon: ICONS.fund,
        children: [
          {
            title: "Add New Bank",
            path: PATH_DASHBOARD.fundmanagement.addbank,
          },
          {
            title: "Admin Fund Flow",
            path: PATH_DASHBOARD.fundmanagement.adminfundflow,
          },
          {
            title: "Fund Requests",
            path: PATH_DASHBOARD.fundmanagement.fundrequest,
          },
        ],
      },

      /* Removed: "Suspicious Activity" (Risk Watch) and "Login History"
         (Sessions). Both were dead sidebar links - a nav entry and a
         PATH_DASHBOARD path existed for each, but no route was ever registered
         in routes/index.tsx, so clicking either one 404'd. Nothing else in the
         app referenced them. */
      // {
      //   title: "Wallet Management",
      //   path: PATH_DASHBOARD.walletmanagement.root,
      //   icon: ICONS.wallet,
      //   children: [
      //     {
      //       title: "Main Wallet",
      //       path: PATH_DASHBOARD.walletmanagement.mainwallet,
      //     },
      //     {
      //       title: "TDS Wallet",
      //       path: PATH_DASHBOARD.walletmanagement.tdswallet,
      //     },
      //     {
      //       title: "GST Wallet",
      //       path: PATH_DASHBOARD.walletmanagement.gstwallet,
      //     },
      //   ],
      // },
      // {
      //   title: "BBPS Management",
      //   path: PATH_DASHBOARD.bbps.bbpsmanagement,
      //   icon: ICONS.dashboard,
      // },

      {
        title: "BBPS Management",
        path: PATH_DASHBOARD.bbps.bbpsmamagements,
        icon: ICONS.bbps,
        children: [
          {
            title: "BBPS",
            path: PATH_DASHBOARD.bbps.bbpsmamagements,
          },
          {
            title: "BBPS Products",
            path: PATH_DASHBOARD.bbps.bbpsproducts,
          },
        ],
      },

      // {
      //   title: "Auto Collect",
      //   path: PATH_DASHBOARD.autocollect.addautocollect,
      //   icon: ICONS.autocollect,
      //   children: [
      //     {
      //       title: "Add Auto Collect Services",
      //       path: PATH_DASHBOARD.autocollect.addautocollect,
      //     },
      //     {
      //       title: "Services",
      //       path: PATH_DASHBOARD.autocollect.services,
      //     },
      //     {
      //       title: "Auto Collect Table",
      //       path: PATH_DASHBOARD.autocollect.autocollecttable,
      //     },
      //   ],
      // },

      // {
      //   title: "Roll Management",
      //   path: PATH_DASHBOARD.rollmanagement,
      //   icon: ICONS.dashboard,
      // },

      // {
      //   title: "Content Management",
      //   path: PATH_DASHBOARD.contentmanagement.root,
      //   icon: ICONS.search,
      //   children: [
      //     {
      //       title: "FAQ Management",
      //       path: PATH_DASHBOARD.contentmanagement.faqmanagement,
      //     },
      //     {
      //       title: "Update Images",
      //       path: PATH_DASHBOARD.contentmanagement.updateimage,
      //     },
      //   ],
      // },
      {
        title: "Tools",
        path: PATH_DASHBOARD.tools.root,
        icon: ICONS.construction,
        children: [
          {
            title: "SMS/Email Management ",
            path: PATH_DASHBOARD.tools.smsmanagement,
          },
          /* Removed from the sidebar (Phase 6):
               "Approve User PAN" -> PATH_DASHBOARD.tools.panvarified
               "Update DocuSign"  -> PATH_DASHBOARD.tools.docusign
             The routes, paths and components are all still in place -
             sections/tools/PanVarified.tsx and sections/tools/DocuSignUpdate.tsx
             still render at /auth/tools/panvarified and /auth/tools/docusign.
             Re-add the two entries here to bring them back. */
          { title: "Vendor Switch ", path: PATH_DASHBOARD.tools.vendorswitch },
          { title: "Bank Master ", path: PATH_DASHBOARD.tools.bankmaster },
          { title: "ReProcess", path: PATH_DASHBOARD.tools.detailofids },
          {
            title: "BulkCheckStatus",
            path: PATH_DASHBOARD.tools.bulkCheckStatus,
          },
          { title: "NewsFlash", path: PATH_DASHBOARD.tools.newsflash },
          { title: "NewsSummary", path: PATH_DASHBOARD.tools.newssummary },
          {
            title: "Enable/Disable categories",
            path: PATH_DASHBOARD.tools.enablediscategories,
          },
          {
            title: "Wallet To Wallet Control",
            path: PATH_DASHBOARD.tools.walletToWallet,
          },
          { title: "AEPS", path: PATH_DASHBOARD.tools.aeps },
          { title: "Other ", path: PATH_DASHBOARD.tools.Other },
        ],
      },

      // {
      //   title: "testreports",
      //   path: PATH_DASHBOARD.testreports.root,
      //   icon: ICONS.mail,
      //   children: [
      //     {
      //       title: "All Transaction Records",
      //       path: PATH_DASHBOARD.testreports.alltransactionrecordtest,
      //     },
      //     {
      //       title: "Fund Reports",
      //       path: PATH_DASHBOARD.testreports.fundreports,
      //     },
      //   ],
      // },
      /* Removed from the sidebar (Phase 6): "Doc Api Reference", labelled
         "API Docs" by NAV_META. It was a single leaf item, not a parent with
         children. The route and page are still in place - pages/DocApiReference
         still renders at /auth/docapireference. To bring it back, restore:

           { title: "Doc Api Reference",
             path: PATH_DASHBOARD.docapireference,
             icon: ICONS.document },

         plus its NAV_META entry and its slot in NAV_GROUPS in NavSidebar.tsx. */
      // {
      //   title: "Sales Management",
      //   path: PATH_DASHBOARD.salesmanagement,
      //   icon: ICONS.dashboard,
      // },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  // {
  //   subheader: "management",
  //   items: [
  //     {
  //       title: "user",
  //       path: PATH_DASHBOARD.user.root,
  //       icon: ICONS.user,
  //       children: [
  //         { title: "Four", path: PATH_DASHBOARD.user.four },
  //         { title: "Five", path: PATH_DASHBOARD.user.five },
  //         { title: "Six", path: PATH_DASHBOARD.user.six },
  //       ],
  //     },
  //   ],
  // },
];

// ----------------------------------------------------------------------
// Role-based nav filtering
// ----------------------------------------------------------------------

// Allowed nav items per module code
const MODULE_NAV_CONFIG: Record<
  string,
  { titles: string[]; children?: Record<string, string[]> }
> = {
  FINANCE: {
    titles: ["Dashboard", "Our Network", "reports", "Fund Management", "Tools"],
    children: {
      reports: [
        "All Transaction Records ",
        "Fund Flow Transactions",
        "Historical Data Exports ",
        "UserWise Opening Balance",
        "Track Transactions ",
        "Wallet Ladger ",
      ],
      "Fund Management": ["Add New Bank", "Admin Fund Flow", "Fund Requests"],
      Tools: ["Vendor Switch "],
    },
  },
  RECONCILIATION: {
    titles: [
      "Dashboard",
      "Our Network",
      "User Management",
      "reports",
      "Fund Management",
      "BBPS Management",
      "Tools",
    ],
    children: {
      reports: [
        "All Transaction Records ",
        "Track Transactions ",
        "Fund Flow Transactions",
        "Wallet Ladger ",
        "Historical Data Exports ",
        "UserWise Opening Balance",
      ],
      "Fund Management": ["Admin Fund Flow", "Fund Requests"],
      "BBPS Management": ["BBPS", "BBPS Products"],
      Tools: ["ReProcess"],
    },
  },
  SUPPORT: {
    titles: [
      "Our Network",
      "User Management",
      "reports",
      "Fund Management",
      "Tools",
    ],
    children: {
      reports: [
        "All Transaction Records ",
        "Track Transactions ",
        "Fund Flow Transactions",
        "Wallet Ladger ",
        "Historical Data Exports ",
      ],
      "Fund Management": ["Add New Bank", "Admin Fund Flow"],
      Tools: ["ReProcess", "Vendor Switch ", "BulkCheckStatus"],
    },
  },
};

type NavItem = {
  title: string;
  path: string;
  icon?: any;
  children?: NavItem[];
};

type NavSection = {
  subheader: string;
  items: NavItem[];
};

const filterItemsByModule = (
  items: NavItem[],
  moduleCodes: string[]
): NavItem[] => {
  const allowedTitles = new Set<string>();
  const mergedChildren: Record<string, Set<string>> = {};

  moduleCodes.forEach((code) => {
    const config = MODULE_NAV_CONFIG[code];
    if (!config) return;

    config.titles.forEach((t) => allowedTitles.add(t));

    if (config.children) {
      Object.entries(config.children).forEach(([parent, childTitles]) => {
        if (!mergedChildren[parent]) mergedChildren[parent] = new Set();
        childTitles.forEach((ct) => mergedChildren[parent].add(ct));
      });
    }
  });

  return items
    .filter((item) => allowedTitles.has(item.title))
    .map((item) => {
      if (!item.children) return item;

      const allowedChildTitles = mergedChildren[item.title];

      if (!allowedChildTitles) {
        // no restriction → show all children
        return item;
      }

      const filteredChildren = item.children.filter((child) =>
        allowedChildTitles.has(child.title)
      );

      return { ...item, children: filteredChildren };
    });
};

// Always visible to everyone (roleLevel 0,1,2,3)
const ALWAYS_VISIBLE = ["Dashboard"];

// Visible to roleLevel 0, 1, 2 only
const VISIBLE_UPTO_LEVEL_2 = ["Role Management"];

export const getNavConfig = (
  roleLevel: number,
  modules: { code: string; permissions: string[] }[]
): NavSection[] => {
  // roleLevel 0 or 1 => full navbar
  if (roleLevel === 0 || roleLevel === 1) {
    return navConfig;
  }

  // roleLevel 2 or 3 => filter by allowed modules
  const moduleCodes = modules.map((m) => m.code);

  return navConfig.map((section) => {
    const filteredItems = filterItemsByModule(section.items, moduleCodes);

    // Add always visible items not already in filteredItems
    const alwaysVisibleItems = section.items.filter(
      (item) =>
        ALWAYS_VISIBLE.includes(item.title) &&
        !filteredItems.find((f) => f.title === item.title)
    );

    // Add level 2 visible items for roleLevel 2
    const level2Items =
      roleLevel === 2
        ? section.items.filter(
            (item) =>
              VISIBLE_UPTO_LEVEL_2.includes(item.title) &&
              !filteredItems.find((f) => f.title === item.title)
          )
        : [];

    // Merge and maintain original navConfig order
    const mergedTitles = new Set([
      ...alwaysVisibleItems.map((i) => i.title),
      ...filteredItems.map((i) => i.title),
      ...level2Items.map((i) => i.title),
    ]);

    const finalItems = [
      ...alwaysVisibleItems,
      ...filteredItems,
      ...level2Items,
    ];

    // maintain original order
    const orderedItems = section.items
      .map((original) => finalItems.find((f) => f?.title === original.title))
      .filter((item): item is NavItem => Boolean(item));

    return {
      ...section,
      items: orderedItems,
    };
  });
};

export default navConfig;
