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

## Features

- Sorting
- Pagination
- Global filtering
- Row click handling
- Customizable styling
- TypeScript support
- Framework agnostic core
- React implementation

## Props

| Prop | Type | Description |
|------|------|-------------|
| data | T[] | Array of data to display in the table |
| columns | ColumnDef<T>[] | Column definitions for the table |
| globalFilter | string | Optional global filter string |
| initialPageSize | number | Initial number of rows per page (default: 10) |
| onRowClick | (row: T) => void | Optional callback when a row is clicked |

## Theming

Gridly provides several built-in themes: `light`, `dark`, `blue`, and `green`. You can select a theme using the `theme` prop:

```tsx
<ReactTable ... theme="dark" />
```

### Custom Themes

You can provide your own custom theme by passing a `customTheme` prop. This allows you to override any of the theme classes:

```tsx
<ReactTable
  ...
  theme="dark"
  customTheme={{
    container: 'bg-neutral-900',
    header: 'bg-neutral-800 text-yellow-200',
    row: 'text-yellow-100',
    rowHover: 'hover:bg-neutral-800',
    border: 'border-yellow-700',
  }}
/>
```

**Note:** If you use custom Tailwind classes (especially dynamic ones), you must add them to your Tailwind safelist so they are included in your build.

### Tailwind Safelist Example

Add all classes you use in your themes (including custom ones) to your `tailwind.config.js` safelist:

```js
safelist: [
  'bg-white', 'bg-gray-900', 'bg-blue-50', 'bg-green-50',
  'bg-gray-100', 'bg-gray-800', 'bg-blue-200', 'bg-green-200',
  'bg-blue-100', 'bg-blue-500', 'bg-green-500', 'bg-gray-700',
  'bg-green-700',
  'text-gray-700', 'text-gray-100', 'text-blue-900', 'text-green-900',
  'text-blue-800', 'text-green-300', 'text-white', 'text-green-200',
  'hover:bg-gray-50', 'hover:bg-gray-800', 'hover:bg-blue-100', 'hover:bg-green-100',
  'border-b', 'border-r', 'last:border-r-0',
  'border-gray-200', 'border-gray-700', 'border-blue-200', 'border-green-200',
  // Add your custom classes here
  'bg-neutral-900', 'bg-neutral-800', 'text-yellow-200', 'text-yellow-100', 'border-yellow-700',
]
```

## Custom Column Properties with `meta`

Gridly supports custom column properties using the `meta` field in your column definitions. This is the recommended way to add custom flags or configuration for your columns, such as enabling/disabling grouping or specifying a custom filter type.

### Example

```js
columnHelper.accessor('amount', {
  header: () => 'Amount',
  // ...other props...
  meta: {
    canGroup: false,      // disables grouping for this column
    filterType: 'amount', // enables custom filter UI
  },
  filterFn: (row, columnId, filterValue) => { /* ... */ }
})
```

### Accessing Custom Properties

In your table components (or in Gridly), access these properties via `column.columnDef.meta`:

```js
if (column.columnDef.meta?.canGroup) {
  // ...
}
```

This approach is type-safe and fully supported by TanStack Table v8+.

## Custom Pagination and Global Search

You can provide your own pagination or global search UI by passing `customPagination` or `customGlobalSearch` props:

```tsx
<GridlyTable
  ...
  showGlobalSearch={false} // Hide default search bar
  customGlobalSearch={<MySearchComponent onSearch={setGlobalFilter} />}
  customPagination={table => <MyPagination table={table} />}
/>
```

- If `customPagination` is a function, it will be called with the table instance and should return a React node. This gives you full control over pagination events and state.
- If `customPagination` is a React node, it will be rendered as-is (legacy support).
- If `customGlobalSearch` is provided, it will be rendered instead of the built-in search bar.
- Use `showGlobalSearch={false}` to hide the default search bar entirely.

### Example Custom Pagination

```tsx
function MyPagination({ table }) {
  const pageIndex = table.getState().pagination.pageIndex;
  return (
    <div>
      <button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0}>{'<<'}</button>
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{'<'}</button>
      <span>Page {pageIndex + 1} of {table.getPageCount()}</span>
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{'>'}</button>
      <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>{'>>'}</button>
    </div>
  );
}
```

## License

MIT