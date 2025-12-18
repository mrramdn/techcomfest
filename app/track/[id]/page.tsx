"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AppLayout, { useUser } from "../../_components/AppLayout";
import type { Child, ChildResponse, MealLog, MealLogPayload, MealTime } from "../_lib/trackTypes";
import { mealTimeOptions, responseOptions } from "../_lib/trackTypes";

export default function TrackChildDetailPage() {
  return (
    <AppLayout>
      <TrackChildDetailContent />
    </AppLayout>
  );
}

function TrackChildDetailContent() {
  const user = useUser();
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;

  const [loadingChild, setLoadingChild] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [savingLog, setSavingLog] = useState(false);

  const [mealForm, setMealForm] = useState({
    foodName: "",
    mealTime: "BREAKFAST" as MealTime,
    childResponse: "FINISHED" as ChildResponse,
    notes: "",
    photo: "",
  });

  const fetchChild = useCallback(async () => {
    try {
      setLoadingChild(true);
      const res = await fetch(`/api/children/${childId}`);
      if (!res.ok) throw new Error("Failed to load child");
      const data = await res.json();
      setChild(data.child as Child);
    } catch (err) {
      console.error(err);
      setChild(null);
    } finally {
      setLoadingChild(false);
    }
  }, [childId]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch(`/api/meal-logs?childId=${childId}`);
      if (!res.ok) throw new Error("Failed to load meal logs");
      const data = await res.json();
      setMealLogs(data.mealLogs || []);
    } catch (err) {
      console.error(err);
      setMealLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, [childId]);

  useEffect(() => {
    if (!user || user.role !== "USER") return;
    fetchChild();
    fetchLogs();
  }, [fetchChild, fetchLogs, user]);

  if (!user || user.role !== "USER") {
    return (
      <div className="p-8">
        <p className="text-gray-600">This page is only available for user role.</p>
      </div>
    );
  }

  const handleDeleteChild = async () => {
    if (!confirm("Delete this child and all related meal logs?")) return;
    try {
      const res = await fetch(`/api/children/${childId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete child");
      router.push("/track");
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  const handleAddMealLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingLog(true);
      const payload: MealLogPayload = {
        childId,
        foodName: mealForm.foodName,
        mealTime: mealForm.mealTime,
        childResponse: mealForm.childResponse,
        notes: mealForm.notes || null,
        photo: mealForm.photo || null,
      };
      const res = await fetch("/api/meal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add meal log");
      }
      setMealForm({
        foodName: "",
        mealTime: "BREAKFAST",
        childResponse: "FINISHED",
        notes: "",
        photo: "",
      });
      await fetchLogs();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setSavingLog(false);
    }
  };

  const handleDeleteMealLog = async (id: string) => {
    if (!confirm("Delete this meal log?")) return;
    try {
      const res = await fetch(`/api/meal-logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete meal log");
      setMealLogs((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-3">
          <Link href="/track" className="text-sm text-blue-600 hover:underline">
            ← Back to Track
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {loadingChild ? "Loading..." : child?.name || "Child"}
              </h1>
              {child ? (
                <p className="text-sm text-gray-500">
                  {child.gender === "MALE" ? "Boy" : "Girl"} • {child.age} mo • {child.weight} kg, {child.height} cm
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/track/edit/${childId}`}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200"
              >
                Edit
              </Link>
              <button
                onClick={handleDeleteChild}
                className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          {child ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium text-gray-900">Preferences</p>
                <p>Favorite: {child.favoriteFood || "-"}</p>
                <p>Hates: {child.hatedFood || "-"}</p>
                <p>Food allergies: {child.foodAllergies.length ? child.foodAllergies.join(", ") : "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Eating behaviors</p>
                <p>Meal duration: {child.mealDuration.replace(/_/g, " ")}</p>
                <p>Texture preference: {child.texturePreference.replace(/_/g, " ")}</p>
                <p>Pattern change: {child.eatingPatternChange.replace(/_/g, " ")}</p>
                <p>Weight/Energy: {child.weightEnergyLevel.replace(/_/g, " ")}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-gray-900">Refusal behaviors</p>
                <p>{child.refusalBehaviors.length ? child.refusalBehaviors.join(", ") : "-"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Child not found or you don’t have access.</p>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Log Meal</h2>
            <p className="text-sm text-gray-500">Add a new meal entry.</p>
          </div>
          <form onSubmit={handleAddMealLog} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Food name</label>
              <input
                required
                value={mealForm.foodName}
                onChange={(e) => setMealForm({ ...mealForm, foodName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="E.g., Chicken porridge"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Meal time</label>
              <select
                value={mealForm.mealTime}
                onChange={(e) => setMealForm({ ...mealForm, mealTime: e.target.value as MealTime })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {mealTimeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Response</label>
              <select
                value={mealForm.childResponse}
                onChange={(e) =>
                  setMealForm({ ...mealForm, childResponse: e.target.value as ChildResponse })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {responseOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-700">Notes (optional)</label>
              <input
                value={mealForm.notes}
                onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Portion, mood, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Photo URL (optional)</label>
              <input
                value={mealForm.photo}
                onChange={(e) => setMealForm({ ...mealForm, photo: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingLog}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {savingLog ? "Saving..." : "Add Meal Log"}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Meal history</h2>
            <span className="text-sm text-gray-500">
              {loadingLogs ? "Loading..." : `${mealLogs.length} entries`}
            </span>
          </div>
          {mealLogs.length === 0 && !loadingLogs ? (
            <p className="text-sm text-gray-600">No meal logs yet.</p>
          ) : (
            <div className="space-y-3">
              {mealLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-xl p-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{log.foodName}</p>
                    <p className="text-xs text-gray-600">
                      {log.mealTime} • {log.childResponse} • {new Date(log.loggedAt).toLocaleString()}
                    </p>
                    {log.notes ? <p className="text-xs text-gray-600">Notes: {log.notes}</p> : null}
                  </div>
                  <button onClick={() => handleDeleteMealLog(log.id)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

