import { describe, it, expect } from 'vitest';
import { exportCsv } from '../exportCsv';
import { parseCsv } from '../parseCsv';
import { CsvTable } from '../types';

describe('exportCsv', () => {
  it('exports a simple table as standard CSV', () => {
    const table: CsvTable = {
      headers: ['Name', 'Age'],
      rows: [
        ['Alice', '30'],
        ['Bob', '25'],
      ],
    };

    const csv = exportCsv(table);
    expect(csv).toBe('Name,Age\r\nAlice,30\r\nBob,25');
  });

  it('preserves quotes when values have commas, quotes, and newlines', () => {
    const table: CsvTable = {
      headers: ['Title', 'Description'],
      rows: [
        ['Comma, here', 'Normal text'],
        ['Quotes "test"', 'Multi\nline'],
      ],
    };

    const csv = exportCsv(table);
    // Parse it back to verify RFC 4180 compliance round-trip
    const parsed = parseCsv(csv);
    expect(parsed.headers).toEqual(table.headers);
    expect(parsed.rows).toEqual(table.rows);
  });

  it('preserves Azerbaijani and Unicode characters', () => {
    const table: CsvTable = {
      headers: ['Adı', 'Soyadı', 'Şəhər'],
      rows: [['Əli', 'Qasımov', 'Bakı']],
    };

    const csv = exportCsv(table);
    expect(csv).toContain('Adı,Soyadı,Şəhər');
    expect(csv).toContain('Əli,Qasımov,Bakı');

    const parsed = parseCsv(csv);
    expect(parsed).toEqual(table);
  });

  it('returns empty string when table has no headers', () => {
    const table: CsvTable = {
      headers: [],
      rows: [],
    };

    expect(exportCsv(table)).toBe('');
  });

  it('exports headers only when rows are empty', () => {
    const table: CsvTable = {
      headers: ['A', 'B', 'C'],
      rows: [],
    };

    const csv = exportCsv(table);
    expect(csv.trim()).toBe('A,B,C');
  });
});
