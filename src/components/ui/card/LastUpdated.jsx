"use client"; 
import { useState, useEffect } from "react";

export default function LastUpdated() {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    // Runs only in the browser, after hydration.
    // So we never mismatch the server's HTML.
    setDateString(new Date().toLocaleString());
  }, []);

  return (
    <p className="text-sm text-gray-500">
      Last Updated: {dateString}
    </p>
  );
}
