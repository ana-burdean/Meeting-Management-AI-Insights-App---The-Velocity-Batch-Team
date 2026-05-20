import { useState } from 'react';
import type { AppUser, MeetingPayload, Participant } from '../../types';
import Button from "../atoms/Button";
import ErrorMessage from "../atoms/ErrorMessage";
import Field from "../atoms/Field";
import Modal from "../atoms/Modal";

const emptyForm = {
  title: '',
  description: '',
  meetingDate: '',
  rawTranscript: '',
  participantsText: '',
};

interface AddMeetingFormProps {
  loading: boolean;
  users: AppUser[];
  onClose: () => void;
  onSubmit: (payload: MeetingPayload) => Promise<void>;
}

function parseParticipants(text: string): Participant[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', email = '', participantRole = ''] = line.split(',').map((item) => item.trim());
      return { name, email, participantRole };
    })
    .filter((participant) => participant.name.length > 0);
}

export default function AddMeetingForm({ loading, users, onClose, onSubmit }: AddMeetingFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [uploaderId, setUploaderId] = useState<number | ''>('');
  const [formError, setFormError] = useState('');
  const [attempted, setAttempted] = useState(false);

  const missingTitle = !form.title.trim();
  const missingDate = !form.meetingDate;
  const missingUser = !uploaderId;
  const canSave = !missingTitle && !missingDate && !missingUser;

  // Build tooltip text for what's missing
  const missingItems = [
    missingTitle && 'Title',
    missingDate && 'Date and time',
    missingUser && 'Uploaded by',
  ].filter(Boolean);
  const saveTooltip = canSave ? undefined : `Required: ${missingItems.join(', ')}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setFormError('');

    if (!canSave) {
      setFormError(`Please fill in: ${missingItems.join(', ')}.`);
      return;
    }

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      meetingDate: form.meetingDate,
      rawTranscript: form.rawTranscript.trim(),
      processingStatus: 'IDLE',
      uploader: { id: uploaderId as number },
      participants: parseParticipants(form.participantsText),
    });

    setForm(emptyForm);
    setUploaderId('');
    setAttempted(false);
  }

  const fieldError = (missing: boolean) =>
    attempted && missing ? 'border-red-400 ring-1 ring-red-300' : '';

  return (
    <Modal title="Add Meeting" subtitle="Fields marked with * are required." onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <ErrorMessage message={formError} />

        <div className="mt-4 grid gap-4">
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              className={`w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744] ${fieldError(missingTitle)}`}
            />
          </Field>

          <Field label="Date and time *">
            <input
              type="datetime-local"
              value={form.meetingDate}
              onChange={(e) => setForm((c) => ({ ...c, meetingDate: e.target.value }))}
              className={`w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744] ${fieldError(missingDate)}`}
            />
          </Field>

          <Field label="Uploaded by *">
            <select
              title="Uploaded by"
              value={uploaderId}
              onChange={(e) => setUploaderId(Number(e.target.value))}
              className={`w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744] ${fieldError(missingUser)}`}
            >
              <option value="">— Select user —</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
            />
          </Field>

          <Field label="Transcript">
            <textarea
              rows={6}
              value={form.rawTranscript}
              onChange={(e) => setForm((c) => ({ ...c, rawTranscript: e.target.value }))}
              placeholder="Paste meeting transcript here..."
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
            />
          </Field>

          <Field label="Participants">
            <textarea
              rows={4}
              value={form.participantsText}
              onChange={(e) => setForm((c) => ({ ...c, participantsText: e.target.value }))}
              placeholder={'One per line: Name, email, role\nExample: Ana Popescu, ana@email.com, Project Manager'}
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {/* Wrapper span needed so title shows even when button is disabled */}
          <span title={saveTooltip} className="inline-block">
            <Button
              type="submit"
              disabled={loading}
              className={!canSave ? '!bg-gray-300 !text-gray-500 cursor-not-allowed' : ''}
            >
              {loading ? 'Saving...' : !canSave ? '⚠ Save Meeting' : 'Save Meeting'}
            </Button>
          </span>
        </div>
      </form>
    </Modal>
  );
}