"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function NotFound() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Define links based on user role
  const getQuickLinks = () => {
    const baseLinks = [
      { name: "Home", path: "/", icon: "home" },
      { name: "Recipes", path: "/recipes", icon: "book_2" },
      { name: "Articles", path: "/articles", icon: "auto_stories" },
      { name: "Forum", path: "/forum", icon: "chat_bubble" },
    ];

    if (user?.role === "USER") {
      return [
        { name: "Home", path: "/", icon: "home" },
        { name: "Track", path: "/track", icon: "conversion_path" },
        ...baseLinks.slice(1),
      ];
    }

    if (user?.role === "ADMIN") {
      return baseLinks;
    }

    // If not logged in, show all links
    return [
      { name: "Home", path: "/", icon: "home" },
      { name: "Track", path: "/track", icon: "conversion_path" },
      { name: "Recipes", path: "/recipes", icon: "book_2" },
      { name: "Articles", path: "/articles", icon: "auto_stories" },
      { name: "Forum", path: "/forum", icon: "chat_bubble" },
    ];
  };

  const quickLinks = getQuickLinks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo and 404 */}
        <div className="mb-8 flex flex-col items-center gap-6">
          <div className="size-16 rounded-xl overflow-hidden">
            <Image
              src="/images/icon/logo.png"
              alt="Lahap Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-8xl md:text-9xl font-bold text-gray-300 select-none">
            404
          </div>
        </div>

        {/* Main message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Looks like this page got lost in the kitchen! 👨‍🍳
          </p>
          <p className="text-base text-gray-500">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="h-11 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-base font-medium transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg inline-block mr-2 align-middle">
              home
            </span>
            Go to Home
          </button>
          <button
            onClick={() => router.back()}
            className="h-11 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-base font-medium transition-all border border-gray-200 hover:border-gray-300 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg inline-block mr-2 align-middle">
              arrow_back
            </span>
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-700 font-medium mb-4">Quick Links</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {link.icon}
                </span>
                {link.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-sm text-gray-500">
          Error Code: 404 | Page Not Found
        </div>
      </div>
    </div>
  );
}
