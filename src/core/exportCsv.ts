import Papa from 'papaparse';
import { CsvTable } from './types';

/**
 * Serializes a CsvTable back into a standard RFC 4180 CSV string.
 * - Handles empty tables (returns empty string if 0 columns).
 * - Preserves special characters, Azerbaijani/Unicode, commas, quotes, and newlines.
 * - Quotes fields automatically when they contain commas, quotes, or newlines.
 */
export function exportCsv(table: CsvTable): string {
  if (table.headers.length === 0) {
    return '';
  }

  return Papa.unparse(
    {
      fields: table.headers,
      data: table.rows,
    },
    {
      quotes: false, // Quotes fields only when necessary (containing quotes, commas, newlines)
      newline: '\r\n',
    }
  );
}
