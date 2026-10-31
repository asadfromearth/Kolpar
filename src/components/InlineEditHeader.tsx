import React, { useState, useRef, useEffect } from 'react';
import { validateColumnRename } from '../core/cleanOps';
import { CsvTable } from '../core/types';

interface InlineEditHeaderProps {
  table: CsvTable;
  columnIndex: number;
  headerName: string;
  onRename: (columnIndex: number, newName: string) => void;
}

export const InlineEditHeader: React.FC<InlineEditHeaderProps> = ({
  table,
  columnIndex,
  headerName,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(headerName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(headerName);
  }, [headerName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setValue(nextVal);

    const validation = validateColumnRename(table, columnIndex, nextVal);
    if (!validation.valid) {
      setError(validation.error || 'Invalid name');
    } else {
      setError(null);
    }
  };

  const handleSave = () => {
    const validation = validateColumnRename(table, columnIndex, value);
    if (!validation.valid) {
      setError(validation.error || 'Invalid name');
      return;
    }

    onRename(columnIndex, value.trim());
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setValue(headerName);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="header-edit-container">
        <div className="header-edit-row">
          <input
            ref={inputRef}
            type="text"
            className={`header-input ${error ? 'input-error' : ''}`}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label={`Edit column name for ${headerName}`}
          />
          <button
            type="button"
            className="btn-icon btn-save"
            onClick={handleSave}
            title="Save column name"
            aria-label="Save column name"
            disabled={!!error}
          >
            ✓
          </button>
          <button
            type="button"
            className="btn-icon btn-cancel"
            onClick={handleCancel}
            title="Cancel"
            aria-label="Cancel editing"
          >
            ✕
          </button>
        </div>
        {error && (
          <div className="field-error-message" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="header-display-container"
      onClick={() => setIsEditing(true)}
      title="Click to rename column"
    >
      <span className="header-name-text">{headerName}</span>
      <button
        type="button"
        className="btn-rename-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        title={`Rename "${headerName}"`}
        aria-label={`Rename "${headerName}"`}
      >
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  );
};
