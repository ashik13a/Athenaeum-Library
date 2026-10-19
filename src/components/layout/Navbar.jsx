import React, { useState } from 'react';
import { Menu, Search, Plus, BookOpen, Settings } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import avatarImg from '../../assets/images/download.jpg';

export function Navbar({ onOpenMobile, onOpenConfig }) {
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/books?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    } else {
      navigate('/books');
    }
  }

  // Derive breadcrumb / page title
  function getPageHeader() {
    const path = location.pathname;
    if (path === '/') return { title: 'Library Dashboard', category: 'Overview' };
    if (path === '/books') return { title: 'Book Catalog', category: 'Inventory' };
    if (path === '/books/add') return { title: 'Register New Book', category: 'Cataloging' };
    if (path.startsWith('/books/edit/')) return { title: 'Edit Volume Details', category: 'Cataloging' };
    if (path.startsWith('/books/')) return { title: 'Volume Information', category: 'Details' };
    return { title: 'Library System', category: 'Athenaeum' };
  }

  const header = getPageHeader();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Contextual Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Athenaeum</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-600 font-medium">{header.category}</span>
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight leading-none mt-1 truncate">
            {header.title}
          </h2>
        </div>
      </div>

      {/* Middle: Quick Search form */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center flex-1 max-w-md mx-4"
      >
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </form>

      {/* Right: Action CTA & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenConfig}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="API Configuration"
          aria-label="API Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {location.pathname !== '/books/add' && (
          <Link
            to="/books/add"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </Link>
        )}

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Librarian Avatar Placeholder */}
        <div className="flex items-center gap-2.5 pl-1">
          <img
            src={avatarImg}
            alt="Library Director profile"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
            onError={(e) => {
              // Graceful fallback if image path issues
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">Iftekher Ahmed</p>
            <p className="text-[11px] text-slate-500 leading-tight">Head Librarian</p>
          </div>
        </div>
      </div>
    </header>
  );
}
