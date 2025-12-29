export interface Category {
  id: number
  name: string
  description?: string
  icon: string
  color_code: string
  category_type: string
  custom_field_definitions?: string
  active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Asset {
  id: number
  asset_tag: string
  name: string
  description?: string
  category_id: number
  brand?: string
  model?: string
  serial_number?: string
  purchase_price?: number
  purchase_date?: string
  vendor?: string
  location?: string
  status: string
  condition: string
  warranty_expiry?: string
  next_maintenance?: string
  custom_fields?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Window API types are defined in window.d.ts
