import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string, children: React.ReactNode) => void;
  selectedChildren: React.ReactNode;
} | null>(null);

export const Select: React.FC<{
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}> = ({ children, onValueChange, disabled, value: controlledValue, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : internalValue;
  
  const findChildrenByValue = (valueToFind: string | undefined): React.ReactNode => {
    if (!valueToFind) return null;
    let foundChildren: React.ReactNode = null;
    
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectContent) {
            React.Children.forEach((child.props as any).children, (item) => {
                if(React.isValidElement(item) && item.type === SelectItem && (item.props as any).value === valueToFind) {
                    foundChildren = (item.props as any).children;
                }
            });
        }
    });
    return foundChildren;
  };
  
  const [selectedChildren, setSelectedChildren] = useState<React.ReactNode>(() => findChildrenByValue(selectedValue));

  useEffect(() => {
    setSelectedChildren(findChildrenByValue(selectedValue));
  }, [selectedValue, children]);

  const handleValueChange = (newValue: string, newChildren: React.ReactNode) => {
      if (!isControlled) {
          setInternalValue(newValue);
      }
      setSelectedChildren(newChildren);
      if (onValueChange) {
          onValueChange(newValue);
      }
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, setSelectedValue: handleValueChange, selectedChildren }}>
      <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const context = useContext(SelectContext);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  if (!context) throw new Error('SelectTrigger must be used within a Select');

  const { open, setOpen } = context;
  const child = React.Children.only(children) as React.ReactElement;

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-xl border border-[#E0D8CD] dark:border-white/[0.08] bg-white dark:bg-[#151B2B] px-3.5 py-2 text-xs font-medium text-stone-800 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors cursor-pointer ${className}`}
    >
      <span className="truncate">{child}</span>
      <ChevronDown className={`h-4 w-4 text-stone-500 dark:text-slate-400 transition-transform duration-150 ${open ? 'rotate-180 text-indigo-500' : ''}`} />
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder = 'Chọn...' }) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error('SelectValue must be used within a Select');
    const { selectedValue, selectedChildren } = context;
    
    return <span>{selectedChildren ?? (selectedValue || placeholder)}</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const context = useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) throw new Error('SelectContent must be used within a Select');

  const { open, setOpen } = context;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-[#E0D8CD] dark:border-white/[0.12] bg-white dark:bg-[#0F1523] text-stone-800 dark:text-slate-100 shadow-2xl p-1 animate-in fade-in-0 zoom-in-95 scrollbar-thin ${className}`}
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({
  children,
  value,
  className = '',
}) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within a Select');
  const { selectedValue, setSelectedValue, setOpen } = context;
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => {
        setSelectedValue(value, children);
        setOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        isSelected 
          ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-900 dark:text-indigo-300 font-semibold' 
          : 'text-stone-700 dark:text-slate-300 hover:bg-[#F5F1EB] dark:hover:bg-white/[0.06] hover:text-stone-950 dark:hover:text-white'
      } ${className}`}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-2 flex-shrink-0" />}
    </div>
  );
};
