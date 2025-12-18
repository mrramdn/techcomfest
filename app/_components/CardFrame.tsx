"use client";

import type { ReactNode } from "react";

type CardFrameProps = {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
};

export default function CardFrame({ children, className, scrollable = false }: CardFrameProps) {
  return (
    <div className="min-h-screen bg-white sm:bg-slate-200 flex justify-center items-start px-4 pt-8 sm:pt-24 pb-12">
      <div
        className={[
          "relative w-full bg-white px-4 py-8",
          "sm:max-w-160 sm:px-12 lg:px-24 sm:py-14",
          "sm:rounded-4xl sm:outline sm:-outline-offset-1 sm:outline-gray-300 sm:overflow-x-hidden",
          scrollable ? "sm:overflow-y-auto" : "sm:overflow-y-hidden",
          "sm:h-160",
          className || "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
