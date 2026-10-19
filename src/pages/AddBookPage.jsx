import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookPlus } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { useToast } from '../context/ToastContext';
import { BookForm } from '../components/books/BookForm';
import { getApiErrorMessage } from '../services/api';

export function AddBookPage() {
  const { addBook } = useBooks();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateBook(formData) {
    setIsSubmitting(true);
    try {
      const created = await addBook(formData);
      showSuccess('Book Registered Successfully', `"${formData.title}" was added to the library collection.`);
      // Redirect to catalog or new book
      const targetId = created?._id || created?.id;
      if (targetId) {
        navigate(`/books/${targetId}`);
      } else {
        navigate('/books');
      }
    } catch (err) {
      const message = getApiErrorMessage(err);
      showError('Failed to register book', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation & Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <Link
          to="/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Register New Volume
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enter bibliographic details, physical copy counts, and cover artwork for your catalog.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <BookForm
        onSubmit={handleCreateBook}
        isSubmitting={isSubmitting}
        isEdit={false}
        cancelHref="/books"
      />
    </div>
  );
}
