import { Stack } from "@mui/material";
import React from "react";
import { PageHeader } from "src/components/page-kit";
import MasterControl from "./MasterControl";

// ----------------------------------------------------------------------
// The Agent, Distributor and Master Distributor cards were removed from this
// screen. Those three roles no longer exist - roles are { Admin, API_User } -
// so per-role transfer controls for them configured nothing.
//
// Nothing is lost: all three rendered <RoleTransferControl />, which was
// unwired mock UI (the toggles held no state, Save had no handler, onSubmit
// was empty). The master switch below is the only control on this screen that
// reaches the API (`admin/walletToWallet/setWalletConfig`).
//
// AgentControl.tsx, DistributorControl.tsx, MasterDistributorControl.tsx and
// RoleTransferControl.tsx are still on disk; RoleTransferControl also exports
// IOSSwitch, which MasterControl uses.
// ----------------------------------------------------------------------

function WalletToWalletControl() {
  return (
    <>
      <PageHeader
        title="Wallet to Wallet Controls"
        subtitle="Allow or block wallet-to-wallet transfers across the platform."
      />

      <Stack spacing={3}>
        <MasterControl />
      </Stack>
    </>
  );
}

export default WalletToWalletControl;
