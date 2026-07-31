import mongoose from 'mongoose';
import Driver from '../models/Driver.js';

async function standardizeEmployeeIds() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fleet_management');
  console.log("Connected to MongoDB.");

  const drivers = await Driver.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 });
  console.log(`Found ${drivers.length} drivers in DB.`);

  let index = 1;
  const usedEmpIds = new Set();

  for (const d of drivers) {
    const oldId = d.employeeId || "";
    let newId = oldId;

    if (!oldId || oldId.toUpperCase().startsWith("DRV-")) {
      if (oldId.toUpperCase().startsWith("DRV-")) {
        const numPart = oldId.replace(/\D/g, '');
        const num = numPart ? parseInt(numPart, 10) : index;
        newId = `EMP-${String(num).padStart(6, '0')}`;
      } else {
        newId = `EMP-${String(index).padStart(6, '0')}`;
      }
    } else if (!oldId.toUpperCase().startsWith("EMP-")) {
      const numPart = oldId.replace(/\D/g, '');
      const num = numPart ? parseInt(numPart, 10) : index;
      newId = `EMP-${String(num).padStart(6, '0')}`;
    }

    // Ensure uniqueness
    while (usedEmpIds.has(newId)) {
      const numPart = newId.replace(/\D/g, '');
      const nextNum = (parseInt(numPart, 10) || index) + 1;
      newId = `EMP-${String(nextNum).padStart(6, '0')}`;
    }

    usedEmpIds.add(newId);

    if (oldId !== newId) {
      console.log(`Updating Driver "${d.fullName}" (${d._id}): "${oldId}" -> "${newId}"`);
      await Driver.findByIdAndUpdate(d._id, { employeeId: newId });
    } else {
      console.log(`Driver "${d.fullName}": "${newId}" (unchanged)`);
    }

    index++;
  }

  await mongoose.disconnect();
  console.log("Done standardizing Employee IDs.");
}

standardizeEmployeeIds().catch(console.error);
