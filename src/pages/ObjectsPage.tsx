import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ConstructionObject, TaskStatus } from '../types/crm';
import { ObjectModal } from '../components/ObjectModal';
import {
  Building2,
  MapPin,
  Plus,
  Search,
  CheckSquare,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const ObjectsPage: React.FC = () => {
  const { currentUser, isManager, isAssignee } = useAuth();
  const navigate = useNavigate();

  const [objects, setObjects] = useState<ConstructionObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<ConstructionObject | null>(null);

  const fetchObjects = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getObjects(currentUser);
      setObjects(data);
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки объектов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, [currentUser]);

  const handleCreate = async (data: { name: string; address: string }) => {
    if (!currentUser) return;
    await api.createObject(data, currentUser);
    await fetchObjects();
  };

  const handleUpdate = async (data: { name: string; address: string }) => {
    if (!currentUser || !editingObject) return;
    await api.updateObject(editingObject.id, data, currentUser);
    setEditingObject(null);
    await fetchObjects();
  };

  const handleDelete = async (obj: ConstructionObject, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (window.confirm(`Вы уверены, что хотите удалить объект «${obj.name}» и все его задачи?`)) {
      try {
        await api.deleteObject(obj.id, currentUser);
        await fetchObjects();
      } catch (err: any) {
        alert(err?.message || 'Ошибка удаления');
      }
    }
  };

  const filteredObjects = objects.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Объекты строительства</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isManager
              ? 'Полный список всех строительных площадок компании'
              : 'Объекты, на которых у вас есть назначенные задачи (согласно правилам RLS)'}
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-100 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить объект</span>
          </button>
        )}
      </div>

      {/* RLS Notification banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Безопасность (RLS):</strong>{' '}
          {isManager
            ? 'Как постановщик, вы имеете полный доступ к созданию, редактированию и просмотру всех объектов.'
            : 'Как исполнитель, вы видите только те объекты, где у вас есть хотя бы одна активная или назначенная задача.'}
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или адресу..."
            className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-2xs"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs">
          Найдено: {filteredObjects.length}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Objects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
              <div className="h-6 bg-slate-100 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="h-10 bg-slate-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredObjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Объекты не найдены</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {search
              ? 'Попробуйте изменить поисковый запрос'
              : isAssignee
              ? 'У вас пока нет назначенных задач ни на одном объекте'
              : 'Создайте первый строительный объект, чтобы начать работу'}
          </p>
          {isManager && !search && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Создать объект
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredObjects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => navigate(`/objects/${obj.id}`)}
              className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-1">
                      {obj.name}
                    </h3>
                  </div>

                  {isManager && (
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingObject(obj)}
                        title="Редактировать объект"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(obj, e)}
                        title="Удалить объект"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 pl-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{obj.address}</span>
                </div>

                {/* Tasks Status Breakdown */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                      Задачи ({obj.task_count || 0})
                    </span>
                  </div>

                  {obj.tasks_by_status && obj.task_count && obj.task_count > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(['Новая', 'В работе', 'На проверке', 'На доработке', 'Принята'] as TaskStatus[]).map(
                        (st) => {
                          const count = obj.tasks_by_status?.[st] || 0;
                          if (count === 0) return null;
                          return (
                            <span
                              key={st}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200/80 font-medium text-slate-700 flex items-center gap-1 shadow-2xs"
                            >
                              <span>{st}:</span>
                              <span className="font-bold text-slate-900">{count}</span>
                            </span>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Нет активных задач</p>
                  )}
                </div>
              </div>

              {/* Footer link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                <span>Перейти к задачам объекта</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ObjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ObjectModal
        isOpen={Boolean(editingObject)}
        onClose={() => setEditingObject(null)}
        onSubmit={handleUpdate}
        initialData={editingObject}
      />
    </div>
  );
};
