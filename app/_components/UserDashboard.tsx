"use client";

interface UserDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function UserDashboard({ user }: UserDashboardProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-sm text-gray-500">Welcome back</p>
        <h1 className="text-3xl font-semibold text-gray-900">
          {user.name}
        </h1>
      </div>
    </div>
  );
}
