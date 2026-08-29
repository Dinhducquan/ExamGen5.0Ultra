
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'gradient' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]";

  const variantClasses = {
    default: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-glow-sm",
    gradient: "bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:via-indigo-500 hover:to-amber-400 text-white shadow-[0_3px_14px_rgba(99,102,241,0.28)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.4)] border border-white/20",
    secondary: "bg-[#F5F1EB] hover:bg-[#EAE3D9] dark:bg-[#151B2B] dark:hover:bg-[#1C2438] text-stone-800 dark:text-slate-200 border border-[#E0D8CD] dark:border-white/[0.08]",
    ghost: "bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/40 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white",
    outline: "border border-[#E0D8CD] dark:border-white/[0.12] bg-white/80 dark:bg-transparent text-stone-800 dark:text-slate-200 hover:bg-[#F5F1EB] dark:hover:bg-white/[0.05]",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-500/30",
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2 text-sm gap-2",
    sm: "h-8 rounded-lg px-3 text-xs gap-1.5",
    lg: "h-12 rounded-xl px-6 text-base gap-2.5",
    icon: "h-9 w-9 p-0",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={combinedClasses} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
