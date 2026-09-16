/** Values that should not drive table search (ids, tokens, nested blobs). */
function skipKey(key: string | undefined) {
  if (!key) return false;
  return key === 'id' || /Id$/.test(key) || key.endsWith('ID') || key.endsWith('Hash') || key.endsWith('Token');
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function collectSearchableText(value: unknown, key?: string, out: string[] = []): string[] {
  if (value == null) return out;
  if (skipKey(key) && typeof value === 'string' && (looksLikeUuid(value) || value.length > 24)) {
    return out;
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return out;
    out.push(s);
    if (s.includes('_')) out.push(s.replace(/_/g, ' '));
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) out.push(d.toLocaleDateString());
    }
    return out;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    out.push(String(value));
    if (key && /Cents$/i.test(key)) {
      const dollars = value / 100;
      out.push(dollars.toFixed(2), String(Math.round(dollars)));
      try {
        out.push(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dollars));
        out.push(new Intl.NumberFormat('en-US').format(dollars));
      } catch {
        /* ignore */
      }
    }
    return out;
  }
  if (typeof value === 'boolean') {
    out.push(value ? 'true' : 'false');
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectSearchableText(item, key, out));
    return out;
  }
  if (typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value as Record<string, unknown>)) {
      collectSearchableText(child, childKey, out);
    }
  }
  return out;
}

export function rowMatchesGlobalFilter(row: unknown, filterValue: unknown): boolean {
  const query = String(filterValue ?? '').trim().toLowerCase();
  if (!query) return true;
  const haystack = collectSearchableText(row).join(' ').toLowerCase();
  const stripped = query.replace(/^#/, '');
  return haystack.includes(query) || (stripped !== query && haystack.includes(stripped));
}
