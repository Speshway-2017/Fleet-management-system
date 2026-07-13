import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Notifications ────────────────────────────────────────────────────────
  const [notifications, setNotifications]           = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const mapNotification = (n) => {
    const createdDate = new Date(n.createdAt);
    const isToday = createdDate.toDateString() === new Date().toDateString();
    return {
      ...n,
      id:     n._id,
      unread: !n.isRead,
      group:  isToday ? "TODAY" : "YESTERDAY",
      time:   createdDate.toLocaleDateString() + " " +
              createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type:   n.type || "bell",
    };
  };

  const fetchNotifications = async () => {
    try {
      const response = await adminApi.getNotifications();
      const raw = response.data?.data || response.data || [];
      setNotifications(raw.map(mapNotification));
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
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
      setAdminProfile({ name: data.name || "", avatarUrl: data.avatarUrl || "" });
    } catch (error) {
      // Non-critical — silently ignore if profile endpoint fails
      console.warn("Failed to fetch admin profile:", error?.response?.status);
    }
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrganizations();
    fetchFleetManagers();
    fetchNotifications();
    fetchAdminProfile();
  }, []);

  // ── Organization helpers ──────────────────────────────────────────────────
  const getOrganization    = (id) => organizations.find(o => o.id === id || o._id === id);
  const addOrganization    = (org) => setOrganizations(prev => [...prev, { ...org, id: Date.now().toString() }]);
  const updateOrganization = (id, updated) => setOrganizations(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, ...updated } : o));
  const deleteOrganization = (id) => setOrganizations(prev => prev.filter(o => o.id !== id && o._id !== id));

  // ── Fleet Manager helpers ─────────────────────────────────────────────────
  const getFleetManager    = (id) => fleetManagers.find(m => m.id === id || m._id === id);
  const addFleetManager    = (manager) => setFleetManagers(prev => [...prev, { ...manager, id: Date.now().toString(), created: new Date().toLocaleDateString() }]);
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

      adminProfile,
      setAdminProfile,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
