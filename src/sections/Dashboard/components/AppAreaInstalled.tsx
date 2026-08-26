import { ApexOptions } from "apexcharts";
import { useState } from "react";
// @mui
import { Card, CardHeader, Box, CardProps, Tabs, Tab } from "@mui/material";
// components
import { CustomSmallSelect } from "../../../components/custom-input";
import Chart, { useChart } from "../../../components/chart";

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[];
    series: {
      year: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ApexOptions;
  };
}

export default function AppAreaInstalled({
  title,
  subheader,
  chart,
  ...other
}: Props) {
  const { colors, categories, series, options } = chart;

  const [seriesData, setSeriesData] = useState("Day");

  const chartOptions = useChart({
    colors,
    xaxis: {
      categories,
    },
    ...options,
  });

  // function selectCategory (event: React.ChangeEvent<HTMLInputElement>)
  // {
  //   setSeriesData(event.target.value)
  // }

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <CustomSmallSelect
            value={seriesData}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSeriesData(event.target.value)
            }
          >
            {series.map((option) => (
              <option key={option.year} value={option.year}>
                {option.year}
              </option>
            ))}
          </CustomSmallSelect>
        }

        // action ={
        //   <Tabs value={seriesData} onChange={selectCategory}>

        // {series.map((option) => (
        //               <option key={option.year} value={option.year}>
        //                 {option.year}
        //               </option>
        //             ))}

        //   </Tabs>
        // }
      />

      {series.map((item) => (
        <Box key={item.year} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.year == seriesData && (
            <Chart
              type="line"
              series={item.data}
              options={chartOptions}
              height={364}
            />
          )}
        </Box>
      ))}
    </Card>
  );
}
