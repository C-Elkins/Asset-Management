# Krubles Asset Management System

> **Enterprise-grade asset management without enterprise complexity or cost.**

Krubles is a powerful, offline-first desktop asset management system built with Electron, React, and SQLite. Track unlimited assets with lightning-fast search, custom categories, QR code generation, and comprehensive inventory management — all while maintaining complete data ownership.

![Krubles Logo](https://img.shields.io/badge/Version-1.0.0-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=for-the-badge)

---

## ✨ Key Features

### 🎯 **Industry-Optimized Templates**
Start with pre-configured categories for your industry:
- **IT & Technology** - Computers, monitors, network equipment, software licenses
- **Auto Dealership** - Vehicles, parts, service tools, office equipment
- **Warehouse & Distribution** - Inventory products, equipment, safety gear, shipping supplies
- **Construction** - Power tools, heavy equipment, safety equipment, materials
- **Healthcare** - Medical equipment, surgical instruments, office equipment, furniture
- **Education** - Computers, projectors, lab equipment, furniture
- **Custom** - Build your own category structure from scratch

### 🚀 **Performance at Scale**
- **Lightning-Fast Search** - FTS5 full-text indexing finds assets in <100ms even with 100,000+ records
- **Smart Pagination** - Server-side pagination keeps memory usage constant regardless of dataset size
- **Optimized Database** - 20+ performance indexes and SQLite optimization pragmas for maximum speed
- **Custom Field Search** - JSON custom fields are automatically flattened and indexed for full-text search

### 📦 **Flexible Asset Tracking**
- **Custom Categories** - Create unlimited categories with custom icons and colors during setup
- **Category Filtering** - Toggle between "My Categories", "Favorites", or "All Categories" views
- **Custom Fields** - Add category-specific fields (text, number, date, dropdown, checkbox)
- **Inventory Tracking** - Track individual items within bulk assets
- **Assignment Management** - Check out assets to users with expected return dates
- **Maintenance Records** - Schedule and track maintenance activities

### 🔍 **Advanced Search & Organization**
- **Full-Text Search** - Search across asset tags, names, descriptions, serial numbers, brands, models, and custom fields
- **Smart Filters** - Filter by category, status, location, and custom criteria
- **Sortable Columns** - Click any column header to sort ascending or descending
- **Debounced Search** - Smooth typing experience with 300ms search delay
- **Category Preferences** - Only see categories relevant to your workflow

### 📊 **Business Intelligence**
- **Real-Time Dashboard** - At-a-glance view of total, available, assigned, and maintenance assets
- **Activity Timeline** - Complete audit trail of all asset changes
- **Asset Statistics** - Track asset counts by status and category
- **Database Optimization** - Built-in tools to optimize database performance

### 🎨 **Beautiful User Experience**
- **Modern UI** - Clean, professional interface built with React and TailwindCSS
- **Setup Wizard** - Guided onboarding with business templates
- **Responsive Design** - Works on any screen size
- **Keyboard Shortcuts** - Fast workflows for power users
- **Visual Category System** - Color-coded categories with emoji icons

### 🔧 **Technical Excellence**
- **Offline-First** - 100% functional without internet connection
- **Self-Hosted** - Your data stays on your computer
- **SQLite Backend** - Reliable, battle-tested database engine
- **TypeScript** - Full type safety across the entire codebase
- **Electron** - Native desktop performance on all platforms

---

## 🎬 Quick Start

### Prerequisites
- Node.js 18+ (Download from [nodejs.org](https://nodejs.org))
- npm 8+ (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/krubles-asset-management.git
   cd krubles-asset-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run package
   ```

The packaged app will be in the `out/` directory.

---

## 📖 User Guide

### First-Time Setup

1. **Launch Krubles** - The Setup Wizard will guide you through initial configuration
2. **Choose Business Type** - Select from IT, Auto, Warehouse, Construction, Healthcare, Education, or Custom
3. **Review Categories** - Select which pre-configured categories you want, or add your own custom categories
4. **Enter Business Info** - Add your company name and default location
5. **Start Managing Assets** - You're ready to go!

### Managing Assets

**Create an Asset:**
1. Navigate to "Assets" in the sidebar
2. Click "New Asset"
3. Fill in asset details (tag, name, category, etc.)
4. Add custom fields specific to the category
5. Save the asset

**Search & Filter:**
- Use the search bar to find assets by any text field
- Filter by category, status, or location using the dropdown filters
- Click column headers to sort results

**View Modes:**
- Toggle between "My Categories", "Favorites", and "All Categories" using the sidebar selector
- Only see categories relevant to your workflow

### Category Management

**Create Custom Categories:**
1. Go to Settings → Category Management
2. Click "Manage Categories"
3. Add new categories with custom names, icons, and colors
4. Set category-specific custom fields (e.g., VIN for vehicles, SKU for inventory)

**Category Preferences:**
- Mark categories as favorites for quick access
- Hide unused categories from dropdowns
- Reorder categories in your preferred sequence

### Inventory Tracking

**Enable Tracked Inventory:**
1. When creating an asset, check "Track Individual Items"
2. Enter total quantity (e.g., 50 identical laptops)
3. System automatically creates unique QR codes for each item
4. Track individual item assignments and locations

**Check Out Assets:**
1. Select asset → Click "Assign"
2. Enter assignee name, purpose, and expected return date
3. System automatically updates availability

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19.2.3
- TypeScript 5.x
- TailwindCSS 3.x
- Zustand 5.0.9 (state management)
- Lucide React (icons)

**Backend:**
- Electron 39.2.7
- Better-SQLite3 12.5.0
- FTS5 (full-text search)

**Build:**
- Webpack 5.x
- Electron Forge 7.10.2

### Database Schema

**Core Tables:**
- `categories` - Asset category definitions with custom fields
- `assets` - Main asset records with FTS5 indexing
- `custom_field_definitions` - Dynamic field schemas per category
- `inventory_items` - Individual item tracking for bulk assets
- `assignments` - Asset checkout/check-in records
- `maintenance_records` - Scheduled and completed maintenance
- `inventory_transactions` - Receive/adjust/transfer operations
- `activity_log` - Complete audit trail
- `user_category_preferences` - Per-user category visibility settings
- `business_profile` - Company information

**Performance Features:**
- FTS5 virtual table for sub-100ms full-text search
- 20+ composite and partial indexes
- Custom fields flattened into searchable text
- Incremental auto-vacuum to prevent bloat
- WAL mode for concurrent access
- 64MB cache size for optimal performance

---

## 🔧 Development

### Project Structure

```
asset-management/
├── src/
│   ├── components/      # React UI components
│   │   ├── AssetManager.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── SetupWizard.tsx
│   │   └── ...
│   ├── database/        # SQLite schema & migrations
│   │   ├── db.ts
│   │   ├── schema.ts
│   │   └── migrations.ts
│   ├── ipc/             # Electron IPC handlers
│   │   ├── assets.ts
│   │   ├── categories.ts
│   │   ├── categoryPreferences.ts
│   │   └── ...
│   ├── types/           # TypeScript interfaces
│   │   └── api.ts
│   ├── utils/           # Utility functions
│   │   └── customFieldsIndexer.ts
│   ├── index.ts         # Electron main process
│   ├── preload.ts       # IPC bridge
│   └── App.tsx          # React root
├── public/              # Static assets
├── package.json
└── README.md
```

### Available Scripts

```bash
npm start          # Start development server with hot reload
npm run package    # Build production executable
npm run make       # Create distributable installers
npm run lint       # Run ESLint
npm run build      # Build for production
```

### Database Optimization

The system includes automatic database optimization:
- **Automatic Schedule** - Runs 30 seconds after startup, then every 24 hours
- **Manual Optimization** - Available in Settings → Database Optimization
- **Operations Performed:**
  - FTS5 index rebuild
  - Custom fields re-indexing
  - ANALYZE query planner statistics
  - PRAGMA optimize
  - Incremental vacuum

---

## 📊 Performance Benchmarks

| Operation | Dataset Size | Performance | Status |
|-----------|-------------|-------------|--------|
| Full-Text Search | 100,000 assets | <100ms | ✅ |
| Paginated Load | Any size | <200ms | ✅ |
| Sort Operation | 100,000 assets | <50ms | ✅ |
| Asset Creation | N/A | <20ms | ✅ |
| Database Size | 100,000 assets | <500MB | ✅ |
| Memory Usage | Any dataset | <250MB | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://react.dev/) and [TailwindCSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Database by [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)

---

## 📞 Support

- 📧 Email: support@krubles.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/krubles-asset-management/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/krubles-asset-management/discussions)

---

**Made with ❤️ by the Krubles Team**

*Krubles - Enterprise asset management without the enterprise price tag.*
