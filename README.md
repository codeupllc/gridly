# Gridly

A flexible table library built on top of TanStack Table, providing a simple and powerful way to create data tables with sorting, filtering, and pagination. Compatible with both React and Angular applications.

## Installation

```bash
npm install gridly
```

## React Usage

```tsx
import { ReactTable } from 'gridly';
import { createColumnHelper } from '@tanstack/react-table';

// Define your data type
type User = {
  id: string;
  name: string;
  email: string;
};

// Create your columns
const columnHelper = createColumnHelper<User>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
  }),
];

// Use the table component
function MyTable() {
  const data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return (
    <ReactTable
      data={data}
      columns={columns}
      initialPageSize={10}
      onRowClick={(row) => console.log('Clicked row:', row)}
    />
  );
}
```

## Angular Usage

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { GridlyModule } from 'gridly';

@NgModule({
  imports: [GridlyModule],
  // ...
})
export class AppModule { }

// your.component.ts
import { Component } from '@angular/core';
import { TableColumn } from 'gridly';

@Component({
  selector: 'app-your-component',
  template: `
    <gridly-table
      [data]="data"
      [columns]="columns"
      [initialPageSize]="10"
      (onRowClick)="handleRowClick($event)">
    </gridly-table>
  `
})
export class YourComponent {
  data = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  columns: TableColumn<any>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: row => row.name,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      accessor: row => row.email,
      sortable: true
    }
  ];

  handleRowClick(row: any) {
    console.log('Clicked row:', row);
  }
}
```

## Features

- Sorting
- Pagination
- Global filtering
- Row click handling
- Customizable styling
- TypeScript support
- Framework agnostic core
- React and Angular implementations

## Props

| Prop | Type | Description |
|------|------|-------------|
| data | T[] | Array of data to display in the table |
| columns | ColumnDef<T>[] | Column definitions for the table |
| globalFilter | string | Optional global filter string |
| initialPageSize | number | Initial number of rows per page (default: 10) |
| onRowClick | (row: T) => void | Optional callback when a row is clicked |