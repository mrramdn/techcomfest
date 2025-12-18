"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminDashboard from "./_components/AdminDashboard";
import UserDashboard from "./_components/UserDashboard";
import Header from "./_components/Header";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string | null;
}

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex w-full relative">
          {/* Sidebar Logo desktop */}
          <button
            onClick={() => router.push("/")}
            className="hidden lg:flex w-64 h-20 bg-white border-b border-r border-gray-200 items-center px-5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-lg overflow-hidden">
                <Image
                  src="/images/icon/logo.png"
                  alt="Lahap Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-black text-lg font-semibold">Lahap</div>
            </div>
          </button>

          {/* Header */}
          <Header user={user} currentPath="/" />
        </div>

        {/* Main content */}
        <div className="flex-1">
          {user.role === "ADMIN" ? (
            <AdminDashboard user={user} />
          ) : (
            <UserDashboard user={user} />
          )}
        </div>
      </div>
    );
  }

  // If not logged in, show landing page
  return (
    <main className="relative h-screen overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/images/landing/bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 sm:px-6 gap-8 sm:gap-12">
        <div className="inline-flex justify-center items-center gap-3 sm:gap-4">
          <div className="size-8 sm:size-10 rounded-lg overflow-hidden">
            <Image
              src="/images/icon/logo.png"
              alt="Lahap Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="justify-start text-black text-sm sm:text-base font-bold leading-5 sm:leading-6">
            Lahap
          </div>
        </div>
        <div className="w-full max-w-lg p-4 sm:p-5 bg-gray-500/10 rounded-2xl sm:rounded-4xl ring-1 ring-white/30 backdrop-blur-sm inline-flex justify-start items-center gap-2.5">
          <div className="w-full inline-flex flex-col justify-start items-center gap-6 sm:gap-8">
            <div className="px-3 sm:px-3.5 py-1 sm:py-1.5 bg-white rounded-full flex flex-col justify-center items-center gap-2.5">
              <div className="inline-flex justify-start items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-3.5 sm:size-4 text-sky-700 fill-current"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line
                    x1="12"
                    y1="7"
                    x2="12"
                    y2="13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="17" r="1.5" fill="currentColor" />
                </svg>
                <div className="text-sky-700 text-xs font-medium leading-4">
                  What we do
                </div>
              </div>
            </div>
            <div className="w-full text-center justify-start text-black text-2xl sm:text-3xl md:text-4xl font-semibold leading-7 sm:leading-9 md:leading-10">
              Say Goodbye to Mealtime Battles!
            </div>
            <div className="self-stretch px-4 sm:px-6 py-5 sm:py-7 bg-white rounded-xl flex flex-col justify-start items-start gap-6">
              <div className="w-full text-center justify-start text-black text-base sm:text-lg md:text-xl font-medium leading-6 sm:leading-7 md:leading-8">
                Our platform is designed to support parents navigating the
                challenges that often arise during a child&apos;s feeding
                journey especially when entering solid foods or experiencing
                Feeding Refusal behaviors such as mouth closing. We understand
                that this phase can feel overwhelming, confusing, and
                emotionally draining for many parents. experience for their
                child.
              </div>
            </div>
            <div className="self-stretch inline-flex flex-col sm:flex-row justify-start items-center gap-3">
              <a
                href="/auth?mode=signin"
                className="w-full sm:flex-1 h-11 px-6 sm:px-12 md:px-20 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl flex justify-center items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="text-center justify-start text-black text-base sm:text-lg font-medium leading-6 sm:leading-7">
                  Sign in
                </div>
              </a>
              <a
                href="/auth?mode=signup"
                className="w-full sm:flex-1 h-11 px-6 sm:px-12 md:px-20 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl flex justify-center items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="text-center justify-start text-white text-base sm:text-lg font-medium leading-6 sm:leading-7">
                  Sign up
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
