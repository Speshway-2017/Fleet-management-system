export const mockNotifications = [
  {
    id: 1,
    type: "alert",
    title: "Critical Overspeeding Alert",
    description: "Vehicle #TRK-8821 detected traveling at 95 mph in a 65 mph zone on I-90 Expressway. Immediate intervention recommended.",
    time: "2 mins ago",
    priority: "high",
    iconName: "mdi:alert-octagon",
    bgClass: "bg-red-100 text-red-600",
    coords: [18.7508, 73.4218], // Lonavala
    locationName: "I-90 Expressway, Mile Marker 42.5",
    stats: [
      { label: "Recorded Speed", value: "95 MPH", isCritical: true },
      { label: "Speed Limit", value: "65 MPH", isCritical: false },
      { label: "Duration", value: "04:12 Min", isCritical: false }
    ],
    driver: {
      name: "Marcus Read",
      empId: "#REED442",
      avatar: "MR",
      driveTime: "06:45h",
      safetyScore: "8.4/10",
      phone: "+91 98765 43210"
    },
    vehicle: "#TRK-8821",
    vehicleModel: "Freightliner Cascadia 2023",
    recentAlerts: [
      { title: "Moderate Overspeeding", info: "Today, 08:32 AM • 72 mph" },
      { title: "Refuel Completed", info: "Yesterday, 04:30 PM" }
    ],
    actions: [
      { label: "Dispatch Warning", bg: "bg-red-600", hover: "hover:bg-red-700", actionType: "Dispatch Warning" },
      { label: "View Analytics", bg: "bg-white", text: "text-gray-700", border: "border-gray-300", actionType: "View Analytics" }
    ]
  },
  {
    id: 2,
    type: "warning",
    title: "Geofence Violation",
    description: "Driver Marcus Read has exited the designated delivery zone for the Northeast region. Route optimization required.",
    time: "15 mins ago",
    priority: "medium",
    iconName: "mdi:alert-circle",
    bgClass: "bg-amber-100 text-amber-700",
    coords: [19.0760, 72.8777], // Mumbai
    locationName: "Northeast Region Border, Mumbai Outer Ring Road",
    stats: [
      { label: "Zone Assigned", value: "Northeast", isCritical: false },
      { label: "Current Zone", value: "Western-Ext", isCritical: true },
      { label: "Deviation", value: "4.8 KM", isCritical: false }
    ],
    driver: {
      name: "Marcus Read",
      empId: "#REED442",
      avatar: "MR",
      driveTime: "06:45h",
      safetyScore: "8.4/10",
      phone: "+91 98765 43210"
    },
    vehicle: "#TRK-8821",
    vehicleModel: "Freightliner Cascadia 2023",
    recentAlerts: [
      { title: "Geofence Violation", info: "Today, 02:45 PM • 4.8 km outside" },
      { title: "Excessive Idle", info: "Yesterday, 11:15 AM • 12 mins" }
    ],
    actions: [
      { label: "Call Driver", bg: "bg-amber-700", hover: "hover:bg-amber-800", actionType: "Call Driver" },
      { label: "Track Live", bg: "bg-white", text: "text-gray-700", border: "border-gray-300", actionType: "Track Live" }
    ]
  },
  {
    id: 3,
    type: "info",
    title: "Maintenance Required",
    description: "Vehicle #VAN-402 scheduled for brake pad replacement in 150 miles. Currently active on trip #4492.",
    time: "1 hour ago",
    priority: "medium",
    iconName: "mdi:information",
    bgClass: "bg-blue-100 text-blue-700",
    coords: [28.7041, 77.1025], // Delhi
    locationName: "Delhi Bypass Highway",
    stats: [
      { label: "Brake Wear", value: "88%", isCritical: true },
      { label: "Remaining", value: "150 Miles", isCritical: false },
      { label: "Trip Status", value: "Active", isCritical: false }
    ],
    driver: {
      name: "Ram Kumar",
      empId: "#KUMAR88",
      avatar: "RK",
      driveTime: "04:12h",
      safetyScore: "9.2/10",
      phone: "+91 98765 43210"
    },
    vehicle: "#VAN-402",
    vehicleModel: "Mercedes-Benz Sprinter 2022",
    recentAlerts: [
      { title: "Engine Check Light", info: "Last Week, oil level warning resolved" },
      { title: "Tire Pressure Low", info: "2 days ago • Fixed" }
    ],
    actions: [
      { label: "Schedule Now", bg: "bg-amber-700", hover: "hover:bg-amber-800", actionType: "Schedule Now" }
    ]
  },
  {
    id: 4,
    type: "success",
    title: "Fuel Report Ready",
    description: "Weekly fuel efficiency report for the Southern Fleet has been generated and is ready for review.",
    time: "3 hours ago",
    priority: "low",
    iconName: "mdi:check-circle",
    bgClass: "bg-green-100 text-green-600",
    coords: [12.9716, 77.5946], // Bengaluru
    locationName: "Bengaluru Corporate Hub",
    stats: [
      { label: "Avg Efficiency", value: "6.8 km/l", isCritical: false },
      { label: "Fleet Coverage", value: "100%", isCritical: false },
      { label: "Savings", value: "₹45,200", isCritical: false }
    ],
    driver: {
      name: "Suresh Patel",
      empId: "#PATEL101",
      avatar: "SP",
      driveTime: "05:30h",
      safetyScore: "9.8/10",
      phone: "+91 87654 32109"
    },
    vehicle: "#TRK-9012",
    vehicleModel: "Tata Prima 4028.S 2023",
    recentAlerts: [
      { title: "Fuel Report Generated", info: "Weekly report for Jun 28 - Jul 05" },
      { title: "Auto-Recharge Completed", info: "3 days ago • ₹10,000" }
    ],
    actions: [
      { label: "Download PDF", bg: "bg-black", hover: "hover:bg-gray-800", actionType: "Download PDF" }
    ]
  },
  {
    id: 5,
    type: "system",
    title: "System Update Complete",
    description: "ELD compliance patches have been successfully pushed to all active vehicles in the fleet.",
    time: "6 hours ago",
    priority: "low",
    iconName: "mdi:cloud-sync",
    bgClass: "bg-gray-100 text-gray-600",
    coords: [28.6139, 77.2090], // New Delhi HQ
    locationName: "Fleet Control HQ, New Delhi",
    stats: [
      { label: "Vehicles Updated", value: "450/450", isCritical: false },
      { label: "Status", value: "Success", isCritical: false },
      { label: "Version", value: "v4.2.1", isCritical: false }
    ],
    driver: {
      name: "Alex Thompson",
      empId: "#THOMP01",
      avatar: "AT",
      driveTime: "N/A",
      safetyScore: "10/10",
      phone: "+91 98765 43210"
    },
    vehicle: "All Fleet",
    vehicleModel: "System Compliance Patch",
    recentAlerts: [
      { title: "Patch Push Scheduled", info: "Yesterday, 11:00 PM" },
      { title: "Backup completed", info: "Yesterday, 10:00 PM" }
    ],
    actions: []
  }
];
