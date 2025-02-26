"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../src/components/ui/card"; 
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

// Reusable metric card
const MetricCard = ({ icon: Icon, title, value, total, subValue, subLabel }) => (
  <div className="flex-1 flex items-center space-x-3 bg-white rounded-lg p-4 shadow">
    <div className="rounded-full p-2 bg-blue-50">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold">{value}</span>
        {total !== undefined && (
          <span className="text-xs text-gray-500">({total} total)</span>
        )}
      </div>
      {subValue && (
        <span className="text-xs text-gray-500">
          {subValue}% {subLabel}
        </span>
      )}
    </div>
  </div>
);

// Simple filter button
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

// ----- DASHBOARD VIEW -----
function DashboardView({ data }) {
  const [filter, setFilter] = useState("all");

  // Filter data by ICP if not "all"
  const filteredData =
    filter === "all"
      ? data
      : data.filter((d) => d.icp && d.icp.toUpperCase() === filter.toUpperCase());

  // Basic metrics
  const totalLeads = filteredData.length;
  
  // "Emailed" + "Demo" => emailedLeads
  const emailedLeads = filteredData.filter(
    (d) => d.status_of_lead === "Emailed" || d.status_of_lead === "Demo"
  ).length;

  // Just "Demo" => demoLeads
  const demoLeads = filteredData.filter(
    (d) => d.status_of_lead === "Demo"
  ).length;

  // "Lead Generated", "Opened", "Emailed", "Demo" => leadsGenerated
  const leadsGenerated = filteredData.filter(
    (d) =>
      d.status_of_lead === "Lead Generated" ||
      d.status_of_lead === "Opened" ||
      d.status_of_lead === "Emailed" ||
      d.status_of_lead === "Demo"
  ).length;

  // Coverage, conversion, velocity
  const emailRate = totalLeads > 0 ? ((emailedLeads / totalLeads) * 100).toFixed(1) : 0;
  const demoRate  = emailedLeads > 0 ? ((demoLeads / emailedLeads) * 100).toFixed(1) : 0;
  const velocity  = totalLeads > 0 ? ((demoLeads / totalLeads) * 100).toFixed(1) : 0;

  // Monday-based start-of-week
  const getWeekStart = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Sunday=0, Monday=1 => shift so Monday=0 => (day+6)%7
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  };

  // ----- ENHANCED parseDate -----
  // Tries multiple formats:
  // 1) Direct new Date() parse
  // 2) "YYYY-MM-DD HH:MM:SS" => "YYYY-MM-DDTHH:MM:SSZ"
  // 3) "YYYY-MM-DD" => "YYYY-MM-DDT00:00:00Z"
  // 4) "M/D/YY" fallback
  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Try direct parse first (handles ISO like "2025-02-26T00:00:00Z")
    let dt = new Date(dateString);
    if (!isNaN(dt.getTime())) {
      return dt;
    }

    // If there's a dash, assume "YYYY-MM-DD" format
    if (dateString.includes("-")) {
      // If there's a space, replace with "T" => "2025-02-26T00:00:00"
      if (dateString.includes(" ")) {
        dateString = dateString.replace(" ", "T");
      } else {
        // If there's no time part, add "T00:00:00"
        if (!dateString.includes("T")) {
          dateString += "T00:00:00";
        }
      }
      // If no trailing "Z", add it => UTC
      if (!dateString.endsWith("Z")) {
        dateString += "Z";
      }
      dt = new Date(dateString);
      if (!isNaN(dt.getTime())) {
        return dt;
      }
    }

    // Fallback: maybe "M/D/YY"
    const parts = dateString.split("/");
    if (parts.length === 3) {
      let [month, day, year] = parts.map((x) => parseInt(x, 10));
      if (year < 100) {
        year += 2000;
      }
      dt = new Date(year, month - 1, day);
      if (!isNaN(dt.getTime())) {
        return dt;
      }
    }

    // If all else fails
    return null;
  };

  // ----- GROUP LEADS BY WEEK -----
  const generateWeeklyData = () => {
    const weeklyGroups = {};

    filteredData.forEach((lead) => {
      if (!lead.date) return;
      const dateObj = parseDate(lead.date);
      if (!dateObj || isNaN(dateObj.getTime())) return; // skip invalid

      const weekStart = getWeekStart(dateObj);
      const weekKey = weekStart.toISOString().split("T")[0]; // "YYYY-MM-DD"

      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = {
          dateObj: weekStart,
          leads: 0,
          emailed: 0,
          demos: 0,
        };
      }

      weeklyGroups[weekKey].leads++;
      if (lead.status_of_lead === "Emailed") {
        weeklyGroups[weekKey].emailed++;
      }
      if (lead.status_of_lead === "Demo") {
        weeklyGroups[weekKey].demos++;
      }
    });

    // Convert to array
    let summaries = Object.entries(weeklyGroups).map(([weekKey, group]) => {
      const totalLeads = group.leads;
      const totalEmails = group.emailed + group.demos;

      return {
        week: `Week of ${group.dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
        sortKey: weekKey,
        leads: totalLeads,
        emails: totalEmails,
        demos: group.demos,
        emailRate: totalLeads
          ? ((totalEmails / totalLeads) * 100).toFixed(1)
          : "0.0",
        demoRate: totalEmails
          ? ((group.demos / totalEmails) * 100).toFixed(1)
          : "0.0",
      };
    });

    // Sort ascending
    summaries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // Keep last 4 weeks
    if (summaries.length > 4) {
      summaries = summaries.slice(-4);
    }
    return summaries;
  };

  const weeklyData = generateWeeklyData();

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex space-x-3">
        <FilterButton
          label="All Leads"
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
          title="Leads Generated"
          value={leadsGenerated}
          total={totalLeads}
        />
        <MetricCard
          icon={Mail}
          title="Accounts Emailed"
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

      {/* Chart & Table */}
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
                  <Line
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="emails"
                    name="Emails"
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey="demos"
                    name="Demos"
                    stroke="#ffc658"
                  />
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
                  {weeklyData.map((row) => (
                    <tr key={row.week} className="border-b">
                      <td className="p-2">{row.week}</td>
                      <td className="p-2 text-right">{row.leads}</td>
                      <td className="p-2 text-right">{row.emails}</td>
                      <td className="p-2 text-right">{row.demos}</td>
                      <td className="p-2 text-right">{row.emailRate}%</td>
                      <td className="p-2 text-right">{row.demoRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ----- MAIN PAGE -----
export default function ExecutiveDashboard() {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentWeek, setCurrentWeek] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/get-leads");
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.status}`);
      }
      const leadsData = await res.json();
      console.log("Fetched leads:", leadsData.length);

      // Map Supabase columns -> fields used in the dashboard
      // (Status_of_lead -> status_of_lead, Date -> date, etc.)
      const validated = leadsData.map((lead) => ({
        ...lead,
        id: lead.id || `temp-${Math.random()}`,
        status_of_lead: lead.Status_of_lead || "Unknown",
        date: lead.Date || null,
        icp: lead.ICP || "",
        lead_name: lead.Lead_Name || "",
        company: lead.Company || "",
      }));

      setData(validated);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(`Failed to load data: ${err.message}`);
      setData([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Avoid hydration mismatch for date
    const now = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setCurrentWeek(now);
  }, []);

  // Load data on mount, refresh every 15 minutes
  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const lastUpdatedString = lastUpdated
    ? lastUpdated.toLocaleString()
    : "Loading...";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">SALES PIPELINE DASHBOARD</h1>
          <p className="text-sm text-gray-500 mt-2">
            Week of {currentWeek || "Loading..."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last Updated: {lastUpdatedString}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 mt-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Force Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && data.length === 0 ? (
        <div className="text-center py-10">Loading dashboard data...</div>
      ) : (
        <DashboardView data={data} />
      )}
    </div>
  );
}
