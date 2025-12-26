"use client";

import Link from "next/link";

export default function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium text-sm md:text-base transition-colors ${className ?? ""}`}
    >
      <span className="material-symbols-outlined text-base">arrow_back</span>
      <span className="line-clamp-1">Back / {label}</span>
    </Link>
  );
}
