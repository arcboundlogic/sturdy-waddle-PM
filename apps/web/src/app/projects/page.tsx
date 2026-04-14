export default function ProjectsPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Project cards will be populated from API */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <span className="text-3xl">📁</span>
          <p className="mt-3 text-sm text-slate-500">No projects yet. Create your first project.</p>
        </div>
      </div>
    </div>
  );
}
