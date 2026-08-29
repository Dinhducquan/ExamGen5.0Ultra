import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <div id={id} className={`rounded-2xl border border-[#E7E1D8] dark:border-white/[0.08] bg-white/90 dark:bg-[#111827]/75 text-[#1C1917] dark:text-slate-100 backdrop-blur-xl shadow-[0_1px_3px_rgba(28,25,23,0.03),0_8px_20px_-4px_rgba(28,25,23,0.04)] dark:shadow-lg transition-all duration-200 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <div id={id} className={`flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-[#EFEAE2] dark:border-white/[0.05] ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <h3 id={id} className={`text-lg sm:text-xl font-bold leading-tight tracking-tight text-[#1C1917] dark:text-white ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <p id={id} className={`text-xs sm:text-sm text-stone-500 dark:text-slate-400 font-normal leading-relaxed ${className}`}>{children}</p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <div id={id} className={`p-5 sm:p-6 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <div id={id} className={`flex items-center p-5 sm:p-6 pt-0 border-t border-[#EFEAE2] dark:border-white/[0.05] mt-4 ${className}`}>{children}</div>
);

