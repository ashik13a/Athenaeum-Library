import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookCopy, PlusCircle, Library, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBooks } from '../../context/BookContext';

export function Sidebar({ mobileOpen, onCloseMobile, onOpenConfig }) {
  const { isHealthy, apiEndpoint } = useBooks();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'All Books', href: '/books', icon: BookCopy },
    { name: 'Add Book', href: '/books/add', icon: PlusCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Library className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              Athenaeum
            </h1>
            <p className="text-xs text-slate-400 mt-1 truncate">Library Management</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Catalog Management
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom API connection indicator */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">API Connection</span>
            <button
              type="button"
              onClick={onOpenConfig}
              className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              title="Configure API URL"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenConfig}
            className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              {isHealthy === true && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              {isHealthy === false && (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              {isHealthy === null && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin shrink-0" />
              )}
              <span className="text-xs font-medium text-slate-800 truncate">
                {isHealthy === true
                  ? 'Connected'
                  : isHealthy === false
                  ? 'Disconnected'
                  : 'Checking...'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              {apiEndpoint}
            </p>
          </button>
        </div>
      </aside>
    </>
  );
}
