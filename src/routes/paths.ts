// ----------------------------------------------------------------------

import GSTLadger from "src/sections/reports/GSTTDSLadger/GSTLadger";
import { TdsGstReport, TDSLadger } from "./elements";
import { ro } from "date-fns/locale";
function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = "/auth";

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: "/login",
  resetpassword: "/resetpassword",
  newpassword: "/newpassword",
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  dashboard: path(ROOTS_DASHBOARD, "/dashboard"),
  newleads: path(ROOTS_DASHBOARD, "/newleads"),
  newleadsteps: path(ROOTS_DASHBOARD, "/newleadsteps"),
  edit: path(ROOTS_DASHBOARD, "/edit"),
  ournetwork: path(ROOTS_DASHBOARD, "/ournetwork"),
  rolemanagement: path(ROOTS_DASHBOARD, "/rolemanagement"),
  userwise: path(ROOTS_DASHBOARD, "/user-wise"),
  usersetlimit: path(ROOTS_DASHBOARD, "/user-wise-limit"),
  scheme: {
    root: path(ROOTS_DASHBOARD, "/scheme"),
    allscheme: path(ROOTS_DASHBOARD, "/scheme/allscheme"),
    AddNewScheme: path(ROOTS_DASHBOARD, "/scheme/AddNewScheme"),
    EditScheme: path(ROOTS_DASHBOARD, "/scheme/EditScheme"),
    MapSchemeSetting: path(ROOTS_DASHBOARD, "/scheme/mapSchemeSetting"),
    AllbbpsScheme: path(ROOTS_DASHBOARD, "/scheme/AllbbpsScheme"),
    AddNewbbpsScheme: path(ROOTS_DASHBOARD, "/scheme/AddNewbbpsScheme"),
    EditBBPSScheme: path(ROOTS_DASHBOARD, "/scheme/EditBBPSScheme"),
    AddNewLoanScheme: path(ROOTS_DASHBOARD, "/scheme/AddNewLoanScheme"),
    EditLoanScheme: path(ROOTS_DASHBOARD, "/scheme/EditLoanScheme"),
    AllLaonScheme: path(ROOTS_DASHBOARD, "/scheme/AllLaonScheme"),
    mapbbpsScheme: path(ROOTS_DASHBOARD, "/scheme/mapbbpsScheme"),
    maploanscheme: path(ROOTS_DASHBOARD, "/scheme/maploanscheme"),
  },
  product: {
    root: path(ROOTS_DASHBOARD, "/product"),
    productmanagement: path(ROOTS_DASHBOARD, "/product/productmanagement"),
    assignvendor: path(ROOTS_DASHBOARD, "/product/assignvendor"),
    mapshortcode: path(ROOTS_DASHBOARD, "/product/mapshortcode"),
  },
  vendor: {
    root: path(ROOTS_DASHBOARD, "/vendor"),
    /* Consolidated Providers screens. The per-service "slots" paths below are
       kept so old deep links still resolve - each now redirects into
       Service Configuration with the service preselected. */
    directory: path(ROOTS_DASHBOARD, "/vendor/directory"),
    provider: (id: string) => path(ROOTS_DASHBOARD, `/vendor/directory/${id}`),
    services: path(ROOTS_DASHBOARD, "/vendor/services"),
    routing: path(ROOTS_DASHBOARD, "/vendor/routing"),
    activity: path(ROOTS_DASHBOARD, "/vendor/activity"),
    vendormanagement: path(ROOTS_DASHBOARD, "/vendor/vendormanagement"),
    creditcardslots: path(ROOTS_DASHBOARD, "/vendor/creditcardslots"),
    moneytransferslots: path(ROOTS_DASHBOARD, "/vendor/moneytransferslots"),
    vendorpaymentslots: path(ROOTS_DASHBOARD, "/vendor/vendorpaymentslots"),
    dmtslots: path(ROOTS_DASHBOARD, "/vendor/dmtslots"),
    dmt2slots: path(ROOTS_DASHBOARD, "/vendor/dmt2slots"),
    transferslots: path(ROOTS_DASHBOARD, "/vendor/transferslots"),
    mplan: path(ROOTS_DASHBOARD, "/vendor/mplan"),
    aepsslots: path(ROOTS_DASHBOARD, "/vendor/aepsslots"),
    newaepsslots: path(ROOTS_DASHBOARD, "/vendor/newaepsslots"),
    pbpsslots: path(ROOTS_DASHBOARD, "/vendor/pbpsslots"),
    bbpslots: path(ROOTS_DASHBOARD, "/vendor/bbpslots"),
    payoutslots: path(ROOTS_DASHBOARD, "/vendor/payoutslots"),
    payinslots: path(ROOTS_DASHBOARD, "/vendor/payinslots"),
    payoutupislots: path(ROOTS_DASHBOARD, "/vendor/payoutupislots"),
    admtslots: path(ROOTS_DASHBOARD, "/vendor/admtslots"),
  },
  fundmanagement: {
    root: path(ROOTS_DASHBOARD, "/fundmanagement"),
    addbank: path(ROOTS_DASHBOARD, "/fundmanagement/addbank"),
    adminfundflow: path(ROOTS_DASHBOARD, "/fundmanagement/adminfundflow"),
    fundrequest: path(ROOTS_DASHBOARD, "/fundmanagement/fundrequest"),
  },
  walletmanagement: {
    root: path(ROOTS_DASHBOARD, "/walletmanagement"),
    mainwallet: path(ROOTS_DASHBOARD, "/walletmanagement/mainwallet"),
    tdswallet: path(ROOTS_DASHBOARD, "/walletmanagement/tdswallet"),
    gstwallet: path(ROOTS_DASHBOARD, "/walletmanagement/gstwallet"),
  },
  usermanagement: {
    root: path(ROOTS_DASHBOARD, "/usermanagement"),
    userwiselimit: path(ROOTS_DASHBOARD, "/usermanagement/user-wise-limit"),
    userwisevendor: path(ROOTS_DASHBOARD, "/usermanagement/user-wise-vendor"),
  },

  autocollect: {
    root: path(ROOTS_DASHBOARD, "/autocollect"),
    addautocollect: path(ROOTS_DASHBOARD, "/autocollect/addautocollect"),
    services: path(ROOTS_DASHBOARD, "/autocollect/services"),
    autocollecttable: path(ROOTS_DASHBOARD, "/autocollect/Autocollecttable"),
  },
  bbps: {
    root: path(ROOTS_DASHBOARD, "/bbpsmanagement"),
    bbpsmamagements: path(ROOTS_DASHBOARD, "/bbpsmanagement/bbpsmanagement"),
    bbpsproducts: path(ROOTS_DASHBOARD, "/bbpsmanagement/bbpsproducts"),
  },

  bbpsmanagement: path(ROOTS_DASHBOARD, "/bbpsmanagement"),
  rollmanagement: path(ROOTS_DASHBOARD, "/rollmanagement"),
  contentmanagement: {
    root: path(ROOTS_DASHBOARD, "/contentmanagement"),
    faqmanagement: path(ROOTS_DASHBOARD, "/contentmanagement/faqmanagement"),
    updateimage: path(ROOTS_DASHBOARD, "/contentmanagement/updateimage"),
  },


  tools: {
    root: path(ROOTS_DASHBOARD, "/tools"),
    smsmanagement: path(ROOTS_DASHBOARD, "/tools/smsmanagement"),
    newsnotifications: path(ROOTS_DASHBOARD, "/tools/newsnotifications"),
    vendorswitch: path(ROOTS_DASHBOARD, "/tools/vendorswitch"),
    accountrecovery: path(ROOTS_DASHBOARD, "/tools/accountrecovery"),
    bankmaster: path(ROOTS_DASHBOARD, "/tools/bankmaster"),
    detailofids: path(ROOTS_DASHBOARD, "/tools/detailofids"),
    newsflash: path(ROOTS_DASHBOARD, "/tools/newsflash"),
    newssummary: path(ROOTS_DASHBOARD, "/tools/newssummary"),
    uploadexternaldata: path(ROOTS_DASHBOARD, "/tools/uploadexternaldata"),
    enablediscategories: path(ROOTS_DASHBOARD, "/tools/enablediscategories"),
    walletToWallet: path(ROOTS_DASHBOARD, "/tools/walletToWallet"),
    bulkCheckStatus: path(ROOTS_DASHBOARD, "/tools/bulkCheckStatus"),
    panvarified: path(ROOTS_DASHBOARD, "/tools/panvarified"),
    docusign: path(ROOTS_DASHBOARD, "/tools/docusign"),
    aeps: path(ROOTS_DASHBOARD, "/tools/aeps"),
    Other: path(ROOTS_DASHBOARD, "/tools/Other"),
  },
  reports: {
    root: path(ROOTS_DASHBOARD, "/reports"),
    fundflow: path(ROOTS_DASHBOARD, "/reports/fundflow"),
    alltransactionrecord: path(
      ROOTS_DASHBOARD,
      "/reports/alltransactionrecord"
    ),
    tracktransactions: path(ROOTS_DASHBOARD, "/reports/tracktransactions"),
    userwisetransactionrecord: path(
      ROOTS_DASHBOARD,
      "/reports/userwisetransactionrecord"
    ),
    WalletLadger: path(ROOTS_DASHBOARD, "/reports/WalletLadger"),
    WaitingAreaForDuplicateTxn: path(
      ROOTS_DASHBOARD,
      "/reports/WaitingAreaForDuplicateTxn"
    ),
    HistoricalDataExport: path(
      ROOTS_DASHBOARD,
      "/reports/HistoricalDataExport"
    ),
    AccountStatement: path(ROOTS_DASHBOARD, "/reports/AccountStatement"),
    TdsGstReport: path(ROOTS_DASHBOARD, "/reports/TdsGstReport"),
    UserWiseClosingBal: path(ROOTS_DASHBOARD, "/reports/UserWiseClosingBal"),
    GSTLadger: path(ROOTS_DASHBOARD, "/reports/GSTLadger"),
    TDSLadger: path(ROOTS_DASHBOARD, "/reports/TDSLadger"),
    Temporaryreport: path(ROOTS_DASHBOARD, "/reports/Temporaryreport"),
  },
  testreports: {
    root: path(ROOTS_DASHBOARD, "/testreports"),
    alltransactionrecordtest: path(
      ROOTS_DASHBOARD,
      "/testreports/alltransactionrecordtest"
    ),
    fundreports: path(ROOTS_DASHBOARD, "/testreports/fundreports"),
  },
  docapireference: path(ROOTS_DASHBOARD, "/docapireference"),
  salesmanagement: path(ROOTS_DASHBOARD, "/salesmanagement"),
  // one: path(ROOTS_DASHBOARD, "/one"),
  // two: path(ROOTS_DASHBOARD, "/two"),
  // three: path(ROOTS_DASHBOARD, "/three"),
  // user: {
  //   root: path(ROOTS_DASHBOARD, "/user"),
  //   four: path(ROOTS_DASHBOARD, "/user/four"),
  //   five: path(ROOTS_DASHBOARD, "/user/five"),
  //   six: path(ROOTS_DASHBOARD, "/user/six"),
  // },
};
