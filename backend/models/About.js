import mongoose from 'mongoose';

const timelineItemSchema = new mongoose.Schema({
  year: { type: String, required: true },
  text: { type: String, required: true },
});

const aboutSchema = new mongoose.Schema(
  {
    storyTitle: { type: String, default: "Built for Fleet Operators, by Logistics Experts" },
    storyContent: { type: [String], default: [] },
    missionTitle: { type: String, default: "Eliminating Blind Spots in Fleet Operations" },
    missionContent: { type: [String], default: [] },
    missionQuote: { type: String, default: "The only way to run a fleet well is to see it clearly." },
    statsFounded: { type: String, default: "2018" },
    statsEnterprises: { type: String, default: "340+" },
    statsVehicles: { type: String, default: "1.2M+" },
    statsSavings: { type: String, default: "$180M+" },
    timeline: { type: [timelineItemSchema], default: [] },
  },
  { timestamps: true }
);

const About = mongoose.model('About', aboutSchema);
export default About;
