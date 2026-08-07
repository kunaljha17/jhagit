import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import axiosClient from "../../api/axiosClient";

const getPanelColors = (maxCount) => {
  const colors = { 0: "#161b22" };
  const upperLimit = Math.max(maxCount, 25);
  for (let i = 1; i <= upperLimit; i++) {
    if (i <= 2) {
      colors[i] = "#0e4429";
    } else if (i <= 5) {
      colors[i] = "#006d32";
    } else if (i <= 9) {
      colors[i] = "#26a641";
    } else {
      colors[i] = "#39d353";
    }
  }
  return colors;
};

const HeatMapProfile = ({ userId }) => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors] = useState(getPanelColors(10));
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  });

  useEffect(() => {
    const fetchActivity = async () => {
      const targetUserId = userId || localStorage.getItem("userId");
      if (!targetUserId) return;

      try {
        const res = await axiosClient.get(`/user/activity/${targetUserId}`);
        const data = res.data || [];
        setActivityData(data);

        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        setStartDate(oneYearAgo);

        const maxCount = Math.max(...data.map((d) => d.count), 1);
        setPanelColors(getPanelColors(maxCount));
      } catch (err) {
        console.error("Error fetching activity data:", err);
      }
    };

    fetchActivity();
  }, [userId]);

  const totalContributions = activityData.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>
          Contribution Activity (Last 12 Months)
        </h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          {totalContributions} total {totalContributions === 1 ? "contribution" : "contributions"}
        </span>
      </div>
      <HeatMap
        className="HeatMapProfile"
        style={{ maxWidth: "760px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        startDate={startDate}
        rectSize={14}
        space={3}
        rectProps={{
          rx: 2.5,
        }}
        panelColors={panelColors}
      />
    </div>
  );
};

export default HeatMapProfile;