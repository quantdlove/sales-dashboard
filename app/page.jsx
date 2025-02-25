"use client";

import React, { useState, useEffect } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch("/api/get-leads");
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setRows([]);
      }
    }
    loadLeads();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales Pipeline Dashboard</h1>
      <p>We have {rows.length} leads in Supabase!</p>

      <table className="min-w-full border mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">id</th>
            <th className="p-2 border">date</th>
            <th className="p-2 border">status_of_lead</th>
            <th className="p-2 border">icp</th>
            <th className="p-2 border">company</th>
            <th className="p-2 border">leads</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="p-2 border">{row.id}</td>
              <td className="p-2 border">{row.date}</td>
              <td className="p-2 border">{row.status_of_lead}</td>
              <td className="p-2 border">{row.icp}</td>
              <td className="p-2 border">{row.company}</td>
              <td className="p-2 border">{row.leads}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
