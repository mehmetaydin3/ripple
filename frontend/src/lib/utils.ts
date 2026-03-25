import { formatDistanceToNow } from 'date-fns';

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const CATEGORY_COLORS: Record<string, string> = {
  ENVIRONMENT: 'bg-green-100 text-green-700',
  HEALTH: 'bg-red-100 text-red-700',
  EDUCATION: 'bg-blue-100 text-blue-700',
  POVERTY: 'bg-orange-100 text-orange-700',
  ANIMALS: 'bg-yellow-100 text-yellow-700',
  DISASTER_RELIEF: 'bg-purple-100 text-purple-700',
  COMMUNITY: 'bg-pink-100 text-pink-700',
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  ENVIRONMENT: 'from-green-400 to-emerald-600',
  HEALTH: 'from-red-400 to-rose-600',
  EDUCATION: 'from-blue-400 to-indigo-600',
  POVERTY: 'from-orange-400 to-amber-600',
  ANIMALS: 'from-yellow-400 to-amber-500',
  DISASTER_RELIEF: 'from-purple-400 to-violet-600',
  COMMUNITY: 'from-pink-400 to-rose-500',
};

export const CATEGORY_LABELS: Record<string, string> = {
  ENVIRONMENT: 'Environment',
  HEALTH: 'Health',
  EDUCATION: 'Education',
  POVERTY: 'Poverty',
  ANIMALS: 'Animals',
  DISASTER_RELIEF: 'Disaster Relief',
  COMMUNITY: 'Community',
};
