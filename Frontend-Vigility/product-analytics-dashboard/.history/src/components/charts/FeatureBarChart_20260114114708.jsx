import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { trackEvent } from "../../api/track";

export default function FeatureBarChart({ data, onSelect }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="feature" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="clicks"
        fill="#1976d2"
        onClick={(item) => {
          onSelect(item.feature);
          trackEvent("bar_chart_click");
        }}
      />
    </BarChart>
  );
}
