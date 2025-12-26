import type Database from 'better-sqlite3';

export interface CustomFieldDefinition {
  id: number;
  category_id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'number' | 'date' | 'dropdown' | 'checkbox';
  options?: string;
  required: number;
  sort_order: number;
}

/**
 * Flatten custom fields into searchable text
 * Converts JSON custom fields into space-separated text for FTS indexing
 */
export function flattenCustomFieldsForSearch(
  customFields: Record<string, any> | string | null,
  definitions: CustomFieldDefinition[]
): string {
  if (!customFields) return '';

  // Parse if JSON string
  let fields: Record<string, any>;
  try {
    fields = typeof customFields === 'string'
      ? JSON.parse(customFields)
      : customFields;
  } catch (error) {
    console.error('Failed to parse custom fields:', error);
    return '';
  }

  const searchableText: string[] = [];

  for (const def of definitions) {
    const value = fields[def.field_name];
    if (value === null || value === undefined || value === '') continue;

    switch (def.field_type) {
      case 'text':
      case 'textarea':
        searchableText.push(String(value));
        break;

      case 'number':
        searchableText.push(String(value));
        break;

      case 'date':
        // Add both ISO and human-readable formats
        searchableText.push(String(value));
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            searchableText.push(date.toLocaleDateString());
            searchableText.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
          }
        } catch (e) {
          // Invalid date, just use raw value
        }
        break;

      case 'dropdown':
        searchableText.push(String(value));
        break;

      case 'checkbox':
        searchableText.push(value ? 'Yes' : 'No');
        searchableText.push(value ? 'Checked' : 'Unchecked');
        searchableText.push(value ? 'True' : 'False');
        break;
    }
  }

  return searchableText.join(' ');
}

/**
 * Update asset's FTS entry when custom fields change
 */
export function updateAssetFTSCustomFields(
  db: Database.Database,
  assetId: number,
  categoryId: number,
  customFields: Record<string, any> | string | null
): void {
  // Get custom field definitions for this category
  const definitions = db.prepare(
    'SELECT * FROM custom_field_definitions WHERE category_id = ?'
  ).all(categoryId) as CustomFieldDefinition[];

  // Flatten custom fields
  const flattenedText = flattenCustomFieldsForSearch(customFields, definitions);

  // Update FTS table
  db.prepare(`
    UPDATE assets_fts
    SET custom_fields_text = ?
    WHERE rowid = ?
  `).run(flattenedText, assetId);
}

/**
 * Rebuild all custom field FTS data for all assets
 * Useful after custom field definitions change
 */
export function rebuildAllCustomFieldsFTS(db: Database.Database): void {
  console.log('Rebuilding custom fields FTS data for all assets...');

  // Get all assets with their categories
  const assets = db.prepare(`
    SELECT id, category_id, custom_fields
    FROM assets
    WHERE custom_fields IS NOT NULL AND custom_fields != ''
  `).all() as Array<{ id: number; category_id: number; custom_fields: string }>;

  let updated = 0;
  for (const asset of assets) {
    try {
      updateAssetFTSCustomFields(db, asset.id, asset.category_id, asset.custom_fields);
      updated++;
    } catch (error) {
      console.error(`Failed to update FTS for asset ${asset.id}:`, error);
    }
  }

  console.log(`Rebuilt custom fields FTS data for ${updated} assets`);
}
