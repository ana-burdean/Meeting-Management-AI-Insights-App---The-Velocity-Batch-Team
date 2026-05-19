export type Role = 'ADMIN' | 'USER';
export type TaskStatus = 'OPEN' | 'IN PROGRESS' | 'DONE' | 'UNKNOWN';
export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AppUser {
  id: number;
  username: string;
  role: Role;
  isActive: boolean;
}

export interface Participant {
  id?: number;
  name: string;
  email?: string;
  participantRole?: string;
  meeting?: { id: number };
}

export interface ActionItem {
  id: number;
  description: string;
  deadline?: string;
  status: TaskStatus;
  assignee?: Participant | null;
  meeting?: { id: number };
}

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  meetingDate?: string;
  uploadDate?: string;
  processingStatus: ProcessingStatus;
  rawTranscript?: string;
  summary?: string;
  detailedNotes?: string;
  decisionsMade?: string;
  followUpNotes?: string;
  uploader?: AppUser;
  participants?: Participant[];
  actionItems?: ActionItem[];
}

export interface MeetingPayload {
  title: string;
  description?: string;
  meetingDate?: string;
  rawTranscript?: string;
  processingStatus?: ProcessingStatus;
  uploader: { id: number };
  participants?: Participant[];
}