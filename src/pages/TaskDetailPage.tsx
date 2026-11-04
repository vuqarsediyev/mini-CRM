import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Task, TaskHistoryItem, TaskStatus, UserProfile } from '../types/crm';
import { StatusBadge } from '../components/StatusBadge';
import { TaskActions } from '../components/TaskActions';
import { HistoryTimeline } from '../components/HistoryTimeline';
import { TaskModal } from '../components/TaskModal';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  User,
  AlertCircle,
} from 'lucide-react';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isManager } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [assignees, setAssignees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Task Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTaskData = async () => {
    if (!currentUser || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [taskData, historyData, usersData] = await Promise.all([
        api.getTaskById(id, currentUser),
        api.getTaskHistory(id, currentUser),
        api.getUsersList(),
      ]);

      if (!taskData) {
        setError('Задача не найдена или у вас нет прав на её просмотр (RLS-ограничение)');
      } else {
        setTask(taskData);
        setHistory(historyData);
        setAssignees(usersData.filter((u) => u.role === 'assignee'));
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки данных задачи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [id, currentUser]);

  const handleStatusChange = async (newStatus: TaskStatus, comment: string | null) => {
    if (!currentUser || !id) return;
    try {
      await api.changeTaskStatus(id, newStatus, comment, currentUser);
      await fetchTaskData();
    } catch (err: any) {
      alert(`Ошибка перехода статуса: ${err.message}`);
    }
  };

  const handleUpdateTask = async (data: {
    title: string;
    description: string;
    object_id: string;
    assignee_id?: string | null;
  }) => {
    if (!currentUser || !id) return;
    await api.updateTask(id, data, currentUser);
    await fetchTaskData();
  };

  const handleDeleteTask = async () => {
    if (!currentUser || !id || !task) return;
    if (window.confirm(`Вы уверены, что хотите удалить задачу «${task.title}»?`)) {
      try {
        await api.deleteTask(id, currentUser);
        navigate(`/objects/${task.object_id}`);
      } catch (err: any) {
        alert(err?.message || 'Ошибка удаления задачи');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48"></div>
        <div className="h-48 bg-white rounded-3xl border border-slate-200"></div>
        <div className="h-64 bg-white rounded-3xl border border-slate-200"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Доступ ограничен</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => navigate('/objects')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/objects" className="hover:text-indigo-600 transition">
          Объекты
        </Link>
        <span>/</span>
        {task.object && (
          <>
            <Link
              to={`/objects/${task.object_id}`}
              className="hover:text-indigo-600 transition truncate max-w-xs"
            >
              {task.object.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-700 font-semibold truncate max-w-xs">{task.title}</span>
      </nav>

      {/* Main Task Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header: Status and Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={task.status} size="lg" />
              {task.object && (
                <Link
                  to={`/objects/${task.object_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{task.object.name}</span>
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {task.title}
            </h1>
          </div>

          {/* Manager Action Buttons */}
          {isManager && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Редактировать</span>
              </button>
              <button
                onClick={handleDeleteTask}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить</span>
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Описание задачи
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            {task.description || 'Описание отсутствует'}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Исполнитель</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {task.assignee?.full_name || 'Не назначен'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Постановщик (автор)</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {task.author?.full_name || 'Системный постановщик'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 block mb-1">Дата создания</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(task.created_at).toLocaleString('ru-RU')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Actions Panel (Strictly matching Role & Status) */}
      <TaskActions task={task} onStatusChange={handleStatusChange} />

      {/* Task History Timeline */}
      <HistoryTimeline history={history} />

      {/* Edit Modal */}
      {task.object && (
        <TaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateTask}
          initialData={task}
          objects={[task.object]}
          assignees={assignees}
        />
      )}
    </div>
  );
};
