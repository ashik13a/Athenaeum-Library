import React from 'react';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CategoryDistribution({ books = [] }) {
  // Aggregate statistics by category
  const categoryMap = books.reduce((acc, book) => {
    const cat = book.category || 'Uncategorized';
    if (!acc[cat]) {
      acc[cat] = { count: 0, copies: 0 };
    }
    acc[cat].count += 1;
    acc[cat].copies += Number(book.totalCopies) || 0;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryMap)
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      copies: stats.copies,
    }))
    .sort((a, b) => b.count - a.count);

  const totalTitles = books.length;

  if (sortedCategories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Category Distribution</h3>
        <p className="text-xs text-slate-500">No categorized volumes registered yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">Collection by Category</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {sortedCategories.length} Categories
        </span>
      </div>

      <div className="space-y-3.5 pt-1">
        {sortedCategories.slice(0, 6).map((item) => {
          const percent = totalTitles > 0 ? Math.round((item.count / totalTitles) * 100) : 0;

          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Link
                  to={`/books?category=${encodeURIComponent(item.category)}`}
                  className="font-medium text-slate-700 hover:text-indigo-600 truncate max-w-[200px]"
                >
                  {item.category}
                </Link>
                <div className="flex items-center gap-2 text-slate-500 font-mono tabular-nums">
                  <span>{item.count} titles</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-700">{percent}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
