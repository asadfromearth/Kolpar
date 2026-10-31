export interface CsvTable {
  headers: string[];
  rows: string[][];
}

export interface ParseOptions {
  /**
   * Maximum allowed file size in bytes. Default: 1MB (1,048,576 bytes).
   */
  maxSizeBytes?: number;
}
