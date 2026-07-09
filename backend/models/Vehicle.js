import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    // Core identifiers
    vehicleNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    brand:         { type: String, required: true, trim: true },
    model:         { type: String, required: true, trim: true },
    year:          { type: Number },

    // Vehicle classification
    type:   { type: String, enum: ['Truck', 'Van', 'Bus', 'Trailer', 'Tipper', 'Tanker', 'Car', 'Other'], default: 'Truck' },
    branch: { type: String, trim: true, default: '' },

    // Assignment
    driver: { type: String, trim: true, default: 'Unassigned' },

    // Operational metrics
    fuelLevel:     { type: Number, min: 0, max: 100, default: 50 },
    fastagBalance: { type: Number, default: 0 },

    // Registration
    registrationNumber: { type: String, trim: true, uppercase: true, default: '' },
    registrationState:  { type: String, trim: true, default: '' },
    registrationType:   { type: String, enum: ['New', 'Transfer', 'Renewal'], default: 'New' },

    // Technical specs
    fuelType:         { type: String, enum: ['Diesel', 'Petrol', 'CNG', 'LPG', 'Electric'], default: 'Diesel' },
    transmissionType: { type: String, enum: ['Manual', 'Automatic'], default: 'Manual' },
    seatingCapacity:  { type: String, default: '2' },
    engineCC:         { type: String, default: '' },

    // Compliance & service
    insuranceExpiry: { type: Date },
    lastService:     { type: Date },
    nextService:     { type: Date },

    // Ownership & availability
    ownership:    { type: String, enum: ['Owned', 'Financed', 'Leased'], default: 'Owned' },
    availability: { type: String, enum: ['Immediate', 'Scheduled'], default: 'Immediate' },

    // Fleet status
    status: { type: String, enum: ['ACTIVE', 'MAINTENANCE', 'IDLE', 'ON_TRIP', 'OUT_OF_SERVICE'], default: 'ACTIVE' },

    // Relation
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
