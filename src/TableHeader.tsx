import React, { useState, useRef, useEffect } from 'react';
import { flexRender } from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FilterPopover } from './components/FilterPopover';
import { SliderRangeFilter } from './components/SliderRangeFilter';

function SortIcon({ dir }: { dir: false | 'asc' | 'desc' }) {
    return (
        <span className={`ml-1 inline-flex h-3.5 w-3.5 items-center justify-center ${dir ? 'opacity-100' : 'opacity-35'}`}>
            {dir === 'desc' ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 7l3-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 6.5L5 3l3 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
        </span>
    );
}

function ColumnSearchInput({
    value,
    onChange,
    theme,
}: {
    value: string;
    onChange: (v: string) => void;
    theme: any;
}) {
    return (
        <div className="relative mt-2.5">
            <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
            >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search…"
                className={
                    theme.filterInput ||
                    'h-8 w-full rounded-full border border-slate-200 bg-white pl-8 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5'
                }
            />
        </div>
    );
}

export function TableHeader({ table, theme, cellPadding, enableGrouping, showColumnFilters, onDragEnd }: any) {
    return (
        <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
                <DragDropContext onDragEnd={onDragEnd} key={headerGroup.id}>
                    <Droppable droppableId="columns" direction="horizontal">
                        {(provided) => (
                            <tr ref={provided.innerRef} {...provided.droppableProps} className={theme.headerRow || ''}>
                                {headerGroup.headers.filter((header: any) => header.column.getIsVisible()).map((header: any, idx: number) => {
                                    const showFilter =
                                        Boolean(header.column.columnDef.meta?.filterType) ||
                                        (showColumnFilters && header.column.getCanFilter());
                                    return (
                                        <th
                                            key={header.id}
                                            className={`${cellPadding} ${theme.header} border-b border-transparent text-left align-bottom first:rounded-tl-2xl last:rounded-tr-2xl`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {enableGrouping && header.column.columnDef.meta?.canGroup !== false && (
                                                    <span
                                                        draggable
                                                        onDragStart={e => {
                                                            e.stopPropagation();
                                                            e.dataTransfer.setData('text/plain', header.column.id);
                                                        }}
                                                        className="cursor-grab opacity-40 hover:opacity-80"
                                                        title="Drag to group"
                                                    >
                                                        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                                            <circle cx="3" cy="3" r="1.1" />
                                                            <circle cx="7" cy="3" r="1.1" />
                                                            <circle cx="3" cy="7" r="1.1" />
                                                            <circle cx="7" cy="7" r="1.1" />
                                                            <circle cx="3" cy="11" r="1.1" />
                                                            <circle cx="7" cy="11" r="1.1" />
                                                        </svg>
                                                    </span>
                                                )}
                                                <Draggable key={header.id} draggableId={header.id} index={idx}>
                                                    {(drag, snapshot) => (
                                                        <button
                                                            type="button"
                                                            ref={drag.innerRef}
                                                            {...drag.draggableProps}
                                                            {...drag.dragHandleProps}
                                                            className={`inline-flex items-center text-left ${snapshot.isDragging ? 'opacity-70' : ''}`}
                                                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                        >
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {header.column.getCanSort() && <SortIcon dir={header.column.getIsSorted()} />}
                                                        </button>
                                                    )}
                                                </Draggable>
                                            </div>
                                            {showFilter ? (
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
                                                    <ColumnSearchInput
                                                        value={String(header.column.getFilterValue() ?? '')}
                                                        onChange={(v) => header.column.setFilterValue(v)}
                                                        theme={theme}
                                                    />
                                                )
                                            ) : null}
                                        </th>
                                    );
                                })}
                                {provided.placeholder}
                            </tr>
                        )}
                    </Droppable>
                </DragDropContext>
            ))}
        </thead>
    );
}

function AmountFilterPopover({ column, theme }: { column: any; theme: any }) {
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const filterValue = column.getFilterValue() || { op: '=', value: '' };
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) setShow(false);
        }
        if (show) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [show]);
    return (
        <div className="relative mt-2 inline-block" ref={ref}>
            <button
                type="button"
                className={`rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] ${theme.muted || 'text-slate-400'}`}
                onClick={e => { e.stopPropagation(); setShow(v => !v); }}
            >
                Filter
            </button>
            {show && (
                <FilterPopover ref={ref}>
                    <label className="mb-1 text-[12px] font-medium">Amount</label>
                    <select
                        className="rounded-full border border-slate-200 px-2 py-1 text-[13px]"
                        value={filterValue.op}
                        onChange={e => column.setFilterValue({ ...filterValue, op: e.target.value })}
                    >
                        <option value="=">=</option>
                        <option value=">">≥</option>
                        <option value="<">≤</option>
                    </select>
                    <input
                        type="number"
                        className="mt-1 rounded-full border border-slate-200 px-3 py-1.5 text-[13px]"
                        value={filterValue.value}
                        onChange={e => column.setFilterValue({ ...filterValue, value: e.target.value })}
                        placeholder="Amount"
                    />
                </FilterPopover>
            )}
        </div>
    );
}
