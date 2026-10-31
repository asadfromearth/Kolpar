import React from 'react';
import { CsvTable } from '../core/types';

interface ToolbarProps {
  fileName: string;
  table: CsvTable;
  originalTable: CsvTable;
  onRemoveEmptyRows: () => void;
  onReset: () => void;
  onDownload: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  fileName,
  table,
  originalTable,
  onRemoveEmptyRows,
  onReset,
  onDownload,
}) => {
  // Check if any empty rows exist in the working table
  const emptyRowsCount = table.rows.filter((row) =>
    row.every((cell) => cell.trim().length === 0)
  ).length;

  const isModified =
    table.headers.length !== originalTable.headers.length ||
    table.rows.length !== originalTable.rows.length ||
    table.headers.some((h, i) => h !== originalTable.headers[i]);

  return (
    <div className="toolbar-container">
      <div className="toolbar-info">
        <div className="file-info-pill" title={`File: ${fileName}`}>
          <svg
            className="file-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="file-name">{fileName}</span>
        </div>

        <div className="stats-badges">
          <span className="badge badge-stat" data-testid="columns-stat">
            <strong>{table.headers.length}</strong> {table.headers.length === 1 ? 'column' : 'columns'}
          </span>
          <span className="badge badge-stat" data-testid="rows-stat">
            <strong>{table.rows.length}</strong> {table.rows.length === 1 ? 'row' : 'rows'}
          </span>
          {emptyRowsCount > 0 && (
            <span
              className="badge badge-warning"
              data-testid="empty-rows-stat"
              title={`${emptyRowsCount} fully blank rows found`}
            >
              {emptyRowsCount} empty {emptyRowsCount === 1 ? 'row' : 'rows'}
            </span>
          )}
          {isModified && <span className="badge badge-accent">Modified</span>}
        </div>
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRemoveEmptyRows}
          disabled={emptyRowsCount === 0}
          title={
            emptyRowsCount === 0
              ? 'No fully empty rows detected'
              : `Remove ${emptyRowsCount} fully blank rows`
          }
        >
          <svg
            className="btn-icon-svg"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Remove empty rows {emptyRowsCount > 0 ? `(${emptyRowsCount})` : ''}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          disabled={!isModified}
          title="Restore the original table as loaded from the file"
        >
          <svg
            className="btn-icon-svg"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Reset to Original
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onDownload}
          disabled={table.headers.length === 0}
          title="Download the cleaned CSV to your computer"
        >
          <svg
            className="btn-icon-svg"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download CSV
        </button>
      </div>
    </div>
  );
};
