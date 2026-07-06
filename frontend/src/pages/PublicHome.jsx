import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Home from "@/roles/admin/pages/Home";
import Performance from "@/roles/admin/pages/Performance";
import About from "@/roles/admin/pages/About";
import Contact from "@/roles/admin/pages/Contact";

export default function PublicHome() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === "admin" ? "/admin" : "/manager", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

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
