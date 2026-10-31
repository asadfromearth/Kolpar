import { describe, it, expect } from 'vitest';
import {
  renameColumn,
  removeColumn,
  removeEmptyRows,
  validateColumnRename,
} from '../cleanOps';
import { CsvTable } from '../types';

describe('cleanOps', () => {
  const sampleTable: CsvTable = {
    headers: ['First Name', 'Last Name', 'Email'],
    rows: [
      ['Əli', 'Qasımov', 'ali@example.com'],
      ['Leyla', 'Məmmədova', 'leyla@example.com'],
    ],
  };

  describe('validateColumnRename', () => {
    it('accepts valid new column names', () => {
      const res = validateColumnRename(sampleTable, 0, 'Given Name');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects empty and whitespace-only column names', () => {
      expect(validateColumnRename(sampleTable, 0, '').valid).toBe(false);
      expect(validateColumnRename(sampleTable, 0, '   ').valid).toBe(false);
      expect(validateColumnRename(sampleTable, 0, '').error).toBe('Column name cannot be empty');
    });

    it('rejects duplicate column names (case-insensitive)', () => {
      const res1 = validateColumnRename(sampleTable, 0, 'Last Name');
      expect(res1.valid).toBe(false);
      expect(res1.error).toBe('A column named "Last Name" already exists');

      const res2 = validateColumnRename(sampleTable, 0, 'last name');
      expect(res2.valid).toBe(false);

      // Renaming to its own current name is valid
      const resSelf = validateColumnRename(sampleTable, 0, 'First Name');
      expect(resSelf.valid).toBe(true);
    });

    it('rejects out of bounds column index', () => {
      const res = validateColumnRename(sampleTable, 10, 'Test');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Column index out of bounds');
    });
  });

  describe('renameColumn', () => {
    it('renames a column immutably', () => {
      const updated = renameColumn(sampleTable, 0, 'Adı');
      expect(updated.headers).toEqual(['Adı', 'Last Name', 'Email']);
      expect(updated.rows).toEqual(sampleTable.rows);

      // Verify original is not mutated
      expect(sampleTable.headers[0]).toBe('First Name');
    });

    it('throws when renaming with invalid name', () => {
      expect(() => renameColumn(sampleTable, 0, '')).toThrow('Column name cannot be empty');
      expect(() => renameColumn(sampleTable, 0, 'Email')).toThrow('already exists');
    });
  });

  describe('removeColumn', () => {
    it('removes a column by index immutably', () => {
      const updated = removeColumn(sampleTable, 1);
      expect(updated.headers).toEqual(['First Name', 'Email']);
      expect(updated.rows).toEqual([
        ['Əli', 'ali@example.com'],
        ['Leyla', 'leyla@example.com'],
      ]);

      // Original unchanged
      expect(sampleTable.headers.length).toBe(3);
      expect(sampleTable.rows[0].length).toBe(3);
    });

    it('removes the first column', () => {
      const updated = removeColumn(sampleTable, 0);
      expect(updated.headers).toEqual(['Last Name', 'Email']);
      expect(updated.rows[0]).toEqual(['Qasımov', 'ali@example.com']);
    });

    it('removes the last column', () => {
      const updated = removeColumn(sampleTable, 2);
      expect(updated.headers).toEqual(['First Name', 'Last Name']);
      expect(updated.rows[0]).toEqual(['Əli', 'Qasımov']);
    });

    it('handles removing all columns until empty', () => {
      let current = sampleTable;
      current = removeColumn(current, 0);
      current = removeColumn(current, 0);
      current = removeColumn(current, 0);

      expect(current.headers).toEqual([]);
      expect(current.rows).toEqual([[], []]);
    });

    it('throws when index is out of bounds', () => {
      expect(() => removeColumn(sampleTable, -1)).toThrow('out of bounds');
      expect(() => removeColumn(sampleTable, 5)).toThrow('out of bounds');
    });
  });

  describe('removeEmptyRows', () => {
    it('removes rows where every cell is blank or whitespace', () => {
      const tableWithEmpty: CsvTable = {
        headers: ['A', 'B'],
        rows: [
          ['1', '2'],
          ['', ''],
          ['   ', '\t'],
          ['3', ''],
          ['', '4'],
          ['  ', '  '],
        ],
      };

      const cleaned = removeEmptyRows(tableWithEmpty);
      expect(cleaned.rows).toEqual([
        ['1', '2'],
        ['3', ''],
        ['', '4'],
      ]);

      // Original unchanged
      expect(tableWithEmpty.rows.length).toBe(6);
    });

    it('preserves rows when no empty rows exist', () => {
      const cleaned = removeEmptyRows(sampleTable);
      expect(cleaned.rows).toEqual(sampleTable.rows);
    });

    it('handles table with 0 rows', () => {
      const emptyTable: CsvTable = { headers: ['A', 'B'], rows: [] };
      const cleaned = removeEmptyRows(emptyTable);
      expect(cleaned.rows).toEqual([]);
    });
  });
});
