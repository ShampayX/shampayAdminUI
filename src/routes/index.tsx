import { Navigate, useRoutes } from "react-router-dom";
// auth
import AuthGuard from "../auth/AuthGuard";
import GuestGuard from "../auth/GuestGuard";
// layouts
import CompactLayout from "../layouts/compact";
import DashboardLayout from "../layouts/dashboard";
// config
import { PATH_AFTER_LOGIN, PATH_BEFORE_LOGIN } from "../config";
//
import {
  Page404,
  // PageOne,
  // PageTwo,
  // PageSix,
  // PageFour,
  // PageFive,
  // PageThree,
  LoginPage,
  Dashboard,
  ResetPasswordPage,
  NewPasswordPage,
  NewLeadSteps,
  OurNetwork,
  AllScheme,
  AddNewSchemePage,
  EditScheme,
  MapSchemeSetting,
  AllBBPSScheme,
  EditBBPSScheme,
  AddNewBBPSScheme,
  MapBBPSScheme,
  ProductManagement,
  AssignVendor,
  MapShortCode,
  /* Providers. The fifteen per-service vendor elements this block used to
     import are still exported from routes/elements.tsx - they just have no
     route any more. Re-import one if you restore its route below. */
  ProviderDirectory,
  ProviderDetail,
  ProviderServiceConfiguration,
  ProviderRouting,
  ProviderActivity,
  AddBankAccount,
  AdminFundFlow,
  FundRequest,
  BbpsManagement,
  RoleManagement,
  Faqmanagement,
  Updateimages,
  SmsEmailManagement,
  PanVarified,
  DocuSignUpdate,
  NewsNotifications,
  VendorSwitch,
  AccountRecovery,
  BankMaster,
  DetailOfIds,
  NewsFlash,
  NewsSummary,
  UploadExternalData,
  EnableDisCategories,
  AEPS,
  Other,
  AllTransactionRecords,
  TrackTransactions,
  FundFlow,
  WalletLadger,
  WaitingAreaForDuplicateTxn,
  HistoricalDataExport,
  DocApiReference,
  SalesManagement,
  Newleads,
  BBPSProducts,
  UserWiseClosingBal,
  AllTransactionRecordsTest,
  FundReports,
  Autocollect,
  EditAutocollect,
  AddNewLoanPage,
  EditLoanScheme,
  AllLoanScheme,
  Services,
  MapLoanScheme,
  EditUserDetail,
  // GSTLadger,
  TDSLadger,
  WalletToWallet,
  TdsWallet,
  GstWallet,
  TdsGstReport,
  AccountStatement,
} from "./elements";
import Autocollecttable from "src/sections/Autocollect/Autocollecttable";
import MainWallet from "src/sections/walletmanagement/MainWallet";
import Temporaryreport from "src/sections/reports/Temporaryreport";
import UserwiseVendorSwitch from "src/sections/tools/UserWiseVendorSwitch/VendorSwitch";
import UserwiseVendorSwitchPage from "src/sections/tools/NewUserwiseVendor/UserWiseVenderSwitch";
import SetLimit from "src/sections/tools/UserWiseLimit/APILimitPage";
import path from "path";
import DashboardOverview from "src/sections/Dashboard/DashboardNew/Dashboard";
import Login from "src/sections/auth/Login";

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: "/",
      children: [
        { element: <Navigate to={PATH_BEFORE_LOGIN} replace />, index: true },
        {
          path: "login",
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
      ],
    },
    {
      path: "/auth",
      element: (
        // <AuthGuard>
          <DashboardLayout />
        // </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: "dashboard", element: <DashboardOverview /> },
        { path: "newleads", element: <Newleads /> },
        { path: "newleadsteps", element: <NewLeadSteps /> },
        { path: "edit", element: <EditUserDetail /> },
        { path: "ournetwork", element: <OurNetwork /> },
        // { path: "user-wise", element: <UserwiseVendorSwitchPage /> },
        // { path: "user-wise-limit", element: <SetLimit /> },
        {
          path: "scheme",
          children: [
            {
              element: <Navigate to="/auth/scheme/AllScheme" replace />,
              index: true,
            },
            { path: "AllScheme", element: <AllScheme /> },
            { path: "AddNewScheme", element: <AddNewSchemePage /> },
            { path: "EditScheme", element: <EditScheme /> },
            { path: "mapSchemeSetting", element: <MapSchemeSetting /> },
            { path: "AllbbpsScheme", element: <AllBBPSScheme /> },
            { path: "AddNewbbpsScheme", element: <AddNewBBPSScheme /> },
            { path: "EditBBPSScheme", element: <EditBBPSScheme /> },
            { path: "AddNewLoanScheme", element: <AddNewLoanPage /> },
            { path: "EditLoanScheme", element: <EditLoanScheme /> },
            { path: "AllLaonScheme", element: <AllLoanScheme /> },
            { path: "mapbbpsScheme", element: <MapBBPSScheme /> },
            { path: "maploanscheme", element: <MapLoanScheme /> },
          ],
        },

        {
          path: "product",
          children: [
            {
              element: (
                <Navigate to="/auth/product/productmanagement" replace />
              ),
              index: true,
            },
            { path: "productmanagement", element: <ProductManagement /> },
            { path: "assignvendor", element: <AssignVendor /> },
            { path: "mapshortcode", element: <MapShortCode /> },
          ],
        },
        {
          path: "usermanagement",

          children: [
            { path: "user-wise-vendor", element: <UserwiseVendorSwitchPage /> },
            { path: "user-wise-limit", element: <SetLimit /> },
          ],
        },

        {
          /* ------------------------------------------------------------------
             Providers.

             Four screens replace the fifteen that used to live here. Every
             legacy path below still resolves - each redirects to the screen
             that now owns its job, so old bookmarks and deep links keep
             working instead of 404ing.

             To bring a legacy screen back, swap its <Navigate> for the element
             named in the comment beside it and re-add a nav entry in
             layouts/dashboard/nav/config.tsx. The components were left on disk
             untouched.
             ------------------------------------------------------------------ */
          path: "vendor",
          children: [
            {
              element: <Navigate to="/auth/vendor/directory" replace />,
              index: true,
            },

            /* --- the consolidated screens --- */
            { path: "directory", element: <ProviderDirectory /> },
            { path: "directory/:id", element: <ProviderDetail /> },
            { path: "services", element: <ProviderServiceConfiguration /> },
            { path: "routing", element: <ProviderRouting /> },
            { path: "activity", element: <ProviderActivity /> },

            /* --- legacy paths, redirected --- */
            {
              /* was <VendorManagement /> - add form + vendor list */
              path: "vendormanagement",
              element: <Navigate to="/auth/vendor/directory" replace />,
            },
            {
              /* was <Mplan /> - Plan Fetch Records */
              path: "mplan",
              element: <Navigate to="/auth/vendor/activity" replace />,
            },
            {
              /* was <CreditCardSlotes /> */
              path: "creditcardslots",
              element: (
                <Navigate
                  to="/auth/vendor/services?service=credit-card"
                  replace
                />
              ),
            },
            {
              /* was <MoneyTransferSlots /> */
              path: "moneytransferslots",
              element: (
                <Navigate
                  to="/auth/vendor/services?service=money-transfer"
                  replace
                />
              ),
            },
            {
              /* was <VendorPaymentData /> */
              path: "vendorpaymentslots",
              element: (
                <Navigate
                  to="/auth/vendor/services?service=vendor-payments"
                  replace
                />
              ),
            },
            {
              /* was <DmtSlots /> */
              path: "dmtslots",
              element: (
                <Navigate to="/auth/vendor/services?service=dmt1" replace />
              ),
            },
            {
              /* was <Dmt2Slots /> */
              path: "dmt2slots",
              element: (
                <Navigate to="/auth/vendor/services?service=dmt2" replace />
              ),
            },
            {
              /* the old nav entry had no route at all - this one is new */
              path: "payinslots",
              element: (
                <Navigate to="/auth/vendor/services?service=payin" replace />
              ),
            },
            {
              /* was <AepsSlots /> - the superseded AEPS screen, never in nav */
              path: "aepsslots",
              element: (
                <Navigate to="/auth/vendor/services?service=aeps" replace />
              ),
            },
            {
              /* was <AepsSlotsNew /> */
              path: "newaepsslots",
              element: (
                <Navigate to="/auth/vendor/services?service=aeps" replace />
              ),
            },
            {
              /* was <PbpsSlots /> */
              path: "pbpsslots",
              element: (
                <Navigate to="/auth/vendor/services?service=pbps" replace />
              ),
            },
            {
              /* was <BbpsSlots /> */
              path: "bbpslots",
              element: (
                <Navigate to="/auth/vendor/services?service=bbps" replace />
              ),
            },
            {
              /* was <TransferSlots /> */
              path: "transferslots",
              element: (
                <Navigate to="/auth/vendor/services?service=transfer" replace />
              ),
            },
            {
              /* was <PayoutSlots /> */
              path: "payoutslots",
              element: (
                <Navigate to="/auth/vendor/services?service=payout" replace />
              ),
            },
            {
              /* was <PayoutUpislots /> */
              path: "payoutupislots",
              element: (
                <Navigate
                  to="/auth/vendor/services?service=payout-upi"
                  replace
                />
              ),
            },
            {
              /* was <ADMTslots /> */
              path: "admtslots",
              element: (
                <Navigate to="/auth/vendor/services?service=admt" replace />
              ),
            },

            /* Per-user vendor switch, opened from Ecosystem. Not part of the
               Providers nav and untouched by this pass. */
            {
              path: "userwisevendorswitch/:id",
              element: <UserwiseVendorSwitch />,
            },
          ],
        },
        {
          path: "fundmanagement",
          children: [
            {
              element: <Navigate to="/auth/fundmanagement/addbank" replace />,
              index: true,
            },
            { path: "addbank", element: <AddBankAccount /> },
            { path: "adminfundflow", element: <AdminFundFlow /> },
            { path: "fundrequest", element: <FundRequest /> },
          ],
        },
        {
          path: "walletmanagement",
          children: [
            {
              element: (
                <Navigate to="/auth/walletmanagement/mainwallet" replace />
              ),
              index: true,
            },
            { path: "mainwallet", element: <MainWallet /> },
            { path: "tdswallet", element: <TdsWallet /> },
            { path: "gstwallet", element: <GstWallet /> },
          ],
        },

        {
          path: "autocollect",
          children: [
            {
              element: <Navigate to="autocollect/listview" replace />,
              index: true,
            },
            { path: "addautocollect", element: <Autocollect /> },
            { path: "editautocollect", element: <EditAutocollect /> },
            { path: "services", element: <Services /> },
            { path: "autocollecttable", element: <Autocollecttable /> },
          ],
        },

        {
          path: "bbpsmanagement",
          children: [
            {
              element: <Navigate to="/bbpsmanagement" replace />,
              index: true,
            },
            { path: "bbpsmanagement", element: <BbpsManagement /> },
            { path: "bbpsProducts", element: <BBPSProducts /> },
          ],
        },

        // { path: "bbpsmanagement", element: <BbpsManagement /> },
        /* The sidebar has always pointed at PATH_DASHBOARD.rolemanagement; the
           route was registered as "rollmanagement", so Permissions 404'd. Both
           spellings now resolve, so the old link keeps working. */
        { path: "rolemanagement", element: <RoleManagement /> },
        {
          path: "rollmanagement",
          element: <Navigate to="/auth/rolemanagement" replace />,
        },
        {
          path: "contentmanagement",
          children: [
            {
              element: (
                <Navigate to="/auth/contentmanagement/faqmanagement" replace />
              ),
              index: true,
            },
            { path: "faqmanagement", element: <Faqmanagement /> },
            { path: "updateimage", element: <Updateimages /> },
          ],
        },
        {
          path: "tools",
          children: [
            {
              element: <Navigate to="/auth/tools/smsmanagement" replace />,
              index: true,
            },
            { path: "smsmanagement", element: <SmsEmailManagement /> },
            { path: "panvarified", element: <PanVarified /> },
            { path: "docusign", element: <DocuSignUpdate /> },
            { path: "newsnotifications", element: <NewsNotifications /> },
            { path: "vendorswitch", element: <VendorSwitch /> },
            { path: "accountrecovery", element: <AccountRecovery /> },
            { path: "bankmaster", element: <BankMaster /> },
            { path: "detailofids", element: <DetailOfIds /> },
            { path: "newsflash", element: <NewsFlash /> },
            { path: "newssummary", element: <NewsSummary /> },
            { path: "uploadexternaldata", element: <UploadExternalData /> },
            { path: "enablediscategories", element: <EnableDisCategories /> },
            { path: "walletToWallet", element: <WalletToWallet /> },

            { path: "aeps", element: <AEPS /> },
            { path: "Other", element: <Other /> },
          ],
        },
        {
          path: "reports",
          children: [
            {
              element: (
                <Navigate to="/auth/reports/alltransactionrecord" replace />
              ),
              index: true,
            },
            {
              path: "alltransactionrecord",
              element: <AllTransactionRecords />,
            },
            {
              path: "tracktransactions",
              element: <TrackTransactions />,
            },
            { path: "fundflow", element: <FundFlow /> },
            { path: "WalletLadger", element: <WalletLadger /> },
            {
              path: "WaitingAreaForDuplicateTxn",
              element: <WaitingAreaForDuplicateTxn />,
            },
            { path: "HistoricalDataExport", element: <HistoricalDataExport /> },
            { path: "AccountStatement", element: <AccountStatement /> },
            { path: "TdsGstReport", element: <TdsGstReport /> },
            { path: "UserWiseClosingBal", element: <UserWiseClosingBal /> },

            // { path: "GSTLadger", element: <GSTLadger /> },
            // { path: "TDSLadger", element: <TDSLadger /> },
            // { path: "temporaryreport", element: <Temporaryreport /> },
          ],
        },
        {
          path: "testreports",
          children: [
            {
              element: (
                <Navigate
                  to="/auth/testreports/alltransactionrecordtest"
                  replace
                />
              ),
              index: true,
            },
            {
              path: "alltransactionrecordtest",
              element: <AllTransactionRecordsTest />,
            },
            {
              path: "fundreports",
              element: <FundReports />,
            },
          ],
        },
        { path: "docapireference", element: <DocApiReference /> },
        { path: "salesmanagement", element: <SalesManagement /> },
        // { path: "one", element: <PageOne /> },
        // { path: "two", element: <PageTwo /> },
        // { path: "three", element: <PageThree /> },
        // {
        //   path: "user",
        //   children: [
        //     {
        //       element: <Navigate to="/dashboard/user/four" replace />,
        //       index: true,
        //     },
        //     { path: "four", element: <PageFour /> },
        //     { path: "five", element: <PageFive /> },
        //     { path: "six", element: <PageSix /> },
        //   ],
        // },
      ],
    },
    {
      element: <CompactLayout />,
      children: [
        { path: "404", element: <Page404 /> },
        { path: "resetpassword", element: <ResetPasswordPage /> },
        { path: "newpassword", element: <NewPasswordPage /> },
      ],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}
