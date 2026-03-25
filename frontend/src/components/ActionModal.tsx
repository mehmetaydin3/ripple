import { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { CATEGORY_LABELS } from '../lib/utils';

interface ActionModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  prefillOrg?: any;
  prefillType?: string;
  prefillRippleId?: string;
}

type Step = 'org' | 'type' | 'amount' | 'comment' | 'confirm' | 'success' | 'donate-verify';

const ACTION_TYPES = [
  { type: 'DONATE', emoji: '💚', label: 'Donate', desc: 'Make a financial contribution' },
  { type: 'VOLUNTEER', emoji: '🤝', label: 'Volunteer', desc: 'Give your time' },
  { type: 'CHEER', emoji: '🙌', label: 'Cheer', desc: 'Shout out their work' },
  { type: 'SHARE', emoji: '↗', label: 'Share', desc: 'Spread the word' },
];

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export function ActionModal({ onClose, onSuccess, prefillOrg, prefillType, prefillRippleId }: ActionModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(prefillOrg ? (prefillType ? 'amount' : 'type') : 'org');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any>(prefillOrg || null);
  const [selectedType, setSelectedType] = useState(prefillType || '');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrgs = async () => {
      const res = await api.getOrgs({ limit: '20', ...(search ? { search } : {}) });
      setOrgs(res.data);
    };
    if (step === 'org') fetchOrgs();
  }, [step, search]);

  const handleCreateAction = async () => {
    setLoading(true);
    setError('');
    try {
      await api.createAction({
        orgId: selectedOrg.id,
        type: selectedType,
        amount: selectedType === 'DONATE' && amount ? parseFloat(amount) : undefined,
        comment: comment || undefined,
        isPublic,
        rippleId: prefillRippleId || undefined,
      });

      if (selectedType === 'DONATE' && selectedOrg.donateUrl) {
        setStep('donate-verify');
        window.open(selectedOrg.donateUrl, '_blank');
      } else {
        setStep('success');
        onSuccess?.();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = ['org', 'type', 'amount', 'comment', 'confirm'].indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">
            {step === 'org' && 'Pick an organization'}
            {step === 'type' && 'What kind of action?'}
            {step === 'amount' && 'How much?'}
            {step === 'comment' && 'Add a note'}
            {step === 'confirm' && 'Confirm your action'}
            {step === 'success' && 'Your ripple is live 🌊'}
            {step === 'donate-verify' && 'Complete your donation'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        {stepIndex >= 0 && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-[#5433FF] rounded-full transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Step: Org */}
          {step === 'org' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  className="input pl-10"
                  placeholder="Search organizations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => { setSelectedOrg(org); setStep('type'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    {org.imageUrl ? (
                      <img src={org.imageUrl} alt={org.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center text-[#5433FF] font-bold">
                        {org.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{org.name}</div>
                      <div className="text-xs text-gray-400">{CATEGORY_LABELS[org.category]}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Type */}
          {step === 'type' && (
            <div className="space-y-2">
              {selectedOrg && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                  {selectedOrg.imageUrl && (
                    <img src={selectedOrg.imageUrl} alt={selectedOrg.name} className="w-8 h-8 rounded-lg object-cover" />
                  )}
                  <span className="font-medium text-gray-700 text-sm">{selectedOrg.name}</span>
                </div>
              )}
              {ACTION_TYPES.map(({ type, emoji, label, desc }) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setStep(type === 'DONATE' ? 'amount' : 'comment');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#5433FF] hover:bg-[#EEF0FF] transition-all text-left"
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step: Amount */}
          {step === 'amount' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      amount === preset.toString()
                        ? 'bg-[#5433FF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  className="input pl-8"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button
                onClick={() => setStep('comment')}
                disabled={!amount || parseFloat(amount) <= 0}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step: Comment */}
          {step === 'comment' && (
            <div className="space-y-4">
              <textarea
                className="input resize-none h-28"
                placeholder="Add a note (optional) — share why you care..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={280}
              />
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Make this public</div>
                  <div className="text-xs text-gray-500">Visible on the feed</div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#5433FF]' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <button onClick={() => setStep('confirm')} className="btn-primary w-full">
                Review
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Organization</span>
                  <span className="font-semibold text-gray-900">{selectedOrg?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Action</span>
                  <span className="font-semibold text-gray-900 capitalize">{selectedType.toLowerCase()}</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-[#5433FF]">${amount}</span>
                  </div>
                )}
                {comment && (
                  <div className="text-sm">
                    <span className="text-gray-500">Note</span>
                    <p className="mt-1 text-gray-700 italic">"{comment}"</p>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Visibility</span>
                  <span className="font-medium text-gray-700">{isPublic ? '🌍 Public' : '🔒 Private'}</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button onClick={handleCreateAction} disabled={loading} className="btn-primary w-full">
                {loading ? 'Confirming...' : selectedType === 'DONATE' ? 'Confirm & Donate 💚' : 'Confirm Action ✨'}
              </button>
            </div>
          )}

          {/* Step: Donate Verify */}
          {step === 'donate-verify' && (
            <div className="text-center space-y-6 py-4">
              <div className="text-5xl">💚</div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Complete your donation</h3>
                <p className="text-gray-500 text-sm">
                  We've opened {selectedOrg?.name}'s donation page. Did you complete your donation?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('success'); onSuccess?.(); }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Yes, I donated!
                </button>
                <button
                  onClick={() => window.open(selectedOrg?.donateUrl, '_blank')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open again
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-4">
              <div className="text-6xl animate-bounce">🌊</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Your ripple is live!</h3>
                <p className="text-gray-500 text-sm">
                  You've inspired others to act. Keep it up, {user?.name?.split(' ')[0]}!
                </p>
              </div>
              <button onClick={onClose} className="btn-primary w-full">
                Back to feed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
