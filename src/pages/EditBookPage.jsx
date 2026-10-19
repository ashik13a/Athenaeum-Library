import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, BookX } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useToast } from '../context/ToastContext';
import { BookForm } from '../components/books/BookForm';
import { LoadingSpinner } from '../components/common/LoadingState';
import { getApiErrorMessage } from '../services/api';

export function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, editBook, loading } = useBooks();
  const { showSuccess, showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve book from local cache without inventing an endpoint
  const book = getBookById(id);

  async function handleUpdateBook(fullFormData, dirtyFields) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      // Send dirty fields if any were modified; if none changed, notify user
      if (Object.keys(dirtyFields).length === 0) {
        showSuccess('No Changes Detected', 'The volume metadata was not modified.');
        navigate(`/books/${id}`);
        return;
      }

      await editBook(id, dirtyFields);
      showSuccess('Volume Updated', `Modifications to "${fullFormData.title}" were saved.`);
      navigate(`/books/${id}`);
    } catch (err) {
      const message = getApiErrorMessage(err);
      showError('Failed to update volume', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Locating book record in catalog..." />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <BookX className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Volume Not Found</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The requested book identifier <code className="font-mono text-indigo-600 bg-slate-50 px-1 py-0.5 rounded">{id}</code> could not be found in the active catalog.
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <Link
          to={`/books/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Book Details</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Edit Volume Information
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Update bibliographic details, total holdings, or availability. Modified fields will be patched via REST.
            </p>
          </div>
        </div>
      </div>

      {/* Book Form with Pre-filled Data */}
      <BookForm
        initialData={book}
        onSubmit={handleUpdateBook}
        isSubmitting={isSubmitting}
        isEdit={true}
        cancelHref={`/books/${id}`}
      />
    </div>
  );
}
