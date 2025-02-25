"use client";

import React, { useState, useEffect } from "react";

export default function Page() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/get-leads");
        if (!res.ok) {
          console.error("Response not OK:", res.status, res.statusText);
          return;
        }
        const data = await res.json();
        console.log("Got from /api/get-leads:", data);

        if (Array.isArray(data)) {
          setLeads(data);
        } else {
          console.error("Data from /api/get-leads is not an array:", data);
          setLeads([]);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    }
    loadLeads();
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Sales Pipeline Dashboard</h1>
      <p>We have {leads.length} leads in Supabase!</p>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">ICP</th>
            <th className="border p-2 text-left">Company</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.id}</td>
              <td className="border p-2">{item.date}</td>
              <td className="border p-2">{item.status_of_lead}</td>
              <td className="border p-2">{item.icp}</td>
              <td className="border p-2">{item.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
