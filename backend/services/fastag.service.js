import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import TollTransaction from '../models/TollTransaction.js';
import FastagTransaction from '../models/FastagTransaction.js';

/**
 * Runs a database function inside a transaction, with a fallback for
 * deployments (like standalone local mongo) that do not support transactions.
 */
export const runInTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    // Fallback if replica sets/transactions are not supported
    if (
      error.message.includes('Replica Set') || 
      error.message.includes('transaction numbers') ||
      error.message.includes('does not support transactions')
    ) {
      console.warn('⚠️ MongoDB deployment does not support transactions. Falling back to non-transactional execution.');
      return await fn(null);
    }
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Validates Fastag balance and deducts total toll amount from vehicle.
 * Logs a FastagTransaction (Success/Failed).
 */
export const processFastagDeduction = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Prevent duplicate deductions
  if (trip.fastagDeducted) {
    console.log(`FASTag already deducted for trip ${trip.tripNumber}.`);
    return;
  }

  // Calculate toll totals dynamically from the trip's toll records
  const tolls = await TollTransaction.find({ trip: tripId });
  const totalTollAmount = tolls.reduce((sum, t) => sum + t.amountPaid, 0);

  // If no tolls, mark as completed deduction and return
  if (totalTollAmount === 0) {
    trip.fastagDeducted = true;
    await trip.save();
    console.log(`No toll transactions found for trip ${trip.tripNumber}. Marked FASTag as deducted.`);
    return;
  }

  const vehicle = await Vehicle.findById(trip.vehicle);
  if (!vehicle) {
    throw new Error('Assigned vehicle not found');
  }

  const previousBalance = vehicle.fastagBalance || 0;

  // Validation: Do not allow the Fastag balance to become negative
  if (previousBalance < totalTollAmount) {
    // Create a failed transaction history record
    const failedTx = new FastagTransaction({
      trip: trip._id,
      vehicle: vehicle._id,
      previousBalance,
      amountDeducted: totalTollAmount,
      updatedBalance: previousBalance,
      dateTime: new Date(),
      status: 'Failed'
    });
    await failedTx.save();

    throw new Error(`Insufficient Fastag balance. Required: ₹${totalTollAmount.toLocaleString('en-IN')}, Available: ₹${previousBalance.toLocaleString('en-IN')}.`);
  }

  // Perform updates in transaction
  return await runInTransaction(async (session) => {
    const sessionVehicle = session 
      ? await Vehicle.findById(vehicle._id).session(session)
      : await Vehicle.findById(vehicle._id);
      
    const sessionTrip = session 
      ? await Trip.findById(trip._id).session(session)
      : await Trip.findById(trip._id);

    // Double-check flag in case of concurrent requests
    if (sessionTrip.fastagDeducted) {
      return;
    }

    const updatedBalance = sessionVehicle.fastagBalance - totalTollAmount;
    sessionVehicle.fastagBalance = updatedBalance;
    
    if (session) {
      await sessionVehicle.save({ session });
      sessionTrip.fastagDeducted = true;
      await sessionTrip.save({ session });
    } else {
      await sessionVehicle.save();
      sessionTrip.fastagDeducted = true;
      await sessionTrip.save();
    }

    const successTx = new FastagTransaction({
      trip: sessionTrip._id,
      vehicle: sessionVehicle._id,
      previousBalance,
      amountDeducted: totalTollAmount,
      updatedBalance,
      dateTime: new Date(),
      status: 'Success'
    });
    
    if (session) {
      await successTx.save({ session });
    } else {
      await successTx.save();
    }

    console.log(`Successfully deducted ₹${totalTollAmount} from vehicle ${sessionVehicle.vehicleNumber} FASTag balance.`);
  });
};
