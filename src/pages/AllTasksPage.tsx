import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Task } from '../types/crm';
import { StatusBadge } from '../components/StatusBadge';
import {
  CheckSquare,
  Building2,
  Calendar,
  ArrowRight,
  User,
  Search,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AllTasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Все');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks(currentUser);
      setTasks(data);
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const filteredTasks = tasks
    .filter((t) => (statusFilter === 'Все' ? true : t.status === statusFilter))
    .filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.object?.name && t.object.name.toLowerCase().includes(search.toLowerCase())) ||
        (t.assignee?.full_name && t.assignee.full_name.toLowerCase().includes(search.toLowerCase()))
    );

  const statusCounts: Record<string, number> = {
    'Все': tasks.length,
    'Новая': 0,
    'В работе': 0,
    'На проверке': 0,
    'На доработке': 0,
    'Принята': 0,
  };
  for (const t of tasks) {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Панель постановщика</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Все задачи по всем объектам
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Единый реестр задач строительной компании
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по задаче, объекту или исполнителю..."
              className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
          </div>

          <span className="text-xs text-slate-400 self-end md:self-center font-medium">
            Показано задач: {filteredTasks.length} из {tasks.length}
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          {(['Все', 'Новая', 'В работе', 'На проверке', 'На доработке', 'Принята'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === st ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {statusCounts[st] || 0}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 h-24"></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Задачи не найдены</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? 'Попробуйте изменить параметры поиска'
              : `В статусе «${statusFilter}» задач нет`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tasks/${t.id}`)}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={t.status} size="sm" />
                  {t.object && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {t.object.name}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {t.title}
                </h3>

                {t.description && (
                  <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Исполнитель:{' '}
                    <strong className="text-slate-600 font-semibold">
                      {t.assignee?.full_name || 'Не назначен'}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Создана: {new Date(t.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 shrink-0 self-end sm:self-center">
                <span>Карточка задачи</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
