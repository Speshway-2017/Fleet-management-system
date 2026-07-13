import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "@/api/adminApi";

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const response = await adminApi.getNotifications();
      const rawData = response.data?.data || response.data || [];
      
      const formatted = rawData.map(n => {
        const date = new Date(n.createdAt);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let group = "OLDER";
        if (diffDays === 0) group = "TODAY";
        else if (diffDays === 1) group = "YESTERDAY";

        let timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays > 1) {
          timeStr = date.toLocaleDateString();
        } else if (diffDays === 0 && diffMs < 1000 * 60 * 60) {
           const mins = Math.floor(diffMs / (1000 * 60));
           timeStr = mins <= 1 ? "Just now" : `${mins} min ago`;
        } else if (diffDays === 0) {
           const hrs = Math.floor(diffMs / (1000 * 60 * 60));
           timeStr = `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        }
        
        return {
          id: n._id,
          title: n.title,
          description: n.message,
          time: timeStr,
          type: n.type || 'bell',
          unread: !n.isRead,
          group
        };
      });
      setNotifications(formatted);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotificationsError("Failed to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await adminApi.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
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
  }, []);



  return (
    <AdminContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,
      organizations,
      fetchOrganizations,
      
      fleetManagers,
      fetchFleetManagers,

      notifications,
      notificationsLoading,
      notificationsError,
      fetchNotifications,
      setNotifications,
      markAllAsRead,
      markAsRead,
      deleteNotification
    }}>
      {children}
    </AdminContext.Provider>
  );
}
