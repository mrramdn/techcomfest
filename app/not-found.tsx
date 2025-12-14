"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 with food emoji */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-gray-200 select-none">404</div>
        </div>

        {/* Main message */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Looks like this recipe got lost in the kitchen! 👨‍🍳
          </p>
          <p className="text-lg text-gray-500">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="h-12 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🏠 Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="h-12 px-8 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-lg font-medium transition-all border-2 border-gray-200 hover:border-gray-300"
          >
            ← Go Back
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-4">Need help finding something?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              🏡 Home
            </button>
            <button
              onClick={() => router.push("/recipes")}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              🍳 Recipes
            </button>
            <button
              onClick={() => router.push("/articles")}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              📰 Articles
            </button>
            <button
              onClick={() => router.push("/track")}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              📝 Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
