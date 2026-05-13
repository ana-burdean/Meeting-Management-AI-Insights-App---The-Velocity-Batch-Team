import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { Meeting, MeetingPayload, Participant, ProcessingStatus } from '../types';

const STATUS_OPTIONS: Array<'ALL' | ProcessingStatus> = ['ALL', 'IDLE', 'PROCESSING', 'COMPLETED', 'FAILED'];

const emptyForm = {
  title: '',
  description: '',
  meetingDate: '',
  rawTranscript: '',
  participantsText: '',
};

function statusClass(status: ProcessingStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 ring-green-200';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800 ring-blue-200';
    case 'FAILED':
      return 'bg-red-100 text-red-800 ring-red-200';
    default:
      return 'bg-[#BCBD8B]/45 text-[#373D20] ring-[#BCBD8B]';
  }
}

function formatDate(date?: string) {
  if (!date) return 'No date';
  return new Date(date).toLocaleString();
}

function parseParticipants(text: string): Participant[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', email = '', participantRole = ''] = line.split(',').map((item) => item.trim());

      return {
        name,
        email,
        participantRole,
      };
    })
    .filter((participant) => participant.name.length > 0);
}

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProcessingStatus>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc'>('date-desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
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

  async function handleCreateMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    if (!form.meetingDate) {
      setFormError('Meeting date is required.');
      return;
    }

    const payload: MeetingPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      meetingDate: form.meetingDate,
      rawTranscript: form.rawTranscript.trim(),
      processingStatus: 'IDLE',
      uploader: { id: 1 },
      participants: parseParticipants(form.participantsText),
    };

    try {
      setLoading(true);
      const created = await api.meetings.create(payload);
      setMeetings((current) => [created, ...current]);
      setForm(emptyForm);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create meeting.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMeeting(id: number) {
    const confirmed = window.confirm('Delete this meeting? This action cannot be undone.');
    if (!confirmed) return;

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
      <section className="rounded-[2rem] bg-[#373D20] p-6 text-[#EFF1ED] shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-black">Meeting Management</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#EFF1ED]/80">
              Create meetings, add transcripts, trigger AI processing, and review generated results.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-[#BCBD8B] px-5 py-3 text-sm font-black text-[#373D20] shadow-lg transition hover:bg-[#EFF1ED]"
          >
            + Add Meeting
          </button>
        </div>
      </section>

      <section className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#BCBD8B]/50 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-bold">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, description, transcript..."
            className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | ProcessingStatus)}
            className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold">Sort</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'date-desc' | 'date-asc' | 'title-asc')}
            className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="title-asc">Title A-Z</option>
          </select>
        </label>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && <p className="text-sm font-semibold text-[#717744]">Loading meetings...</p>}

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <article
              key={meeting.id}
              className={`cursor-pointer rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedMeeting?.id === meeting.id ? 'ring-[#373D20]' : 'ring-[#BCBD8B]/50'
              }`}
              onClick={() => setSelectedMeeting(meeting)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#373D20]">{meeting.title}</h3>
                  <p className="mt-1 text-sm text-[#766153]">{formatDate(meeting.meetingDate)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[#373D20]/75">
                    {meeting.description || 'No description provided.'}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(meeting.processingStatus)}`}>
                  {meeting.processingStatus}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#717744]">
                <span className="rounded-full bg-[#EFF1ED] px-3 py-1">
                  {meeting.participants?.length ?? 0} attendees
                </span>
                <span className="rounded-full bg-[#EFF1ED] px-3 py-1">
                  {meeting.actionItems?.length ?? 0} action items
                </span>
              </div>
            </article>
          ))}

          {!loading && filteredMeetings.length === 0 && (
            <div className="rounded-[1.7rem] bg-white p-8 text-center text-[#766153] ring-1 ring-[#BCBD8B]/50">
              No meetings found.
            </div>
          )}
        </div>

        <aside className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#BCBD8B]/50 lg:sticky lg:top-24 lg:self-start">
          {!selectedMeeting ? (
            <div className="py-12 text-center">
              <h3 className="text-xl font-black">Select a meeting</h3>
              <p className="mt-2 text-sm text-[#766153]">Click a meeting to view transcript, results, and actions.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black">{selectedMeeting.title}</h3>
                  <p className="text-sm text-[#766153]">{formatDate(selectedMeeting.meetingDate)}</p>
                </div>

                <button
                  onClick={() => void handleDeleteMeeting(selectedMeeting.id)}
                  className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-200"
                >
                  Delete
                </button>
              </div>

              <section>
                <h4 className="font-black">Transcript</h4>
                <p className="mt-2 max-h-40 overflow-auto rounded-2xl bg-[#EFF1ED] p-4 text-sm leading-6">
                  {selectedMeeting.rawTranscript || 'No transcript added.'}
                </p>
              </section>

              <button
                onClick={() => void handleProcessMeeting(selectedMeeting)}
                disabled={processingId === selectedMeeting.id || !selectedMeeting.rawTranscript?.trim()}
                className="w-full rounded-2xl bg-[#373D20] px-5 py-3 text-sm font-black text-[#EFF1ED] transition hover:bg-[#717744] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId === selectedMeeting.id ? 'Processing transcript...' : 'Process Transcript'}
              </button>

              <section className="space-y-3">
                <h4 className="font-black">AI Results</h4>

                <div className="rounded-2xl bg-[#EFF1ED] p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#717744]">Summary</p>
                  <p className="mt-2 text-sm">{selectedMeeting.summary || 'No summary yet.'}</p>
                </div>

                <div className="rounded-2xl bg-[#EFF1ED] p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#717744]">Detailed Notes</p>
                  <p className="mt-2 whitespace-pre-line text-sm">{selectedMeeting.detailedNotes || 'No detailed notes yet.'}</p>
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
          )}
        </aside>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#373D20]/60 p-4">
          <form
            onSubmit={(event) => void handleCreateMeeting(event)}
            className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black">Add Meeting</h3>
                <p className="text-sm text-[#766153]">Fields marked with * are required.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-[#EFF1ED] px-3 py-2 text-sm font-black"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-bold">Title *</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold">Date and time *</span>
                <input
                  type="datetime-local"
                  value={form.meetingDate}
                  onChange={(event) => setForm((current) => ({ ...current, meetingDate: event.target.value }))}
                  className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold">Description</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold">Transcript</span>
                <textarea
                  rows={6}
                  value={form.rawTranscript}
                  onChange={(event) => setForm((current) => ({ ...current, rawTranscript: event.target.value }))}
                  placeholder="Paste meeting transcript here..."
                  className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold">Participants</span>
                <textarea
                  rows={4}
                  value={form.participantsText}
                  onChange={(event) => setForm((current) => ({ ...current, participantsText: event.target.value }))}
                  placeholder={'One per line: Name, email, role\nExample: Ana Popescu, ana@email.com, Project Manager'}
                  className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl bg-[#EFF1ED] px-5 py-3 text-sm font-black text-[#373D20]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#373D20] px-5 py-3 text-sm font-black text-[#EFF1ED] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Meeting'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}