import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";
import { getSocket, disconnectSocket } from "@/api/socket";
import { useAuth } from "@/context/AuthContext";
import { formatIFDWithTime, formatIFD } from "@/utils/dateUtils";
import { toast } from "react-hot-toast";

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Notifications ────────────────────────────────────────────────────────
  const [notifications, setNotifications]           = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const mapNotification = (n) => {
    const createdDate = n.createdAt ? new Date(n.createdAt) : new Date();
    const isToday = createdDate.toDateString() === new Date().toDateString();
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === createdDate.toDateString();
    const isRead = n.isRead === true || n.unread === false;
    return {
      ...n,
      id:     n._id || n.id,
      _id:    n._id || n.id,
      isRead: isRead,
      unread: !isRead,
      group:  isToday ? "TODAY" : (isYesterday ? "YESTERDAY" : "EARLIER"),
      time:   n.createdAt ? formatIFDWithTime(n.createdAt) : "Just now",
      type:   n.type || "bell",
    };
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await adminApi.getNotifications();
      const raw = response.data?.data || response.data || [];
      if (Array.isArray(raw)) {
        setNotifications(raw.map(mapNotification));
      }
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false, isRead: true })));
      await adminApi.markAllNotificationsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => 
        (n.id === id || n._id === id) ? { ...n, unread: false, isRead: true } : n
      ));
      await adminApi.markNotificationRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
      await adminApi.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // ── Organizations ────────────────────────────────────────────────────────
  const [organizations, setOrganizations] = useState([]);

  const fetchOrganizations = async () => {
    try {
      const response = await adminApi.getOrganizations();
      const result = response.data?.data || response.data || [];
      setOrganizations(result);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  };

  // ── Fleet Managers ────────────────────────────────────────────────────────
  const [fleetManagers, setFleetManagers] = useState([]);

  const fetchFleetManagers = async () => {
    try {
      const response = await adminApi.getFleetManagers();
      const result = response.data?.data || response.data || [];
      setFleetManagers(result);
    } catch (error) {
      console.error("Failed to fetch fleet managers:", error);
    }
  };

  // ── Admin profile (name / avatar for top-nav) ─────────────────────────────
  const [adminProfile, setAdminProfile] = useState({ name: "", avatarUrl: "" });

  const fetchAdminProfile = async () => {
    try {
      const response = await adminApi.getProfile();
      const data = response.data?.data || response.data || {};
      setAdminProfile({ name: data.name || "", avatarUrl: data.profileImage || data.avatarUrl || "" });
    } catch (error) {
      // Non-critical — silently ignore if profile endpoint fails
      console.warn("Failed to fetch admin profile:", error?.response?.status);
    }
  };

  // ── Platform Settings ──────────────────────────────────────────────────────
  const [platformSettings, setPlatformSettings] = useState({ platformName: "Fleet Management", logoUrl: "/logo.png" });

  const fetchPlatformSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      const data = response.data?.data || response.data || {};
      setPlatformSettings({ 
        platformName: data.platformName || "Fleet Management", 
        logoUrl: data.logoUrl || "/logo.png" 
      });
    } catch (error) {
      console.warn("Failed to fetch platform settings:", error?.response?.status);
    }
  };

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      const socket = getSocket();

      // Join rooms
      socket.emit("joinRoleRoom", "SUPER_ADMIN");
      if (user?._id || user?.id) {
        socket.emit("joinAdminRoom", user._id || user.id);
      }

      // Listen for events
      socket.on("notification:new", (notification) => {
        setNotifications(prev => [mapNotification(notification), ...prev]);
        
        if (notification.type === "CONTACT_REQUEST") {
          const name = notification.metadata?.name || "A visitor";
          const subject = notification.metadata?.subject || "Contact Request";
          
          toast.success(
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-800 text-[13px]">New Contact Request</span>
              <span className="text-[11px] text-slate-500 font-semibold mt-0.5">{name} submitted a {subject}.</span>
            </div>,
            { duration: 5000 }
          );
        }
      });

      socket.on("notification:read", (notification) => {
        setNotifications(prev => prev.map(n => 
          n.id === (notification._id || notification.id) ? mapNotification(notification) : n
        ));
      });

      socket.on("notification:update", (data) => {
        if (data.allRead) {
          setNotifications(prev => prev.map(n => ({ ...n, unread: false, isRead: true })));
        }
      });

      socket.on("notification:delete", (data) => {
        setNotifications(prev => prev.filter(n => n.id !== data.id));
      });

      return () => {
        socket.off("notification:new");
        socket.off("notification:read");
        socket.off("notification:update");
        socket.off("notification:delete");
      };
    } else {
      // Disconnect if not authenticated
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrganizations();
    fetchFleetManagers();
    fetchNotifications();
    fetchAdminProfile();
    fetchPlatformSettings();
  }, []);

  // ── Organization helpers ──────────────────────────────────────────────────
  const getOrganization    = (id) => organizations.find(o => o.id === id || o._id === id);
  const addOrganization    = (org) => setOrganizations(prev => [...prev, { ...org, id: Date.now().toString() }]);
  const updateOrganization = (id, updated) => setOrganizations(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, ...updated } : o));
  const deleteOrganization = (id) => setOrganizations(prev => prev.filter(o => o.id !== id && o._id !== id));

  // ── Fleet Manager helpers ─────────────────────────────────────────────────
  const getFleetManager    = (id) => fleetManagers.find(m => m.id === id || m._id === id);
  const addFleetManager    = (manager) => setFleetManagers(prev => [...prev, { ...manager, id: Date.now().toString(), created: formatIFD(new Date()) }]);
  const updateFleetManager = (id, updated) => setFleetManagers(prev => prev.map(m => (m.id === id || m._id === id) ? { ...m, ...updated } : m));
  const deleteFleetManager = (id) => setFleetManagers(prev => prev.filter(m => m.id !== id && m._id !== id));

  return (
    <AdminContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,

      organizations,
      fetchOrganizations,
      getOrganization,
      addOrganization,
      updateOrganization,
      deleteOrganization,

      fleetManagers,
      fetchFleetManagers,
      getFleetManager,
      addFleetManager,
      updateFleetManager,
      deleteFleetManager,

      notifications,
      setNotifications,
      notificationsLoading,
      fetchNotifications,
      markAllAsRead,
      markAsRead,
      deleteNotification,

      adminProfile,
      setAdminProfile,

      platformSettings,
      fetchPlatformSettings,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
