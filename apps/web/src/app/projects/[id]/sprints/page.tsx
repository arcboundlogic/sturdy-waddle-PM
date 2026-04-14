export default function SprintBacklogPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sprint Backlog</h1>
          <p className="text-sm text-slate-500">Project: {params.id}</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Start Sprint
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="grid grid-cols-12 text-xs font-medium uppercase text-slate-500">
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-1">Points</div>
            <div className="col-span-1">Assignee</div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Sprint items will be populated from API */}
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No items in this sprint yet. Add items from the backlog.
          </div>
        </div>
      </div>
    </div>
  );
}
