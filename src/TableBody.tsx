import React from 'react';
import { flexRender, Row, Cell } from '@tanstack/react-table';

export function TableBody({ table, theme, cellPadding, onRowClick }: any) {
    function renderRows(rows: Row<any>[]): React.ReactNode {
        return rows.map((row: Row<any>) => {
            if (row.getIsGrouped()) {
                const groupColIdx = row.getVisibleCells().findIndex((cell: Cell<any, unknown>) => cell.getIsGrouped());
                const groupCell = row.getVisibleCells()[groupColIdx];
                return (
                    <React.Fragment key={row.id}>
                        <tr className={`${theme.groupedRow} font-semibold`}>
                            {row.getVisibleCells().map((cell: Cell<any, unknown>, idx: number) => (
                                <td
                                    key={cell.id}
                                    className={`${cellPadding} text-sm text-center border-b ${theme.border} border-r ${theme.border} last:border-r-0 ${theme.rowHover}`}
                                    style={{ paddingLeft: idx === groupColIdx ? row.depth * 20 : undefined }}
                                >
                                    {idx === groupColIdx && (
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                row.toggleExpanded();
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <span>
                                                {row.getIsExpanded() ? '▼' : '▶'}
                                            </span>
                                            <span className="font-medium">
                                                {String(groupCell.getValue())} ({row.subRows?.length || 0})
                                            </span>
                                        </button>
                                    )}
                                    {cell.getIsAggregated() && !cell.getIsGrouped() && !cell.getIsPlaceholder() && (
                                        typeof cell.column.columnDef.aggregatedCell === 'function'
                                            ? cell.column.columnDef.aggregatedCell(cell.getContext())
                                            : String(cell.getValue())
                                    )}
                                </td>
                            ))}
                        </tr>
                        {row.getIsExpanded() && row.subRows?.length > 0 && renderRows(row.subRows as Row<any>[])}
                    </React.Fragment>
                );
            }
            // Normal row
            return (
                <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`cursor-pointer ${theme.row} ${theme.rowBg}`}
                >
                    {row.getVisibleCells().map((cell: Cell<any, unknown>, idx: number) => (
                        <td
                            key={cell.id}
                            className={`${cellPadding} text-sm text-center border-b ${theme.border} border-r ${theme.border} last:border-r-0 ${theme.rowHover}`}
                            style={{ paddingLeft: row.depth * 20 }}
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
    return (
        <tbody className={theme.container}>
            {renderRows(table.getRowModel().rows)}
        </tbody>
    );
} 