import { describe, it, expect } from 'vitest';
import { parseCsv, sanitizeHeaders } from '../parseCsv';

describe('sanitizeHeaders', () => {
  it('fills empty or whitespace headers with fallback names', () => {
    const sanitized = sanitizeHeaders(['Name', '', '   ', 'Age']);
    expect(sanitized).toEqual(['Name', 'Column 2', 'Column 3', 'Age']);
  });

  it('disambiguates duplicate header names', () => {
    const sanitized = sanitizeHeaders(['Name', 'Age', 'Name', 'City', 'Name']);
    expect(sanitized).toEqual(['Name', 'Age', 'Name (2)', 'City', 'Name (3)']);
  });

  it('handles combination of blanks and duplicates', () => {
    const sanitized = sanitizeHeaders(['', 'Column 1', '']);
    expect(sanitized).toEqual(['Column 1', 'Column 1 (2)', 'Column 3']);
  });
});

describe('parseCsv', () => {
  it('parses standard CSV with headers and rows', () => {
    const csv = 'Name,Age,City\nAlice,30,Baku\nBob,25,Ganja';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.rows).toEqual([
      ['Alice', '30', 'Baku'],
      ['Bob', '25', 'Ganja'],
    ]);
  });

  it('handles empty file by throwing an error', () => {
    expect(() => parseCsv('')).toThrow('CSV file is empty');
    expect(() => parseCsv('   \n  \t  ')).toThrow('CSV file is empty');
    expect(() => parseCsv('\uFEFF')).toThrow('CSV file is empty');
  });

  it('handles headers only (no data rows)', () => {
    const csv = 'First Name,Last Name,Email';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['First Name', 'Last Name', 'Email']);
    expect(result.rows).toEqual([]);
  });

  it('handles headers only with trailing newline', () => {
    const csv = 'First Name,Last Name,Email\n';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['First Name', 'Last Name', 'Email']);
    expect(result.rows).toEqual([]);
  });

  it('throws when there is no valid header row (all blank header cells)', () => {
    expect(() => parseCsv(',,')).toThrow('No valid header row found');
    expect(() => parseCsv(',,\n1,2,3')).toThrow('No valid header row found');
    expect(() => parseCsv('   ,  , \n1,2,3')).toThrow('No valid header row found');
  });

  it('handles quoted cells containing commas, quotes, and newlines', () => {
    const csv = 'Description,Notes\n"Item, with comma","Note with ""escaped"" quotes"\n"Line 1\nLine 2",Simple';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['Description', 'Notes']);
    expect(result.rows).toEqual([
      ['Item, with comma', 'Note with "escaped" quotes'],
      ['Line 1\nLine 2', 'Simple'],
    ]);
  });

  it('handles Azerbaijani and Unicode characters (UTF-8) with or without BOM', () => {
    const csvWithoutBOM = 'Adı,Soyadı,Şəhər,Qeyd\nƏli,Qasımov,Şəki,İşçi\nÖmər,Məmmədov,Göyçay,Düzgün';
    const result = parseCsv(csvWithoutBOM);
    expect(result.headers).toEqual(['Adı', 'Soyadı', 'Şəhər', 'Qeyd']);
    expect(result.rows[0]).toEqual(['Əli', 'Qasımov', 'Şəki', 'İşçi']);
    expect(result.rows[1]).toEqual(['Ömər', 'Məmmədov', 'Göyçay', 'Düzgün']);

    const csvWithBOM = '\uFEFFAdı,Şəhər\nÜlviyyə,Bakı';
    const resultBOM = parseCsv(csvWithBOM);
    expect(resultBOM.headers).toEqual(['Adı', 'Şəhər']);
    expect(resultBOM.rows[0]).toEqual(['Ülviyyə', 'Bakı']);
  });

  it('handles ragged rows: fewer cells are padded with empty strings', () => {
    const csv = 'A,B,C\n1,2\n3';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['A', 'B', 'C']);
    expect(result.rows).toEqual([
      ['1', '2', ''],
      ['3', '', ''],
    ]);
  });

  it('handles ragged rows: more cells than headers are truncated', () => {
    const csv = 'A,B\n1,2,3,4\n5,6';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['A', 'B']);
    expect(result.rows).toEqual([
      ['1', '2'],
      ['5', '6'],
    ]);
  });

  it('sanitizes duplicate and blank header names during parsing', () => {
    const csv = 'Name,,Name,Score\nAlice,X,Bob,100';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['Name', 'Column 2', 'Name (2)', 'Score']);
    expect(result.rows).toEqual([['Alice', 'X', 'Bob', '100']]);
  });

  it('preserves empty rows inside CSV so they can be cleaned by user', () => {
    const csv = 'Name,Age\nAlice,30\n,\nBob,25';
    const result = parseCsv(csv);
    expect(result.rows.length).toBe(3);
    expect(result.rows[1]).toEqual(['', '']);
  });
});
