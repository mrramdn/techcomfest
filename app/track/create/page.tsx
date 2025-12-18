"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppLayout, { useUser } from "../../_components/AppLayout";
import type {
  ChildPayload,
  EatingPatternChange,
  Gender,
  MealDuration,
  TexturePreference,
  WeightEnergyLevel,
} from "../_lib/trackTypes";
import {
  eatingPatternOptions,
  mealDurationOptions,
  refusalOptions,
  textureOptions,
  weightEnergyOptions,
} from "../_lib/trackTypes";

export default function TrackCreateChildPage() {
  return (
    <AppLayout>
      <TrackCreateChildContent />
    </AppLayout>
  );
}

function TrackCreateChildContent() {
  const user = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "MALE" as Gender,
    age: "",
    height: "",
    weight: "",
    favoriteFood: "",
    hatedFood: "",
    foodAllergies: "",
    refusalBehaviors: [] as string[],
    mealDuration: "TEN_TO_TWENTY" as MealDuration,
    texturePreference: "SOFT_MASHED" as TexturePreference,
    eatingPatternChange: "NO" as EatingPatternChange,
    weightEnergyLevel: "NORMAL_WEIGHT" as WeightEnergyLevel,
  });

  if (!user || user.role !== "USER") {
    return (
      <div className="p-8">
        <p className="text-gray-600">This page is only available for user role.</p>
      </div>
    );
  }

  const toggleRefusal = (value: string) => {
    setForm((prev) => {
      const exists = prev.refusalBehaviors.includes(value);
      return {
        ...prev,
        refusalBehaviors: exists
          ? prev.refusalBehaviors.filter((v) => v !== value)
          : [...prev.refusalBehaviors, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: ChildPayload = {
        name: form.name,
        gender: form.gender,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        favoriteFood: form.favoriteFood || null,
        hatedFood: form.hatedFood || null,
        foodAllergies: form.foodAllergies
          ? form.foodAllergies.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        refusalBehaviors: form.refusalBehaviors,
        mealDuration: form.mealDuration,
        texturePreference: form.texturePreference,
        eatingPatternChange: form.eatingPatternChange,
        weightEnergyLevel: form.weightEnergyLevel,
      };

      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add child");
      }
      const data = await res.json();
      router.push(data.child?.id ? `/track/${data.child.id}` : "/track");
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <header className="space-y-2">
          <Link href="/track" className="text-sm text-blue-600 hover:underline">
            ← Back to Track
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">Add Child</h1>
          <p className="text-sm text-gray-500">Create a child profile to start tracking meals.</p>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Child name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Age (months)</label>
              <input
                required
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="24"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Height (cm)</label>
              <input
                required
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="90"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Weight (kg)</label>
              <input
                required
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="12.5"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Favorite food</label>
              <input
                value={form.favoriteFood}
                onChange={(e) => setForm({ ...form, favoriteFood: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Pasta, fruits"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Hated food</label>
              <input
                value={form.hatedFood}
                onChange={(e) => setForm({ ...form, hatedFood: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Broccoli"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-700">Food allergies (comma separated)</label>
              <input
                value={form.foodAllergies}
                onChange={(e) => setForm({ ...form, foodAllergies: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Peanut, milk"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-700">Refusal behaviors</label>
              <div className="flex flex-wrap gap-3">
                {refusalOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.refusalBehaviors.includes(opt.value)}
                      onChange={() => toggleRefusal(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Meal duration</label>
              <select
                value={form.mealDuration}
                onChange={(e) => setForm({ ...form, mealDuration: e.target.value as MealDuration })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {mealDurationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Texture preference</label>
              <select
                value={form.texturePreference}
                onChange={(e) => setForm({ ...form, texturePreference: e.target.value as TexturePreference })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {textureOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Eating pattern change</label>
              <select
                value={form.eatingPatternChange}
                onChange={(e) =>
                  setForm({ ...form, eatingPatternChange: e.target.value as EatingPatternChange })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {eatingPatternOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Weight & energy</label>
              <select
                value={form.weightEnergyLevel}
                onChange={(e) =>
                  setForm({ ...form, weightEnergyLevel: e.target.value as WeightEnergyLevel })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {weightEnergyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Link
                href="/track"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

