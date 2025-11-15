import { Timestamp } from 'firebase/firestore';

export interface Attachment {
  url: string;
  name?: string;
  type?: string;
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  recipientId?: string;
  text?: string;
  createdAt?: Timestamp | string;
  read?: boolean;
  readBy?: string[];
  metadata?: Record<string, any>;
  clientId?: string; // for optimistic UI reconciliation
  attachments?: Attachment[];
  type?: 'text' | 'image' | 'file' | string;
  status?: 'sending' | 'failed' | 'sent';
}
