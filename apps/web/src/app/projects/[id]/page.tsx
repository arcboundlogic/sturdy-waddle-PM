'use client';

import { useState } from 'react';

interface WorkItem {
  id: string;
  title: string;
  type: string;
  priority: string;
  assigneeId?: string;
  number: number;
}

const COLUMNS = ['Todo', 'In Progress', 'In Review', 'Done'];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-600',
  none: 'bg-slate-100 text-slate-400',
};

function WorkItemCard({ item }: { item: WorkItem }) {
  return (
    <div className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-slate-400">#{item.number}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS['none']}`}
        >
          {item.priority}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-slate-800">{item.title}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{item.type}</span>
        {item.assigneeId && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            A
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage({ params }: { params: { id: string } }) {
  const [items] = useState<WorkItem[]>([]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Kanban Board</h1>
        <p className="text-sm text-slate-500">Project: {params.id}</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {COLUMNS.map((column) => (
          <div key={column} className="w-72 flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{column}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {items.filter(() => false).length}
              </span>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-100 p-2 min-h-[200px]">
              {items
                .filter(() => false) // Will be filtered by column status
                .map((item) => (
                  <WorkItemCard key={item.id} item={item} />
                ))}

              <button className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-500">
                + Add item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
