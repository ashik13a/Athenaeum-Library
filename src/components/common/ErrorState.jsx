import React from 'react';
import { AlertCircle, RefreshCw, Settings2, ServerOff } from 'lucide-react';
import { useBooks } from '../../context/BookContext';

export function ErrorState({ message, onRetry, onOpenConfig }) {
  const { apiEndpoint } = useBooks();

  return (
    <div className="bg-white rounded-xl border border-rose-200/90 p-8 my-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
          <ServerOff className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">API Connection Issue</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {apiEndpoint}
            </span>
          </div>

          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {message || 'Unable to connect to the Express REST API backend.'}
          </p>

          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-700">Troubleshooting Steps:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Confirm your Express.js & MongoDB backend server is running.</li>
              <li>Ensure CORS is enabled on the Express server (`app.use(cors())`).</li>
              <li>
                If your backend runs on a different port (e.g., port 5000 or 8080), click{' '}
                <strong>Configure API URL</strong> below to point to it.
              </li>
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            )}

            {onOpenConfig && (
              <button
                type="button"
                onClick={onOpenConfig}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Settings2 className="w-4 h-4 text-slate-500" />
                <span>Configure API URL</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
