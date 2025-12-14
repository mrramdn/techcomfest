"use client";

import AppLayout, { useUser } from "../_components/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function TrackContent() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only USER role can access Track page
    if (user && user.role !== "USER") {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== "USER") {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Track</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Track content will be displayed here.</p>
          <p className="text-sm text-blue-500 mt-2">✓ User-only page</p>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <AppLayout>
      <TrackContent />
    </AppLayout>
  );
}
