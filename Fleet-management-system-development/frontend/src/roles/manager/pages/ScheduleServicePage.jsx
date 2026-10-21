import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ScheduleServicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Service schedule creation is disabled for managers. Maintenance tickets can only be raised by drivers.");
    navigate("/manager/maintenance", { replace: true });
  }, [navigate]);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-8 w-8 border-4 border-[#A14000] border-t-transparent rounded-full mb-4" />
      <p className="text-sm font-bold text-slate-600 font-poppins">Redirecting to Maintenance Overview...</p>
    </div>
  );
}
