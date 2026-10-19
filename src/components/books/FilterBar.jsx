import React from 'react';
import { LayoutGrid, List, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';

export function FilterBar({
  categories = [],
  selectedCategory,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount = 0,
  filteredCount = 0,
  onResetFilters,
  isFiltered = false,
}) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
      {/* Filters group */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Category dropdown */}
        <div className="relative min-w-[150px]">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200/90 text-slate-700 py-2 pl-3 pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Availability segmented buttons */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => onAvailabilityChange('all')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              availabilityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onAvailabilityChange('in-stock')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              availabilityFilter === 'in-stock'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => onAvailabilityChange('out-of-stock')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              availabilityFilter === 'out-of-stock'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Out of Stock
          </button>
        </div>

        {/* Reset button if active filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Clear all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right side: Sort order & Grid/List switcher */}
      <div className="flex items-center justify-between lg:justify-end gap-3">
        {/* Sort select */}
        <div className="relative min-w-[160px]">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200/90 text-slate-700 py-2 pl-3 pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs"
            aria-label="Sort books by"
          >
            <option value="newest">Recently Added</option>
            <option value="title-asc">Title (A → Z)</option>
            <option value="title-desc">Title (Z → A)</option>
            <option value="author">Author Name</option>
            <option value="year-desc">Published Year (Newest)</option>
            <option value="availability">Available Copies (High)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* View mode toggle (Grid vs Table) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Grid view"
            aria-label="Switch to grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Table view"
            aria-label="Switch to table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
