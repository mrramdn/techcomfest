"use client";

import AppLayout, { useUser } from "../_components/AppLayout";
import AdminDashboard from "./_components/AdminDashboard";
import UserDashboard from "./_components/UserDashboard";

function DashboardContent() {
  const { user } = useUser();

  if (!user) return null;

  return user.role === "ADMIN" ? <AdminDashboard user={user} /> : <UserDashboard user={user} />;
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
