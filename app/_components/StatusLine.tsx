"use client";

type StatusKind = "error" | "success" | "info";

interface StatusLineProps {
  kind?: StatusKind;
  message?: string | null;
  className?: string;
}

export default function StatusLine({ kind = "info", message, className = "" }: StatusLineProps) {
  if (!message) return null;

  const color =
    kind === "error" ? "text-red-600" : kind === "success" ? "text-green-600" : "text-gray-600";

  return <div className={`text-sm ${color} ${className}`}>{message}</div>;
}
