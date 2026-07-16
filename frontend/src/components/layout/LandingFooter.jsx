import { useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import TermsModal from "@/components/common/TermsModal";

export default function LandingFooter() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  return (
    <footer className="bg-[#0B1B3D] text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-gray-800">
        {/* Column 1: Brand Info */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Fleet Management Logo" className="h-9 w-auto object-contain bg-white rounded-lg p-1" />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            <a href="#" onClick={(e) => { e.preventDefault(); handleAction("Facebook"); }} className="text-[#A14000] hover:opacity-80 transition-opacity">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleAction("LinkedIn"); }} className="text-[#A14000] hover:opacity-80 transition-opacity">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleAction("Twitter"); }} className="text-[#A14000] hover:opacity-80 transition-opacity">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleAction("YouTube"); }} className="text-[#A14000] hover:opacity-80 transition-opacity">
              <span className="sr-only">YouTube</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.872.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>
        </div>

        {/* Column 2: QUICK LINKS */}
        <div className="space-y-4">
          <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Quick Links</h5>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li><NavLink to="/" className="hover:text-white transition-colors">Home</NavLink></li>
            <li><NavLink to="/performance" className="hover:text-white transition-colors">Performance</NavLink></li>
            <li><NavLink to="/security" className="hover:text-white transition-colors">Security</NavLink></li>
            <li><NavLink to="/blogs" className="hover:text-white transition-colors">Blogs</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-white transition-colors">Contact Us</NavLink></li>
          </ul>
        </div>

        {/* Column 3: PLATFORM */}
        <div className="space-y-4">
          <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Platform</h5>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Features"); }} className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Security"); }} className="hover:text-white transition-colors">Security</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Integrations"); }} className="hover:text-white transition-colors">Integrations</a></li>
            <li><NavLink to="/pricing" className="hover:text-white transition-colors">Pricing</NavLink></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Documentation"); }} className="hover:text-white transition-colors">Documentation</a></li>
          </ul>
        </div>

        {/* Column 4: COMPANY */}
        <div className="space-y-4">
          <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Company</h5>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li><NavLink to="/about" className="hover:text-white transition-colors">About Us</NavLink></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Careers"); }} className="hover:text-white transition-colors">Careers</a></li>
            <li><NavLink to="/blogs" className="hover:text-white transition-colors">Blogs</NavLink></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Column 5: CONTACT */}
        <div className="space-y-4 text-xs text-gray-400">
          <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Contact Us</h5>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+91 12345 67890</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@fleetmanagement.com</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Hyderabad, Telangana, India</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright and Legal Links */}
      <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 font-medium">
        <div>
          <span>© 2026 Fleet Management. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
}
