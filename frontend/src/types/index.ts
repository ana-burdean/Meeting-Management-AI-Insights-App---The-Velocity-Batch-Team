export type Role = 'ADMIN' | 'USER';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'UNKNOWN';
export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AppUser {
  id: number;
  username: string;
  role: Role;
  isActive: boolean;
}

export interface Participant {
  id: number;
  name: string;
  email?: string;          
  participantRole?: string;
  meeting?: Meeting | number; 
}

export interface ActionItem {
  id: number;
  description: string;
  deadline?: string;   
  status: TaskStatus;
  assignee?: Participant;
  meeting?: Meeting | number; 
}

export interface Meeting {
  id: number;
  title: string;
  description?: string;        
  meetingDate: string;         
  uploadDate: string;          
  processingStatus: ProcessingStatus; 
  rawTranscript?: string;
  
  // AI Generated Results
  summary?: string;
  detailedNotes?: string;      
  decisionsMade?: string;      
  followUpNotes?: string;      
  
  // Relationships
  uploader?: AppUser;
  participants: Participant[];
  actionItems: ActionItem[];
}