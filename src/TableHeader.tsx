import React, { useState, useRef, useEffect } from 'react';
import { flexRender } from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
                                        className={`${cellPadding} text-center font-semibold select-none ${theme.header} border-b ${theme.border} border-r ${theme.border} last:border-r-0`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Group drag handle outside Draggable */}
                                            {enableGrouping && (
                                                <span
                                                    draggable
                                                    onDragStart={e => {
                                                        e.stopPropagation();
                                                        e.dataTransfer.setData('text/plain', header.column.id);
                                                    }}
                                                    className="cursor-grab text-gray-400 hover:text-blue-600 mr-1"
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
                                                        className={`flex items-center gap-2 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'opacity-50' : ''} transition-all duration-200`}
                                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                        title="Drag to reorder columns"
                                                        aria-label="Reorder column"
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() === 'asc' && ' ▲'}
                                                        {header.column.getIsSorted() === 'desc' && ' ▼'}
                                                    </span>
                                                )}
                                            </Draggable>
                                        </div>
                                        {header.column.getCanFilter() ? (
                                            header.column.columnDef.filterType === 'amount' ? (
                                                <AmountFilterPopover column={header.column} />
                                            ) : (
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={String(header.column.getFilterValue() ?? '')}
                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                        placeholder={`Filter...`}
                                                        className="mt-1 block w-full border rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                            )
                                        ) : null}
                                    </th>
                                ))}
                                {/* Render the column visibility toggle as a static <th> at the end, not part of drag-and-drop or grouping */}
                                <th className={`${cellPadding} text-center font-semibold select-none ${theme.header} border-b ${theme.border}`} style={{ position: 'relative', minWidth: 40 }}>
                                    <button
                                        className="px-2 py-1 rounded border bg-white shadow hover:bg-gray-50 text-xs"
                                        onClick={e => { e.stopPropagation(); setShowDropdown(v => !v); }}
                                        aria-label="Show/hide columns"
                                    >
                                        Columns ▾
                                    </button>
                                    {showDropdown && (
                                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10 p-2 text-left">
                                            <div className="font-semibold mb-2 text-sm">Show Columns</div>
                                            {allLeafColumns.map((col: any) => (
                                                <label key={col.id} className="flex items-center gap-2 py-1 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={col.getIsVisible()}
                                                        onChange={() => col.toggleVisibility()}
                                                        disabled={visibleColumns.length === 1 && col.getIsVisible()}
                                                    />
                                                    {typeof col.columnDef.header === 'function'
                                                        ? col.columnDef.header({ column: col })
                                                        : col.columnDef.header}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </th>
                                {provided.placeholder}
                            </tr>
                        )}
                    </Droppable>
                </DragDropContext>
            ))}
        </thead>
    );
}

function AmountFilterPopover({ column }: { column: any }) {
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
        <div className="relative inline-block">
            <button
                className="ml-1 text-gray-400 hover:text-blue-600"
                onClick={e => { e.stopPropagation(); setShow(v => !v); }}
                aria-label="Filter Amount"
                tabIndex={-1}
            >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 6h16M7 12h10m-4 6h4" /></svg>
            </button>
            {show && (
                <div ref={ref} className="absolute z-20 right-0 mt-2 w-48 bg-white border rounded shadow p-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold mb-1">Filter Amount</label>
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={filterValue.op}
                        onChange={e => column.setFilterValue({ ...filterValue, op: e.target.value })}
                    >
                        <option value="=">=</option>
                        <option value=">">≥</option>
                        <option value="<">≤</option>
                    </select>
                    <input
                        type="number"
                        className="border rounded px-2 py-1 text-sm mt-1"
                        value={filterValue.value}
                        onChange={e => column.setFilterValue({ ...filterValue, value: e.target.value })}
                        placeholder="Enter amount"
                    />
                </div>
            )}
        </div>
    );
} 