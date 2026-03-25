import { X, Waves } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SignInModal() {
  const { showSignInModal, setShowSignInModal, signInWithGoogle } = useAuth();

  if (!showSignInModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-[#5433FF]" />
            <span className="font-bold text-xl text-gray-900">Ripple</span>
          </div>
          <button
            onClick={() => setShowSignInModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌊</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to make a ripple</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Join thousands of people doing good together. Sign in to donate, volunteer, and inspire others.
          </p>
        </div>

        <button
          onClick={() => signInWithGoogle(window.location.pathname + window.location.search)}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
