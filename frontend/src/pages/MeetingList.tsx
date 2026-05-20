import { useEffect, useMemo, useState } from 'react';
import Button from '../components/atoms/Button';
import ErrorMessage from '../components/atoms/ErrorMessage';
import Loader from '../components/atoms/Loader';
import Modal from '../components/atoms/Modal';
import MeetingCard from '../components/molecules/MeetingCard';
import MeetingFilters from '../components/molecules/MeetingFilters';
import AddMeetingForm from '../components/organisms/AddMeetingForm';
import MeetingDetailsPanel from '../components/organisms/MeetingDetailsPanel';
import { api } from '../services/api';
import type { Meeting, MeetingPayload, ProcessingStatus } from '../types';

export default function MeetingList() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | ProcessingStatus>('ALL');
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc'>('date-desc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    async function loadMeetings() {
        try {
            setLoading(true);
            setError('');
            const data = await api.meetings.getAll();
            setMeetings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load meetings.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadMeetings();
    }, []);

    const filteredMeetings = useMemo(() => {
        return meetings
            .filter((meeting) => {
                const text = `${meeting.title} ${meeting.description ?? ''} ${meeting.rawTranscript ?? ''}`.toLowerCase();
                const matchesSearch = text.includes(search.toLowerCase());
                const matchesStatus = statusFilter === 'ALL' || meeting.processingStatus === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
                const dateA = a.meetingDate ? new Date(a.meetingDate).getTime() : 0;
                const dateB = b.meetingDate ? new Date(b.meetingDate).getTime() : 0;
                return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
            });
    }, [meetings, search, statusFilter, sortBy]);

    async function handleCreateMeeting(payload: MeetingPayload) {
        try {
            setLoading(true);
            const created = await api.meetings.create(payload);
            setMeetings((current) => [created, ...current]);
            setIsModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create meeting.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteMeeting(id: number) {
        setConfirmDeleteId(id);
    }

    async function confirmDeleteMeeting() {
        if (confirmDeleteId === null) return;
        const id = confirmDeleteId;
        setConfirmDeleteId(null);
        try {
            await api.meetings.delete(id);
            setMeetings((current) => current.filter((meeting) => meeting.id !== id));
            if (selectedMeeting?.id === id) setSelectedMeeting(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete meeting.');
        }
    }

    async function handleProcessMeeting(meeting: Meeting) {
        if (!meeting.rawTranscript?.trim()) {
            setError('Transcript is empty. Add transcript text before processing.');
            return;
        }
        try {
            setProcessingId(meeting.id);
            setError('');
            const updated = await api.meetings.process(meeting.id);
            setMeetings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            setSelectedMeeting(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'AI processing failed.');
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <div className="space-y-8">
            <section className="rounded-[2rem] bg-[#373D20] px-8 py-10 text-center text-[#EFF1ED] shadow-xl">
                <h2 className="text-3xl font-black">Meeting Management</h2>
                <p className="mt-3 text-sm text-[#EFF1ED]/80">
                    Create meetings, add transcripts, trigger AI processing, and review generated results.
                </p>
            </section>

            <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#BCBD8B]/50 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
                <MeetingFilters
                    search={search}
                    statusFilter={statusFilter}
                    sortBy={sortBy}
                    onSearchChange={setSearch}
                    onStatusChange={setStatusFilter}
                    onSortChange={setSortBy}
                />
                <Button
                    variant="accent"
                    onClick={() => setIsModalOpen(true)}
                    className="h-[54px] whitespace-nowrap px-6 py-3 shadow-lg"
                >
                    + Add Meeting
                </Button>
            </section>

            <ErrorMessage message={error} />
            {loading && <Loader text="Loading meetings..." />}

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredMeetings.map((meeting) => (
                    <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        isSelected={selectedMeeting?.id === meeting.id}
                        onClick={() => setSelectedMeeting(meeting)}
                    />
                ))}
                {!loading && filteredMeetings.length === 0 && (
                    <div className="col-span-full rounded-[1.7rem] bg-white p-8 text-center text-[#766153] ring-1 ring-[#BCBD8B]/50">
                        No meetings found.
                    </div>
                )}
            </section>

            <MeetingDetailsPanel
                selectedMeeting={selectedMeeting}
                processingId={processingId}
                onClose={() => setSelectedMeeting(null)}
                onDelete={(id) => void handleDeleteMeeting(id)}
                onProcess={(meeting) => void handleProcessMeeting(meeting)}
            />

            {confirmDeleteId !== null && (
                <Modal
                    title="Delete meeting?"
                    onClose={() => setConfirmDeleteId(null)}
                >
                    <p className="mb-6 text-sm text-[#766153]">
                        This action cannot be undone. The meeting and all its data will be permanently removed.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="danger"
                            onClick={() => void confirmDeleteMeeting()}
                            className="flex-1"
                        >
                            Yes, delete
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
            )}

            {isModalOpen && (
                <AddMeetingForm
                    loading={loading}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateMeeting}
                />
            )}
        </div>
    );
}