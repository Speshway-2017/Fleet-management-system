import Driver from '../models/Driver.js';

/**
 * Synchronize driver location fields across MongoDB records.
 * Corrects legacy records where branch/currentLocation was defaulted to 'Pune' instead of user-specified city.
 */
export async function syncDriverLocations() {
  try {
    const drivers = await Driver.find({});
    let updatedCount = 0;

    for (const d of drivers) {
      const locToUse = (d.driverLocation || d.currentLocation || d.city || d.address || '').trim();
      
      if (locToUse && locToUse.toLowerCase() !== 'pune') {
        let needsUpdate = false;
        if (!d.branch || d.branch === 'Pune' || d.branch === '') {
          d.branch = locToUse;
          needsUpdate = true;
        }
        if (!d.driverLocation || d.driverLocation === 'Pune' || d.driverLocation === '') {
          d.driverLocation = locToUse;
          needsUpdate = true;
        }
        if (!d.currentLocation || d.currentLocation === 'Pune' || d.currentLocation === '') {
          d.currentLocation = locToUse;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await d.save();
          updatedCount++;
        }
      }
    }
    if (updatedCount > 0) {
      console.log(`🔄 Synced ${updatedCount} driver locations from city inputs.`);
    }
  } catch (err) {
    console.error('Error syncing driver locations:', err);
  }
}
