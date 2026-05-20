import type { ActionItem, TaskStatus } from '../../types';
import { TASK_STATUS_LABELS } from '../../types';
import ActionItemCard from '../molecules/ActionItemCard';

interface ActionItemsBoardProps {
  items: ActionItem[];
  onSave: (item: ActionItem, draft: Partial<ActionItem>) => Promise<void>;
  onToggleDone: (item: ActionItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const GROUPS: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE', 'UNKNOWN'];

export default function ActionItemsBoard({ items, onSave, onToggleDone, onDelete }: ActionItemsBoardProps) {
  const groupedItems = GROUPS.map((status) => ({
    status,
    items: items.filter((item) => item.status === status),
  }));

  return (
    <section className="grid gap-5 lg:grid-cols-4">
      {groupedItems.map((group) => (
        <div key={group.status} className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-[#BCBD8B]/50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black">{TASK_STATUS_LABELS[group.status]}</h3>
            <span className="rounded-full bg-[#EFF1ED] px-3 py-1 text-xs font-black text-[#717744]">
              {group.items.length}
            </span>
          </div>

          <div className="space-y-3">
            {group.items.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                onSave={onSave}
                onToggleDone={onToggleDone}
                onDelete={onDelete}
              />
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
  );
}