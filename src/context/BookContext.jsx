import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  bookService,
  getApiBaseUrl,
  setCustomApiBaseUrl,
  getApiErrorMessage,
} from '../services/api';

const BookContext = createContext(null);

export function BookProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiEndpoint, setApiEndpointState] = useState(getApiBaseUrl());
  const [isHealthy, setIsHealthy] = useState(null);

  /**
   * Fetch all books from GET /view
   */
  const refreshBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookService.getAll();
      setBooks(Array.isArray(data) ? data : []);
      setIsHealthy(true);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      setIsHealthy(false);
      // Keep existing books in state or empty if initial
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshBooks();
  }, [refreshBooks]);

  /**
   * Update the active backend API URL
   */
  const updateApiEndpoint = useCallback((newUrl) => {
    setCustomApiBaseUrl(newUrl);
    setApiEndpointState(getApiBaseUrl());
    refreshBooks();
  }, [refreshBooks]);

  /**
   * Find a book by its MongoDB _id or id from the loaded list
   */
  const getBookById = useCallback((id) => {
    if (!id || !books) return undefined;
    return books.find((b) => (b._id && String(b._id) === String(id)) || (b.id && String(b.id) === String(id)));
  }, [books]);

  /**
   * Create a new book via POST /add
   */
  const addBook = useCallback(async (bookData) => {
    const created = await bookService.create(bookData);
    // Refresh to get canonical state from MongoDB
    await refreshBooks();
    return created;
  }, [refreshBooks]);

  /**
   * Update a book via PATCH /edit/:id
   */
  const editBook = useCallback(async (id, updates) => {
    const updated = await bookService.update(id, updates);
    // Refresh to get canonical state
    await refreshBooks();
    return updated;
  }, [refreshBooks]);

  /**
   * Delete a book via DELETE /delete/:id
   */
  const removeBook = useCallback(async (id) => {
    await bookService.delete(id);
    // Optimistically filter and refresh
    setBooks((prev) => prev.filter((b) => b._id !== id && b.id !== id));
    await refreshBooks();
  }, [refreshBooks]);

  return (
    <BookContext.Provider
      value={{
        books,
        loading,
        error,
        apiEndpoint,
        isHealthy,
        refreshBooks,
        updateApiEndpoint,
        getBookById,
        addBook,
        editBook,
        removeBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}
