import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Library,
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/books/StatCard';
import { BookCard } from '../components/books/BookCard';
import { CategoryDistribution } from '../components/dashboard/CategoryDistribution';
import { LoadingSpinner, LoadingGrid } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function DashboardPage() {
  const { books, loading, error, refreshBooks, removeBook } = useBooks();
  const { showSuccess, showError } = useToast();

  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute aggregate metrics
  const totalTitles = books.length;
  const totalCopies = books.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0);
  const availableCopies = books.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0);
  const borrowedCopies = Math.max(0, totalCopies - availableCopies);
  const uniqueCategories = new Set(books.map((b) => b.category?.trim()).filter(Boolean)).size;

  // Recent books (sorted by latest, up to 4)
  const recentBooks = [...books]
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0; // retain catalog order if no timestamp
    })
    .slice(0, 4);

  async function handleDeleteConfirm() {
    if (!bookToDelete) return;
    const bookId = bookToDelete._id || bookToDelete.id;
    setIsDeleting(true);
    try {
      await removeBook(bookId);
      showSuccess('Volume Deleted', `"${bookToDelete.title}" was removed from the catalog.`);
      setBookToDelete(null);
    } catch (err) {
      showError('Failed to delete volume', err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <Library className="w-3.5 h-3.5" />
            <span>Circulation & Inventory Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Library Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Real-time catalog analytics, physical inventory status, and circulation tracking connected directly to your Express REST backend.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={refreshBooks}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh catalog from API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/books/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </Link>
        </div>
      </div>

      {/* Error state if API call failed */}
      {error && (
        <ErrorState
          message={error}
          onRetry={refreshBooks}
          onOpenConfig={() => {
            // Find and click the config button in navbar or trigger modal
            const configBtn = document.querySelector('button[title="API Configuration"]');
            if (configBtn) configBtn.click();
          }}
        />
      )}

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Titles"
          value={totalTitles}
          subtitle="Cataloged unique volumes"
          icon={BookOpen}
          accent="indigo"
        />
        <StatCard
          label="Total Copies"
          value={totalCopies}
          subtitle="Physical holdings in library"
          icon={Layers}
          accent="blue"
        />
        <StatCard
          label="Available Copies"
          value={availableCopies}
          subtitle="On shelf and ready to loan"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Active Circulation"
          value={borrowedCopies}
          subtitle="Currently checked out"
          icon={Clock}
          accent="amber"
        />
      </div>

      {/* Loading State */}
      {loading && books.length === 0 && (
        <div className="py-8">
          <LoadingSpinner text="Fetching inventory from REST API..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && books.length === 0 && (
        <EmptyState
          type="books"
          title="Library Catalog is Empty"
          description="Your connected Express & MongoDB backend returned zero books. Add your first book to begin tracking copies and circulation."
          actionText="Register First Book"
          actionHref="/books/add"
        />
      )}

      {/* Main Content Sections: Recent Books & Category Distribution */}
      {books.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Recently Added Books (8 cols) */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Recently Added Titles</h3>
                <p className="text-xs text-slate-500">Latest volumes entered into the collection</p>
              </div>
              <Link
                to="/books"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View all {totalTitles} books</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recentBooks.map((book) => (
                <BookCard
                  key={book._id || book.id}
                  book={book}
                  onDeleteClick={(b) => setBookToDelete(b)}
                />
              ))}
            </div>
          </section>

          {/* Right: Category Distribution Breakdown (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <CategoryDistribution books={books} />

            {/* Quick Circulation Stats Panel */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Shelf Utilization
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Available Rate</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 leading-relaxed">
                <span className="font-medium text-slate-700">{uniqueCategories}</span> distinct categories represent your library holdings.
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={Boolean(bookToDelete)}
        title="Delete Volume"
        message={
          bookToDelete
            ? `Are you sure you want to permanently delete "${bookToDelete.title}" by ${bookToDelete.author}? This will remove all copies from the MongoDB database.`
            : ''
        }
        confirmLabel="Confirm Delete"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setBookToDelete(null)}
      />
    </div>
  );
}
