import { Suspense, lazy, ElementType } from "react";
// components
import LoadingScreen from "../components/loading-screen";

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

//Login
export const LoginPage = Loadable(
  lazy(() => import("../pages/Auth/LoginPage"))
);
export const ResetPasswordPage = Loadable(
  lazy(() => import("../pages/Auth/ResetPasswordPage"))
);
export const NewPasswordPage = Loadable(
  lazy(() => import("../pages/Auth/NewPasswordPage"))
);

//DashBoard
export const Dashboard = Loadable(lazy(() => import("../pages/Dashboard")));
export const Newleads = Loadable(lazy(() => import("../pages/NewLeads")));
export const NewLeadSteps = Loadable(
  lazy(() => import("../pages/NewLeadSteps"))
);
export const EditUserDetail = Loadable(
  lazy(() => import("../sections/Newleads/EditUserDetail"))
);

//ournetwork
export const OurNetwork = Loadable(lazy(() => import("../pages/OurNetwork")));

//schememanagement
export const AllScheme = Loadable(
  lazy(() => import("../sections/schememanagement/ViewAllScheme/ViewAllScheme"))
);
export const AddNewSchemePage = Loadable(
  lazy(() => import("../sections/schememanagement/ManageScheme/AddNewScheme"))
);

export const EditScheme = Loadable(
  lazy(() => import("../sections/schememanagement/ManageScheme/EditScheme"))
);

export const MapSchemeSetting = Loadable(
  lazy(() => import("../sections/schememanagement/MapScheme/MapSchemeSetting"))
);
export const AllBBPSScheme = Loadable(
  lazy(
    () =>
      import("../sections/schememanagement/ViewAllBBPSScheme/ViewAllBBPSScheme")
  )
);
export const AddNewBBPSScheme = Loadable(
  lazy(
    () =>
      import("../sections/schememanagement/ManageBBPSscheme/AddNewBBPSScheme")
  )
);
export const AddNewLoanPage = Loadable(
  lazy(
    () =>
      import("../sections/schememanagement/ManageLoanScheme/AddNewLoanScheme")
  )
);
export const EditBBPSScheme = Loadable(
  lazy(
    () => import("../sections/schememanagement/ManageBBPSscheme/EditBBPSScheme")
  )
);
export const AllLoanScheme = Loadable(
  lazy(
    () =>
      import("../sections/schememanagement/ViewAllLoanScheme/ViewAllLoanScheme")
  )
);
export const EditLoanScheme = Loadable(
  lazy(
    () => import("../sections/schememanagement/ManageLoanScheme/EditLoanScheme")
  )
);
export const MapBBPSScheme = Loadable(
  lazy(() => import("../sections/schememanagement/MapBBPSscheme/MapBBPSScheme"))
);
export const MapLoanScheme = Loadable(
  lazy(() => import("../sections/schememanagement/MapLoanscheme/MapLoanScheme"))
);

//product management
export const ProductManagement = Loadable(
  lazy(() => import("../pages/ProductManagement"))
);
export const AssignVendor = Loadable(
  lazy(() => import("../pages/AssignVendor"))
);
export const MapShortCode = Loadable(
  lazy(() => import("../pages/MapShortCode"))
);

//vendor management
// ----------------------------------------------------------------------
// Providers - the four consolidated screens. Everything under them replaces
// the fifteen per-service entries that used to live in this block; those
// components are still on disk and still exported below, they just no longer
// have a route of their own (the legacy paths redirect - see routes/index).
// ----------------------------------------------------------------------
export const ProviderDirectory = Loadable(
  lazy(
    () => import("../sections/vendormanagement/providers/ProviderDirectory")
  )
);
export const ProviderDetail = Loadable(
  lazy(() => import("../sections/vendormanagement/providers/ProviderDetail"))
);
export const ProviderServiceConfiguration = Loadable(
  lazy(
    () =>
      import("../sections/vendormanagement/providers/ServiceConfiguration")
  )
);
export const ProviderRouting = Loadable(
  lazy(() => import("../sections/vendormanagement/providers/ProviderRouting"))
);
export const ProviderActivity = Loadable(
  lazy(() => import("../sections/vendormanagement/providers/ProviderActivity"))
);

export const VendorManagement = Loadable(
  lazy(() => import("../pages/VendorManagement"))
);
export const MoneyTransferSlots = Loadable(
  lazy(
    () =>
      import(
        "../sections/vendormanagement/VendorMoneyTransfer/VendorMoneyTransferData"
      )
  )
);
export const PayoutSlots = Loadable(
  lazy(
    () =>
      import("../sections/vendormanagement/VendorPayoutSlots/VendorPayoutData")
  )
);
export const PayoutUpislots = Loadable(
  lazy(
    () =>
      import(
        "../sections/vendormanagement/VendorPayoutUpi Slots/VendorPayoutUpiData"
      )
  )
);
export const CreditCardSlotes = Loadable(
  lazy(() => import("../sections/vendormanagement/Payments/Payements"))
);
export const VendorPaymentData = Loadable(
  lazy(
    () =>
      import(
        "../sections/vendormanagement/VendorPaymentsData/VendorPaymentData"
      )
  )
);
export const DmtSlots = Loadable(
  lazy(
    () => import("../sections/vendormanagement/VendorDMT1data/VendorDmtData")
  )
);
export const Dmt2Slots = Loadable(
  lazy(
    () =>
      import("../sections/vendormanagement/VendorDMT2data/VendorPaymentData2")
  )
);
export const Mplan = Loadable(
  lazy(() => import("../sections/vendormanagement/PlanFetchRecords"))
);

export const TransferSlots = Loadable(
  lazy(() => import("../sections/vendormanagement/Transferslots/TransferSlots"))
);
export const AepsSlots = Loadable(
  lazy(
    () => import("../sections/vendormanagement/VendorAEPSdata/VendorAepsData")
  )
);
export const PbpsSlots = Loadable(
  lazy(
    () => import("../sections/vendormanagement/vendorPBPSdata/VendorPBPSData")
  )
);
export const ADMTslots = Loadable(
  lazy(
    () => import("../sections/vendormanagement/VendorADMTdata/VendorADMTData")
  )
);
export const BbpsSlots = Loadable(
  lazy(() => import("../sections/vendormanagement/VendorBBPSdata/BBPS"))
);

//fund management
export const AddBankAccount = Loadable(
  lazy(() => import("../sections/fundmanagement/AddBankAccount"))
);
export const AdminFundFlow = Loadable(
  lazy(() => import("../sections/fundmanagement/AdminFundFlow"))
);
export const FundRequest = Loadable(
  lazy(() => import("../sections/fundmanagement/FundRequest"))
);
// Walletmanagement
export const MainWallet = Loadable(
  lazy(() => import("../sections/walletmanagement/MainWallet"))
);
export const TdsWallet = Loadable(
  lazy(() => import("../sections/walletmanagement/TdsWallet"))
);
export const GstWallet = Loadable(
  lazy(() => import("../sections/walletmanagement/GstWallet"))
);
export const Temporaryreport = Loadable(
  lazy(() => import("../sections/reports/Temporaryreport"))
);
//bbps management
export const BbpsManagement = Loadable(
  lazy(() => import("../pages/BBPSmanagement"))
);
export const BBPSProducts = Loadable(
  lazy(() => import("../sections/BBPSProjects/BBPSProducts"))
);

//Auto Collect
export const Autocollect = Loadable(lazy(() => import("../pages/AutoCollect")));
export const EditAutocollect = Loadable(
  lazy(() => import("../sections/Autocollect/EditAutoCollect"))
);
export const Services = Loadable(
  lazy(() => import("../sections/Autocollect/Services/Services"))
);

//rolemanagement - the Permissions screen (access & permission management)
export const RoleManagement = Loadable(
  lazy(() => import("../sections/RoleManagent/RoleManagement"))
);

//content Management
export const Faqmanagement = Loadable(
  lazy(() => import("../sections/contentmanagement/FAQmanagement"))
);
export const Updateimages = Loadable(
  lazy(() => import("../sections/contentmanagement/Updateimages"))
);

//tools
export const SmsEmailManagement = Loadable(
  lazy(() => import("../sections/tools/SmsTemplate"))
);
export const NewsNotifications = Loadable(
  lazy(() => import("../sections/tools/NewsNotifications"))
);
export const VendorSwitch = Loadable(
  lazy(() => import("../sections/tools/VendorSwitch/VendorSwitch"))
);
export const AccountRecovery = Loadable(
  lazy(() => import("../sections/tools/AccountRecovery"))
);
export const NewsFlash = Loadable(
  lazy(() => import("../sections/tools/NewsFlash/NewsFlash"))
);
export const NewsSummary = Loadable(
  lazy(() => import("../sections/tools/NewsSummary/NewsSummary"))
);
// export const NewsSummary = Loadable(
//   lazy(() => import("../sections/tools/NewsSummary/NewsSummary"))
// );
export const BankMaster = Loadable(
  lazy(() => import("../sections/tools/BankMaster/BankMaster"))
);
export const DetailOfIds = Loadable(
  lazy(() => import("../sections/tools/DetailOfIds/DetailOfIds"))
);
export const UploadExternalData = Loadable(
  lazy(() => import("../sections/tools/UploadExternalData"))
);
export const EnableDisCategories = Loadable(
  lazy(() => import("../sections/tools/EnableDisCategories"))
);
export const WalletToWallet = Loadable(
  lazy(() => import("../sections/tools/WalletToWallet/WalletToWalletControl"))
);
export const Other = Loadable(lazy(() => import("../sections/tools/Other")));
export const AEPS = Loadable(lazy(() => import("../sections/tools/AEPS")));
export const PanVarified = Loadable(
  lazy(() => import("../sections/tools/PanVarified"))
);
export const DocuSignUpdate = Loadable(
  lazy(() => import("../sections/tools/DocuSignUpdate"))
);

//reports
export const AllTransactionRecords = Loadable(
  lazy(() => import("../sections/reports/AllTransactionRecords"))
);
export const TrackTransactions = Loadable(
  lazy(() => import("../sections/reports/TrackTransactions"))
);
export const FundFlow = Loadable(
  lazy(() => import("../sections/reports/FundFlow"))
);

export const WalletLadger = Loadable(
  lazy(() => import("../sections/reports/WalletLadger"))
);
export const WaitingAreaForDuplicateTxn = Loadable(
  lazy(() => import("../sections/reports/WaitingAreaForDuplicateTxn"))
);
export const HistoricalDataExport = Loadable(
  lazy(() => import("../sections/reports/HistoricalDataExport/HistoricalData"))
);
export const AccountStatement = Loadable(
  lazy(() => import("../sections/reports/AccountStatement"))
);
export const TdsGstReport = Loadable(
  lazy(() => import("../sections/reports/TdsGstReport"))
);

export const UserWiseClosingBal = Loadable(
  lazy(() => import("../sections/reports/UserWiseClosingBal"))
);
export const GSTLadger = Loadable(
  lazy(() => import("../sections/reports/GSTTDSLadger/GSTLadger"))
);
export const TDSLadger = Loadable(
  lazy(() => import("../sections/reports/GSTTDSLadger/TDSLadger"))
);

//api doc referance
export const DocApiReference = Loadable(
  lazy(() => import("../pages/DocApiReference"))
);

//sales management
export const SalesManagement = Loadable(
  lazy(() => import("../pages/SalesManagement"))
);

// export const PageOne = Loadable(lazy(() => import("../pages/PageOne")));
// export const PageTwo = Loadable(lazy(() => import("../pages/PageTwo")));
// export const PageThree = Loadable(lazy(() => import("../pages/PageThree")));
// export const PageFour = Loadable(lazy(() => import("../pages/PageFour")));
// export const PageFive = Loadable(lazy(() => import("../pages/PageFive")));
// export const PageSix = Loadable(lazy(() => import("../pages/PageSix")));

export const Page404 = Loadable(lazy(() => import("../pages/Page404")));

//TEST

export const AllTransactionRecordsTest = Loadable(
  lazy(() => import("../TEST/AllTransactionRecordsTest"))
);
export const FundReports = Loadable(lazy(() => import("../TEST/FundReports")));
