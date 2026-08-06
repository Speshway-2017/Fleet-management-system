import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, default: '' },
    password: { type: String, default: '' },
    mustChangePassword: { type: Boolean, default: true },
    accountStatus: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
    status: { type: String, default: 'Active' },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseType: { type: String, enum: ['HMV', 'LMV', 'MCWG'], default: 'HMV' },
    licenseExpiry: { type: Date },
    assignedVehicle: { type: String, default: 'Unassigned' },
    isDuty: { type: Boolean, default: true },
    driverStatus: {
      type: String,
      enum: ['AVAILABLE', 'ON_TRIP', 'ASSIGNED', 'SUSPENDED', 'OFFLINE', 'OFF_DUTY'],
      default: 'AVAILABLE',
    },
    isOnline: { type: Boolean, default: true },
    employeeId: { type: String, unique: true, sparse: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    documents: {
      photo: { type: String, default: '' },
      license: { type: String, default: '' },
      idProof: { type: String, default: '' }
    },
    licenseIssuingAuthority: { type: String, default: '' },
    onTimeDeliveries: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 100 },
    safetyRecord: { type: String, default: 'Excellent' },
    trafficViolations: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 95 },
    assignmentHistory: [
      {
        vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
        vehicleNumber: { type: String, required: true },
        vehicleName: { type: String, required: true },
        assignmentDate: { type: Date, default: Date.now },
        unassignmentDate: { type: Date },
        assignedBy: { type: String, default: 'Fleet Manager' },
        status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
      }
    ],
    profileImage: { type: String, default: '' },
    licenseDocument: { type: String, default: '' },
    experience: { type: String, default: '' },
    joiningDate: { type: Date },
    medicalFitnessStatus: { type: String, default: 'Fit' },
    tripsCompleted: { type: Number, default: 0 },
    incidentCount: { type: Number, default: 0 },
    password: { type: String, select: false },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branch: { type: String, default: 'Pune', trim: true },
    driverLocation: { type: String, default: '', trim: true },
    currentLocation: { type: String, default: '', trim: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, default: 'SMS' },
    twoFactorPhone: { type: String, default: '' },
    recoveryCodes: { type: [String], default: [] },
    language: { type: String, default: 'English (US)' },
    isDarkMode: { type: Boolean, default: false },
    notificationPreferences: {
      routeChanges: { type: Boolean, default: true },
      trafficWarnings: { type: Boolean, default: true },
      healthAlertes: { type: Boolean, default: true },
      fuelWarnings: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true },
      tripUpdates: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      smsNotifications: { type: Boolean, default: true },
    },
    fcmToken: { type: String, default: '' },
    isAssigned: { type: Boolean, default: false },
    activeTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    currentTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  },
  { timestamps: true }
);

driverSchema.pre('validate', function (next) {
  if (this.isModified('driverLocation') && !this.isModified('currentLocation')) {
    this.currentLocation = this.driverLocation;
  } else if (this.isModified('currentLocation') && !this.isModified('driverLocation')) {
    this.driverLocation = this.currentLocation;
  }
  next();
});

driverSchema.post('init', function (doc) {
  doc._originalAssignedVehicle = doc.assignedVehicle;
});

driverSchema.pre('save', async function (next) {
  // Hash password if modified or newly added
  if (this.isModified('password') && this.password) {
    if (!this.password.startsWith('$2b$') && !this.password.startsWith('$2a$')) {
      const { hashPassword } = await import('../utils/hashPassword.js');
      this.password = await hashPassword(this.password);
    }
  } else if (!this.password && this.isNew) {
    const { hashPassword } = await import('../utils/hashPassword.js');
    this.password = await hashPassword('driver123');
  }

  // Generate employeeId if not present
  if (!this.employeeId) {
    let unique = false;
    let attempts = 0;
    while (!unique && attempts < 10) {
      const code = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await mongoose.models.Driver.findOne({ employeeId: code });
      if (!existing) {
        this.employeeId = code;
        unique = true;
      }
      attempts++;
    }
  }

  // Handle assignedVehicle changes to track history
  if (this.isModified('assignedVehicle')) {
    const prevVeh = this._originalAssignedVehicle || 'Unassigned';
    const newVeh = this.assignedVehicle || 'Unassigned';

    if (prevVeh !== newVeh) {
      // Complete previous active assignment in history
      this.assignmentHistory.forEach(h => {
        if (h.status === 'Active') {
          h.status = 'Completed';
          h.unassignmentDate = new Date();
        }
      });

      // If assigning to a vehicle
      if (newVeh !== 'Unassigned' && newVeh !== '') {
        const Vehicle = mongoose.model('Vehicle');
        const vehicleDoc = await Vehicle.findOne({ vehicleNumber: newVeh });
        if (vehicleDoc) {
          // If license is expired, throw error!
          if (this.licenseExpiry && new Date(this.licenseExpiry) < new Date()) {
            const err = new Error('Cannot assign driver with an expired driving license');
            err.statusCode = 400;
            return next(err);
          }

          this.assignmentHistory.push({
            vehicleId: vehicleDoc._id,
            vehicleNumber: vehicleDoc.vehicleNumber,
            vehicleName: vehicleDoc.vehicleName || `${vehicleDoc.brand} ${vehicleDoc.model}`,
            assignmentDate: new Date(),
            assignedBy: 'Fleet Manager',
            status: 'Active'
          });
        }
      }
    }
  }

  // Calculate performanceScore dynamically
  const totalTrips = this.tripsCompleted || 0;
  const onTime = this.onTimeDeliveries || 0;
  const onTimeRate = totalTrips > 0 ? (onTime / totalTrips) * 100 : 95;
  const attendance = this.attendancePercentage || 100;
  const violations = this.trafficViolations || 0;
  const safetyIncidents = this.incidentCount || 0;

  let score = 100;
  score -= (violations * 10);
  score -= (safetyIncidents * 15);
  if (onTimeRate < 95) score -= 5;
  if (onTimeRate < 90) score -= 10;
  if (attendance < 95) score -= 5;
  if (attendance < 90) score -= 10;

  this.performanceScore = Math.max(40, Math.min(100, score));

  next();
});

export default mongoose.model('Driver', driverSchema);
