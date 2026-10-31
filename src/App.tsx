import React, { useState, useCallback } from 'react';
import { CsvTable } from './core/types';
import { parseCsv } from './core/parseCsv';
import { renameColumn, removeColumn, removeEmptyRows } from './core/cleanOps';
import { exportCsv } from './core/exportCsv';
import { downloadCsvFile } from './utils/download';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Toolbar } from './components/Toolbar';
import { TablePreview } from './components/TablePreview';

export const App: React.FC = () => {
  const [fileName, setFileName] = useState<string>('');
  const [originalTable, setOriginalTable] = useState<CsvTable | null>(null);
  const [workingTable, setWorkingTable] = useState<CsvTable | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileLoaded = useCallback((file: File, content: string) => {
    try {
      setErrorMessage(null);
      const parsed = parseCsv(content);
      // Deep clone original and working so they are completely independent
      setOriginalTable({
        headers: [...parsed.headers],
        rows: parsed.rows.map((row) => [...row]),
      });
      setWorkingTable({
        headers: [...parsed.headers],
        rows: parsed.rows.map((row) => [...row]),
      });
      setFileName(file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse CSV file';
      setErrorMessage(msg);
    }
  }, []);

  const handleRenameColumn = useCallback((columnIndex: number, newName: string) => {
    setWorkingTable((prev) => {
      if (!prev) return null;
      return renameColumn(prev, columnIndex, newName);
    });
  }, []);

  const handleRemoveColumn = useCallback((columnIndex: number) => {
    setWorkingTable((prev) => {
      if (!prev) return null;
      return removeColumn(prev, columnIndex);
    });
  }, []);

  const handleRemoveEmptyRows = useCallback(() => {
    setWorkingTable((prev) => {
      if (!prev) return null;
      return removeEmptyRows(prev);
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!originalTable) return;
    // Immutably restore working table from original
    setWorkingTable({
      headers: [...originalTable.headers],
      rows: originalTable.rows.map((row) => [...row]),
    });
  }, [originalTable]);

  const handleDownload = useCallback(() => {
    if (!workingTable) return;
    const csvString = exportCsv(workingTable);
    const downloadName = fileName ? `cleaned_${fileName}` : 'cleaned.csv';
    downloadCsvFile(csvString, downloadName);
  }, [workingTable, fileName]);

  const handleOpenAnotherFile = useCallback(() => {
    setOriginalTable(null);
    setWorkingTable(null);
    setFileName('');
    setErrorMessage(null);
  }, []);

  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        {!workingTable ? (
          <div className="upload-view">
            <div className="hero-banner">
              <h2>Clean CSV Columns in Your Browser</h2>
              <p>
                Rename or remove columns, strip blank rows, and export your cleaned CSV.
                Fast, private, and 100% processed on your device.
              </p>
            </div>
            <FileUploader
              onFileLoaded={handleFileLoaded}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
              onError={(msg) => setErrorMessage(msg)}
            />
          </div>
        ) : (
          <div className="workspace-view">
            <div className="workspace-top-bar">
              <button
                type="button"
                className="btn-link"
                onClick={handleOpenAnotherFile}
                title="Select a different CSV file"
              >
                ← Open different file
              </button>
            </div>

            <Toolbar
              fileName={fileName}
              table={workingTable}
              originalTable={originalTable!}
              onRemoveEmptyRows={handleRemoveEmptyRows}
              onReset={handleReset}
              onDownload={handleDownload}
            />

            <TablePreview
              table={workingTable}
              onRenameColumn={handleRenameColumn}
              onRemoveColumn={handleRemoveColumn}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          <strong>Kolpar</strong> • Browser-only CSV column cleaner • Open Source under MIT License
        </p>
      </footer>
    </div>
  );
};

export default App;
