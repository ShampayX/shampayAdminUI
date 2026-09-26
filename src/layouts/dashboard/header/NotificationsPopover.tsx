import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  List,
  Button,
  Divider,
  IconButton,
  Typography,
  ListSubheader,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";
import MenuPopover from "../../../components/menu-popover";
import { IconButtonAnimate } from "../../../components/animate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { PATH_DASHBOARD } from "src/routes/paths";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk } from "src/utils/apiResult";

// ----------------------------------------------------------------------
// There is no server push any more.
//
// The backend removed its Socket.IO server (brief A-001): the two `io.emit`
// calls that carried `fund_request_received` are gone and none is planned. This
// component used to hold an `io()` connection to a hardcoded
// `https://dev.api.shampay.pro`, which now fails and retries forever - an
// endless reconnect loop in every operator's console.
//
// The replacement the brief asks for is a poll. `get_p_fnd_requests` is the
// same list the Fund Requests screen shows, so a new pending request surfaces
// here within one interval. Anything whose `fund_request_Id` we have not seen
// before is new; the first poll only seeds the baseline so a fresh login does
// not toast the entire backlog.
// ----------------------------------------------------------------------

const POLL_INTERVAL_MS = 60_000;
const POLL_PAGE_SIZE = 20;

type NotificationItem = {
  id: string;
  title: string;
  amount?: number;
  reason?: string;
  createdAt?: string;
  raw?: any;
};

export default function NotificationsPopover() {
  const navigate = useNavigate();
  const { Api } = useAuthContext();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("notification-muted") === "true"
  );
  const isMutedRef = useRef(isMuted);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  /** Request ids already surfaced. `null` until the first poll seeds it. */
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
    localStorage.setItem("notification-muted", String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    soundRef.current = new Audio("/money_sound.mp3");
  }, []);

  const announce = useCallback((item: NotificationItem) => {
    setNotifications((prev) => [item, ...prev].slice(0, 50));
    setUnreadCount((c) => c + 1);

    if (!isMutedRef.current && soundRef.current) {
      soundRef.current.play().catch(() => {});
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      const show = () =>
        new Notification("New fund request", {
          body: `${item.title} - ₹${item.amount ?? ""}`,
        });

      if (Notification.permission === "granted") {
        show();
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") show();
        });
      }
    }
  }, []);

  const toItem = (row: any): NotificationItem => ({
    id: String(row?.fund_request_Id || row?._id || Date.now()),
    title: row?.fund_request_Id
      ? `Fund request ${row.fund_request_Id}`
      : `Fund request ₹${row?.amount ?? ""}`,
    amount: row?.amount,
    reason: row?.remarks,
    createdAt: row?.createdAt || new Date().toISOString(),
    raw: row,
  });

  const poll = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await Api(
      `admin/fundManagement/get_p_fnd_requests`,
      "POST",
      {
        pageInitData: { pageSize: POLL_PAGE_SIZE, currentPage: 1 },
      },
      token
    );

    // A failed poll is not worth a toast - it retries on the next tick.
    if (!isOk(response)) return;

    const rows: any[] = Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

    // First poll only records what already exists.
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(rows.map((row) => toItem(row).id));
      return;
    }

    const seen = seenIdsRef.current;
    // Oldest first, so the newest request ends up at the top of the list.
    [...rows].reverse().forEach((row) => {
      const item = toItem(row);
      if (seen.has(item.id)) return;
      seen.add(item.id);
      announce(item);
    });
  }, [Api, announce]);

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (!cancelled) poll();
    };

    tick();
    const timer = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [poll]);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
    setUnreadCount(0);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNavigateToRequests = () => {
    navigate(PATH_DASHBOARD.fundmanagement.fundrequest);
    setOpenPopover(null);
    setUnreadCount(0);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <FontAwesomeIcon icon={faBell} />
        </Badge>
      </IconButtonAnimate>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        sx={{ width: 360, p: 0 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have {unreadCount} unread messages
            </Typography>
          </Box>

          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton onClick={toggleMute}>
              <Iconify
                icon={
                  isMuted ? "ic:baseline-volume-off" : "ic:baseline-volume-up"
                }
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Scrollbar sx={{ height: 340 }}>
          <List
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ py: 1, px: 2.5, typography: "overline" }}
              >
                Recent
              </ListSubheader>
            }
          >
            {notifications.length === 0 && (
              <ListItemButton sx={{ py: 1.5, px: 2.5 }}>
                <ListItemAvatar>
                  <Avatar>🔕</Avatar>
                </ListItemAvatar>
                <ListItemText primary="No recent notifications" />
              </ListItemButton>
            )}

            {notifications.map((msg, i) => (
              <ListItemButton
                key={msg.id + i}
                sx={{ py: 1.5, px: 2.5 }}
                onClick={handleNavigateToRequests}
              >
                <ListItemAvatar>
                  <Avatar>💰</Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={msg.title}
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled" }}
                    >
                      {new Date(msg.createdAt || "").toLocaleString()}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ p: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth disableRipple onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={handleNavigateToRequests}
            >
              View All
            </Button>
          </Stack>
        </Box>
      </MenuPopover>
    </>
  );
}
