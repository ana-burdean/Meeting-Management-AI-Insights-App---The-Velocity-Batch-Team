import type { ProcessingStatus } from '../../types';
import Field from '../atoms/Field';
import { ChevronDown } from 'lucide-react';

interface MeetingFiltersProps {
  search: string;
  statusFilter: 'ALL' | ProcessingStatus;
  sortBy: 'date-desc' | 'date-asc' | 'title-asc';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'ALL' | ProcessingStatus) => void;
  onSortChange: (value: 'date-desc' | 'date-asc' | 'title-asc') => void;
}

const STATUS_OPTIONS: Array<'ALL' | ProcessingStatus> = [
  'ALL',
  'IDLE',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
];

const selectClassName =
  'w-full appearance-none rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-6 py-3 pr-14 outline-none focus:ring-2 focus:ring-[#717744]';

export default function MeetingFilters({
  search,
  statusFilter,
  sortBy,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: MeetingFiltersProps) {
  return (
    <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#BCBD8B]/50 md:grid-cols-3">
      <Field
        label="Search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search title, description, transcript..."
      />

      <Field label="Status">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as 'ALL' | ProcessingStatus)
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

      <Field label="Sort">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(
                event.target.value as 'date-desc' | 'date-asc' | 'title-asc'
              )
            }
            className={selectClassName}
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="title-asc">Title A-Z</option>
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#717744]"
          />
        </div>
      </Field>
    </section>
  );
}