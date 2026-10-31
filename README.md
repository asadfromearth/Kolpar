# Kolpar

> A lightweight, browser-only CSV column cleaner.

Kolpar is a focused, open-source web application for quick CSV column hygiene: select a CSV file, rename or delete columns, strip fully blank rows, inspect the preview, and download a clean CSV.

Everything is processed 100% locally in your browser. No files are uploaded to any server, no analytics are loaded, and no network requests are made.

---

## The Problem

Preparing CSV files often requires trivial cleanup before importing them into databases, data warehouses, or reporting tools:
- Renaming confusing or mislabeled column headers.
- Removing unwanted columns containing sensitive or unnecessary data.
- Deleting blank or phantom rows caused by trailing lines or messy exports.

Opening large spreadsheet suites (Excel, LibreOffice) can alter data types, strip leading zeros, reformat dates, or create sluggish overhead. Uploading files to random online "CSV converter" websites exposes your private data to third-party servers.

**Kolpar** solves this with a fast, private, zero-installation web tool running entirely in client memory.

---

## Features

- **Local File Selection**: Select via file picker or drag-and-drop (strictly enforces a 1 MB size limit with clear validation messages).
- **First-Row Header Detection**: Automatically parses row 1 as column headers and provides a live preview table of the first 20 rows.
- **Inline Column Renaming**: Click any column header to rename it directly. Automatically prevents empty names and duplicate column names.
- **Column Removal**: Remove any column with a single click. Handles edge cases like removing all columns.
- **Remove Empty Rows**: Strips all rows where every cell is blank (after whitespace trimming).
- **Preserved Formatting & Encodings**: Correctly preserves quotes, embedded commas, multiline values, and Unicode / Azerbaijani characters (`ə`, `ı`, `ş`, `ç`, `ö`, `ü`, `ğ`).
- **Immutable Operations**: Changes apply to a working copy in memory; the original dataset is never modified.
- **One-Click Reset**: Easily revert to the original uploaded data at any time.
- **Clean Download**: Generates an RFC 4180 compliant CSV with UTF-8 encoding.

---

## Limitations

Kolpar v0.1 intentionally maintains a tight, dependable scope:
- **CSV only**: Formats like `.xlsx`, `.ods`, or `.json` are out of scope.
- **File size limit**: Files up to 1 MB are supported (optimized for instant client-side performance).
- **No data sorting or filtering**: Focuses purely on column and blank row cleanup.
- **No type inference or schema conversions**: Values are treated as text and never re-formatted.
- **No accounts or cloud persistence**: Does not save state once the browser tab is closed.

---

## Privacy & Security

- **100% Client-Side**: All parsing, table transformations, and CSV exports occur entirely within your browser runtime using standard Web APIs.
- **Zero Uploads**: No backend server exists. Files are never transmitted across the network.
- **Zero Tracking**: No telemetry, no third-party scripts, no cookies, and no analytics.

---

## Getting Started

### Prerequisites

- Node.js (version 18 or newer recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kolpar.git
cd kolpar

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

Open `http://localhost:5173` in your web browser.

### Running Tests

Kolpar includes full test coverage across parsing, edge cases, immutability, operations, and UI interactions:

```bash
npm test
```

### Production Build

```bash
npm run build
```

The optimized, static output will be generated in the `dist/` directory, ready to be served from any static host (e.g. GitHub Pages).

---

## Architecture

The codebase strictly separates pure business logic from UI components:

```
src/
├── core/                     # Pure logic (Zero React dependencies)
│   ├── types.ts              # Data models (CsvTable)
│   ├── parseCsv.ts           # CSV parsing, BOM handling, header sanitization, ragged row normalization
│   ├── cleanOps.ts           # Immutable table operations (renameColumn, removeColumn, removeEmptyRows)
│   ├── exportCsv.ts          # RFC 4180 CSV serialization
│   └── __tests__/            # Comprehensive unit tests for core logic
├── components/               # Small, presentational React components
│   ├── Header.tsx            # Header brand and privacy badge
│   ├── FileUploader.tsx      # File input, drag-and-drop, 1 MB limit validation
│   ├── Toolbar.tsx           # Action buttons (Remove empty rows, Reset, Download) and stats
│   ├── TablePreview.tsx      # 20-row preview table and column management
│   └── InlineEditHeader.tsx  # Accessible inline rename input with error feedback
├── utils/                    # Client download helpers
│   └── download.ts           # UTF-8 BOM CSV blob download trigger
├── __tests__/                # UI and integration tests
├── App.tsx                   # Top-level state orchestration (original vs. working tables)
└── index.css                 # Clean responsive styles
```

---

## License

This project is open-source under the [MIT License](LICENSE).
