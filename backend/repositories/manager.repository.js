import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Fuel from '../models/Fuel.js';
import Maintenance from '../models/Maintenance.js';
import Document from '../models/Document.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';

// Vehicles
export const getVehicles = async (filter = {}) =>
  Vehicle.find(filter).populate('assignedDriver').sort({ createdAt: -1 });

export const getVehicleById = async (id) =>
  Vehicle.findById(id).populate('assignedDriver');

export const createVehicle = async (data) => {
  const vehicle = new Vehicle(data);
  return vehicle.save();
};

export const updateVehicle = async (id, data) =>
  Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteVehicle = async (id) =>
  Vehicle.findByIdAndDelete(id);

// Drivers
export const getDrivers = async (filter = {}) =>
  Driver.find(filter).sort({ createdAt: -1 });

export const getDriverById = async (id) =>
  Driver.findById(id);

export const createDriver = async (data) => {
  const driver = new Driver(data);
  return driver.save();
};

export const updateDriver = async (id, data) =>
  Driver.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteDriver = async (id) =>
  Driver.findByIdAndDelete(id);

// Trips
export const getTrips = async (filter = {}) => {
  return Trip.find(filter).sort({ createdAt: -1 });
};

export const getTripById = async (id) => {
  return Trip.findById(id).populate('driver').populate('vehicle');
};

export const createTrip = async (data) => {
  const trip = new Trip(data);
  return trip.save();
};

export const updateTrip = async (id, data) => {
  return Trip.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTrip = async (id) => {
  return Trip.findByIdAndDelete(id);
};

// Fuel
export const getFuelRecords = async (filter = {}) => {
  return Fuel.find(filter);
};

export const getFuelRecordById = async (id) => {
  return Fuel.findById(id);
};

export const createFuelRecord = async (data) => {
  const fuel = new Fuel(data);
  return fuel.save();
};

export const updateFuelRecord = async (id, data) => {
  return Fuel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteFuelRecord = async (id) => {
  return Fuel.findByIdAndDelete(id);
};

// Maintenance
export const getMaintenances = async (filter = {}) => {
  return Maintenance.find(filter);
};

export const getMaintenanceById = async (id) => {
  return Maintenance.findById(id);
};

export const createMaintenance = async (data) => {
  const maintenance = new Maintenance(data);
  return maintenance.save();
};

export const updateMaintenance = async (id, data) => {
  return Maintenance.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMaintenance = async (id) => {
  return Maintenance.findByIdAndDelete(id);
};

// Documents
export const getDocuments = async (filter = {}) => {
  return Document.find(filter);
};

export const getDocumentById = async (id) => {
  return Document.findById(id);
};

export const createDocument = async (data) => {
  const document = new Document(data);
  return document.save();
};

export const updateDocument = async (id, data) => {
  return Document.findByIdAndUpdate(id, data, { new: true });
};

export const deleteDocument = async (id) => {
  return Document.findByIdAndDelete(id);
};

// Reports
export const getReports = async (filter = {}) => {
  return Report.find(filter);
};

export const getReportById = async (id) => {
  return Report.findById(id);
};

export const createReport = async (data) => {
  const report = new Report(data);
  return report.save();
};

export const updateReport = async (id, data) => {
  return Report.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReport = async (id) => {
  return Report.findByIdAndDelete(id);
};

// Notifications
export const getManagerNotifications = async (managerId) => {
  return Notification.find({ $or: [{ recipient: managerId }, { recipientRole: 'FLEET_MANAGER' }] }).sort({ createdAt: -1 });
};

export const markManagerNotificationRead = async (id) => {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

export const markAllManagerNotificationsRead = async (managerId) => {
  return Notification.updateMany({ $or: [{ recipient: managerId }, { recipientRole: 'FLEET_MANAGER' }], isRead: false }, { isRead: true });
};

export const deleteManagerNotification = async (id) => {
  return Notification.findByIdAndDelete(id);
};
