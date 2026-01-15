import DateFilter from "./DateFilter";
import dayjs from "dayjs";

const [dateRange, setDateRange] = useState([
  dayjs().startOf("day"),
  dayjs().endOf("day")
]);

useEffect(() => {
  fetchAnalytics();
  track("date_picker");
}, [dateRange]);

const fetchAnalytics = async () => {
  await api.get("/api/analytics", {
    params: {
      startDate: dateRange[0].toISOString(),
      endDate: dateRange[1].toISOString()
    }
  });
};
