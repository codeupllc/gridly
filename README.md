# Gridly

**A flexible, modern, and framework-ready data table library for React (and soon more!).**

![Gridly Table Demo](./public/images/gridly-table-demo.png)

---

## Features

- 🧩 **Framework-Ready Core** (React supported, others coming)
- 🎨 Theming (light, dark, blue, green, custom via Tailwind)
- 🔍 Sorting, Filtering, Pagination, Grouping
- 🏷️ TypeScript-first API
- ⚡️ Fast, extensible, and easy to use

---

## Installation

```bash
npm install gridly
# or
yarn add gridly
```

---

## Basic Usage

```tsx
import { GridlyTable } from 'gridly';
import { createColumnHelper } from '@tanstack/react-table';

type User = { id: string; name: string; email: string; };

const columnHelper = createColumnHelper<User>();
const columns = [
  columnHelper.accessor('name', { header: 'Name', cell: info => info.getValue() }),
  columnHelper.accessor('email', { header: 'Email', cell: info => info.getValue() }),
];

const data = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

<GridlyTable data={data} columns={columns} />;
```

---

## Advanced Configuration

### Grouping

```tsx
<GridlyTable
  data={data}
  columns={columns}
  enableGrouping={true}
  groupBy={['name']}
  showPagination={true}
/>
```

### Theming

```tsx
<GridlyTable
  data={data}
  columns={columns}
  theme="dark" // or "light", "blue", "green"
  // or use your own Tailwind classes
/>
```

### Custom Pagination

```tsx
<GridlyTable
  data={data}
  columns={columns}
  customPagination={MyPaginationComponent}
/>
```

### Global Search

```tsx
<GridlyTable
  data={data}
  columns={columns}
  showGlobalSearch={true}
  globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
/>
```

---

## Roadmap

- [x] React support
- [ ] Angular/Vue/Svelte support (help wanted!)
- [ ] More built-in themes
- [ ] Plugin system

---

## Contributing

We welcome contributions! Please open an issue or pull request for bugs, features, or docs.

1. Fork the repo
2. Create a feature branch
3. Submit a PR

---

## License

MIT

---

## Community & Support

- [Discussions](https://github.com/YOUR_ORG/gridly/discussions)
- [Issues](https://github.com/YOUR_ORG/gridly/issues)