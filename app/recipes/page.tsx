"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AppLayout, { useUser } from "../_components/AppLayout";

import type { RecipeSummary } from "./_lib/recipeTypes";

function RecipesContent() {
  const user = useUser(); // Now inside AppLayout context
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [maxTime, setMaxTime] = useState<string>("");
  const [maxCalories, setMaxCalories] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  // Track expanded state for each filter
  const [expandedFilters, setExpandedFilters] = useState<{
    [key: string]: boolean;
  }>({
    difficulty: false,
    time: false,
    foodType: false,
    calories: false,
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch("/api/recipes");
      if (response.ok) {
        const data = await response.json();
        const uniqueCategories = Array.from(
          new Set(data.recipes.map((r: RecipeSummary) => r.category))
        ).sort() as string[];
        const uniqueDifficulties = Array.from(
          new Set(data.recipes.map((r: RecipeSummary) => r.difficulty))
        ).sort() as string[];
        setCategories(uniqueCategories);
        setDifficulties(uniqueDifficulties);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  const fetchRecipes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) {
        params.set("category", selectedCategories.join(","));
      }
      if (search) {
        params.set("search", search);
      }

      const response = await fetch(`/api/recipes?${params}`);
      if (response.ok) {
        const data = await response.json();
        let filtered = data.recipes;

        // Client-side filtering
        if (selectedDifficulties.length > 0) {
          filtered = filtered.filter((r: RecipeSummary) =>
            selectedDifficulties.includes(r.difficulty)
          );
        }
        if (maxTime) {
          const time = parseInt(maxTime);
          filtered = filtered.filter(
            (r: RecipeSummary) => r.prepTime + r.cookTime <= time
          );
        }
        if (maxCalories) {
          const cal = parseInt(maxCalories);
          filtered = filtered.filter(
            (r: RecipeSummary) => r.nutrition.calories <= cal
          );
        }

        setRecipes(filtered);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategories, selectedDifficulties, maxTime, maxCalories]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/recipes?favorites=true");
      if (response.ok) {
        const data = await response.json();
        setFavoriteRecipes(data.recipes);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
    fetchRecipes();
    if (user) {
      fetchFavorites();
    }
  }, [fetchFilterOptions, fetchRecipes, fetchFavorites, user]);

  const toggleFavorite = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
        method: "POST",
      });

      if (response.ok) {
        fetchRecipes();
        if (user) {
          fetchFavorites();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
      } else {
        const err = await response.json().catch(() => null);
        alert(err?.error || "Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Error deleting recipe");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRecipes]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setMaxTime("");
    setMaxCalories("");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading recipes...</p>
        </div>
      </div>
    );
  }

  console.log("User data:", user, "Role:", user?.role);

  // Admin view - Table layout (only if user exists AND role is exactly "ADMIN")
  if (user && user.role === "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Manage Recipes
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Create, edit, and manage all recipes
              </p>
            </div>
            <Link
              href="/recipes/create"
              className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
            >
              <span className="text-xl">+</span>
              Create New Recipe
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base"
            />
          </div>

          {/* Recipes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipe
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recipes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm md:text-base"
                      >
                        No recipes found
                      </td>
                    </tr>
                  ) : (
                    recipes.map((recipe) => (
                      <tr
                        key={recipe.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3">
                            {recipe.image ? (
                              <Image
                                src={recipe.image}
                                alt={recipe.name}
                                width={48}
                                height={48}
                                className="size-10 md:size-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="size-10 md:size-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                🍳
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm md:text-base">
                                {recipe.name}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                {recipe.prepTime + recipe.cookTime} mins •{" "}
                                {recipe.servings} servings
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="text-xs md:text-sm text-gray-700">
                            {recipe.category}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              recipe.difficulty === "EASY"
                                ? "bg-green-100 text-green-800"
                                : recipe.difficulty === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              recipe.status === "PUBLISHED"
                                ? "bg-blue-100 text-blue-800"
                                : recipe.status === "DRAFT"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {recipe.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="text-xs md:text-sm text-gray-700">
                            {recipe.views}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="text-xs md:text-sm text-gray-700">
                            {recipe.author.name}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/recipes/${recipe.id}`}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              href={`/recipes/edit/${recipe.id}`}
                              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              disabled={deletingId === recipe.id}
                              onClick={() => handleDelete(recipe.id)}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {deletingId === recipe.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User view - Card layout with filters
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar Filter */}
      <div className="w-full lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-gray-200 pr-0 bg-white">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="p-6 pb-0 pt-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-500">Filter</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-2 px-5 pb-6">
          {/* Difficulty Filter */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (selectedDifficulties.length > 0) {
                  setSelectedDifficulties([]);
                  setExpandedFilters({
                    ...expandedFilters,
                    difficulty: false,
                  });
                } else {
                  setExpandedFilters({
                    ...expandedFilters,
                    difficulty: !expandedFilters.difficulty,
                  });
                }
              }}
              className="h-10 px-3 py-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  sentiment_satisfied
                </span>
                <span className="text-sm text-gray-700">Difficulty</span>
              </div>
              {selectedDifficulties.length > 0 ? (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  close
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  expand_more
                </span>
              )}
            </button>
            {expandedFilters.difficulty && (
              <div className="flex flex-col gap-2 pl-3">
                {difficulties.map((diff) => (
                  <label
                    key={diff}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.includes(diff)}
                      onChange={() => {
                        if (selectedDifficulties.includes(diff)) {
                          setSelectedDifficulties(
                            selectedDifficulties.filter((d) => d !== diff)
                          );
                        } else {
                          setSelectedDifficulties([
                            ...selectedDifficulties,
                            diff,
                          ]);
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 accent-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {diff === "EASY"
                        ? "Easy"
                        : diff === "MEDIUM"
                        ? "Medium"
                        : "Hard"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Time Filter */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (maxTime) {
                  setMaxTime("");
                  setExpandedFilters({ ...expandedFilters, time: false });
                } else {
                  setExpandedFilters({
                    ...expandedFilters,
                    time: !expandedFilters.time,
                  });
                }
              }}
              className="h-10 px-3 py-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  schedule
                </span>
                <span className="text-sm text-gray-700">Time</span>
              </div>
              {maxTime ? (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  close
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  expand_more
                </span>
              )}
            </button>
            {expandedFilters.time && (
              <div className="flex flex-col gap-2 pl-3">
                {["10", "30", "60"].map((time) => (
                  <label
                    key={time}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={maxTime === time}
                      onChange={() => setMaxTime(maxTime === time ? "" : time)}
                      className="w-4 h-4 rounded border-gray-300 accent-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {time === "10"
                        ? "< 10 minute"
                        : time === "30"
                        ? "10 - 30 minute"
                        : "30 - 60 minute"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Food Type Filter */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (selectedCategories.length > 0) {
                  setSelectedCategories([]);
                  setExpandedFilters({ ...expandedFilters, foodType: false });
                } else {
                  setExpandedFilters({
                    ...expandedFilters,
                    foodType: !expandedFilters.foodType,
                  });
                }
              }}
              className="h-10 px-3 py-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  menu_book_2
                </span>
                <span className="text-sm text-gray-700">Food type</span>
              </div>
              {selectedCategories.length > 0 ? (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  close
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  expand_more
                </span>
              )}
            </button>
            {expandedFilters.foodType && (
              <div className="flex flex-col gap-2 pl-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== category)
                          );
                        } else {
                          setSelectedCategories([
                            ...selectedCategories,
                            category,
                          ]);
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 accent-primary-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Calories Filter */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (maxCalories) {
                  setMaxCalories("");
                  setExpandedFilters({ ...expandedFilters, calories: false });
                } else {
                  setExpandedFilters({
                    ...expandedFilters,
                    calories: !expandedFilters.calories,
                  });
                }
              }}
              className="h-10 px-3 py-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  local_fire_department
                </span>
                <span className="text-sm text-gray-700">Calories</span>
              </div>
              {maxCalories ? (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  close
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-base text-gray-700"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  expand_more
                </span>
              )}
            </button>
            {expandedFilters.calories && (
              <div className="flex flex-col gap-2 pl-3">
                {["150", "300", "350"].map((cal) => (
                  <label
                    key={cal}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={maxCalories === cal}
                      onChange={() =>
                        setMaxCalories(maxCalories === cal ? "" : cal)
                      }
                      className="w-4 h-4 rounded border-gray-300 accent-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {cal === "150"
                        ? "< 150 calories"
                        : cal === "300"
                        ? "150 - 300 calories"
                        : "350+ calories"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="w-full">
          {/* Favorites Section */}
          {user && favoriteRecipes.length > 0 && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                  My Favorite Recipes
                </h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="w-full h-96 p-5 bg-white rounded-3xl outline -outline-offset-1 outline-gray-200 flex justify-start items-center gap-2.5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 self-stretch inline-flex flex-col justify-start items-start gap-1.5">
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="self-stretch flex-1 relative rounded-lg overflow-hidden bg-slate-100"
                        >
                          {recipe.image ? (
                            <Image
                              src={recipe.image}
                              alt={recipe.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="material-symbols-outlined text-6xl text-gray-300">
                                restaurant
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="self-stretch h-36 flex flex-col justify-start items-start gap-4">
                          <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
                            <Link
                              href={`/recipes/${recipe.id}`}
                              className="self-stretch flex flex-col justify-start items-start"
                            >
                              <div className="self-stretch justify-start text-gray-500 text-lg font-medium leading-7">
                                {recipe.name}
                              </div>
                              <div className="self-stretch h-9 justify-start text-gray-300 text-xs font-normal leading-4 line-clamp-2">
                                {recipe.description}
                              </div>
                            </Link>

                            <div className="inline-flex justify-start items-center gap-1.5">
                              <div className="px-1 py-1 bg-gray-200 rounded-sm flex justify-center items-center gap-2.5">
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.category}
                                </div>
                              </div>
                              <div className="px-1 py-0 bg-gray-200 rounded-sm flex justify-center items-center gap-2.5">
                                <div className="flex justify-start items-center gap-1">
                                  <span className="material-symbols-outlined text-base text-gray-500">
                                    local_fire_department
                                  </span>
                                  <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                    {recipe.nutrition.calories} kcal
                                  </div>
                                </div>
                              </div>
                              <div className="px-1 py-0 bg-gray-200 rounded-sm flex justify-center items-center gap-2.5">
                                <div className="flex justify-start items-center gap-1">
                                  <span className="material-symbols-outlined text-base text-gray-500">
                                    schedule
                                  </span>
                                  <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                    {recipe.prepTime + recipe.cookTime} min
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="self-stretch inline-flex justify-between items-center">
                            {recipe.difficulty === "EASY" && (
                              <div className="px-1 py-px bg-success-light rounded-sm outline -outline-offset-1 outline-success-dark flex justify-center items-center gap-2.5">
                                <div className="flex justify-start items-center gap-3">
                                  <span
                                    className="material-symbols-outlined text-base text-success-dark"
                                    style={{
                                      fontVariationSettings: "'FILL' 0",
                                    }}
                                  >
                                    chef_hat
                                  </span>
                                  <div className="justify-start text-success-dark text-xs font-medium leading-4">
                                    Easy
                                  </div>
                                </div>
                              </div>
                            )}
                            {recipe.difficulty === "MEDIUM" && (
                              <div className="px-1 py-px bg-warning-light rounded-sm outline -outline-offset-1 outline-warning-dark flex justify-center items-center gap-2.5">
                                <div className="flex justify-start items-center gap-1">
                                  <span
                                    className="material-symbols-outlined text-base text-warning-dark"
                                    style={{
                                      fontVariationSettings: "'FILL' 0",
                                    }}
                                  >
                                    chef_hat
                                  </span>
                                  <span
                                    className="material-symbols-outlined text-base text-warning-dark"
                                    style={{
                                      fontVariationSettings: "'FILL' 0",
                                    }}
                                  >
                                    chef_hat
                                  </span>
                                  <div className="justify-start text-warning-dark text-xs font-medium leading-4">
                                    Medium
                                  </div>
                                </div>
                              </div>
                            )}
                            {recipe.difficulty === "HARD" && (
                              <div className="px-1 py-px bg-error-light rounded-sm outline -outline-offset-1 outline-error-dark flex justify-center items-center gap-2.5">
                                <div className="flex justify-start items-center gap-1">
                                  <span
                                    className="material-symbols-outlined text-base text-error-dark"
                                    style={{
                                      fontVariationSettings: "'FILL' 0",
                                    }}
                                  >
                                    chef_hat
                                  </span>
                                  <span
                                    className="material-symbols-outlined text-base text-error-dark"
                                    style={{
                                      fontVariationSettings: "'FILL' 0",
                                    }}
                                  >
                                    chef_hat
                                  </span>
                                  <span
                                    className="material-symbols-outlined text-base text-error-dark"
                                    style={{
                                      fontVariationSettings: "'FILL' 0",
                                    }}
                                  >
                                    chef_hat
                                  </span>
                                  <div className="justify-start text-error-dark text-xs font-medium leading-4">
                                    Hard
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-start items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(recipe.id);
                                }}
                                className="relative z-10 pointer-events-auto flex justify-start items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer"
                              >
                                <span
                                  className={`material-symbols-outlined text-base ${
                                    recipe.isFavorited
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                  style={{
                                    fontVariationSettings: recipe.isFavorited
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  favorite
                                </span>
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.favoritesCount > 1000
                                    ? `${(recipe.favoritesCount / 1000).toFixed(
                                        1
                                      )}K`
                                    : recipe.favoritesCount}
                                </div>
                              </button>
                              <div className="flex justify-start items-center gap-1">
                                <span
                                  className="material-symbols-outlined text-base text-gray-500"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  visibility
                                </span>
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.views > 1000
                                    ? `${(recipe.views / 1000).toFixed(1)}K`
                                    : recipe.views}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* All Recipes */}
          <div>
            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                  restaurant_menu
                </span>
                <p className="text-gray-500">No recipes found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="w-full h-96 p-5 bg-white rounded-3xl outline -outline-offset-1 outline-gray-200 flex justify-start items-center gap-2.5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 self-stretch inline-flex flex-col justify-start items-start gap-1.5">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="self-stretch flex-1 relative rounded-lg overflow-hidden bg-slate-100"
                      >
                        {recipe.image ? (
                          <Image
                            src={recipe.image}
                            alt={recipe.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="material-symbols-outlined text-6xl text-gray-300">
                              restaurant
                            </span>
                          </div>
                        )}
                      </Link>

                      <div className="self-stretch h-36 flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
                          <Link
                            href={`/recipes/${recipe.id}`}
                            className="self-stretch flex flex-col justify-start items-start"
                          >
                            <div className="self-stretch justify-start text-gray-500 text-lg font-medium leading-7">
                              {recipe.name}
                            </div>
                            <div className="self-stretch h-9 justify-start text-gray-300 text-xs font-normal leading-4 line-clamp-2">
                              {recipe.description}
                            </div>
                          </Link>

                          <div className="inline-flex justify-start items-center gap-1.5">
                            <div className="px-1 py-1 bg-gray-200 rounded-sm flex justify-center items-center gap-2.5">
                              <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                {recipe.category}
                              </div>
                            </div>
                            <div className="px-1 py-0 bg-gray-200 rounded-sm flex justify-center items-center gap-2.5">
                              <div className="flex justify-start items-center gap-1">
                                <span className="material-symbols-outlined text-base text-gray-500">
                                  local_fire_department
                                </span>
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.nutrition.calories} kcal
                                </div>
                              </div>
                            </div>
                            <div className="px-1 py-0 bg-gray-200 rounded-sm flex justify-center items-center gap-2.5">
                              <div className="flex justify-start items-center gap-1">
                                <span className="material-symbols-outlined text-base text-gray-500">
                                  schedule
                                </span>
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.prepTime + recipe.cookTime} min
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="self-stretch inline-flex justify-between items-center">
                          {recipe.difficulty === "EASY" && (
                            <div className="px-1 py-px bg-success-light rounded-sm outline -outline-offset-1 outline-success-dark flex justify-center items-center gap-2.5">
                              <div className="flex justify-start items-center gap-3">
                                <span
                                  className="material-symbols-outlined text-base text-success-dark"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  chef_hat
                                </span>
                                <div className="justify-start text-success-dark text-xs font-medium leading-4">
                                  Easy
                                </div>
                              </div>
                            </div>
                          )}
                          {recipe.difficulty === "MEDIUM" && (
                            <div className="px-1 py-px bg-warning-light rounded-sm outline -outline-offset-1 outline-warning-dark flex justify-center items-center gap-2.5">
                              <div className="flex justify-start items-center gap-1">
                                <span
                                  className="material-symbols-outlined text-base text-warning-dark"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  chef_hat
                                </span>
                                <span
                                  className="material-symbols-outlined text-base text-warning-dark"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  chef_hat
                                </span>
                                <div className="justify-start text-warning-dark text-xs font-medium leading-4">
                                  Medium
                                </div>
                              </div>
                            </div>
                          )}
                          {recipe.difficulty === "HARD" && (
                            <div className="px-1 py-px bg-error-light rounded-sm outline -outline-offset-1 outline-error-dark flex justify-center items-center gap-2.5">
                              <div className="flex justify-start items-center gap-1">
                                <span
                                  className="material-symbols-outlined text-base text-error-dark"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  chef_hat
                                </span>
                                <span
                                  className="material-symbols-outlined text-base text-error-dark"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  chef_hat
                                </span>
                                <span
                                  className="material-symbols-outlined text-base text-error-dark"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  chef_hat
                                </span>
                                <div className="justify-start text-error-dark text-xs font-medium leading-4">
                                  Hard
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-start items-center gap-1.5">
                            {user ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(recipe.id);
                                }}
                                className="relative z-10 pointer-events-auto flex justify-start items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer"
                              >
                                <span
                                  className={`material-symbols-outlined text-base ${
                                    recipe.isFavorited
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                  style={{
                                    fontVariationSettings: recipe.isFavorited
                                      ? "'FILL' 1"
                                      : "'FILL' 0",
                                  }}
                                >
                                  favorite
                                </span>
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.favoritesCount > 1000
                                    ? `${(recipe.favoritesCount / 1000).toFixed(
                                        1
                                      )}K`
                                    : recipe.favoritesCount}
                                </div>
                              </button>
                            ) : (
                              <div className="flex justify-start items-center gap-1">
                                <span
                                  className="material-symbols-outlined text-base text-gray-500"
                                  style={{ fontVariationSettings: "'FILL' 0" }}
                                >
                                  favorite
                                </span>
                                <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                  {recipe.favoritesCount > 1000
                                    ? `${(recipe.favoritesCount / 1000).toFixed(
                                        1
                                      )}K`
                                    : recipe.favoritesCount}
                                </div>
                              </div>
                            )}
                            <div className="flex justify-start items-center gap-1">
                              <span
                                className="material-symbols-outlined text-base text-gray-500"
                                style={{ fontVariationSettings: "'FILL' 0" }}
                              >
                                visibility
                              </span>
                              <div className="justify-start text-gray-500 text-xs font-medium leading-4">
                                {recipe.views > 1000
                                  ? `${(recipe.views / 1000).toFixed(1)}K`
                                  : recipe.views}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <AppLayout>
      <RecipesContent />
    </AppLayout>
  );
}
