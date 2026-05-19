import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Field from '../components/atoms/Field';
import Loader from '../components/atoms/Loader';
import ActionItemsBoard from '../components/organisms/ActionItemsBoard';
import { api } from '../services/api';
import type { ActionItem, TaskStatus } from '../types';

const STATUS_OPTIONS: Array<'ALL' | TaskStatus> = [
  'ALL',
  'OPEN',
  'IN PROGRESS',
  'DONE',
  'UNKNOWN',
];

const selectClassName =
  'w-full appearance-none rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-6 py-3 pr-14 outline-none focus:ring-2 focus:ring-[#717744]';

export default function ActionItems() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [assigneeSearch, setAssigneeSearch] = useState('');
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
      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      const assigneeName =
        item.assignee?.name?.toLowerCase() ?? '';

      const matchesAssignee =
        assigneeName.includes(assigneeSearch.toLowerCase());

      return matchesStatus && matchesAssignee;
    });
  }, [items, statusFilter, assigneeSearch]);

  async function saveItem(
    item: ActionItem,
    draft: Partial<ActionItem>
  ) {
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

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );

      setError('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update action item.'
      );
    }
  }

  async function toggleDone(item: ActionItem) {
    const nextStatus: TaskStatus =
      item.status === 'DONE' ? 'OPEN' : 'DONE';

    try {
      const updated = await api.actionItems.update(item.id, {
        ...item,
        status: nextStatus,
      });

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update action item.'
      );
    }
  }

  async function deleteItem(id: number) {
    const confirmed = window.confirm(
      'Delete this action item?'
    );

    if (!confirmed) return;

    try {
      await api.actionItems.delete(id);

      setItems((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete action item.'
      );
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[#373D20] px-8 py-10 text-center text-[#EFF1ED] shadow-xl">
        <h2 className="text-3xl font-black">
          Action Items / To-Dos
        </h2>

        <p className="mt-3 text-sm text-[#EFF1ED]/80">
          Review, filter, edit, complete, and delete extracted meeting tasks.
        </p>
      </section>

      <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#BCBD8B]/50 md:grid-cols-2">
        <Field label="Filter by status">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'ALL' | TaskStatus
                )
              }
              className={selectClassName}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#717744]"
            />
          </div>
        </Field>

        <Field
          label="Filter by assignee"
          value={assigneeSearch}
          onChange={(event) =>
            setAssigneeSearch(event.target.value)
          }
          placeholder="Search assignee..."
        />
      </section>

      <ErrorMessage message={error} />

      {loading && (
        <Loader text="Loading action items..." />
      )}

      <ActionItemsBoard
        items={filteredItems}
        onSave={saveItem}
        onToggleDone={toggleDone}
        onDelete={deleteItem}
      />
    </div>
  );
}