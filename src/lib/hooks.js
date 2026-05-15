// src/lib/hooks.js
// Custom React hooks — debounce, throttle, infinite scroll etc.

'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ── useDebounce ────────────────────────────────────────────
// Search input ke liye — user type karna band kare tab API call ho
// Usage: const debouncedQuery = useDebounce(searchQuery, 400)
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)   // Cleanup on every keystroke
  }, [value, delay])

  return debouncedValue
}

// ── useThrottle ────────────────────────────────────────────
// Scroll events ke liye — har 200ms mein ek baar hi fire ho
// Usage: const throttledScroll = useThrottle(scrollHandler, 200)
export function useThrottle(callback, delay = 200) {
  const lastCall = useRef(0)

  return useCallback((...args) => {
    const now = Date.now()
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      callback(...args)
    }
  }, [callback, delay])
}

// ── useSearch ──────────────────────────────────────────────
// Search functionality with debounce + API call
export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([])
      return
    }

    const controller = new AbortController()

    const search = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal }
        )

        if (!res.ok) throw new Error(`Search failed: ${res.status}`)

        const data = await res.json()
        setResults(data.results || [])
      } catch (err) {
        if (err.name === 'AbortError') return    // Ignore cancelled requests
        setError('Search fail ho gayi. Dobara try karein.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    search()
    return () => controller.abort()   // Cancel previous request on new query
  }, [debouncedQuery])

  return { query, setQuery, results, loading, error }
}

// ── useInfiniteScroll ──────────────────────────────────────
// Load more posts as user scrolls down
export function useInfiniteScroll({ fetchMore, hasMore }) {
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    if (!hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMore()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [fetchMore, hasMore])

  return { loadMoreRef }
}

// ── useLocalStorage ────────────────────────────────────────
// Cookie consent, theme preference etc. ke liye
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (err) {
      console.error('localStorage error:', err)
    }
  }, [key])

  return [storedValue, setValue]
}

// ── useOnline ─────────────────────────────────────────────
// Network status detect karo
export function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return isOnline
}

// ── useFetch ───────────────────────────────────────────────
// Generic API fetch with loading, error, caching
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cache = useRef({})

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()

    const fetchData = async () => {
      // Return cached data if available
      if (cache.current[url]) {
        setData(cache.current[url])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const json = await res.json()
        cache.current[url] = json    // Cache the result
        setData(json)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Kuch galat ho gaya')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [url])

  return { data, loading, error }
}

// ── useReadingProgress ─────────────────────────────────────
// Blog post mein reading progress bar ke liye
export function useReadingProgress() {
  const [progress, setProgress] = useState(0)

  const updateProgress = useThrottle(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
    setProgress(Math.min(100, percent))
  }, 100)

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [updateProgress])

  return progress
}
