import { useState, useEffect, useRef } from "react";
import {
  Phone,
  MessageSquare,
  Send,
  User,
  Check,
  CheckCheck,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  History,
  ShieldAlert,
  Loader2,
  Truck,
  Hash,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import { getSocket } from "@/api/socket";
import { useAuth } from "@/context/AuthContext";
import { managerApi } from "../api/managerApi";
import { formatEmployeeId } from "@/utils/employeeIdFormatter";

export default function TripCommunicationSection({ trip }) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState("chat"); // 'chat' or 'calls'

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [driverTyping, setDriverTyping] = useState(false);
  const [driverOnline, setDriverOnline] = useState(true);

  // Call state
  const [callHistory, setCallHistory] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [activeCallModal, setActiveCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState("idle"); // 'ringing', 'connected', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const callTimerRef = useRef(null);
  const callStartTimeRef = useRef(null);

  const isReadOnly = trip?.status === "Completed" || trip?.status === "Cancelled";
  const driverName = trip?.driverName || trip?.driver?.name || trip?.driver?.fullName || "Assigned Driver";
  const driverPhone = trip?.driverPhone || trip?.driver?.phone || trip?.driver?.phoneNumber || "N/A";
  const driverEmpId = formatEmployeeId(trip?.driver?.employeeId || trip?.driver?.driverId);
  const vehicleNumber = trip?.vehiclePlate || trip?.vehicle?.registrationNumber || trip?.vehicleName || "N/A";
  const tripId = trip?._id;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // 1. Fetch Chat & Call History
  const fetchChatHistory = async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const res = await managerApi.getTripChat(tripId, true);
      const data = res.data?.data || res.data || {};
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch trip chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalls = async () => {
    if (!tripId) return;
    try {
      setLoadingCalls(true);
      const res = await managerApi.getTripCallHistory(tripId);
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setCallHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch call history:", err);
    } finally {
      setLoadingCalls(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchChatHistory();
      fetchCalls();
    }
  }, [tripId]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  // 2. Real-Time Socket.IO Integration
  useEffect(() => {
    if (!tripId) return;
    const socket = getSocket();

    socket.emit("joinTripRoom", tripId);
    if (user?._id || user?.id) {
      socket.emit("joinManagerRoom", user._id || user.id);
    }

    const handleNewMessage = (msg) => {
      if (String(msg.tripId) === String(tripId)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
          return [...prev, msg];
        });
        scrollToBottom();

        if (msg.senderRole === "Driver") {
          managerApi.markTripMessagesRead(tripId).catch(console.error);
        }
      }
    };

    const handleTypingStatus = ({ tripId: tId, senderRole, isTyping }) => {
      if (String(tId) === String(tripId) && senderRole === "Driver") {
        setDriverTyping(isTyping);
      }
    };

    const handleMessagesRead = ({ tripId: tId }) => {
      if (String(tId) === String(tripId)) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true, deliveryStatus: "read" }))
        );
      }
    };

    socket.on("chat:new-message", handleNewMessage);
    socket.on("chat:typing-status", handleTypingStatus);
    socket.on("chat:messages-read", handleMessagesRead);

    return () => {
      socket.emit("leaveTripRoom", tripId);
      socket.off("chat:new-message", handleNewMessage);
      socket.off("chat:typing-status", handleTypingStatus);
      socket.off("chat:messages-read", handleMessagesRead);
    };
  }, [tripId, user]);

  // 3. Message Handlers
  const handleInputChange = (e) => {
    if (isReadOnly) return;
    const val = e.target.value;
    if (val.length <= 500) {
      setInputMessage(val);

      const socket = getSocket();
      socket.emit("chat:typing", { tripId, senderRole: "Manager", isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat:typing", { tripId, senderRole: "Manager", isTyping: false });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (isReadOnly || !inputMessage.trim() || sending) return;

    const msgText = inputMessage.trim();
    if (msgText.length > 500) {
      toast.error("Message exceeds maximum length of 500 characters.");
      return;
    }

    try {
      setSending(true);
      setInputMessage("");

      const socket = getSocket();
      socket.emit("chat:typing", { tripId, senderRole: "Manager", isTyping: false });

      const res = await managerApi.sendTripMessage(tripId, {
        message: msgText,
        messageType: "text"
      });

      const newMsg = res.data?.data || res.data;
      if (newMsg) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(newMsg._id))) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 4. In-App Call Simulation Handlers
  const handleStartCall = () => {
    if (isReadOnly) {
      toast.error("Calls are disabled for completed or cancelled trips.");
      return;
    }
    setActiveCallModal(true);
    setCallStatus("ringing");
    setCallDuration(0);
    callStartTimeRef.current = new Date();

    const socket = getSocket();
    socket.emit("call:initiate", {
      tripId,
      callerRole: "Manager",
      callerName: user?.name || "Fleet Manager",
      receiverId: trip?.driver?._id || trip?.driver
    });

    setTimeout(() => {
      setCallStatus("connected");
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 3000);
  };

  const handleEndCall = async () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    const duration = callDuration;
    const finalStatus = callStatus === "ringing" ? "missed" : "completed";

    setCallStatus("ended");

    try {
      await managerApi.saveTripCallLog(tripId, {
        callerRole: "Manager",
        duration,
        status: finalStatus,
        startedAt: callStartTimeRef.current || new Date(),
        endedAt: new Date()
      });
      fetchCalls();
      fetchChatHistory();
    } catch (err) {
      console.error("Failed to log call:", err);
    } finally {
      setTimeout(() => {
        setActiveCallModal(false);
        setCallStatus("idle");
        setCallDuration(0);
      }, 1000);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatCallDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 font-nunito animate-fade-in">

      {/* Driver Information Card & Call Action */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
          {/* Driver Avatar */}
          <div className="relative">
            <div className="w-14 h-14 bg-[#B45A0A] rounded-2xl flex items-center justify-center font-black text-xl text-white font-poppins shadow-md">
              {driverName.charAt(0).toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                driverOnline ? "bg-emerald-500" : "bg-gray-400"
              }`}
              title={driverOnline ? "Driver Online" : "Driver Offline"}
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-poppins">Driver Name</span>
              <span className="font-bold text-[#1E293B] text-sm block font-poppins mt-0.5">{driverName}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-poppins">Employee ID</span>
              <span className="font-semibold text-gray-700 block mt-0.5">{driverEmpId}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-poppins">Phone Number</span>
              <span className="font-bold text-[#1E293B] block mt-0.5">{driverPhone}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-poppins">Vehicle Number</span>
              <span className="font-bold text-[#1E293B] block mt-0.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{vehicleNumber}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-poppins">Trip ID</span>
              <span className="font-bold text-indigo-600 block mt-0.5">{trip?.tripNumber}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block font-poppins">Status / Presence</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  trip?.status === "In Progress" ? "bg-amber-50 text-[#B45A0A] border border-amber-100" :
                  trip?.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                  "bg-indigo-50 text-indigo-700 border border-indigo-100"
                }`}>
                  {trip?.status}
                </span>
                <span className={`text-[10px] font-bold ${driverOnline ? "text-emerald-600" : "text-gray-400"}`}>
                  {driverOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Driver Button */}
        <button
          onClick={handleStartCall}
          disabled={isReadOnly}
          className={`px-5 py-3 rounded-xl text-xs font-bold font-poppins flex items-center gap-2 transition-all shadow-md shrink-0 ${
            isReadOnly
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer shadow-emerald-600/20"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Call Driver</span>
        </button>
      </div>

      {/* Main Communication Module Card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col">
        
        {/* Module Sub-Header & Tabs */}
        <div className="px-6 py-4 border-b border-[#E7EAF0] bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="font-poppins font-bold text-sm text-white">Enterprise Communication Workspace</h3>
          </div>

          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-white/10 text-xs font-poppins font-bold">
            <button
              onClick={() => setActiveSubTab("chat")}
              className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "chat" ? "bg-[#B45A0A] text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Conversation</span>
            </button>
            <button
              onClick={() => setActiveSubTab("calls")}
              className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "calls" ? "bg-[#B45A0A] text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Call Records</span>
            </button>
          </div>
        </div>

        {/* Read-Only Notice Banner */}
        {isReadOnly && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2 text-amber-800 text-xs font-medium font-poppins">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>
              This trip is <strong>{trip?.status}</strong>. Communication log is saved in read-only mode and sending new messages is disabled.
            </span>
          </div>
        )}

        {/* Sub-Tab 1: Chat Stream */}
        {activeSubTab === "chat" && (
          <div className="flex flex-col min-h-[520px]">
            
            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/60 custom-scrollbar max-h-[560px]">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="w-7 h-7 animate-spin text-[#B45A0A]" />
                  <span className="text-xs font-semibold font-poppins">Loading trip conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3 text-center">
                  <div className="p-4 bg-orange-50 text-[#B45A0A] rounded-2xl shadow-2xs">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-bold text-[#1E293B] font-poppins mt-1">
                    No conversation has been started for this trip.
                  </p>
                  <p className="text-xs text-gray-400 max-w-sm font-medium">
                    Send dispatch updates, check route conditions, or instruct {driverName} directly for trip {trip?.tripNumber}.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isManager = m.senderRole === "Manager";
                  const isSystem = m.senderRole === "System" || m.messageType === "system" || m.messageType === "call_log";

                  if (isSystem) {
                    return (
                      <div key={m._id || m.timestamp} className="flex justify-center my-3">
                        <span className="px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 font-poppins shadow-2xs">
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m._id || m.timestamp}
                      className={`flex flex-col ${isManager ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                          isManager
                            ? "bg-[#B45A0A] text-white rounded-br-none"
                            : "bg-white text-[#1E293B] border border-[#E7EAF0] rounded-bl-none"
                        }`}
                      >
                        <p className={`text-[10px] font-bold mb-1.5 ${isManager ? "text-orange-200" : "text-[#B45A0A]"}`}>
                          {isManager ? "Manager" : m.senderName || driverName}
                        </p>

                        <p className="whitespace-pre-wrap font-medium select-text">{m.message}</p>

                        <div
                          className={`flex items-center justify-end gap-1.5 mt-2 text-[9px] ${
                            isManager ? "text-orange-200" : "text-gray-400"
                          }`}
                        >
                          <span>{formatTime(m.timestamp)}</span>
                          {isManager && (
                            <span title={m.isRead ? "Read by driver" : "Sent"}>
                              {m.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                              ) : (
                                <Check className="w-3.5 h-3.5 opacity-80" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {driverTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium font-poppins italic animate-pulse">
                  <div className="w-2.5 h-2.5 bg-[#B45A0A] rounded-full animate-ping" />
                  <span>{driverName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-5 border-t border-[#E7EAF0] bg-white flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  disabled={isReadOnly || sending}
                  placeholder={isReadOnly ? "Trip completed/cancelled. Communication is read-only." : "Type a message..."}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-5 py-3 bg-slate-50 border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] font-medium focus:outline-none focus:border-[#B45A0A] disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xs"
                />

                <button
                  type="submit"
                  disabled={isReadOnly || !inputMessage.trim() || sending}
                  className={`px-6 py-3 rounded-xl font-poppins text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md shrink-0 ${
                    isReadOnly || !inputMessage.trim() || sending
                      ? "bg-gray-300 cursor-not-allowed opacity-60 shadow-none"
                      : "bg-[#B45A0A] hover:bg-[#9A4D08] active:scale-95 shadow-[#B45A0A]/20 cursor-pointer"
                  }`}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send</span>
                </button>
              </div>

              {!isReadOnly && (
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold px-1 select-none mt-1">
                  <span>Press Enter to send message</span>
                  <span className={inputMessage.length > 450 ? "text-amber-600 font-bold" : ""}>
                    {inputMessage.length}/500
                  </span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Sub-Tab 2: Call Records */}
        {activeSubTab === "calls" && (
          <div className="p-6 min-h-[520px] bg-slate-50/50">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider mb-4">
              Call Log History for Trip {trip?.tripNumber}
            </h4>

            {loadingCalls ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#B45A0A]" />
                <span className="text-xs font-semibold">Loading call history...</span>
              </div>
            ) : callHistory.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3 text-center">
                <PhoneCall className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-bold text-[#1E293B] font-poppins">No call history recorded for this trip</p>
                <p className="text-xs text-gray-400 max-w-sm font-medium">
                  Use the "Call Driver" button above to initiate voice calls.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl">
                {callHistory.map((call) => (
                  <div
                    key={call._id || call.startedAt}
                    className="bg-white p-4 rounded-2xl border border-[#E7EAF0] shadow-2xs flex items-center justify-between font-poppins"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          call.status === "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {call.status === "completed" ? (
                          <PhoneCall className="w-5 h-5" />
                        ) : (
                          <PhoneOff className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-xs text-[#1E293B]">
                          {call.callerRole === "Manager" ? `Outgoing Call to ${driverName}` : `Incoming Call from ${driverName}`}
                        </p>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {new Date(call.startedAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          call.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {call.status}
                      </span>
                      <span className="text-xs font-bold text-gray-700 block mt-1">
                        Duration: {formatCallDuration(call.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Simulated Live Call Modal */}
      {activeCallModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-6 animate-scale-up">
            
            <div className="relative">
              <div className="w-20 h-20 bg-[#B45A0A] rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-xl animate-pulse">
                {driverName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-orange-500/40 animate-ping pointer-events-none" />
            </div>

            <div>
              <h3 className="font-poppins font-bold text-lg text-white">{driverName}</h3>
              <p className="text-xs text-orange-400 font-semibold mt-1 uppercase tracking-wider font-poppins">
                {callStatus === "ringing" ? "Calling Driver..." : callStatus === "connected" ? "Call Connected" : "Ending Call..."}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-2 font-bold">
                {callStatus === "connected" ? formatCallDuration(callDuration) : "Trip: " + trip?.tripNumber}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isMuted ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-slate-800 border-slate-700 text-gray-300 hover:text-white"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
