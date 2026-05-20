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

      return {
        name,
        email,
        participantRole,
      };
    })
    .filter((participant) => participant.name.length > 0);
}

export default function AddMeetingForm({ loading, users, onClose, onSubmit }: AddMeetingFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [uploaderId, setUploaderId] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    if (!uploaderId) {
      setFormError('Please select who is uploading this meeting.');
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
  }

  return (
    <Modal title="Add Meeting" subtitle="Fields marked with * are required." onClose={onClose}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <ErrorMessage message={formError} />

        <div className="mt-4 grid gap-4">
          <Field
            label="Title *"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />

          <Field
            label="Date and time *"
            type="datetime-local"
            value={form.meetingDate}
            onChange={(event) => setForm((current) => ({ ...current, meetingDate: event.target.value }))}
          />

          <Field label="Uploaded by *">
            <select
              value={uploaderId}
              onChange={(event) => setUploaderId(Number(event.target.value))}
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
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
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
            />
          </Field>

          <Field label="Transcript">
            <textarea
              rows={6}
              value={form.rawTranscript}
              onChange={(event) => setForm((current) => ({ ...current, rawTranscript: event.target.value }))}
              placeholder="Paste meeting transcript here..."
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
            />
          </Field>

          <Field label="Participants">
            <textarea
              rows={4}
              value={form.participantsText}
              onChange={(event) => setForm((current) => ({ ...current, participantsText: event.target.value }))}
              placeholder={'One per line: Name, email, role\nExample: Ana Popescu, ana@email.com, Project Manager'}
              className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Meeting'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
