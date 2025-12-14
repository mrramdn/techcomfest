import AppLayout from "../_components/AppLayout";

export default function RecipesPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Recipes</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">Recipe content will be displayed here.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
