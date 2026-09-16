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
    VisibilityState,
    ExpandedState,
} from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { TableGrouping } from './TableGrouping';
import { TablePagination } from './TablePagination';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { ColumnVisibilityPopover } from './components/ColumnVisibilityPopover';
import { SearchBar } from './components/SearchBar';
import { TableTheme, TableThemeName } from './types';
import { rowMatchesGlobalFilter } from './globalFilter';

export type { TableTheme, TableThemeName };

export interface TableProps<T extends object> {
    data: T[];
    columns: ColumnDef<T, any>[];
    globalFilter?: string;
    initialPageSize?: number;
    onRowClick?: (row: T) => void;
    enableGrouping?: boolean;
    groupBy?: string[];
    /** Per-column search boxes. Off by default — use the main search, or set meta.filterType to opt a column in. */
    showColumnFilters?: boolean;
    theme?: TableThemeName;
    customTheme?: TableTheme;
    cellPadding?: string;
    showPagination?: boolean;
    pageSizeOptions?: number[];
    customPagination?: React.ReactNode | ((table: any) => React.ReactNode);
    customGlobalSearch?: React.ReactNode;
    showGlobalSearch?: boolean;
    onGlobalFilterChange?: (value: string) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

const myGlobalFilter: FilterFn<any> = (row, _columnId, filterValue) => {
    return rowMatchesGlobalFilter(row.original, filterValue);
};

export function Table<T extends object>({
    data,
    columns,
    globalFilter = '',
    initialPageSize = 10,
    onRowClick,
    enableGrouping = false,
    groupBy = [],
    showColumnFilters = false,
    theme = 'light',
    customTheme,
    cellPadding = 'px-4 py-3.5',
    showPagination = true,
    pageSizeOptions = [10, 25, 50, 100],
    customPagination,
    customGlobalSearch,
    showGlobalSearch = true,
    onGlobalFilterChange,
    isLoading = false,
    emptyMessage = 'No rows to display',
}: TableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialPageSize,
    });
    const [grouping, setGrouping] = useState<GroupingState>(groupBy);
    const [isDragging, setIsDragging] = useState(false);
    const [expanded, setExpanded] = useState<ExpandedState>(() => (enableGrouping ? true : {}));
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
        columns.map(col => (col as any).id || (col as any).accessorKey)
    );
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [searchValue, setSearchValue] = useState(globalFilter);
    const [appliedFilter, setAppliedFilter] = useState(globalFilter);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showSearch, setShowSearch] = useState(false);

    const onFilterChangeRef = useRef(onGlobalFilterChange);
    onFilterChangeRef.current = onGlobalFilterChange;

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            globalFilter: appliedFilter,
            grouping: enableGrouping ? grouping : [],
            expanded,
            columnOrder,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        ...(enableGrouping && { getGroupedRowModel: getGroupedRowModel() }),
        getExpandedRowModel: getExpandedRowModel(),
        autoResetPageIndex: false,
        autoResetExpanded: false,
        enableColumnFilters: true,
        filterFns: { myGlobalFilter },
        globalFilterFn: myGlobalFilter,
        onGlobalFilterChange: (updater) => {
            const next = typeof updater === 'function' ? updater(appliedFilter) : updater;
            const value = next ?? '';
            setAppliedFilter(value);
            setSearchValue(value);
            onFilterChangeRef.current?.(value);
        },
    });

    const allLeafColumns = table.getAllLeafColumns();

    useEffect(() => {
        const handler = setTimeout(() => {
            setAppliedFilter(searchValue);
            onFilterChangeRef.current?.(searchValue);
        }, 200);
        return () => clearTimeout(handler);
    }, [searchValue]);

    useEffect(() => {
        setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }, [appliedFilter]);

    useEffect(() => {
        if (enableGrouping && appliedFilter) setExpanded(true);
    }, [appliedFilter, enableGrouping]);

    useEffect(() => {
        if (!onFilterChangeRef.current) return;
        setSearchValue(globalFilter);
        setAppliedFilter(globalFilter);
    }, [globalFilter]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(columnOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setColumnOrder(items);
    };

    const themeClasses: Record<TableThemeName, TableTheme> = {
        light: {
            container: 'bg-white',
            header: 'bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500',
            groupChip: 'bg-slate-900 text-white',
            row: 'text-slate-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-stone-50',
            groupedRow: 'bg-stone-50/90 text-slate-900',
            selected: 'bg-stone-100',
            border: 'border-slate-100',
            input: 'bg-white text-slate-900 border-slate-200',
            filterInput: 'h-8 w-full rounded-full border border-slate-200 bg-white pl-8 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5',
            inputPlaceholder: 'Search records…',
            muted: 'text-slate-400',
            button: 'bg-white text-slate-700 hover:bg-slate-50',
        },
        dark: {
            container: 'bg-slate-950',
            header: 'bg-slate-900 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300',
            groupChip: 'bg-white text-slate-900',
            row: 'text-slate-200',
            rowBg: 'bg-slate-950',
            rowHover: 'hover:bg-slate-900',
            groupedRow: 'bg-slate-900 text-white',
            selected: 'bg-slate-800',
            border: 'border-slate-800',
            input: 'bg-slate-900 text-white border-slate-700',
            filterInput: 'h-8 w-full rounded-full border border-white/10 bg-white/5 pl-8 pr-3 text-[12px] text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-white/25 focus:bg-white/10 focus:ring-2 focus:ring-white/10',
            inputPlaceholder: 'Search records…',
            muted: 'text-slate-400',
            button: 'bg-slate-900 text-white hover:bg-slate-800',
        },
        blue: {
            container: 'bg-white',
            header: 'bg-sky-50 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700/70',
            groupChip: 'bg-sky-900 text-white',
            row: 'text-slate-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-sky-50/60',
            groupedRow: 'bg-sky-50 text-sky-950',
            selected: 'bg-sky-50',
            border: 'border-sky-100',
            input: 'bg-white text-slate-900 border-sky-200',
            filterInput: 'h-8 w-full rounded-full border border-sky-200 bg-white pl-8 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-sky-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/15',
            inputPlaceholder: 'Search records…',
            muted: 'text-sky-700/70',
            button: 'bg-white text-sky-900 hover:bg-sky-50',
        },
        green: {
            container: 'bg-white',
            header: 'bg-emerald-50 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800/70',
            groupChip: 'bg-emerald-900 text-white',
            row: 'text-slate-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-emerald-50/50',
            groupedRow: 'bg-emerald-50 text-emerald-950',
            selected: 'bg-emerald-50',
            border: 'border-emerald-100',
            input: 'bg-white text-slate-900 border-emerald-200',
            filterInput: 'h-8 w-full rounded-full border border-emerald-200 bg-white pl-8 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15',
            inputPlaceholder: 'Search records…',
            muted: 'text-emerald-800/70',
            button: 'bg-white text-emerald-900 hover:bg-emerald-50',
        },
        slate: {
            container: 'bg-white',
            header: 'bg-[#14121a] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c9a96e]',
            groupChip: 'bg-[#14121a] text-[#c9a96e]',
            row: 'text-slate-700',
            rowBg: 'bg-white',
            rowHover: 'hover:bg-[#faf7f2]',
            groupedRow: 'bg-[#f5f0e6] text-slate-900',
            selected: 'bg-[#f0e9dc]',
            border: 'border-slate-100',
            input: 'bg-white text-slate-900 border-slate-200',
            filterInput: 'h-8 w-full rounded-full border border-white/10 bg-white/[0.07] pl-8 pr-3 text-[12px] text-[#f7f1e4] outline-none transition placeholder:text-white/35 focus:border-[#c9a96e]/50 focus:bg-white/[0.12] focus:ring-2 focus:ring-[#c9a96e]/20',
            inputPlaceholder: 'Search records…',
            muted: 'text-white/50',
            button: 'bg-white text-slate-700 hover:bg-[#faf6ee]',
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

    return (
        <div className={`${t.container}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {enableGrouping ? (
                    <TableGrouping
                        grouping={grouping}
                        setGrouping={setGrouping}
                        table={table}
                        theme={t}
                        isDragging={isDragging}
                        setIsDragging={setIsDragging}
                    />
                ) : null}
                <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
                    {customGlobalSearch ? (
                        customGlobalSearch
                    ) : showGlobalSearch ? (
                        <SearchBar
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            theme={t}
                        />
                    ) : null}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            className="inline-flex h-9 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium text-slate-600 transition hover:border-stone-300 hover:bg-stone-50"
                            onClick={e => { e.stopPropagation(); setShowDropdown(v => !v); }}
                            aria-label="Show or hide columns"
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="5" height="16" rx="1.5" fill="currentColor" opacity="0.35" />
                                <rect x="10" y="4" width="4" height="16" rx="1.5" fill="currentColor" />
                                <rect x="17" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity="0.35" />
                            </svg>
                            Columns
                        </button>
                        {showDropdown && (
                            <ColumnVisibilityPopover
                                allLeafColumns={allLeafColumns}
                                columnVisibility={columnVisibility as Record<string, boolean>}
                                onToggle={(columnId, visible) => {
                                    setColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
                                }}
                                onHideAll={() => {
                                    setColumnVisibility(() => {
                                        const next: VisibilityState = {};
                                        const hideable = allLeafColumns.filter((col: any) => {
                                            const header = col.columnDef.header;
                                            if (header === '' || header == null) return false;
                                            return col.getCanHide?.() !== false;
                                        });
                                        hideable.forEach((col: any, idx: number) => {
                                            next[col.id] = idx === 0;
                                        });
                                        return next;
                                    });
                                }}
                                onShowAll={() => {
                                    setColumnVisibility(() => {
                                        const next: VisibilityState = {};
                                        allLeafColumns.forEach((col: any) => {
                                            next[col.id] = true;
                                        });
                                        return next;
                                    });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className={`w-full min-w-full border-collapse ${t.container}`}>
                    <TableHeader
                        table={table}
                        theme={t}
                        cellPadding={cellPadding}
                        enableGrouping={enableGrouping}
                        showColumnFilters={showColumnFilters}
                        onDragEnd={handleDragEnd}
                    />
                    <TableBody
                        table={table}
                        theme={t}
                        cellPadding={cellPadding}
                        onRowClick={onRowClick}
                        isLoading={isLoading}
                        emptyMessage={emptyMessage}
                    />
                </table>
            </div>
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