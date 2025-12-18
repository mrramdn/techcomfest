"use client";

import Image from "next/image";

type LoadingProps = {
  label?: string;
};

export default function Loading({ label = "Loading..." }: LoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-xl overflow-hidden flex items-center justify-center">
          <Image
            src="/images/icon/logo.png"
            alt="Lahap Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain animate-pulse"
            priority
          />
        </div>
        <div className="text-gray-500 text-sm animate-pulse">{label}</div>
      </div>
    </div>
  );
}

