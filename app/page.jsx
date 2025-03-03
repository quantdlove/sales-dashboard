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
  const [filteredData, setFilteredData] = useState([]);
  
  // Use effect to filter data when filter or data changes
  useEffect(() => {
    const filtered = filter === "all"
      ? data
      : data.filter((d) => d.icp && d.icp.toUpperCase() === filter.toUpperCase());
    
    setFilteredData(filtered);
    
    // Count valid/invalid dates for debugging
    let validDateCount = 0;
    let invalidDateCount = 0;
    
    filtered.forEach(lead => {
      if (!lead.date) {
        invalidDateCount++;
        return;
      }
      
      const dateObj = parseDate(lead.date);
      if (!dateObj || isNaN(dateObj.getTime())) {
        invalidDateCount++;
        return;
      }
      
      validDateCount++;
    });
    
    console.log(`Filtered data: ${filtered.length} records, Valid dates: ${validDateCount}, Invalid: ${invalidDateCount}`);
  }, [filter, data]);
  
  // Basic metrics - cumulative totals since tracking began
  const totalLeads = filteredData.length;
  
  // Count in each status - for display at the top of the dashboard
  // For the first stage, include any lead that doesn't have a status or has a default status
  const leadsInLeadsStatus = filteredData.filter(
    (d) => !d.status_of_lead || d.status_of_lead === "Leads" || d.status_of_lead === "Lead Generated"
  ).length;
  
  const leadsInEmailedStatus = filteredData.filter(
    (d) => d.status_of_lead === "Emailed"
  ).length;
  
  // Check for status containing "Open" or "opened"
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

  // Parse date formats from Google Sheets/Supabase
  const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    
    try {
      // Handle M/D/YYYY format from Google Sheets (e.g., "2/5/2025")
      if (dateString.includes("/")) {
        const parts = dateString.split("/");
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1; // 0-based month
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
      
      // Handle PostgreSQL timestamp format (YYYY-MM-DD 00:00:00+00)
      if (dateString.includes("-") && (dateString.includes("+00") || dateString.includes("T"))) {
        const datePart = dateString.substring(0, 10);
        const date = new Date(datePart);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Try parsing directly as ISO date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.error("Date parsing error:", e);
    }

    // If direct parsing fails, try a more explicit approach
    try {
      // Match format YYYY-MM-DD
      const dateRegex = /^(\d{4})-(\d{2})-(\d{2})/;
      const match = dateString.match(dateRegex);
      
      if (match) {
        const [_, year, month, day] = match;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    } catch (e) {
      console.error("Regex date parsing error:", e);
    }

    // If all parsing attempts fail
    console.warn("Failed to parse date:", dateString);
    return null;
  };

  // Get the rolling 4 weeks of data
  const generateWeeklyData = () => {
    try {
      // Group leads by week
      const weeklyGroups = {};
      
      // First, we need to determine which 4 weeks to show
      const allWeekStarts = new Set();
      
      // Process all leads with dates
      filteredData.forEach(lead => {
        if (!lead.date) {
          return;
        }
        
        const dateObj = parseDate(lead.date);
        if (!dateObj || isNaN(dateObj.getTime())) {
          return;
        }
        
        const weekStart = getWeekStart(dateObj);
        const weekKey = weekStart.toISOString().split("T")[0];
        allWeekStarts.add(weekKey);
      });
      
      // If we have no valid dates, return an empty array
      if (allWeekStarts.size === 0) {
        console.log('No valid dates found in leads data');
        return [];
      }
      
      // Sort all week starts and keep all weeks for display
      const sortedWeeks = Array.from(allWeekStarts).sort();
      
      // Initialize the weekly data structures
      sortedWeeks.forEach(weekKey => {
        weeklyGroups[weekKey] = {
          dateObj: new Date(weekKey),
          leads: 0,
          emails: 0,
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
        // Increment the appropriate counter based on lead status
        if (!lead.status_of_lead || lead.status_of_lead === "Leads" || lead.status_of_lead === "Lead Generated") {
          weeklyGroups[weekKey].leads++;
        } 
        
        if (lead.status_of_lead === "Emailed") {
          weeklyGroups[weekKey].emails++;
        } 
        
        if (lead.status_of_lead === "Opened" || 
           (lead.status_of_lead && 
           (lead.status_of_lead.includes("Open") || 
           lead.status_of_lead.includes("open")))) {
          weeklyGroups[weekKey].opened++;
        } 
        
        if (lead.status_of_lead === "Demo") {
          weeklyGroups[weekKey].demo++;
        }
      });

      // Format for display
      return Object.entries(weeklyGroups).map(([weekKey, data]) => {
        const totalLeadsInWeek = data.leads + data.emails + data.opened + data.demo;
        const totalEmailed = data.emails + data.opened + data.demo;
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
      
    } catch (error) {
      console.error('Error generating weekly data:', error);
      return [];
    }
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
          active={filter === "IRO"}
          onClick={() => setFilter("IRO")}
        />
        <FilterButton
          label="IRC"
          active={filter === "IRC"}
          onClick={() => setFilter("IRC")}
        />
        <FilterButton
          label="BS"
          active={filter === "BS"}
          onClick={() => setFilter("BS")}
        />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          title="Total Leads"
          value={totalLeads}
          total={totalLeads}
        />
        <MetricCard
          icon={Mail}
          title="Emailed"
          value={leadsInEmailedStatus}
          total={totalLeads}
          subValue={emailRate}
          subLabel="of Total"
        />
        <MetricCard
          icon={Calendar}
          title="Opened"
          value={leadsInOpenedStatus}
          total={leadsInEmailedStatus}
          subValue={openedRate}
          subLabel="of Emailed"
        />
        <MetricCard
          icon={TrendingUp}
          title="Demo"
          value={leadsInDemoStatus}
          total={leadsInOpenedStatus}
          subValue={demoRate}
          subLabel="of Opened"
        />
      </div>

      {/* Debug info - implemented through console.log only */}
      <div className="text-xs text-gray-500 mb-2">
        {filter !== "all" ? `Filtered by: ${filter}` : "Showing all leads"}
      </div>

      {/* Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Pipeline Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {weeklyData && weeklyData.length > 0 ? (
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
              {weeklyData && weeklyData.length > 0 ? (
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
      // Handle field names with correct casing and format from Google Sheets/Supabase
      const validated = [];
      
      leadsData.forEach((lead) => {
        // Format the data to make debugging easier
        const formatted = {
          id: lead.id || lead.ID || `temp-${Math.random()}`,
          status_of_lead: lead.Status_of_lead || lead.status_of_lead || "",
          date: lead.Date || lead.date || null,
          icp: lead.ICP || lead.icp || "",
          lead_name: lead.Lead_Name || lead.lead_name || "",
          company: lead.Company || lead.company || ""
        };
        
        // Log first few records to help debug
        if (validated.length < 3) {
          console.log("Sample lead data:", JSON.stringify(formatted, null, 2));
        }
        
        validated.push(formatted);
      });

      // Add debug logs for date values
      console.log("Sample date values:", validated.slice(0, 5).map(lead => lead.date));

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