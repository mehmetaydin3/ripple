import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Waves } from 'lucide-react';
import { FeedCard } from '../components/FeedCard';
import { ActionModal } from '../components/ActionModal';
import { api } from '../lib/api';
import { CATEGORY_COLORS, CATEGORY_GRADIENTS, CATEGORY_LABELS, formatAmount, formatNumber } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </span>
  );
}

export function OrgPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, setShowSignInModal } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [ripples, setRipples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'activity' | 'ripples' | 'about'>('activity');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<string | undefined>();

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.getOrg(slug),
      api.getOrgFeed(slug),
      api.getOrgRipples(slug),
    ]).then(([orgData, feedData, ripplesData]) => {
      setOrg(orgData);
      setFeed(feedData.data);
      setRipples(ripplesData);
    }).finally(() => setLoading(false));
  }, [slug]);

  const openAction = (type: string) => {
    if (!user) { setShowSignInModal(true); return; }
    setActionType(type);
    setShowActionModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (!org) return <div className="text-center py-16 text-gray-500">Organization not found.</div>;

  const gradient = CATEGORY_GRADIENTS[org.category] || 'from-gray-400 to-gray-600';

  return (
    <div className="max-w-2xl mx-auto pb-28">
      {/* Cover */}
      <div className="relative h-48 overflow-hidden">
        {org.coverImageUrl ? (
          <img src={org.coverImageUrl} alt={org.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Profile section */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="flex items-end gap-3 mb-4">
          {org.imageUrl ? (
            <img
              src={org.imageUrl}
              alt={org.name}
              className="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover flex-shrink-0"
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br ${gradient} flex-shrink-0`} />
          )}
          <div className="pb-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_COLORS[org.category]}`}>
              {CATEGORY_LABELS[org.category]}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{org.name}</h1>
        {org.mission && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{org.mission}</p>
        )}

        {/* Trust signals */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-2xl text-sm">
          <div className="flex items-center gap-1.5">
            <StarRating rating={org.starRating} />
            <span className="text-gray-500 text-xs">{org.starRating}-star</span>
          </div>
          {org.percentToPrograms && (
            <div className="text-gray-700 font-medium">
              <span className="text-[#5433FF] font-bold">{org.percentToPrograms}%</span>
              <span className="text-gray-400 text-xs ml-1">to programs</span>
            </div>
          )}
          <div className="text-gray-700 font-medium ml-auto">
            <span className="text-gray-400 text-xs">CN Rated</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="font-bold text-gray-900">{formatAmount(org.weeklyDonations)}</div>
            <div className="text-xs text-gray-500">raised this week</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="font-bold text-gray-900">{formatNumber(org.weeklyDonors)}</div>
            <div className="text-xs text-gray-500">donors this week</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="font-bold text-gray-900">{formatNumber(org.totalVolunteers)}</div>
            <div className="text-xs text-gray-500">volunteers</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {(['activity', 'ripples', 'about'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Activity tab */}
        {tab === 'activity' && (
          <div className="space-y-3">
            {feed.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No activity yet.</div>
            ) : (
              feed.map((action) => <FeedCard key={action.id} action={action} />)
            )}
          </div>
        )}

        {/* Ripples tab */}
        {tab === 'ripples' && (
          <div className="space-y-3">
            {ripples.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No active ripples yet.</div>
            ) : (
              ripples.map((ripple) => (
                <div key={ripple.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{ripple.title}</h3>
                      <p className="text-sm text-gray-500">by {ripple.startedBy.name}</p>
                    </div>
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                  </div>
                  {ripple.description && (
                    <p className="text-sm text-gray-600 mb-3">{ripple.description}</p>
                  )}
                  {ripple.targetAmount && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-[#5433FF]">{formatAmount(ripple.currentAmount)}</span>
                        <span className="text-gray-500">of {formatAmount(ripple.targetAmount)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5433FF] rounded-full transition-all"
                          style={{ width: `${Math.min((ripple.currentAmount / ripple.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">{ripple.participantCount} participants</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* About tab */}
        {tab === 'about' && (
          <div className="space-y-4">
            {org.description && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{org.description}</p>
              </div>
            )}
            <div className="card p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Details</h3>
              {org.ein && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">EIN</span>
                  <span className="font-medium text-gray-700">{org.ein}</span>
                </div>
              )}
              {org.websiteUrl && (
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#5433FF] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit website
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-100 p-4 flex gap-3 z-20">
        {org.donateUrl && (
          <button
            onClick={() => openAction('DONATE')}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            💚 Donate
          </button>
        )}
        {org.volunteerUrl && (
          <button
            onClick={() => openAction('VOLUNTEER')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            🤝 Volunteer
          </button>
        )}
        <button
          onClick={() => openAction('DONATE')}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#5433FF] text-[#5433FF] font-semibold text-sm hover:bg-[#EEF0FF] transition-colors"
        >
          <Waves className="w-4 h-4" /> Ripple
        </button>
      </div>

      {showActionModal && (
        <ActionModal
          onClose={() => setShowActionModal(false)}
          prefillOrg={org}
          prefillType={actionType}
        />
      )}
    </div>
  );
}
