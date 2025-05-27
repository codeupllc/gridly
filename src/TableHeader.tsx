import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export function TableHeader({ table, theme, cellPadding, enableGrouping, onDragEnd }: any) {
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
                                {provided.placeholder}
                            </tr>
                        )}
                    </Droppable>
                </DragDropContext>
            ))}
        </thead>
    );
} 