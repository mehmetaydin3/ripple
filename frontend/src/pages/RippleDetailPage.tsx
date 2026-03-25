import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatAmount, timeAgo, CATEGORY_GRADIENTS } from '../lib/utils';
import { Avatar } from '../components/Avatar';
import { FeedCard } from '../components/FeedCard';
import { ActionModal } from '../components/ActionModal';

export function RippleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, setShowSignInModal } = useAuth();
  const [ripple, setRipple] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const load = () => {
    if (!id) return;
    api.getRipple(id).then(setRipple).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-2 bg-gray-200 rounded mb-4" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!ripple) return <div className="text-center py-16 text-gray-500">Ripple not found.</div>;

  const gradient = CATEGORY_GRADIENTS[ripple.org.category] || 'from-gray-400 to-gray-600';
  const progress = ripple.targetAmount ? Math.min((ripple.currentAmount / ripple.targetAmount) * 100, 100) : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-28">
      {/* Org link */}
      <Link to={`/orgs/${ripple.org.slug}`} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
        {ripple.org.imageUrl ? (
          <img src={ripple.org.imageUrl} alt={ripple.org.name} className="w-10 h-10 rounded-xl object-cover" />
        ) : (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient}`} />
        )}
        <span className="font-medium text-gray-700">{ripple.org.name}</span>
      </Link>

      {/* Ripple header */}
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-[#EEF0FF] rounded-xl flex items-center justify-center flex-shrink-0">
            <Waves className="w-5 h-5 text-[#5433FF]" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">{ripple.title}</h1>
            <p className="text-sm text-gray-500">
              Started by <Link to={`/users/${ripple.startedBy.id}`} className="text-[#5433FF] font-medium">{ripple.startedBy.name}</Link> · {timeAgo(ripple.createdAt)}
            </p>
          </div>
        </div>

        {ripple.description && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{ripple.description}</p>
        )}

        {progress !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-[#5433FF] text-lg">{formatAmount(ripple.currentAmount)}</span>
              <span className="text-gray-400">of {formatAmount(ripple.targetAmount)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5433FF] to-[#7C7FFF] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{progress.toFixed(0)}% of goal</div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>👥 {ripple.participantCount} people</span>
          {ripple.expiresAt && <span>⏱ {timeAgo(ripple.expiresAt)} left</span>}
        </div>
      </div>

      {/* Chain visualization */}
      {ripple.actions && ripple.actions.length > 0 && (
        <div className="card p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">The chain</h2>
          <div className="flex items-center flex-wrap gap-2">
            {ripple.actions.map((a: any, i: number) => (
              <div key={a.id} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">→</span>}
                <Link to={`/users/${a.user.id}`} className="flex flex-col items-center group">
                  <Avatar src={a.user.avatar} name={a.user.name} size="sm" />
                  <span className="text-xs text-gray-500 mt-1 group-hover:text-[#5433FF] transition-colors">
                    {a.user.name.split(' ')[0]}
                  </span>
                </Link>
              </div>
            ))}
            {ripple.participantCount > ripple.actions.length && (
              <div className="flex items-center gap-2">
                <span className="text-gray-300">→</span>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                  +{ripple.participantCount - ripple.actions.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions feed */}
      {ripple.actions && ripple.actions.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Activity</h2>
          {ripple.actions.map((a: any) => (
            <FeedCard key={a.id} action={{ ...a, ripple }} />
          ))}
        </div>
      )}

      {/* Join button */}
      {ripple.status === 'ACTIVE' && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-100 p-4 z-20">
          <button
            onClick={() => { if (!user) { setShowSignInModal(true); return; } setShowJoinModal(true); }}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Waves className="w-5 h-5" />
            Join this Ripple
          </button>
        </div>
      )}

      {showJoinModal && (
        <ActionModal
          onClose={() => setShowJoinModal(false)}
          prefillOrg={ripple.org}
          prefillRippleId={ripple.id}
          onSuccess={load}
        />
      )}
    </div>
  );
}
