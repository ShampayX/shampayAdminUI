import { Card, Stack, Typography } from "@mui/material";
import React from "react";

function ModeCustome(props: any) {
  return (
    <>
      <Stack>
        <Card sx={{ p: 2 }}>
          <Stack flexDirection="row" gap={1}>
            <Typography variant="h6" noWrap>
              {props?.modeData?.modeName}
            </Typography>

            <Typography variant="body1">
              ({props?.modeData?.transactionFeeType})
            </Typography>
          </Stack>

          <Stack flexDirection="row" justifyContent="space-between">
            <Stack>
              <Typography variant="subtitle1" noWrap>
                Trans. Fee{" "}
              </Typography>
              {props?.modeData?.transactionFeeOption?.for_API_user !== "" && (
                <Typography variant="body2"> API User</Typography>
              )}
              {props?.modeData?.transactionFeeOption?.for_Agent !== "" && (
                <Typography variant="body2"> Agent</Typography>
              )}
              {props?.modeData?.transactionFeeOption?.for_Distributor !==
                "" && <Typography variant="body2"> Distributor</Typography>}

              {props?.modeData?.transactionFeeOption?.for_M_Distributor !==
                "" && (
                <Typography variant="body2" noWrap>
                  {" "}
                  M. Distributor
                </Typography>
              )}
            </Stack>
            <Stack>
              <Typography variant="subtitle1" noWrap>
                Fee Type{" "}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeOption?.for_API_user}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeOption?.for_Agent}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeOption?.for_Distributor}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeOption?.for_M_Distributor}
              </Typography>
            </Stack>
            <Stack ml={1}>
              <Typography variant="subtitle1" noWrap>
                Fee Value{" "}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeValue?.for_API_user}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeValue?.for_Agent}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeValue?.for_Distributor}
              </Typography>
              <Typography variant="body2" ml={2}>
                {props?.modeData?.transactionFeeValue?.for_M_Distributor}
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </>
  );
}

export default ModeCustome;
