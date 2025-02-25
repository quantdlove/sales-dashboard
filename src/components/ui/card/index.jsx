// src/components/ui/card/index.jsx
import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      {...props}
      className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div {...props} className={`border-b p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 {...props} className={`text-lg font-semibold leading-none ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div {...props} className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
