"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppLayout, { useUser } from "../../_components/AppLayout";
import type { RecipeDetail } from "../_lib/recipeTypes";
import BackLink from "@/app/_components/BackLink";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AppLayout>
      <RecipeDetailContent params={params} />
    </AppLayout>
  );
}

function RecipeDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const user = useUser();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const fetchRecipe = useCallback(async () => {
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
  }, [resolvedParams, router]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchRecipe();
    }
  }, [fetchRecipe, resolvedParams]);

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

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Recipe not found</p>
        </div>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;
  const canFavorite = !!user;
  const difficultyLabel =
    recipe.difficulty === "EASY"
      ? "Easy"
      : recipe.difficulty === "MEDIUM"
      ? "Medium"
      : "Hard";
  const difficultyClass =
    recipe.difficulty === "EASY"
      ? "bg-green-200 text-green-600 outline-emerald-300"
      : recipe.difficulty === "MEDIUM"
      ? "bg-amber-200 text-amber-700 outline-amber-300"
      : "bg-rose-200 text-rose-600 outline-rose-300";
  const ingredientsText = recipe.ingredients.length
    ? recipe.ingredients
        .map((ingredient) =>
          [ingredient.amount, ingredient.unit, ingredient.name]
            .filter((part) => part && part.trim().length > 0)
            .join(" ")
        )
        .join(", ")
    : "No ingredients listed.";
  const nutritionItems = [
    { label: "Fat", value: recipe.nutrition.fat, unit: "g" },
    { label: "Protein", value: recipe.nutrition.protein, unit: "g" },
    { label: "Carbohydrates", value: recipe.nutrition.carbs, unit: "g" },
    { label: "Fiber", value: recipe.nutrition.fiber, unit: "g" },
  ].filter((item) => item.value !== undefined && item.value !== null);
  const instructionTitle = (description: string) => {
    const sentence = description.split(".")[0]?.trim();
    return sentence || "Instruction";
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <div className="w-full mx-auto px-5 py-4">
        <BackLink href="/recipes" label={recipe.name} className="max-w-72" />
      </div>
      <div className="w-full mx-auto px-5 pb-16">
        <div className="rounded-4xl flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="relative w-full h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden bg-slate-100">
              {recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="material-symbols-outlined text-8xl text-gray-300">
                    restaurant
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 leading-tight">
                    {recipe.name}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={!canFavorite}
                  title="Favorite"
                  aria-label="Favorite recipe"
                  className="size-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span
                    className={`material-symbols-outlined text-base ${
                      recipe.isFavorited ? "text-red-500" : "text-gray-900"
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
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <div className="px-2 py-1 bg-gray-200 rounded-sm">
                  {recipe.category}
                </div>
                <div className="px-2 py-1 bg-gray-200 rounded-sm inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-gray-500">
                    local_fire_department
                  </span>
                  <span>{recipe.nutrition.calories} kcal</span>
                </div>
                <div className="px-2 py-1 bg-gray-200 rounded-sm inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-gray-500">
                    schedule
                  </span>
                  <span>{totalTime} min</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-sm outline outline-offset-1 inline-flex items-center gap-1 ${difficultyClass}`}
                >
                  <span className="material-symbols-outlined text-base">
                    chef_hat
                  </span>
                  <span>{difficultyLabel}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <div className="text-gray-500 text-base">Description</div>
                  <div className="text-gray-600 text-base leading-6">
                    {recipe.description}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-gray-500 text-base">
                    Nutrient content
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-base">
                    {nutritionItems.length === 0 ? (
                      <span className="text-gray-600">-</span>
                    ) : (
                      nutritionItems.map((item, index) => (
                        <Fragment key={item.label}>
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="text-gray-900 font-semibold">
                              {item.value}
                              {item.unit}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {index < nutritionItems.length - 1 && (
                            <span className="size-1.5 bg-gray-400 rounded-full" />
                          )}
                        </Fragment>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-gray-500 text-base">Ingredient</div>
                  <div className="text-gray-600 text-base leading-6">
                    {ingredientsText}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="material-symbols-outlined text-base text-gray-500">
                menu_book
              </span>
              <span>Step by step preparation instruction:</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-base">
                chevron_left
              </span>
              <span className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {recipe.instructions.map((instruction) => (
              <div
                key={instruction.step}
                className="min-w-56 w-64 p-4 bg-white rounded-2xl outline outline-offset-1 outline-gray-200"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="text-blue-300 text-sm font-normal">
                    Step {instruction.step} of {recipe.instructions.length}
                  </div>
                  <div className="text-gray-900 text-base font-semibold leading-6 line-clamp-2">
                    {instructionTitle(instruction.description)}
                  </div>
                  <div className="text-gray-600 text-sm font-normal leading-5">
                    {instruction.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
