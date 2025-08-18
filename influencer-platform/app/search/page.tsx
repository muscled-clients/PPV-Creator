import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Target, Users, Building2, Filter, ChevronRight, Calendar, DollarSign, MapPin } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    category?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: userData } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Await searchParams
  const params = await searchParams
  const query = params.q || ''
  const filterType = params.type || 'all'
  const filterCategory = params.category || 'all'

  // Perform search based on query
  let campaigns: any[] = []
  let influencers: any[] = []
  let brands: any[] = []

  if (query) {
    // Search campaigns
    if (filterType === 'all' || filterType === 'campaigns') {
      const { data } = await supabase
        .from('campaigns')
        .select(`
          *,
          brand_profiles(
            company_name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(20)
      
      campaigns = data || []
    }

    // Search influencers (for brands)
    if (userData?.role === 'brand' && (filterType === 'all' || filterType === 'influencers')) {
      const { data } = await supabase
        .from('user_profiles')
        .select(`
          *,
          influencer_profiles(
            bio,
            categories,
            follower_count
          )
        `)
        .eq('role', 'influencer')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(20)
      
      influencers = data || []
    }

    // Search brands (for influencers)
    if (userData?.role === 'influencer' && (filterType === 'all' || filterType === 'brands')) {
      const { data } = await supabase
        .from('user_profiles')
        .select(`
          *,
          brand_profiles(
            company_name,
            description,
            industry,
            location,
            website
          )
        `)
        .eq('role', 'brand')
        .or(`full_name.ilike.%${query}%`)
        .limit(20)
      
      brands = data || []
    }
  }

  const totalResults = campaigns.length + influencers.length + brands.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href={`/${userData?.role}/dashboard`}
              className="text-gray-500 hover:text-gray-700 mr-2"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-900">Search Results</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? (
              <>Search results for "<span className="text-blue-600">{query}</span>"</>
            ) : (
              'Search'
            )}
          </h1>
          
          {query && (
            <p className="text-gray-600 mt-2">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/search?q=${query}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Results
          </Link>
          <Link
            href={`/search?q=${query}&type=campaigns`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'campaigns'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Campaigns ({campaigns.length})
          </Link>
          {userData?.role === 'brand' && (
            <Link
              href={`/search?q=${query}&type=influencers`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'influencers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Influencers ({influencers.length})
            </Link>
          )}
          {userData?.role === 'influencer' && (
            <Link
              href={`/search?q=${query}&type=brands`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'brands'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Brands ({brands.length})
            </Link>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Campaigns */}
          {campaigns.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={
                      userData?.role === 'brand' && campaign.brand_id === user.id
                        ? `/brand/campaigns/${campaign.id}`
                        : `/influencer/campaigns/${campaign.id}`
                    }
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                      {campaign.categories && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {campaign.categories}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${campaign.price_per_post}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(campaign.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Influencers */}
          {influencers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Influencers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {influencers.map((influencer) => {
                  const profile = influencer.influencer_profiles?.[0]
                  return (
                    <Link
                      key={influencer.id}
                      href={`/influencer/${influencer.username || influencer.id}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          {influencer.avatar_url ? (
                            <img
                              src={influencer.avatar_url}
                              alt={influencer.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {influencer.full_name?.charAt(0) || 'I'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {influencer.full_name || influencer.username}
                          </h3>
                          <p className="text-sm text-gray-500">
                            @{influencer.username || 'influencer'}
                          </p>
                          {profile && (
                            <>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {profile.bio}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{profile.follower_count?.toLocaleString()} followers</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-green-500" />
                Brands
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand) => {
                  const profile = brand.brand_profiles?.[0]
                  return (
                    <Link
                      key={brand.id}
                      href={`/brand/${brand.id}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.company_name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {profile?.company_name || brand.full_name}
                          </h3>
                          {profile && (
                            <>
                              <p className="text-sm text-gray-500">
                                {profile.industry}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {profile.description}
                              </p>
                              {profile.location && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {profile.location}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* No results */}
          {totalResults === 0 && query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

          {/* No query */}
          {!query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-500">
                Enter a search term to find campaigns, {userData?.role === 'brand' ? 'influencers' : 'brands'}, and more
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}