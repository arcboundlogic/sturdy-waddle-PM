export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface-secondary p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          <span className="text-xl">🐧</span>
          <span className="font-bold text-slate-900">Waddle PM</span>
        </div>
        <nav className="mt-6 space-y-1">
          <SidebarItem icon="📋" label="My Work" active />
          <SidebarItem icon="📁" label="Projects" />
          <SidebarItem icon="🏃" label="Sprints" />
          <SidebarItem icon="📊" label="Dashboards" />
          <SidebarItem icon="📖" label="Wiki" />
          <SidebarItem icon="⚙️" label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Work</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome to your dashboard. Your tasks and projects will appear here.
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-surface-secondary p-16 text-center">
          <span className="text-5xl">🚀</span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No tasks yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your first project and start tracking work.
          </p>
          <button className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Create Project
          </button>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-brand-50 font-medium text-brand-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
