import mongoose from 'mongoose';
import { resolveLocationName, isCoordinateString } from '../utils/reverseGeocoder.js';
import { geocodeCity, getDistanceKm, getRoadDistanceAndEta } from '../utils/geocodingHelper.js';
import {
  getVehicles,
  getVehicleById,
  createVehicle as createVehicleInRepo,
  updateVehicle as updateVehicleInRepo,
  deleteVehicle as deleteVehicleInRepo,
} from '../repositories/vehicle.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { processVehicleDocuments } from '../utils/documentHelper.js';
import { uploadBase64ImageToCloudinary, deleteImageFromCloudinary } from '../utils/cloudinary.js';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import { logActivity } from '../utils/activityLogger.js';

/**
 * List all vehicles belonging to the logged-in manager
 * GET /api/vehicles
 */
export const listVehicles = async (req, res, next) => {
  try {
    const managerId = req.user._id;
    const orgId = req.user.organization;
    const filter = {
      $or: [
        { assignedManager: managerId },
        { createdBy: managerId },
        ...(orgId ? [{ organization: orgId }] : [])
      ]
    };
    const vehicles = await getVehicles(filter);
    for (const v of vehicles) {
      const rawLoc = v.currentLocation;
      if (isCoordinateString(rawLoc)) {
        const resolvedName = await resolveLocationName(rawLoc, v.branch || v.branchDepot);
        v.currentLocation = resolvedName;
        Vehicle.findByIdAndUpdate(v._id, { currentLocation: resolvedName }).catch(() => { });
      }
    }
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
      status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
    });

    const allocatedVehicleIds = activeTrips.map(t => t.vehicle).filter(Boolean);

    const allAvailable = await Vehicle.find({
      assignedManager: req.user._id,
      _id: { $nin: allocatedVehicleIds },
      currentStatus: { $in: ['Available', 'Active'] }
    }).populate('assignedDriver');

    for (const v of allAvailable) {
      const rawLoc = v.currentLocation;
      if (isCoordinateString(rawLoc)) {
        const resolvedName = await resolveLocationName(rawLoc, v.branch || v.branchDepot);
        v.currentLocation = resolvedName;
        Vehicle.findByIdAndUpdate(v._id, { currentLocation: resolvedName }).catch(() => { });
      }
    }

    const targetLoc = (req.query.location || req.query.startLocation || '').trim();
    if (!targetLoc) {
      return sendSuccess(res, 200, allAvailable, 'Available vehicles fetched successfully');
    }

    const normTarget = targetLoc.toLowerCase();
    const targetFirstWord = normTarget.split(/[\s,]+/)[0];

    const getVehicleEffectiveLocation = (v) => {
      if (v.currentLocation && v.currentLocation.trim()) return v.currentLocation.trim();
      if (v.branchDepot && v.branchDepot.trim()) return v.branchDepot.trim();
      if (v.branch && v.branch.trim()) return v.branch.trim();
      return '';
    };

    const isMatch = (v) => {
      const vLoc = getVehicleEffectiveLocation(v);
      if (!vLoc) return false;
      const norm = vLoc.trim().toLowerCase();
      const firstWord = norm.split(/[\s,]+/)[0];
      return norm === normTarget || norm.includes(targetFirstWord) || targetFirstWord.includes(firstWord);
    };

    const localVehicles = [];
    const nearbyRawVehicles = [];

    for (const v of allAvailable) {
      const vObj = v.toObject ? v.toObject() : { ...v };
      if (isMatch(v)) {
        localVehicles.push({
          ...vObj,
          isNearby: true,
          distanceKm: 0,
          estimatedTravelTime: 'Local',
          currentBranch: v.branchDepot || v.branch || targetLoc,
          currentLocation: v.currentLocation || targetLoc
        });
      } else {
        nearbyRawVehicles.push(v);
      }
    }

    console.log('\n===================================');
    console.log(`Start Location: ${targetLoc}`);
    console.log(`Local Vehicles Found: ${localVehicles.length}`);

    // Compute road distance for non-local vehicles
    const mappedNearbyVehicles = await Promise.all(
      nearbyRawVehicles.map(async (v) => {
        const rawEffective = getVehicleEffectiveLocation(v);
        const vLoc = await resolveLocationName(rawEffective || 'Hyderabad', v.branch || v.branchDepot);
        if (isCoordinateString(rawEffective)) {
          Vehicle.findByIdAndUpdate(v._id, { currentLocation: vLoc }).catch(() => {});
        }
        const routeData = await getRoadDistanceAndEta(targetLoc, vLoc);
        const vObj = v.toObject ? v.toObject() : { ...v };
        const dist = routeData.distanceKm || 0;
        return {
          ...vObj,
          isNearby: dist <= 50,
          distanceKm: dist,
          estimatedTravelTime: routeData.estimatedTravelTime,
          currentBranch: v.branchDepot || v.branch || vLoc,
          currentLocation: vLoc
        };
      })
    );

    // Combine all vehicles and sort by distance (nearest to farthest)
    const allSortedVehicles = [...localVehicles, ...mappedNearbyVehicles].sort((a, b) => a.distanceKm - b.distanceKm);

    // Filter vehicles within 50km
    const vehiclesWithin50 = allSortedVehicles.filter(v => v.distanceKm <= 50);
    const hasNearby = vehiclesWithin50.length > 0;

    let finalVehiclesToReturn = [];
    let isNearbyFallback = false;
    let isExtendedFallback = false;

    if (hasNearby) {
      console.log(`✓ Found ${vehiclesWithin50.length} vehicles within 50km of ${targetLoc}.`);
      finalVehiclesToReturn = vehiclesWithin50;
      isNearbyFallback = localVehicles.length === 0;
    } else {
      console.log(`❌ No nearby vehicles found within 50km of ${targetLoc}. Displaying all available vehicles sorted by distance.`);
      finalVehiclesToReturn = allSortedVehicles;
      isExtendedFallback = true;
      isNearbyFallback = true;
    }

    if (finalVehiclesToReturn.length > 0) {
      console.log(`Vehicles list for ${targetLoc}:`);
      finalVehiclesToReturn.slice(0, 5).forEach((v, idx) => {
        console.log(`${idx + 1}. ${v.vehicleName || v.name} (${v.vehicleNumber || v.plateNumber}) - Loc: ${v.currentLocation} - ${v.distanceKm} km away (${v.estimatedTravelTime})`);
      });
    }
    console.log('===================================\n');

    return sendSuccess(res, 200, {
      vehicles: finalVehiclesToReturn,
      localVehicles,
      nearbyVehicles: vehiclesWithin50,
      allVehiclesSorted: allSortedVehicles,
      localCount: localVehicles.length,
      nearbyCount: vehiclesWithin50.length,
      hasNearby,
      isNearbyFallback,
      isExtendedFallback
    }, 'Available vehicles fetched successfully');
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

    const vehObj = vehicle.toObject ? vehicle.toObject() : JSON.parse(JSON.stringify(vehicle));

    const isAvailableStatus = vehObj.currentStatus === 'Available' || vehObj.status === 'Available' || vehObj.currentStatus === 'Under Maintenance' || vehObj.currentStatus === 'Out of Service';

    if (isAvailableStatus) {
      vehObj.assignedDriver = null;
      vehObj.assignedDriverName = null;
      vehObj.driverName = null;
    } else {
      // If assignedDriver is an unpopulated ObjectId string, attempt Driver lookup directly
      if (vehObj.assignedDriver && (typeof vehObj.assignedDriver === 'string' || vehObj.assignedDriver instanceof mongoose.Types.ObjectId)) {
        const driverIdStr = String(vehObj.assignedDriver);
        if (/^[0-9a-fA-F]{24}$/.test(driverIdStr)) {
          const foundDriver = await Driver.findById(driverIdStr).select('fullName name phoneNumber phone employeeId licenseNumber');
          if (foundDriver) {
            vehObj.assignedDriver = foundDriver;
            vehObj.assignedDriverName = foundDriver.fullName || foundDriver.name;
            vehObj.driverName = foundDriver.fullName || foundDriver.name;
          }
        }
      }

      // If assignedDriver is still missing or unpopulated, check active/in-progress trip (NOT Completed) for this vehicle
      if (!vehObj.assignedDriver || typeof vehObj.assignedDriver !== 'object' || !vehObj.assignedDriver.fullName) {
        const activeTrip = await Trip.findOne({
          vehicle: vehicle._id,
          status: { $in: ['In Progress', 'On Transit', 'Enroute', 'Assigned'] }
        }).sort({ updatedAt: -1 }).populate('driver', 'fullName name phoneNumber phone employeeId licenseNumber');

        if (activeTrip && activeTrip.driver) {
          vehObj.assignedDriver = activeTrip.driver;
          vehObj.assignedDriverName = activeTrip.driver.fullName || activeTrip.driver.name;
          vehObj.driverName = activeTrip.driver.fullName || activeTrip.driver.name;
        } else {
          vehObj.assignedDriver = null;
          vehObj.assignedDriverName = null;
          vehObj.driverName = null;
        }
      }
    }

    return sendSuccess(res, 200, vehObj, 'Vehicle fetched successfully');
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

    let finalVehicleImage = {
      secure_url: '',
      public_id: '',
      originalName: ''
    };

    const targetVehicleName = vehicleName || (resolvedBrand ? `${resolvedBrand} ${model || ''}`.trim() : (model || vehicleNumber));

    const imagePayload = req.body.vehicleImage || req.body.image;
    if (imagePayload) {
      if (typeof imagePayload === 'object' && imagePayload.secure_url) {
        finalVehicleImage = {
          secure_url: imagePayload.secure_url || '',
          public_id: imagePayload.public_id || '',
          originalName: imagePayload.originalName || 'vehicle_image'
        };
      } else if (typeof imagePayload === 'string' && imagePayload.startsWith('data:image')) {
        console.log(`\n=================================`);
        console.log(`Vehicle Image Upload Started\n`);
        console.log(`Vehicle:\n${targetVehicleName}\n`);
        console.log(`Uploading image to Cloudinary...`);
        const uploaded = await uploadBase64ImageToCloudinary(imagePayload, 'vehicles', req.body.imageName || 'vehicle.png');
        console.log(`✓ Upload Successful\n`);
        console.log(`Cloudinary URL:\n${uploaded.secure_url}\n`);
        finalVehicleImage = uploaded;
      } else if (typeof imagePayload === 'string' && imagePayload.startsWith('http')) {
        finalVehicleImage.secure_url = imagePayload;
      }
    }

    console.log(`Saving vehicle...`);

    const vehicle = await createVehicleInRepo({
      vehicleName: targetVehicleName,
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
      image: finalVehicleImage.secure_url || (typeof image === 'string' ? image : ''),
      vehicleImage: finalVehicleImage,
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

    console.log(`✓ Vehicle Saved Successfully\n=================================\n`);

    await logActivity({
      title: 'Vehicle Created',
      description: `Vehicle ${vehicle.vehicleNumber} (${vehicle.vehicleName}) was registered.`,
      activityType: 'VEHICLE_CREATED',
      vehicleNumber: vehicle.vehicleNumber,
      vehicleName: vehicle.vehicleName,
      relatedModule: 'Vehicle',
      relatedId: vehicle._id,
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 201, vehicle, 'Vehicle created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

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

    console.log(`\n=================================`);
    console.log(`Updating Vehicle\n`);
    console.log(`Vehicle ID:\n${vehicleId}\n`);

    const excludeIdQuery = mongoose.Types.ObjectId.isValid(vehicleId)
      ? new mongoose.Types.ObjectId(vehicleId)
      : vehicleId;

    // 1. Check duplicate chassis
    if (updateData.chassisNumber && String(updateData.chassisNumber).trim() && String(updateData.chassisNumber).trim().toUpperCase() !== 'N/A') {
      const trimmedChassis = String(updateData.chassisNumber).trim();
      console.log(`Checking duplicate chassis...\n`);

      const dupChassis = await Vehicle.findOne({
        chassisNumber: trimmedChassis,
        _id: { $ne: excludeIdQuery }
      });

      if (dupChassis && String(dupChassis._id) !== String(vehicleId)) {
        console.log(`Duplicate chassis number found.\n`);
        console.log(`Existing Vehicle ID:\n${dupChassis._id}\n`);
        console.log(`Update aborted.\n`);
        console.log(`=================================\n`);
        return sendError(res, 409, 'A vehicle with this chassis number already exists');
      }
      console.log(`✓ Current vehicle ignored\n`);
    }

    // 2. Check duplicate registration number
    if (updateData.registrationNumber && String(updateData.registrationNumber).trim() && String(updateData.registrationNumber).trim().toUpperCase() !== 'N/A') {
      const trimmedRegNum = String(updateData.registrationNumber).trim().toUpperCase();
      console.log(`Checking duplicate registration number...\n`);

      const dupRegNum = await Vehicle.findOne({
        registrationNumber: trimmedRegNum,
        _id: { $ne: excludeIdQuery }
      });

      if (dupRegNum && String(dupRegNum._id) !== String(vehicleId)) {
        console.log(`Duplicate registration number found.\n`);
        console.log(`Existing Vehicle ID:\n${dupRegNum._id}\n`);
        console.log(`Update aborted.\n`);
        console.log(`=================================\n`);
        return sendError(res, 409, 'A vehicle with this registration number already exists');
      }
      console.log(`✓ No duplicate found\n`);
    }

    // 3. Check duplicate registration plate (vehicleNumber)
    const targetPlate = (updateData.vehicleNumber || updateData.plateNumber || '').toString().trim().toUpperCase();
    if (targetPlate && targetPlate !== 'N/A') {
      console.log(`Checking duplicate registration plate...\n`);

      const dupPlate = await Vehicle.findOne({
        vehicleNumber: targetPlate,
        _id: { $ne: excludeIdQuery }
      });

      if (dupPlate && String(dupPlate._id) !== String(vehicleId)) {
        console.log(`Duplicate registration plate found.\n`);
        console.log(`Existing Vehicle ID:\n${dupPlate._id}\n`);
        console.log(`Update aborted.\n`);
        console.log(`=================================\n`);
        return sendError(res, 409, 'A vehicle with this registration plate already exists');
      }
      console.log(`✓ No duplicate found\n`);
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

    // Set assignedDriver to null or keep it as passed, without trying to sync to Driver model
    if (updateData.assignedDriver === 'Unassigned' || updateData.assignedDriver === '') {
      updateData.assignedDriver = null;
    }

    // Ownership check — only the owning manager can update
    const managerId = existingVehicle.assignedManager?._id || existingVehicle.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
    }

    // Handle Vehicle Image Replacement or Removal
    if (updateData.vehicleImage !== undefined || updateData.image !== undefined || updateData.removeImage) {
      const newImagePayload = updateData.vehicleImage || updateData.image;

      if (updateData.removeImage || newImagePayload === null || newImagePayload === '' || (typeof newImagePayload === 'object' && !newImagePayload?.secure_url)) {
        if (existingVehicle.vehicleImage?.public_id) {
          console.log(`Deleting old Cloudinary vehicle image: ${existingVehicle.vehicleImage.public_id}`);
          await deleteImageFromCloudinary(existingVehicle.vehicleImage.public_id);
        }
        updateData.vehicleImage = { secure_url: '', public_id: '', originalName: '' };
        updateData.image = '';
      } else if (typeof newImagePayload === 'string' && newImagePayload.startsWith('data:image')) {
        if (existingVehicle.vehicleImage?.public_id) {
          console.log(`Deleting old Cloudinary vehicle image: ${existingVehicle.vehicleImage.public_id}`);
          await deleteImageFromCloudinary(existingVehicle.vehicleImage.public_id);
        }
        console.log(`Vehicle Image Replacement Started\n`);
        console.log(`Vehicle:\n${existingVehicle.vehicleName || existingVehicle.vehicleNumber}\n`);
        console.log(`Uploading new image to Cloudinary...`);
        const uploaded = await uploadBase64ImageToCloudinary(newImagePayload, 'vehicles', updateData.imageName || 'vehicle.png');
        console.log(`✓ Upload Successful\n`);
        console.log(`Cloudinary URL:\n${uploaded.secure_url}\n`);
        updateData.vehicleImage = uploaded;
        updateData.image = uploaded.secure_url;
      } else if (typeof newImagePayload === 'object' && newImagePayload?.secure_url) {
        updateData.vehicleImage = newImagePayload;
        updateData.image = newImagePayload.secure_url;
      }
    }

    console.log(`Updating vehicle...\n`);
    const prevStatus = existingVehicle.currentStatus;
    const vehicle = await updateVehicleInRepo(vehicleId, updateData);
    console.log(`✓ Vehicle updated successfully\n`);
    console.log(`=================================\n`);

    let actType = 'VEHICLE_UPDATED';
    let actTitle = 'Vehicle Updated';
    let actDesc = `Vehicle ${vehicle.vehicleNumber} details were updated.`;

    if (updateData.currentStatus && updateData.currentStatus !== prevStatus) {
      actType = 'VEHICLE_STATUS_CHANGED';
      actTitle = 'Vehicle Status Changed';
      actDesc = `Vehicle ${vehicle.vehicleNumber} entered ${updateData.currentStatus}.`;
    } else if (updateData.vehicleImage && updateData.vehicleImage.secure_url) {
      actType = 'VEHICLE_IMAGE_UPDATED';
      actTitle = 'Vehicle Image Updated';
      actDesc = `Vehicle ${vehicle.vehicleNumber} image was updated.`;
    } else if (updateData.assignedDriver !== undefined) {
      if (updateData.assignedDriver === 'Unassigned' || !updateData.assignedDriver) {
        actType = 'VEHICLE_UNASSIGNED';
        actTitle = 'Vehicle Unassigned';
        actDesc = `Vehicle ${vehicle.vehicleNumber} unassigned from Driver.`;
      } else {
        actType = 'VEHICLE_ASSIGNED';
        actTitle = 'Vehicle Assigned';
        actDesc = `Vehicle ${vehicle.vehicleNumber} assigned to Driver.`;
      }
    }

    await logActivity({
      title: actTitle,
      description: actDesc,
      activityType: actType,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleName: vehicle.vehicleName,
      relatedModule: 'Vehicle',
      relatedId: vehicle._id,
      user: req.user,
      assignedManager: req.user._id
    });

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

    if (vehicle.vehicleImage?.public_id) {
      console.log(`Deleting vehicle image from Cloudinary for vehicle ${vehicle.vehicleNumber}: ${vehicle.vehicleImage.public_id}`);
      await deleteImageFromCloudinary(vehicle.vehicleImage.public_id);
    }

    await deleteVehicleInRepo(req.params.id);

    await logActivity({
      title: 'Vehicle Deleted',
      description: `Vehicle ${vehicle.vehicleNumber} (${vehicle.vehicleName}) was deleted.`,
      activityType: 'VEHICLE_DELETED',
      vehicleNumber: vehicle.vehicleNumber,
      vehicleName: vehicle.vehicleName,
      relatedModule: 'Vehicle',
      relatedId: vehicle._id,
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 200, {}, 'Vehicle deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload vehicle document
 * POST /api/vehicles/upload-document
 * Expects multipart form-data with "document" field
 */
export const uploadVehicleDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return sendSuccess(
      res,
      201,
      {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        filename: req.file.filename,
      },
      'Document uploaded successfully'
    );
  } catch (error) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};
