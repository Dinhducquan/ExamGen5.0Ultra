
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className = '', id, ...props }) => {
  return (
    <input
      id={id}
      className={`flex h-10 w-full rounded-xl border border-[#E0D8CD] dark:border-white/[0.08] bg-white dark:bg-[#151B2B] px-3.5 py-2 text-sm text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm ${className}`}
      {...props}
    />
  );
};