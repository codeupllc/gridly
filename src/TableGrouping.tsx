import React from 'react';

export function TableGrouping({ grouping, setGrouping, table, theme, isDragging, setIsDragging }: any) {
    // Group By UI logic moved from Table.tsx
    return (
        <div
            className={`mb-4 p-4 rounded border-2 border-dashed transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} ${theme.container}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { setIsDragging(false); }}
            onDrop={e => {
                setIsDragging(false);
                const columnId = e.dataTransfer.getData('text/plain');
                if (columnId && !grouping.includes(columnId)) {
                    setGrouping([...grouping, columnId]);
                }
            }}
        >
            <h3 className="text-sm font-semibold mb-2">Group By</h3>
            <div className="flex gap-2 min-h-[40px] items-center">
                {grouping.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" />
                        </svg>
                        <span>Drag columns here to group</span>
                    </div>
                ) : (
                    grouping.map((columnId: string, index: number) => {
                        const column = table.getColumn(columnId);
                        const headerObj = table.getHeaderGroups()[0]?.headers.find((h: any) => h.column.id === columnId);
                        return (
                            <div
                                key={columnId}
                                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${theme.groupChip}`}
                            >
                                {headerObj ? headerObj.column.columnDef.header(headerObj.getContext()) : columnId}
                                <button
                                    onClick={() => {
                                        setGrouping(grouping.filter((id: string) => id !== columnId));
                                    }}
                                    className="hover:text-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
} 