import React, { useEffect } from "react";
import Cookies from "js-cookie";

export default function Filters({ filters, setFilters }) {
  useEffect(() => {
    const saved = Cookies.get("filters");
    if (saved) setFilters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    Cookies.set("filters", JSON.stringify(filters));
  }, [filters]);

  return (
    <div>
      <label>Date Start: <input type="date" value={filters.start || ""} onChange={e => setFilters({...filters, start: e.target.value})} /></label>
      <label>Date End: <input type="date" value={filters.end || ""} onChange={e => setFilters({...filters, end: e.target.value})} /></label>
      <label>Age:
        <select value={filters.age || ""} onChange={e => setFilters({...filters, age: e.target.value})}>
          <option value="">All</option>
          <option value="<18">&lt;18</option>
          <option value="18-40">18-40</option>
          <option value=">40">&gt;40</option>
        </select>
      </label>
      <label>Gender:
        <select value={filters.gender || ""} onChange={e => setFilters({...filters, gender: e.target.value})}>
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>
    </div>
  );
}
