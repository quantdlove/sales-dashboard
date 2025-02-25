"use client";

import React, { useState, useEffect } from "react";

export default function Page() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch("/api/get-leads");
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    }
    loadLeads();
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Sales Dashboard</h1>
      <p>We have {leads.length} leads in Supabase!</p>

      {/* Example table */}
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="border p-2">{lead.id}</td>
              <td className="border p-2">{lead.name}</td>
              <td className="border p-2">{lead.status_of_lead}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
