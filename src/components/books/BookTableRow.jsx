import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Eye, BookOpen } from 'lucide-react';

export function BookTableRow({ book, onDeleteClick }) {
  const [imgError, setImgError] = useState(false);
  const bookId = book._id || book.id;
  const total = Number(book.totalCopies) || 0;
  const available = Number(book.availableCopies) || 0;

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0 text-sm">
      {/* Thumbnail + Title & Author */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200/60">
            {book.coverImage && !imgError ? (
              <img
                src={book.coverImage}
                alt={book.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50/50 text-indigo-500">
                <BookOpen className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/books/${bookId}`}
              className="font-medium text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 block"
              title={book.title}
            >
              {book.title}
            </Link>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{book.author}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
        {book.category || 'General'}
      </td>

      {/* ISBN */}
      <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
        {book.isbn || '—'}
      </td>

      {/* Year */}
      <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
        {book.publishedYear || '—'}
      </td>

      {/* Inventory Copies */}
      <td className="py-3 px-4 font-mono tabular-nums text-xs whitespace-nowrap">
        <span className={available === 0 ? 'text-amber-600 font-semibold' : 'text-slate-800'}>
          {available}
        </span>
        <span className="text-slate-400"> / {total}</span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/books/${bookId}`}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="View Details"
            aria-label={`View ${book.title}`}
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/books/edit/${bookId}`}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Edit Book"
            aria-label={`Edit ${book.title}`}
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(book)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Delete Book"
            aria-label={`Delete ${book.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
