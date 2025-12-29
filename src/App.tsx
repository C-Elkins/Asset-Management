import { useState, useEffect } from 'react'
import { Package, Settings, LayoutDashboard, Box, Star, LogOut, User as UserIcon } from 'lucide-react'
import { CategoryManager } from './components/CategoryManager'
import { AssetManager } from './components/AssetManager'
import { RecentActivity } from './components/RecentActivity'
import { SetupWizard } from './components/SetupWizard'
import { LoginScreen } from './components/LoginScreen'
import { SettingsPage } from './components/SettingsPage'
import { Dashboard } from './components/Dashboard'
import { Titlebar } from './components/Titlebar'
import { useTheme } from './context/ThemeContext'
import type { CategoryWithPreference, AssetStats, BusinessProfile, CategoryViewMode, User } from './types/api'

type View = 'dashboard' | 'assets' | 'settings'

function App() {
  const { actualTheme } = useTheme()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [categories, setCategories] = useState<CategoryWithPreference[]>([])
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithPreference[]>([])
  const [categoryViewMode, setCategoryViewMode] = useState<CategoryViewMode>('selected')
  const [stats, setStats] = useState<AssetStats>({ total: 0, available: 0, assigned: 0, maintenance: 0 })
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [dbStats, setDbStats] = useState<{ databaseSizeMB: string; totalAssets: number; ftsRecords: number; totalIndexes: number } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'categories' | 'users' | 'database' | 'data' | 'shortcuts' | 'about'>('general')

  // Check for existing session on app load
  useEffect(() => {
    checkCurrentUser()
  }, [])

  // Load data after authentication check
  useEffect(() => {
    if (!authChecking) {
      loadBusinessProfile()
      loadCategoryViewMode()
      loadCategories()
      loadStats()
    }
  }, [authChecking])

  const checkCurrentUser = async () => {
    try {
      const user = await window.api.getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error('Failed to check current user:', error)
    } finally {
      setAuthChecking(false)
    }
  }

  const handleLoginSuccess = async () => {
    await checkCurrentUser()
  }

  const handleLogout = async () => {
    try {
      await window.api.logout()
      setCurrentUser(null)
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Filter categories when categories or view mode changes
  useEffect(() => {
    filterCategories()
  }, [categories, categoryViewMode])

  // Load database stats when viewing settings
  useEffect(() => {
    if (currentView === 'settings') {
      loadDatabaseStats()
    }
  }, [currentView])

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
      const data = await window.api.getCategoriesWithPreferences()
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

  const loadDatabaseStats = async () => {
    try {
      const result = await window.api.getDatabaseStats()
      if (result.success && result.stats) {
        setDbStats(result.stats)
      }
    } catch (error) {
      console.error('Failed to load database stats:', error)
    }
  }

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLoginClick = () => {
    setShowLogin(true)
  }

  const handleLoginSuccessWrapper = async () => {
    await handleLoginSuccess()
    setShowLogin(false)
  }

  return (
    <>
      {/* Titlebar */}
      <Titlebar />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            >
              <span className="text-gray-600 text-xl">&times;</span>
            </button>
            <LoginScreen onLoginSuccess={handleLoginSuccessWrapper} />
          </div>
        </div>
      )}

      {/* Main App */}
      <div className="flex bg-gray-50 dark:bg-gray-900" style={{ height: 'calc(100vh - 32px)' }}>
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              K
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Krubles</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Asset Management</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Menu</p>
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={currentView === 'dashboard'}
            onClick={() => {
              setCurrentView('dashboard')
              setSelectedCategoryFilter(null)
            }}
          />
          <NavItem
            icon={<Box size={20} />}
            label="All Assets"
            badge={stats.total > 0 ? stats.total.toString() : undefined}
            active={currentView === 'assets' && selectedCategoryFilter === null}
            onClick={() => {
              setCurrentView('assets')
              setSelectedCategoryFilter(null)
            }}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={currentView === 'settings'}
            onClick={() => {
              setCurrentView('settings')
              setSelectedCategoryFilter(null)
            }}
          />
        </nav>

        {/* Categories Section - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categories</p>
              <button
                onClick={() => setShowCategoryManager(true)}
                disabled={!currentUser}
                className={`text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!currentUser ? "Login Required" : "Manage Categories"}
              >
                + Manage
              </button>
            </div>

            {/* Category View Mode - More Prominent */}
            <select
              value={categoryViewMode}
              onChange={(e) => handleCategoryViewModeChange(e.target.value as CategoryViewMode)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="selected">📋 My Categories</option>
              <option value="favorites">⭐ Favorites</option>
              <option value="all">🗂️ All Categories</option>
            </select>
          </div>

          {/* Scrollable Category List */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="space-y-1">
              {filteredCategories.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <div className="text-gray-300 dark:text-gray-600 mb-3">
                    <Package size={32} className="mx-auto" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No categories available</p>
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    disabled={!currentUser}
                    className={`text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-medium ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={!currentUser ? "Login Required" : "Add Categories"}
                  >
                    Add Categories
                  </button>
                </div>
              ) : (
                filteredCategories.map(category => (
                  <div
                    key={category.id}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all group ${
                      currentView === 'assets' && selectedCategoryFilter === category.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCurrentView('assets')
                        setSelectedCategoryFilter(category.id)
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      title={category.name}
                    >
                      <span className="text-lg flex-shrink-0" style={{ color: category.color_code }}>
                        {category.icon}
                      </span>
                      <span className="flex-1 truncate">{category.name}</span>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          await window.api.updateCategoryPreference(category.id, {
                            is_favorite: category.is_favorite ? 0 : 1
                          })
                          // Reload categories with preferences
                          const updated = await window.api.getCategoriesWithPreferences()
                          setCategories(updated)
                        } catch (error) {
                          console.error('Failed to toggle favorite:', error)
                        }
                      }}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        category.is_favorite
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
                      }`}
                      title={category.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {category.is_favorite ? <Star size={14} fill="currentColor" /> : <Star size={14} />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer - User Menu or Login Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{filteredCategories.length} categories</span>
            <span className="text-gray-400 dark:text-gray-500">v1.0.0</span>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
            {currentUser ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                  <UserIcon size={16} className="text-gray-400 dark:text-gray-500" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.username}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium shadow-sm"
              >
                <LogOut size={18} className="rotate-180" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {currentView === 'dashboard' && (
            <Dashboard currentUser={currentUser} />
          )}

          {currentView === 'assets' && (
            <>
              {/* Breadcrumb Navigation */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Home
                  </button>
                  <span>/</span>
                  <button
                    onClick={() => setSelectedCategoryFilter(null)}
                    className={selectedCategoryFilter ? 'hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors' : 'text-gray-900 dark:text-gray-100 font-medium'}
                  >
                    Assets
                  </button>
                  {selectedCategoryFilter && (
                    <>
                      <span>/</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {filteredCategories.find(c => c.id === selectedCategoryFilter)?.name || ''}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedCategoryFilter && (
                      <span className="text-4xl">
                        {filteredCategories.find(c => c.id === selectedCategoryFilter)?.icon || '📦'}
                      </span>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedCategoryFilter
                        ? `${filteredCategories.find(c => c.id === selectedCategoryFilter)?.name || ''}`
                        : 'All Assets'}
                    </h2>
                  </div>
                  {selectedCategoryFilter && (
                    <button
                      onClick={() => setSelectedCategoryFilter(null)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      ← View All Assets
                    </button>
                  )}
                </div>
              </div>

              <AssetManager
                categories={filteredCategories}
                onAssetChange={loadStats}
                categoryFilter={selectedCategoryFilter}
                currentUser={currentUser}
              />
            </>
          )}

          {currentView === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              categories={categories}
              businessProfile={businessProfile}
              stats={stats}
              dbStats={dbStats}
              onOpenCategoryManager={() => setShowCategoryManager(true)}
              onOpenSetupWizard={() => setShowSetupWizard(true)}
              onRefreshDbStats={loadDatabaseStats}
            />
          )}
        </div>
      </div>

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        onCategoryChange={loadCategories}
        currentUser={currentUser}
      />

      {/* Setup Wizard */}
      <SetupWizard
        isOpen={showSetupWizard}
        onComplete={handleSetupComplete}
      />
      </div>
    </>
  )
}

function NavItem({
  icon,
  label,
  badge,
  active = false,
  onClick
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        active
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          active
            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {badge}
        </span>
      )}
    </div>
  )
}

function StatsCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default App
