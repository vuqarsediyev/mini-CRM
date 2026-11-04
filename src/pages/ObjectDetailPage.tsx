import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ConstructionObject, Task, UserProfile } from '../types/crm';
import { StatusBadge } from '../components/StatusBadge';
import { TaskModal } from '../components/TaskModal';
import { ObjectModal } from '../components/ObjectModal';
import {
  Building2,
  MapPin,
  Plus,
  ArrowLeft,
  Calendar,
  CheckSquare,
  Edit2,
  Trash2,
  User,
  ArrowRight,
} from 'lucide-react';

export const ObjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isManager } = useAuth();

  const [object, setObject] = useState<ConstructionObject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Все');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditObjectOpen, setIsEditObjectOpen] = useState(false);

  const fetchData = async () => {
    if (!currentUser || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [objData, tasksData, usersData] = await Promise.all([
        api.getObjectById(id, currentUser),
        api.getTasks(currentUser, id),
        api.getUsersList(),
      ]);

      if (!objData) {
        setError('Объект не найден или у вас нет прав на его просмотр (RLS)');
      } else {
        setObject(objData);
        setTasks(tasksData);
        setAssignees(usersData.filter((u) => u.role === 'assignee'));
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки данных объекта');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, currentUser]);

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    object_id: string;
    assignee_id?: string | null;
  }) => {
    if (!currentUser) return;
    await api.createTask(data, currentUser);
    await fetchData();
  };

  const handleUpdateObject = async (data: { name: string; address: string }) => {
    if (!currentUser || !id) return;
    await api.updateObject(id, data, currentUser);
    await fetchData();
  };

  const handleDeleteObject = async () => {
    if (!currentUser || !id || !object) return;
    if (window.confirm(`Вы уверены, что хотите удалить объект «${object.name}» и все его задачи?`)) {
      try {
        await api.deleteObject(id, currentUser);
        navigate('/objects');
      } catch (err: any) {
        alert(err?.message || 'Ошибка удаления');
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'Все') return true;
    return t.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48"></div>
        <div className="h-32 bg-white rounded-3xl border border-slate-200"></div>
        <div className="h-64 bg-white rounded-3xl border border-slate-200"></div>
      </div>
    );
  }

  if (error || !object) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        <Building2 className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Ошибка доступа к объекту</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => navigate('/objects')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться к объектам
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/objects" className="hover:text-indigo-600 transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Все объекты
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold truncate max-w-xs">{object.name}</span>
      </nav>

      {/* Object Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Строительный объект</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {object.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {object.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Добавлен: {new Date(object.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isManager && (
              <>
                <button
                  onClick={() => setIsEditObjectOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>
                <button
                  onClick={handleDeleteObject}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-md shadow-indigo-100 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить задачу</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Задачи по объекту</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredTasks.length}
            </span>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['Все', 'Новая', 'В работе', 'На проверке', 'На доработке', 'Принята'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-600">Нет задач по заданным критериям</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {statusFilter !== 'Все'
                ? `В статусе «${statusFilter}» пока нет задач`
                : 'По этому объекту пока не назначено задач'}
            </p>
            {isManager && statusFilter === 'Все' && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                Создать первую задачу
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tasks/${t.id}`)}
                className="py-4.5 px-2 hover:bg-slate-50/80 rounded-2xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={t.status} size="sm" />
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {t.title}
                    </h3>
                  </div>

                  {t.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 pl-1">{t.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 pl-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Исполнитель:{' '}
                      <strong className="text-slate-600 font-semibold">
                        {t.assignee?.full_name || 'Не назначен'}
                      </strong>
                    </span>
                    <span>
                      Создана: {new Date(t.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 shrink-0">
                  <span>Открыть карточку</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        objects={object ? [object] : []}
        assignees={assignees}
        defaultObjectId={object.id}
      />

      <ObjectModal
        isOpen={isEditObjectOpen}
        onClose={() => setIsEditObjectOpen(false)}
        onSubmit={handleUpdateObject}
        initialData={object}
      />
    </div>
  );
};
