import React from 'react';
import { TableTheme } from './types';

function IconBtn({
    onClick,
    disabled,
    label,
    children,
}: {
    onClick: () => void;
    disabled: boolean;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
            {children}
        </button>
    );
}

export function TablePagination({
    table,
    theme,
    pageSizeOptions,
}: {
    table: any;
    theme: TableTheme;
    pageSizeOptions: number[];
}) {
    const state = table.getState().pagination;
    const total = table.getFilteredRowModel()?.rows?.length ?? table.getPrePaginationRowModel()?.rows?.length ?? 0;
    const start = total === 0 ? 0 : state.pageIndex * state.pageSize + 1;
    const end = Math.min(total, (state.pageIndex + 1) * state.pageSize);
    const muted = theme.muted || 'text-slate-500';

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 pt-4">
            <p className={`text-[13px] ${muted}`}>
                {total === 0 ? 'No results' : (
                    <>
                        <span className="font-medium text-slate-800">{start}–{end}</span>
                        {' '}of {total}
                    </>
                )}
            </p>
            <div className="flex items-center gap-3">
                <label className={`flex items-center gap-2 text-[13px] ${muted}`}>
                    Rows
                    <select
                        value={state.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        className="h-8 rounded-full border border-slate-200 bg-white px-2 text-[13px] text-slate-800 outline-none focus:border-slate-400"
                    >
                        {pageSizeOptions.map((size: number) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </label>
                <div className="flex items-center gap-1">
                    <IconBtn label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </IconBtn>
                    <IconBtn label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </IconBtn>
                </div>
            </div>
        </div>
    );
}
