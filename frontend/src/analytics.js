import React, { useEffect, useState } from "react";
import "./analytics.css";

import {PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Analytics = ({ tasks = [], todaytasks = [] }) => {

  const [weekdays, setWeekdays] = useState([]);

  // WEEKLY PRODUCTIVITY
  const getWeeklyProductivity = (tasks) => {

    const week = [
      { day: "Sun", total: 0, completed: 0 },
      { day: "Mon", total: 0, completed: 0 },
      { day: "Tue", total: 0, completed: 0 },
      { day: "Wed", total: 0, completed: 0 },
      { day: "Thu", total: 0, completed: 0 },
      { day: "Fri", total: 0, completed: 0 },
      { day: "Sat", total: 0, completed: 0 },
    ];

    tasks.forEach((t) => {

      if (!t.time) return;

      const date = new Date(t.time);

      const dayIndex = date.getDay();

      week[dayIndex].total += 1;

      if (t.completed) {
        week[dayIndex].completed += 1;
      }
    });

    const productivityData = week.map((d) => ({
      day: d.day,
      productivity:
        d.total === 0
          ? 0
          : ((d.completed / d.total) * 100).toFixed(1)
    }));

    setWeekdays(productivityData);
  };

  // AUTO UPDATE CHART
  useEffect(() => {

    if (tasks.length > 0) {
      getWeeklyProductivity(tasks);
    }

  }, [tasks]);

  // BASIC STATS
  const completed = tasks.filter((t) => t.completed).length;

  const pending = tasks.length - completed;

  const todayCompleted =
    todaytasks.filter((t) => t.completed).length;

  const todayTotal = todaytasks.length;

  const todayRate =
    todayTotal === 0
      ? 0
      : ((todayCompleted / todayTotal) * 100).toFixed(1);

  // PIE DATA
  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending }
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  const categoryData = Object.entries(

tasks.reduce((acc, task) => {

const cat = task.category || "Other";

acc[cat] = (acc[cat] || 0) + 1;

return acc;

}, {})

).map(([name,value]) => ({
name,
value
}));

const topCategory =
categoryData.sort(
(a,b)=>b.value-a.value
)[0]

  return (

    <div className="analytics-container">

      {/* HEADER */}
      <div className="header-box">
        <h2>📊 Productivity Dashboard</h2>
        <p>Track your habits, productivity & performance</p>
      </div>

      {/* CARDS */}
      <div className="card-row">

        <div className="card">
          <h4>Total Tasks</h4>
          <h1>{tasks.length}</h1>
        </div>

        <div className="card">
          <h4>Completed</h4>
          <h1>{completed}</h1>
        </div>

        <div className="card">
          <h4>Pending</h4>
          <h1>{pending}</h1>
        </div>

        <div className="card highlight">
          <h4>Today Productivity</h4>
          <h1>{todayRate}%</h1>
        </div>

      </div>

      {/* CHARTS */}
      <div className="chart-grid">

        {/* PIE CHART */}
        <div className="chart-box">

          <h3>Task Distribution</h3>

          <ResponsiveContainer width="100%" height={250}>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >

                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}

              </Pie>

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* TODAY BAR */}
        <div className="chart-box">

          <h3>Today Performance</h3>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart
              data={[
                {
                  name: "Today",
                  completed: todayCompleted,
                  pending: todayTotal - todayCompleted
                }
              ]}
            >

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="completed"
                fill="#22c55e"
              />

              <Bar
                dataKey="pending"
                fill="#ef4444"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* WEEKLY PRODUCTIVITY */}
      <div className="chart-box weekly-chart">

        <h3>Weekly Productivity</h3>

        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={weekdays}>

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="productivity"
              fill="#6366F1"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

<div className="chart-box">

<h3>Category Report</h3>

<ResponsiveContainer
width="100%"
height={250}
>

<PieChart>

<Pie
data={categoryData}
dataKey="value"
cx="50%"
cy="50%"
outerRadius={80}
label
>

{categoryData.map(
(_,index)=>(

<Cell
key={index}
fill={
[
"#6366F1",
"#22C55E",
"#F59E0B",
"#EF4444",
"#06B6D4"
][index%5]
}
/>

)
)}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>


<div className="card">

<h4>Top Category</h4>

<h1>
{topCategory?.name || "-"}
</h1>

</div>
    </div>
  );
};

export default Analytics;