import express, { Request, Response } from 'express';
import { getDatabase } from '../database/db';

let server: ReturnType<ReturnType<typeof express>['listen']> | null = null;
const PORT = 3333;

// HTML template for asset view
const getAssetHTML = (asset: any, qrCodeId: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${asset.name} - Asset Information</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header .qr-id {
      font-size: 14px;
      opacity: 0.9;
      font-family: 'Courier New', monospace;
    }
    .content {
      padding: 30px 20px;
    }
    .info-row {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    .label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .value {
      font-size: 18px;
      color: #111827;
      font-weight: 500;
    }
    .value.large {
      font-size: 22px;
      color: #10b981;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .status-available {
      background: #d1fae5;
      color: #065f46;
    }
    .status-assigned {
      background: #fef3c7;
      color: #92400e;
    }
    .status-maintenance {
      background: #fee2e2;
      color: #991b1b;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .empty {
      color: #9ca3af;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${asset.name}</h1>
      <div class="qr-id">${qrCodeId}</div>
    </div>
    <div class="content">
      <div class="info-row">
        <div class="label">Asset Tag</div>
        <div class="value large">${asset.asset_tag}</div>
      </div>

      <div class="info-row">
        <div class="label">Category</div>
        <div class="value">${asset.category_name || 'N/A'}</div>
      </div>

      ${asset.serial_number ? `
      <div class="info-row">
        <div class="label">Serial Number</div>
        <div class="value">${asset.serial_number}</div>
      </div>
      ` : ''}

      ${asset.brand ? `
      <div class="info-row">
        <div class="label">Brand</div>
        <div class="value">${asset.brand}</div>
      </div>
      ` : ''}

      ${asset.model ? `
      <div class="info-row">
        <div class="label">Model</div>
        <div class="value">${asset.model}</div>
      </div>
      ` : ''}

      <div class="info-row">
        <div class="label">Status</div>
        <div class="value">
          <span class="status-badge status-${asset.status}">${asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}</span>
        </div>
      </div>

      ${asset.location ? `
      <div class="info-row">
        <div class="label">Location</div>
        <div class="value">${asset.location}</div>
      </div>
      ` : ''}

      ${asset.notes ? `
      <div class="info-row">
        <div class="label">Notes</div>
        <div class="value">${asset.notes}</div>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      Powered by Krubles Asset Manager
    </div>
  </div>
</body>
</html>
  `;
};

export function startQRServer(): void {
  if (server) {
    console.log('QR server already running');
    return;
  }

  const app = express();

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Asset view endpoint
  app.get('/asset/:qrCodeId', (req: Request, res: Response) => {
    try {
      const { qrCodeId } = req.params;
      const db = getDatabase();

      // Get QR code and asset data
      const qrCode = db.prepare(`
        SELECT qr.*, a.*, c.name as category_name
        FROM qr_codes qr
        JOIN assets a ON qr.asset_id = a.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE qr.qr_code_id = ? AND qr.is_active = 1
      `).get(qrCodeId);

      if (!qrCode) {
        res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Asset Not Found</title>
            <style>
              body {
                font-family: sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .error {
                text-align: center;
                padding: 40px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              h1 { color: #ef4444; margin-bottom: 10px; }
              p { color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>Asset Not Found</h1>
              <p>QR Code: ${qrCodeId}</p>
              <p>This asset may have been deleted or the QR code is invalid.</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      // Record the scan
      db.prepare(`
        INSERT INTO qr_scan_records (qr_code_id, scan_action, device_info)
        VALUES (?, ?, ?)
      `).run(qrCodeId, 'view', req.headers['user-agent'] || 'Unknown');

      // Update scan statistics
      db.prepare(`
        UPDATE qr_codes
        SET scan_count = scan_count + 1, last_scanned_at = CURRENT_TIMESTAMP
        WHERE qr_code_id = ?
      `).run(qrCodeId);

      res.send(getAssetHTML(qrCode, qrCodeId));
    } catch (error) {
      console.error('Error serving asset view:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Start server
  server = app.listen(PORT, () => {
    console.log(`QR code server running on http://localhost:${PORT}`);
  });
}

export function stopQRServer(): void {
  if (server) {
    server.close();
    server = null;
    console.log('QR code server stopped');
  }
}

export function getQRServerURL(qrCodeId: string): string {
  return `http://localhost:${PORT}/asset/${qrCodeId}`;
}
