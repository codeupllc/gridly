import React from 'react';
import { flexRender } from '@tanstack/react-table';

export interface ColumnVisibilityPopoverProps {
    allLeafColumns: any[];
    columnVisibility: Record<string, boolean>;
    onToggle: (columnId: string, visible: boolean) => void;
    onHideAll: () => void;
    onShowAll: () => void;
}

function columnLabel(col: any): React.ReactNode {
    const header = col.columnDef.header;
    if (typeof header === 'string' && header.trim()) return header;
    if (typeof header === 'function') {
        try {
            return flexRender(header, col.getContext?.() ?? { column: col, header: undefined, table: undefined });
        } catch {
            return col.id;
        }
    }
    return col.id;
}

function isVisible(col: any, columnVisibility: Record<string, boolean>) {
    if (Object.prototype.hasOwnProperty.call(columnVisibility, col.id)) {
        return columnVisibility[col.id] !== false;
    }
    return col.getIsVisible();
}

export const ColumnVisibilityPopover: React.FC<ColumnVisibilityPopoverProps> = ({
    allLeafColumns,
    columnVisibility,
    onToggle,
    onHideAll,
    onShowAll,
}) => {
    const columns = allLeafColumns.filter((col: any) => {
        const header = col.columnDef.header;
        if (header === '' || header === undefined || header === null) return false;
        if (col.columnDef.enableHiding === false) return false;
        return true;
    });

    const visibleCount = columns.filter((col) => isVisible(col, columnVisibility)).length;

    return (
        <div
            className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-[#c9a96e]/25 bg-white p-3 shadow-[0_20px_50px_-24px_rgba(20,18,26,0.35)]"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                <button type="button" className="text-[12px] font-medium text-slate-500 hover:text-[#14121a]" onClick={onHideAll}>
                    Hide all
                </button>
                <button type="button" className="text-[12px] font-medium text-[#14121a]" onClick={onShowAll}>
                    Show all
                </button>
            </div>
            <div className="flex max-h-64 flex-col gap-1 overflow-auto">
                {columns.length === 0 ? (
                    <div className="px-2 py-6 text-center text-[13px] text-slate-400">No columns</div>
                ) : (
                    columns.map((col: any) => {
                        const on = isVisible(col, columnVisibility);
                        const isDisabled = visibleCount === 1 && on;
                        return (
                            <button
                                key={col.id}
                                type="button"
                                disabled={isDisabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isDisabled) return;
                                    onToggle(col.id, !on);
                                }}
                                className="flex items-center justify-between rounded-xl px-2 py-1.5 text-left text-[13px] text-slate-700 hover:bg-[#faf6ee] disabled:opacity-40"
                            >
                                <span className="truncate pr-3">{columnLabel(col)}</span>
                                <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-[#14121a]' : 'bg-slate-200'}`}>
                                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
