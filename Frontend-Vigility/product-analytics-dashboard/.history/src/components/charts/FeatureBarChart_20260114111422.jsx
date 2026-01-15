import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { feature: "date_filter", clicks: 40 },
  { feature: "age_filter", clicks: 25 },
  { feature: "gender_filter", clicks: 35 },
];

export default function FeatureBarChart({ onSelect }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="feature" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="clicks" fill="#1976d2" onClick={(d) => onSelect(d.feature)} />
    </BarChart>
  );
}
