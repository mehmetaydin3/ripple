interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-violet-100 text-violet-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-pink-100 text-pink-600', 'bg-orange-100 text-orange-600'];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${color} ${className}`}>
      {initials}
    </div>
  );
}
