'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, X, Loader2, TrendingUp, Clock, Users, Target } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  type: 'campaign' | 'influencer' | 'brand'
  description?: string
  url: string
  metadata?: any
}

interface HeaderSearchProps {
  userRole?: string
  className?: string
  placeholder?: string
}

export function HeaderSearch({ 
  userRole = 'brand', 
  className = '',
  placeholder = 'Search campaigns, influencers...'
}: HeaderSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search - increased to 600ms for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true)
    const searchResults: SearchResult[] = []

    try {
      // Search campaigns
      if (userRole === 'brand' || userRole === 'influencer') {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, title, description, brand_id, category, status')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .eq('status', 'active')
          .limit(5)

        if (campaigns) {
          campaigns.forEach(campaign => {
            searchResults.push({
              id: campaign.id,
              title: campaign.title,
              type: 'campaign',
              description: campaign.description?.substring(0, 100) + '...',
              url: userRole === 'brand' && campaign.brand_id ? `/brand/campaigns/${campaign.id}` : `/influencer/campaigns/${campaign.id}`,
              metadata: { category: campaign.category, status: campaign.status }
            })
          })
        }
      }

      // Search influencers (for brands)
      if (userRole === 'brand') {
        const { data: influencers } = await supabase
          .from('user_profiles')
          .select(`
            id, 
            full_name, 
            username,
            influencer_profiles!inner(
              bio,
              categories,
              follower_count
            )
          `)
          .eq('role', 'influencer')
          .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .limit(3)

        if (influencers) {
          influencers.forEach(influencer => {
            const profile = influencer.influencer_profiles?.[0]
            searchResults.push({
              id: influencer.id,
              title: influencer.full_name || influencer.username || 'Influencer',
              type: 'influencer',
              description: profile?.bio?.substring(0, 100) || 'Influencer profile',
              url: `/influencer/${influencer.username || influencer.id}`,
              metadata: { 
                followers: profile?.follower_count,
                categories: profile?.categories
              }
            })
          })
        }
      }

      // Search brands (for influencers)
      if (userRole === 'influencer') {
        const { data: brands } = await supabase
          .from('user_profiles')
          .select(`
            id,
            full_name,
            brand_profiles!inner(
              company_name,
              description,
              industry
            )
          `)
          .eq('role', 'brand')
          .or(`full_name.ilike.%${searchQuery}%`)
          .limit(3)

        if (brands) {
          brands.forEach(brand => {
            const profile = brand.brand_profiles?.[0]
            searchResults.push({
              id: brand.id,
              title: profile?.company_name || brand.full_name || 'Brand',
              type: 'brand',
              description: profile?.description?.substring(0, 100) || 'Brand profile',
              url: `/brand/${brand.id}`,
              metadata: { industry: profile?.industry }
            })
          })
        }
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Save to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
      
      // Navigate to search results page with the query
      const searchQuery = query.trim()
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      
      // Clear the search after navigation
      setTimeout(() => {
        setShowResults(false)
        setQuery('')
      }, 100)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // Save search to recent
    const newRecent = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    
    setShowResults(false)
    setQuery('')
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <Target className="w-4 h-4 text-blue-500" />
      case 'influencer':
        return <Users className="w-4 h-4 text-purple-500" />
      case 'brand':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      default:
        return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
          )}
          
          {query && !isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 p-0.5 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (query || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
                <button
                  onClick={() => {
                    setRecentSearches([])
                    localStorage.removeItem('recentSearches')
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  <Clock className="w-3 h-3 mr-2 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={() => handleResultClick(result)}
                  className="flex items-start px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-1 mr-3">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {result.description}
                      </p>
                    )}
                    {result.metadata && (
                      <div className="flex items-center gap-2 mt-1">
                        {result.metadata.category && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {result.metadata.category}
                          </span>
                        )}
                        {result.metadata.followers && (
                          <span className="text-xs text-gray-500">
                            {result.metadata.followers.toLocaleString()} followers
                          </span>
                        )}
                        {result.metadata.industry && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            {result.metadata.industry}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {result.type}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {query && !isSearching && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <button
                onClick={handleSearch}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Search all →
              </button>
            </div>
          )}

          {/* View all results */}
          {query && results.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100">
              <button
                onClick={handleSearch}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}