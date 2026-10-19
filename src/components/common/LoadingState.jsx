import React from 'react';

export function LoadingGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-4 animate-pulse"
        >
          {/* Cover skeleton */}
          <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg" />
          {/* Text lines */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          {/* Metadata line */}
          <div className="h-3 bg-slate-100 rounded w-full mt-auto" />
        </div>
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 6 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-1/6" />
        <div className="h-4 bg-slate-200 rounded w-1/6" />
        <div className="h-4 bg-slate-200 rounded w-1/6" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-10 h-14 bg-slate-100 rounded shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-2/5" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
            <div className="h-4 bg-slate-100 rounded w-20" />
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      {text && <p className="text-sm font-medium mt-3 text-slate-600">{text}</p>}
    </div>
  );
}
