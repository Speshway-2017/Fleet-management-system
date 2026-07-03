import { useState } from "react";
import Home from "@/roles/admin/pages/Home";
import Performance from "@/roles/admin/pages/Performance";
import About from "@/roles/admin/pages/About";
import Contact from "@/roles/admin/pages/Contact";

// Development Bypass: Auto-authenticate as Admin on startup so the app loads the admin dashboard directly.
// Overwrites the session if a non-admin role is currently stored in localStorage.
if (import.meta.env.DEV) {
  const storedUser = localStorage.getItem("user");
  let needsSetup = !storedUser;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "admin") {
        needsSetup = true;
      }
    } catch (e) {
      needsSetup = true;
    }
  }

  if (needsSetup) {
    localStorage.setItem("user", JSON.stringify({ name: "Admin User", email: "admin@fleet.com", role: "admin" }));
    localStorage.setItem("token", "dev-mock-token");
    window.location.reload();
  }
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home");

  if (activeTab === "performance") {
    return <Performance setActiveTab={setActiveTab} />;
  }

  if (activeTab === "about") {
    return <About setActiveTab={setActiveTab} />;
  }

  if (activeTab === "contact") {
    return <Contact setActiveTab={setActiveTab} />;
  }

  return <Home setActiveTab={setActiveTab} />;
}


