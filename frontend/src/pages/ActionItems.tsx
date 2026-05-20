import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Field from '../components/atoms/Field';
import Loader from '../components/atoms/Loader';
import ActionItemsBoard from '../components/organisms/ActionItemsBoard';
import { api } from '../services/api';
import type { ActionItem, TaskStatus } from '../types';
import { TASK_STATUS_LABELS } from '../types';

const STATUS_OPTIONS: Array<'ALL' | TaskStatus> = ['ALL', 'OPEN', 'IN_PROGRESS', 'DONE'];

const selectClassName =
    'w-full appearance-none rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-6 py-3 pr-14 outline-none focus:ring-2 focus:ring-[#717744]';

export default function ActionItems() {
    const [items, setItems] = useState<ActionItem[]>([]);
    const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
    const [assigneeSearch, setAssigneeSearch] = useState('');
    const [meetingSearch, setMeetingSearch] = useState('');
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
            const meetingTitle = item.meeting?.title?.toLowerCase() ?? '';
            const matchesMeeting = meetingTitle.includes(meetingSearch.toLowerCase());
            return matchesStatus && matchesAssignee && matchesMeeting;
        });
    }, [items, statusFilter, assigneeSearch, meetingSearch]);

    async function saveItem(item: ActionItem, draft: Partial<ActionItem>) {
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
            setItems((current) => current.map((c) => (c.id === item.id ? updated : c)));
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update action item.');
        }
    }

    async function toggleDone(item: ActionItem) {
        const nextStatus: TaskStatus = item.status === 'DONE' ? 'OPEN' : 'DONE';
        try {
            const updated = await api.actionItems.update(item.id, { ...item, status: nextStatus });
            setItems((current) => current.map((c) => (c.id === item.id ? updated : c)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update action item.');
        }
    }

    async function deleteItem(id: number) {
        try {
            await api.actionItems.delete(id);
            setItems((current) => current.filter((item) => item.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete action item.');
        }
    }

    return (
        <div className="space-y-8">
            <section className="rounded-[2rem] bg-[#373D20] px-8 py-10 text-center text-[#EFF1ED] shadow-xl">
                <h2 className="text-3xl font-black">Action Items / To-Dos</h2>
                <p className="mt-3 text-sm text-[#EFF1ED]/80">
                    Review, filter, edit, complete, and delete extracted meeting tasks.
                </p>
            </section>

            <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#BCBD8B]/50 md:grid-cols-3">
                <Field label="Filter by status">
                    <div className="relative">
                        <select
                            title="Filter by status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TaskStatus)}
                            className={selectClassName}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s === 'ALL' ? 'All' : TASK_STATUS_LABELS[s]}
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
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    placeholder="Search assignee..."
                />

                <Field
                    label="Filter by meeting"
                    value={meetingSearch}
                    onChange={(e) => setMeetingSearch(e.target.value)}
                    placeholder="Search meeting title..."
                />
            </section>

            <ErrorMessage message={error} />
            {loading && <Loader text="Loading action items..." />}

            <ActionItemsBoard
                items={filteredItems}
                statusFilter={statusFilter}
                onSave={saveItem}
                onToggleDone={toggleDone}
                onDelete={deleteItem}
            />
        </div>
    );
}