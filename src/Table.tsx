import React, { useState, useEffect, useRef } from 'react';
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
import { ColumnVisibilityPopover } from './components/ColumnVisibilityPopover';
import { SearchBar } from './components/SearchBar';

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
    input?: string;
    inputPlaceholder?: string;
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
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showSearch, setShowSearch] = useState(false);

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

    const allLeafColumns = table.getAllLeafColumns();
    const visibleColumns = allLeafColumns.filter((col: any) => col.getIsVisible());

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

    const themeClasses = {
        light: {
            container: 'bg-white',
            header: 'bg-gray-50 text-gray-900 font-medium',
            groupChip: 'bg-blue-100 text-blue-800',
            row: 'text-gray-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-gray-50',
            groupedRow: 'bg-gray-50 text-gray-900',
            selected: 'bg-blue-50',
            border: 'border-gray-200',
            input: 'bg-white text-gray-900 border-gray-300',
            inputPlaceholder: 'search...',
        },
        dark: {
            container: 'bg-gray-800',
            header: 'bg-gray-700 text-white font-semibold',
            groupChip: 'bg-indigo-500 text-white',
            row: 'text-white font-medium',
            rowBg: 'bg-gray-800',
            rowHover: 'hover:bg-gray-700/80',
            groupedRow: 'bg-gray-700 text-white',
            selected: 'bg-indigo-900/50',
            border: 'border-gray-600',
            input: 'bg-gray-700 text-white border-gray-600',
            inputPlaceholder: 'search...',
        },
        blue: {
            container: 'bg-white',
            header: 'bg-blue-50 text-blue-900 font-medium',
            groupChip: 'bg-blue-500 text-white',
            row: 'text-gray-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-blue-50/50',
            groupedRow: 'bg-blue-50 text-blue-900',
            selected: 'bg-blue-100',
            border: 'border-blue-200',
            input: 'bg-white text-blue-900 border-blue-200',
            inputPlaceholder: 'search...',
        },
        green: {
            container: 'bg-white',
            header: 'bg-emerald-50 text-emerald-900 font-medium',
            groupChip: 'bg-emerald-500 text-white',
            row: 'text-gray-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-emerald-50/50',
            groupedRow: 'bg-emerald-50 text-emerald-900',
            selected: 'bg-emerald-100',
            border: 'border-emerald-200',
            input: 'bg-white text-emerald-900 border-emerald-200',
            inputPlaceholder: 'search...',
        },
    };

    // Merge customTheme if provided
    const t = customTheme ? { ...themeClasses[theme] || themeClasses.light, ...customTheme } : (themeClasses[theme] || themeClasses.light);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    // Debug: Show if columns are missing
    console.log('allLeafColumns', allLeafColumns);
    return (
        <div className={`overflow-x-auto ${t.container} p-4`}>
            {/* Controls Row: Group By left, Columns & Search right */}
            <div className="flex items-start justify-between gap-4 w-full">
                {/* Group By (left) */}
                <div className="flex-1 min-w-0">
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
                </div>
                {/* Columns & Search (right) */}
                <div className="flex items-center gap-3">
                    {/* Search Bar (now first) */}
                    {customGlobalSearch ? (
                        customGlobalSearch
                    ) : showGlobalSearch ? (
                        <SearchBar
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    ) : null}
                    {/* Columns Icon Button (now after search bar) */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="h-9 w-9 flex items-center justify-center rounded-full border bg-white shadow hover:bg-gray-50 text-xl text-gray-500 hover:text-blue-600 transition-colors duration-200"
                            onClick={e => { e.stopPropagation(); setShowDropdown(v => !v); }}
                            aria-label="Show/hide columns"
                        >
                            {/* Columns SVG icon */}
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="5" height="16" rx="2" fill="currentColor" opacity="0.5" />
                                <rect x="10" y="4" width="4" height="16" rx="2" fill="currentColor" />
                                <rect x="17" y="4" width="4" height="16" rx="2" fill="currentColor" opacity="0.5" />
                            </svg>
                        </button>
                        {showDropdown && (
                            <ColumnVisibilityPopover
                                allLeafColumns={allLeafColumns}
                                visibleColumns={visibleColumns}
                                onHideAll={() => allLeafColumns.forEach((col: any) => col.toggleVisibility(false))}
                                onShowAll={() => allLeafColumns.forEach((col: any) => col.toggleVisibility(true))}
                            />
                        )}
                    </div>
                </div>
            </div>
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