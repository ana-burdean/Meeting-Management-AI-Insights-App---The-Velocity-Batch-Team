import type { ProcessingStatus, TaskStatus } from '../../types';
import { TASK_STATUS_LABELS } from '../../types';

type BadgeStatus = ProcessingStatus | TaskStatus;

interface BadgeProps {
    status: BadgeStatus;
}

const TASK_STATUSES = new Set<string>(['OPEN', 'IN_PROGRESS', 'DONE', 'UNKNOWN']);

function getLabel(status: BadgeStatus): string {
    if (TASK_STATUSES.has(status)) {
        return TASK_STATUS_LABELS[status as TaskStatus];
    }
    return status;
}

export default function Badge({ status }: BadgeProps) {
    const className =
        status === 'COMPLETED' || status === 'DONE'
            ? 'bg-green-100 text-green-800 ring-green-200'
            : status === 'PROCESSING' || status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-800 ring-blue-200'
                : status === 'FAILED'
                    ? 'bg-red-100 text-red-800 ring-red-200'
                    : status === 'UNKNOWN'
                        ? 'bg-zinc-100 text-zinc-800 ring-zinc-200'
                        : 'bg-[#BCBD8B]/45 text-[#373D20] ring-[#BCBD8B]';

    return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${className}`}>{getLabel(status)}</span>;
}