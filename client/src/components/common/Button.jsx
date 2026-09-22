import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  loading = false,
  disabled = false,
  showArrow = true,
  className = '',
  icon: Icon,
  ...props
}) {
  const isPrimary = variant === 'primary';

  let baseStyles =
    'relative w-full font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]';

  let variantStyles = '';

  if (isPrimary) {
    // Exact requested style: full-width orange gradient button with an arrow
    variantStyles =
      'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:via-amber-700 hover:to-orange-800 text-white py-3.5 px-6 shadow-md hover:shadow-lg focus:ring-orange-500 shadow-orange-950/10';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 px-5 focus:ring-stone-400';
  } else if (variant === 'outline') {
    variantStyles =
      'border-2 border-stone-200 hover:border-orange-500 hover:text-orange-700 text-stone-700 py-3 px-5 focus:ring-orange-500 bg-transparent';
  } else if (variant === 'ghost') {
    variantStyles =
      'text-orange-700 hover:bg-orange-50 py-2 px-4 focus:ring-orange-500';
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 shrink-0" />}
          <span>{children}</span>
          {showArrow && isPrimary && (
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
          )}
        </>
      )}
    </button>
  );
}
