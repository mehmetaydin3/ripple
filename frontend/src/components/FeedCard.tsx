import { Link } from 'react-router-dom';
import { Lock, Waves } from 'lucide-react';
import { Avatar } from './Avatar';
import { timeAgo, formatAmount, CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useState } from 'react';

interface FeedCardProps {
  action: any;
  onReactionAdded?: () => void;
}

export function FeedCard({ action, onReactionAdded }: FeedCardProps) {
  const { user, setShowSignInModal } = useAuth();
  const [reactions, setReactions] = useState<any[]>(action.reactions || []);
  const [reacting, setReacting] = useState(false);

  const cheerCount = reactions.filter((r: any) => r.type === 'CHEER').length;
  const matchCount = reactions.filter((r: any) => r.type === 'MATCH').length;
  const hasCheer = user && reactions.some((r: any) => r.type === 'CHEER' && r.user?.id === user.id);

  const handleReact = async (type: 'CHEER' | 'MATCH') => {
    if (!user) { setShowSignInModal(true); return; }
    if (reacting) return;
    setReacting(true);
    try {
      const reaction = await api.reactToAction(action.id, type);
      setReactions((prev) => [...prev, reaction]);
      onReactionAdded?.();
    } catch {
      // already reacted
    } finally {
      setReacting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ url: window.location.href, title: `${action.user.name} gave to ${action.org.name}` });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const actionText = () => {
    switch (action.type) {
      case 'DONATE': return action.amount ? `donated ${formatAmount(action.amount)} to` : 'donated to';
      case 'VOLUNTEER': return 'volunteered at';
      case 'CHEER': return 'cheered for';
      case 'SHARE': return 'shared';
      default: return 'supported';
    }
  };

  const actionEmoji = () => {
    switch (action.type) {
      case 'DONATE': return '💚';
      case 'VOLUNTEER': return '🤝';
      case 'CHEER': return '🙌';
      case 'SHARE': return '↗';
      default: return '✨';
    }
  };

  return (
    <div className="card p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/users/${action.user.id}`}>
          <Avatar src={action.user.avatar} name={action.user.name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link to={`/users/${action.user.id}`} className="font-semibold text-gray-900 hover:text-[#5433FF] transition-colors">
              {action.user.name}
            </Link>
            <span className="text-gray-500 text-sm">{actionText()}</span>
            <Link to={`/orgs/${action.org.slug}`} className="font-semibold text-[#5433FF] hover:underline text-sm">
              {action.org.name}
            </Link>
            {!action.isPublic && <Lock className="w-3.5 h-3.5 text-gray-400 ml-1" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{timeAgo(action.createdAt)}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#EEF0FF', color: '#5433FF' }}>
              {actionEmoji()} {action.type.charAt(0) + action.type.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {action.comment && (
        <p className="text-gray-700 text-sm mb-3 pl-13 italic">"{action.comment}"</p>
      )}

      {/* Org pill */}
      <div className="mb-3">
        <Link
          to={`/orgs/${action.org.slug}`}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 ${CATEGORY_COLORS[action.org.category] || 'bg-gray-100 text-gray-600'}`}
        >
          {CATEGORY_LABELS[action.org.category] || action.org.category} · {action.org.name}
        </Link>
      </div>

      {/* Ripple context */}
      {action.ripple && (
        <Link
          to={`/ripples/${action.ripple.id}`}
          className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-[#EEF0FF] text-sm hover:bg-[#E0E4FF] transition-colors"
        >
          <Waves className="w-4 h-4 text-[#5433FF] flex-shrink-0" />
          <span className="text-[#5433FF] font-medium">
            Part of {action.ripple.startedBy.name}'s Ripple
          </span>
          {action.ripple.currentAmount > 0 && (
            <span className="text-[#5433FF]/70 ml-auto font-medium">
              {formatAmount(action.ripple.currentAmount)} raised
            </span>
          )}
        </Link>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-1 border-t border-gray-50 pt-3">
        <button
          onClick={() => handleReact('CHEER')}
          disabled={reacting}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
            hasCheer
              ? 'bg-[#EEF0FF] text-[#5433FF] font-semibold'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          🙌 <span>Cheer {cheerCount > 0 && cheerCount}</span>
        </button>
        <button
          onClick={() => handleReact('MATCH')}
          disabled={reacting}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
        >
          💚 <span>Match {matchCount > 0 && matchCount}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all ml-auto"
        >
          ↗ Share
        </button>
      </div>
    </div>
  );
}
