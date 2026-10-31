import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileLoaded: (file: File, content: string) => void;
  errorMessage: string | null;
  onClearError: () => void;
  onError: (msg: string) => void;
}

export const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MB

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileLoaded,
  errorMessage,
  onClearError,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    onClearError();

    // 1MB limit check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeInKb = (file.size / 1024).toFixed(1);
      onError(
        `File size exceeds 1 MB limit (${sizeInKb} KB). Please select a CSV file under 1 MB.`
      );
      return;
    }

    // Read file as UTF-8 text
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onFileLoaded(file, text);
      } else {
        onError('Could not read file contents.');
      }
    };
    reader.onerror = () => {
      onError('An error occurred while reading the file.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  return (
    <div className="uploader-container">
      {errorMessage && (
        <div className="uploader-error-alert" role="alert">
          <svg
            className="error-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="error-message-text">{errorMessage}</span>
          <button
            type="button"
            className="btn-dismiss-error"
            onClick={onClearError}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <div
        className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Select or drop a CSV file to clean"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="file-input-hidden"
          onChange={handleInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="dropzone-content">
          <div className="dropzone-icon-circle">
            <svg
              className="dropzone-icon"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="dropzone-primary-text">
            <strong>Choose a CSV file</strong> or drag and drop it here
          </p>
          <p className="dropzone-subtext">
            Local browser processing only • Maximum file size: 1 MB
          </p>
        </div>
      </div>
    </div>
  );
};
