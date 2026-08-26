import React, { useState, useEffect, useRef } from "react";
import { Modal, Box, Grid, Typography, Button, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { useAuthContext } from "src/auth/useAuthContext";
import { LoadingButton } from "@mui/lab";
import MotionModal from "../animate/MotionModal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "#ffffff",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AutoLogout = ({ children }: any) => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const timeoutRef: any = useRef();

  const handleLogout = () => {
    (localStorage.getItem("token") ||
      localStorage.getItem("authentication") == "false") &&
      handleOpen();
    logout();
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.clear();
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, 1800000);
  };

  const onEvent = () => {
    localStorage.getItem("authentication") == "false" && handleLogout();
    resetTimeout();
  };

  useEffect(() => {
    resetTimeout();
    const events = ["mousedown", "keydown", "mousemove", "scroll"];
    events.forEach((event) => {
      document.addEventListener(event, onEvent);
    });
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, onEvent);
      });
    };
  }, []);

  return (
    <>
      {children}
      <MotionModal open={open}>
        <Grid
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
          }}
        >
          <Typography variant="subtitle1" textAlign={"center"}>
            {localStorage.getItem("authentication") == "false"
              ? "Authentication failed. please login!"
              : "You have been automatically logged out due to inactivity"}
          </Typography>
          <LoadingButton
            onClick={() => {
              localStorage.setItem("authentication", "true");
              handleClose();
            }}
            variant="contained"
            sx={{
              mt: 1,
              width: "fit-content",
              margin: "auto",
            }}
          >
            login
          </LoadingButton>
        </Grid>
      </MotionModal>
    </>
  );
};

export default AutoLogout;
