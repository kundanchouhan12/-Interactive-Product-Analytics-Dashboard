import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function FeatureLineChart({ feature }) {
  const data = [
    { date: "Day 1", clicks: 5 },
    { date: "Day 2", clicks: 12 },
    { date: "Day 3", clicks: 8 },
  ];

  return (
    <>
      <h3>{feature} Trend</h3>
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line dataKey="clicks" stroke="#2e7d32" />
      </LineChart>
    </>
  );
}
