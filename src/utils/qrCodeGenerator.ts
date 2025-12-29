import { createHash } from 'crypto'

export interface QRCodeConfig {
  prefix: string
  type: 'AST' | 'ITM'
  assetId: number
  itemNumber?: number
}

export interface QRPayload {
  v: number // Schema version
  id: string // QR code ID (KRB-AST-00001 or KRB-ITM-00001-05)
  t: 'A' | 'I' // Type: Asset or Inventory Item
  aid: number // Asset ID
  tag: string // Asset tag
  n: string // Asset name
  itm?: number // Item number (for inventory items)
  sn?: string // Serial number
  cat?: string // Category name
  ts: number // Timestamp
  sig?: string // Verification signature
}

export class QRCodeGenerator {
  static readonly PREFIX = 'KRB'
  static readonly SCHEMA_VERSION = 1

  /**
   * Generate QR code ID for an asset
   * Format: KRB-AST-00001
   */
  static generateAssetQRId(assetId: number): string {
    return `${this.PREFIX}-AST-${assetId.toString().padStart(5, '0')}`
  }

  /**
   * Generate QR code ID for an inventory item
   * Format: KRB-ITM-00001-05
   */
  static generateItemQRId(assetId: number, itemNumber: number): string {
    return `${this.PREFIX}-ITM-${assetId.toString().padStart(5, '0')}-${itemNumber.toString().padStart(2, '0')}`
  }

  /**
   * Parse a QR code ID back into its components
   */
  static parseQRId(qrCodeId: string): QRCodeConfig | null {
    const match = qrCodeId.match(/^KRB-(AST|ITM)-(\d+)(?:-(\d+))?$/)
    if (!match) return null

    return {
      prefix: 'KRB',
      type: match[1] as 'AST' | 'ITM',
      assetId: parseInt(match[2], 10),
      itemNumber: match[3] ? parseInt(match[3], 10) : undefined,
    }
  }

  /**
   * Create a QR code payload with all asset data
   * Returns a URL for mobile-friendly viewing
   */
  static createQRPayload(config: {
    qr_code_id: string
    type: 'asset' | 'inventory_item'
    asset_id: number
    asset_tag: string
    asset_name: string
    item_number?: number
    serial_number?: string
    category?: string
  }): string {
    // Return a URL instead of JSON for mobile-friendly viewing
    return `http://localhost:3333/asset/${config.qr_code_id}`;
  }

  /**
   * Verify a QR code payload's signature
   */
  static verifyQRPayload(payload: QRPayload): boolean {
    if (!payload.sig) return false

    const expectedSig = this.generateSignature(payload)
    return payload.sig === expectedSig
  }

  /**
   * Generate verification signature for a payload
   */
  private static generateSignature(payload: QRPayload): string {
    // Create signature from version, ID, asset ID, and timestamp
    const data = `${payload.v}:${payload.id}:${payload.aid}:${payload.ts}`
    return createHash('sha256').update(data).digest('hex').substring(0, 16)
  }

  /**
   * Parse QR code data string back into payload
   */
  static parseQRData(dataString: string): QRPayload | null {
    try {
      const payload = JSON.parse(dataString) as QRPayload

      // Validate required fields
      if (!payload.v || !payload.id || !payload.t || !payload.aid) {
        return null
      }

      return payload
    } catch (error) {
      console.error('Failed to parse QR data:', error)
      return null
    }
  }
}
