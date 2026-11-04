import React from 'react';
import type { UserRole } from '../types/crm';
import { ShieldAlert, HardHat } from 'lucide-react';

interface Props {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<Props> = ({ role, size = 'md' }) => {
  const isManager = role === 'manager';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${
        isManager
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
    >
      {isManager ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-indigo-600" />
          Постановщик
        </>
      ) : (
        <>
          <HardHat className="w-3.5 h-3.5 mr-1 text-amber-600" />
          Исполнитель
        </>
      )}
    </span>
  );
};
