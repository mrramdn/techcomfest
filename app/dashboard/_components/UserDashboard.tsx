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
    <div className="p-16 pt-8 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Saved Recipes</h3>
            <span className="text-2xl">❤️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">24</p>
          <p className="text-sm text-blue-600 mt-2">View all recipes →</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Articles Read</h3>
            <span className="text-2xl">📖</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-blue-600 mt-2">Continue reading →</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Tracking Days</h3>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">7</p>
          <p className="text-sm text-green-600 mt-2">Keep it up!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Completed nutrition tracking</p>
                <p className="text-xs text-gray-500">Today at 2:30 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">❤️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Saved Healthy Smoothie Bowl</p>
                <p className="text-xs text-gray-500">Today at 10:15 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">📖</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Read Benefits of Green Tea</p>
                <p className="text-xs text-gray-500">Yesterday at 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Daily Goal</span>
                <span className="text-sm font-semibold text-gray-900">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Weekly Target</span>
                <span className="text-sm font-semibold text-gray-900">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Achievement</span>
                <span className="text-sm font-semibold text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-linear-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white">
        <h2 className="text-xl font-semibold mb-2">Ready to Track Today&apos;s Meal?</h2>
        <p className="text-sm text-blue-100 mb-4">Keep your streak going and reach your health goals!</p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
          Start Tracking
        </button>
      </div>
    </div>
  );
}
