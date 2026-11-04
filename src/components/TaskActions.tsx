import React, { useState } from 'react';
import type { Task, TaskStatus } from '../types/crm';
import { useAuth } from '../context/AuthContext';
import { StatusChangeModal } from './StatusChangeModal';
import { Play, Send, CheckCircle2, RotateCcw, Lock } from 'lucide-react';

interface Props {
  task: Task;
  onStatusChange: (newStatus: TaskStatus, comment: string | null) => Promise<void>;
}

export const TaskActions: React.FC<Props> = ({ task, onStatusChange }) => {
  const { currentUser, isManager, isAssignee } = useAuth();
  const [modalTarget, setModalTarget] = useState<TaskStatus | null>(null);

  if (!currentUser) return null;

  const isAssignedToMe = isAssignee && task.assignee_id === currentUser.id;

  // Compute available actions strictly according to requirements:
  const availableActions: Array<{
    status: TaskStatus;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    description: string;
    needsModal: boolean;
  }> = [];

  if (task.status === 'Новая' && isAssignedToMe) {
    availableActions.push({
      status: 'В работе',
      label: 'Взять в работу',
      icon: <Play className="w-4 h-4 fill-current" />,
      colorClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      description: 'Начать выполнение задачи',
      needsModal: false,
    });
  } else if (task.status === 'В работе' && isAssignedToMe) {
    availableActions.push({
      status: 'На проверке',
      label: 'Отправить на проверку',
      icon: <Send className="w-4 h-4" />,
      colorClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      description: 'Сдать выполненную работу постановщику',
      needsModal: true, // optional comment
    });
  } else if (task.status === 'На проверке' && isManager) {
    availableActions.push({
      status: 'Принята',
      label: 'Принять задачу',
      icon: <CheckCircle2 className="w-4 h-4" />,
      colorClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      description: 'Подтвердить выполнение без замечаний',
      needsModal: true, // optional acceptance comment
    });
    availableActions.push({
      status: 'На доработке',
      label: 'Вернуть на доработку',
      icon: <RotateCcw className="w-4 h-4" />,
      colorClass: 'bg-rose-600 hover:bg-rose-700 text-white',
      description: 'Вернуть исполнителю с обязательным комментарием',
      needsModal: true, // mandatory comment
    });
  } else if (task.status === 'На доработке' && isAssignedToMe) {
    availableActions.push({
      status: 'В работе',
      label: 'Взять в работу',
      icon: <Play className="w-4 h-4 fill-current" />,
      colorClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      description: 'Приступить к исправлению замечаний',
      needsModal: false,
    });
  }

  const handleActionClick = async (action: (typeof availableActions)[0]) => {
    if (action.needsModal) {
      setModalTarget(action.status);
    } else {
      await onStatusChange(action.status, null);
    }
  };

  const handleModalSubmit = async (comment: string | null) => {
    if (!modalTarget) return;
    await onStatusChange(modalTarget, comment);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Доступные действия
        </h3>
        <span className="text-xs text-slate-400">
          {isManager ? 'Вы: Постановщик' : isAssignedToMe ? 'Вы: Назначенный исполнитель' : 'Вы: Исполнитель (не назначены)'}
        </span>
      </div>

      {availableActions.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {availableActions.map((action) => (
            <button
              key={action.status}
              onClick={() => handleActionClick(action)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm shadow-xs transition transform active:scale-95 ${action.colorClass}`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-500 text-sm flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {task.status === 'Принята'
              ? 'Задача принята. Цикл выполнения завершён.'
              : isAssignee && !isAssignedToMe
              ? 'Вы не назначены исполнителем этой задачи.'
              : task.status === 'Новая'
              ? 'Ожидает, пока назначенный исполнитель возьмёт задачу в работу.'
              : task.status === 'В работе'
              ? 'Задача сейчас в работе у исполнителя.'
              : task.status === 'На проверке'
              ? 'Задача отправлена на проверку постановщику.'
              : 'Задача находится на доработке у исполнителя.'}
          </span>
        </div>
      )}

      {modalTarget && (
        <StatusChangeModal
          isOpen={Boolean(modalTarget)}
          onClose={() => setModalTarget(null)}
          onSubmit={handleModalSubmit}
          currentStatus={task.status}
          targetStatus={modalTarget}
          taskTitle={task.title}
        />
      )}
    </div>
  );
};
