import {
  getVehicles,
  getVehicleById,
  createVehicle as createVehicleInRepo,
  updateVehicle as updateVehicleInRepo,
  deleteVehicle as deleteVehicleInRepo,
} from '../repositories/vehicle.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { processVehicleDocuments } from '../utils/documentHelper.js';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';

/**
 * List all vehicles
 * GET /api/vehicles
 */
export const listVehicles = async (_req, res, next) => {
  try {
    const vehicles = await getVehicles();
    return sendSuccess(res, 200, vehicles, 'Vehicles fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * List all available (unallocated) vehicles
 * GET /api/vehicles/available
 */
export const getAvailableVehicles = async (req, res, next) => {
  try {
    const activeTrips = await Trip.find({
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
    });

    const allocatedVehicleIds = activeTrips.map(t => t.vehicle).filter(Boolean);

    const filter = {
      _id: { $nin: allocatedVehicleIds },
      currentStatus: { $in: ['Available', 'Active'] }
    };

    if (req.query.location) {
      const cleanLoc = req.query.location.trim().split(/[\s,]+/)[0];
      filter.branch = { $regex: new RegExp(cleanLoc, 'i') };
    }

    const availableVehicles = await Vehicle.find(filter)
      .populate('assignedDriver')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, availableVehicles, 'Available vehicles fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single vehicle by ID
 * GET /api/vehicles/:id
 */
export const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, vehicle, 'Vehicle fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 * POST /api/vehicles
 */
export const createVehicle = async (req, res, next) => {
  try {
    const {
      vehicleName,
      vehicleNumber,
      registrationNumber,
      vehicleType,
      brand,
      manufacturer,
      model,
      manufactureYear,
      assignedDriver,
      currentStatus,
      fuelType,
      fuelCapacity,
      fastagBalance,
      insuranceExpiry,
      rcExpiry,
      pollutionExpiry,
      permitExpiry,
      fitnessExpiry,
      odometer,
      image,
      chassisNumber,
      loadCapacity,
      ownershipType,
      ownership,
      insuranceDetails,
      permitDetails,
      documents,
      engineCC,
      engineNumber,
      fastagNumber,
      lastService,
      lastServiceDate,
      nextService,
      nextServiceDue,
      transmissionType,
      transmission,
      seatingCapacity,
      registrationState,
      registrationType,
      availability,
      branch,
      branchDepot,
    } = req.body;

    if (!vehicleNumber) {
      return sendError(res, 400, 'Vehicle number is required');
    }

    const processedDocs = await processVehicleDocuments(documents, req.user);

    const resolvedBrand = brand || manufacturer;
    const resolvedTransmission = transmissionType || transmission || 'Manual';
    const resolvedOwnership = ownershipType || ownership || 'Owned';
    const resolvedBranch = branch || branchDepot || 'Pune';
    const resolvedLastService = lastService || lastServiceDate || undefined;
    const resolvedNextService = nextService || nextServiceDue || undefined;

    const vehicle = await createVehicleInRepo({
      vehicleName: vehicleName || (resolvedBrand ? `${resolvedBrand} ${model}` : model),
      vehicleNumber,
      registrationNumber: registrationNumber || vehicleNumber,
      vehicleType: vehicleType || 'Truck',
      brand: resolvedBrand,
      manufacturer: resolvedBrand,
      model,
      manufactureYear: manufactureYear ? Number(manufactureYear) : undefined,
      assignedDriver: assignedDriver || undefined,
      currentStatus: currentStatus || 'Available',
      fuelType: fuelType || 'Diesel',
      fuelCapacity: fuelCapacity !== undefined ? Number(fuelCapacity) : 0,
      fastagBalance: fastagBalance !== undefined ? Number(fastagBalance) : 0,
      insuranceExpiry: insuranceExpiry || undefined,
      rcExpiry: rcExpiry || undefined,
      pollutionExpiry: pollutionExpiry || undefined,
      permitExpiry: permitExpiry || undefined,
      fitnessExpiry: fitnessExpiry || undefined,
      odometer: odometer !== undefined ? Number(odometer) : 0,
      image: image || '',
      assignedManager: req.user?._id,
      createdBy: req.user?._id,
      chassisNumber,
      loadCapacity: loadCapacity !== undefined ? Number(loadCapacity) : 0,
      ownershipType: resolvedOwnership,
      ownership: resolvedOwnership,
      insuranceDetails,
      permitDetails,
      documents: processedDocs,
      engineCC,
      engineNumber,
      fastagNumber,
      lastService: resolvedLastService,
      lastServiceDate: resolvedLastService,
      nextService: resolvedNextService,
      nextServiceDue: resolvedNextService,
      transmissionType: resolvedTransmission,
      transmission: resolvedTransmission,
      seatingCapacity: seatingCapacity || '2',
      registrationState,
      registrationType: registrationType || 'New',
      availability: availability || 'Immediate',
      branch: resolvedBranch,
      branchDepot: resolvedBranch,
    });

    return sendSuccess(res, 201, vehicle, 'Vehicle created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

import Driver from '../models/Driver.js';

/**
 * Update a vehicle
 * PUT /api/vehicles/:id
 */
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const updateData = { ...req.body };

    if (updateData.documents) {
      updateData.documents = await processVehicleDocuments(updateData.documents, req.user);
    }

    if (updateData.manufacturer !== undefined || updateData.brand !== undefined) {
      updateData.brand = updateData.manufacturer || updateData.brand;
      updateData.manufacturer = updateData.brand;
    }
    if (updateData.transmissionType !== undefined || updateData.transmission !== undefined) {
      updateData.transmissionType = updateData.transmissionType || updateData.transmission;
      updateData.transmission = updateData.transmissionType;
    }
    if (updateData.ownershipType !== undefined || updateData.ownership !== undefined) {
      updateData.ownershipType = updateData.ownershipType || updateData.ownership;
      updateData.ownership = updateData.ownershipType;
    }
    if (updateData.branch !== undefined || updateData.branchDepot !== undefined) {
      updateData.branch = updateData.branch || updateData.branchDepot;
      updateData.branchDepot = updateData.branch;
    }
    if (updateData.lastService !== undefined || updateData.lastServiceDate !== undefined) {
      updateData.lastService = updateData.lastService || updateData.lastServiceDate;
      updateData.lastServiceDate = updateData.lastService;
    }
    if (updateData.nextService !== undefined || updateData.nextServiceDue !== undefined) {
      updateData.nextService = updateData.nextService || updateData.nextServiceDue;
      updateData.nextServiceDue = updateData.nextService;
    }
    updateData.updatedBy = req.user?._id;

    // Fetch the current vehicle state before updating
    const existingVehicle = await getVehicleById(vehicleId);
    if (!existingVehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }

    // Check if assignedDriver is being modified
    if (updateData.assignedDriver !== undefined) {
      const prevDriverId = existingVehicle.assignedDriver;
      const newDriverId = updateData.assignedDriver;

      // License status check before assignment
      if (newDriverId && newDriverId !== 'Unassigned' && newDriverId !== '') {
        const driverDoc = await Driver.findById(newDriverId);
        if (driverDoc && driverDoc.licenseExpiry && new Date(driverDoc.licenseExpiry) < new Date()) {
          return sendError(res, 400, 'Cannot assign driver with an expired driving license');
        }
      }

      // Case 1: Unassign the previous driver
      if (prevDriverId && String(prevDriverId) !== String(newDriverId)) {
        const prevDriverDoc = await Driver.findById(prevDriverId);
        if (prevDriverDoc) {
          prevDriverDoc.assignedVehicle = 'Unassigned';
          prevDriverDoc.driverStatus = 'AVAILABLE';
          prevDriverDoc.assignmentHistory.forEach(h => {
            if (h.status === 'Active') {
              h.status = 'Completed';
              h.unassignmentDate = new Date();
            }
          });
          await prevDriverDoc.save();
        }
      }

      // Case 2: Assign the new driver
      if (newDriverId && newDriverId !== 'Unassigned' && newDriverId !== '') {
        const driverDoc = await Driver.findById(newDriverId);
        if (driverDoc) {
          const vehicleNumber = updateData.vehicleNumber || existingVehicle.vehicleNumber;
          const currentStatus = updateData.currentStatus || existingVehicle.currentStatus;
          driverDoc.assignedVehicle = vehicleNumber;
          driverDoc.driverStatus = currentStatus === 'On Trip' ? 'ON_TRIP' : 'AVAILABLE';
          
          driverDoc.assignmentHistory.forEach(h => {
            if (h.status === 'Active') {
              h.status = 'Completed';
              h.unassignmentDate = new Date();
            }
          });

          driverDoc.assignmentHistory.push({
            vehicleId: existingVehicle._id,
            vehicleNumber: vehicleNumber,
            vehicleName: existingVehicle.vehicleName || `${existingVehicle.brand} ${existingVehicle.model}`,
            assignmentDate: new Date(),
            assignedBy: req.user ? req.user.email : 'Fleet Manager',
            status: 'Active'
          });
          await driverDoc.save();
        }
      } else {
        // If 'Unassigned' or empty string is passed, clear from mongoose model
        updateData.assignedDriver = null;
      }
    }

    // Check if status is updated and we need to update the driver's status
    if (updateData.currentStatus !== undefined && !updateData.assignedDriver) {
      const driverId = existingVehicle.assignedDriver;
      if (driverId) {
        await Driver.findByIdAndUpdate(driverId, {
          driverStatus: updateData.currentStatus === 'On Trip' ? 'ON_TRIP' : 'AVAILABLE'
        });
      }
    }

    const vehicle = await updateVehicleInRepo(vehicleId, updateData);
    return sendSuccess(res, 200, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

/**
 * Delete a vehicle
 * DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await deleteVehicleInRepo(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, {}, 'Vehicle deleted successfully');
  } catch (error) {
    next(error);
  }
};
