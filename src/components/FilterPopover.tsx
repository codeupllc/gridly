import React, { forwardRef } from 'react';

export const FilterPopover = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...rest }, ref) => (
    <div
      ref={ref}
      className={`absolute right-0 z-20 mt-2 flex w-52 flex-col gap-2.5 rounded-2xl border border-stone-100 bg-white p-4 text-stone-800 shadow-[0_24px_60px_-24px_rgba(28,25,23,0.35)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
);

FilterPopover.displayName = 'FilterPopover';
