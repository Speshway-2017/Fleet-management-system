import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    mobile: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    streetAddress: { type: String, default: '' },
    area: { type: String, default: '' },
    areaLocality: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: false },
    driverName: { type: String, default: '' },
    driverPhone: { type: String, default: '' },
    vehicleName: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    pickupAddress: { type: addressSchema, default: () => ({}) },
    deliveryAddress: { type: addressSchema, default: () => ({}) },
    fromAddress: { type: addressSchema, default: () => ({}) },
    toAddress: { type: addressSchema, default: () => ({}) },
    departureTime: { type: String, required: true },
    eta: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Assigned', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled', 'Pending Manager Approval'], default: 'Assigned' },
    description: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cargoType: { type: String, default: '' },
    cargoWeight: { type: Number, default: 0 },
    tripNotes: { type: String, default: '' },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    estimatedDistance: { type: Number, default: 0 },
    actualDistance: { type: Number, default: 0 },
    customerLocationReached: { type: Boolean, default: false },
    customerLocationReachedAt: { type: Date },
    podStatus: { type: String, enum: ['Not Uploaded', 'Uploaded', 'Pending', 'Approved', 'Rejected'], default: 'Not Uploaded' },
    weighbridgeStatus: { type: String, enum: ['Not Uploaded', 'Uploaded', 'Pending', 'Approved', 'Rejected'], default: 'Not Uploaded' },
    weighbridgeRequired: { type: Boolean, default: true },
    fuelStatus: { type: String, default: 'Not Uploaded' },
    tollStatus: { type: String, default: 'Not Uploaded' },
    podUrl: { type: String, default: '' },
    weighbridgeUrl: { type: String, default: '' },
    fuelUrl: { type: String, default: '' },
    tollUrl: { type: String, default: '' },
    podDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    weighbridgeDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    fuelDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    tollDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    notified15MinBefore: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
