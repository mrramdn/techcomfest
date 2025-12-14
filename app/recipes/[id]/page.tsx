"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AppLayout, { useUser } from "../../_components/AppLayout";

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  views: number;
  status: string;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  instructions: Array<{ step: number; description: string }>;
  nutrition: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
    fiber: number;
    sugar?: number;
    sodium?: number;
  };
  tags: string[];
  isFavorited: boolean;
  favoritesCount: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const user = useUser();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchRecipe();
    }
  }, [resolvedParams]);

  const fetchRecipe = async () => {
    if (!resolvedParams?.id) return;

    try {
      const response = await fetch(`/api/recipes/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
      } else if (response.status === 404) {
        router.push("/recipes");
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!recipe) return;

    try {
      const response = await fetch(`/api/recipes/${recipe.id}/favorite`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setRecipe({ ...recipe, isFavorited: data.isFavorited });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const deleteRecipe = async () => {
    if (!recipe || !confirm("Are you sure you want to delete this recipe?"))
      return;

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/recipes");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-16 pt-8 pb-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading recipe...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!recipe) {
    return (
      <AppLayout>
        <div className="p-16 pt-8 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Recipe not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-16 pt-8 pb-8">
        {/* Back Button */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Recipes
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image */}
          <div className="relative h-96 bg-slate-100 rounded-xl overflow-hidden">
            {recipe.image ? (
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="material-symbols-outlined text-9xl text-gray-300">
                  restaurant
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {recipe.category}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      local_fire_department
                    </span>
                    {recipe.nutrition.calories} kcal
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {recipe.name}
                </h1>
              </div>

              {user && (
                <button
                  onClick={toggleFavorite}
                  className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      recipe.isFavorited ? "text-red-500" : "text-gray-400"
                    }`}
                    style={{
                      fontVariationSettings: recipe.isFavorited
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                </button>
              )}
            </div>

            <p className="text-gray-600 mb-6">{recipe.description}</p>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 text-3xl">
                  schedule
                </span>
                <div>
                  <p className="text-sm text-gray-500">Prep Time</p>
                  <p className="font-semibold text-gray-900">
                    {recipe.prepTime} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 text-3xl">
                  oven_gen
                </span>
                <div>
                  <p className="text-sm text-gray-500">Cook Time</p>
                  <p className="font-semibold text-gray-900">
                    {recipe.cookTime} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-purple-600 text-3xl">
                  {recipe.difficulty === "EASY"
                    ? "sentiment_satisfied"
                    : recipe.difficulty === "MEDIUM"
                    ? "sentiment_neutral"
                    : "sentiment_stressed"}
                </span>
                <div>
                  <p className="text-sm text-gray-500">Difficulty</p>
                  <p className="font-semibold text-gray-900">
                    {recipe.difficulty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  restaurant
                </span>
                <div>
                  <p className="text-sm text-gray-500">Servings</p>
                  <p className="font-semibold text-gray-900">
                    {recipe.servings} people
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Admin Actions */}
            {user?.role === "ADMIN" && (
              <div className="flex gap-3 mt-6">
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit
                </Link>
                <button
                  onClick={deleteRecipe}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Nutrition Content
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Calories</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipe.nutrition.calories}
              </p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Fat</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipe.nutrition.fat}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Protein</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipe.nutrition.protein}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Carbs</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipe.nutrition.carbs}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Fiber</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipe.nutrition.fiber}
              </p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            {recipe.nutrition.sugar !== undefined && (
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Sugar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recipe.nutrition.sugar}
                </p>
                <p className="text-xs text-gray-500">g</p>
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ingredients
          </h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 mt-0.5">
                  check_circle
                </span>
                <span className="text-gray-700">
                  <span className="font-medium">
                    {ingredient.amount} {ingredient.unit}
                  </span>{" "}
                  {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">menu_book</span>
            Step by Step Preparation
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {recipe.instructions.map((instruction) => (
              <div
                key={instruction.step}
                className="shrink-0 w-80 bg-slate-50 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                    {instruction.step}
                  </div>
                  <p className="text-sm text-gray-500">
                    Step {instruction.step} of {recipe.instructions.length}
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {instruction.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
