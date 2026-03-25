import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Waves } from 'lucide-react';
import { FeedCard } from '../components/FeedCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'everyone' | 'following'>('everyone');
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (p = 1, replace = true) => {
    try {
      const fn = tab === 'following' ? api.getFollowingFeed : api.getFeed;
      const data = await fn(p);
      if (replace) {
        setActions(data.data);
      } else {
        setActions((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);
      setPage(p);
    } catch (e) {
      console.error(e);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchFeed(1, true).finally(() => setLoading(false));
  }, [fetchFeed]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchFeed(1, true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchFeed(page + 1, false);
    setLoadingMore(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('everyone')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'everyone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Everyone
          </button>
          <button
            onClick={() => {
              if (!user) return;
              setTab('following');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'following' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Following
          </button>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : actions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌊</div>
          <p className="text-gray-500 font-medium">
            {tab === 'following'
              ? 'Follow someone to see their activity here.'
              : 'No activity yet. Be the first to make a ripple.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <FeedCard key={action.id} action={action} onReactionAdded={() => {}} />
          ))}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 text-sm font-medium text-[#5433FF] hover:bg-[#EEF0FF] rounded-xl transition-colors"
            >
              {loadingMore ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                </span>
              ) : (
                'Load more'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
