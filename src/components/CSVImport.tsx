import React, { useState } from 'react';
import { Category, AssetInput } from '../types/api';
import { Upload, X, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface CSVImportProps {
  categories: Category[];
  onClose: () => void;
  onImportComplete: () => void;
}

interface ParsedRow {
  data: any;
  rowNumber: number;
  errors: string[];
  warnings: string[];
}

export const CSVImport: React.FC<CSVImportProps> = ({ categories, onClose, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing' | 'complete'>('upload');
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  });

  const requiredFields = ['asset_tag', 'name', 'category_id'];
  const optionalFields = [
    'description', 'brand', 'model', 'serial_number', 'location',
    'purchase_price', 'purchase_date', 'vendor', 'status', 'condition', 'notes'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      parseCSV(droppedFile);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      alert('CSV file is empty');
      return;
    }

    // Parse headers
    const headerLine = lines[0];
    const parsedHeaders = parseCSVLine(headerLine);
    setHeaders(parsedHeaders);

    // Auto-detect mapping
    const autoMapping: Record<string, string> = {};
    parsedHeaders.forEach(header => {
      const normalized = header.toLowerCase().replace(/\s+/g, '_');
      if (requiredFields.includes(normalized) || optionalFields.includes(normalized)) {
        autoMapping[normalized] = header;
      }
      // Special cases
      if (header.toLowerCase().includes('tag')) autoMapping['asset_tag'] = header;
      if (header.toLowerCase().includes('category')) autoMapping['category_id'] = header;
    });
    setMapping(autoMapping);

    // Parse data rows
    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const rowData: any = {};
      parsedHeaders.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      rows.push({
        data: rowData,
        rowNumber: i + 1,
        errors: [],
        warnings: []
      });
    }

    setParsedData(rows);
    setStep('map');
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const validateAndPreview = () => {
    // Validate mapping
    const missingRequired = requiredFields.filter(field => !mapping[field]);
    if (missingRequired.length > 0) {
      alert(`Please map required fields: ${missingRequired.join(', ')}`);
      return;
    }

    // Validate each row
    const validated = parsedData.map(row => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check required fields
      requiredFields.forEach(field => {
        const csvHeader = mapping[field];
        const value = row.data[csvHeader];
        if (!value || value.trim() === '') {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Validate category
      const categoryValue = row.data[mapping['category_id']];
      if (categoryValue) {
        const category = categories.find(c =>
          c.name.toLowerCase() === categoryValue.toLowerCase() ||
          c.id.toString() === categoryValue
        );
        if (!category) {
          errors.push(`Invalid category: ${categoryValue}`);
        }
      }

      // Validate purchase price
      const priceValue = row.data[mapping['purchase_price']];
      if (priceValue && isNaN(parseFloat(priceValue))) {
        warnings.push(`Invalid price format: ${priceValue}`);
      }

      return { ...row, errors, warnings };
    });

    setParsedData(validated);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const row of parsedData) {
      if (row.errors.length > 0) {
        results.failed++;
        results.errors.push(`Row ${row.rowNumber}: ${row.errors.join(', ')}`);
        continue;
      }

      try {
        // Map CSV data to asset input
        const categoryValue = row.data[mapping['category_id']];
        const category = categories.find(c =>
          c.name.toLowerCase() === categoryValue.toLowerCase() ||
          c.id.toString() === categoryValue
        );

        if (!category) {
          results.failed++;
          results.errors.push(`Row ${row.rowNumber}: Invalid category`);
          continue;
        }

        const assetData: AssetInput = {
          asset_tag: row.data[mapping['asset_tag']],
          name: row.data[mapping['name']],
          category_id: category.id,
        };

        // Add optional fields
        optionalFields.forEach(field => {
          if (mapping[field] && row.data[mapping[field]]) {
            const value = row.data[mapping[field]];
            if (field === 'purchase_price') {
              assetData[field] = parseFloat(value) || undefined;
            } else {
              (assetData as any)[field] = value;
            }
          }
        });

        await window.api.createAsset(assetData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${row.rowNumber}: ${error instanceof Error ? error.message : 'Import failed'}`);
      }
    }

    setImportResults(results);
    setStep('complete');
  };

  const downloadTemplate = () => {
    const headers = [
      'asset_tag', 'name', 'category_id', 'description', 'brand', 'model',
      'serial_number', 'location', 'status', 'condition', 'purchase_price',
      'purchase_date', 'vendor', 'notes'
    ];

    const example = [
      'LAPTOP001', 'Dell Latitude 5520', 'IT Equipment', 'Laptop for development',
      'Dell', 'Latitude 5520', 'SN12345', 'Office A', 'available', 'good',
      '1200.00', '2024-01-15', 'Dell Store', 'Comes with charger'
    ];

    const csv = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Import Assets from CSV</h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'upload' && 'Upload your CSV file to get started'}
              {step === 'map' && 'Map CSV columns to asset fields'}
              {step === 'preview' && 'Review and validate your data'}
              {step === 'importing' && 'Importing assets...'}
              {step === 'complete' && 'Import complete'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-emerald-500 transition-colors"
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV files with headers
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                >
                  Select File
                </label>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>First row must contain column headers</li>
                  <li>Required fields: asset_tag, name, category_id (or category name)</li>
                  <li>Category can be either the category name or ID</li>
                  <li>Status values: available, assigned, maintenance, retired</li>
                  <li>Condition values: excellent, good, fair, poor</li>
                </ul>
              </div>
            </div>
          )}

          {/* Mapping Step */}
          {step === 'map' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Map your CSV columns to asset fields. Required fields are marked with *
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...requiredFields, ...optionalFields].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {requiredFields.includes(field) && <span className="text-red-500"> *</span>}
                    </label>
                    <select
                      value={mapping[field] || ''}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Not Mapped --</option>
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Preview:</strong> {parsedData.length} rows detected in CSV
                </p>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    <CheckCircle className="inline text-green-600 mr-1" size={16} />
                    {parsedData.filter(r => r.errors.length === 0).length} valid rows
                  </p>
                  {parsedData.some(r => r.errors.length > 0) && (
                    <p className="text-sm text-red-600">
                      <AlertCircle className="inline mr-1" size={16} />
                      {parsedData.filter(r => r.errors.length > 0).length} rows with errors
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Asset Tag</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.map((row, idx) => (
                        <tr key={idx} className={row.errors.length > 0 ? 'bg-red-50' : ''}>
                          <td className="px-3 py-2">{row.rowNumber}</td>
                          <td className="px-3 py-2">{row.data[mapping['asset_tag']]}</td>
                          <td className="px-3 py-2">{row.data[mapping['name']]}</td>
                          <td className="px-3 py-2">{row.data[mapping['category_id']]}</td>
                          <td className="px-3 py-2">
                            {row.errors.length > 0 ? (
                              <span className="text-red-600 text-xs">{row.errors.join(', ')}</span>
                            ) : (
                              <CheckCircle className="text-green-600" size={16} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Importing assets...</p>
              <p className="text-sm text-gray-500">Please wait while we process your file</p>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Import Complete!</h3>
                <p className="text-gray-600">
                  Successfully imported {importResults.success} asset{importResults.success !== 1 ? 's' : ''}
                  {importResults.failed > 0 && ` • ${importResults.failed} failed`}
                </p>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResults.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {step === 'complete' ? 'Close' : 'Cancel'}
          </button>

          <div className="flex gap-2">
            {step === 'map' && (
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={() => setStep('map')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step === 'map' && (
              <button
                onClick={validateAndPreview}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Next: Preview
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={parsedData.every(r => r.errors.length > 0)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {parsedData.filter(r => r.errors.length === 0).length} Assets
              </button>
            )}
            {step === 'complete' && (
              <button
                onClick={() => {
                  onImportComplete();
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
