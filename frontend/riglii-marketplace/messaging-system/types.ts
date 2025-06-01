// Base User type from Supabase Auth
export interface User {
  id: string;
  email: string;
  is_freelancer: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

// Public user type for display
export interface PublicUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_freelancer: boolean;
}

// Form/Proposal type
// Update Form interface
// Update your Form type in types.ts
export interface Form {
  id: string
  conversation_id: string // Make sure this is not optional
  title: string
  description: string
  price: number
  time_estimate: string
  status: 'pending' | 'accepted' | 'refused'
  form_type: 'proposal' | 'commercial'
  sender_id: string
  receiver_id: string
  created_at: string
  responded_at?: string
  project_files?: string[]
  project_notes?: string
  project_submitted?: boolean
  project_submitted_at?: string
  project_submission_url?: string
  digital_signature?: string
}

// If you need to handle cases where conversation_id might be missing temporarily:
export interface PartialForm extends Omit<Form, 'conversation_id'> {
  conversation_id?: string
}

// New interface for project files
export interface ProjectFile {
  id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at?: Date | string;
}

// Form data for creating new forms
export interface FormData {
  title: string;
  description: string;
  price: string;
  timeEstimate: string;
}

// Conversation type
export interface Conversation {
  id: string;
  user1_id?: string;
  user2_id?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  participant: PublicUser; // The other user in conversation
  participants?: PublicUser[]; // For search functionality
  lastMessage?: Message;
  last_message?: Message; // Support both formats
  unreadCount?: number;
  unread_count?: number; // Support both formats
}

// Message type
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'file';
  is_read: boolean;
  created_at: Date | string;
  updated_at?: Date | string;
  form_id?: string;
  message_type: 'text' | 'form' | 'form_response';
  form?: Form; // Now properly typed
  sender?: PublicUser | any;
  receiver?: PublicUser;
}

// Component Props
export interface MessagingSystemProps {
  user: {
    id: string;
    email: string;
  };
}

// Search result (can be same as PublicUser)
export interface SearchResult extends PublicUser {
  freelancer_profile?: any; // Optional freelancer details
}

// Freelancer Profile type
export interface FreelancerProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  description?: string;
  occupation?: string;
  custom_occupation?: string;
  profile_picture_url?: string;
  price?: number;
  onboarding_completed_at?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}