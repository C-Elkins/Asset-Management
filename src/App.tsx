import { useState, useEffect } from 'react'
import { Package, Settings, LayoutDashboard, Box } from 'lucide-react'
import { CategoryManager } from './components/CategoryManager'
import { AssetManager } from './components/AssetManager'
import { RecentActivity } from './components/RecentActivity'
import { SetupWizard } from './components/SetupWizard'
import type { Category, AssetStats, BusinessProfile, CategoryViewMode } from './types/api'

type View = 'dashboard' | 'assets' | 'categories' | 'settings'

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [categoryViewMode, setCategoryViewMode] = useState<CategoryViewMode>('selected')
  const [stats, setStats] = useState<AssetStats>({ total: 0, available: 0, assigned: 0, maintenance: 0 })
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [showSetupWizard, setShowSetupWizard] = useState(false)

  useEffect(() => {
    loadBusinessProfile()
    loadCategoryViewMode()
    loadCategories()
    loadStats()
  }, [])

  // Filter categories when categories or view mode changes
  useEffect(() => {
    filterCategories()
  }, [categories, categoryViewMode])

  const loadCategoryViewMode = async () => {
    try {
      const mode = await window.api.getCategoryViewMode()
      setCategoryViewMode(mode)
    } catch (error) {
      console.error('Failed to load category view mode:', error)
    }
  }

  const filterCategories = async () => {
    if (categoryViewMode === 'all') {
      setFilteredCategories(categories)
      return
    }

    try {
      const preferences = await window.api.getUserCategoryPreferences()

      const filtered = categories.filter(cat => {
        const pref = preferences.find(p => p.category_id === cat.id)

        if (categoryViewMode === 'favorites') {
          return pref?.is_favorite === 1
        } else { // 'selected'
          return pref?.is_selected === 1
        }
      })

      setFilteredCategories(filtered)
    } catch (error) {
      console.error('Failed to filter categories:', error)
      setFilteredCategories(categories)
    }
  }

  const handleCategoryViewModeChange = async (mode: CategoryViewMode) => {
    try {
      await window.api.setCategoryViewMode(mode)
      setCategoryViewMode(mode)
    } catch (error) {
      console.error('Failed to update view mode:', error)
    }
  }

  const loadBusinessProfile = async () => {
    try {
      const profile = await window.api.getBusinessProfile()
      setBusinessProfile(profile)

      // Show setup wizard if not completed
      if (profile.setup_completed === 0) {
        setShowSetupWizard(true)
      }
    } catch (error) {
      console.error('Failed to load business profile:', error)
    }
  }

  const handleSetupComplete = async () => {
    setShowSetupWizard(false)
    await loadBusinessProfile()
    await loadCategories()
    await loadStats()
  }

  // Refresh stats when switching to dashboard view
  useEffect(() => {
    if (currentView === 'dashboard') {
      loadStats()
    }
  }, [currentView])

  const loadCategories = async () => {
    try {
      const data = await window.api.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await window.api.getAssetStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-emerald-600">Krubles</h1>
          <p className="text-sm text-gray-500 mt-1">Asset Management</p>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          <NavItem
            icon={<Box size={20} />}
            label="Assets"
            active={currentView === 'assets'}
            onClick={() => setCurrentView('assets')}
          />
          <NavItem
            icon={<Package size={20} />}
            label="Categories"
            active={currentView === 'categories'}
            onClick={() => setCurrentView('categories')}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={currentView === 'settings'}
            onClick={() => setCurrentView('settings')}
          />
        </nav>

        {/* Category View Mode Selector */}
        <div className="px-4 py-3 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Category View
          </label>
          <select
            value={categoryViewMode}
            onChange={(e) => handleCategoryViewModeChange(e.target.value as CategoryViewMode)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="selected">My Categories</option>
            <option value="favorites">Favorites</option>
            <option value="all">All Categories</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {categoryViewMode === 'selected' && 'Showing categories you selected during setup'}
            {categoryViewMode === 'favorites' && 'Showing your favorite categories'}
            {categoryViewMode === 'all' && 'Showing all available categories'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {currentView === 'dashboard' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Assets" value={stats.total.toString()} icon="📦" color="bg-emerald-500" />
                <StatsCard title="Available" value={stats.available.toString()} icon="✅" color="bg-green-500" />
                <StatsCard title="Assigned" value={stats.assigned.toString()} icon="👤" color="bg-blue-500" />
                <StatsCard title="Maintenance" value={stats.maintenance.toString()} icon="🔧" color="bg-orange-500" />
              </div>

              {/* Recent Activity */}
              <RecentActivity limit={15} />
            </>
          )}

          {currentView === 'assets' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Assets</h2>
              <AssetManager categories={filteredCategories} onAssetChange={loadStats} />
            </>
          )}

          {currentView === 'categories' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Categories</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading categories...</div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No categories to display</p>
                    <p className="text-sm">
                      {categoryViewMode === 'selected' && 'You haven\'t selected any categories. Go to Settings to manage categories.'}
                      {categoryViewMode === 'favorites' && 'You haven\'t favorited any categories yet.'}
                      {categoryViewMode === 'all' && 'No categories configured. Go to Settings to set up your categories.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="p-4 rounded-lg border-2 hover:shadow-md transition-shadow cursor-pointer"
                        style={{ borderColor: category.color_code || '#10b981' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: category.color_code || '#10b981' }}
                          >
                            <span className="text-white">{category.icon || '📁'}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            {category.description && (
                              <p className="text-sm text-gray-500">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'settings' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>

              {/* Business Profile Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Business Profile</h3>
                    <p className="text-sm text-gray-500 mt-1">Your organization information</p>
                  </div>
                  <button
                    onClick={() => setShowSetupWizard(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Re-run Setup Wizard
                  </button>
                </div>

                {businessProfile && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company Name</p>
                      <p className="text-gray-900">{businessProfile.company_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Type</p>
                      <p className="text-gray-900 capitalize">
                        {businessProfile.business_type?.replace('-', ' / ') || 'Not set'}
                      </p>
                    </div>
                    {businessProfile.default_location && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Default Location</p>
                        <p className="text-gray-900">{businessProfile.default_location}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category Management Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Category Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Configure asset categories for your business</p>
                  </div>
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Manage Categories
                  </button>
                </div>

                {categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{categories.length}</span> categories configured
                    </p>
                  </div>
                )}
              </div>

              {/* App Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 mb-2">Krubles Asset Management System</p>
                <p className="text-xs text-gray-500">Version 1.0.0</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        onCategoryChange={loadCategories}
      />

      {/* Setup Wizard */}
      <SetupWizard
        isOpen={showSetupWizard}
        onComplete={handleSetupComplete}
      />
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
        active
          ? 'bg-emerald-50 text-emerald-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function StatsCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default App
