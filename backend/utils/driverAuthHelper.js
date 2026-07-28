import Driver from '../models/Driver.js';

/**
 * Generates the next sequential unique Employee ID formatted as DRV-000001, DRV-000002...
 */
export const generateEmployeeId = async () => {
  try {
    // Find highest DRV-XXXXXX employeeId
    const highestDriver = await Driver.findOne({
      employeeId: { $regex: /^DRV-\d+$/i }
    })
      .sort({ employeeId: -1 })
      .select('employeeId')
      .lean();

    let nextNumber = 1;
    if (highestDriver && highestDriver.employeeId) {
      const match = highestDriver.employeeId.match(/^DRV-(\d+)$/i);
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Ensure uniqueness by looping if needed
    let unique = false;
    let formattedId = '';
    while (!unique) {
      formattedId = `DRV-${String(nextNumber).padStart(6, '0')}`;
      const existing = await Driver.findOne({ employeeId: formattedId });
      if (!existing) {
        unique = true;
      } else {
        nextNumber++;
      }
    }

    return formattedId;
  } catch (error) {
    console.error('Error generating Employee ID:', error);
    // Fallback timestamp-based code if query fails
    return `DRV-${Math.floor(100000 + Math.random() * 900000)}`;
  }
};

/**
 * Generates a secure temporary password containing:
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special Character (@, #, $, %, !)
 * Example: Drv@4832, Temp@9184
 */
export const generateTempPassword = () => {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const specials = '@#$%!';

  const getRandomChar = (str) => str.charAt(Math.floor(Math.random() * str.length));

  // Guarantee at least 1 upper, 1 lower, 1 special, 4 digits
  const part1 = getRandomChar(uppers);
  const part2 = getRandomChar(lowers);
  const part3 = getRandomChar(lowers);
  const part4 = getRandomChar(specials);
  const digits = Array.from({ length: 4 }, () => getRandomChar(numbers)).join('');

  return `${part1}${part2}${part3}${part4}${digits}`;
};
