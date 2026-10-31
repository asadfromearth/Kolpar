/**
 * Triggers a browser download for a CSV string using UTF-8 BOM encoding.
 * UTF-8 BOM (\uFEFF) ensures Excel and text editors properly render Unicode characters
 * (such as Azerbaijani ə, ı, ş, ç, ö, ü, ğ).
 */
export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF', content], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
