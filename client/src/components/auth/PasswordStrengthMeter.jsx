import React from 'react';
import { Check, X } from 'lucide-react';
import { validators } from '../../utils/validators.js';

export default function PasswordStrengthMeter({ password = '' }) {
  if (!password) return null;

  const { score, label, color, criteria } = validators.checkPasswordStrength(password);

  const checks = [
    { label: 'At least 8 characters', met: criteria.length },
    { label: 'One uppercase letter (A-Z)', met: criteria.hasUpper },
    { label: 'One lowercase letter (a-z)', met: criteria.hasLower },
    { label: 'One number (0-9)', met: criteria.hasNumber },
    { label: 'One special character (@$!%*?&#)', met: criteria.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Visual meter */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-stone-500 font-medium">Password Strength:</span>
          <span
            className={`font-bold ${
              score >= 100
                ? 'text-emerald-700'
                : score >= 60
                ? 'text-amber-700'
                : 'text-rose-600'
            }`}
          >
            {label}
          </span>
        </div>

        <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden flex gap-1">
          <div
            className={`h-full transition-all duration-300 rounded-full ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Criteria list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {checks.map((c, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] ${
              c.met ? 'text-emerald-700 font-medium' : 'text-stone-400'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
            ) : (
              <X className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
