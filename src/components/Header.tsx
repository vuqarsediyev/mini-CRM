import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { TestRunnerModal } from './TestRunnerModal';
import {
  Building2,
  LogOut,
  ChevronDown,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';

export const Header: React.FC<{ onDataChanged?: () => void }> = ({ onDataChanged }) => {
  const { currentUser, role, isManager, isAssignee, logout, switchUser, availableUsers } = useAuth();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Сбросить демо-данные к исходному состоянию (как в seed.sql)?')) {
      api.resetDemoData();
      if (onDataChanged) onDataChanged();
      window.location.reload();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/objects" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-base block leading-tight">
                    СтройТрест CRM
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 block leading-tight">
                    Объекты и задачи
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              {currentUser && (
                <nav className="hidden md:flex items-center gap-1.5">
                  <Link
                    to="/objects"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                      location.pathname.startsWith('/objects')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Объекты
                  </Link>

                  {isAssignee && (
                    <Link
                      to="/my-tasks"
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                        location.pathname === '/my-tasks'
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Мои задачи
                    </Link>
                  )}

                  {isManager && (
                    <Link
                      to="/tasks"
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                        location.pathname === '/tasks'
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Все задачи
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Right Tools & User Info */}
            <div className="flex items-center gap-3">
              {/* Test Runner Button */}
              <button
                onClick={() => setShowTestModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Тестирование ТЗ</span>
              </button>

              {/* Reset Data Button */}
              <button
                onClick={handleResetData}
                title="Сбросить демо-данные"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {currentUser && role && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {currentUser.full_name.split(' ')[0]}
                      </p>
                      <RoleBadge role={role} size="sm" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {currentUser.full_name[0]}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Switcher Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-semibold">
                          Текущий пользователь
                        </p>
                        <p className="text-sm font-bold text-slate-800">{currentUser.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                      </div>

                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400 uppercase font-semibold mb-1 px-1">
                          Быстрое переключение роли:
                        </p>
                        <div className="space-y-1">
                          {availableUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                switchUser(u);
                                setShowUserDropdown(false);
                                if (onDataChanged) onDataChanged();
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                                u.id === currentUser.id
                                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="truncate mr-2">
                                <span className="block truncate">{u.full_name}</span>
                                <span className="text-[10px] text-slate-400">{u.email}</span>
                              </div>
                              <RoleBadge role={u.role} size="sm" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={async () => {
                            setShowUserDropdown(false);
                            await logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Выйти из системы
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <TestRunnerModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        onRefreshData={onDataChanged}
      />
    </>
  );
};
