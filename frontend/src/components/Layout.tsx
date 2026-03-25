import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Waves, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActionModal } from './ActionModal';
import { SignInModal } from './SignInModal';
import { Avatar } from './Avatar';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: null, icon: Plus, label: 'Action', isAction: true },
  { to: '/ripples', icon: Waves, label: 'Ripples' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, setShowSignInModal } = useAuth();
  const [showActionModal, setShowActionModal] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  const handleActionClick = () => {
    if (!user) { setShowSignInModal(true); return; }
    setShowActionModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-30 p-6">
        <Link to="/feed" className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-[#5433FF] rounded-xl flex items-center justify-center">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Ripple</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key="action"
                  onClick={handleActionClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#5433FF] text-white font-semibold hover:bg-[#4420E0] transition-colors my-2"
                >
                  <Plus className="w-5 h-5" />
                  New Action
                </button>
              );
            }
            const active = location.pathname === item.to || location.pathname.startsWith(item.to! + '/');
            return (
              <Link
                key={item.to}
                to={item.to!}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${
                  active
                    ? 'bg-[#EEF0FF] text-[#5433FF]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{user.name}</div>
              <div className="text-xs text-gray-400">🔥 {user.streak} day streak</div>
            </div>
          </Link>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <Link to="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5433FF] rounded-xl flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Ripple</span>
          </Link>
          {user ? (
            <Link to="/profile">
              <Avatar src={user.avatar} name={user.name} size="sm" />
            </Link>
          ) : (
            <button
              onClick={() => setShowSignInModal(true)}
              className="text-sm font-semibold text-[#5433FF] px-3 py-1.5 rounded-xl hover:bg-[#EEF0FF] transition-colors"
            >
              Sign in
            </button>
          )}
        </header>

        <div key={feedKey}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center px-2 pb-safe">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="action"
                onClick={handleActionClick}
                className="flex-1 flex justify-center py-2"
              >
                <div className="w-12 h-12 bg-[#5433FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5433FF]/30 hover:bg-[#4420E0] transition-colors -mt-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }
          const active = location.pathname === item.to || location.pathname.startsWith(item.to! + '/');
          return (
            <Link
              key={item.to}
              to={item.to!}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? 'text-[#5433FF]' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Modals */}
      <SignInModal />
      {showActionModal && (
        <ActionModal
          onClose={() => setShowActionModal(false)}
          onSuccess={() => setFeedKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
