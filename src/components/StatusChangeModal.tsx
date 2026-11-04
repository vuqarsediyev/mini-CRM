import React, { useState } from 'react';
import type { TaskStatus } from '../types/crm';
import { StatusBadge } from './StatusBadge';
import { AlertCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string | null) => Promise<void>;
  currentStatus: TaskStatus;
  targetStatus: TaskStatus;
  taskTitle: string;
}

export const StatusChangeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  targetStatus,
  taskTitle,
}) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCommentRequired = targetStatus === 'На доработке';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isCommentRequired && !comment.trim()) {
      setError('При возврате задачи на доработку комментарий обязателен!');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(comment.trim() || null);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ошибка смены статуса');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">Смена статуса задачи</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Задача</p>
            <p className="text-sm font-medium text-slate-800 line-clamp-2 mt-0.5">{taskTitle}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Текущий статус</p>
              <StatusBadge status={currentStatus} size="sm" />
            </div>
            <div className="text-slate-400 font-bold">→</div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Новый статус</p>
              <StatusBadge status={targetStatus} size="sm" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              {isCommentRequired ? (
                <>
                  Комментарий к доработке <span className="text-rose-500">* (обязателен)</span>
                </>
              ) : (
                'Комментарий (необязательно)'
              )}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isCommentRequired
                  ? 'Укажите конкретные замечания, что именно нужно исправить или доделать...'
                  : 'Добавьте комментарий или примечание к этому переходу...'
              }
              rows={4}
              required={isCommentRequired}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
                isCommentRequired && !comment.trim() && error
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />
            {isCommentRequired && (
              <p className="text-xs text-slate-500 mt-1">
                Согласно ТЗ, переход «На проверке» → «На доработке» невозможен без комментария.
              </p>
            )}
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
              disabled={submitting || (isCommentRequired && !comment.trim())}
              className={`px-5 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition flex items-center gap-1.5 ${
                targetStatus === 'Принята'
                  ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
                  : targetStatus === 'На доработке'
                  ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'
              }`}
            >
              {submitting ? 'Сохранение...' : `Перевести в «${targetStatus}»`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
