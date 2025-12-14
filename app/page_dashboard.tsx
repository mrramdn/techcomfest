"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./dashboard/_components/AdminDashboard";
import UserDashboard from "./dashboard/_components/UserDashboard";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/auth?mode=signin");
          return;
        }
        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth?mode=signin");
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return user.role === "ADMIN" ? <AdminDashboard user={user} /> : <UserDashboard user={user} />;
}
