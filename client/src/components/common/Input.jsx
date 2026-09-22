import React from 'react';

export default function Input({
  label,
  icon: Icon,
  rightElement,
  error,
  helperText,
  id,
  className = '',
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold tracking-wider uppercase text-stone-600 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Icon className="w-5 h-5 transition-colors group-focus-within:text-orange-600" />
          </div>
        )}

        <input
          id={inputId}
          className={`w-full rounded-xl border bg-white py-3 text-sm text-stone-900 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${rightElement ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
              : 'border-stone-200 hover:border-stone-300 focus:border-orange-500 focus:ring-orange-500/20'
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1 animate-fadeIn">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-stone-500">{helperText}</p>
      ) : null}
    </div>
  );
}
