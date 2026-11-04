import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockBackend, INITIAL_USERS } from './mockBackend';
import type {
  UserProfile,
  ConstructionObject,
  Task,
  TaskHistoryItem,
  TaskStatus,
} from '../types/crm';

export const api = {
  // --- AUTHENTICATION ---
  async login(email: string, password?: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password || 'Password123!',
      });
      if (error) throw error;
      if (!data.user) throw new Error('Пользователь не найден');

      // Fetch profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        throw new Error('Профиль пользователя не найден в public.profiles');
      }
      return profile as UserProfile;
    } else {
      // Offline / Local Demo mode
      const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        throw new Error('Пользователь с таким email не найден. Доступны: manager1@crm.local, manager2@crm.local, worker1@crm.local, worker2@crm.local');
      }
      localStorage.setItem('crm_current_user_id', user.id);
      return user;
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('crm_current_user_id');
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      return (profile as UserProfile) || null;
    } else {
      const userId = localStorage.getItem('crm_current_user_id') || INITIAL_USERS[0].id;
      return INITIAL_USERS.find((u) => u.id === userId) || INITIAL_USERS[0];
    }
  },

  async getUsersList(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      return data as UserProfile[];
    } else {
      return [...INITIAL_USERS];
    }
  },

  // --- OBJECTS ---
  async getObjects(user: UserProfile): Promise<ConstructionObject[]> {
    if (isSupabaseConfigured) {
      // RLS policy is automatically applied on Supabase side!
      const { data, error } = await supabase
        .from('objects')
        .select('*, tasks(id, status, assignee_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const tasks = row.tasks || [];
        const byStatus: Record<TaskStatus, number> = {
          'Новая': 0,
          'В работе': 0,
          'На проверке': 0,
          'На доработке': 0,
          'Принята': 0,
        };
        for (const t of tasks) {
          if (byStatus[t.status as TaskStatus] !== undefined) {
            byStatus[t.status as TaskStatus]++;
          }
        }
        return {
          id: row.id,
          name: row.name,
          address: row.address,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          task_count: tasks.length,
          tasks_by_status: byStatus,
        };
      });
    } else {
      return mockBackend.getVisibleObjects(user);
    }
  },

  async getObjectById(id: string, user: UserProfile): Promise<ConstructionObject | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as ConstructionObject;
    } else {
      return mockBackend.getObjectById(id, user);
    }
  },

  async createObject(data: { name: string; address: string }, user: UserProfile): Promise<ConstructionObject> {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase
        .from('objects')
        .insert([{ name: data.name.trim(), address: data.address.trim(), created_by: user.id }])
        .select()
        .single();
      if (error) throw error;
      return created as ConstructionObject;
    } else {
      return mockBackend.createObject(data, user);
    }
  },

  async updateObject(id: string, data: { name: string; address: string }, user: UserProfile): Promise<ConstructionObject> {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('objects')
        .update({ name: data.name.trim(), address: data.address.trim(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated as ConstructionObject;
    } else {
      return mockBackend.updateObject(id, data, user);
    }
  },

  async deleteObject(id: string, user: UserProfile): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('objects').delete().eq('id', id);
      if (error) throw error;
    } else {
      mockBackend.deleteObject(id, user);
    }
  },

  // --- TASKS ---
  async getTasks(user: UserProfile, filterObjectId?: string): Promise<Task[]> {
    if (isSupabaseConfigured) {
      // RLS automatically limits assignees to only their own tasks
      let query = supabase
        .from('tasks')
        .select('*, object:objects(*), assignee:profiles!tasks_assignee_id_fkey(*), author:profiles!tasks_author_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (filterObjectId) {
        query = query.eq('object_id', filterObjectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Task[];
    } else {
      return mockBackend.getVisibleTasks(user, filterObjectId);
    }
  },

  async getTaskById(id: string, user: UserProfile): Promise<Task | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, object:objects(*), assignee:profiles!tasks_assignee_id_fkey(*), author:profiles!tasks_author_id_fkey(*)')
        .eq('id', id)
        .single();

      if (error) return null;
      return data as Task;
    } else {
      return mockBackend.getTaskById(id, user);
    }
  },

  async createTask(
    data: { title: string; description: string; object_id: string; assignee_id?: string | null },
    user: UserProfile
  ): Promise<Task> {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: data.title.trim(),
            description: data.description.trim(),
            object_id: data.object_id,
            assignee_id: data.assignee_id || null,
            author_id: user.id,
            status: 'Новая',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return created as Task;
    } else {
      return mockBackend.createTask(data, user);
    }
  },

  async updateTask(
    id: string,
    data: { title?: string; description?: string; assignee_id?: string | null },
    user: UserProfile
  ): Promise<Task> {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('tasks')
        .update({
          ...(data.title !== undefined && { title: data.title.trim() }),
          ...(data.description !== undefined && { description: data.description.trim() }),
          ...(data.assignee_id !== undefined && { assignee_id: data.assignee_id }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Task;
    } else {
      return mockBackend.updateTask(id, data, user);
    }
  },

  async deleteTask(id: string, user: UserProfile): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    } else {
      mockBackend.deleteTask(id, user);
    }
  },

  async changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    comment: string | null,
    user: UserProfile
  ): Promise<Task> {
    if (isSupabaseConfigured) {
      // Calls the secure PostgreSQL RPC function which sets transaction comment,
      // triggers status check, validates role, and records history
      const { data, error } = await supabase.rpc('change_task_status', {
        p_task_id: taskId,
        p_new_status: newStatus,
        p_comment: comment && comment.trim() !== '' ? comment.trim() : null,
      });

      if (error) throw new Error(error.message);
      return data as Task;
    } else {
      return mockBackend.changeTaskStatus(taskId, newStatus, comment, user);
    }
  },

  async getTaskHistory(taskId: string, user: UserProfile): Promise<TaskHistoryItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('task_history')
        .select('*, user:profiles(*)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as TaskHistoryItem[];
    } else {
      return mockBackend.getTaskHistory(taskId, user);
    }
  },

  resetDemoData() {
    mockBackend.resetToDefault();
  },
};
