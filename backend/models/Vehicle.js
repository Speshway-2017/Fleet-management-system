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
    assignedDriver:     { type: mongoose.Schema.Types.ObjectId },
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
    isAssigned:         { type: Boolean, default: false },
    activeTripId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    currentTripId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    
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
    image:              { type: String, default: '' },
    vehicleImage: {
      secure_url:   { type: String, default: '' },
      public_id:    { type: String, default: '' },
      originalName: { type: String, default: '' }
    },
    documents: {
      rc: {
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
        originalName: { type: String, default: '' },
        uploadDate: { type: Date },
        expiryDate: { type: Date },
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
        expiryDate: { type: Date },
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
        expiryDate: { type: Date },
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
        expiryDate: { type: Date },
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
        expiryDate: { type: Date },
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
        expiryDate: { type: Date },
        uploadedAt: { type: Date, default: Date.now },
        fileSize: { type: Number },
        mimeType: { type: String, default: '' },
        uploadedBy: { type: String, default: '' }
      }
    },
    assignedManager:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branch:             { type: String, default: 'Pune', trim: true },
    currentLocation:    { type: String, default: '', trim: true },
    currentLatitude:    { type: Number, default: null },
    currentLongitude:   { type: Number, default: null },
    speed:              { type: Number, default: 0 },
    heading:            { type: Number, default: 0 },
    lastLocationUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

vehicleSchema.pre('validate', function(next) {
  if (this.isModified('branch') && !this.isModified('currentLocation')) {
    this.currentLocation = this.branch;
  } else if (this.isModified('currentLocation') && !this.isModified('branch')) {
    this.branch = this.currentLocation;
  }
  next();
});

export default mongoose.model('Vehicle', vehicleSchema);
