'use client';

interface WorkItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
}

export function WorkItemDrawer({ isOpen, onClose, itemId }: WorkItemDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Work Item</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {itemId ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-xs font-medium uppercase text-slate-500">Title</label>
                <p className="mt-1 text-lg font-medium text-slate-900">Loading...</p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase text-slate-500">Status</label>
                  <div className="mt-1">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      In Progress
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-slate-500">Priority</label>
                  <div className="mt-1">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                      High
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-slate-500">Assignee</label>
                  <p className="mt-1 text-sm text-slate-700">Unassigned</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-slate-500">Due Date</label>
                  <p className="mt-1 text-sm text-slate-700">Not set</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium uppercase text-slate-500">Description</label>
                <p className="mt-1 text-sm text-slate-600">No description provided.</p>
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-medium uppercase text-slate-500">Comments</label>
                <div className="mt-3 space-y-3">
                  <textarea
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Leave a comment..."
                    rows={3}
                  />
                  <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                    Comment
                  </button>
                </div>
              </div>

              {/* Activity */}
              <div>
                <label className="text-xs font-medium uppercase text-slate-500">Activity</label>
                <p className="mt-2 text-sm text-slate-400">No activity yet.</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No item selected.</p>
          )}
        </div>
      </div>
    </>
  );
}
