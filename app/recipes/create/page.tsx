"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/app/_components/AppLayout";
import type { Ingredient, Instruction } from "../_lib/recipeTypes";
import {
  recipeCategoryOptions,
  recipeDifficultyOptions,
  recipeStatusOptions,
} from "../_lib/recipeTypes";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900";

export default function CreateRecipePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [servings, setServings] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState("");

  // Dynamic arrays
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { step: 1, description: "" },
  ]);

  // Nutrition
  const [calories, setCalories] = useState("");
  const [fat, setFat] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fiber, setFiber] = useState("");
  const [sugar, setSugar] = useState("");
  const [sodium, setSodium] = useState("");

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step: instructions.length + 1, description: "" },
    ]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }));
      setInstructions(updated);
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index].description = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("name", name);
      form.append("category", category);
      form.append("description", description);
      form.append("prepTime", String(parseInt(prepTime || "0")));
      form.append("cookTime", String(parseInt(cookTime || "0")));
      form.append("difficulty", difficulty);
      form.append("servings", String(parseInt(servings || "0")));
      form.append("status", status);
      if (source) form.append("source", source);
      form.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));
      form.append("ingredients", JSON.stringify(ingredients));
      form.append("instructions", JSON.stringify(instructions));
      form.append(
        "nutrition",
        JSON.stringify({
          calories: parseFloat(calories || "0"),
          fat: parseFloat(fat || "0"),
          protein: parseFloat(protein || "0"),
          carbs: parseFloat(carbs || "0"),
          fiber: parseFloat(fiber || "0"),
          sugar: sugar ? parseFloat(sugar) : undefined,
          sodium: sodium ? parseFloat(sodium) : undefined,
        })
      );

      if (photoFile) form.append("photo", photoFile);
      else if (image) form.append("image", image);

      const response = await fetch("/api/recipes", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        router.push("/recipes");
      } else {
        const err = await response.json().catch(() => null);
        alert(err?.error || "Failed to create recipe");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe");
    } finally {
      setSaving(false);
    }
  };

  // Preview effect
  useEffect(() => {
    if (!photoFile) return setPreview(null);
    const url = URL.createObjectURL(photoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const f = e.target.files?.[0] || null;
    if (!f) return setPhotoFile(null);
    const max = 5 * 1024 * 1024;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (f.size > max) {
      setMessage("Image too large (max 5MB)");
      e.currentTarget.value = "";
      return;
    }
    if (f.type && !allowed.includes(f.type)) {
      setMessage("Invalid image type. Use JPG/PNG/WEBP");
      e.currentTarget.value = "";
      return;
    }
    setPhotoFile(f);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-gray-900 hover:text-blue-600 mb-6 font-medium text-sm md:text-base"
          >
            ← Back to Recipes
          </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Create New Recipe
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                  >
                    {recipeCategoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Difficulty *
                  </label>
                  <select
                    required
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={inputClass}
                  >
                    {recipeDifficultyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Recipe Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-36 h-36 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    ) : image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 text-sm">No image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {message && <div className="text-xs text-red-500 mt-2">{message}</div>}
                    <div className="text-xs text-gray-400 mt-2">JPEG, PNG, or WEBP — up to 5MB</div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600">Or provide an existing image path</label>
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="/images/recipes/example.jpg"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Prep Time (min) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Cook Time (min) *
                  </label>
                  <input
                    type="number"
                    required
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Servings *
                  </label>
                  <input
                    type="number"
                    required
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    {recipeStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="healthy, vegetarian, low-carb"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Source (optional)
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Ingredients
              </h2>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Name (e.g., Broccoli)"
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g., 1)"
                    value={ingredient.amount}
                    onChange={(e) =>
                      updateIngredient(index, "amount", e.target.value)
                    }
                    className="w-32 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g., cup)"
                    value={ingredient.unit}
                    onChange={(e) =>
                      updateIngredient(index, "unit", e.target.value)
                    }
                    className="w-32 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Preparation Steps
              </h2>
              <button
                type="button"
                onClick={addInstruction}
                className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex items-center justify-center size-8 md:size-10 bg-blue-600 text-white rounded-full font-bold shrink-0 mt-2">
                    {instruction.step}
                  </div>
                  <textarea
                    placeholder={`Step ${instruction.step} description...`}
                    value={instruction.description}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows={3}
                    className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    disabled={instructions.length === 1}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg self-start disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
              Nutrition Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Calories *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Fat (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Protein (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Carbs (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Fiber (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Sugar (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm md:text-base"
            >
              {saving ? "Creating..." : "Create Recipe"}
            </button>
            <Link
              href="/recipes"
              className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
    </AppLayout>
  );
}
