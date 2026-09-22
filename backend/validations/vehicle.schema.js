import { z } from 'zod';
import { optionalMongoIdSchema, numericAmountSchema } from './common.schema.js';

export const createVehicleSchema = z.object({
  vehicleNumber: z.string().trim().min(2, 'Vehicle number is required.').optional(),
  plateNumber: z.string().trim().min(2, 'Plate number is required.').optional(),
  vehicleName: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  model: z.string({ required_error: 'Model is required.' }).trim().min(1, 'Model is required.'),
  vehicleType: z.string().trim().optional(),
  type: z.string().trim().optional(),
  fuelType: z.string({ required_error: 'Fuel type is required.' }).trim().min(1, 'Fuel type is required.'),
  chassisNumber: z.string().trim().length(17, 'Chassis Number must be exactly 17 characters.').optional().or(z.literal('')),
  capacity: numericAmountSchema('Capacity').optional(),
  loadCapacity: numericAmountSchema('Load Capacity').optional(),
  fuelCapacity: numericAmountSchema('Fuel Capacity').optional(),
  currentOdometer: numericAmountSchema('Odometer').optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  assignedDriver: optionalMongoIdSchema('Driver ID'),
  status: z.string().optional(),
  availability: z.string().optional()
});

export const updateVehicleSchema = z.object({
  vehicleNumber: z.string().trim().min(2).optional(),
  plateNumber: z.string().trim().min(2).optional(),
  vehicleName: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  vehicleType: z.string().trim().optional(),
  type: z.string().trim().optional(),
  fuelType: z.string().trim().optional(),
  chassisNumber: z.string().trim().length(17, 'Chassis Number must be exactly 17 characters.').optional().or(z.literal('')),
  capacity: numericAmountSchema('Capacity').optional(),
  loadCapacity: numericAmountSchema('Load Capacity').optional(),
  fuelCapacity: numericAmountSchema('Fuel Capacity').optional(),
  currentOdometer: numericAmountSchema('Odometer').optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  assignedDriver: optionalMongoIdSchema('Driver ID'),
  status: z.string().optional(),
  availability: z.string().optional()
});

