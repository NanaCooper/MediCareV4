import { Timestamp } from 'firebase/firestore';

export interface Conversation {
  id?: string;
  participants: string[]; // user ids
  title?: string; // display title (e.g., doctor's name or group name)
  lastMessage?: string;
  lastUpdated?: Timestamp | string;
  unreadCount?: number;
}
