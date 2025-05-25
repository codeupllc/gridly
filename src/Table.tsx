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

export interface TableProps<T extends object> {
    data: T[];
    columns: ColumnDef<T, any>[];
    globalFilter?: string;
    initialPageSize?: number;
    onRowClick?: (row: T) => void;
    enableGrouping?: boolean;
    groupBy?: string[];
}

export function Table<T extends object>({
    data,
    columns,
    globalFilter = '',
    initialPageSize = 10,
    onRowClick,
    enableGrouping = false,
    groupBy = [],
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

    function renderRows(rows: Row<T>[]): React.ReactNode {
        return rows.map((row: Row<T>) => {
            if (row.getIsGrouped()) {
                const groupColIdx = row.getVisibleCells().findIndex((cell: Cell<T, unknown>) => cell.getIsGrouped());
                const groupCell = row.getVisibleCells()[groupColIdx];
                return (
                    <React.Fragment key={row.id}>
                        <tr className="bg-gray-50 font-semibold text-gray-900">
                            {row.getVisibleCells().map((cell: Cell<T, unknown>, idx: number) => (
                                <td
                                    key={cell.id}
                                    className="px-3 py-4 text-sm text-gray-900"
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
                                            <span className={`transform transition-transform ${row.getIsExpanded() ? 'rotate-90' : ''}`}>▶</span>
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
                    className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                    {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                        <td
                            key={cell.id}
                            className="px-3 py-4 text-sm text-gray-500"
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
        <div className="overflow-x-auto">
            {enableGrouping && (
                <div
                    className={`mb-4 p-4 bg-gray-50 rounded border-2 border-dashed transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
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
                    <div className="flex gap-2 min-h-[40px]">
                        {grouping.map((columnId, index) => {
                            const column = table.getColumn(columnId);
                            const headerObj = table.getHeaderGroups()[0]?.headers.find(h => h.column.id === columnId);
                            return (
                                <div
                                    key={columnId}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                                >
                                    {headerObj ? flexRender(headerObj.column.columnDef.header, headerObj.getContext()) : columnId}
                                    <button
                                        onClick={() => {
                                            setGrouping(grouping.filter(id => id !== columnId));
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <table className="min-w-full bg-white rounded shadow">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none"
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
                <tbody>
                    {renderRows(table.getRowModel().rows)}
                </tbody>
            </table>
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
                <span className="text-sm text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
            </div>
        </div>
    );
} 