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

export default router;
