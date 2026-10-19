import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, BookOpen, AlertCircle, Check, Sparkles } from 'lucide-react';
import coverArch from '../../assets/images/cover_architecture_1792389804012.jpg';
import coverLit from '../../assets/images/cover_literature_1792389805368.jpg';

const COMMON_CATEGORIES = [
  'Computer Science',
  'Literature & Fiction',
  'Science & Technology',
  'History & Biography',
  'Philosophy & Ethics',
  'Architecture & Design',
  'Economics & Business',
  'Psychology',
];

export function BookForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  cancelHref = '/books',
}) {
  const currentYear = new Date().getFullYear();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    publishedYear: '',
    totalCopies: '',
    availableCopies: '',
    coverImage: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [previewError, setPreviewError] = useState(false);

  // Pre-fill if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        category: initialData.category || '',
        description: initialData.description || '',
        publishedYear: initialData.publishedYear !== undefined ? String(initialData.publishedYear) : '',
        totalCopies: initialData.totalCopies !== undefined ? String(initialData.totalCopies) : '',
        availableCopies: initialData.availableCopies !== undefined ? String(initialData.availableCopies) : '',
        coverImage: initialData.coverImage || '',
      });
      setPreviewError(false);
    }
  }, [initialData]);

  // Reset preview error if coverImage changes
  useEffect(() => {
    setPreviewError(false);
  }, [formData.coverImage]);

  // Sync available copies with total copies if creating and available is empty
  function handleTotalCopiesChange(val) {
    setFormData((prev) => {
      const updated = { ...prev, totalCopies: val };
      if (!isEdit && (prev.availableCopies === '' || prev.availableCopies === prev.totalCopies)) {
        updated.availableCopies = val;
      }
      return updated;
    });
  }

  // Validate form fields
  function validate(values) {
    const errs = {};

    if (!values.title.trim()) {
      errs.title = 'Title is required';
    }

    if (!values.author.trim()) {
      errs.author = 'Author name is required';
    }

    if (!values.isbn.trim()) {
      errs.isbn = 'ISBN is required';
    } else {
      const cleanIsbn = values.isbn.replace(/[-\s]/g, '');
      if (cleanIsbn.length < 9 || cleanIsbn.length > 17) {
        errs.isbn = 'Please provide a valid 10 or 13-digit ISBN';
      }
    }

    if (!values.category.trim()) {
      errs.category = 'Category is required';
    }

    const yearNum = Number(values.publishedYear);
    if (!values.publishedYear) {
      errs.publishedYear = 'Publication year is required';
    } else if (isNaN(yearNum) || yearNum < 1400 || yearNum > currentYear + 1) {
      errs.publishedYear = `Enter a realistic year between 1400 and ${currentYear + 1}`;
    }

    const totalNum = Number(values.totalCopies);
    if (values.totalCopies === '' || values.totalCopies === null) {
      errs.totalCopies = 'Total copies is required';
    } else if (isNaN(totalNum) || totalNum < 1 || !Number.isInteger(totalNum)) {
      errs.totalCopies = 'Must be at least 1 copy';
    }

    const availNum = Number(values.availableCopies);
    if (values.availableCopies === '' || values.availableCopies === null) {
      errs.availableCopies = 'Available copies is required';
    } else if (isNaN(availNum) || availNum < 0 || !Number.isInteger(availNum)) {
      errs.availableCopies = 'Cannot be negative';
    } else if (!isNaN(totalNum) && availNum > totalNum) {
      errs.availableCopies = `Cannot exceed total copies (${totalNum})`;
    }

    if (values.coverImage && values.coverImage.trim()) {
      try {
        new URL(values.coverImage.trim());
      } catch {
        // Only warn if not a local relative path
        if (!values.coverImage.startsWith('/') && !values.coverImage.startsWith('data:')) {
          errs.coverImage = 'Please enter a valid URL (http://... or https://...)';
        }
      }
    }

    return errs;
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const formErrors = validate(formData);
    setErrors(formErrors);
  }

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const updated = { ...formData, [field]: value };
      const formErrors = validate(updated);
      setErrors(formErrors);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formErrors = validate(formData);
    setErrors(formErrors);
    setTouched({
      title: true,
      author: true,
      isbn: true,
      category: true,
      publishedYear: true,
      totalCopies: true,
      availableCopies: true,
      coverImage: true,
    });

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    // Determine changed fields for PATCH if in edit mode
    if (isEdit && initialData) {
      const dirtyFields = {};
      Object.keys(formData).forEach((key) => {
        let currentVal = formData[key];
        let originalVal = initialData[key];

        // normalize numbers vs strings
        if (key === 'publishedYear' || key === 'totalCopies' || key === 'availableCopies') {
          if (Number(currentVal) !== Number(originalVal)) {
            dirtyFields[key] = Number(currentVal);
          }
        } else {
          currentVal = (currentVal || '').trim();
          originalVal = (originalVal || '').trim();
          if (currentVal !== originalVal) {
            dirtyFields[key] = currentVal;
          }
        }
      });

      // Submit only modified fields
      onSubmit(formData, dirtyFields);
    } else {
      onSubmit(formData, formData);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 2-column layout: Left form fields, Right cover preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Primary Details */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Volume Metadata
            </h3>

            {/* Title */}
            <div>
              <label htmlFor="book-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Book Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder="e.g., Structure and Interpretation of Computer Programs"
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.title && touched.title
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
              {errors.title && touched.title && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Author & ISBN Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="book-author" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Author(s) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-author"
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  onBlur={() => handleBlur('author')}
                  placeholder="e.g., Harold Abelson, Gerald Jay Sussman"
                  className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.author && touched.author
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.author && touched.author && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.author}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="book-isbn" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ISBN <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-isbn"
                  type="text"
                  required
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  onBlur={() => handleBlur('isbn')}
                  placeholder="e.g., 978-0262510875"
                  className={`w-full px-3.5 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.isbn && touched.isbn
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.isbn && touched.isbn && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.isbn}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Category & Published Year Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="book-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-category"
                  type="text"
                  list="category-suggestions"
                  required
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  onBlur={() => handleBlur('category')}
                  placeholder="e.g., Computer Science"
                  className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.category && touched.category
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                <datalist id="category-suggestions">
                  {COMMON_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {errors.category && touched.category && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.category}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="book-year" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Published Year <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-year"
                  type="number"
                  min="1400"
                  max={currentYear + 1}
                  required
                  value={formData.publishedYear}
                  onChange={(e) => handleChange('publishedYear', e.target.value)}
                  onBlur={() => handleBlur('publishedYear')}
                  placeholder="e.g., 2021"
                  className={`w-full px-3.5 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.publishedYear && touched.publishedYear
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.publishedYear && touched.publishedYear && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.publishedYear}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="book-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Summary
              </label>
              <textarea
                id="book-description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief synopsis, edition notes, or table of contents overview..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Card: Inventory & Copies */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Inventory & Physical Circulation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="total-copies" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Copies in Collection <span className="text-rose-500">*</span>
                </label>
                <input
                  id="total-copies"
                  type="number"
                  min="1"
                  required
                  value={formData.totalCopies}
                  onChange={(e) => handleTotalCopiesChange(e.target.value)}
                  onBlur={() => handleBlur('totalCopies')}
                  placeholder="e.g., 5"
                  className={`w-full px-3.5 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.totalCopies && touched.totalCopies
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.totalCopies && touched.totalCopies && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.totalCopies}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="available-copies" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Available Copies (On Shelf) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="available-copies"
                  type="number"
                  min="0"
                  required
                  value={formData.availableCopies}
                  onChange={(e) => handleChange('availableCopies', e.target.value)}
                  onBlur={() => handleBlur('availableCopies')}
                  placeholder="e.g., 3"
                  className={`w-full px-3.5 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.availableCopies && touched.availableCopies
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.availableCopies && touched.availableCopies && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.availableCopies}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cover Image & Live Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Cover Artwork
            </h3>

            <div>
              <label htmlFor="cover-url" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cover Image URL
              </label>
              <input
                id="cover-url"
                type="url"
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                onBlur={() => handleBlur('coverImage')}
                placeholder="https://example.com/cover.jpg"
                className={`w-full px-3 py-2 text-xs font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.coverImage && touched.coverImage
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              />
              {errors.coverImage && touched.coverImage && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.coverImage}</span>
                </p>
              )}
            </div>

            {/* Quick sample covers */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Use Sample Visual Cover:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('coverImage', coverArch)}
                  className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Architecture
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('coverImage', coverLit)}
                  className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Literature
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="pt-3">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Live Preview:</span>
              <div className="w-full aspect-[3/4] rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex flex-col items-center justify-center text-center p-4">
                {formData.coverImage && !previewError ? (
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    referrerPolicy="no-referrer"
                    onError={() => setPreviewError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="space-y-2 text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium text-slate-500">
                      {formData.title ? formData.title : 'Book Title Preview'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formData.author ? `by ${formData.author}` : 'No cover URL provided'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Submission Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <Link
          to={cancelHref}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isEdit ? 'Saving Changes...' : 'Creating Book...'}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Register Book'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
