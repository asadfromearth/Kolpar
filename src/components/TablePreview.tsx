import React from 'react';
import { CsvTable } from '../core/types';
import { InlineEditHeader } from './InlineEditHeader';

interface TablePreviewProps {
  table: CsvTable;
  onRenameColumn: (columnIndex: number, newName: string) => void;
  onRemoveColumn: (columnIndex: number) => void;
}

export const TablePreview: React.FC<TablePreviewProps> = ({
  table,
  onRenameColumn,
  onRemoveColumn,
}) => {
  const PREVIEW_LIMIT = 20;
  const previewRows = table.rows.slice(0, PREVIEW_LIMIT);
  const totalRows = table.rows.length;
  const totalCols = table.headers.length;

  if (totalCols === 0) {
    return (
      <div className="empty-table-state" role="status">
        <div className="empty-state-icon">⚠️</div>
        <h3>All columns removed</h3>
        <p>You have removed all columns. Click &ldquo;Reset to Original&rdquo; above to restore your data.</p>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-meta-bar">
        <span className="preview-slice-tag">
          {totalRows <= PREVIEW_LIMIT ? (
            <>Showing all <strong>{totalRows}</strong> rows</>
          ) : (
            <>Showing preview of <strong>{PREVIEW_LIMIT}</strong> of <strong>{totalRows}</strong> rows</>
          )}
        </span>
        <span className="preview-notice-tag">
          Operations apply to all {totalRows} rows upon download
        </span>
      </div>

      <div className="table-scroll-wrapper" tabIndex={0} aria-label="CSV data preview table">
        <table className="csv-preview-table">
          <thead>
            <tr>
              <th className="th-row-num" scope="col">
                #
              </th>
              {table.headers.map((header, colIndex) => (
                <th key={`col-${colIndex}`} className="th-column" scope="col">
                  <div className="th-header-cell">
                    <div className="th-top-row">
                      <span className="col-index-badge">Col {colIndex + 1}</span>
                      <button
                        type="button"
                        className="btn-remove-col"
                        onClick={() => onRemoveColumn(colIndex)}
                        title={`Remove column "${header}"`}
                        aria-label={`Remove column "${header}"`}
                      >
                        <span aria-hidden="true">✕</span>
                        <span className="remove-col-text">Remove</span>
                      </button>
                    </div>
                    <div className="th-name-row">
                      <InlineEditHeader
                        table={table}
                        columnIndex={colIndex}
                        headerName={header}
                        onRename={onRenameColumn}
                      />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.length === 0 ? (
              <tr>
                <td colSpan={totalCols + 1} className="td-empty-rows">
                  No data rows found in this file (headers only).
                </td>
              </tr>
            ) : (
              previewRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="table-row">
                  <td className="td-row-num">{rowIndex + 1}</td>
                  {row.map((cell, colIndex) => (
                    <td key={`cell-${rowIndex}-${colIndex}`} className="td-cell">
                      {cell.length > 0 ? (
                        <span className="cell-content">{cell}</span>
                      ) : (
                        <span className="cell-empty" aria-label="empty cell">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
