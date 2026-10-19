import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, RefreshCw, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useToast } from '../context/ToastContext';
import { BookCard } from '../components/books/BookCard';
import { BookTableRow } from '../components/books/BookTableRow';
import { SearchBar } from '../components/books/SearchBar';
import { FilterBar } from '../components/books/FilterBar';
import { LoadingGrid, LoadingTable } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const ITEMS_PER_PAGE = 8;

export function BooksPage() {
  const { books, loading, error, refreshBooks, removeBook } = useBooks();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion modal state
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if query params change
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCat = searchParams.get('category');
    if (urlSearch !== null) setSearchQuery(urlSearch);
    if (urlCat !== null) setSelectedCategory(urlCat);
  }, [searchParams]);

  // Extract unique categories from actual book inventory
  const categories = useMemo(() => {
    const set = new Set();
    books.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search query filter (title, author, ISBN)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        (b) => b.category && b.category.trim().toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Availability filter
    if (availabilityFilter === 'in-stock') {
      result = result.filter((b) => (Number(b.availableCopies) || 0) > 0);
    } else if (availabilityFilter === 'out-of-stock') {
      result = result.filter((b) => (Number(b.availableCopies) || 0) === 0);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortBy === 'author') {
        return (a.author || '').localeCompare(b.author || '');
      }
      if (sortBy === 'year-desc') {
        return (Number(b.publishedYear) || 0) - (Number(a.publishedYear) || 0);
      }
      if (sortBy === 'availability') {
        return (Number(b.availableCopies) || 0) - (Number(a.availableCopies) || 0);
      }
      // 'newest' default
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [books, searchQuery, selectedCategory, availabilityFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, availabilityFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const isFiltered = Boolean(searchQuery || (selectedCategory && selectedCategory !== 'all') || availabilityFilter !== 'all');

  function handleResetFilters() {
    setSearchQuery('');
    setSelectedCategory('all');
    setAvailabilityFilter('all');
    setSortBy('newest');
    setSearchParams({});
  }

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
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Book Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, and manage all {books.length} physical volumes and circulation records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={refreshBooks}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/books/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </Link>
        </div>
      </div>

      {/* API Error state */}
      {error && (
        <ErrorState
          message={error}
          onRetry={refreshBooks}
          onOpenConfig={() => {
            const configBtn = document.querySelector('button[title="API Configuration"]');
            if (configBtn) configBtn.click();
          }}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            if (val) {
              setSearchParams((prev) => {
                prev.set('search', val);
                return prev;
              });
            } else {
              setSearchParams((prev) => {
                prev.delete('search');
                return prev;
              });
            }
          }}
          placeholder="Filter by title, author name, category, or ISBN..."
        />

        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            if (cat !== 'all') {
              setSearchParams((prev) => {
                prev.set('category', cat);
                return prev;
              });
            } else {
              setSearchParams((prev) => {
                prev.delete('category');
                return prev;
              });
            }
          }}
          availabilityFilter={availabilityFilter}
          onAvailabilityChange={setAvailabilityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={books.length}
          filteredCount={filteredBooks.length}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {filteredBooks.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {books.length}
          </span>{' '}
          volumes
        </div>
        {isFiltered && (
          <span className="text-indigo-600 font-medium">Active filters applied</span>
        )}
      </div>

      {/* Loading view */}
      {loading && books.length === 0 && (
        viewMode === 'grid' ? <LoadingGrid count={8} /> : <LoadingTable rows={6} />
      )}

      {/* Empty State: No books in DB */}
      {!loading && !error && books.length === 0 && (
        <EmptyState
          type="books"
          title="No Books in Catalog"
          description="Your library database contains no entries yet. Register a new book to start building your collection."
          actionText="Add New Book"
          actionHref="/books/add"
        />
      )}

      {/* Empty State: Search filter returned 0 results */}
      {!loading && books.length > 0 && filteredBooks.length === 0 && (
        <EmptyState
          type="search"
          title="No Matching Titles Found"
          description="No volumes in the catalog match your current search keywords or filters."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Populated Views: Grid or Table */}
      {!loading && filteredBooks.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedBooks.map((book) => (
                <BookCard
                  key={book._id || book.id}
                  book={book}
                  onDeleteClick={(b) => setBookToDelete(b)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Book Title & Author</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">ISBN</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedBooks.map((book) => (
                      <BookTableRow
                        key={book._id || book.id}
                        book={book}
                        onDeleteClick={(b) => setBookToDelete(b)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 px-1">
              <div className="text-xs text-slate-500">
                Page <span className="font-semibold text-slate-800 font-mono tabular-nums">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-800 font-mono tabular-nums">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs font-mono font-medium rounded-md transition-colors ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(bookToDelete)}
        title="Delete Volume"
        message={
          bookToDelete
            ? `Are you sure you want to permanently delete "${bookToDelete.title}" by ${bookToDelete.author}? This will remove all copies from the MongoDB collection.`
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
