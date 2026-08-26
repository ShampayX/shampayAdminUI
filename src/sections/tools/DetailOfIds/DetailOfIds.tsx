import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
// @mui
import { Box, Chip, Stack, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import { useSnackbar } from "src/components/snackbar";
// page kit
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FormCard,
  FormActions,
  StatCard,
  StatGrid,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Utilities > Reprocess.
//
// Presentation only. The flow is exactly what it was:
//
//   1. POST adminTransaction/get_transaction  { pageInitData, clientRefId: [] }
//      to check every pasted id exists
//   2. if any id is not in the response, stop and report - nothing is sent
//   3. otherwise POST admin/updateStatus     { clientRefId: [] }
//      which is the reprocess call
//
// Both requests, their bodies and the abort-on-invalid rule are unchanged.
//
// What is new is only what the screen shows back. The old version computed
// `invalidIds` and then rendered the message "These IDs are invalid:" with
// nothing after it, so the operator was told something was wrong but not what.
// The same array is now listed. `sendIds` and `responseMessage` were also set
// but never rendered - both are on screen now.
//
// The on-mount `get_transaction` call is kept as-is. Its result was never
// displayed and still is not; removing the call would change what the page
// requests, which is out of scope for a UI pass.
// ----------------------------------------------------------------------

type Outcome =
  | { kind: "idle" }
  | { kind: "invalid"; ids: string[] }
  | { kind: "sent"; message: string; ids: string[] }
  | { kind: "error"; message: string };

/** Split on any run of whitespace or commas, exactly as before. */
const parseIds = (value: string) =>
  value
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

const DetailOfIds = () => {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [inputValue, setInputValue] = useState("");
  const [isTxnFound, setIsTxnFound] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const [pageSize] = useState(25);
  const [currentPage] = useState(1);

  /* Ids the operator has typed, deduplicated for display only - the request
     still sends the parsed list exactly as it was parsed. */
  const parsed = useMemo(() => parseIds(inputValue), [inputValue]);
  const uniqueCount = useMemo(() => new Set(parsed).size, [parsed]);

  const ClientRefIds = () => {
    setIsTxnFound(true);
    const token = localStorage.getItem("token");
    const body = {
      pageInitData: {
        pageSize,
        currentPage,
      },
      clientRefId: "",
    };

    Api(`adminTransaction/get_transaction`, "POST", body, token).then(
      (Response: any) => {
        if (Response?.status === 200) {
          if (Response.data.code !== 200) {
            enqueueSnackbar(Response.data.message);
          }
          setIsTxnFound(false);
        } else {
          setIsTxnFound(false);
          enqueueSnackbar("Failed to Load");
        }
      }
    );
  };

  useEffect(() => {
    ClientRefIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    const clientRefIds = parseIds(inputValue);

    setInputValue("");
    setIsTxnFound(true);
    setOutcome({ kind: "idle" });

    const token = localStorage.getItem("token");

    try {
      const body = {
        pageInitData: {
          pageSize: clientRefIds.length,
          currentPage: 1,
        },
        clientRefId: clientRefIds,
      };

      const response = await Api(
        `adminTransaction/get_transaction`,
        "POST",
        body,
        token
      );

      if (response?.status === 200 && response.data.code === 200) {
        const validTxnData = response.data.data.data || [];
        const validClientRefIds = validTxnData.map(
          (txn: any) => txn.clientRefId
        );

        const invalidIds = clientRefIds.filter(
          (id: string) => !validClientRefIds.includes(id)
        );

        if (invalidIds.length > 0) {
          enqueueSnackbar(
            `${invalidIds.length} ID${
              invalidIds.length === 1 ? " is" : "s are"
            } invalid - nothing was sent`,
            { variant: "error" }
          );
          setOutcome({ kind: "invalid", ids: invalidIds });
          setIsTxnFound(false);
          return;
        }

        const updateResponse = await Api(
          "admin/updateStatus",
          "POST",
          {
            clientRefId: clientRefIds,
          },
          token
        );

        if (updateResponse?.status === 200) {
          enqueueSnackbar("Successfully sent to API!", { variant: "success" });
          setOutcome({
            kind: "sent",
            message: "Successfully sent to API!",
            ids: clientRefIds,
          });
        } else {
          enqueueSnackbar("Failed to update status.", { variant: "error" });
          setOutcome({ kind: "error", message: "Failed to update status." });
        }
      } else {
        enqueueSnackbar("Failed to validate IDs", { variant: "error" });
        setOutcome({ kind: "error", message: "Failed to validate IDs." });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Error occurred while processing", { variant: "error" });
      setOutcome({
        kind: "error",
        message: "Error occurred while processing.",
      });
    } finally {
      setIsTxnFound(false);
    }
  };

  return (
    <>
      <Helmet>
        <title> Reprocess | Shampay Admin </title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Reprocess"
          subtitle="Paste client reference IDs to re-run their status update. Every ID is checked against the transaction record first - if any one of them is unknown, nothing is sent."
        />

        <StatGrid columns={3}>
          <StatCard
            label="IDs Entered"
            value={parsed.length}
            caption={
              uniqueCount === parsed.length
                ? "Ready to validate"
                : `${uniqueCount} unique`
            }
            icon={<ContentPasteOutlinedIcon />}
          />
          <StatCard
            label="Last Run"
            value={
              outcome.kind === "sent"
                ? outcome.ids.length
                : outcome.kind === "invalid"
                ? 0
                : "-"
            }
            caption={
              outcome.kind === "sent"
                ? "Sent for reprocessing"
                : outcome.kind === "invalid"
                ? "Stopped before sending"
                : "Nothing run yet"
            }
            tone={outcome.kind === "sent" ? "success" : "neutral"}
            icon={<CheckCircleOutlineOutlinedIcon />}
          />
          <StatCard
            label="Rejected"
            value={outcome.kind === "invalid" ? outcome.ids.length : 0}
            caption="IDs with no matching transaction"
            tone={
              outcome.kind === "invalid" && outcome.ids.length > 0
                ? "error"
                : "neutral"
            }
            icon={<ErrorOutlineOutlinedIcon />}
          />
        </StatGrid>

        <Box sx={{ maxWidth: 820 }}>
          <FormCard
            title="Client reference IDs"
            subtitle="One per line, or separated by spaces or commas."
          >
            <TextField
              placeholder={"CRF00000001\nCRF00000002, CRF00000003"}
              multiline
              rows={6}
              fullWidth
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isTxnFound}
            />

            {parsed.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Caption>
                  {parsed.length} ID{parsed.length === 1 ? "" : "s"} parsed
                </Caption>
                <Stack
                  direction="row"
                  spacing={0.75}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 1, maxHeight: 132, overflowY: "auto" }}
                >
                  {parsed.map((id, index) => (
                    <Chip
                      key={`${id}-${index}`}
                      size="small"
                      label={id}
                      sx={{ height: 24, fontSize: 11.5, fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <FormActions>
              <PageGhostButton
                onClick={() => {
                  setInputValue("");
                  setOutcome({ kind: "idle" });
                }}
                disabled={isTxnFound || !inputValue}
              >
                Clear
              </PageGhostButton>
              <PageActionButton
                startIcon={<ReplayOutlinedIcon />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isTxnFound}
              >
                {isTxnFound ? "Working..." : "Reprocess"}
              </PageActionButton>
            </FormActions>
          </FormCard>

          {/* --- outcome of the last run --------------------------------- */}
          {outcome.kind === "invalid" && (
            <ResultPanel
              tone="error"
              icon={<ErrorOutlineOutlinedIcon />}
              title={`${outcome.ids.length} ID${
                outcome.ids.length === 1 ? "" : "s"
              } could not be matched`}
              description="No transaction exists for these references, so nothing was sent for reprocessing. Correct them and try again."
              ids={outcome.ids}
              theme={theme}
            />
          )}

          {outcome.kind === "sent" && (
            <ResultPanel
              tone="success"
              icon={<CheckCircleOutlineOutlinedIcon />}
              title={outcome.message}
              description={`${outcome.ids.length} ID${
                outcome.ids.length === 1 ? " was" : "s were"
              } validated and sent for reprocessing.`}
              ids={outcome.ids}
              theme={theme}
            />
          )}

          {outcome.kind === "error" && (
            <ResultPanel
              tone="error"
              icon={<ErrorOutlineOutlinedIcon />}
              title={outcome.message}
              description="Nothing was reprocessed. Check the IDs and try again."
              theme={theme}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default DetailOfIds;

// ----------------------------------------------------------------------

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.7,
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}

/** Result of the last run: what happened, and to which IDs. */
function ResultPanel({
  tone,
  icon,
  title,
  description,
  ids,
  theme,
}: {
  tone: "success" | "error";
  icon: React.ReactNode;
  title: string;
  description: string;
  ids?: string[];
  theme: any;
}) {
  const accent = theme.palette[tone].main;

  return (
    <Box
      sx={{
        mt: 2.5,
        p: 2.25,
        borderRadius: 2,
        border: `1px solid ${alpha(accent, 0.35)}`,
        backgroundColor: alpha(accent, theme.palette.mode === "light" ? 0.07 : 0.14),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            display: "flex",
            color: accent,
            flexShrink: 0,
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: accent }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
            {description}
          </Typography>

          {ids && ids.length > 0 && (
            <Stack
              direction="row"
              spacing={0.75}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1.5, maxHeight: 160, overflowY: "auto" }}
            >
              {ids.map((id, index) => (
                <Chip
                  key={`${id}-${index}`}
                  size="small"
                  label={id}
                  sx={{
                    height: 24,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: accent,
                    backgroundColor: alpha(accent, 0.14),
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
