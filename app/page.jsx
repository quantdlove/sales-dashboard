"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Users, Mail, Calendar, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

/** 
 * A tiny client-only component to display the last-updated time
 * without causing hydration errors. It does NOT render any time
 * on the server, so there's no mismatch when the client loads.
 */
function LastUpdatedClientOnly({ date }) {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    // Runs only in the browser after hydration:
    setDateString(date.toLocaleString());
  }, [date]);

  return (
    <p className="text-sm text-gray-500">
      Last Updated: {dateString}
    </p>
  );
}

// MetricCard component
const MetricCard = ({ icon: Icon, title, value, total, subValue, subLabel }) => (
  <div className="flex-1 flex items-center space-x-3 bg-white rounded-lg p-4 shadow">
    <div className="rounded-full p-2 bg-blue-50">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold">{value}</span>
        {total && <span className="text-xs text-gray-500">({total} total)</span>}
      </div>
      {subValue && <span className="text-xs text-gray-500">{subValue}% {subLabel}</span>}
    </div>
  </div>
);

// FilterButton component
const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? "bg-blue-600 text-white" 
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

// DashboardView component
const DashboardView = ({ data }) => {
  const [filter, setFilter] = useState("all");
  
  const filteredData = filter === "all" 
    ? data
    : data.filter(d => d["ICP"] === filter.toUpperCase());

  // Calculate metrics with cumulative counts
  const totalLeads = filteredData.length;
  const emailedLeads = filteredData.filter(d => 
    d["Status of lead"] === "Emailed" || d["Status of lead"] === "Demo"
  ).length;
  const demoLeads = filteredData.filter(d => d["Status of lead"] === "Demo").length;
  const generatedLeads = filteredData.filter(d => 
    d["Status of lead"] === "Lead Generated" || 
    d["Status of lead"] === "Emailed" || 
    d["Status of lead"] === "Demo"
  ).length;
  
  const emailRate = ((emailedLeads / totalLeads) * 100).toFixed(1);
  const demoRate = ((demoLeads / (emailedLeads || 1)) * 100).toFixed(1);
  const velocity = ((demoLeads / totalLeads) * 100).toFixed(1);

  // Get the rolling 4 weeks of data
  const generateWeeklyData = () => {
    // Helper function to get week start date
    const getWeekStart = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      return d;
    };

    // Group data by week
    const weeklyGroups = filteredData.reduce((acc, item) => {
      if (!item.Date) return acc;
      
      const weekStart = getWeekStart(new Date(item.Date));
      const weekKey = weekStart.toISOString();
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          weekStart,
          items: []
        };
      }
      
      acc[weekKey].items.push(item);
      return acc;
    }, {});

    // Convert to weekly summaries
    const summaries = Object.entries(weeklyGroups)
      .map(([weekStart, { items }]) => {
        const generated = items.filter(d => d["Status of lead"] === "Lead Generated").length;
        const emailed = items.filter(d => d["Status of lead"] === "Emailed").length;
        const demos = items.filter(d => d["Status of lead"] === "Demo").length;
        
        // Calculate cumulative counts
        const totalLeads = generated + emailed + demos;
        const totalEmails = emailed + demos; // Emails includes demos
        
        return {
          week: `Week of ${new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          leads: totalLeads,
          emails: totalEmails,
          demos: demos
        };
      })
      .sort((a, b) => new Date(b.week) - new Date(a.week))
      .slice(0, 4) // Get last 4 weeks
      .reverse(); // Show oldest to newest

    return summaries;
  };

  const weeklyData = generateWeeklyData();

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex space-x-3">
        <FilterButton 
          label="Leads Generated" 
          active={filter === "all"} 
          onClick={() => setFilter("all")} 
        />
        <FilterButton 
          label="IRO" 
          active={filter === "iro"} 
          onClick={() => setFilter("iro")} 
        />
        <FilterButton 
          label="IRC" 
          active={filter === "irc"} 
          onClick={() => setFilter("irc")} 
        />
        <FilterButton 
          label="Buy Side" 
          active={filter === "bs"} 
          onClick={() => setFilter("bs")} 
        />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={Users}
          title="Leads"
          value={generatedLeads}
          total={totalLeads}
        />
        <MetricCard 
          icon={Mail}
          title="Emails"
          value={emailedLeads}
          total={emailedLeads}
          subValue={emailRate}
          subLabel="Coverage"
        />
        <MetricCard 
          icon={Calendar}
          title="Demos"
          value={demoLeads}
          total={demoLeads}
          subValue={demoRate}
          subLabel="Conversion"
        />
        <MetricCard 
          icon={TrendingUp}
          title="Velocity"
          value={`${velocity}%`}
          subLabel="Lead to Demo"
        />
      </div>

      {/* Charts and table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Pipeline Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" name="Leads" stroke="#8884d8" />
                  <Line type="monotone" dataKey="emails" name="Emails" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="demos" name="Demos" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Week</th>
                    <th className="p-2 text-right">Leads</th>
                    <th className="p-2 text-right">Emails</th>
                    <th className="p-2 text-right">Demos</th>
                    <th className="p-2 text-right">Email Rate</th>
                    <th className="p-2 text-right">Demo Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((row) => {
                    const emailRate = ((row.emails / (row.leads || 1)) * 100).toFixed(1);
                    const demoRate = ((row.demos / (row.emails || 1)) * 100).toFixed(1);
                    return (
                      <tr key={row.week} className="border-b">
                        <td className="p-2">{row.week}</td>
                        <td className="p-2 text-right">{row.leads}</td>
                        <td className="p-2 text-right">{row.emails}</td>
                        <td className="p-2 text-right">{row.demos}</td>
                        <td className="p-2 text-right">{emailRate}%</td>
                        <td className="p-2 text-right">{demoRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main ExecutiveDashboard component
const ExecutiveDashboard = () => {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from leads.json
        const response = await fetch("/leads.json");
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        const leadsData = await response.json();
        setData(leadsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error loading data:", error);
        setData([]);
      }
    };

    // Load data once on mount
    loadData();

    // Refresh data every 15 minutes
    const refreshInterval = setInterval(loadData, 15 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">SALES PIPELINE DASHBOARD</h1>
          {/* Use a stable date method for "Week of" to avoid time-based mismatch */}
          <p className="text-sm text-gray-500 mt-2">
            Week of {new Date().toDateString()}
          </p>
        </div>
        <div className="text-right">
          {/* Render last-updated time via client-only component */}
          <LastUpdatedClientOnly date={lastUpdated} />
        </div>
      </div>

      <DashboardView data={data} />
    </div>
  );
};

export default ExecutiveDashboard;
