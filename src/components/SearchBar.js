// src/components/SearchBar.js
'use client'
import { useState, useRef, useEffect } from 'react'
import { useSearch } from '@/lib/hooks'
import { nicheConfig } from '@/config/site.config'

export default function SearchBar({ className = '' }) {
  const { query, setQuery, results, loading, error } = useSearch()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { site } = nicheConfig

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    setQuery(e.target.value)
    setOpen(true)
  }

  const showDropdown = open && query.length >= 2

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Search karo..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
          style={{ '--tw-ring-color': site.themeColor }}
          aria-label="Search posts"
          autoComplete="off"
        />
        {/* Search icon */}
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">

          {/* Error state */}
          {error && (
            <div className="px-4 py-3 text-sm text-red-500 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* No results */}
          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-6 text-center">
              <p className="text-gray-400 text-sm">"{query}" ke liye koi result nahi mila</p>
              <p className="text-gray-300 text-xs mt-1">Doosra keyword try karein</p>
            </div>
          )}

          {/* Results list */}
          {results.map(post => (
            <a
              key={post.slug}
              href={`/${post.slug}`}
              onClick={() => { setOpen(false); setQuery('') }}
              className="flex gap-3 items-start px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 capitalize">{post.category?.replace(/-/g, ' ')}</span>
                  <span className="text-gray-200">•</span>
                  <span className="text-xs text-gray-400">{post.reading_time} min read</span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
