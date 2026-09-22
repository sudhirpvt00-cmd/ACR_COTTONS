import React from 'react';

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-24 h-24 text-3xl rounded-3xl',
  };

  const src = user?.avatarUrl;
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';

  if (src) {
    return (
      <img
        src={src}
        alt={user?.name || 'Profile'}
        className={`${sizes[size]} object-cover border border-gold-200 shadow-soft ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-espresso via-maroon-800 to-gold-600 text-ivory font-serif font-bold flex items-center justify-center border border-gold-300/60 ${className}`}
    >
      {initial}
    </div>
  );
}
