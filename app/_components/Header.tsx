"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import NoticeModal from "./NoticeModal";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string | null;
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
  onFloatingChange?: (open: boolean) => void;
}

export default function Header({ user, currentPath, onFloatingChange }: HeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLogoutSuccessOpen, setIsLogoutSuccessOpen] = useState(false);
  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
  };

  useEffect(() => {
    onFloatingChange?.(isDropdownOpen || isSidebarOpen);
  }, [isDropdownOpen, isSidebarOpen, onFloatingChange]);

  const handleGo = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
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
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-gray-200">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`h-9 px-3 py-2 rounded-md flex items-center gap-1.5 transition-colors ${
                isActive(item.path) ? "bg-white text-blue-500 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? "text-blue-500" : "text-gray-500"}`}>{item.icon}</span>
              <span className="text-sm font-normal">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Search + Profile */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 h-12 w-96 pl-4 bg-slate-100 rounded-lg border border-gray-200">
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
              className="h-12 w-64 px-1 flex items-center justify-between rounded-lg border border-gray-200 hover:bg-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3 justify-start min-w-0">
                <div className="size-9 rounded-sm overflow-hidden flex items-center justify-start outline -outline-offset-1 outline-gray-300 shrink-0">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={`${user.name} profile picture`}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{userInitial}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start justify-start min-w-0 w-full text-left">
                  <span className="text-sm font-medium text-gray-700 leading-5 truncate w-full text-left">{user.name}</span>
                  <span className="text-xs text-gray-500 leading-4 truncate w-full text-left">{user.email}</span>
                </div>
              </div>

              <svg className={`size-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 z-50 inline-flex flex-col justify-start items-start shadow-lg">
                <button
                  type="button"
                  onClick={() => handleGo("/profile")}
                  className="w-64 h-8 px-2 bg-white rounded-tl-xl rounded-tr-xl border-l border-r border-t border-gray-300 inline-flex justify-start items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-gray-500">person_edit</span>
                  <span className="text-gray-500 text-sm font-normal leading-5">Edit profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGo("/profile/password")}
                  className="w-64 h-8 px-2 bg-white border-l border-r border-gray-300 inline-flex justify-start items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-gray-500">password</span>
                  <span className="text-gray-500 text-sm font-normal leading-5">Change password</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsDropdownOpen(false);
                    setIsLogoutOpen(true);
                  }}
                  className="w-64 h-8 px-2 bg-white rounded-bl-xl rounded-br-xl border-l border-r border-b border-gray-300 inline-flex justify-start items-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-gray-500">logout</span>
                  <span className="text-gray-500 text-sm font-normal leading-5">Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full h-12 px-4 rounded-lg flex items-center gap-3 transition-colors ${
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

      <ConfirmModal
        open={isLogoutOpen}
        title="🚪 Log Out Now?"
        description="Are you sure you want to log out of your account? You’ll need to sign in again to continue using the app."
        confirmText="Log out"
        cancelText="Cancel"
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={async () => {
          setIsLogoutOpen(false);
          await handleLogout();
          setIsLogoutSuccessOpen(true);
        }}
      />

      <NoticeModal
        open={isLogoutSuccessOpen}
        title="✅ Logged out"
        description="You have been logged out successfully."
        buttonText="Sign in"
        autoCloseMs={1200}
        onClose={() => {
          setIsLogoutSuccessOpen(false);
          router.push("/auth?mode=signin");
        }}
      />
    </>
  );
}
