/**
 * Backend Fuel Calculation and Indian Currency Formatting Utilities
 * Provides exact BigInt paise arithmetic, deduplication, and precise Indian currency formatting.
 */

/**
 * Validates whether a fuel record is eligible and approved for spend calculation.
 * Excludes rejected, pending, anomaly, deleted, and invalid logs.
 * 
 * @param {Object} record - The fuel record object
 * @returns {boolean} True if approved and eligible, false otherwise
 */
export const isEligibleFuelRecord = (record) => {
  if (!record) return false;
  
  // Status check: Anomaly records are excluded unless marked resolved
  const status = String(record.status || '').toLowerCase().trim();
  if (status === 'anomaly') return false;

  // Approval / Bill status checks
  const approval = String(record.approvalStatus || record.billStatus || '').trim().toUpperCase();
  
  // Explicitly rejected or pending logs are excluded
  if (approval === 'REJECTED' || approval === 'REJECT') return false;
  if (approval === 'PENDING' || approval === 'UPLOADED' || approval === 'FINAL VALIDATION' || !approval) {
    return status === 'resolved';
  }

  // Eligible statuses
  return approval === 'APPROVED' || approval === 'VERIFIED' || approval === 'APPROVE' || status === 'resolved';
};

/**
 * Safely parses any value (number or string) into a clean positive Rupee float.
 * 
 * @param {number|string} val - Amount in Rupees
 * @returns {number} Clean positive float in Rupees
 */
export const parseNumericAmount = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val) || val <= 0) return 0;
    return val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num) || !isFinite(num) || num <= 0) return 0;
    return num;
  }
  return 0;
};

/**
 * Safely parses any amount input into BigInt paise (integer cents: Rupees * 100).
 * Prevents IEEE-754 precision loss on huge values.
 * 
 * @param {number|string|bigint} val - Amount in Rupees
 * @returns {bigint} Amount in Paise
 */
export const parseAmountToPaise = (val) => {
  if (val === null || val === undefined || val === '') return 0n;
  if (typeof val === 'bigint') return val * 100n;
  
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val) || val <= 0) return 0n;
    if (val <= Number.MAX_SAFE_INTEGER) return BigInt(Math.round(val * 100));
    val = val.toLocaleString('fullwide', { useGrouping: false });
  }
  
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    if (!cleaned) return 0n;
    const parts = cleaned.split('.');
    let rupeesStr = parts[0] || '0';
    let paiseStr = (parts[1] || '').padEnd(2, '0').slice(0, 2);
    const isNegative = rupeesStr.startsWith('-');
    if (isNegative) rupeesStr = rupeesStr.slice(1);
    try {
      const rupeesBig = BigInt(rupeesStr || '0');
      const paiseBig = BigInt(paiseStr || '0');
      const totalPaise = rupeesBig * 100n + paiseBig;
      return isNegative ? -totalPaise : totalPaise;
    } catch {
      return 0n;
    }
  }
  
  return 0n;
};

/**
 * Formats BigInt paise into standard Indian Numbering currency (INR).
 * Examples:
 * - 0n -> "₹0.00"
 * - 16032000n -> "₹1,60,320.00"
 * - 574575478547575400252200n -> "₹5,74,57,54,78,54,75,75,40,02,522.00"
 * 
 * @param {bigint} totalPaise - Amount in paise
 * @param {boolean} forceDecimals - Whether to force .00 decimal display
 * @returns {string} Formatted Indian currency string
 */
export const formatPaiseToIndianCurrency = (totalPaise, forceDecimals = true) => {
  if (!totalPaise || totalPaise === 0n) return '₹0.00';
  
  const isNegative = totalPaise < 0n;
  const absPaise = isNegative ? -totalPaise : totalPaise;
  const rupeesBig = absPaise / 100n;
  const paiseBig = absPaise % 100n;
  
  let str = rupeesBig.toString();
  let lastThree = str.length > 3 ? str.slice(-3) : str;
  let remaining = str.length > 3 ? str.slice(0, -3) : '';
  
  if (remaining !== '') {
    const chunks = [];
    while (remaining.length > 2) {
      chunks.unshift(remaining.slice(-2));
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      chunks.unshift(remaining);
    }
    str = chunks.join(',') + ',' + lastThree;
  } else {
    str = lastThree;
  }
  
  let formatted = (isNegative ? '-₹' : '₹') + str;
  if (forceDecimals || paiseBig > 0n) {
    formatted += '.' + paiseBig.toString().padStart(2, '0');
  }
  return formatted;
};

/**
 * Converts BigInt paise back to a standard rupee number with 2 decimal precision.
 * 
 * @param {bigint} paiseBigInt - Amount in Paise
 * @returns {number} Amount in Rupees
 */
export const paiseToRupees = (paiseBigInt) => {
  if (!paiseBigInt || paiseBigInt <= 0n) return 0;
  const paise = Number(paiseBigInt);
  return paise / 100;
};

/**
 * Calculates total fuel spend for a collection of fuel records.
 * Ensures deduplication by ID, eligibility filtering, and exact BigInt paise math.
 * 
 * @param {Array<Object>} records - Array of fuel records
 * @returns {{ totalSpend: number, totalPaise: bigint, approvedCount: number, formattedTotal: string, eligibleRecords: Array<Object> }}
 */
export const calculateTotalFuelSpend = (records = []) => {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalSpend: 0,
      totalPaise: 0n,
      approvedCount: 0,
      formattedTotal: '₹0.00',
      eligibleRecords: []
    };
  }

  const seenIds = new Set();
  const eligibleRecords = [];
  let totalPaise = 0n;

  for (const record of records) {
    if (!record) continue;
    
    const recordId = String(record._id || record.id || '');
    if (recordId) {
      if (seenIds.has(recordId)) {
        continue;
      }
      seenIds.add(recordId);
    }

    if (isEligibleFuelRecord(record)) {
      eligibleRecords.push(record);
      const rawAmount = record.amount !== undefined && record.amount !== null
        ? record.amount
        : (record.totalCost ?? record.cost ?? 0);
      const amountPaise = parseAmountToPaise(rawAmount);
      totalPaise += amountPaise;
    }
  }

  const formattedTotal = formatPaiseToIndianCurrency(totalPaise, true);
  const totalSpend = Number(totalPaise) / 100;

  return {
    totalSpend,
    totalPaise,
    approvedCount: eligibleRecords.length,
    formattedTotal,
    eligibleRecords
  };
};

/**
 * Formats any rupee amount or paise into exact Indian currency.
 * 
 * @param {number|string|bigint} amountInRupees - Amount in rupees
 * @returns {string} Formatted Indian currency string
 */
export const formatFuelSpend = (amountInRupees) => {
  if (amountInRupees === null || amountInRupees === undefined || amountInRupees === '') {
    return '₹0.00';
  }
  const paise = parseAmountToPaise(amountInRupees);
  return formatPaiseToIndianCurrency(paise, true);
};
