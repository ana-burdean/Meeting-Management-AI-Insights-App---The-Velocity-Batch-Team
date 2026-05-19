import { useState } from 'react';
import type { ActionItem, TaskStatus } from '../../types';
import Badge from "../atoms/Badge";
import Button from "../atoms/Button";

interface ActionItemCardProps {
  item: ActionItem;
  onSave: (item: ActionItem, draft: Partial<ActionItem>) => Promise<void>;
  onToggleDone: (item: ActionItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE', 'UNKNOWN'];

function isOverdue(item: ActionItem) {
  if (!item.deadline || item.status === 'DONE') return false;
  return new Date(item.deadline).getTime() < new Date().setHours(0, 0, 0, 0);
}

export default function ActionItemCard({ item, onSave, onToggleDone, onDelete }: ActionItemCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<ActionItem>>({
    description: item.description,
    deadline: item.deadline,
    status: item.status,
  });

  if (editing) {
    return (
      <article className="rounded-2xl bg-[#EFF1ED] p-4 ring-1 ring-[#BCBD8B]/60">
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
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                void onSave(item, draft);
                setEditing(false);
              }}
              className="flex-1 rounded-xl px-3 py-2 text-xs"
            >
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-xl px-3 py-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl p-4 ring-1 ${
        isOverdue(item) ? 'bg-red-50 ring-red-200' : 'bg-[#EFF1ED] ring-[#BCBD8B]/60'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-6">{item.description}</p>
          <Badge status={item.status} />
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
          <Button variant="accent" onClick={() => void onToggleDone(item)} className="rounded-xl px-2 py-2 text-xs">
            {item.status === 'DONE' ? 'Open' : 'Done'}
          </Button>
          <Button variant="secondary" onClick={() => setEditing(true)} className="rounded-xl px-2 py-2 text-xs">
            Edit
          </Button>
          <Button variant="danger" onClick={() => void onDelete(item.id)} className="rounded-xl px-2 py-2 text-xs">
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}