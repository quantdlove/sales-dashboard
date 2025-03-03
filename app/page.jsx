"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
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
  
  // Basic metrics - cumulative totals since tracking began
  const totalLeads = filteredData.length;
  
  // Count in each status - for display at the top of the dashboard
  const leadsInGeneratedStatus = filteredData.filter(
    (d) => d.status_of_lead === "Lead Generated"
  ).length;
  
  const leadsInEmailedStatus = filteredData.filter(
    (d) => d.status_of_lead === "Emailed"
  ).length;
  
  // Check for any status containing "Open" or "opened"
  const leadsInOpenedStatus = filteredData.filter(
    (d) => {
      const status = d.status_of_lead || "";
      return status === "Opened" || status.includes("Open") || status.includes("open");
    }
  ).length;
  
  const leadsInDemoStatus = filteredData.filter(
    (d) => d.status_of_lead === "Demo"
  ).length;

  // For display in the top metrics cards - total leads in each section of the pipeline
  const emailedLeads = leadsInEmailedStatus + leadsInOpenedStatus + leadsInDemoStatus;
  const openedLeads = leadsInOpenedStatus + leadsInDemoStatus;
  const demoLeads = leadsInDemoStatus;
  
  // Calculate percentages
  const emailRate = totalLeads > 0 ? ((emailedLeads / totalLeads) * 100).toFixed(1) : 0;
  const openedRate = emailedLeads > 0 ? ((openedLeads / emailedLeads) * 100).toFixed(1) : 0;
  const demoRate = openedLeads > 0 ? ((demoLeads / openedLeads) * 100).toFixed(1) : 0;

  // ----- ENHANCED DATE HANDLING -----
  // Correctly gets the Monday starting a week containing the given date
  const getWeekStart = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return new Date(); // Return current date as fallback
    }
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Parse date strings in various formats with improved safety
  const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    
    // Sanitize input - remove any potentially harmful characters
    const sanitized = dateString.trim().replace(/[^\w\s\-\/\:\.]/gi, '');
    if (!sanitized) return null;

    // Try ISO format first
    try {
      // Try direct ISO parse
      const isoDate = new Date(sanitized);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
      
      // Try with ISO formatting
      if (sanitized.includes("-")) {
        let isoString = sanitized;
        
        // If there's a space, replace with "T"
        if (isoString.includes(" ")) {
          isoString = isoString.replace(" ", "T");
        } else if (!isoString.includes("T")) {
          // If there's no time part, add "T00:00:00"
          isoString += "T00:00:00";
        }
        
        const parsedDate = new Date(isoString);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    } catch (e) {
      console.error("ISO date parsing error:", e);
    }

    // Try MM/DD/YYYY format
    try {
      const parts = sanitized.split("/");
      if (parts.length === 3) {
        let [month, day, year] = parts.map(x => parseInt(x.trim(), 10));
        
        // Validate parts
        if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        // Validate ranges (basic validation)
        if (month < 1 || month > 12 || day < 1 || day > 31) return null;
        
        const mmddDate = new Date(year, month - 1, day);
        if (!isNaN(mmddDate.getTime())) {
          return mmddDate;
        }
      }
    } catch (e) {
      console.error("MM/DD/YYYY parsing error:", e);
    }

    // If all parsing attempts fail
    console.warn("Failed to parse date:", dateString);
    return null;
  };

  // Get the rolling 4 weeks of data
  const generateWeeklyData = () => {
    // Group leads by week
    const weeklyGroups = {};
    
    // First, we need to determine which 4 weeks to show
    const allWeekStarts = new Set();
    
    filteredData.forEach(lead => {
      if (!lead.date) return;
      const dateObj = parseDate(lead.date);
      if (!dateObj || isNaN(dateObj.getTime())) return;
      
      const weekStart = getWeekStart(dateObj);
      const weekKey = weekStart.toISOString().split("T")[0];
      allWeekStarts.add(weekKey);
    });
    
    // Sort all week starts and keep the most recent 4
    const sortedWeeks = Array.from(allWeekStarts).sort();
    const recentWeeks = sortedWeeks.slice(-4);
    
    // Initialize the weekly data structures
    recentWeeks.forEach(weekKey => {
      weeklyGroups[weekKey] = {
        dateObj: new Date(weekKey),
        leadGenerated: 0,
        emailed: 0,
        opened: 0,
        demo: 0
      };
    });
    
    // Now process each lead
    filteredData.forEach(lead => {
      if (!lead.date) return;
      const dateObj = parseDate(lead.date);
      if (!dateObj || isNaN(dateObj.getTime())) return;
      
      const weekStart = getWeekStart(dateObj);
      const weekKey = weekStart.toISOString().split("T")[0];
      
      // Only process leads in our selected weeks
      if (!weeklyGroups[weekKey]) return;
      
      // Count leads by status for each week
      if (lead.status_of_lead === "Lead Generated") {
        weeklyGroups[weekKey].leadGenerated++;
      } else if (lead.status_of_lead === "Emailed") {
        weeklyGroups[weekKey].emailed++;
      } else if (lead.status_of_lead === "Opened" || lead.status_of_lead.includes("Open") || lead.status_of_lead.includes("open")) {
        weeklyGroups[weekKey].opened++; // Updated to handle any status containing "open"
      } else if (lead.status_of_lead === "Demo") {
        weeklyGroups[weekKey].demo++;
      }
    });

    // Format for display
    return Object.entries(weeklyGroups).map(([weekKey, data]) => {
      const totalLeadsInWeek = data.leadGenerated + data.emailed + data.opened + data.demo;
      const totalEmailed = data.emailed + data.opened + data.demo;
      return {
        week: `Week of ${data.dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })}`,
        sortKey: weekKey,
        leads: totalLeadsInWeek,
        emails: totalEmailed,
        opened: data.opened + data.demo,
        demo: data.demo,
        emailRate: totalLeadsInWeek > 0 ? ((totalEmailed / totalLeadsInWeek) * 100).toFixed(1) : "0.0",
        demoRate: totalEmailed > 0 ? ((data.demo / totalEmailed) * 100).toFixed(1) : "0.0"
      };
    }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
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
          value={totalLeads}
          total={totalLeads}
        />
        <MetricCard
          icon={Mail}
          title="Accounts Emailed"
          value={emailedLeads}
          total={totalLeads}
          subValue={emailRate}
          subLabel="Coverage"
        />
        <MetricCard
          icon={Calendar}
          title="Opened"
          value={openedLeads}
          total={emailedLeads}
          subValue={openedRate}
          subLabel="Response"
        />
        <MetricCard
          icon={TrendingUp}
          title="Demo"
          value={demoLeads}
          total={openedLeads}
          subValue={demoRate}
          subLabel="Conversion"
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
              {weeklyData.length > 0 ? (
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
                      stroke="#ffc658"
                    />
                    <Line
                      type="monotone"
                      dataKey="opened"
                      name="Opened"
                      stroke="#82ca9d"
                    />
                    <Line
                      type="monotone"
                      dataKey="demo"
                      name="Demo"
                      stroke="#ff8042"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available for the selected filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {weeklyData.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Week</th>
                      <th className="p-2 text-right">Leads</th>
                      <th className="p-2 text-right">Emails</th>
                      <th className="p-2 text-right">Opened</th>
                      <th className="p-2 text-right">Demo</th>
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
                        <td className="p-2 text-right">{row.opened}</td>
                        <td className="p-2 text-right">{row.demo}</td>
                        <td className="p-2 text-right">{row.emailRate}%</td>
                        <td className="p-2 text-right">{row.demoRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No data available for the selected filter</p>
                </div>
              )}
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
      // Handle both upper and lower case field names from API
      const validated = leadsData.map((lead) => ({
        id: lead.id || `temp-${Math.random()}`,
        status_of_lead: lead.Status_of_lead || lead.status_of_lead || "Unknown",
        date: lead.Date || lead.date || null,
        icp: lead.ICP || lead.icp || "",
        lead_name: lead.Lead_Name || lead.lead_name || "",
        company: lead.Company || lead.company || ""
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
    
    // Create interval for refreshing data
    const intervalId = setInterval(loadData, 15 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
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