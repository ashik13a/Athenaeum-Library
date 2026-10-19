import React from 'react';

export function StatCard({ label, value, subtitle, icon: Icon, accent = 'indigo' }) {
  const accentClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }[accent] || 'bg-slate-50 text-slate-600 border-slate-100';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${accentClasses}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
