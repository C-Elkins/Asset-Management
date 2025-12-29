import React, { useState, useEffect } from 'react';
import { Barcode, BarcodeFormat } from '../types/api';
import { Barcode as BarcodeIcon, Printer, Trash2, Plus } from 'lucide-react';

interface BarcodeManagerProps {
  assetId: number;
  assetTag: string;
  canEdit?: boolean;
}

const BARCODE_FORMATS: { value: BarcodeFormat; label: string; description: string }[] = [
  { value: 'CODE128', label: 'CODE128', description: 'Most common, supports alphanumeric' },
  { value: 'CODE39', label: 'CODE39', description: 'Industry standard, simple' },
  { value: 'EAN13', label: 'EAN-13', description: 'Retail standard (13 digits)' },
  { value: 'UPCA', label: 'UPC-A', description: 'North American retail (12 digits)' },
  { value: 'ITF14', label: 'ITF-14', description: 'Shipping/logistics (14 digits)' },
];

export const BarcodeManager: React.FC<BarcodeManagerProps> = ({ assetId, assetTag, canEdit = true }) => {
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<BarcodeFormat>('CODE128');
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    loadBarcodes();
  }, [assetId]);

  const loadBarcodes = async () => {
    try {
      setLoading(true);
      const data = await window.api.getBarcodes(assetId);
      setBarcodes(data);
    } catch (error) {
      console.error('Failed to load barcodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const barcodeValue = showCustomInput ? customValue : assetTag;

      if (!barcodeValue) {
        alert('Please enter a barcode value');
        return;
      }

      await window.api.generateBarcode({
        asset_id: assetId,
        barcode_value: barcodeValue,
        barcode_format: selectedFormat,
      });

      setCustomValue('');
      setShowCustomInput(false);
      await loadBarcodes();
    } catch (error: any) {
      alert(`Failed to generate barcode: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number, value: string) => {
    if (!confirm(`Delete barcode "${value}"?`)) return;

    try {
      await window.api.deleteBarcode(id);
      await loadBarcodes();
    } catch (error: any) {
      alert(`Failed to delete barcode: ${error.message}`);
    }
  };

  const handlePrint = async (id: number) => {
    try {
      await window.api.printBarcode(id);
    } catch (error: any) {
      alert(`Failed to print barcode: ${error.message}`);
    }
  };

  const getFormatLabel = (format: string) => {
    const formatObj = BARCODE_FORMATS.find(f => f.value === format);
    return formatObj?.label || format;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Barcodes ({barcodes.length})
        </h3>
      </div>

      {/* Generate Section */}
      {canEdit && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as BarcodeFormat)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {BARCODE_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label} - {format.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode Value
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !showCustomInput
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Use Asset Tag
                </button>
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    showCustomInput
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {showCustomInput && (
            <div>
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Enter custom barcode value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Value: <span className="font-medium">{showCustomInput ? customValue || '(not set)' : assetTag}</span>
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating || (showCustomInput && !customValue)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              {generating ? 'Generating...' : 'Generate Barcode'}
            </button>
          </div>
        </div>
      )}

      {/* Barcodes List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : barcodes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BarcodeIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-2">No barcodes generated yet</p>
          {canEdit && (
            <p className="text-sm text-gray-400">
              Generate your first barcode above
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {barcodes.map((barcode) => (
            <div
              key={barcode.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
            >
              <div className="flex-shrink-0">
                <BarcodeIcon size={24} className="text-emerald-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {barcode.barcode_value}
                  </p>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                    {getFormatLabel(barcode.barcode_format)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Generated: {new Date(barcode.generated_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePrint(barcode.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="Print"
                >
                  <Printer size={16} />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(barcode.id, barcode.barcode_value)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
