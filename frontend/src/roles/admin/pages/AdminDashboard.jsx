import { useState } from "react";
import Home from "@/roles/admin/pages/Home";
import Performance from "@/roles/admin/pages/Performance";
import About from "@/roles/admin/pages/About";
import Contact from "@/roles/admin/pages/Contact";

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


