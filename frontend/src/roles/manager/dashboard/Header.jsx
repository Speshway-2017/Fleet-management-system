import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, User, LogOut, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function Header({ onMenuToggle, showMenuButton = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between transition-shadow duration-300 ${
      isScrolled ? "shadow-md" : "shadow-none"
    }`}>
      {/* Mobile Menu Toggler and Title */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl focus:outline-none transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h2 className="font-poppins font-semibold text-lg text-[#1B2430]">
          Manager Workspace
        </h2>
      </div>

      {/* Notifications & Profile Area */}
      <div className="flex items-center gap-6">
        
        {/* Bell Button */}
        <div className="relative">
          <button
            onClick={() => navigate("/manager/notifications")}
            className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none transition-colors duration-150"
            title="View all notifications"
          >
            <Bell className="w-5.5 h-5.5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#B45A0A] border-2 border-white rounded-full pulsing-dot" />
          </button>
        </div>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
            }}
            className="flex items-center gap-3 p-1 hover:bg-gray-100 rounded-2xl focus:outline-none transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#B45A0A]/10 border border-[#B45A0A]/20 flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-[#B45A0A]" />
            </div>
            <div className="hidden sm:block text-left leading-tight pr-1">
              <p className="font-poppins font-semibold text-sm text-[#1B2430] leading-none">
                {user?.name || "Alex Thompson"}
              </p>
              <span className="text-[10px] text-[#6B7280] font-nunito font-medium mt-0.5 block">
                Fleet Manager
              </span>
            </div>
            <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-3.5 w-48 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-40 font-poppins text-sm">
                <div className="px-4 py-2.5 border-b border-gray-100 sm:hidden">
                  <p className="font-semibold text-sm text-[#1B2430]">{user?.name || "Alex Thompson"}</p>
                  <span className="text-xs text-[#6B7280]">Fleet Manager</span>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/manager/profile");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
