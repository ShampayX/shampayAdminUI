import { Stack } from "@mui/material";
import React from "react";
import { PageHeader } from "src/components/page-kit";
import AgentControl from "./AgentControl";
import DistributorControl from "./DistributorControl";
import MasterDistributorControl from "./MasterDistributorControl";
import MasterControl from "./MasterControl";

function WalletToWalletControl() {
  return (
    <>
      <PageHeader
        title="Wallet to Wallet Controls"
        subtitle="Allow or block wallet transfers for each role in the network."
      />

      <Stack spacing={3}>
        <MasterControl />
        <AgentControl />
        <DistributorControl />
        <MasterDistributorControl />
      </Stack>
    </>
  );
}

export default WalletToWalletControl;
