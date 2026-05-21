import type { ActionItem, TaskStatus } from '../../types';
import { TASK_STATUS_LABELS } from '../../types';
import ActionItemCard from '../molecules/ActionItemCard';

interface ActionItemsBoardProps {
    items: ActionItem[];
    statusFilter: 'ALL' | TaskStatus;
    onSave: (item: ActionItem, draft: Partial<ActionItem>) => Promise<void>;
    onToggleDone: (item: ActionItem) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const GROUPS: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];

interface ColumnProps {
    status: TaskStatus;
    items: ActionItem[];
    onSave: ActionItemsBoardProps['onSave'];
    onToggleDone: ActionItemsBoardProps['onToggleDone'];
    onDelete: ActionItemsBoardProps['onDelete'];
}

function Column({ status, items, onSave, onToggleDone, onDelete }: ColumnProps) {
    return (
        <div className="flex max-h-[70vh] flex-col rounded-[2rem] bg-white shadow-sm ring-1 ring-[#BCBD8B]/50">
            {/* Sticky column header */}
            <div className="flex flex-shrink-0 items-center justify-between rounded-t-[2rem] bg-white px-5 py-4 border-b border-[#BCBD8B]/30">
                <h3 className="font-black">{TASK_STATUS_LABELS[status]}</h3>
                <span className="rounded-full bg-[#EFF1ED] px-3 py-1 text-xs font-black text-[#717744]">
                    {items.length}
                </span>
            </div>

            {/* Scrollable cards */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {items.map((item) => (
                        <ActionItemCard
                            key={item.id}
                            item={item}
                            onSave={onSave}
                            onToggleDone={onToggleDone}
                            onDelete={onDelete}
                        />
                    ))}
                    {items.length === 0 && (
                        <div className="rounded-2xl bg-[#EFF1ED] p-4 text-center text-sm text-[#766153]">
                            No items.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ActionItemsBoard({ items, statusFilter, onSave, onToggleDone, onDelete }: ActionItemsBoardProps) {

    if (statusFilter === 'ALL') {
        return (
            <section className="grid gap-5 lg:grid-cols-3">
                {GROUPS.map((status) => (
                    <Column
                        key={status}
                        status={status}
                        items={items.filter((item) => item.status === status)}
                        onSave={onSave}
                        onToggleDone={onToggleDone}
                        onDelete={onDelete}
                    />
                ))}
            </section>
        );
    }

    // Single status filter — show scrollable container with grid inside
    const singleStatus = statusFilter as TaskStatus;

    return (
        <div className="flex max-h-[70vh] flex-col rounded-[2rem] bg-white shadow-sm ring-1 ring-[#BCBD8B]/50">
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between rounded-t-[2rem] bg-white px-5 py-4 border-b border-[#BCBD8B]/30">
                <h3 className="font-black">{TASK_STATUS_LABELS[singleStatus]}</h3>
                <span className="rounded-full bg-[#EFF1ED] px-3 py-1 text-xs font-black text-[#717744]">
                    {items.length}
                </span>
            </div>

            {/* Scrollable grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                    <div className="rounded-2xl bg-[#EFF1ED] p-4 text-center text-sm text-[#766153]">
                        No items.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <ActionItemCard
                                key={item.id}
                                item={item}
                                onSave={onSave}
                                onToggleDone={onToggleDone}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}