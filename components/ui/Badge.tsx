import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'purple' | 'cyan';
  className?: string;
  id?: string;
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', id }) => {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors select-none';

  const variantClasses = {
    default: 'border-[#E0D8CD] bg-[#F5F1EB] text-stone-700 dark:border-white/[0.08] dark:bg-[#151B2B] dark:text-slate-300',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    ai: 'border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 text-amber-900 dark:text-amber-300 shadow-sm',
  };

  return (
    <div id={id} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};
