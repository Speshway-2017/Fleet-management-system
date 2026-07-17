import { useState, useEffect, useRef } from "react";
import { X, Send, Phone, User, Check, Clock } from "lucide-react";

export default function DriverChatDrawer({
  isOpen,
  onClose,
  driverName = "Marcus Read",
  driverPhone = "+91 98765 43210",
  initialMessages = []
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
      } else {
        // Default conversation history matching the alert context
        setMessages([
          {
            id: 1,
            sender: "driver",
            text: "Hi, I have started the trip from Pune Hub.",
            time: "10:15 AM",
          },
          {
            id: 2,
            sender: "manager",
            text: "Safe travels! Please keep checking speed compliance on the bypass.",
            time: "10:17 AM",
          },
          {
            id: 3,
            sender: "driver",
            text: "Sure, will keep it under limit.",
            time: "10:18 AM",
          }
        ]);
      }
    }
  }, [isOpen, initialMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    // Add manager message
    const newMsg = {
      id: Date.now(),
      sender: "manager",
      text,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputValue("");

    // Simulate driver typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let driverReplyText = "Understood. I will comply immediately.";
      
      // Smart contextual responses
      const lowerText = text.toLowerCase();
      if (lowerText.includes("speed") || lowerText.includes("slow")) {
        driverReplyText = "Yes, sorry about that. Had to overtake a slow vehicle on the climb. I am staying strictly below the limit now.";
      } else if (lowerText.includes("status") || lowerText.includes("where")) {
        driverReplyText = "Just crossed the Toll Plaza, heading towards Mumbai. Roads are clear.";
      } else if (lowerText.includes("fuel") || lowerText.includes("refuel")) {
        driverReplyText = "I will stop at the next HP station for refueling and share the slip.";
      } else if (lowerText.includes("document") || lowerText.includes("permit")) {
        driverReplyText = "Yes, I have the physical copies. I will check why the upload shows pending.";
      }

      const replyMsg = {
        id: Date.now() + 1,
        sender: "driver",
        text: driverReplyText,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1800);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs select-none">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body */}
      <div className="w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right relative">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getInitials(driverName)}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-sm leading-tight text-white">{driverName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider font-poppins">Online</span>
                <span className="text-gray-400">•</span>
                <span className="text-[10px] text-gray-400 font-semibold">{driverPhone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a 
              href={`tel:${driverPhone}`}
              title="Call Driver"
              className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
          {messages.map((msg) => {
            const isManager = msg.sender === "manager";
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isManager ? "justify-end" : "justify-start"}`}
              >
                {!isManager && (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                    {getInitials(driverName)}
                  </div>
                )}
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed font-nunito ${
                      isManager
                        ? "bg-[#C65D0E] text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider ${
                      isManager ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{msg.time}</span>
                    {isManager && <Check className="w-3 h-3 text-green-500" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                {getInitials(driverName)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">Driver is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <button 
            onClick={() => handleSend("Please stay alert and stay speed compliant.")}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Speed Compliance
          </button>
          <button 
            onClick={() => handleSend("Share your current GPS location status.")}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Request Location
          </button>
          <button 
            onClick={() => handleSend("Check if you need refueling soon.")}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Fuel Status
          </button>
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#C65D0E] font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-[#C65D0E] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
