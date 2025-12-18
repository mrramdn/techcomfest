"use client";

import AppLayout, { useUser } from "../_components/AppLayout";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Child } from "./_lib/trackTypes";

function TrackContent() {
  const user = useUser();
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);

  const fetchChildren = useCallback(async () => {
    try {
      setLoadingChildren(true);
      const res = await fetch("/api/children");
      if (!res.ok) throw new Error("Failed to load children");
      const data = await res.json();
      setChildren(data.children || []);
    } catch (err) {
      console.error(err);
      setChildren([]);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "USER") return;
    fetchChildren();
  }, [fetchChildren, user]);

  const handleDeleteChild = async (id: string) => {
    if (!confirm("Delete this child and all related meal logs?")) return;
    try {
      const res = await fetch(`/api/children/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete child");
      await fetchChildren();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  if (!user || user.role !== "USER") {
    return (
      <div className="p-8">
        <p className="text-gray-600">This page is only available for user role.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">Child nutrition tracker</p>
          <h1 className="text-3xl font-semibold text-gray-900">Track</h1>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/track/create"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Child
            </Link>
          </div>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Children</h2>
              <p className="text-sm text-gray-500">Open a child to start tracking meal logs.</p>
            </div>
            <span className="text-sm text-gray-500">
              {loadingChildren ? "Loading..." : `${children.length} enrolled`}
            </span>
          </div>

          {children.length === 0 && !loadingChildren ? (
            <p className="text-sm text-gray-600">No children yet. Click “Add Child” to begin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div key={child.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{child.name}</p>
                      <p className="text-xs text-gray-500">
                        {child.gender === "MALE" ? "Boy" : "Girl"} • {child.age} mo • {child.weight} kg,{" "}
                        {child.height} cm
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track/${child.id}`}
                        className="px-3 py-1 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Open
                      </Link>
                      <Link
                        href={`/track/edit/${child.id}`}
                        className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        className="px-3 py-1 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Fav: {child.favoriteFood || "-"}</p>
                    <p>Hates: {child.hatedFood || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
