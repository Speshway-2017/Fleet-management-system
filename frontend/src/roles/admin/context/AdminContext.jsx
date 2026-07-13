import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { adminApi } from "@/api/adminApi";
import { io } from "socket.io-client";

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const socketRef = useRef();
  const [adminProfile, setAdminProfile] = useState({ name: "", avatarUrl: "" });

  const mapNotification = (n) => {
    const createdDate = new Date(n.createdAt);
    const isToday = createdDate.toDateString() === new Date().toDateString();
    const group = isToday ? "TODAY" : "YESTERDAY";
    const time = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      ...n,
      id: n._id,
      unread: !n.isRead,
      group,
      time,
      type: n.type || 'bell'
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
      await Promise.all(notifications.filter(n => n.unread).map(n => adminApi.markNotificationRead(n.id)));
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

  useEffect(() => {
    fetchOrganizations();
    fetchFleetManagers();
    fetchNotifications();
    // Fetch admin profile for avatar
    const fetchProfile = async () => {
      try {
        const response = await adminApi.getProfile();
        const data = response.data?.data || response.data || {};
        setAdminProfile({ name: data.name || "", avatarUrl: data.avatarUrl || "" });
      } catch (error) {
        console.warn("Failed to fetch admin profile:", error);
      }
    };
    fetchProfile();
    // Initialize Socket.io client with reconnection handling
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
      query: { token: localStorage.getItem("token") },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    const socket = socketRef.current;
    socket.on("connect", () => console.log("Socket connected"));
    socket.on("disconnect", (reason) => console.warn("Socket disconnected:", reason));
    socket.on("notification", (newNotif) => {
      const mapped = mapNotification(newNotif);
      setNotifications((prev) => [mapped, ...prev]);
    });
    socket.on("connect_error", (err) => console.error("Socket connection error:", err));
    return () => {
      socket.disconnect();
    };
  }, []);

  // Organization CRUD
  const getOrganization = (id) => organizations.find(o => o.id === id);
  const addOrganization = (org) => {
    setOrganizations([...organizations, { ...org, id: Date.now().toString() }]);
  };
  const updateOrganization = (id, updatedOrg) => {
    setOrganizations(organizations.map(o => o.id === id ? { ...o, ...updatedOrg } : o));
  };
  const deleteOrganization = (id) => {
    setOrganizations(organizations.filter(o => o.id !== id));
  };

  // Fleet Manager CRUD
  const getFleetManager = (id) => fleetManagers.find(m => m.id === id);
  const addFleetManager = (manager) => {
    setFleetManagers([...fleetManagers, { ...manager, id: Date.now().toString(), created: new Date().toLocaleDateString() }]);
  };
  const updateFleetManager = (id, updatedManager) => {
    setFleetManagers(fleetManagers.map(m => m.id === id ? { ...m, ...updatedManager } : m));
  };
  const deleteFleetManager = (id) => {
    setFleetManagers(fleetManagers.filter(m => m.id !== id));
  };

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
      fetchNotifications,
      markAllAsRead,
      markAsRead,
      adminProfile,
      setAdminProfile
    }}>
      {children}
    </AdminContext.Provider>
  );
}
