import type { Meeting } from '../../types';
import Button from '../atoms/Button';

interface MeetingDetailsPanelProps {
    selectedMeeting: Meeting | null;
    processingId: number | null;
    onClose: () => void;
    onDelete: (id: number) => void;
    onProcess: (meeting: Meeting) => void;
}

function formatDate(date?: string) {
    if (!date) return 'No date';
    return new Date(date).toLocaleString();
}

export default function MeetingDetailsPanel({
                                                selectedMeeting,
                                                processingId,
                                                onClose,
                                                onDelete,
                                                onProcess,
                                            }: MeetingDetailsPanelProps) {
    if (!selectedMeeting) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#373D20]/65 p-4 backdrop-blur-sm">
            <aside className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-[#BCBD8B]/50">

                {/* Sticky header */}
                <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-[#BCBD8B]/50 bg-white px-6 py-5">
                    <div>
                        <h3 className="text-2xl font-black">{selectedMeeting.title}</h3>
                        <p className="text-sm text-[#766153]">{formatDate(selectedMeeting.meetingDate)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="danger"
                            onClick={() => onDelete(selectedMeeting.id)}
                            className="rounded-xl px-3 py-2 text-xs"
                        >
                            Delete
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="rounded-xl px-3 py-2 text-xs"
                        >
                            ✕
                        </Button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto px-6 py-6">
                    <div className="space-y-6">

                        <section>
                            <h4 className="font-black">Attendees</h4>

                            <div className="mt-2 rounded-2xl bg-[#EFF1ED] p-4">
                                {selectedMeeting.participants && selectedMeeting.participants.length > 0 ? (
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {selectedMeeting.participants.map((participant) => (
                                            <li
                                                key={participant.id ?? participant.name}
                                                className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
                                            >
                                                <p className="font-black text-[#373D20]">{participant.name}</p>
                                                <p className="text-xs text-[#766153]">
                                                    {participant.email || 'No email'}
                                                    {participant.participantRole ? ` • ${participant.participantRole}` : ''}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-[#766153]">No attendees added.</p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h4 className="font-black">Transcript</h4>
                            <p className="mt-2 max-h-48 overflow-auto rounded-2xl bg-[#EFF1ED] p-4 text-sm leading-6">
                                {selectedMeeting.rawTranscript || 'No transcript added.'}
                            </p>
                        </section>

                        <Button
                            onClick={() => onProcess(selectedMeeting)}
                            disabled={processingId === selectedMeeting.id || !selectedMeeting.rawTranscript?.trim()}
                            className="w-full py-3"
                        >
                            {processingId === selectedMeeting.id ? 'Processing transcript...' : 'Process Transcript'}
                        </Button>

                        <section className="space-y-3">
                            <h4 className="font-black">AI Results</h4>

                            <div className="rounded-2xl bg-[#EFF1ED] p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[#717744]">Summary</p>
                                <p className="mt-2 text-sm">{selectedMeeting.summary || 'No summary yet.'}</p>
                            </div>

                            <div className="rounded-2xl bg-[#EFF1ED] p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[#717744]">Detailed Notes</p>
                                <p className="mt-2 whitespace-pre-line text-sm">
                                    {selectedMeeting.detailedNotes || 'No detailed notes yet.'}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#EFF1ED] p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[#717744]">Decisions Made</p>
                                <p className="mt-2 text-sm">{selectedMeeting.decisionsMade || 'No decisions yet.'}</p>
                            </div>

                            <div className="rounded-2xl bg-[#EFF1ED] p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[#717744]">Follow-up Notes</p>
                                <p className="mt-2 text-sm">{selectedMeeting.followUpNotes || 'No follow-up notes yet.'}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </aside>
        </div>
    );
}