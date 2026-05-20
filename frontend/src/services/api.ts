import type { ActionItem, AppUser, Meeting, MeetingPayload, Participant, ProcessingStatus, TaskStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
    users: {
        getAll: () => apiFetch<AppUser[]>('/users'),
        getByUsername: (username: string) => apiFetch<AppUser>(`/users/username/${username}`),
        create: (user: Omit<AppUser, 'id'>) => apiFetch<AppUser>('/users', { method: 'POST', body: JSON.stringify(user) }),
    },
  meetings: {
    getAll: () => apiFetch<Meeting[]>('/meetings'),
    getById: (id: number) => apiFetch<Meeting>(`/meetings/${id}`),
    getByStatus: (status: ProcessingStatus) => apiFetch<Meeting[]>(`/meetings/status/${status}`),
    search: (keyword: string) => apiFetch<Meeting[]>(`/meetings/search?keyword=${encodeURIComponent(keyword)}`),
    create: (meeting: MeetingPayload) => apiFetch<Meeting>('/meetings', { method: 'POST', body: JSON.stringify(meeting) }),
    update: (id: number, meeting: Partial<MeetingPayload>) =>
      apiFetch<Meeting>(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(meeting) }),
    delete: (id: number) => apiFetch<void>(`/meetings/${id}`, { method: 'DELETE' }),
    process: (id: number) => apiFetch<Meeting>(`/meetings/${id}/process`, { method: 'POST' }),
  },
  participants: {
    getByMeeting: (meetingId: number) => apiFetch<Participant[]>(`/participants/meeting/${meetingId}`),
    create: (participant: Participant) =>
      apiFetch<Participant>('/participants', { method: 'POST', body: JSON.stringify(participant) }),
    update: (id: number, participant: Participant) =>
      apiFetch<Participant>(`/participants/${id}`, { method: 'PUT', body: JSON.stringify(participant) }),
    delete: (id: number) => apiFetch<void>(`/participants/${id}`, { method: 'DELETE' }),
  },
  actionItems: {
    getAll: () => apiFetch<ActionItem[]>('/action-items'),
    getByMeeting: (meetingId: number) => apiFetch<ActionItem[]>(`/action-items/meeting/${meetingId}`),
    getByStatus: (status: TaskStatus) => apiFetch<ActionItem[]>(`/action-items/status/${status}`),
    update: (id: number, actionItem: Partial<ActionItem>) =>
      apiFetch<ActionItem>(`/action-items/${id}`, { method: 'PUT', body: JSON.stringify(actionItem) }),
    delete: (id: number) => apiFetch<void>(`/action-items/${id}`, { method: 'DELETE' }),
  },
};