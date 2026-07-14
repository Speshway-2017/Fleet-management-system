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
      enum: ['Available', 'Assigned', 'On Trip', 'Under Maintenance', 'Out of Service'],
      default: 'Available',
    },
    fuelType:           { type: String, default: 'Diesel' },
    fuelCapacity:       { type: Number, default: 0 },
    fastagBalance:      { type: Number, default: 0 },
    chassisNumber:      { type: String, trim: true },
    loadCapacity:       { type: Number, default: 0 },
    ownershipType:      { type: String, enum: ['Owned', 'Leased', 'Financed'], default: 'Owned' },
    engineCC:           { type: String, trim: true },
    engineNumber:       { type: String, trim: true },
    fastagNumber:       { type: String, trim: true },
    lastService:        { type: Date },
    nextService:        { type: Date },
    transmission:       { type: String, default: 'Manual' },
    transmissionType:   { type: String, default: 'Manual' },
    ownership:          { type: String, enum: ['Owned', 'Leased', 'Financed'], default: 'Owned' },
    branchDepot:        { type: String, default: 'Pune', trim: true },
    lastServiceDate:    { type: Date },
    nextServiceDue:     { type: Date },
    manufacturer:       { type: String, trim: true },
    createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    seatingCapacity:    { type: String, default: '2' },
    registrationState:  { type: String, trim: true },
    registrationType:   { type: String, default: 'New' },
    availability:       { type: String, default: 'Immediate' },
    insuranceDetails: {
      provider:         { type: String, default: '' },
      policyNumber:     { type: String, default: '' },
      startDate:        { type: Date },
      expiryDate:       { type: Date },
      premiumAmount:    { type: Number, default: 0 },
      status:           { type: String, default: 'Active' }
    },
    permitDetails: {
      permitNumber:     { type: String, default: '' },
      permitType:       { type: String, default: 'National' },
      issueDate:        { type: Date },
      expiryDate:       { type: Date },
      status:           { type: String, default: 'Active' }
    },
    
    insuranceExpiry:    { type: Date },
    rcExpiry:           { type: Date },
    pollutionExpiry:    { type: Date },
    permitExpiry:       { type: Date },
    fitnessExpiry:      { type: Date },
    odometer:           { type: Number, default: 0 },
    image:              { type: String, default: '' },
    documents: {
      rc: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      },
      insurance: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      },
      puc: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      },
      fitness: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      },
      permit: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      },
      roadTax: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      }
    },
    assignedManager:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branch:             { type: String, default: 'Pune', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
