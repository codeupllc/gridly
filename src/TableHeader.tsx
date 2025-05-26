import React from 'react';
import { flexRender } from '@tanstack/react-table';

export function TableHeader({ table, theme, cellPadding, enableGrouping }: any) {
    return (
        <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header: any, idx: number) => (
                        <th
                            key={header.id}
                            className={`${cellPadding} text-center font-semibold cursor-pointer select-none ${theme.header} border-b ${theme.border} border-r ${theme.border} last:border-r-0`}
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
    );
} 