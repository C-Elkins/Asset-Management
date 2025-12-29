import { ipcMain, shell } from 'electron';
import { getDatabase } from '../database/db';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

// Get the user data directory for storing barcode images
const getBarcodesDir = () => {
  const userDataPath = app.getPath('userData');
  const barcodesPath = path.join(userDataPath, 'barcodes');

  // Create directory if it doesn't exist
  if (!fs.existsSync(barcodesPath)) {
    fs.mkdirSync(barcodesPath, { recursive: true });
  }

  return barcodesPath;
};

/**
 * Generate a barcode image and return the path
 */
const generateBarcodeImage = (value: string, format: string): string => {
  const canvas = createCanvas(200, 100);

  try {
    JsBarcode(canvas, value, {
      format: format,
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 14,
      margin: 10
    });

    // Save to file
    const barcodesDir = getBarcodesDir();
    const filename = `${format}_${value}_${Date.now()}.png`;
    const filepath = path.join(barcodesDir, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    return filepath;
  } catch (error) {
    console.error('Barcode generation error:', error);
    throw new Error('Failed to generate barcode image');
  }
};

/**
 * Setup all barcode-related IPC handlers
 */
export function setupBarcodeHandlers() {
  const db = getDatabase();

  // Get all barcodes for an asset
  ipcMain.handle('get-barcodes', async (_, assetId: number) => {
    try {
      const barcodes = db.prepare(`
        SELECT id, asset_id, barcode_value, barcode_format, generated_at, is_active
        FROM barcodes
        WHERE asset_id = ? AND is_active = 1
        ORDER BY generated_at DESC
      `).all(assetId);

      return barcodes;
    } catch (error: any) {
      console.error('Get barcodes error:', error);
      throw new Error(error.message || 'Failed to fetch barcodes');
    }
  });

  // Generate a new barcode
  ipcMain.handle('generate-barcode', async (_, input: { asset_id: number; barcode_value: string; barcode_format: string }) => {
    try {
      const { asset_id, barcode_value, barcode_format } = input;

      // Validate input
      if (!asset_id || !barcode_value || !barcode_format) {
        throw new Error('Missing required fields');
      }

      // Validate format
      const validFormats = ['CODE39', 'CODE128', 'EAN13', 'UPCA', 'ITF14'];
      if (!validFormats.includes(barcode_format)) {
        throw new Error('Invalid barcode format');
      }

      // Check if asset exists
      const asset = db.prepare('SELECT id FROM assets WHERE id = ?').get(asset_id);
      if (!asset) {
        throw new Error('Asset not found');
      }

      // Generate barcode image
      const imagePath = generateBarcodeImage(barcode_value, barcode_format);

      // Insert barcode record
      const result = db.prepare(`
        INSERT INTO barcodes (asset_id, barcode_value, barcode_format)
        VALUES (?, ?, ?)
      `).run(asset_id, barcode_value, barcode_format);

      // Fetch and return created barcode
      const newBarcode = db.prepare(`
        SELECT id, asset_id, barcode_value, barcode_format, generated_at, is_active
        FROM barcodes
        WHERE id = ?
      `).get(result.lastInsertRowid);

      console.log(`Barcode generated: ${barcode_format} - ${barcode_value}`);
      return newBarcode;
    } catch (error: any) {
      console.error('Generate barcode error:', error);
      throw new Error(error.message || 'Failed to generate barcode');
    }
  });

  // Delete a barcode
  ipcMain.handle('delete-barcode', async (_, id: number) => {
    try {
      // Mark as inactive instead of deleting
      db.prepare('UPDATE barcodes SET is_active = 0 WHERE id = ?').run(id);

      console.log(`Barcode deactivated: ID ${id}`);
      return { success: true };
    } catch (error: any) {
      console.error('Delete barcode error:', error);
      throw new Error(error.message || 'Failed to delete barcode');
    }
  });

  // Print barcode (opens image for printing)
  ipcMain.handle('print-barcode', async (_, id: number) => {
    try {
      // Get barcode info
      const barcode = db.prepare(`
        SELECT barcode_value, barcode_format
        FROM barcodes
        WHERE id = ?
      `).get(id) as any;

      if (!barcode) {
        throw new Error('Barcode not found');
      }

      // Generate fresh image for printing
      const imagePath = generateBarcodeImage(barcode.barcode_value, barcode.barcode_format);

      // Open image with default application (user can print from there)
      await shell.openPath(imagePath);

      console.log(`Opened barcode for printing: ${barcode.barcode_value}`);
      return { success: true };
    } catch (error: any) {
      console.error('Print barcode error:', error);
      throw new Error(error.message || 'Failed to print barcode');
    }
  });

  // Batch generate barcodes for multiple assets
  ipcMain.handle('batch-generate-barcodes', async (_, assetIds: number[], format: string) => {
    try {
      const results: Array<{ assetId: number; success: boolean; barcode?: any; error?: string }> = [];

      for (const assetId of assetIds) {
        try {
          // Get asset tag as barcode value
          const asset = db.prepare('SELECT asset_tag FROM assets WHERE id = ?').get(assetId) as any;

          if (!asset) {
            results.push({
              assetId,
              success: false,
              error: 'Asset not found'
            });
            continue;
          }

          // Generate barcode
          const result = db.prepare(`
            INSERT INTO barcodes (asset_id, barcode_value, barcode_format)
            VALUES (?, ?, ?)
          `).run(assetId, asset.asset_tag, format);

          const newBarcode = db.prepare(`
            SELECT id, asset_id, barcode_value, barcode_format, generated_at, is_active
            FROM barcodes
            WHERE id = ?
          `).get(result.lastInsertRowid);

          // Generate image
          generateBarcodeImage(asset.asset_tag, format);

          results.push({
            assetId,
            success: true,
            barcode: newBarcode
          });
        } catch (error: any) {
          results.push({
            assetId,
            success: false,
            error: error.message || 'Generation failed'
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`Batch barcode generation: ${successful} successful, ${failed} failed`);

      return {
        total: assetIds.length,
        successful,
        failed,
        results
      };
    } catch (error: any) {
      console.error('Batch generate barcodes error:', error);
      throw new Error(error.message || 'Failed to batch generate barcodes');
    }
  });

  console.log('Barcode IPC handlers registered');
}
