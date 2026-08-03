import { useState } from "react";
import driverApi from "../api/driverApi";
import { toast } from "react-hot-toast";
import { Truck, KeyRound, UserCheck, ArrowRight, ShieldCheck } from "lucide-react";

export default function DriverLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter email/phone/employee ID and password");
      return;
    }

    setLoading(true);
    try {
      const res = await driverApi.login({ identifier, password });
      if (res?.success && res.data) {
        const { token, driver } = res.data;
        const normalizedUser = {
          ...driver,
          role: "DRIVER",
        };

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        toast.success(`Welcome back, ${driver.name || "Driver"}!`);
        window.location.href = "/driver/dashboard";
      } else {
        toast.error(res?.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-nunito relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0F0F10] border border-[#1B1B1D] p-3 shadow-md flex items-center justify-center text-[#B45A0A]">
            <Truck className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold font-poppins text-slate-900 tracking-tight">
          Driver Portal Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Access your trips, assigned vehicle, fuel entries & live tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-sm rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700 tracking-wider">
                Email / Phone Number / Employee ID
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. driver@fleet.com or EMP-102"
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700 tracking-wider">
                Password
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] text-sm transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold font-poppins text-white bg-[#B45A0A] hover:bg-[#9A4D08] focus:outline-none disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#B45A0A]" />
              <span>Secured by Fleet Management System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
