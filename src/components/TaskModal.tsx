import React, { useState, useEffect } from 'react';
import type { Task, ConstructionObject, UserProfile } from '../types/crm';
import { CheckSquare, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    object_id: string;
    assignee_id?: string | null;
  }) => Promise<void>;
  initialData?: Task | null;
  objects: ConstructionObject[];
  assignees: UserProfile[];
  defaultObjectId?: string;
}

export const TaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  objects,
  assignees,
  defaultObjectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectId, setObjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setObjectId(initialData.object_id);
      setAssigneeId(initialData.assignee_id || '');
    } else {
      setTitle('');
      setDescription('');
      setObjectId(defaultObjectId || (objects.length > 0 ? objects[0].id : ''));
      setAssigneeId('');
    }
    setError(null);
  }, [initialData, isOpen, defaultObjectId, objects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Пожалуйста, укажите название задачи');
      return;
    }
    if (!objectId) {
      setError('Пожалуйста, выберите строительный объект');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        object_id: objectId,
        assignee_id: assigneeId ? assigneeId : null,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ошибка сохранения задачи');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Редактировать задачу' : 'Новая задача по объекту'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Название задачи <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="например: Монтаж системы вентиляции паркинга"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Объект строительства <span className="text-rose-500">*</span>
            </label>
            <select
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              disabled={Boolean(initialData)} // Moving task between objects is disabled in edit
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition disabled:bg-slate-50"
            >
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name} ({obj.address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Назначить исполнителя
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            >
              <option value="">-- Без назначения (назначить позже) --</option>
              {assignees.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.full_name} ({worker.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Подробное описание задачи
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите требования, спецификацию материалов, отметки и сроки выполнения..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 rounded-xl shadow-xs transition"
            >
              {submitting ? 'Сохранение...' : initialData ? 'Сохранить изменения' : 'Создать задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
