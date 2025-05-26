import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
    flexRender,
    SortingState,
    ColumnDef,
    GroupingState,
    Row,
    Cell,
} from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';

export interface TableTheme {
    container?: string;
    header?: string;
    groupChip?: string;
    row?: string;
    rowBg?: string;
    rowHover?: string;
    groupedRow?: string;
    selected?: string;
    border?: string;
}

export interface TableProps<T extends object> {
    data: T[];
    columns: ColumnDef<T, any>[];
    globalFilter?: string;
    initialPageSize?: number;
    onRowClick?: (row: T) => void;
    enableGrouping?: boolean;
    groupBy?: string[];
    theme?: 'light' | 'dark' | 'blue' | 'green';
    customTheme?: TableTheme;
    cellPadding?: string;
    showPagination?: boolean;
    pageSizeOptions?: number[];
}

export function Table<T extends object>({
    data,
    columns,
    globalFilter = '',
    initialPageSize = 10,
    onRowClick,
    enableGrouping = false,
    groupBy = [],
    theme = 'light',
    customTheme,
    cellPadding = 'px-3 py-4',
    showPagination = true,
    pageSizeOptions = [10, 25, 50, 100],
}: TableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialPageSize,
    });
    const [grouping, setGrouping] = useState<GroupingState>(groupBy);
    const [isDragging, setIsDragging] = useState(false);
    const [expanded, setExpanded] = useState({});

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            globalFilter,
            grouping: enableGrouping ? grouping : [],
            expanded,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        ...(enableGrouping && { getGroupedRowModel: getGroupedRowModel() }),
        getExpandedRowModel: getExpandedRowModel(),
    });

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(grouping);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setGrouping(items);
    };

    // Theme class maps
    const themeClasses = {
        light: {
            container: 'bg-white',
            header: 'bg-gray-100 text-gray-700',
            groupChip: 'bg-blue-100 text-blue-800',
            row: 'text-gray-900',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-gray-50',
            groupedRow: 'bg-gray-50 text-gray-900',
            selected: 'bg-blue-50',
            border: 'border-gray-200',
        },
        dark: {
            container: 'bg-gray-900',
            header: 'bg-gray-800 text-gray-100',
            groupChip: 'bg-green-700 text-white',
            row: 'text-gray-100',
            rowBg: 'bg-gray-900',
            rowHover: 'hover:bg-gray-800',
            groupedRow: 'bg-gray-800 text-white',
            selected: 'bg-gray-700',
            border: 'border-gray-700',
        },
        blue: {
            container: 'bg-blue-50',
            header: 'bg-blue-200 text-blue-900',
            groupChip: 'bg-blue-500 text-white',
            row: 'text-blue-900',
            rowBg: 'bg-blue-50',
            rowHover: 'hover:bg-blue-100',
            groupedRow: 'bg-blue-100 text-blue-900',
            selected: 'bg-blue-200',
            border: 'border-blue-600',
        },
        green: {
            container: 'bg-green-50',
            header: 'bg-green-200 text-green-900',
            groupChip: 'bg-green-500 text-white',
            row: 'text-green-900',
            rowBg: 'bg-green-50',
            rowHover: 'hover:bg-green-100',
            groupedRow: 'bg-green-100 text-green-900',
            selected: 'bg-green-200',
            border: 'border-green-600',
        },
    };
    // Merge customTheme if provided
    const t = customTheme ? { ...themeClasses[theme] || themeClasses.light, ...customTheme } : (themeClasses[theme] || themeClasses.light);

    function renderRows(rows: Row<T>[]): React.ReactNode {
        return rows.map((row: Row<T>) => {
            if (row.getIsGrouped()) {
                const groupColIdx = row.getVisibleCells().findIndex((cell: Cell<T, unknown>) => cell.getIsGrouped());
                const groupCell = row.getVisibleCells()[groupColIdx];
                return (
                    <React.Fragment key={row.id}>
                        <tr className={`${t.groupedRow} font-semibold`}>
                            {row.getVisibleCells().map((cell: Cell<T, unknown>, idx: number) => (
                                <td
                                    key={cell.id}
                                    className={`${cellPadding} text-sm text-center border-b ${t.border} border-r ${t.border} last:border-r-0 ${t.rowHover}`}
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
                        {row.getIsExpanded() && row.subRows?.length > 0 && renderRows(row.subRows as Row<T>[])}
                    </React.Fragment>
                );
            }
            // Normal row
            return (
                <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`cursor-pointer ${t.row} ${t.rowBg}`}
                >
                    {row.getVisibleCells().map((cell: Cell<T, unknown>, idx: number) => (
                        <td
                            key={cell.id}
                            className={`${cellPadding} text-sm text-center border-b ${t.border} border-r ${t.border} last:border-r-0 ${t.rowHover}`}
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
        <div className={`overflow-x-auto ${t.container} p-4`}>
            {enableGrouping && (
                <div
                    className={`mb-4 p-4 rounded border-2 border-dashed transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} ${t.container}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={e => { setIsDragging(false); }}
                    onDrop={e => {
                        setIsDragging(false);
                        const columnId = e.dataTransfer.getData('text/plain');
                        if (columnId && !grouping.includes(columnId)) {
                            setGrouping([...grouping, columnId]);
                        }
                    }}
                >
                    <h3 className="text-sm font-semibold mb-2">Group By</h3>
                    <div className="flex gap-2 min-h-[40px] items-center">
                        {grouping.length === 0 ? (
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" />
                                </svg>
                                <span>Drag columns here to group</span>
                            </div>
                        ) : (
                            grouping.map((columnId, index) => {
                                const column = table.getColumn(columnId);
                                const headerObj = table.getHeaderGroups()[0]?.headers.find(h => h.column.id === columnId);
                                return (
                                    <div
                                        key={columnId}
                                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${t.groupChip}`}
                                    >
                                        {headerObj ? flexRender(headerObj.column.columnDef.header, headerObj.getContext()) : columnId}
                                        <button
                                            onClick={() => {
                                                setGrouping(grouping.filter(id => id !== columnId));
                                            }}
                                            className="hover:text-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
            <table className={`min-w-full rounded shadow ${t.container} border-separate border-spacing-0`}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header, idx) => (
                                <th
                                    key={header.id}
                                    className={`${cellPadding} text-center font-semibold cursor-pointer select-none ${t.header} border-b ${t.border} border-r ${t.border} last:border-r-0`}
                                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                    draggable={enableGrouping}
                                    onDragStart={e => {
                                        if (enableGrouping) {
                                            e.dataTransfer.setData('text/plain', header.column.id);
                                        }
                                    }}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() === 'asc' && ' ▲'}
                                    {header.column.getIsSorted() === 'desc' && ' ▼'}
                                    {header.column.getCanFilter() ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={String(header.column.getFilterValue() ?? '')}
                                                onChange={e => header.column.setFilterValue(e.target.value)}
                                                placeholder={`Filter...`}
                                                className="mt-1 block w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    ) : null}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className={t.container}>
                    {renderRows(table.getRowModel().rows)}
                </tbody>
            </table>
            {showPagination && (
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="px-2 py-1 border rounded disabled:opacity-50 mr-2"
                        >
                            {'<<'}
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-2 py-1 border rounded disabled:opacity-50 mr-2"
                        >
                            {'<'}
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-2 py-1 border rounded disabled:opacity-50 mr-2"
                        >
                            {'>'}
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="px-2 py-1 border rounded disabled:opacity-50"
                        >
                            {'>>'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Show</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-700">entries</span>
                    </div>
                    <span className="text-sm text-gray-700">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                </div>
            )}
        </div>
    );
} 