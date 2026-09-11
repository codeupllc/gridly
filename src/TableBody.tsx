import React from 'react';
import { flexRender, Row, Cell } from '@tanstack/react-table';

export function TableBody({ table, theme, cellPadding, onRowClick, isLoading, emptyMessage }: any) {
    function renderRows(rows: Row<any>[]): React.ReactNode {
        return rows.map((row: Row<any>) => {
            if (row.getIsGrouped()) {
                const groupColIdx = row.getVisibleCells().findIndex((cell: Cell<any, unknown>) => cell.getIsGrouped());
                const groupCell = row.getVisibleCells()[groupColIdx];
                return (
                    <tr key={row.id} className={`${theme.groupedRow}`}>
                        {row.getVisibleCells().map((cell: Cell<any, unknown>, idx: number) => (
                            <td
                                key={cell.id}
                                className={`${cellPadding} border-b ${theme.border} text-left text-[13px]`}
                            >
                                {idx === groupColIdx && (
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            row.toggleExpanded();
                                        }}
                                        className="inline-flex items-center gap-2 text-slate-900"
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={row.getIsExpanded() ? 'rotate-180' : ''}>
                                                <path d="M2 3.5L5 7l3-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                        <span className="font-medium tracking-tight">{String(groupCell.getValue())}</span>
                                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                                            {row.subRows?.length || 0}
                                        </span>
                                    </button>
                                )}
                                {cell.getIsAggregated() && !cell.getIsGrouped() && !cell.getIsPlaceholder() && (
                                    <span className="font-medium text-slate-800">
                                        {flexRender(
                                            cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </span>
                                )}
                            </td>
                        ))}
                    </tr>
                );
            }
            return (
                <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} ${theme.row} ${theme.rowBg} ${theme.rowHover} transition-colors`}
                >
                    {row.getVisibleCells().map((cell: Cell<any, unknown>) => (
                        <td
                            key={cell.id}
                            className={`${cellPadding} border-b ${theme.border} text-left text-[13.5px] leading-6`}
                            style={{ paddingLeft: row.depth ? row.depth * 20 + 16 : undefined }}
                        >
                            {cell.getIsAggregated() && typeof cell.column.columnDef.aggregatedCell === 'function'
                                ? cell.column.columnDef.aggregatedCell(cell.getContext())
                                : flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            );
        });
    }

    const columnCount = Math.max(table.getVisibleLeafColumns().length, 1);

    if (isLoading) {
        return (
            <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                        <td colSpan={columnCount} className="px-4 py-3">
                            <div className="h-3 max-w-[70%] animate-pulse rounded-full bg-slate-100" style={{ width: `${60 + (i % 3) * 12}%` }} />
                        </td>
                    </tr>
                ))}
            </tbody>
        );
    }

    const rows = table.getRowModel().rows;
    if (!rows.length) {
        return (
            <tbody>
                <tr>
                    <td colSpan={columnCount} className="px-4 py-16 text-center">
                        <p className="font-[family-name:inherit] text-[15px] font-medium text-slate-800">{emptyMessage || 'Nothing here yet'}</p>
                        <p className={`mt-1 text-[13px] ${theme.muted || 'text-slate-500'}`}>Try a different search or add a record.</p>
                    </td>
                </tr>
            </tbody>
        );
    }

    return <tbody>{renderRows(rows)}</tbody>;
}
