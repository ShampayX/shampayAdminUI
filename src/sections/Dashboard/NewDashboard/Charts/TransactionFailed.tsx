import React, { useState } from "react";
import ReactDOM from "react-dom";
import ReactApexChart from "react-apexcharts";

const generateShadeOfRed = (value: number, max: number) => {
  const intensity = Math.floor((value / max) * 255);
  return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
};

export const TransactionFailed = () => {
  const series = [25, 15, 44, 55, 41, 17, 20];
  const maxSeriesValue = Math.max(...series);
  const colors = series.map((value) =>
    generateShadeOfRed(value, maxSeriesValue)
  );

  const [chartState, setChartState] = useState<any>({
    series: series,
    options: {
      chart: {
        width: "100%",
        type: "pie", // Use 'donut' for semi-circular chart
      },
      labels: [
        "Success (2%) : 27,000 & ₹27,00,000",
        "Failed (.1%) : 1,000 & ₹1,00,000",
        "In Process (2%) : 2,000 & ₹2,00,000",
        "Initiated (.1%) : 1,000 & ₹1,00,000",
        "Hold (2%) : 2,000 & ₹2,00,000",
        "Queued (.1%) : 1,000 & ₹1,00,000",
        "Pending (2%) : 2,000 & ₹2,00,000",
      ],
      colors: colors,
      plotOptions: {
        pie: {
          startAngle: -90, // Start angle for semi-circle
          endAngle: 90, // End angle for semi-circle
          offsetY: 10,
          dataLabels: {
            offset: -5,
          },
        },
      },
      legend: {
        show: true,
      },
    },
  });

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartState.options}
          series={chartState.series}
          type="pie"
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};
