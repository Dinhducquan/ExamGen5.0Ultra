import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

export const Tabs: React.FC<{ 
  children: React.ReactNode; 
  defaultValue?: string; 
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}> = ({ children, defaultValue, className, value, onValueChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || "");
  
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;
  
  const setActiveTab = (newValue: string) => {
    if (!isControlled) {
      setInternalActiveTab(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`inline-flex max-w-full overflow-x-auto scrollbar-none h-11 items-center justify-start sm:justify-center rounded-xl bg-[#F5F1EB] dark:bg-[#0C1120] border border-[#E7E1D8] dark:border-white/[0.08] p-1 text-stone-600 dark:text-slate-400 ${className}`}
  >
    {children}
  </div>
);

export const TabsTrigger: React.FC<{ children: React.ReactNode; value: string; className?: string, disabled?: boolean }> = ({
  children,
  value,
  className = '',
  disabled,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive 
          ? 'bg-white dark:bg-[#1C1838] dark:bg-gradient-to-r dark:from-purple-900/60 dark:via-indigo-900/50 dark:to-purple-950/70 text-stone-950 dark:text-purple-100 shadow-sm border border-[#E0D8CD] dark:border-purple-500/30 font-bold' 
          : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-200/50 dark:hover:bg-white/[0.03]'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({
  children,
  value,
  className,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  const { activeTab } = context;
  return activeTab === value ? <div className={`mt-2 ${className}`}>{children}</div> : null;
};