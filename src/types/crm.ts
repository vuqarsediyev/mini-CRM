export type UserRole = 'manager' | 'assignee';

export type TaskStatus = 'Новая' | 'В работе' | 'На проверке' | 'Принята' | 'На доработке';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export interface ConstructionObject {
  id: string;
  name: string;
  address: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Computed / joined fields
  task_count?: number;
  tasks_by_status?: Record<TaskStatus, number>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  object_id: string;
  assignee_id: string | null;
  author_id: string;
  status: TaskStatus;
  created_at: string;
  updated_at?: string;
  // Joined fields for UI
  object?: ConstructionObject;
  assignee?: UserProfile | null;
  author?: UserProfile;
}

export interface TaskHistoryItem {
  id: string;
  task_id: string;
  user_id: string;
  from_status: TaskStatus | null;
  to_status: TaskStatus;
  comment: string | null;
  created_at: string;
  // Joined user profile
  user?: UserProfile;
}

export interface AllowedTransition {
  from: TaskStatus;
  to: TaskStatus;
  allowedRole: UserRole;
  requiresAssignee: boolean;
  requiresComment: boolean;
  label: string;
}
