"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "../_components/Header";
import Image from "next/image";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/auth?mode=signin");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/auth?mode=signin");
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
              <Image src="/images/icon/logo.png" alt="Lahap Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <div className="text-black text-lg font-semibold">Lahap</div>
          </div>
        </button>

        {/* Header */}
        <Header user={user} currentPath={pathname} />
      </div>

      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
