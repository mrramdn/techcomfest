"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/app/_components/AppLayout";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Instruction {
  step: number;
  description: string;
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [servings, setServings] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
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

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        const recipe = data.recipe;

        setName(recipe.name);
        setCategory(recipe.category);
        setDescription(recipe.description);
        setImage(recipe.image || "");
        setPrepTime(recipe.prepTime.toString());
        setCookTime(recipe.cookTime.toString());
        setDifficulty(recipe.difficulty);
        setServings(recipe.servings.toString());
        setStatus(recipe.status);
        setSource(recipe.source || "");
        setTags(recipe.tags.join(", "));
        setIngredients(recipe.ingredients);
        setInstructions(recipe.instructions);
        setCalories(recipe.nutrition.calories.toString());
        setFat(recipe.nutrition.fat.toString());
        setProtein(recipe.nutrition.protein.toString());
        setCarbs(recipe.nutrition.carbs.toString());
        setFiber(recipe.nutrition.fiber.toString());
        setSugar(recipe.nutrition.sugar?.toString() || "");
        setSodium(recipe.nutrition.sodium?.toString() || "");
      } else {
        alert("Failed to load recipe");
        router.push("/recipes");
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
      alert("Error loading recipe");
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description,
          image: image || null,
          prepTime: parseInt(prepTime),
          cookTime: parseInt(cookTime),
          difficulty,
          servings: parseInt(servings),
          ingredients,
          instructions,
          nutrition: {
            calories: parseFloat(calories),
            fat: parseFloat(fat),
            protein: parseFloat(protein),
            carbs: parseFloat(carbs),
            fiber: parseFloat(fiber),
            sugar: sugar ? parseFloat(sugar) : undefined,
            sodium: sodium ? parseFloat(sodium) : undefined,
          },
          status,
          source: source || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        router.push("/recipes");
      } else {
        alert("Failed to update recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Failed to update recipe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-gray-900 hover:text-blue-600 mb-6 font-medium"
          >
            ← Back to Recipes
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Recipe</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option>Soup</option>
                      <option>Main Course</option>
                      <option>Dessert</option>
                      <option>Salad</option>
                      <option>Appetizer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Difficulty *
                    </label>
                    <select
                      required
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/images/recipes/example.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Prep Time (min) *
                    </label>
                    <input
                      type="number"
                      required
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Cook Time (min) *
                    </label>
                    <input
                      type="number"
                      required
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Servings *
                    </label>
                    <input
                      type="number"
                      required
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="healthy, vegetarian, low-carb"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Source (optional)
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ingredients
                </h2>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Amount (e.g., 1)"
                      value={ingredient.amount}
                      onChange={(e) =>
                        updateIngredient(index, "amount", e.target.value)
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g., cup)"
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Preparation Steps
                </h2>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Step
                </button>
              </div>

              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold shrink-0 mt-2">
                      {instruction.step}
                    </div>
                    <textarea
                      placeholder={`Step ${instruction.step} description...`}
                      value={instruction.description}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={3}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Nutrition Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Calories *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fat (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Protein (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Carbs (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fiber (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Sugar (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sodium}
                    onChange={(e) => setSodium(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : "Update Recipe"}
              </button>
              <Link
                href="/recipes"
                className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
