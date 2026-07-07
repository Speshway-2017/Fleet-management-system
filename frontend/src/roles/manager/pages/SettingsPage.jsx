import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [twoStep, setTwoStep] = useState(true);
  const [language, setLanguage] = useState("English (United States)");
  const [timezone, setTimezone] = useState("(GMT-05:00) Eastern Time");
  const [units, setUnits] = useState("metric");
  const [notifications, setNotifications] = useState({
    critical: { push: true, email: true, sms: true },
    maintenance: { push: true, email: false, sms: false },
    operational: { push: false, email: true, sms: false },
  });

  const handleNotificationChange = (type, channel) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel],
      },
    }));
  };

  const handleSave = () => {
    toast.success("All settings saved!");
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-500">Manage your professional profile and operational preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2 border border-gray-400 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Security Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
            <Icon icon="mdi:shield-outline" className="w-7 h-7 text-amber-700" />
            <h2 className="text-xl font-bold text-gray-800">Security</h2>
          </div>

          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-800 font-medium">2-Step Verification</p>
              <button
                onClick={() => setTwoStep(!twoStep)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  twoStep ? "bg-amber-700" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    twoStep ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400">Add an extra layer of safety</p>
          </div>

          <div>
            <p className="text-gray-800 font-medium mb-2">Password Management</p>
            <button
              onClick={() => navigate("/manager/change-password")}
              className="w-full py-3 border border-amber-700 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:lock-reset" className="w-5 h-5" />
              Change Password
            </button>
            <p className="text-center text-xs text-gray-300 mt-3">Last updated 45 days ago</p>
          </div>
        </div>

        {/* Regional & Units Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
            <Icon icon="mdi:earth" className="w-7 h-7 text-amber-700" />
            <h2 className="text-xl font-bold text-gray-800">Regional & Units</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 font-medium mb-2">System Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-amber-50 border border-gray-300 rounded-xl text-gray-700 font-medium focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_12px_center]"
              >
                <option>English (United States)</option>
                <option>Spanish (Spain)</option>
                <option>French (France)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 bg-amber-50 border border-gray-300 rounded-xl text-gray-700 font-medium focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_12px_center]"
              >
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT-06:00) Central Time</option>
                <option>(GMT-07:00) Mountain Time</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">Measurement Units</label>
              <div className="flex bg-amber-50 border border-gray-300 rounded-xl p-1">
                <button
                  onClick={() => setUnits("metric")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    units === "metric" ? "bg-white text-amber-700 shadow" : "text-gray-500"
                  }`}
                >
                  Metric (km, kg)
                </button>
                <button
                  onClick={() => setUnits("imperial")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    units === "imperial" ? "bg-white text-amber-700 shadow" : "text-gray-500"
                  }`}
                >
                  Imperial (mi, lbs)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Card */}
      <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
          <Icon icon="mdi:bell-outline" className="w-7 h-7 text-amber-700" />
          <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  Alert Type
                </th>
                <th className="text-center px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  Push
                </th>
                <th className="text-center px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  Email
                </th>
                <th className="text-center px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  SMS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-800 font-medium">Critical Alerts</p>
                    <p className="text-xs text-gray-400">Accidents, major breakdowns, SOS</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.critical.push}
                    onChange={() => handleNotificationChange("critical", "push")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.critical.email}
                    onChange={() => handleNotificationChange("critical", "email")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.critical.sms}
                    onChange={() => handleNotificationChange("critical", "sms")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-800 font-medium">Maintenance Reminders</p>
                    <p className="text-xs text-gray-400">Scheduled servicing, fluid checks</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.maintenance.push}
                    onChange={() => handleNotificationChange("maintenance", "push")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.maintenance.email}
                    onChange={() => handleNotificationChange("maintenance", "email")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.maintenance.sms}
                    onChange={() => handleNotificationChange("maintenance", "sms")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-800 font-medium">Operational Reports</p>
                    <p className="text-xs text-gray-400">Weekly summaries, efficiency data</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.operational.push}
                    onChange={() => handleNotificationChange("operational", "push")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.operational.email}
                    onChange={() => handleNotificationChange("operational", "email")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.operational.sms}
                    onChange={() => handleNotificationChange("operational", "sms")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
