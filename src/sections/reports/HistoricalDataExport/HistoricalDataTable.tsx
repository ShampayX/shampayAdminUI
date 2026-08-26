// @mui
import { Box, Stack, TableCell, Typography } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { sentenceCase } from "change-case";
// components
import { fDate } from "src/utils/formatTime";
import AWS from "aws-sdk";
// page kit
import {
  KitRow,
  StatusPill,
  StackedCell,
  CopyText,
  PageGhostButton,
} from "src/components/page-kit";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

// ----------------------------------------------------------------------
// One generated export. Download goes straight to a short-lived S3 signed URL,
// exactly as before - the row only changes how it looks.
// ----------------------------------------------------------------------

export default function HistoricalDataTable({ row }: any) {
  const download = (val: string) => {
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: val !== "" && val?.split("/").splice(3, 3).join("/"),
      Expires: 600,
    };

    s3.getSignedUrl("getObject", params, (err, url) => {
      window.open(url, "_blanck");
    });
  };

  const status = String(row?.status || "");
  const isReady = status.toLowerCase() === "generated";
  const isAdmin = row.user_data?.role === "ADMIN";

  return (
    <KitRow key={row?.id}>
      {/* Requested at */}
      <TableCell>
        <StackedCell
          bold
          primary={fDate(row.created_at)}
          secondary={new Date(row.created_at).toLocaleTimeString()}
        />
      </TableCell>

      {/* Report for */}
      <TableCell>
        {isAdmin ? (
          <StackedCell
            primary={sentenceCase(row?.user_data?.userName || "")}
            secondary="Admin"
          />
        ) : (
          <>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
              {sentenceCase(row?.user_data?.userName || "")}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {sentenceCase(row?.user_data?.role || "")}
              </Typography>
              {row?.user_data?.userCode && (
                <CopyText value={row?.user_data?.userCode} size={13}>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    ({row?.user_data?.userCode})
                  </Typography>
                </CopyText>
              )}
            </Stack>
          </>
        )}
      </TableCell>

      {/* Covered range */}
      <TableCell>
        <Typography sx={{ fontSize: 13.5, whiteSpace: "nowrap" }}>
          {fDate(row?.from_date)} — {fDate(row?.to_date)}
        </Typography>
      </TableCell>

      {/* Where the request came from */}
      <TableCell>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
          {row?.IP_address || "-"}
        </Typography>
        {(row?.latitude || row?.longitude) && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <PlaceOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              {row?.latitude}, {row?.longitude}
            </Typography>
          </Stack>
        )}
      </TableCell>

      {/* Status */}
      <TableCell align="center">
        <StatusPill status={status} />
      </TableCell>

      {/* Download */}
      <TableCell align="center">
        {isReady ? (
          <PageGhostButton
            startIcon={<DownloadOutlinedIcon />}
            onClick={() => download(row?.url)}
          >
            Download
          </PageGhostButton>
        ) : (
          <Box
            component="span"
            sx={{ fontSize: 12.5, color: "text.disabled", whiteSpace: "nowrap" }}
          >
            Not ready
          </Box>
        )}
      </TableCell>
    </KitRow>
  );
}
