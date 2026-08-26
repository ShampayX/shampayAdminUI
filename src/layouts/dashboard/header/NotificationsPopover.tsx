import React, { useEffect, useRef, useState } from "react";
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
import { io, Socket } from "socket.io-client";
import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";
import MenuPopover from "../../../components/menu-popover";
import { IconButtonAnimate } from "../../../components/animate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { PATH_DASHBOARD } from "src/routes/paths";

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("notification-muted") === "true"
  );
  const isMutedRef = useRef(isMuted);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
    localStorage.setItem("notification-muted", String(isMuted));
  }, [isMuted]);

  let API_URL = "";

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    API_URL = "https://dev.api.shampay.pro";
  } else {
    API_URL = "https://api.shampay.pro";
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    soundRef.current = new Audio("/money_sound.mp3");

    // connect socket

    const socket = io(API_URL, {
      path: "/socket.io", // match your server
      transports: ["polling", "websocket"],
      auth: { token: localStorage.getItem("token") }, // optional
    });

    socket.on("connect", () => console.log("socket connected"));
    socket.on("fund_request_received", (payload) => {
      // payload contains: fund_request_Id, amount, status, company_name, createdAt, creator.role, creator.company_name
      //
      // show notification UI / sound / desktop notification here
    });
    socket.on("connect_error", (err) => console.error("connect_error", err));

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    // primary event name you said: 'fund_request_received'
    socket.on("fund_request_received", handleIncomingNotification);

    // fallback / alternate event name
    socket.on("NEW_FUND_REQUEST", handleIncomingNotification);

    socket.on("disconnect", (reason) => {});

    socket.on("connect_error", (err: any) => {
      console.warn("Socket connect_error", err?.message || err);
    });

    return () => {
      socket.off("fund_request_received", handleIncomingNotification);
      socket.off("NEW_FUND_REQUEST", handleIncomingNotification);
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // central handler
  function handleIncomingNotification(payload: any) {
    // payload shape varies; normalize minimally
    const item: NotificationItem = {
      id: payload?.id || payload?._id || String(Date.now()),
      title:
        payload?.title ||
        payload?.fund_request_Id ||
        `Fund request ₹${payload?.amount || ""}`,
      amount: payload?.amount,
      reason: payload?.reason,
      createdAt: payload?.createdAt || new Date().toISOString(),
      raw: payload,
    };

    setNotifications((prev) => [item, ...prev]);
    setUnreadCount((c) => c + 1);

    // if (!isMuted && soundRef.current) {
    //   soundRef.current.play().catch(() => {
    //     /* ignore play errors (autoplay restrictions) */
    //   });
    // }

    if (!isMutedRef.current && soundRef.current) {
      soundRef.current.play().catch(() => {});
    }

    // desktop notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("New fund request", {
          body: `${item.title} — ₹${item.amount ?? ""}`,
        });
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("New fund request", {
              body: `${item.title} — ₹${item.amount ?? ""}`,
            });
          }
        });
      }
    }
  }

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

  // const toggleMute = () => {
  //   setIsMuted((prev) => {
  //     const next = !prev;
  //     localStorage.setItem("notification-muted", String(next));
  //     return next;
  //   });
  // };

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
