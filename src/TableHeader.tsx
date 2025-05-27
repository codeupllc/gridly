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
                                    <Draggable
                                        key={header.id}
                                        draggableId={header.id}
                                        index={idx}
                                    >
                                        {(provided, snapshot) => (
                                            <th
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${cellPadding} text-center font-semibold select-none ${theme.header} border-b ${theme.border} border-r ${theme.border} last:border-r-0
                                                    cursor-grab active:cursor-grabbing
                                                    ${snapshot.isDragging ? 'opacity-50' : ''}
                                                    transition-all duration-200`}
                                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-gray-400 opacity-0 group-hover:opacity-100">
                                                        ⋮⋮
                                                    </span>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === 'asc' && ' ▲'}
                                                    {header.column.getIsSorted() === 'desc' && ' ▼'}
                                                </div>
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
                                        )}
                                    </Draggable>
                                ))}
                                {/* Column visibility toggle button */}
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