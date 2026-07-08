import React, { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Organization Registered",
      description: "Peak Freight Co. completed registration and is pending approval.",
      time: "2 min ago",
      type: "bell",
      unread: true,
      group: "TODAY"
    },
    {
      id: 2,
      title: "Fleet Manager Activated",
      description: "Emma Wilson from Global Express accepted the invite and is now active.",
      time: "15 min ago",
      type: "success",
      unread: true,
      group: "TODAY"
    },
    {
      id: 3,
      title: "Subscription Expiring Soon",
      description: "ABC Logistics Enterprise plan expires in 7 days. Renewal required.",
      time: "1 hour ago",
      type: "warning",
      unread: true,
      group: "TODAY"
    },
    {
      id: 4,
      title: "Failed Login Attempt",
      description: "5 consecutive failed logins detected from IP 203.0.113.0. Account temporarily locked.",
      time: "2 hours ago",
      type: "danger",
      unread: true,
      group: "TODAY"
    },
    {
      id: 5,
      title: "System Maintenance Scheduled",
      description: "Planned maintenance window: Sunday 02:00-04:00 AM. Expect brief downtime.",
      time: "5 hours ago",
      type: "system",
      unread: false,
      group: "TODAY"
    },
    {
      id: 6,
      title: "Organization Activated",
      description: "VRL Freight has been successfully activated after KYC verification.",
      time: "Yesterday",
      type: "success",
      unread: false,
      group: "YESTERDAY"
    },
    {
      id: 7,
      title: "Monthly Report Ready",
      description: "Your fleet performance summary for June is now available to download.",
      time: "Yesterday",
      type: "bell",
      unread: false,
      group: "YESTERDAY"
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const [organizations, setOrganizations] = useState([
    {
      id: "1",
      name: "ABC Logistics",
      email: "contact@abclogistics.com",
      phone: "+1 555-0101",
      industry: "Freight",
      size: "100-500",
      subscription: "Premium",
      status: "Active",
      fleetSize: 145,
      activeManagers: 12,
      createdAt: "Jan 15, 2024",
      lastBilling: "Jun 01, 2024",
      initials: "AB",
    },
    {
      id: "2",
      name: "XYZ Transport",
      email: "info@xyztransport.com",
      phone: "+1 555-0102",
      industry: "Delivery",
      size: "50-100",
      subscription: "Basic",
      status: "Active",
      fleetSize: 68,
      activeManagers: 4,
      createdAt: "Feb 22, 2024",
      lastBilling: "May 22, 2024",
      initials: "XY",
    },
    {
      id: "3",
      name: "VRL Freight",
      email: "support@vrlfreight.com",
      phone: "+1 555-0103",
      industry: "Long Haul",
      size: "500+",
      subscription: "Enterprise",
      status: "Active",
      fleetSize: 320,
      activeManagers: 24,
      createdAt: "Mar 10, 2024",
      lastBilling: "Jun 10, 2024",
      initials: "VR",
    }
  ]);

  const [fleetManagers, setFleetManagers] = useState([
    {
      id: "1",
      name: "James Carter",
      email: "j.carter@abclogistics.com",
      phone: "+1 555-0101",
      org: "ABC Logistics",
      role: "Fleet Manager",
      status: "Active",
      lastLogin: "2 hours ago",
      created: "Jan 15, 2024",
      initials: "JC"
    },
    {
      id: "2",
      name: "Sarah Miller",
      email: "s.miller@xyztransport.com",
      phone: "+1 555-0102",
      org: "XYZ Transport",
      role: "Dispatcher",
      status: "Active",
      lastLogin: "1 day ago",
      created: "Feb 22, 2024",
      initials: "SM"
    },
    {
      id: "3",
      name: "David Chen",
      email: "d.chen@vrlfreight.com",
      phone: "+1 555-0103",
      org: "VRL Freight",
      role: "Admin",
      status: "Invited",
      lastLogin: "Never",
      created: "May 10, 2024",
      initials: "DC"
    }
  ]);

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
      getOrganization,
      addOrganization,
      updateOrganization,
      deleteOrganization,
      
      fleetManagers,
      getFleetManager,
      addFleetManager,
      updateFleetManager,
      deleteFleetManager,

      notifications,
      setNotifications,
      markAllAsRead,
      markAsRead
    }}>
      {children}
    </AdminContext.Provider>
  );
}
