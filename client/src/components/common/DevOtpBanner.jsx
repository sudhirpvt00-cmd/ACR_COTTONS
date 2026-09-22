import React from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';

export default function DevOtpBanner({ otp, onAutoFill }) {
  const [copied, setCopied] = React.useState(false);

  if (!otp) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onAutoFill) onAutoFill(otp);
  };

  return (
    <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-amber-950 animate-pulse">
      <div className="flex items-center gap-2.5 text-xs">
        <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-600/20 text-amber-900 px-1.5 py-0.5 rounded mr-1.5">
            Dev Mode
          </span>
          <span>Your test OTP code is: </span>
          <strong className="text-sm font-mono tracking-widest text-amber-900 font-extrabold ml-1">
            {otp}
          </strong>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-200/80 hover:bg-amber-300/80 px-2.5 py-1 rounded-lg transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-emerald-800">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Auto-fill</span>
          </>
        )}
      </button>
    </div>
  );
}
