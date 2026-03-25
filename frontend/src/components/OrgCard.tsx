import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_GRADIENTS, CATEGORY_LABELS, formatNumber } from '../lib/utils';

interface OrgCardProps {
  org: any;
  compact?: boolean;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

export function OrgCard({ org, compact }: OrgCardProps) {
  const gradient = CATEGORY_GRADIENTS[org.category] || 'from-gray-400 to-gray-600';

  return (
    <Link to={`/orgs/${org.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow block group">
      {/* Cover image */}
      <div className="relative h-28 overflow-hidden">
        {org.coverImageUrl ? (
          <img
            src={org.coverImageUrl}
            alt={org.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        {org.trending && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-orange-500 text-xs font-semibold px-2 py-1 rounded-full">
            <Flame className="w-3 h-3" />
            Trending
          </div>
        )}
      </div>

      {/* Org avatar overlapping */}
      <div className="px-4 pt-0 pb-4">
        <div className="-mt-5 mb-2">
          {org.imageUrl ? (
            <img
              src={org.imageUrl}
              alt={org.name}
              className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover"
            />
          ) : (
            <div className={`w-10 h-10 rounded-xl border-2 border-white shadow-sm bg-gradient-to-br ${gradient}`} />
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{org.name}</h3>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[org.category] || 'bg-gray-100 text-gray-600'}`}>
            {CATEGORY_LABELS[org.category]}
          </span>
          <StarRating rating={org.starRating} />
        </div>

        {!compact && (
          <div className="text-xs text-gray-500">
            {org.trending ? (
              <span className="flex items-center gap-1 text-orange-500 font-medium">
                <Flame className="w-3 h-3" />
                {formatNumber(org.weeklyDonors)} donors this week
              </span>
            ) : (
              <span>{formatNumber(org.totalDonors)} total donors</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
