import React, { useState, useRef, useEffect } from 'react';
import { flexRender } from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FilterPopover } from './components/FilterPopover';
import { SliderRangeFilter } from './components/SliderRangeFilter';

export function TableHeader({ table, theme, cellPadding, enableGrouping, onDragEnd }: any) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const allLeafColumns = table.getAllLeafColumns();
    const visibleColumns = allLeafColumns.filter((col: any) => col.getIsVisible());

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
        <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
                <DragDropContext onDragEnd={onDragEnd} key={headerGroup.id}>
                    <Droppable droppableId="columns" direction="horizontal">
                        {(provided) => (
                            <tr
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {headerGroup.headers.map((header: any, idx: number) => (
                                    <th
                                        key={header.id}
                                        className={`${cellPadding} select-none ${theme.header} border-b ${theme.border} border-r ${theme.border} last:border-r-0`}
                                    >
                                        <div className={`flex items-center justify-center gap-2 ${theme.headerContent}`}>
                                            {/* Group drag handle outside Draggable */}
                                            {enableGrouping && (header.column.columnDef.meta?.canGroup !== false) && (
                                                <span
                                                    draggable
                                                    onDragStart={e => {
                                                        e.stopPropagation();
                                                        e.dataTransfer.setData('text/plain', header.column.id);
                                                    }}
                                                    className={`${theme.headerIcon} cursor-grab hover:${theme.headerIconHover} mr-1`}
                                                    title="Drag to group by this column"
                                                    aria-label="Group by"
                                                    tabIndex={-1}
                                                >
                                                    &#8801; {/* Group by: Drag to group */}
                                                </span>
                                            )}
                                            {/* Draggable for column reordering */}
                                            <Draggable
                                                key={header.id}
                                                draggableId={header.id}
                                                index={idx}
                                            >
                                                {(provided, snapshot) => (
                                                    <span
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`flex items-center gap-2 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? theme.headerDragging : ''} transition-all duration-200 ${theme.headerText}`}
                                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                        title="Drag to reorder columns"
                                                        aria-label="Reorder column"
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() === 'asc' && <span className={theme.headerSortIcon}> ▲</span>}
                                                        {header.column.getIsSorted() === 'desc' && <span className={theme.headerSortIcon}> ▼</span>}
                                                    </span>
                                                )}
                                            </Draggable>
                                        </div>
                                        {header.column.getCanFilter() ? (
                                            header.column.columnDef.meta?.filterType === 'slider-range' ? (
                                                <SliderRangeFilter
                                                    min={header.column.columnDef.meta.min}
                                                    max={header.column.columnDef.meta.max}
                                                    value={
                                                        Array.isArray(header.column.getFilterValue()) && header.column.getFilterValue().length === 2
                                                            ? header.column.getFilterValue()
                                                            : [header.column.columnDef.meta.min, header.column.columnDef.meta.max]
                                                    }
                                                    onChange={vals => header.column.setFilterValue(vals)}
                                                />
                                            ) : header.column.columnDef.meta?.filterType === 'amount' ? (
                                                <AmountFilterPopover column={header.column} theme={theme} />
                                            ) : (
                                                <div className={theme.filterContainer}>
                                                    <input
                                                        type="text"
                                                        value={String(header.column.getFilterValue() ?? '')}
                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                        placeholder={theme.inputPlaceholder || 'Filter...'}
                                                        className={`mt-1 block w-full ${theme.input}`}
                                                    />
                                                </div>
                                            )
                                        ) : null}
                                    </th>
                                ))}
                                {provided.placeholder}
                            </tr>
                        )}
                    </Droppable>
                </DragDropContext>
            ))}
        </thead>
    );
}

function AmountFilterPopover({ column, theme }: { column: any, theme: any }) {
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const filterValue = column.getFilterValue() || { op: '=', value: '' };
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setShow(false);
            }
        }
        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show]);
    return (
        <div className={`relative inline-block ${theme.filterPopoverContainer}`}>
            <button
                className={`ml-1 ${theme.filterButton}`}
                onClick={e => { e.stopPropagation(); setShow(v => !v); }}
                aria-label="Filter Amount"
                tabIndex={-1}
            >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className={theme.filterIcon}><path stroke="currentColor" strokeWidth="2" d="M4 6h16M7 12h10m-4 6h4" /></svg>
            </button>
            {show && (
                <FilterPopover ref={ref}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Filter Amount</label>
                    <select
                        style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '0.25rem 0.5rem', fontSize: '0.95rem', background: '#f9fafb', color: '#222' }}
                        value={filterValue.op}
                        onChange={e => column.setFilterValue({ ...filterValue, op: e.target.value })}
                    >
                        <option value="=">=</option>
                        <option value=">">≥</option>
                        <option value="<">≤</option>
                    </select>
                    <input
                        type="number"
                        style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '0.25rem 0.5rem', fontSize: '0.95rem', marginTop: 4, background: '#fff', color: '#222' }}
                        value={filterValue.value}
                        onChange={e => column.setFilterValue({ ...filterValue, value: e.target.value })}
                        placeholder="Enter amount"
                    />
                </FilterPopover>
            )}
        </div>
    );
} 