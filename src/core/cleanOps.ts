import { CsvTable } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates whether a new column name can be applied to the column at columnIndex.
 * Rejects empty names and duplicates.
 */
export function validateColumnRename(
  table: CsvTable,
  columnIndex: number,
  newName: string
): ValidationResult {
  const trimmed = newName.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: 'Column name cannot be empty',
    };
  }

  if (columnIndex < 0 || columnIndex >= table.headers.length) {
    return {
      valid: false,
      error: 'Column index out of bounds',
    };
  }

  // Check for duplicates (case-insensitive check for better UX)
  const isDuplicate = table.headers.some(
    (header, idx) => idx !== columnIndex && header.trim().toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    return {
      valid: false,
      error: `A column named "${trimmed}" already exists`,
    };
  }

  return { valid: true };
}

/**
 * Renames a column at columnIndex to newName.
 * Throws an error if validation fails.
 * Returns a new CsvTable object (immutable).
 */
export function renameColumn(table: CsvTable, columnIndex: number, newName: string): CsvTable {
  const validation = validateColumnRename(table, columnIndex, newName);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid column name');
  }

  const trimmed = newName.trim();
  const nextHeaders = [...table.headers];
  nextHeaders[columnIndex] = trimmed;

  return {
    headers: nextHeaders,
    rows: table.rows.map((row) => [...row]),
  };
}

/**
 * Removes the column at columnIndex from headers and all rows.
 * Returns a new CsvTable object (immutable).
 */
export function removeColumn(table: CsvTable, columnIndex: number): CsvTable {
  if (columnIndex < 0 || columnIndex >= table.headers.length) {
    throw new Error(`Column index ${columnIndex} is out of bounds`);
  }

  const nextHeaders = table.headers.filter((_, idx) => idx !== columnIndex);
  const nextRows = table.rows.map((row) => row.filter((_, idx) => idx !== columnIndex));

  return {
    headers: nextHeaders,
    rows: nextRows,
  };
}

/**
 * Removes rows where every cell is blank after trimming.
 * Returns a new CsvTable object (immutable).
 */
export function removeEmptyRows(table: CsvTable): CsvTable {
  const nextRows = table.rows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => [...row]);

  return {
    headers: [...table.headers],
    rows: nextRows,
  };
}
