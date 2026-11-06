import React from 'react';

export type SummaryCardTone = 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'cyan' | 'slate';

export interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: SummaryCardTone;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export function SummaryCard({
  icon,
  label,
  value,
  tone = 'blue',
  subtitle,
  onClick,
  className = '',
}: SummaryCardProps) {
  const tones: Record<
    SummaryCardTone,
    { bg: string; text: string; iconText: string }
  > = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-white dark:from-blue-950/40 dark:via-blue-950/20 dark:to-slate-900 border-blue-200/80 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-400',
      iconText: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-800 dark:text-amber-400',
      iconText: 'text-amber-700 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white dark:from-rose-950/40 dark:via-rose-950/20 dark:to-slate-900 border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-400',
      iconText: 'text-rose-600 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-white dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-400',
      iconText: 'text-indigo-600 dark:text-indigo-400',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50/90 via-purple-50/40 to-white dark:from-purple-950/40 dark:via-purple-950/20 dark:to-slate-900 border-purple-200/80 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-400',
      iconText: 'text-purple-600 dark:text-purple-400',
    },
    cyan: {
      bg: 'bg-gradient-to-br from-cyan-50/90 via-cyan-50/40 to-white dark:from-cyan-950/40 dark:via-cyan-950/20 dark:to-slate-900 border-cyan-200/80 dark:border-cyan-800/60',
      text: 'text-cyan-700 dark:text-cyan-400',
      iconText: 'text-cyan-600 dark:text-cyan-400',
    },
    slate: {
      bg: 'bg-gradient-to-br from-slate-100/90 via-slate-50/40 to-white dark:from-slate-800/40 dark:via-slate-800/20 dark:to-slate-900 border-slate-200/80 dark:border-slate-700/60',
      text: 'text-slate-700 dark:text-slate-300',
      iconText: 'text-slate-600 dark:text-slate-300',
    },
  };

  const currentTone = tones[tone] || tones.blue;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${currentTone.bg} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
          <span className={currentTone.iconText}>{icon}</span>
        </div>
        <span className={`font-extrabold text-xs sm:text-sm tracking-tight truncate ${currentTone.text}`}>
          {label}
        </span>
      </div>
      <div className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono truncate">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default SummaryCard;
