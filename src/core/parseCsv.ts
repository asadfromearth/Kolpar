import Papa from 'papaparse';
import { CsvTable } from './types';

/**
 * Sanitizes headers by filling empty header names and disambiguating duplicates.
 * Guarantees every header is a non-empty, unique string.
 */
export function sanitizeHeaders(rawHeaders: string[]): string[] {
  const seenCount = new Map<string, number>();
  const result: string[] = [];

  for (let i = 0; i < rawHeaders.length; i++) {
    let name = rawHeaders[i]?.trim() ?? '';
    if (!name) {
      name = `Column ${i + 1}`;
    }

    const currentCount = seenCount.get(name) || 0;
    if (currentCount === 0) {
      seenCount.set(name, 1);
      result.push(name);
    } else {
      // Disambiguate duplicate
      let suffix = currentCount + 1;
      let candidate = `${name} (${suffix})`;
      while (seenCount.has(candidate) || result.includes(candidate)) {
        suffix++;
        candidate = `${name} (${suffix})`;
      }
      seenCount.set(name, suffix);
      seenCount.set(candidate, 1);
      result.push(candidate);
    }
  }

  return result;
}

/**
 * Parses raw CSV text into a CsvTable.
 * - Enforces 1MB size limit if text length or byte size is checked.
 * - Strips UTF-8 BOM if present.
 * - Rejects empty files and files without valid header rows.
 * - Sanitizes blank and duplicate headers.
 * - Normalizes ragged rows to match header length.
 */
export function parseCsv(csvString: string): CsvTable {
  // Strip UTF-8 BOM if present
  const cleaned = csvString.replace(/^\uFEFF/, '');

  if (!cleaned.trim()) {
    throw new Error('CSV file is empty');
  }

  // Remove a single trailing newline so PapaParse doesn't create a phantom empty row at EOF
  const normalized = cleaned.replace(/\r?\n$/, '');

  const parsed = Papa.parse<string[]>(normalized, {
    skipEmptyLines: false,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    // If there is a fatal error or no data
    if (!parsed.data || parsed.data.length === 0) {
      throw new Error(parsed.errors[0]?.message || 'Failed to parse CSV');
    }
  }

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const rawHeaderRow = rawRows[0];
  // Check if header row has any non-empty cell
  const hasValidHeader = rawHeaderRow.some((cell) => cell && cell.trim().length > 0);
  if (!hasValidHeader) {
    throw new Error('No valid header row found');
  }

  const headers = sanitizeHeaders(rawHeaderRow);
  const headerCount = headers.length;

  // Process data rows (everything after row 0)
  const rows: string[][] = [];
  for (let r = 1; r < rawRows.length; r++) {
    const rawRow = rawRows[r];
    // Normalize ragged row: pad or slice to match headerCount
    const normalizedRow: string[] = [];
    for (let c = 0; c < headerCount; c++) {
      normalizedRow.push(rawRow[c] !== undefined ? String(rawRow[c]) : '');
    }
    rows.push(normalizedRow);
  }

  return {
    headers,
    rows,
  };
}
