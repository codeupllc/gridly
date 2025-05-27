import React, { useState, useEffect } from 'react';
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
    ColumnOrderState,
    FilterFn,
} from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { TableGrouping } from './TableGrouping';
import { TablePagination } from './TablePagination';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';

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
    customPagination?: React.ReactNode | ((table: any) => React.ReactNode);
    customGlobalSearch?: React.ReactNode;
    showGlobalSearch?: boolean;
    onGlobalFilterChange?: (value: string) => void;
}

// Register the global filter function
const myGlobalFilter: FilterFn<any> = (row, columnId, filterValue) => {
    return Object.values(row.original).some(val => {
        if (typeof val === 'string') {
            return val.toLowerCase().includes(filterValue.toLowerCase());
        }
        // Check for nested objects (e.g., campaign)
        if (val && typeof val === 'object') {
            return Object.values(val).some(nestedVal =>
                typeof nestedVal === 'string' && nestedVal.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return false;
    });
};

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
    customPagination,
    customGlobalSearch,
    showGlobalSearch = true,
    onGlobalFilterChange,
}: TableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialPageSize,
    });
    const [grouping, setGrouping] = useState<GroupingState>(groupBy);
    const [isDragging, setIsDragging] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
        columns.map(col => (col as any).id || (col as any).accessorKey)
    );
    const [searchValue, setSearchValue] = useState(globalFilter);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            globalFilter,
            grouping: enableGrouping ? grouping : [],
            expanded,
            columnOrder,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        ...(enableGrouping && { getGroupedRowModel: getGroupedRowModel() }),
        getExpandedRowModel: getExpandedRowModel(),
        filterFns: { myGlobalFilter },
        globalFilterFn: 'myGlobalFilter' as any,
        onGlobalFilterChange,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            if (onGlobalFilterChange) {
                onGlobalFilterChange(searchValue);
            } else {
                table.setGlobalFilter(searchValue);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [searchValue]);

    useEffect(() => {
        setSearchValue(globalFilter);
    }, [globalFilter]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(columnOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setColumnOrder(items);
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

    return (
        <div className={`overflow-x-auto ${t.container} p-4`}>
            {enableGrouping && (
                <TableGrouping
                    grouping={grouping}
                    setGrouping={setGrouping}
                    table={table}
                    theme={t}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                />
            )}
            {/* Custom or built-in global search */}
            {customGlobalSearch ? (
                customGlobalSearch
            ) : showGlobalSearch ? (
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-gray-400">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
                    </span>
                    <input
                        type="search"
                        className="border rounded px-3 py-2 w-full"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                    />
                    {searchValue && (
                        <button
                            className="ml-2 text-gray-400 hover:text-red-500"
                            onClick={() => setSearchValue('')}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            ) : null}
            <table className={`min-w-full rounded shadow table-fixed ${t.container} border-separate border-spacing-0`}>
                <TableHeader
                    table={table}
                    theme={t}
                    cellPadding={cellPadding}
                    enableGrouping={enableGrouping}
                    onDragEnd={handleDragEnd}
                />
                <TableBody
                    table={table}
                    theme={t}
                    cellPadding={cellPadding}
                    onRowClick={onRowClick}
                />
            </table>
            {/* Custom or built-in pagination */}
            {showPagination && (
                typeof customPagination === 'function'
                    ? customPagination(table)
                    : customPagination
                        ? customPagination
                        : (
                            <TablePagination
                                table={table}
                                theme={t}
                                pageSizeOptions={pageSizeOptions}
                            />
                        )
            )}
        </div>
    );
} 