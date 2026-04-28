'use client'
import { useCallback, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'

export function useSearch() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setQuery = usePlayerStore((s) => s.setSearchQuery)
  const setResults = usePlayerStore((s) => s.setSearchResults)
  const setLoading = usePlayerStore((s) => s.setSearchLoading)
  const setError = usePlayerStore((s) => s.setSearchError)

  const search = useCallback(
    async (query: string) => {
      setQuery(query)
      if (!query.trim()) {
        setResults([], false)
        return
      }

      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          if (!res.ok) throw new Error('Search failed')
          const data = await res.json()
          setResults(data.results || [])
        } catch {
          setError('Search failed. Please try again.')
        }
      }, 400)
    },
    [setQuery, setResults, setLoading, setError]
  )

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQuery('')
    setResults([], false)
  }, [setQuery, setResults])

  return { search, clearSearch }
}
