import React from 'react';
import { flexRender } from '@tanstack/react-table';

export function TableGrouping({ grouping, setGrouping, table, theme, isDragging, setIsDragging }: any) {
    return (
        <div
            className={`flex min-h-[36px] flex-wrap items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                isDragging ? 'border-slate-400 bg-slate-50' : theme.border || 'border-slate-200'
            } ${theme.container || 'bg-white'}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
                setIsDragging(false);
                const columnId = e.dataTransfer.getData('text/plain');
                if (columnId && !grouping.includes(columnId)) {
                    setGrouping([...grouping, columnId]);
                }
            }}
        >
            <span className={`text-[11px] font-medium uppercase tracking-[0.16em] ${theme.muted || 'text-slate-400'}`}>
                Group
            </span>
            {grouping.length === 0 ? (
                <span className={`text-[13px] ${theme.muted || 'text-slate-400'}`}>
                    {isDragging ? 'Drop to group' : 'Drag a column header here'}
                </span>
            ) : (
                grouping.map((columnId: string) => {
                    const headerObj = table.getHeaderGroups()[0]?.headers.find((h: any) => h.column.id === columnId);
                    return (
                        <span
                            key={columnId}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${theme.groupChip || 'bg-slate-900 text-white'}`}
                        >
                            {headerObj
                                ? flexRender(headerObj.column.columnDef.header, headerObj.getContext())
                                : columnId}
                            <button
                                type="button"
                                onClick={() => setGrouping(grouping.filter((id: string) => id !== columnId))}
                                className="ml-0.5 text-current/70 hover:text-current"
                                aria-label="Remove group"
                            >
                                ×
                            </button>
                        </span>
                    );
                })
            )}
        </div>
    );
}
