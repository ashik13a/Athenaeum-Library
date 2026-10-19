import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  Barcode,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, removeBook, loading } = useBooks();
  const { showSuccess, showError } = useToast();

  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Retrieve book from local catalog cache
  const book = getBookById(id);

  async function handleDeleteConfirm() {
    if (!id) return;
    setIsDeleting(true);
    try {
      await removeBook(id);
      showSuccess('Volume Deleted', `"${book?.title || 'Book'}" was removed from the collection.`);
      navigate('/books');
    } catch (err) {
      showError('Failed to delete book', err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner text="Retrieving volume details from catalog..." />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-12 shadow-2xs">
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Volume Not Found</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The book record matching identifier <code className="font-mono text-indigo-600 bg-slate-100 px-1.5 py-0.5 rounded text-xs">{id}</code> is not present in the current catalog. It may have been removed or entered under a different identifier.
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const bookId = book._id || book.id;
  const total = Number(book.totalCopies) || 0;
  const available = Number(book.availableCopies) || 0;
  const borrowed = Math.max(0, total - available);
  const availabilityPercent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;
  const isOutOfStock = available === 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <Link
          to="/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Books</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/books/edit/${bookId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Book</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Book</span>
          </button>
        </div>
      </div>

      {/* Main Book Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Book Cover Artwork (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60">
              {book.coverImage && !imgError ? (
                <img
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/50">
                  <div className="space-y-1">
                    <span className="text-xs font-mono tracking-widest text-indigo-700 uppercase">
                      {book.category || 'General'}
                    </span>
                    <p className="text-xs font-mono text-slate-400">
                      {book.publishedYear ? `Est. ${book.publishedYear}` : ''}
                    </p>
                  </div>
                  <div className="my-auto py-4">
                    <h4 className="text-lg font-bold text-slate-800 leading-snug">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2">by {book.author}</p>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-3 border-t border-slate-200">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-mono">{book.isbn ? `ISBN ${book.isbn}` : ''}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] font-mono text-slate-400">
                System Record ID: {bookId}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Book Details & Inventory Tracking (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Author Header */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
            {/* Unboxed clean metadata line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-700">{book.category || 'Uncategorized'}</span>
              {book.publishedYear && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono tabular-nums">Published {book.publishedYear}</span>
                </>
              )}
              {book.isbn && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-mono">ISBN: {book.isbn}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {book.title}
            </h1>

            <p className="text-base text-slate-600 font-medium">
              by <span className="text-slate-900 font-semibold">{book.author}</span>
            </p>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Synopsis & Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {book.description?.trim() ||
                  'No extended synopsis provided for this volume in the catalog record.'}
              </p>
            </div>
          </div>

          {/* Holdings & Circulation Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">Physical Copy Availability</h3>
              </div>
              <span className={`text-xs font-semibold ${isOutOfStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                {isOutOfStock ? 'All Copies Checked Out' : 'Available on Shelf'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Holdings
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                  {total}
                </span>
                <span className="text-[11px] text-slate-400">Total cataloged copies</span>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Available Copies
                </span>
                <span className="text-xl font-bold text-emerald-900 font-mono tabular-nums mt-1 block">
                  {available}
                </span>
                <span className="text-[11px] text-emerald-600">Ready for loan</span>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                  Circulating Copies
                </span>
                <span className="text-xl font-bold text-amber-900 font-mono tabular-nums mt-1 block">
                  {borrowed}
                </span>
                <span className="text-[11px] text-amber-600">Currently borrowed</span>
              </div>
            </div>

            {/* Availability progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Shelf Availability</span>
                <span className="font-mono tabular-nums font-medium text-slate-800">
                  {availabilityPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOutOfStock
                      ? 'bg-amber-500'
                      : availabilityPercent < 30
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${availabilityPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Technical Bibliographic Specifications */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Bibliographic Specifications
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Standard ISBN</dt>
                <dd className="font-mono text-slate-800 font-semibold mt-0.5">{book.isbn || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Subject Classification</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{book.category || 'General'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Year of Publication</dt>
                <dd className="font-mono text-slate-800 mt-0.5">{book.publishedYear || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Entry Timestamp</dt>
                <dd className="font-mono text-slate-800 mt-0.5">
                  {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'Active Record'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Volume"
        message={`Are you sure you want to permanently delete "${book.title}" by ${book.author}? All ${total} physical copies will be deleted from your MongoDB database.`}
        confirmLabel="Confirm Delete"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
