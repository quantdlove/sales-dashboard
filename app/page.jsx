"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../src/components/ui/card"; 
// ^ If your "Card" components live at ../src/components/ui/card/index.jsx, keep this path

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

// A reusable Metric Card
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

// Filter button
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

// The child dashboard component with metrics, chart, and table
function DashboardView({ data }) {
  const [filter, setFilter] = useState("all");

  // Filter data by ICP if not "all"
  const filteredData =
    filter === "all"
      ? data
      : data.filter(
          (d) => d.icp && d.icp.toUpperCase() === filter.toUpperCase()
        );

  // Calculate metrics
  const totalLeads = filteredData.length;
  const emailedLeads = filteredData.filter(
    (d) => d.status_of_lead === "Emailed" || d.status_of_lead === "Demo"
  ).length;
  const demoLeads = filteredData.filter((d) => d.status_of_lead === "Demo").length;

  // Some define "Leads Generated" strictly as "Lead Generated" status,
  // but you might prefer counting everything in the pipeline:
  const leadsGenerated = filteredData.filter(
    (d) =>
      d.status_of_lead === "Lead Generated" ||
      d.status_of_lead === "Emailed" ||
      d.status_of_lead === "Demo"
  ).length;

  // Coverage, conversion, velocity
  const emailRate =
    totalLeads > 0 ? ((emailedLeads / totalLeads) * 100).toFixed(1) : 0;
  const demoRate =
    emailedLeads > 0 ? ((demoLeads / emailedLeads) * 100).toFixed(1) : 0;
  const velocity =
    totalLeads > 0 ? ((demoLeads / totalLeads) * 100).toFixed(1) : 0;

  // Build weekly data for the line chart & table
  const generateWeeklyData = () => {
    // *** MONDAY-based start-of-week ***
    const getWeekStart = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      // d.getDay(): 0=Sunday, 1=Monday, etc.
      // Make Monday = day 0 => (d.getDay() + 6) % 7
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);

      return d;
    };

    const weeklyGroups = filteredData.reduce((acc, item) => {
      if (!item.date) return acc;
      const dateObj = new Date(item.date);
      if (isNaN(dateObj)) return acc; // skip invalid
      const weekStart = getWeekStart(dateObj).toISOString();
      if (!acc[weekStart]) acc[weekStart] = [];
      acc[weekStart].push(item);
      return acc;
    }, {});

    let summaries = Object.entries(weeklyGroups).map(([weekStartISO, items]) => {
      const generated = items.filter((d) => d.status_of_lead === "Lead Generated").length;
      const emailed = items.filter((d) => d.status_of_lead === "Emailed").length;
      const demos = items.filter((d) => d.status_of_lead === "Demo").length;

      const totalLeadsThisWeek = generated + emailed + demos;
      // "Emails" might be emailed + demos if you treat "demo" as "already emailed"
      const totalEmails = emailed + demos;

      return {
        week: `Week of ${new Date(weekStartISO).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
        leads: totalLeadsThisWeek,
        emails: totalEmails,
        demos,
      };
    });

    // Sort ascending by date
    summaries.sort((a, b) => new Date(a.week) - new Date(b.week));
    // Keep last 4
    summaries = summaries.slice(-4);
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

      {/* Chart + Table (two columns) */}
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
                    const emailRate = (
                      (row.emails / (row.leads || 1)) *
                      100
                    ).toFixed(1);
                    const demoRate = (
                      (row.demos / (row.emails || 1)) *
                      100
                    ).toFixed(1);
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
}

// The main page that fetches data from /api/get-leads
export default function ExecutiveDashboard() {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentWeek, setCurrentWeek] = useState("");

  // Avoid hydration mismatch by setting date in useEffect
  useEffect(() => {
    const now = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setCurrentWeek(now);
  }, []);

  // Fetch from your Supabase route
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/get-leads");
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

    loadData();
    // Refresh every 15 minutes
    const intervalId = setInterval(loadData, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Show "Loading..." if we haven't set lastUpdated yet
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
          <p className="text-sm text-gray-500">
            Last Updated: {lastUpdatedString}
          </p>
        </div>
      </div>

      <DashboardView data={data} />
    </div>
  );
}
