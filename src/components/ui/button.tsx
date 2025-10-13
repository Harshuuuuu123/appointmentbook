"use client";

import React from "react";

// Define a named color variable for clarity
const BUTTON_BG_COLOR = "oklch(0.62 0.14 255)";
const BUTTON_TEXT_COLOR = "#FFFFFF"; // white text

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        backgroundColor: BUTTON_BG_COLOR,
        color: BUTTON_TEXT_COLOR,
      }}
    >
      {children}
    </button>
  );
}
