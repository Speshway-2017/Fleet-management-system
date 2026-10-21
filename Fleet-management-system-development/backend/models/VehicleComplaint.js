import mongoose from 'mongoose';

const vehicleComplaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: false },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: false },
    vehiclePlate: { type: String, default: '' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, default: '' },
    issueType: { type: String, required: true },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'low', 'medium', 'high', 'critical'],
      default: 'Medium',
      set: (val) => {
        if (!val) return 'Medium';
        const s = val.toString().trim().toLowerCase();
        if (s === 'low') return 'Low';
        if (s === 'medium') return 'Medium';
        if (s === 'high') return 'High';
        if (s === 'critical') return 'Critical';
        return val;
      }
    },
    description: { type: String, required: true, trim: true },
    canContinueTrip: { type: String, enum: ['Yes', 'No', 'After Repair'], default: 'After Repair' },
    status: {
      type: String,
      enum: ['Open', 'Mechanic Assigned', 'Mechanic Arrived', 'Repair In Progress', 'Repair Completed', 'Need Maintenance', 'Resolved', 'Closed', 'In Progress', 'Rejected', 'Cancelled (Accident)'],
      default: 'Open'
    },
    assignedMechanic: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      assignedAt: { type: Date }
    },
    repairTimeline: [
      {
        status: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
      }
    ],
    categoryData: {
      assignedTechnicalTeam: { type: String, default: '' },
      delayReason: { type: String, default: '' },
      newEta: { type: String, default: '' },
      customerInformed: { type: Boolean, default: false },
      towVehicleRequired: { type: Boolean, default: false },
      resolutionComment: { type: String, default: '' }
    },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    attachments: [
      {
        url: { type: String, default: '' },
        filename: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    completionDate: { type: Date },
    reportedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('VehicleComplaint', vehicleComplaintSchema);
