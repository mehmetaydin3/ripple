import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Lock, Globe } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { FeedCard } from '../components/FeedCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatAmount, CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/utils';

function ProfileContent({ userId, isMe }: { userId: string; isMe: boolean }) {
  const { user: authUser, refresh } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'activity' | 'causes' | 'ripples'>('activity');
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [following, setFollowing] = useState<boolean | null>(null);

  const loadProfile = async () => {
    try {
      const data = isMe ? await api.getMyProfile() : await api.getUser(userId);
      setProfile(data);
      setBio(data.bio || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [userId, isMe]);

  const handleTogglePrivacy = async () => {
    if (!isMe) return;
    const updated = await api.updateMyProfile({ isPublic: !profile.isPublic });
    setProfile((p: any) => ({ ...p, isPublic: updated.isPublic }));
    refresh();
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    await api.updateMyProfile({ bio });
    setProfile((p: any) => ({ ...p, bio }));
    setEditingBio(false);
    setSavingBio(false);
    refresh();
  };

  const handleFollow = async () => {
    const res = await api.followUser(userId);
    setFollowing(res.following);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-16 text-gray-500">User not found.</div>;

  // Get unique orgs from actions
  const orgMap = new Map();
  (profile.actions || []).forEach((a: any) => {
    if (!orgMap.has(a.org.id)) orgMap.set(a.org.id, a.org);
  });
  const causes = Array.from(orgMap.values());

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar src={profile.avatar} name={profile.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-xl text-gray-900">{profile.name}</h1>
              {!profile.isPublic && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
            {profile.bio && !editingBio && (
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{profile.bio}</p>
            )}
            {editingBio && (
              <div className="mt-2 space-y-2">
                <textarea
                  className="input resize-none h-20 text-sm"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveBio} disabled={savingBio} className="btn-primary text-sm py-1.5 px-3">
                    Save
                  </button>
                  <button onClick={() => setEditingBio(false)} className="btn-secondary text-sm py-1.5 px-3">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <div className="font-bold text-gray-900">🔥 {profile.streak}</div>
            <div className="text-xs text-gray-500">streak</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">💚 {formatAmount(profile.totalGiven)}</div>
            <div className="text-xs text-gray-500">given</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">🌊 {(profile.ripplesStarted || []).length}</div>
            <div className="text-xs text-gray-500">ripples</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">👥 {profile._count?.followers || 0}</div>
            <div className="text-xs text-gray-500">inspired</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isMe ? (
            <>
              <button
                onClick={() => setEditingBio(true)}
                className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" /> Edit profile
              </button>
              <button
                onClick={handleTogglePrivacy}
                className="btn-ghost text-sm flex items-center gap-1.5"
              >
                {profile.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {profile.isPublic ? 'Public' : 'Private'}
              </button>
            </>
          ) : (
            authUser && (
              <button
                onClick={handleFollow}
                className={following === false ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
              >
                {following === null ? (
                  profile._count?.followers >= 0 ? 'Follow' : 'Following'
                ) : following ? 'Following ✓' : 'Follow'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        {(['activity', 'causes', 'ripples'] as const).map((t) => (
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

      {/* Activity */}
      {tab === 'activity' && (
        <div className="space-y-3">
          {(profile.actions || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">No public activity yet.</div>
          ) : (
            (profile.actions || []).map((a: any) => <FeedCard key={a.id} action={a} />)
          )}
        </div>
      )}

      {/* Causes */}
      {tab === 'causes' && (
        <div className="flex flex-wrap gap-2">
          {causes.length === 0 ? (
            <div className="text-center w-full py-8 text-gray-500">No causes yet.</div>
          ) : (
            causes.map((org: any) => (
              <Link
                key={org.id}
                to={`/orgs/${org.slug}`}
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 ${CATEGORY_COLORS[org.category] || 'bg-gray-100 text-gray-600'}`}
              >
                {org.name}
              </Link>
            ))
          )}
        </div>
      )}

      {/* Ripples */}
      {tab === 'ripples' && (
        <div className="space-y-3">
          {(profile.ripplesStarted || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">No ripples yet.</div>
          ) : (
            (profile.ripplesStarted || []).map((r: any) => (
              <Link key={r.id} to={`/ripples/${r.id}`} className="card p-4 block hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900 mb-1">{r.title}</div>
                <div className="text-sm text-gray-500">{r.org.name}</div>
                <div className="text-xs text-gray-400 mt-1">{r.participantCount} participants</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  return user ? <ProfileContent userId={user.id} isMe={true} /> : (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Sign in to see your profile.</p>
    </div>
  );
}

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  return <ProfileContent userId={id!} isMe={user?.id === id} />;
}
