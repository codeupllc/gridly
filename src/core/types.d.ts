export interface TableState {
    sorting: SortingState;
    pagination: PaginationState;
    globalFilter: string;
}
export interface SortingState {
    id: string;
    desc: boolean;
}
export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}
export interface TableColumn<T> {
    id: string;
    header: string;
    accessor: (row: T) => any;
    sortable?: boolean;
    filterable?: boolean;
}
export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    globalFilter?: string;
    initialPageSize?: number;
    onRowClick?: (row: T) => void;
}
