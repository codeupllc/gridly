import React from 'react';

export function TablePagination({ table, theme, pageSizeOptions }: any) {
    return (
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
                    {pageSizeOptions.map((size: number) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-700">entries</span>
            </div>
            <span className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
        </div>
    );
} 