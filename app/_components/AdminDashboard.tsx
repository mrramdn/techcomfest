"use client";

interface AdminDashboardProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
        </div>
        <a
          href="/recipes"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Manage Recipes
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">1,234</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Recipes</h3>
            <span className="text-2xl">🍳</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">567</p>
          <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Articles</h3>
            <span className="text-2xl">📰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">89</p>
          <p className="text-sm text-green-600 mt-2">↑ 5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Today</h3>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">342</p>
          <p className="text-sm text-blue-600 mt-2">Users online now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">👤</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">🍳</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New recipe added</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">📰</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Article published</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">User Engagement</span>
                <span className="text-sm font-semibold text-gray-900">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Content Quality</span>
                <span className="text-sm font-semibold text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">System Health</span>
                <span className="text-sm font-semibold text-gray-900">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
