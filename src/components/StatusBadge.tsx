import React from 'react';
import type { TaskStatus } from '../types/crm';
import { Sparkles, Play, Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const configs: Record<
    TaskStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    'Новая': {
      label: 'Новая',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
    },
    'В работе': {
      label: 'В работе',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <Play className="w-3.5 h-3.5 mr-1 fill-amber-600" />,
    },
    'На проверке': {
      label: 'На проверке',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-300',
      icon: <Clock className="w-3.5 h-3.5 mr-1" />,
    },
    'Принята': {
      label: 'Принята',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
    },
    'На доработке': {
      label: 'На доработке',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: <RotateCcw className="w-3.5 h-3.5 mr-1" />,
    },
  };

  const c = configs[status] || configs['Новая'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${c.bg} ${c.text} ${c.border} ${sizeClasses[size]}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
};
