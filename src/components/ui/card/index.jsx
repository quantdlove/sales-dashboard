import React from "react";

export function Card({ children, className }) {
  return (
    <div className={`border rounded shadow p-4 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-2 font-bold">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg">{children}</h3>;
}
