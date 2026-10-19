import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Edit2, Trash2, Eye } from 'lucide-react';

export function BookCard({ book, onDeleteClick }) {
  const [imgError, setImgError] = useState(false);

  const bookId = book._id || book.id;
  const total = Number(book.totalCopies) || 0;
  const available = Number(book.availableCopies) || 0;
  const availabilityPercent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;
  const isOutOfStock = available === 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col overflow-hidden">
      {/* Cover visual container with 3:4 aspect ratio */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
        {book.coverImage && !imgError ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          /* High-polish book spine CSS fallback */
          <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 border-b border-slate-200/50">
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest text-indigo-700 uppercase">
                {book.category || 'General'}
              </span>
              <p className="text-xs font-mono text-slate-400">
                {book.publishedYear ? `Est. ${book.publishedYear}` : 'Cataloged'}
              </p>
            </div>

            <div className="my-auto py-2">
              <h4 className="text-sm font-bold text-slate-800 line-clamp-3 leading-snug">
                {book.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                by {book.author}
              </p>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-200/60">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-mono">{book.isbn ? `ISBN ${book.isbn}` : ''}</span>
            </div>
          </div>
        )}

        {/* Quick view overlay button on hover */}
        <Link
          to={`/books/${bookId}`}
          className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs"
          aria-label={`View details for ${book.title}`}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-lg shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </span>
        </Link>
      </div>

      {/* Book Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed clean metadata with · separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span className="font-medium text-indigo-700">{book.category || 'General'}</span>
            {book.publishedYear && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-mono tabular-nums">{book.publishedYear}</span>
              </>
            )}
          </div>

          <h3 className="text-sm font-semibold text-slate-900 mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={book.title}>
            <Link to={`/books/${bookId}`}>{book.title}</Link>
          </h3>

          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={book.author}>
            by {book.author}
          </p>

          <p className="text-[11px] font-mono text-slate-400 mt-1.5 tracking-tight truncate">
            ISBN: {book.isbn || 'N/A'}
          </p>
        </div>

        {/* Inventory availability indicator & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Circulation</span>
            <span className={`font-mono tabular-nums font-medium ${isOutOfStock ? 'text-amber-600' : 'text-slate-700'}`}>
              {available} <span className="text-slate-400">/</span> {total} copies
            </span>
          </div>

          {/* Availability progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOutOfStock
                  ? 'bg-amber-500'
                  : availabilityPercent < 30
                  ? 'bg-amber-400'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${availabilityPercent}%` }}
            />
          </div>

          {/* Action links */}
          <div className="flex items-center justify-between pt-1">
            <Link
              to={`/books/${bookId}`}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Details
            </Link>

            <div className="flex items-center gap-1">
              <Link
                to={`/books/edit/${bookId}`}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                title="Edit volume"
                aria-label={`Edit ${book.title}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDeleteClick(book)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Delete volume"
                aria-label={`Delete ${book.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
