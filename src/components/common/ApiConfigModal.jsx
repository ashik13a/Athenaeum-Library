import React, { useState, useEffect } from 'react';
import { Settings2, X, Check, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { useBooks } from '../../context/BookContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

export function ApiConfigModal({ isOpen, onClose }) {
  const { apiEndpoint, updateApiEndpoint } = useBooks();
  const { showSuccess, showError } = useToast();

  const [inputUrl, setInputUrl] = useState(apiEndpoint);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setInputUrl(apiEndpoint);
      setTestResult(null);
    }
  }, [isOpen, apiEndpoint]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = inputUrl.trim().replace(/\/+$/, '');
      const response = await axios.get(`${cleanUrl}/view`, { timeout: 4000 });
      setTestResult({
        success: true,
        message: `Successfully connected! Status: ${response.status}`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}. Ensure your Express app has CORS enabled.`,
      });
    } finally {
      setTesting(false);
    }
  }

  function handleSave(e) {
    e.preventDefault();
    const cleanUrl = inputUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl) {
      showError('API URL cannot be empty');
      return;
    }
    updateApiEndpoint(cleanUrl);
    showSuccess('API Endpoint Updated', `Now connecting to: ${cleanUrl}`);
    onClose();
  }

  function handleResetDefault() {
    setInputUrl('http://localhost:3000/api');
    setTestResult(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="api-modal-title" className="text-base font-semibold text-slate-900">
                Backend API Configuration
              </h3>
              <p className="text-xs text-slate-500">Configure connection to Express REST API</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label htmlFor="api-url" className="block text-xs font-semibold text-slate-700 mb-1.5">
              API Base URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                id="api-url"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:3000/api"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Standard endpoints: <code className="text-indigo-600">POST /add</code>,{' '}
              <code className="text-indigo-600">GET /view</code>,{' '}
              <code className="text-indigo-600">PATCH /edit/:id</code>,{' '}
              <code className="text-indigo-600">DELETE /delete/:id</code>
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 break-words">{testResult.message}</div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Reset to default (localhost:3000/api)
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
