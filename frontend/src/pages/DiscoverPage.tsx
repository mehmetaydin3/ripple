import { useState, useEffect } from 'react';
import { Search, Flame } from 'lucide-react';
import { OrgCard } from '../components/OrgCard';
import { api } from '../lib/api';
import { CATEGORY_LABELS } from '../lib/utils';

const CATEGORIES = ['ALL', 'ENVIRONMENT', 'HEALTH', 'EDUCATION', 'POVERTY', 'ANIMALS', 'DISASTER_RELIEF', 'COMMUNITY'];

export function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrendingOrgs().then(setTrending).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: '30' };
    if (category !== 'ALL') params.category = category;
    if (search) params.search = search;
    params.sort = 'trending';

    const timer = setTimeout(() => {
      api.getOrgs(params)
        .then((res) => setOrgs(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="Search causes, organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Trending row */}
      {trending.length > 0 && !search && category === 'ALL' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <h2 className="font-bold text-gray-900">Trending This Week</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {trending.map((org) => (
              <div key={org.id} className="flex-shrink-0 w-48">
                <OrgCard org={org} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? 'bg-[#5433FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {cat === 'ALL' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No organizations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {orgs.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}
