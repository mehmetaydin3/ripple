import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Waves, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatAmount, timeAgo } from '../lib/utils';
import { Avatar } from '../components/Avatar';

export function RipplesPage() {
  const { user, setShowSignInModal } = useAuth();
  const [ripples, setRipples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRipples().then((res) => setRipples(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-[#5433FF]" />
          <h1 className="font-bold text-xl text-gray-900">Active Ripples</h1>
        </div>
        <button
          onClick={() => { if (!user) setShowSignInModal(true); }}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#5433FF] px-3 py-1.5 rounded-xl hover:bg-[#EEF0FF] transition-colors"
        >
          <Plus className="w-4 h-4" /> Start one
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-2 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : ripples.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌊</div>
          <p className="text-gray-500 font-medium">No active ripples yet.</p>
          <p className="text-gray-400 text-sm mt-1">Start one to inspire others!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ripples.map((ripple) => (
            <Link
              key={ripple.id}
              to={`/ripples/${ripple.id}`}
              className="card p-4 block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar src={ripple.startedBy.avatar} name={ripple.startedBy.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{ripple.title}</h3>
                  <p className="text-xs text-gray-400">
                    by {ripple.startedBy.name} · {timeAgo(ripple.createdAt)}
                  </p>
                </div>
                <Link
                  to={`/orgs/${ripple.org.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 text-xs font-medium bg-[#EEF0FF] text-[#5433FF] px-2 py-1 rounded-full hover:bg-[#E0E4FF] transition-colors"
                >
                  {ripple.org.name}
                </Link>
              </div>

              {ripple.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ripple.description}</p>
              )}

              {ripple.targetAmount && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-[#5433FF]">{formatAmount(ripple.currentAmount)}</span>
                    <span className="text-gray-400">of {formatAmount(ripple.targetAmount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5433FF] to-[#7C7FFF] rounded-full transition-all"
                      style={{ width: `${Math.min((ripple.currentAmount / ripple.targetAmount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                <span>👥 {ripple.participantCount} people</span>
                {ripple.expiresAt && (
                  <span>⏱ {timeAgo(ripple.expiresAt)} left</span>
                )}
              </div>

              {/* Participant chain */}
              {ripple.actions && ripple.actions.length > 0 && (
                <div className="flex items-center gap-1 mt-3 overflow-hidden">
                  {ripple.actions.slice(0, 5).map((a: any, i: number) => (
                    <div key={a.id} className="flex items-center">
                      {i > 0 && <span className="text-gray-300 text-xs mx-0.5">→</span>}
                      <Avatar src={a.user.avatar} name={a.user.name} size="sm" />
                    </div>
                  ))}
                  {ripple.participantCount > 5 && (
                    <span className="text-xs text-gray-400 ml-1">+{ripple.participantCount - 5} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
