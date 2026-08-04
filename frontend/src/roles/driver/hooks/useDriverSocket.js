import { useEffect, useRef } from "react";
import { getSocket } from "@/api/socket";
import { useAuth } from "@/context/AuthContext";

export function useDriverSocket({
  onTripAssigned,
  onTripStatusUpdated,
  onTicketStatusUpdated,
  onNotification,
  on15MinReminder
} = {}) {
  const { user } = useAuth();
  const driverId = user?._id || user?.id;

  const callbacksRef = useRef({});
  callbacksRef.current = {
    onTripAssigned,
    onTripStatusUpdated,
    onTicketStatusUpdated,
    onNotification,
    on15MinReminder
  };

  useEffect(() => {
    if (!driverId) return;

    const socket = getSocket();

    const handleConnect = () => {
      socket.emit("joinRoleRoom", "DRIVER");
      socket.emit("joinDriverRoom", driverId);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    const handleTripAssigned = (data) => {
      if (callbacksRef.current.onTripAssigned) callbacksRef.current.onTripAssigned(data);
    };

    const handleTripStatus = (data) => {
      if (callbacksRef.current.onTripStatusUpdated) callbacksRef.current.onTripStatusUpdated(data);
    };

    const handleTicketStatus = (data) => {
      if (callbacksRef.current.onTicketStatusUpdated) callbacksRef.current.onTicketStatusUpdated(data);
      else if (callbacksRef.current.onTripStatusUpdated) callbacksRef.current.onTripStatusUpdated(data);
    };

    const handleNewNotification = (data) => {
      if (callbacksRef.current.onNotification) callbacksRef.current.onNotification(data);
    };

    const handle15MinReminder = (data) => {
      if (callbacksRef.current.on15MinReminder) callbacksRef.current.on15MinReminder(data);
    };

    socket.on("trip:assigned", handleTripAssigned);
    socket.on("trip:status-updated", handleTripStatus);
    socket.on("trip:completed", handleTripStatus);
    socket.on("ticket:status-updated", handleTicketStatus);
    socket.on("notification:new", handleNewNotification);
    socket.on("trip:15min-reminder", handle15MinReminder);
    socket.on("pod:rejected", handleTripStatus);
    socket.on("weighbridge:rejected", handleTripStatus);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("trip:assigned", handleTripAssigned);
      socket.off("trip:status-updated", handleTripStatus);
      socket.off("trip:completed", handleTripStatus);
      socket.off("ticket:status-updated", handleTicketStatus);
      socket.off("notification:new", handleNewNotification);
      socket.off("trip:15min-reminder", handle15MinReminder);
      socket.off("pod:rejected", handleTripStatus);
      socket.off("weighbridge:rejected", handleTripStatus);
    };
  }, [driverId]);
}

export default useDriverSocket;
