import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { ActionItem, TaskStatus } from '../types';

const STATUS_OPTIONS: Array<'ALL' | TaskStatus> = ['ALL', 'OPEN', 'IN_PROGRESS', 'DONE', 'UNKNOWN'];
const GROUPS: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE', 'UNKNOWN'];

function statusClass(status: TaskStatus) {
  switch (status) {
    case 'DONE':
      return 'bg-green-100 text-green-800 ring-green-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 ring-blue-200';
    case 'UNKNOWN':
      return 'bg-zinc-100 text-zinc-800 ring-zinc-200';
    default:
      return 'bg-[#BCBD8B]/45 text-[#373D20] ring-[#BCBD8B]';
  }
}

function isOverdue(item: ActionItem) {
  if (!item.deadline || item.status === 'DONE') return false;
  return new Date(item.deadline).getTime() < new Date().setHours(0, 0, 0, 0);
}

export default function ActionItems() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<ActionItem>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadItems() {
    try {
      setLoading(true);
      setError('');
      const data = await api.actionItems.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load action items.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const assigneeName = item.assignee?.name?.toLowerCase() ?? '';
      const matchesAssignee = assigneeName.includes(assigneeSearch.toLowerCase());

      return matchesStatus && matchesAssignee;
    });
  }, [items, statusFilter, assigneeSearch]);

  const groupedItems = useMemo(() => {
    return GROUPS.map((status) => ({
      status,
      items: filteredItems.filter((item) => item.status === status),
    }));
  }, [filteredItems]);

  function startEditing(item: ActionItem) {
    setEditingId(item.id);
    setDraft({
      description: item.description,
      deadline: item.deadline,
      status: item.status,
      assignee: item.assignee,
      meeting: item.meeting,
    });
  }

  async function saveItem(item: ActionItem) {
    if (!draft.description?.trim()) {
      setError('Action item description cannot be empty.');
      return;
    }

    try {
      const updated = await api.actionItems.update(item.id, {
        ...item,
        description: draft.description,
        deadline: draft.deadline,
        status: draft.status ?? item.status,
      });

      setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? updated : currentItem)));
      setEditingId(null);
      setDraft({});
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update action item.');
    }
  }

  async function toggleDone(item: ActionItem) {
    const nextStatus: TaskStatus = item.status === 'DONE' ? 'OPEN' : 'DONE';

    try {
      const updated = await api.actionItems.update(item.id, { ...item, status: nextStatus });
      setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? updated : currentItem)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update action item.');
    }
  }

  async function deleteItem(id: number) {
    const confirmed = window.confirm('Delete this action item?');
    if (!confirmed) return;

    try {
      await api.actionItems.delete(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete action item.');
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[#373D20] p-6 text-[#EFF1ED] shadow-xl">
        <h2 className="mt-2 text-3xl font-black">To-Dos</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#EFF1ED]/80">
          Review, filter, edit, complete, and delete extracted meeting tasks.
        </p>
      </section>

      <section className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#BCBD8B]/50 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | TaskStatus)}
            className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Filter by assignee</span>
          <input
            value={assigneeSearch}
            onChange={(event) => setAssigneeSearch(event.target.value)}
            placeholder="Search assignee..."
            className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
          />
        </label>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && <p className="text-sm font-semibold text-[#717744]">Loading action items...</p>}

      <section className="grid gap-5 lg:grid-cols-4">
        {groupedItems.map((group) => (
          <div key={group.status} className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-[#BCBD8B]/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black">{group.status}</h3>
              <span className="rounded-full bg-[#EFF1ED] px-3 py-1 text-xs font-black text-[#717744]">
                {group.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {group.items.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl p-4 ring-1 ${
                    isOverdue(item) ? 'bg-red-50 ring-red-200' : 'bg-[#EFF1ED] ring-[#BCBD8B]/60'
                  }`}
                >
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={draft.description ?? ''}
                        onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                        rows={3}
                        className="w-full rounded-xl border border-[#BCBD8B] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#717744]"
                      />

                      <input
                        type="date"
                        value={draft.deadline ?? ''}
                        onChange={(event) => setDraft((current) => ({ ...current, deadline: event.target.value }))}
                        className="w-full rounded-xl border border-[#BCBD8B] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#717744]"
                      />

                      <select
                        value={draft.status ?? item.status}
                        onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as TaskStatus }))}
                        className="w-full rounded-xl border border-[#BCBD8B] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#717744]"
                      >
                        {GROUPS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={() => void saveItem(item)}
                          className="flex-1 rounded-xl bg-[#373D20] px-3 py-2 text-xs font-black text-[#EFF1ED]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setDraft({});
                          }}
                          className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#373D20]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold leading-6">{item.description}</p>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ring-1 ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-[#766153]">
                        <p>
                          <strong>Assignee:</strong> {item.assignee?.name || 'Unassigned'}
                        </p>
                        <p>
                          <strong>Deadline:</strong> {item.deadline || 'No deadline'}
                        </p>
                        {isOverdue(item) && <p className="font-black text-red-700">Overdue</p>}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => void toggleDone(item)}
                          className="rounded-xl bg-[#BCBD8B] px-2 py-2 text-xs font-black text-[#373D20]"
                        >
                          {item.status === 'DONE' ? 'Open' : 'Done'}
                        </button>
                        <button
                          onClick={() => startEditing(item)}
                          className="rounded-xl bg-white px-2 py-2 text-xs font-black text-[#373D20] ring-1 ring-[#BCBD8B]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void deleteItem(item.id)}
                          className="rounded-xl bg-red-50 px-2 py-2 text-xs font-black text-red-700 ring-1 ring-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}

              {group.items.length === 0 && (
                <div className="rounded-2xl bg-[#EFF1ED] p-4 text-center text-sm text-[#766153]">
                  No items.
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}