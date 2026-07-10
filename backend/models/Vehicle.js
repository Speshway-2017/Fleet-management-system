import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName:        { type: String, trim: true },
    vehicleNumber:      { type: String, required: true, unique: true, trim: true, uppercase: true },
    registrationNumber: { type: String, trim: true, uppercase: true },
    vehicleType:        { type: String, default: 'Truck' },
    brand:              { type: String, trim: true },
    model:              { type: String, trim: true },
    manufactureYear:    { type: Number },
    assignedDriver:     { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    currentStatus: {
      type: String,
      enum: ['Available', 'Active', 'On Trip', 'Maintenance', 'Inactive'],
      default: 'Available',
    },
    fuelType:           { type: String, default: 'Diesel' },
    fuelCapacity:       { type: Number, default: 0 },
    fastagBalance:      { type: Number, default: 0 },
    insuranceExpiry:    { type: Date },
    rcExpiry:           { type: Date },
    pollutionExpiry:    { type: Date },
    permitExpiry:       { type: Date },
    fitnessExpiry:      { type: Date },
    odometer:           { type: Number, default: 0 },
    image:              { type: String, default: '' },
    documents:          { type: Array, default: [] },
    assignedManager:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
