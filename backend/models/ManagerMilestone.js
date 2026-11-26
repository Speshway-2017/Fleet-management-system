import mongoose from 'mongoose';

const milestoneDetailSchema = new mongoose.Schema({
  reviewSubmitted: { type: Boolean, default: false },
  reminderCount: { type: Number, default: 0 },
  nextPopupTrip: { type: Number, default: 0 },
  lastTripTriggered: { type: Number, default: 0 }
}, { _id: false });

const managerMilestoneSchema = new mongoose.Schema(
  {
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tripMilestones: {
      10: { type: milestoneDetailSchema, default: () => ({}) },
      50: { type: milestoneDetailSchema, default: () => ({}) },
      100: { type: milestoneDetailSchema, default: () => ({}) }
    }
  },
  { timestamps: true }
);

export default mongoose.model('ManagerMilestone', managerMilestoneSchema);
