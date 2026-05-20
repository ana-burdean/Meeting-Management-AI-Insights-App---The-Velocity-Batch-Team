import type { Meeting } from '../../types';
import Badge from "../atoms/Badge";

interface MeetingCardProps {
    meeting: Meeting;
    isSelected: boolean;
    onClick: () => void;
}

function formatDate(date?: string) {
    if (!date) return 'No date';
    return new Date(date).toLocaleString();
}

export default function MeetingCard({ meeting, isSelected, onClick }: MeetingCardProps) {
    return (
        <article
            className={`cursor-pointer rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? 'ring-[#373D20]' : 'ring-[#BCBD8B]/50'
            }`}
            onClick={onClick}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-xl font-black text-[#373D20]">{meeting.title}</h3>
                    <p className="mt-1 text-sm text-[#766153]">{formatDate(meeting.meetingDate)}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-[#373D20]/75">
                        {meeting.description || 'No description provided.'}
                    </p>
                </div>

                <Badge status={meeting.processingStatus} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#717744]">
                <span className="rounded-full bg-[#EFF1ED] px-3 py-1">{meeting.participants?.length ?? 0} attendees</span>
                <span className="rounded-full bg-[#EFF1ED] px-3 py-1">{meeting.actionItems?.length ?? 0} action items</span>
            </div>
        </article>
    );
}