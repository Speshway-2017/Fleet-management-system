import express from 'express';
import Blog from '../models/Blog.js';
import About from '../models/About.js';
import Settings from '../models/Settings.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

// GET /api/public/blogs
router.get('/blogs', async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, blogs, 'Blogs fetched successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/public/settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    const data = settings || { platformName: 'Fleet Management', logoUrl: '/logo.png' };
    return sendSuccess(res, 200, data, 'Settings fetched successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/public/about
router.get('/about', async (req, res, next) => {
  try {
    let about = await About.findOne();
    if (!about) {
      // Create default if somehow deleted or not seeded yet
      about = new About({
        storyTitle: "Built for Fleet Operators, by Logistics Experts",
        storyContent: [
          "Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.",
          "Our team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface."
        ],
        missionTitle: "Eliminating Blind Spots in Fleet Operations",
        missionContent: [
          "Every year, inefficient fleet management costs businesses billions in wasted resources, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.",
          "FleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork."
        ],
        missionQuote: "The only way to run a fleet well is to see it clearly.",
        statsFounded: "2018",
        statsEnterprises: "340+",
        statsVehicles: "1.2M+",
        statsSavings: "$180M+",
        timeline: [
          { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
          { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
          { year: "2021", text: "Series A — ₹200 Cr. Expanded to reporting & analytics and driver management." },
          { year: "2023", text: "Surpassed 1M vehicles tracked. Launched performance monitoring cloud platform." },
          { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." }
        ]
      });
      await about.save();
    }
    return sendSuccess(res, 200, about, 'About details fetched successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/public/trips/:id/report
router.get('/trips/:id/report', async (req, res, next) => {
  try {
    const Trip = (await import('../models/Trip.js')).default;
    const Vehicle = (await import('../models/Vehicle.js')).default;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).send('<h1>Trip not found</h1>');
    }

    const tripNumber = trip.tripNumber || trip._id;
    const startLocation = trip.startLocation || trip.pickup || 'N/A';
    const endLocation = trip.endLocation || trip.destination || 'N/A';
    
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        const dt = new Date(dateStr);
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };
    
    const formatTime = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        const dt = new Date(dateStr);
        return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch (e) {
        return dateStr;
      }
    };

    const actualStartTime = trip.actualStartTime ? `${formatDate(trip.actualStartTime)} ${formatTime(trip.actualStartTime)}` : 'N/A';
    const actualEndTime = trip.actualEndTime ? `${formatDate(trip.actualEndTime)} ${formatTime(trip.actualEndTime)}` : 'N/A';
    const distance = trip.actualDistance ? `${trip.actualDistance} KM` : (trip.estimatedDistance ? `${trip.estimatedDistance} KM` : 'N/A');
    const cargoType = trip.cargoType || 'General Cargo';
    const cargoWeight = trip.cargoWeight ? `${trip.cargoWeight} kg` : 'N/A';
    
    // Unpack vehicle
    let vehicleName = 'N/A';
    let vehiclePlate = 'N/A';
    if (trip.vehicle) {
      const veh = await Vehicle.findById(trip.vehicle);
      if (veh) {
        vehicleName = veh.brand || veh.model || 'N/A';
        vehiclePlate = veh.vehicleNumber || veh.registrationNumber || 'N/A';
      }
    }
    if (vehicleName === 'N/A' && trip.vehicleName) vehicleName = trip.vehicleName;
    if (vehiclePlate === 'N/A' && trip.vehiclePlate) vehiclePlate = trip.vehiclePlate;

    const driverName = trip.driverName || 'N/A';
    const driverPhone = trip.driverPhone || 'N/A';
    const totalTolls = trip.tollsAmount || trip.totalTollsAmount || 0;
    const receiverName = trip.receiverName || 'Verified Receiver';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Trip Report ${tripNumber}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; line-height: 1.4; }
    .report-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); border-radius: 8px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #101c2c; }
    .logo span { color: #f97316; }
    .company-details { text-align: right; font-size: 12px; color: #666; }
    .report-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-size: 12px; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-weight: bold; color: #4b5563; font-size: 10px; text-transform: uppercase; }
    .meta-val { font-weight: bold; color: #111827; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; color: #101c2c; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; }
    .detail-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .detail-label { color: #666; }
    .detail-val { font-weight: bold; color: #333; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="report-box">
    <div class="header">
      <div class="logo">Speshway <span>Logistics</span></div>
      <div class="company-details">
        <strong>Speshway Logistics Pvt Ltd</strong><br>
        Plot 45, Industrial Depot, Sector 3<br>
        Pune, Maharashtra, 411018<br>
        Phone: +91 20 5566 7788 | support@speshway.com
      </div>
    </div>
    
    <div class="report-meta">
      <div class="meta-item">
        <span class="meta-label">Trip Number</span>
        <span class="meta-val">${tripNumber}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Report Date</span>
        <span class="meta-val">${new Date().toISOString().split('T')[0]}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Total Distance</span>
        <span class="meta-val">${distance}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-val">Completed</span>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">Trip Details</div>
        <div class="detail-row"><span class="detail-label">Start Location</span><span class="detail-val">${startLocation}</span></div>
        <div class="detail-row"><span class="detail-label">End Location</span><span class="detail-val">${endLocation}</span></div>
        <div class="detail-row"><span class="detail-label">Start Time</span><span class="detail-val">${actualStartTime}</span></div>
        <div class="detail-row"><span class="detail-label">End Time</span><span class="detail-val">${actualEndTime}</span></div>
        <div class="detail-row"><span class="detail-label">Cargo Type</span><span class="detail-val">${cargoType}</span></div>
        <div class="detail-row"><span class="detail-label">Cargo Weight</span><span class="detail-val">${cargoWeight}</span></div>
      </div>
      
      <div>
        <div class="section-title">Asset & Driver Information</div>
        <div class="detail-row"><span class="detail-label">Vehicle Name</span><span class="detail-val">${vehicleName}</span></div>
        <div class="detail-row"><span class="detail-label">Registration Number</span><span class="detail-val">${vehiclePlate}</span></div>
        <div class="detail-row"><span class="detail-label">Driver Name</span><span class="detail-val">${driverName}</span></div>
        <div class="detail-row"><span class="detail-label">Driver Phone</span><span class="detail-val">${driverPhone}</span></div>
        <div class="detail-row"><span class="detail-label">Receiver Name</span><span class="detail-val">${receiverName}</span></div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">Financial Summary</div>
        <div class="detail-row"><span class="detail-label">Tolls Cost</span><span class="detail-val">₹${totalTolls}</span></div>
      </div>
    </div>

    <div class="footer">
      This is a secure system-generated Completed Trip Report from Speshway Logistics.
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlContent);
  } catch (error) {
    next(error);
  }
});

export default router;
