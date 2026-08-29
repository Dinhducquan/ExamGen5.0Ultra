import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <div className="relative w-full overflow-auto rounded-xl border border-[#E7E1D8] dark:border-white/[0.08] bg-white/90 dark:bg-[#0F1523]/80 shadow-sm">
    <table id={id} className={`w-full caption-bottom text-xs text-left ${className}`}>{children}</table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <thead className={`[&_tr]:border-b border-[#E7E1D8] dark:border-white/[0.08] bg-[#FAF7F2] dark:bg-[#0A0E1A] text-stone-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] ${className}`}>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-[#F0EAE1] dark:divide-white/[0.04] [&_tr:last-child]:border-0 ${className}`}>{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; id?: string }> = ({ children, className = '', onClick, id }) => (
  <tr id={id} onClick={onClick} className={`border-b border-[#F0EAE1] dark:border-white/[0.06] transition-colors hover:bg-stone-500/[0.03] dark:hover:bg-white/[0.03] ${onClick ? 'cursor-pointer' : ''} ${className}`}>{children}</tr>
);

export const TableHead: React.FC<{ children?: React.ReactNode; className?: string; colSpan?: number; rowSpan?: number }> = ({ children, className = '', colSpan, rowSpan }) => (
  <th colSpan={colSpan} rowSpan={rowSpan} className={`h-10 px-3.5 align-middle font-semibold text-stone-600 dark:text-slate-400 [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>
);

export const TableCell: React.FC<{ children?: React.ReactNode; className?: string; colSpan?: number; rowSpan?: number }> = ({ children, className = '', colSpan, rowSpan }) => (
  <td colSpan={colSpan} rowSpan={rowSpan} className={`p-3.5 align-middle text-stone-800 dark:text-slate-200 [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
);
