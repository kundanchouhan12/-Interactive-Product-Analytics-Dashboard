import { useEffect, useState } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { Bar, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
  const [filters, setFilters] = useState(JSON.parse(Cookies.get("filters")||"{}"));
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState({labels:[], datasets:[]});
  const [selectedFeature, setSelectedFeature] = useState("");

  const applyFilters = async () => {
    Cookies.set("filters", JSON.stringify(filters));
    const start = filters.startDate.toISOString();
    const end = filters.endDate.toISOString();
    const res = await api.get(`/features/analytics?start=${start}&end=${end}`);
    setBarData(res.data.map(([name,count])=>({featureName:name,count})));
  };

  const trackClick = async (featureName) => {
    await api.post("/features/track",{featureName,userId:localStorage.getItem("userId")});
  };

  useEffect(()=>{ applyFilters() },[]);

  useEffect(()=>{
    if(!selectedFeature) return;
    const fetchTrend = async () => {
      const start = filters.startDate.toISOString();
      const end = filters.endDate.toISOString();
      const res = await api.get(`/features/analytics/feature?feature=${selectedFeature}&start=${start}&end=${end}`);
      const labels = Object.keys(res.data);
      const data = Object.values(res.data);
      setLineData({labels, datasets:[{label:selectedFeature,data}]});
    };
    fetchTrend();
  },[selectedFeature]);

  return (
    <div>
      <h2>Dashboard</h2>
      {/* Filters */}
      <DatePicker selected={filters.startDate} onChange={date=>setFilters({...filters,startDate:date})}/>
      <DatePicker selected={filters.endDate} onChange={date=>setFilters({...filters,endDate:date})}/>
      <select onChange={e=>setFilters({...filters,age:e.target.value})}>
        <option value="<18">&lt;18</option>
        <option value="18-40">18-40</option>
        <option value=">40">&gt;40</option>
      </select>
      <select onChange={e=>setFilters({...filters,gender:e.target.value})}>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <button onClick={()=>{applyFilters(); trackClick("filter_apply")}}>Apply</button>

      {/* Charts */}
      <Bar data={{labels: barData.map(d=>d.featureName), datasets:[{label:"Clicks", data:barData.map(d=>d.count)}]}}
           onClick={(e,elem)=>{if(elem.length>0){const idx=elem[0].index; setSelectedFeature(barData[idx].featureName); trackClick(barData[idx].featureName);}}} />
      {selectedFeature && <Line data={lineData} />}
    </div>
  );
}
