import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { BookProvider } from './context/BookContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { AddBookPage } from './pages/AddBookPage';
import { EditBookPage } from './pages/EditBookPage';
import { BookDetailsPage } from './pages/BookDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <BookProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="books" element={<BooksPage />} />
              <Route path="books/add" element={<AddBookPage />} />
              <Route path="books/edit/:id" element={<EditBookPage />} />
              <Route path="books/:id" element={<BookDetailsPage />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BookProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
