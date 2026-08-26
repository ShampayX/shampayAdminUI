import { ApexOptions } from "apexcharts";
// @mui
import { useTheme, styled } from "@mui/material/styles";
import {
  Card,
  CardHeader,
  CardProps,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
// utils
import { fIndianCurrency, fNumber } from "../../utils/formatNumber";
// components
import Chart, { useChart } from "../../components/chart";

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;

const LEGEND_HEIGHT = 82;

const StyledChart = styled("div")(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(0),
  "& .apexcharts-canvas svg": {
    height: CHART_HEIGHT,
    textAlign: "start",
  },
  "& .apexcharts-canvas svg,.apexcharts-canvas foreignObject": {
    overflow: "visible",
  },
  "& .apexcharts-legend": {
    height: LEGEND_HEIGHT,
    alignContent: "center",
    position: "relative !important" as "relative",
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    Reason?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ApexOptions;
  };
}

export default function CircleGraph({
  title,
  subheader,
  chart,
  ...other
}: Props) {
  const theme = useTheme();

  const { colors, series, options, Reason } = chart;

  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },

    colors,
    labels: series.map((i) => i.label),
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: "center" },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "85%",
          labels: {
            value: {
              formatter: (value: number | string) => fNumber(value),
            },
            total: {
              formatter: (w: { globals: { seriesTotals: number[] } }) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              },
            },
          },
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Grid
        display={"grid"}
        gridTemplateColumns={{ sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
        spacing={3}
      >
        <StyledChart dir="ltr">
          <Chart
            type="donut"
            series={chartSeries}
            options={chartOptions}
            height={320}
          />
        </StyledChart>
        <Stack px={4}>
          <Typography variant="subtitle2">Reasons of Failure</Typography>
          {Reason?.map((item: any, index) => {
            return (
              <Typography variant="caption">
                {index}. {item.remarks || "-"}
              </Typography>
            );
          })}
        </Stack>
      </Grid>
    </Card>
  );
}
