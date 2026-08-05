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
    status: { type: String, enum: ['Pending Driver Acceptance', 'Scheduled', 'Assigned', 'Accepted', 'Rejected', 'In Progress', 'Waiting for Manager Approval', 'Completed', 'Cancelled'], default: 'Pending Driver Acceptance' },
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
      invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
      invoiceNumber: { type: String, default: '' },
      url: { type: String, default: '' },
      generatedAt: { type: Date }
    },
    notified15MinBefore: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
