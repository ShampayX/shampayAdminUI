import React, { useState } from "react";
import ReactDOM from "react-dom";
import ReactApexChart from "react-apexcharts";

export const PieChart = () => {
  const [chartState, setChartState] = useState<any>({
    series: [25, 15, 44, 55, 41, 17, 20],
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
      colors: [
        "#FF5733", // Color for Monday
        "#33FF57", // Color for Tuesday
        "#3357FF", // Color for Wednesday
        "#FF33A8", // Color for Thursday
        "#FF8C33", // Color for Friday
        "#33FFF3", // Color for Saturday
      ],
      //   theme: {
      //     monochrome: {
      //       enabled: true,
      //     },
      //   },

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

      //   dataLabels: {
      //     formatter(val: any, opts: any) {
      //       const name = opts.w.globals.labels[opts.seriesIndex];
      //       return [name, val.toFixed(1) + "%"];
      //     },
      //   },
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
