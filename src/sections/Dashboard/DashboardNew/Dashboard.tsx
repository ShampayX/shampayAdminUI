import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  ButtonBase,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAuthContext } from "src/auth/useAuthContext";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import TransactionFlightDeck from "./TransactionFlightDeck";
import DashboardInsights from "./DashboardInsights";

dayjs.extend(utc);
dayjs.extend(timezone);

/* Reads inside the flight deck labels, e.g. "CLEARED TODAY". */
const PERIOD_LABEL: Record<string, string> = {
  today: "today",
  month: "this month",
  year: "this year",
  customDate: "this range",
};

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
  { value: "customDate", label: "Custom" },
];

const DashboardOverview: React.FC = () => {
  const { Api } = useAuthContext();

  const [data, setData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const [dateFilter, setDateFilter] = useState("today");
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);

  /* ================= API CALL ================= */

  const getDashboard = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    // Validate custom date range
    if (dateFilter === "customDate" && (!startDate || !endDate)) {
      console.warn("Please select both start and end dates");
      setLoading(false);
      return;
    }

    let body: any = {
      categoryId: "",
      productId: "",
      transactionType: "",
      dateFilter: dateFilter,
      startDate: "",
      endDate: "",
    };

    if (dateFilter === "customDate") {
      body.startDate = dayjs(startDate).format("YYYY-MM-DD");
      body.endDate = dayjs(endDate).format("YYYY-MM-DD");
    }

    try {
      const Response: any = await Api(
        "dashboard/getTransaction",
        "POST",
        body,
        token
      );

      if (Response?.data?.code === 200) {
        setData(Response.data.data);
        setUpdatedAt(Date.now());
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (dateFilter !== "customDate") {
      getDashboard();
    }
  }, [dateFilter]);

  /* ================= PROCESS DATA ================= */

  useEffect(() => {
    if (!data) return;

    const categories: any[] = [];

    Object.values(data.category || {}).forEach((item: any) => {
      if (item.categoryName) {
        categories.push(item);
      }
    });

    setCategoryData(categories);
  }, [data]);

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* PAGE HEADER + PERIOD SWITCH */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography sx={{ fontSize: 25, fontWeight: 700, color: "text.primary" }}>
            Summary
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14.5, color: "text.secondary" }}>
            Live posture of every rupee moving through the platform.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            p: 0.5,
            borderRadius: 99,
            flexShrink: 0,
            backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.1),
          }}
        >
          {PERIOD_OPTIONS.map((option) => {
            const selected = dateFilter === option.value;
            return (
              <ButtonBase
                key={option.value}
                onClick={() => setDateFilter(option.value)}
                sx={{
                  px: 2.25,
                  py: 0.9,
                  borderRadius: 99,
                  fontSize: 13.5,
                  fontWeight: selected ? 700 : 500,
                  color: selected ? "text.primary" : "text.secondary",
                  backgroundColor: (theme) =>
                    selected ? theme.palette.background.paper : "transparent",
                  boxShadow: selected ? "0 1px 4px rgba(15,23,42,0.14)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {option.label}
              </ButtonBase>
            );
          })}
        </Stack>
      </Stack>

      {/* CUSTOM RANGE */}
      {dateFilter === "customDate" && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ mb: 3 }}
          >
            <DatePicker
              label="Start Date"
              value={startDate}
              inputFormat="DD/MM/YYYY"
              maxDate={dayjs()}
              onChange={(newValue) => {
                setStartDate(newValue);

                // reset end date if it becomes invalid
                if (endDate && newValue && dayjs(endDate).isBefore(newValue)) {
                  setEndDate(null);
                }
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              minDate={startDate || undefined}
              maxDate={dayjs()}
              inputFormat="DD/MM/YYYY"
              onChange={(newValue) => setEndDate(newValue)}
              disabled={!startDate}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <Button
              variant="contained"
              onClick={getDashboard}
              disabled={!startDate || !endDate}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Apply
            </Button>
          </Stack>
        </LocalizationProvider>
      )}

      {/* TRANSACTION FLIGHT DECK */}
      <TransactionFlightDeck
        data={data}
        periodLabel={PERIOD_LABEL[dateFilter] || "today"}
      />

      {/* INSIGHT SECTIONS */}
      <DashboardInsights
        data={data}
        categoryData={categoryData}
        periodLabel={PERIOD_LABEL[dateFilter] || "today"}
        updatedAt={updatedAt}
      />
    </Box>
  );
};

export default DashboardOverview;
