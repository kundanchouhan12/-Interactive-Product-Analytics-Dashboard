import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { trackEvent } from "../../api/track";
import { useEffect } from "react";

export default function FeatureLineChart({ feature, data }) {

  useEffect(() => {
    if (feature) {
      trackEvent("line_chart_view");
    }
  }, [feature]);

  return (
    <>
      <h3>{feature} Trend</h3>

      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          dataKey="clicks"
          stroke="#2e7d32"
          onClick={() => trackEvent("line_chart_click")}
        />
      </LineChart>
    </>
  );
}
