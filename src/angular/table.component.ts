import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableProps, TableColumn } from '../core/types';

@Component({
    selector: 'gridly-table',
    template: `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded shadow">
                <thead>
                    <tr *ngFor="let headerGroup of table.getHeaderGroups()">
                        <th *ngFor="let header of headerGroup.headers"
                            [class]="'px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none'"
                            (click)="header.column.getCanSort() ? header.column.getToggleSortingHandler()() : null">
                            {{ header.column.columnDef.header }}
                            <span *ngIf="header.column.getIsSorted() === 'asc'">▲</span>
                            <span *ngIf="header.column.getIsSorted() === 'desc'">▼</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let row of table.getRowModel().rows"
                        [class]="onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''"
                        (click)="onRowClick ? onRowClick.emit(row.original) : null">
                        <td *ngFor="let cell of row.getVisibleCells()" class="px-4 py-2 border-t">
                            {{ cell.getValue() }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="flex items-center justify-between mt-4">
                <div>
                    <button (click)="table.setPageIndex(0)"
                            [disabled]="!table.getCanPreviousPage()"
                            class="px-2 py-1 border rounded disabled:opacity-50 mr-2">
                        &lt;&lt;
                    </button>
                    <button (click)="table.previousPage()"
                            [disabled]="!table.getCanPreviousPage()"
                            class="px-2 py-1 border rounded disabled:opacity-50 mr-2">
                        &lt;
                    </button>
                    <button (click)="table.nextPage()"
                            [disabled]="!table.getCanNextPage()"
                            class="px-2 py-1 border rounded disabled:opacity-50 mr-2">
                        &gt;
                    </button>
                    <button (click)="table.setPageIndex(table.getPageCount() - 1)"
                            [disabled]="!table.getCanNextPage()"
                            class="px-2 py-1 border rounded disabled:opacity-50">
                        &gt;&gt;
                    </button>
                </div>
                <span class="text-sm text-gray-700">
                    Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }}
                </span>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class GridlyTableComponent<T extends object> {
    @Input() data: T[] = [];
    @Input() columns: TableColumn<T>[] = [];
    @Input() globalFilter: string = '';
    @Input() initialPageSize: number = 10;
    @Output() onRowClick = new EventEmitter<T>();

    table: any; // This will be initialized in ngOnInit

    ngOnInit() {
        // Initialize table logic here
        // Note: We'll need to implement the table logic using Angular's change detection
        // This is a placeholder for the actual implementation
    }
} 