import axios from 'axios';

// Storage key for user-configured API URL override
const API_URL_STORAGE_KEY = 'athenaeum_api_base_url';

/**
 * Returns the effective base URL for the backend API.
 * Priority:
 * 1. User runtime localStorage override (useful if backend runs on e.g. port 5000 or custom host)
 * 2. Vite environment variable VITE_API_BASE_URL
 * 3. Default: http://localhost:3000/api
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(API_URL_STORAGE_KEY);
    if (stored && stored.trim() !== '') {
      return stored.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:3000/api';
}

/**
 * Persists a new base URL to localStorage.
 */
export function setCustomApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem(API_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(API_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
    }
    // Update the axios instance baseURL
    apiClient.defaults.baseURL = getApiBaseUrl();
  }
}

// Create dedicated Axios instance
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Update baseURL on each request in case of runtime change
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

/**
 * Parse books from various backend response shapes:
 * - { message, allBooks: [...] }
 * - { allBooks: [...] }
 * - { message, book: [...] }
 * - { books: [...] }
 * - { data: [...] }
 * - direct array [...]
 */
export function extractBooksFromResponse(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  if (typeof data === 'object') {
    if (Array.isArray(data.allBooks)) return data.allBooks;
    if (Array.isArray(data.books)) return data.books;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.book)) return data.book;
  }
  return [];
}

/**
 * Parse a single book from create/update response shapes:
 * - { message, book: {...} }
 * - { message, edit: {...} }
 * - { book: {...} }
 * - { edit: {...} }
 * - direct object {...}
 */
export function extractSingleBookFromResponse(data) {
  if (!data || typeof data !== 'object') return null;

  if (data.book && typeof data.book === 'object' && !Array.isArray(data.book)) return data.book;
  if (data.edit && typeof data.edit === 'object' && !Array.isArray(data.edit)) return data.edit;
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;

  // If the object itself has book fields
  if ('title' in data && 'isbn' in data) {
    return data;
  }
  return null;
}

/**
 * Normalizes backend error messages into readable format
 */
export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.status === 404) {
      return 'The requested resource or endpoint was not found (404).';
    }
    if (error.response?.status === 400) {
      return 'Validation error: Please check all required book fields.';
    }
    if (error.response?.status === 500) {
      return 'Server error (500) from Express backend.';
    }
    if (error.code === 'ERR_NETWORK') {
      return `Network connection failed. Could not reach backend at ${getApiBaseUrl()}. Check if your Express + MongoDB server is running on port 3000 and CORS is enabled.`;
    }
    return error.message || 'An unexpected network error occurred.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred while communicating with the library server.';
}

/**
 * Library API Services
 */
export const bookService = {
  /**
   * GET /view — fetch all books
   */
  async getAll() {
    const response = await apiClient.get('/view');
    return extractBooksFromResponse(response.data);
  },

  /**
   * POST /add — create a book
   */
  async create(bookData) {
    const payload = {
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn.trim(),
      category: bookData.category.trim(),
      description: bookData.description.trim(),
      publishedYear: Number(bookData.publishedYear),
      totalCopies: Number(bookData.totalCopies),
      availableCopies: Number(bookData.availableCopies),
      coverImage: bookData.coverImage ? bookData.coverImage.trim() : undefined,
    };
    const response = await apiClient.post('/add', payload);
    const parsed = extractSingleBookFromResponse(response.data);
    if (!parsed) {
      // Return payload with synthetic identifier if server responded with message only
      return {
        _id: response.data?._id || response.data?.id || `book_${Date.now()}`,
        ...payload,
      };
    }
    return parsed;
  },

  /**
   * PATCH /edit/:id — update a book
   * Only sends modified fields where practical
   */
  async update(id, updates) {
    const payload = {};

    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.author !== undefined) payload.author = updates.author.trim();
    if (updates.isbn !== undefined) payload.isbn = updates.isbn.trim();
    if (updates.category !== undefined) payload.category = updates.category.trim();
    if (updates.description !== undefined) payload.description = updates.description.trim();
    if (updates.publishedYear !== undefined && updates.publishedYear !== '') {
      payload.publishedYear = Number(updates.publishedYear);
    }
    if (updates.totalCopies !== undefined && updates.totalCopies !== '') {
      payload.totalCopies = Number(updates.totalCopies);
    }
    if (updates.availableCopies !== undefined && updates.availableCopies !== '') {
      payload.availableCopies = Number(updates.availableCopies);
    }
    if (updates.coverImage !== undefined) {
      payload.coverImage = updates.coverImage ? updates.coverImage.trim() : '';
    }

    const response = await apiClient.patch(`/edit/${id}`, payload);
    const parsed = extractSingleBookFromResponse(response.data);
    if (!parsed) {
      return {
        _id: id,
        ...payload,
      };
    }
    return parsed;
  },

  /**
   * DELETE /delete/:id — delete a book
   */
  async delete(id) {
    const response = await apiClient.delete(`/delete/${id}`);
    return response.data || { message: 'Book deleted successfully' };
  },

  /**
   * Ping /view to verify connectivity
   */
  async ping() {
    try {
      await apiClient.get('/view', { timeout: 4000 });
      return true;
    } catch {
      return false;
    }
  },
};
