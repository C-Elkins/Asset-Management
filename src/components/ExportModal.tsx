import React, { useState } from 'react';
import { Asset } from '../types/api';
import { X, Download, FileText, CheckSquare, Square } from 'lucide-react';

interface ExportModalProps {
  assets: Asset[];
  onClose: () => void;
}

interface ExportField {
  key: string;
  label: string;
  selected: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ assets, onClose }) => {
  const allFields: ExportField[] = [
    // Core fields
    { key: 'asset_tag', label: 'Asset Tag', selected: true },
    { key: 'name', label: 'Name', selected: true },
    { key: 'category_name', label: 'Category', selected: true },
    { key: 'status', label: 'Status', selected: true },
    { key: 'condition', label: 'Condition', selected: true },
    { key: 'location', label: 'Location', selected: true },

    // Product details
    { key: 'brand', label: 'Brand', selected: false },
    { key: 'model', label: 'Model', selected: false },
    { key: 'serial_number', label: 'Serial Number', selected: false },
    { key: 'barcode', label: 'Barcode', selected: false },

    // Purchase information
    { key: 'purchase_price', label: 'Purchase Price', selected: false },
    { key: 'purchase_date', label: 'Purchase Date', selected: false },
    { key: 'vendor', label: 'Vendor', selected: false },
    { key: 'purchase_order_number', label: 'PO Number', selected: false },

    // Warranty & Maintenance
    { key: 'warranty_expiry', label: 'Warranty Expiry', selected: false },
    { key: 'next_maintenance', label: 'Next Maintenance', selected: false },

    // Inventory tracking
    { key: 'total_quantity', label: 'Total Quantity', selected: false },
    { key: 'available_quantity', label: 'Available Quantity', selected: false },

    // Depreciation
    { key: 'depreciation_method', label: 'Depreciation Method', selected: false },
    { key: 'useful_life_years', label: 'Useful Life (Years)', selected: false },
    { key: 'salvage_value', label: 'Salvage Value', selected: false },
    { key: 'current_value', label: 'Current Value', selected: false },

    // Disposal
    { key: 'disposal_date', label: 'Disposal Date', selected: false },
    { key: 'disposal_method', label: 'Disposal Method', selected: false },
    { key: 'disposal_value', label: 'Disposal Value', selected: false },
    { key: 'disposal_reason', label: 'Disposal Reason', selected: false },

    // Relationship counts
    { key: 'lease_count', label: 'Active Leases', selected: false },
    { key: 'insurance_count', label: 'Active Insurance', selected: false },
    { key: 'reservation_count', label: 'Active Reservations', selected: false },

    // Other
    { key: 'description', label: 'Description', selected: false },
    { key: 'notes', label: 'Notes', selected: false },
    { key: 'created_at', label: 'Created At', selected: false },
    { key: 'updated_at', label: 'Updated At', selected: false },
  ];

  const [fields, setFields] = useState<ExportField[]>(allFields);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [fileName, setFileName] = useState(`assets-${new Date().toISOString().split('T')[0]}`);

  const toggleField = (key: string) => {
    setFields(fields.map(f => f.key === key ? { ...f, selected: !f.selected } : f));
  };

  const selectAll = () => {
    setFields(fields.map(f => ({ ...f, selected: true })));
  };

  const deselectAll = () => {
    setFields(fields.map(f => ({ ...f, selected: false })));
  };

  const handleExport = () => {
    const selectedFields = fields.filter(f => f.selected);
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }

    if (format === 'csv') {
      exportCSV(selectedFields);
    } else {
      exportJSON(selectedFields);
    }
  };

  const exportCSV = (selectedFields: ExportField[]) => {
    const headers = selectedFields.map(f => f.label);
    const rows = assets.map(asset =>
      selectedFields.map(field => {
        const value = (asset as any)[field.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
    );

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    downloadFile(csv, `${fileName}.csv`, 'text/csv');
  };

  const exportJSON = (selectedFields: ExportField[]) => {
    const data = assets.map(asset => {
      const obj: any = {};
      selectedFields.forEach(field => {
        obj[field.key] = (asset as any)[field.key];
      });
      return obj;
    });

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${fileName}.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const groupedFields = {
    'Core Information': fields.slice(0, 6),
    'Product Details': fields.slice(6, 10),
    'Purchase Information': fields.slice(10, 14),
    'Warranty & Maintenance': fields.slice(14, 16),
    'Inventory Tracking': fields.slice(16, 18),
    'Depreciation': fields.slice(18, 22),
    'Disposal': fields.slice(22, 26),
    'Related Records': fields.slice(26, 29),
    'Other': fields.slice(29),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Export Assets</h2>
            <p className="text-emerald-100 text-sm">Select fields and format for export</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Export Options */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter file name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('csv')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      format === 'csv'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText size={16} className="inline mr-2" />
                    CSV
                  </button>
                  <button
                    onClick={() => setFormat('json')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      format === 'json'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText size={16} className="inline mr-2" />
                    JSON
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-sm font-medium text-emerald-900">
                {assets.length} asset{assets.length !== 1 ? 's' : ''} • {fields.filter(f => f.selected).length} fields selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Select All
                </button>
                <span className="text-emerald-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-emerald-700 hover:text-emerald-900 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-6">
            {Object.entries(groupedFields).map(([group, groupFields]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{group}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groupFields.map(field => (
                    <button
                      key={field.key}
                      onClick={() => toggleField(field.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        field.selected
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {field.selected ? (
                        <CheckSquare size={16} className="text-emerald-600" />
                      ) : (
                        <Square size={16} className="text-gray-400" />
                      )}
                      <span>{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
          >
            <Download size={18} />
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
