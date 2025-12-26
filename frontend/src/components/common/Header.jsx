import React from "react";
import { useCustomization } from "../../hooks/useCustomization";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User,
  Bell,
  Search,
  Settings,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Info,
  Menu,
} from "lucide-react";
import {
  getNotifications,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
} from "../../services/notificationService";
import { useAuthStore } from "../../app/store/authStore";
import { getSettings, updateSettings } from "../../services/settingsService";

export const Header = ({ user, onLogout, onToggleSidebar, sidebarOpen }) => {
  const { terminology } = useCustomization();
  // Session expiry UX
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showExpiry, setShowExpiry] = useState(false);

  useEffect(() => {
    let id;
    const tick = () => {
      if (!expiresAt) {
        setShowExpiry(false);
        setTimeLeft(null);
        return;
      }
      const ms = expiresAt - Date.now();
      setTimeLeft(ms);
      setShowExpiry(ms > 0 && ms <= 120_000); // show when <= 2 minutes
    };
    tick();
    id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const staySignedIn = async () => {
    try {
      await refreshAuth();
      setShowExpiry(false);
    } catch {}
  };

  // Interactive states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [polling, setPolling] = useState(false); // Disabled until notifications backend is implemented
  const [notifTab, setNotifTab] = useState("all"); // all | unread | prefs
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    pushNotifications: false,
    maintenanceAlerts: true,
    weeklyReports: true,
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Interactive functions
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    apiMarkRead(id);
  };

  // Ensure mutual exclusivity - only one dropdown open at a time
  const toggleNotifications = async () => {
    setShowSettings(false); // Close settings first
    const next = !showNotifications;
    setShowNotifications(next);
    setPolling(!next); // pause polling when the panel is open
    if (next && !notificationsLoaded) {
      try {
        const { items } = await getNotifications({ status: "all", limit: 50 });
        setNotifications(items);
        try {
          const s = await getSettings();
          if (s?.notifications) setNotifPrefs(s.notifications);
        } catch {}
      } catch (error) {
        console.warn(
          "Notifications endpoint not available, using empty notifications",
        );
        setNotifications([]);
      } finally {
        setNotificationsLoaded(true);
      }
    }
  };

  const toggleSettings = () => {
    setShowNotifications(false); // Close notifications first
    setShowSettings(!showSettings);
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    apiMarkAllRead();
  };

  // Non-blocking polling for notifications when panel is closed
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    let timer;
    const run = async () => {
      try {
        const { items } = await getNotifications({ status: "all", limit: 50 });
        if (!cancelled) setNotifications(items);
      } catch (error) {
        console.warn("Notifications polling failed, retrying later");
        // ignore errors; retry later
      } finally {
        if (!cancelled) timer = setTimeout(run, 90000); // 90s
      }
    };
    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [polling]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add search functionality here
  };

  const settingsItems = [
    {
      label: "Profile Settings",
      action: () => navigate("/app/settings/profile"),
    },
    {
      label: "System Preferences",
      action: () => navigate("/app/settings/system"),
    },
    {
      label: "Security Settings",
      action: () => navigate("/app/settings/security"),
    },
    {
      label: "Backup & Restore",
      action: () => navigate("/app/settings/backup"),
    },
    { label: "API Settings", action: () => navigate("/app/settings/api") },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside notifications dropdown
      if (
        !event.target.closest(".notifications-dropdown") &&
        !event.target.closest(".notifications-btn")
      ) {
        setShowNotifications(false);
      }
      // Check if click is outside settings dropdown
      if (
        !event.target.closest(".settings-dropdown") &&
        !event.target.closest(".settings-btn")
      ) {
        setShowSettings(false);
      }
      // Check if click is outside user menu dropdown
      if (!event.target.closest(".dropdown-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const location = useLocation();
  const [animating, setAnimating] = useState(false);
  const [showPrivacyNudge, setShowPrivacyNudge] = useState(false);

  useEffect(() => {
    // Trigger luxurious slow pulse on route changes
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Show a one-time privacy review nudge for authenticated users
  useEffect(() => {
    try {
      const key = "privacy_nudge_dismissed";
      const dismissed = localStorage.getItem(key) === "1";
      const onPrivacy = location.pathname.includes("/app/privacy");
      if (!dismissed && !onPrivacy) setShowPrivacyNudge(true);
    } catch {
      /* ignore */
    }
  }, [location.pathname]);

  return (
    <>
      {/* Executive Progress Indicator */}
      {/* Progress indicator moved inside header to avoid overlapping content */}
      <div className="hidden" aria-hidden="true" />

      <motion.header
        className="relative z-[30]"
        style={{
          background:
            "linear-gradient(145deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.03)",
          boxShadow:
            "inset 0 -1px 0 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.04), 0 0 80px rgba(0, 0, 0, 0.02)",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Backdrop overlay for dropdowns to improve contrast and capture clicks */}
        <AnimatePresence>
          {(showNotifications || showSettings) && (
            <motion.div
              className="fixed inset-0 bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ zIndex: 9990 }}
              onClick={() => {
                setShowNotifications(false);
                setShowSettings(false);
              }}
            />
          )}
        </AnimatePresence>
        {/* Local progress bar within header bounds */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: animating ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: animating ? "100%" : "0%" }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />
        </motion.div>
        <div className="px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-6">
          {/* Privacy settings nudge */}
          <AnimatePresence>
            {showPrivacyNudge && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-3 mx-auto max-w-4xl rounded-xl border border-blue-300 bg-blue-50 text-blue-900 px-4 py-3 shadow-sm flex items-center justify-between gap-3"
                role="status"
                aria-live="polite"
              >
                <div className="text-sm">
                  Please review your privacy preferences and data export
                  options.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/app/privacy")}
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg"
                  >
                    Open Privacy
                  </button>
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem("privacy_nudge_dismissed", "1");
                      } catch {}
                      setShowPrivacyNudge(false);
                    }}
                    className="text-sm font-semibold text-blue-900 bg-blue-200 hover:bg-blue-300 px-3 py-1.5 rounded-lg"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Session Expiring Banner */}
          <AnimatePresence>
            {showExpiry && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-3 mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 shadow-sm flex items-center justify-between gap-3"
                role="status"
                aria-live="polite"
              >
                <div className="text-sm">
                  Your session is about to expire
                  {typeof timeLeft === "number"
                    ? ` in ${Math.max(0, Math.ceil(timeLeft / 1000))}s`
                    : ""}
                  .
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={staySignedIn}
                    className="text-sm font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg"
                  >
                    Stay signed in
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Hamburger Menu Button - Always visible */}
            <motion.button
              onClick={onToggleSidebar}
              className="p-2 md:p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60 rounded-lg md:rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
            </motion.button>

            {/* Executive Search Section */}
            <motion.div
              className="flex-1 max-w-xl mr-2 md:mr-4 lg:mr-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                  <Search
                    className="w-4 h-4 md:w-5 md:h-5 text-slate-400"
                    strokeWidth={2}
                  />
                </div>
                <motion.input
                  type="text"
                  placeholder={`Search ${(terminology.assets || "assets").toLowerCase()}, ${(terminology.reports || "reports").toLowerCase()}, ${(terminology.maintenance || "maintenance").toLowerCase()}...`}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 lg:py-4 text-xs md:text-[13px] font-medium text-slate-700 placeholder-slate-400 bg-white/85 border border-slate-200/60 rounded-xl md:rounded-2xl shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/50 transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  }}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>

            {/* Executive Actions */}
            <motion.div
              className="flex items-center gap-2 md:gap-3 lg:gap-4 ml-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {/* Premium Notifications */}
              <div className="relative dropdown-container">
                <motion.button
                  onClick={toggleNotifications}
                  className="relative p-2 md:p-2.5 lg:p-3 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60 rounded-lg md:rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Bell className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                  {unreadCount > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="text-[10px] font-bold text-white leading-none">
                        {unreadCount}
                      </span>
                    </motion.div>
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      className="absolute right-0 top-full mt-3 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        boxShadow:
                          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                        zIndex: 10000,
                      }}
                    >
                      <div className="p-4 border-b border-slate-200/80 bg-white">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900">
                            Notifications
                          </h3>
                          <div className="flex gap-3">
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                              Mark all read
                            </button>
                            <button
                              onClick={() => setShowNotifications(false)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {/* Tabs */}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          {["all", "unread", "prefs"].map((t) => (
                            <button
                              key={t}
                              onClick={() => setNotifTab(t)}
                              className={`px-3 py-1.5 rounded-lg border ${notifTab === t ? "border-blue-500 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                              {t === "all"
                                ? "All"
                                : t === "unread"
                                  ? `Unread (${unreadCount})`
                                  : "Settings"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto bg-white">
                        {notifTab !== "prefs" &&
                          (notifTab === "all"
                            ? notifications
                            : notifications.filter((n) => !n.read)
                          ).map((notification) => {
                            const icons = {
                              success: (
                                <Check className="w-4 h-4 text-green-600" />
                              ),
                              warning: (
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                              ),
                              info: <Info className="w-4 h-4 text-blue-600" />,
                            };

                            return (
                              <motion.div
                                key={notification.id}
                                className={`p-4 border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors ${
                                  !notification.read ? "bg-blue-50/30" : ""
                                }`}
                                onClick={() => markAsRead(notification.id)}
                                whileHover={{
                                  backgroundColor: "rgba(248, 250, 252, 0.5)",
                                }}
                              >
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {icons[notification.type]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {notification.time}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        {notifTab === "prefs" && (
                          <div className="p-4 space-y-3">
                            {[
                              {
                                key: "emailNotifications",
                                label: "Email notifications",
                              },
                              {
                                key: "pushNotifications",
                                label: "Push notifications",
                              },
                              {
                                key: "maintenanceAlerts",
                                label: "Maintenance alerts",
                              },
                              { key: "weeklyReports", label: "Weekly reports" },
                            ].map((item) => (
                              <label
                                key={item.key}
                                className="flex items-center justify-between text-sm text-slate-700"
                              >
                                <span>{item.label}</span>
                                <input
                                  type="checkbox"
                                  checked={!!notifPrefs[item.key]}
                                  onChange={async (e) => {
                                    const next = {
                                      ...notifPrefs,
                                      [item.key]: e.target.checked,
                                    };
                                    setNotifPrefs(next);
                                    try {
                                      await updateSettings({
                                        notifications: next,
                                      });
                                    } catch {}
                                  }}
                                />
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Executive Settings */}
              <div className="relative dropdown-container">
                <motion.button
                  onClick={toggleSettings}
                  className="relative p-2 md:p-2.5 lg:p-3 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60 rounded-lg md:rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Settings className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                </motion.button>

                {/* Settings Dropdown */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        boxShadow:
                          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                        zIndex: 10000,
                      }}
                    >
                      <div className="p-3 bg-white">
                        <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100/80 mb-2 bg-white rounded-lg">
                          Quick Settings
                        </div>
                        {settingsItems.map((item, index) => (
                          <motion.button
                            key={index}
                            onClick={() => {
                              item.action();
                              setShowSettings(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors duration-150 flex items-center gap-2"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.1 }}
                          >
                            {item.label}
                          </motion.button>
                        ))}
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={() => setShowSettings(false)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-slate-600 rounded-lg transition-colors duration-150"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {user && (
                  <motion.div
                    className="relative dropdown-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Executive User Profile - Clickable */}
                    <motion.div
                      onClick={() => {
                        setShowNotifications(false);
                        setShowSettings(false);
                        setShowUserMenu(!showUserMenu);
                      }}
                      className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-3 md:py-4 bg-gradient-to-r from-emerald-50/90 to-white/90 border border-emerald-200/60 rounded-2xl shadow-lg backdrop-blur-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer group"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        boxShadow:
                          "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
                          <User
                            className="w-4 h-4 md:w-5 md:h-5 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-400 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0 hidden md:block">
                        <p className="text-[13px] font-bold text-slate-800 tracking-[-0.01em] truncate">
                          {user.username || "User"}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600 truncate">
                          {user.roles && user.roles.length > 0
                            ? user.roles.map(roleLabel).join(", ")
                            : "Administrator"}
                        </p>
                      </div>
                      <ChevronDown
                        className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 group-hover:text-emerald-700 transition-colors duration-200"
                        strokeWidth={2}
                      />
                    </motion.div>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          className="absolute right-0 top-full mt-3 w-64 bg-white border border-emerald-200/80 rounded-2xl shadow-2xl overflow-hidden z-[10001]"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          style={{
                            boxShadow:
                              "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <div className="p-4 bg-gradient-to-br from-emerald-50 to-white border-b border-emerald-100">
                            <p className="text-sm font-bold text-slate-800">
                              {user.username || "User"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email || "user@example.com"}
                            </p>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={() => {
                                navigate("/app/profile");
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-2"
                            >
                              <User className="w-4 h-4" /> My Profile
                            </button>
                            <button
                              onClick={() => {
                                navigate("/app/settings");
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-2"
                            >
                              <Settings className="w-4 h-4" /> Settings
                            </button>
                            <button
                              onClick={() => {
                                navigate("/app/privacy");
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" /> Privacy
                            </button>
                            <div className="border-t border-slate-100 my-2"></div>
                            <button
                              onClick={() => {
                                onLogout();
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 font-semibold"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
};
