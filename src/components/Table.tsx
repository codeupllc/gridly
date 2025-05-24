import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    PaginationState,
} from '@tanstack/react-table';

export interface TableProps<T extends object> {
    data: T[];
    columns: ColumnDef<T>[];
    globalFilter?: string;
    initialPageSize?: number;
    className?: string;
    onRowClick?: (row: T) => void;
}

export function Table<T extends object>({
    data,
    columns,
    globalFilter = '',
    initialPageSize = 10,
    className = '',
    onRowClick,
}: TableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPageSize,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            globalFilter,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full bg-white rounded shadow">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none"
                                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() === 'asc' && ' ▲'}
                                    {header.column.getIsSorted() === 'desc' && ' ▼'}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            onClick={() => onRowClick?.(row.original)}
                            className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-4 py-2 border-t">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
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