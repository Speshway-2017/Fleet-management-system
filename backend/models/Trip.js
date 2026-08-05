import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: 'India' },
  formattedAddress: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  contactPerson: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: false });

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, required: true, unique: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    vehicleName: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    driverName: { type: String, default: '' },
    driverPhone: { type: String, default: '' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    pickupAddress: { type: addressSchema, default: () => ({}) },
    deliveryAddress: { type: addressSchema, default: () => ({}) },
    fromAddress: { type: addressSchema, default: () => ({}) },
    toAddress: { type: addressSchema, default: () => ({}) },
    departureTime: { type: String, required: true },
    eta: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'Pending Driver Acceptance',
        'Scheduled',
        'Assigned',
        'Accepted',
        'Rejected',
        'In Progress',
        'Waiting for Manager Approval',
        'Completed',
        'Cancelled',
        'Start Trip',
        'En Route',
        'At Loading',
        'Loading',
        'In Transit',
        'On Transit',
        'Dispatched',
        'Delivered',
        'Complete Trip',
        'Delayed',
        'On Trip',
        'Ready to Dispatch'
      ],
      default: 'Pending Driver Acceptance'
    },
    completionRequestedAt: { type: Date },
    description: { type: String, default: '' },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cargoType: { type: String, default: '' },
    cargoWeight: { type: Number, default: 0 },
    tripNotes: { type: String, default: '' },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    estimatedDistance: { type: Number, default: 0 },
    actualDistance: { type: Number, default: 0 },
    customerLocationReached: { type: Boolean, default: false },
    customerLocationReachedAt: { type: Date },
    tripEnded: { type: Boolean, default: false },
    endedAt: { type: Date },
    podStatus: { type: String, enum: ['Not Uploaded', 'Uploaded', 'Pending', 'Approved', 'Rejected'], default: 'Not Uploaded' },
    weighbridgeStatus: { type: String, enum: ['Not Uploaded', 'Uploaded', 'Pending', 'Approved', 'Rejected'], default: 'Not Uploaded' },
    proofOfDelivery: {
      url: { type: String, default: '' },
      deliveryPhotoUrl: { type: String, default: '' },
      customerSignatureUrl: { type: String, default: '' },
      customerName: { type: String, default: '' },
      receiverName: { type: String, default: '' },
      uploadedAt: { type: Date },
      status: { type: String, default: 'Not Uploaded' },
      rejectionReason: { type: String, default: '' }
    },
    weighbridgeSlip: {
      url: { type: String, default: '' },
      documentUrl: { type: String, default: '' },
      grossWeight: { type: Number, default: 0 },
      tareWeight: { type: Number, default: 0 },
      netWeight: { type: Number, default: 0 },
      location: { type: String, default: '' },
      uploadedAt: { type: Date },
      status: { type: String, default: 'Not Uploaded' },
      rejectionReason: { type: String, default: '' }
    },
    tripInvoice: {
      invoiceNumber: { type: String, default: '' },
      url: { type: String, default: '' },
      generatedAt: { type: Date }
    },
    notified15MinBefore: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    completedAt: { type: Date },
    currentLatitude: { type: Number, default: null },
    currentLongitude: { type: Number, default: null },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    lastLocationUpdate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
