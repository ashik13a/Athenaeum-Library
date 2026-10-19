import React from 'react';
import { BookOpen, SearchX, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  type = 'books',
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) {
  const isSearch = type === 'search';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200/80 my-4">
      <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-4">
        {isSearch ? (
          <SearchX className="w-7 h-7 text-slate-500" strokeWidth={1.5} />
        ) : (
          <BookOpen className="w-7 h-7 text-slate-500" strokeWidth={1.5} />
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {title || (isSearch ? 'No matching books found' : 'No books in library')}
      </h3>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description ||
          (isSearch
            ? 'Try adjusting your search keywords, clearing selected category filters, or browsing all titles.'
            : 'Get started by adding your first volume to the collection.')}
      </p>

      {actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText || 'Add First Book'}</span>
        </Link>
      )}

      {onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <span>{actionText || 'Reset Filters'}</span>
        </button>
      )}
    </div>
  );
}
