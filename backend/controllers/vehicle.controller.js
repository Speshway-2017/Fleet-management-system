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
 * List all vehicles belonging to the logged-in manager
 * GET /api/vehicles
 */
export const listVehicles = async (req, res, next) => {
  try {
    const vehicles = await getVehicles({ assignedManager: req.user._id });
    return sendSuccess(res, 200, vehicles, 'Vehicles fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * List available (unallocated) vehicles belonging to the logged-in manager
 * GET /api/vehicles/available
 */
export const getAvailableVehicles = async (req, res, next) => {
  try {
    const activeTrips = await Trip.find({
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
    });

    const allocatedVehicleIds = activeTrips.map(t => t.vehicle).filter(Boolean);

    const filter = {
      assignedManager: req.user._id,
      _id: { $nin: allocatedVehicleIds },
      currentStatus: { $in: ['Available', 'Active'] }
    };

    const cleanLoc = req.query.location ? req.query.location.trim().split(/[\s,]+/)[0].toLowerCase() : null;

    if (cleanLoc) {
      filter.$and = [
        {
          $or: [
            { branch: { $regex: new RegExp(cleanLoc, 'i') } },
            { currentLocation: { $regex: new RegExp(cleanLoc, 'i') } }
          ]
        }
      ];
    }

    const availableVehicles = await Vehicle.find(filter).populate('assignedDriver');

    if (cleanLoc) {
      availableVehicles.sort((a, b) => {
        const aLoc = (a.currentLocation || a.branch || '').toLowerCase();
        const bLoc = (b.currentLocation || b.branch || '').toLowerCase();
        const aMatch = aLoc.includes(cleanLoc) || cleanLoc.includes(aLoc);
        const bMatch = bLoc.includes(cleanLoc) || cleanLoc.includes(bLoc);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    } else {
      availableVehicles.sort((a, b) => b.createdAt - a.createdAt);
    }

    return sendSuccess(res, 200, availableVehicles, 'Available vehicles fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single vehicle by ID — only if it belongs to the logged-in manager
 * GET /api/vehicles/:id
 */
export const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    // Ownership check
    const managerId = vehicle.assignedManager?._id || vehicle.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
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

    const trimmedChassis = (chassisNumber || '').trim();
    if (trimmedChassis.length !== 17) {
      return sendError(res, 400, 'Please enter exactly 17 characters.');
    }

    const conflictOr = [
      { vehicleNumber: vehicleNumber.toUpperCase() }
    ];
    if (registrationNumber) {
      conflictOr.push({ registrationNumber: registrationNumber.toUpperCase() });
    }
    if (trimmedChassis) {
      conflictOr.push({ chassisNumber: trimmedChassis });
    }

    const existingVehicle = await Vehicle.findOne({ $or: conflictOr });
    if (existingVehicle) {
      if (existingVehicle.vehicleNumber === vehicleNumber.toUpperCase()) {
        return sendError(res, 409, 'A vehicle with this registration plate already exists');
      }
      if (registrationNumber && existingVehicle.registrationNumber === registrationNumber.toUpperCase()) {
        return sendError(res, 409, 'A vehicle with this registration number already exists');
      }
      if (trimmedChassis && existingVehicle.chassisNumber === trimmedChassis) {
        return sendError(res, 409, 'A vehicle with this chassis number already exists');
      }
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
    if (updateData.chassisNumber !== undefined) {
      const trimmedChassis = String(updateData.chassisNumber || '').trim();
      if (trimmedChassis.length !== 17) {
        return sendError(res, 400, 'Please enter exactly 17 characters.');
      }
      updateData.chassisNumber = trimmedChassis;
    }

    const conflictOr = [];
    if (updateData.vehicleNumber) {
      conflictOr.push({ vehicleNumber: updateData.vehicleNumber.toUpperCase() });
    }
    if (updateData.registrationNumber) {
      conflictOr.push({ registrationNumber: updateData.registrationNumber.toUpperCase() });
    }
    if (updateData.chassisNumber) {
      conflictOr.push({ chassisNumber: updateData.chassisNumber.trim() });
    }

    if (conflictOr.length > 0) {
      const existingVehicle = await Vehicle.findOne({
        _id: { $ne: vehicleId },
        $or: conflictOr
      });
      if (existingVehicle) {
        if (updateData.vehicleNumber && existingVehicle.vehicleNumber === updateData.vehicleNumber.toUpperCase()) {
          return sendError(res, 409, 'A vehicle with this registration plate already exists');
        }
        if (updateData.registrationNumber && existingVehicle.registrationNumber === updateData.registrationNumber.toUpperCase()) {
          return sendError(res, 409, 'A vehicle with this registration number already exists');
        }
        if (updateData.chassisNumber && existingVehicle.chassisNumber === updateData.chassisNumber.trim()) {
          return sendError(res, 409, 'A vehicle with this chassis number already exists');
        }
      }
    }

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

    // Ownership check — only the owning manager can update
    const managerId = existingVehicle.assignedManager?._id || existingVehicle.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
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
 * Check whether a specific field value already exists (for real-time validation)
 * GET /api/vehicles/check-duplicate?field=vehicleNumber&value=MH12AB5678&excludeId=<id>
 */
export const checkVehicleDuplicate = async (req, res, next) => {
  try {
    const { field, value, excludeId } = req.query;

    const allowedFields = ['vehicleNumber', 'registrationNumber', 'chassisNumber'];
    if (!field || !allowedFields.includes(field)) {
      return sendError(res, 400, 'Invalid or missing field. Must be one of: vehicleNumber, registrationNumber, chassisNumber');
    }

    if (!value || String(value).trim() === '') {
      return sendSuccess(res, 200, { isDuplicate: false, field }, 'No value to check');
    }

    const normalizedValue = field === 'chassisNumber'
      ? String(value).trim()
      : String(value).trim().toUpperCase();

    const query = { [field]: normalizedValue };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Vehicle.findOne(query).select('_id').lean();

    return sendSuccess(res, 200, { isDuplicate: !!existing, field }, 'Duplicate check complete');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a vehicle — only if it belongs to the logged-in manager
 * DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    // Ownership check before delete
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    const managerId = vehicle.assignedManager?._id || vehicle.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
    }
    await deleteVehicleInRepo(req.params.id);
    return sendSuccess(res, 200, {}, 'Vehicle deleted successfully');
  } catch (error) {
    next(error);
  }
};
