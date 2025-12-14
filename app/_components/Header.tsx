"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const ADMIN_MENU_ITEMS = [
  { name: "Recipes", path: "/recipes", icon: "book_2" },
  { name: "Articles", path: "/articles", icon: "auto_stories" },
  { name: "Forum", path: "/forum", icon: "chat_bubble" },
];

const USER_MENU_ITEMS = [
  { name: "Track", path: "/track", icon: "conversion_path" },
  { name: "Recipes", path: "/recipes", icon: "book_2" },
  { name: "Articles", path: "/articles", icon: "auto_stories" },
  { name: "Forum", path: "/forum", icon: "chat_bubble" },
];

interface HeaderProps {
  user: User;
  currentPath: string;
}

export default function Header({ user, currentPath }: HeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth?mode=signin");
  };

  const isActive = (path: string) => currentPath === path;

  const menuItems = user?.role === "ADMIN" ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

  return (
    <>
      <div className="flex-1 px-5 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
        {/* Mobile burger + logo */}
        <div className="lg:hidden flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <svg className="size-6" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="size-6" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <button onClick={() => router.push("/")} className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="size-8 rounded-lg overflow-hidden">
              <Image src="/images/icon/logo.png" alt="Lahap Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-gray-200">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`h-9 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                isActive(item.path) ? "bg-white text-blue-500 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? "text-blue-500" : "text-gray-500"}`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Search + Profile */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 h-9 px-3 bg-slate-100 rounded-lg border border-gray-200">
            <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-32 lg:w-48 text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 h-9 px-3 bg-slate-100 rounded-lg border border-gray-200 hover:bg-slate-200 transition-colors"
            >
              <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
              <svg className={`size-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-blue-500 mt-1">{user.role}</p>
                </div>
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full h-11 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                    isActive(item.path) ? "bg-blue-50 text-blue-500" : "text-gray-500 hover:bg-slate-50"
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? "text-blue-500" : "text-gray-500"}`}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
