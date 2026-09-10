import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";
import { FormCard, PageActionButton } from "src/components/page-kit";
import { IOSSwitch } from "./RoleTransferControl";
import { isOk, notifyFailure } from "src/utils/apiResult";

const MasterControl = () => {
  const [transferServic, setTransferServic] = useState(false);
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const searchTxnFilterData = () => {
    let token = localStorage.getItem("token");
    let body = {
      userType: "master",
      config: {
        data: {
          walletTransferServiceEnabled: transferServic,
        },
      },
    };
    Api(`admin/walletToWallet/setWalletConfig`, "POST", body, token).then(
      (Response: any) => {
        if (isOk(Response)) {
          enqueueSnackbar("User Detail found successfully", {
            variant: "success",
          });
        } else {
          notifyFailure(enqueueSnackbar, Response);
        }
        // if (Response.code == 200) {
        //   enqueueSnackbar('No Data Found', { variant: 'error' });
        //   setUserRecord(false);
        // }
      }
    );
  };

  return (
    <FormCard
      title="Master Control"
      subtitle="Master switch for wallet-to-wallet transfers across the network."
      actions={
        <PageActionButton onClick={searchTxnFilterData}>
          Submit
        </PageActionButton>
      }
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{
          px: 2,
          height: 56,
          borderRadius: 1.5,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
            Wallet transfer service
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {transferServic ? "Enabled" : "Disabled"} — press Submit to apply.
          </Typography>
        </Stack>

        <IOSSwitch
          checked={transferServic}
          onChange={() => setTransferServic(!transferServic)}
        />
      </Stack>
    </FormCard>
  );
};

export default MasterControl;
