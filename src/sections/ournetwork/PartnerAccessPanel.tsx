import { useCallback, useEffect, useMemo, useState } from "react";
// @mui
import {
  Box,
  Chip,
  Stack,
  Alert,
  Divider,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
// components
import { useSnackbar } from "src/components/snackbar";
import {
  FormCard,
  LoadingState,
  PageGhostButton,
} from "src/components/page-kit";
import {
  isOk,
  failureMessage,
  notifyFailure,
  notifyOk,
  readReadinessReport,
  ReadinessCheck,
} from "src/utils/apiResult";
import { ipEntryError } from "src/utils/ipAllowList";

// ----------------------------------------------------------------------
// Partner access & readiness (Stage 2).
//
// "Created" and "able to transact" are different states, and until this panel
// nothing on screen distinguished them. Four separate guards stand between the
// two, each answering with a different status and vocabulary (item 2a):
//
//   1. Access key        401 "Invalid access key"
//   2. Categories        403 "Partner allowed categories are required."
//   3. IP allow-list     403 "IP not whitelisted" / 500 "Please configure your IP"
//   4. allowed_users row 403 "Access denied. User not found in the allowed list."
//
// Gates 1-3 come from the readiness report. **Gate 4 does not** - the readiness
// report has no allowed-list check - so it is read from `getAllowedUsers`,
// whose `hasAllowListRow` is the only thing that distinguishes "deliberately
// blocked" from "never onboarded" (item 2c).
//
// Endpoints used here:
//   GET  admin/readiness/partner/:partnerId                     (3a)
//   GET  admin/API_User_Management/partner_ips/:partnerId       (2b)
//   POST admin/API_User_Management/set_partner_ips              (2b)
//   GET  admin/API_User_Management/partner_callbacks/:partnerId (2d)
//   POST admin/API_User_Management/set_partner_callbacks        (2d)
//   GET  admin/API_User_Management/getAllowedUsers              (2c)
//   POST admin/API_User_Management/changeAllowedUsers/:Id       (2c)
// ----------------------------------------------------------------------

type GateState = "ok" | "blocked" | "unknown";

type Gate = {
  key: string;
  label: string;
  state: GateState;
  value: string;
  refused: string;
};

/** The readiness check names that back gates 1-3. */
const GATE_CHECK = {
  accessKey: "accessKey",
  categories: "activeCategoryIds",
  ip: "ipAllowList",
};

const GateIcon = ({ state }: { state: GateState }) => {
  if (state === "ok") return <CheckCircleOutlineIcon color="success" />;
  if (state === "blocked") return <HighlightOffIcon color="error" />;
  return <WarningAmberOutlinedIcon color="disabled" />;
};

export default function PartnerAccessPanel({
  partnerId,
  onChanged,
}: {
  partnerId: string;
  onChanged?: () => void;
}) {
  const theme = useTheme();
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const token = () => localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [report, setReport] = useState<any>(null);
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [callbacks, setCallbacks] = useState<any>(null);
  const [allowRow, setAllowRow] = useState<any>(null);

  // ---------------------------------------------------------------- loading

  const load = useCallback(() => {
    if (!partnerId) return;
    setLoading(true);
    setError("");

    const t = token();
    Promise.all([
      Api(`admin/readiness/partner/${partnerId}`, "GET", "", t),
      Api(`admin/API_User_Management/partner_ips/${partnerId}`, "GET", "", t),
      Api(
        `admin/API_User_Management/partner_callbacks/${partnerId}`,
        "GET",
        "",
        t
      ),
      Api(`admin/API_User_Management/getAllowedUsers`, "GET", "", t),
    ])
      .then(([readinessRes, ipRes, cbRes, allowedRes]: any[]) => {
        // Readiness answers on a bare shape, not `{ code, data }` - see
        // `readReadinessReport`.
        const rep = readReadinessReport(readinessRes);
        setReport(rep);
        if (!rep) setError(failureMessage(readinessRes));

        setIpInfo(isOk(ipRes) ? ipRes.data?.data : null);
        setCallbacks(isOk(cbRes) ? cbRes.data?.data : null);

        if (isOk(allowedRes)) {
          const list: any[] = allowedRes.data?.data || [];
          setAllowRow(list.find((u) => u.userId === partnerId) || null);
        } else {
          setAllowRow(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load this partner's access configuration.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  useEffect(() => {
    load();
  }, [load]);

  // ------------------------------------------------------------- the gates

  const checkByName = useMemo(() => {
    const map = new Map<string, ReadinessCheck>();
    (report?.checks || []).forEach((c: ReadinessCheck) => map.set(c.name, c));
    return map;
  }, [report]);

  const gateFromCheck = (
    key: string,
    label: string,
    checkName: string,
    value: string,
    refused: string
  ): Gate => {
    const check = checkByName.get(checkName);
    return {
      key,
      label,
      state: !check ? "unknown" : check.ok ? "ok" : "blocked",
      value,
      refused,
    };
  };

  const ipList: string[] = ipInfo?.myIps || [];

  const gates: Gate[] = [
    gateFromCheck(
      "accessKey",
      "Access key issued",
      GATE_CHECK.accessKey,
      checkByName.get(GATE_CHECK.accessKey)?.ok
        ? "Issued (the key itself is never returned)"
        : "Not issued",
      '401 "Invalid access key"'
    ),
    gateFromCheck(
      "categories",
      "Categories assigned",
      GATE_CHECK.categories,
      checkByName.get(GATE_CHECK.categories)?.ok
        ? "At least one category assigned"
        : "None assigned",
      '403 "Partner allowed categories are required." (plain text, not JSON)'
    ),
    gateFromCheck(
      "ip",
      "IP allow-list configured",
      GATE_CHECK.ip,
      ipList.length
        ? `${ipList.length} address${ipList.length === 1 ? "" : "es"} (${
            ipInfo?.source
          })`
        : "Empty",
      '403 "IP not whitelisted", or 500 "Please configure your IP" when empty'
    ),
    {
      // Gate 4 is NOT in the readiness report - it comes from getAllowedUsers.
      key: "allowList",
      label: "Allowed-users row",
      state: !allowRow
        ? "unknown"
        : allowRow.hasAllowListRow && allowRow.allowed
        ? "ok"
        : "blocked",
      value: !allowRow
        ? "Unknown"
        : !allowRow.hasAllowListRow
        ? "No row exists - never onboarded"
        : allowRow.allowed
        ? "Allowed"
        : "Row exists but blocked",
      refused: '403 "Access denied. User not found in the allowed list."',
    },
  ];

  const canTransact = gates.every((g) => g.state === "ok");

  // ------------------------------------------------------------ 2b: IP list

  const [newIp, setNewIp] = useState("");
  const [ipBusy, setIpBusy] = useState(false);
  const newIpError = newIp.trim() ? ipEntryError(newIp) : "";

  const saveIps = (payload: any, successCopy: string) => {
    setIpBusy(true);
    Api(
      `admin/API_User_Management/set_partner_ips`,
      "POST",
      { partnerId, ...payload },
      token()
    ).then((Response: any) => {
      if (isOk(Response)) {
        notifyOk(enqueueSnackbar, Response, successCopy);
        setNewIp("");
        load();
        onChanged?.();
      } else {
        // A bad entry answers `400 Not a valid IP address: 999.1.1.1`, which is
        // written to be read as-is.
        notifyFailure(enqueueSnackbar, Response);
      }
      setIpBusy(false);
    });
  };

  const addIp = () => {
    const value = newIp.trim();
    if (!value || ipEntryError(value)) return;
    saveIps({ add: value }, "IP added to the allow-list.");
  };

  const removeIp = (ip: string) => saveIps({ remove: ip }, "IP removed.");

  // --------------------------------------------------------- 2d: callbacks

  const callbackKeys: Record<string, string> = callbacks?.keys || {};
  const [cbDraft, setCbDraft] = useState<Record<string, string>>({});
  const [cbBusy, setCbBusy] = useState(false);

  useEffect(() => {
    setCbDraft({ ...(callbacks?.partnerCallbackUrls || {}) });
  }, [callbacks]);

  const cbDirty = useMemo(() => {
    const saved = callbacks?.partnerCallbackUrls || {};
    return Object.keys(callbackKeys).filter(
      (k) => String(cbDraft[k] ?? "").trim() !== String(saved[k] ?? "").trim()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cbDraft, callbacks]);

  const saveCallbacks = () => {
    if (!cbDirty.length) return;
    const payload: Record<string, string> = {};
    cbDirty.forEach((k) => {
      payload[k] = String(cbDraft[k] ?? "").trim();
    });
    setCbBusy(true);
    Api(
      `admin/API_User_Management/set_partner_callbacks`,
      "POST",
      { partnerId, callbacks: payload },
      token()
    ).then((Response: any) => {
      if (isOk(Response)) {
        notifyOk(enqueueSnackbar, Response, "Callback URLs updated.");
        load();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setCbBusy(false);
    });
  };

  // ----------------------------------------------------- 2c: allowed_users

  const [allowBusy, setAllowBusy] = useState(false);
  const toggleAllowed = (next: boolean) => {
    setAllowBusy(true);
    Api(
      `admin/API_User_Management/changeAllowedUsers/${partnerId}`,
      "POST",
      { allowed: next },
      token()
    ).then((Response: any) => {
      if (isOk(Response)) {
        notifyOk(enqueueSnackbar, Response, "Updated.");
        load();
        onChanged?.();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
      setAllowBusy(false);
    });
  };

  // ------------------------------------------------------------- rendering

  if (loading) return <LoadingState label="Loading access configuration..." />;

  return (
    <Stack spacing={2}>
      {error && (
        <Alert
          severity="error"
          action={
            <PageGhostButton startIcon={<RefreshOutlinedIcon />} onClick={load}>
              Retry
            </PageGhostButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* ---------------- 2a: the four gates ---------------- */}
      <FormCard
        title="Can this partner transact?"
        subtitle="Four separate guards stand between a created partner and a working one. All four must pass."
      >
        <Alert
          severity={canTransact ? "success" : "warning"}
          icon={canTransact ? <CheckCircleOutlineIcon /> : undefined}
          sx={{ mb: 2 }}
        >
          {canTransact
            ? "All four gates are satisfied - this partner can transact."
            : "This partner is created but cannot transact. The failing gates are marked below."}
        </Alert>

        <Stack spacing={1.25}>
          {gates.map((gate) => (
            <Stack
              key={gate.key}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              sx={{
                p: 1.25,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  gate.state === "blocked"
                    ? alpha(theme.palette.error.main, 0.04)
                    : "transparent",
              }}
            >
              <GateIcon state={gate.state} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {gate.label}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {gate.value}
                </Typography>
                {gate.state !== "ok" && (
                  <Typography
                    sx={{ fontSize: 11, color: "error.main", mt: 0.25 }}
                  >
                    Partner sees: {gate.refused}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>

        {/* The category check reads the list baked into the access key when it
            was minted, not the database - so a category change is inert until a
            new key is issued. Saying so is the whole point of item 2a. */}
        <Alert severity="info" sx={{ mt: 2 }}>
          Entitlements are read from the access key, not the database. Changing
          this partner's categories does nothing until a new access key is
          issued - regenerating the key is what applies a category change, and
          it invalidates the old key immediately.
        </Alert>
      </FormCard>

      {/* ---------------- 2c: the allowed_users row ---------------- */}
      <FormCard
        title="Allowed-users row"
        subtitle="Gate 4. A partner with no row is refused at every transaction, which is a different problem from being deliberately blocked."
      >
        {!allowRow ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            This partner did not appear in the allowed-users list.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                color={allowRow.hasAllowListRow ? "default" : "warning"}
                variant="outlined"
                label={
                  allowRow.hasAllowListRow
                    ? "Row exists"
                    : "No row - never onboarded"
                }
              />
              <Chip
                size="small"
                color={allowRow.allowed ? "success" : "error"}
                variant="outlined"
                label={allowRow.allowed ? "Allowed" : "Blocked"}
              />
              {allowRow.isBeneSearchInDatabase && (
                <Chip
                  size="small"
                  variant="outlined"
                  label="Beneficiary search in database"
                />
              )}
            </Stack>

            {!allowRow.hasAllowListRow && (
              <Alert severity="warning">
                No <code>allowed_users</code> row exists for this partner. Every
                transaction is refused with "Access denied. User not found in
                the allowed list." Allowing them below creates the row.
              </Alert>
            )}

            <Box>
              <LoadingButton
                variant={allowRow.allowed ? "outlined" : "contained"}
                color={allowRow.allowed ? "error" : "primary"}
                size="small"
                loading={allowBusy}
                onClick={() => toggleAllowed(!allowRow.allowed)}
              >
                {allowRow.allowed ? "Block partner" : "Allow partner"}
              </LoadingButton>
            </Box>
          </Stack>
        )}
      </FormCard>

      {/* ---------------- 2b: the IP allow-list ---------------- */}
      <FormCard
        title="IP allow-list"
        subtitle="Gate 3. A partner cannot make a single API call until at least one address is set."
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Chip
              size="small"
              color={ipInfo?.callable ? "success" : "error"}
              label={ipInfo?.callable ? "Callable" : "Cannot call any endpoint"}
            />
            {ipInfo?.source && (
              <Tooltip
                title={
                  ipInfo.source === "legacy myIp"
                    ? "This partner is still on the legacy single-address field. The first save here moves them onto the list permanently."
                    : "Which field answered for this partner."
                }
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Source: ${ipInfo.source}`}
                />
              </Tooltip>
            )}
          </Stack>

          {ipInfo?.source === "legacy myIp" && (
            <Alert severity="info">
              On the legacy single <code>myIp</code> field. It keeps working,
              but the first save here moves this partner onto the list
              permanently.
            </Alert>
          )}

          {Array.isArray(ipInfo?.unparseable) &&
            ipInfo.unparseable.length > 0 && (
              <Alert severity="warning">
                {ipInfo.unparseable.length} entr
                {ipInfo.unparseable.length === 1 ? "y" : "ies"} can never match
                a client address and should be removed:{" "}
                <strong>{ipInfo.unparseable.join(", ")}</strong>. They are kept
                rather than silently dropped.
              </Alert>
            )}

          {ipList.length === 0 ? (
            <Alert severity="error">
              No addresses configured. Every endpoint answers 500 "Please
              configure your IP".
            </Alert>
          ) : (
            <Stack spacing={0.75}>
              {ipList.map((ip: string) => {
                const bad = Boolean(ipEntryError(ip));
                return (
                  <Stack
                    key={ip}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1,
                      border: `1px solid ${
                        bad ? theme.palette.warning.main : theme.palette.divider
                      }`,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 13, fontFamily: "monospace", flex: 1 }}
                    >
                      {ip}
                    </Typography>
                    {bad && (
                      <Chip size="small" color="warning" label="Unusable" />
                    )}
                    <IconButton
                      size="small"
                      disabled={ipBusy}
                      onClick={() => removeIp(ip)}
                      aria-label={`Remove ${ip}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>
          )}

          <Divider />

          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              fullWidth
              label="Add an IPv4 or IPv6 address"
              placeholder="203.0.113.10"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addIp();
              }}
              error={Boolean(newIpError)}
              helperText={
                newIpError ||
                "Ranges (10.0.0.0/8) are rejected - the platform compares addresses exactly."
              }
            />
            <LoadingButton
              variant="contained"
              startIcon={<AddIcon />}
              loading={ipBusy}
              disabled={!newIp.trim() || Boolean(newIpError)}
              onClick={addIp}
              sx={{ mt: 0.25 }}
            >
              Add
            </LoadingButton>
          </Stack>
        </Stack>
      </FormCard>

      {/* ---------------- 2d: callback URLs ---------------- */}
      <FormCard
        title="Callback URLs"
        subtitle="Where asynchronous results are delivered. An empty value clears the callback."
      >
        {!callbacks ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Could not read this partner's callback URLs.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {Array.isArray(callbacks.unset) && callbacks.unset.length > 0 && (
              <Alert severity="info">
                {callbacks.unset.length} of {Object.keys(callbackKeys).length}{" "}
                callbacks are unset, so those products would deliver nothing
                today: <strong>{callbacks.unset.join(", ")}</strong>.
              </Alert>
            )}

            {Object.keys(callbackKeys).map((key) => (
              <TextField
                key={key}
                size="small"
                fullWidth
                label={`${key} - ${callbackKeys[key]}`}
                placeholder="https://partner.example.com/hook"
                value={cbDraft[key] ?? ""}
                onChange={(e) =>
                  setCbDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            ))}

            <Box>
              <LoadingButton
                variant="contained"
                size="small"
                loading={cbBusy}
                disabled={!cbDirty.length}
                onClick={saveCallbacks}
              >
                {cbDirty.length
                  ? `Save ${cbDirty.length} change${
                      cbDirty.length === 1 ? "" : "s"
                    }`
                  : "No changes"}
              </LoadingButton>
            </Box>
          </Stack>
        )}
      </FormCard>

      {/* ---------------- 3a: the full readiness report ---------------- */}
      <FormCard
        title="Readiness report"
        subtitle="Everything the platform checks for this partner. Blocking failures make it unusable; warnings mean it works but is wrong on some path."
      >
        {!report ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            The readiness report could not be loaded.
          </Typography>
        ) : (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                color={report.ready ? "success" : "error"}
                label={report.ready ? "Ready" : "Not ready"}
              />
              {report.blocking?.length > 0 && (
                <Chip
                  size="small"
                  color="error"
                  variant="outlined"
                  label={`${report.blocking.length} blocking`}
                />
              )}
              {report.warnings?.length > 0 && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`${report.warnings.length} warning${
                    report.warnings.length === 1 ? "" : "s"
                  }`}
                />
              )}
            </Stack>

            {(report.checks || []).map((check: ReadinessCheck) => (
              <Stack
                key={check.name}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {check.ok ? (
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                ) : check.severity === "blocking" ? (
                  <HighlightOffIcon color="error" fontSize="small" />
                ) : (
                  <WarningAmberOutlinedIcon color="warning" fontSize="small" />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {check.name}
                    </Typography>
                    {!check.ok && (
                      <Chip
                        size="small"
                        variant="outlined"
                        color={
                          check.severity === "blocking" ? "error" : "warning"
                        }
                        label={check.severity}
                      />
                    )}
                  </Stack>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {check.detail}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </FormCard>
    </Stack>
  );
}
