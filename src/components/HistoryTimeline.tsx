import React from 'react';
import type { TaskHistoryItem } from '../types/crm';
import { StatusBadge } from './StatusBadge';
import { RoleBadge } from './RoleBadge';
import { History, MessageSquare, ArrowRight, User } from 'lucide-react';

interface Props {
  history: TaskHistoryItem[];
  loading?: boolean;
}

export const HistoryTimeline: React.FC<Props> = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-5 bg-slate-100 rounded w-1/4"></div>
        <div className="h-16 bg-slate-50 rounded-xl"></div>
        <div className="h-16 bg-slate-50 rounded-xl"></div>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-semibold text-slate-800">История изменений</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-auto">
          Записей: {history.length}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">История изменений пуста</p>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {history.map((item) => (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-200 group-hover:scale-125 transition-transform" />

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 transition hover:bg-slate-50 hover:shadow-xs">
                {/* Header of history entry */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {item.user?.full_name || 'Пользователь системы'}
                    </span>
                    {item.user?.role && <RoleBadge role={item.user.role} size="sm" />}
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Status Transition */}
                <div className="flex items-center gap-2 my-2.5">
                  {item.from_status ? (
                    <>
                      <StatusBadge status={item.from_status} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <StatusBadge status={item.to_status} size="sm" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Создание задачи:</span>
                      <StatusBadge status={item.to_status} size="sm" />
                    </div>
                  )}
                </div>

                {/* Comment (if any) */}
                {item.comment && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex items-start gap-2 shadow-2xs">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="whitespace-pre-wrap leading-relaxed">{item.comment}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
