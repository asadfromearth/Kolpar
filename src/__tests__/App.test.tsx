import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import * as downloadUtils from '../utils/download';

describe('App Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const uploadCsv = async (fileName: string, content: string, fileSize?: number) => {
    const file = new File([content], fileName, { type: 'text/csv' });
    if (fileSize !== undefined) {
      Object.defineProperty(file, 'size', { value: fileSize });
    }

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Mock FileReader to simulate local reading
    const originalFileReader = window.FileReader;
    class MockFileReader {
      onload: ((e: { target: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsText() {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: content } });
          }
        }, 0);
      }
    }
    // @ts-expect-error mock file reader
    window.FileReader = MockFileReader;

    fireEvent.change(input, { target: { files: [file] } });

    window.FileReader = originalFileReader;
  };

  it('renders upload screen initially', () => {
    render(<App />);
    expect(screen.getByText('Clean CSV Columns in Your Browser')).toBeInTheDocument();
    expect(screen.getByText(/Choose a CSV file/i)).toBeInTheDocument();
  });

  it('shows clear error when file exceeds 1 MB', async () => {
    render(<App />);
    const twoMb = 2 * 1024 * 1024;
    await uploadCsv('large.csv', 'A,B\n1,2', twoMb);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/exceeds 1 MB limit/i)).toBeInTheDocument();
    });
  });

  it('loads valid CSV and shows headers and preview rows', async () => {
    render(<App />);
    const csv = 'Name,Age,City\nAlice,30,Baku\nBob,25,Ganja';
    await uploadCsv('people.csv', csv);

    await waitFor(() => {
      expect(screen.getByText('people.csv')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Baku')).toBeInTheDocument();
    });

    expect(screen.getByTestId('columns-stat')).toHaveTextContent('3 columns');
    expect(screen.getByTestId('rows-stat')).toHaveTextContent('2 rows');
  });

  it('renames a column inline and validates against empty and duplicate names', async () => {
    render(<App />);
    const csv = 'Name,Age,City\nAlice,30,Baku';
    await uploadCsv('people.csv', csv);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    // Click rename button for Name column
    const renameBtn = screen.getByLabelText('Rename "Name"');
    fireEvent.click(renameBtn);

    const input = screen.getByLabelText('Edit column name for Name') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Try empty name
    fireEvent.change(input, { target: { value: '   ' } });
    expect(screen.getByText('Column name cannot be empty')).toBeInTheDocument();

    // Try duplicate name
    fireEvent.change(input, { target: { value: 'City' } });
    expect(screen.getByText('A column named "City" already exists')).toBeInTheDocument();

    // Valid rename
    fireEvent.change(input, { target: { value: 'Full Name' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Press Enter to save
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });
  });

  it('removes a column', async () => {
    render(<App />);
    const csv = 'Name,Age,City\nAlice,30,Baku';
    await uploadCsv('people.csv', csv);

    await waitFor(() => {
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    const removeAgeBtn = screen.getByLabelText('Remove column "Age"');
    fireEvent.click(removeAgeBtn);

    expect(screen.queryByText('Age')).not.toBeInTheDocument();
    expect(screen.getByTestId('columns-stat')).toHaveTextContent('2 columns');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Baku')).toBeInTheDocument();
  });

  it('removes empty rows when "Remove empty rows" is clicked', async () => {
    render(<App />);
    const csv = 'Name,Age\nAlice,30\n,\nBob,25\n  ,  ';
    await uploadCsv('people.csv', csv);

    await waitFor(() => {
      expect(screen.getByTestId('rows-stat')).toHaveTextContent('4 rows');
      expect(screen.getByTestId('empty-rows-stat')).toHaveTextContent('2 empty rows');
    });

    const removeEmptyBtn = screen.getByText(/Remove empty rows/i);
    fireEvent.click(removeEmptyBtn);

    await waitFor(() => {
      expect(screen.getByTestId('rows-stat')).toHaveTextContent('2 rows');
      expect(screen.queryByTestId('empty-rows-stat')).not.toBeInTheDocument();
    });
  });

  it('resets the table to original state without mutating original', async () => {
    render(<App />);
    const csv = 'Name,Age,City\nAlice,30,Baku\n,\nBob,25,Ganja';
    await uploadCsv('people.csv', csv);

    await waitFor(() => {
      expect(screen.getByText('City')).toBeInTheDocument();
    });

    // Remove City column
    fireEvent.click(screen.getByLabelText('Remove column "City"'));
    expect(screen.queryByText('City')).not.toBeInTheDocument();

    // Click Reset
    const resetBtn = screen.getByText('Reset to Original');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('City')).toBeInTheDocument();
      expect(screen.getByTestId('columns-stat')).toHaveTextContent('3 columns');
    });
  });

  it('downloads the modified table as CSV without mutating original', async () => {
    const downloadSpy = vi.spyOn(downloadUtils, 'downloadCsvFile').mockImplementation(() => {});

    render(<App />);
    const csv = 'Name,Age\nAlice,30';
    await uploadCsv('test.csv', csv);

    await waitFor(() => {
      expect(screen.getByText('Download CSV')).toBeInTheDocument();
    });

    // Rename Name -> Ad
    const renameBtn = screen.getByLabelText('Rename "Name"');
    fireEvent.click(renameBtn);
    const input = screen.getByLabelText('Edit column name for Name');
    fireEvent.change(input, { target: { value: 'Ad' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Click Download
    const downloadBtn = screen.getByText('Download CSV');
    fireEvent.click(downloadBtn);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    const [downloadedContent, downloadedName] = downloadSpy.mock.calls[0];
    expect(downloadedName).toBe('cleaned_test.csv');
    expect(downloadedContent).toContain('Ad,Age');
    expect(downloadedContent).toContain('Alice,30');
  });

  it('handles removing all columns gracefully and enables reset', async () => {
    render(<App />);
    const csv = 'A\n1';
    await uploadCsv('single.csv', csv);

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    // Remove column A
    fireEvent.click(screen.getByLabelText('Remove column "A"'));

    expect(screen.getByText('All columns removed')).toBeInTheDocument();

    // Reset restores column A
    fireEvent.click(screen.getByText('Reset to Original'));
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
