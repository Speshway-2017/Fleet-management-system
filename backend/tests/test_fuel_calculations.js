import assert from 'node:assert';
import {
  isEligibleFuelRecord,
  parseNumericAmount,
  parseAmountToPaise,
  paiseToRupees,
  formatPaiseToIndianCurrency,
  calculateTotalFuelSpend,
  formatFuelSpend
} from '../utils/fuelCalculations.js';

console.log('--- Running Fuel Calculation & Formatting Tests ---');

// Test 1: Deduplication
const duplicateRecords = [
  { _id: 'fuel_1', amount: 5000, approvalStatus: 'Approved', status: 'normal' },
  { _id: 'fuel_1', amount: 5000, approvalStatus: 'Approved', status: 'normal' },
  { _id: 'fuel_2', amount: 3000, approvalStatus: 'Approved', status: 'normal' }
];
const dupResult = calculateTotalFuelSpend(duplicateRecords);
assert.strictEqual(dupResult.approvedCount, 2, 'Should only count 2 unique records');
assert.strictEqual(dupResult.totalSpend, 8000, 'Spend should be 8000 (5000 + 3000)');
console.log('✓ Test 1 Passed: Deduplication works properly');

// Test 2: Status Exclusion (Rejected, Pending, Anomaly)
const mixedRecords = [
  { _id: 'f_app1', amount: 1000, approvalStatus: 'Approved', status: 'normal' },
  { _id: 'f_rej', amount: 2000, approvalStatus: 'Rejected', status: 'normal' },
  { _id: 'f_pend', amount: 3000, approvalStatus: 'Pending', status: 'normal' },
  { _id: 'f_ano', amount: 4000, approvalStatus: 'Approved', status: 'anomaly' },
  { _id: 'f_res', amount: 500, approvalStatus: 'Approved', status: 'resolved' },
  { _id: 'f_res2', amount: 700, billStatus: 'Uploaded', status: 'resolved' }
];
const mixedResult = calculateTotalFuelSpend(mixedRecords);
assert.strictEqual(mixedResult.approvedCount, 3, 'Should only count 3 eligible records (f_app1, f_res, f_res2)');
assert.strictEqual(mixedResult.totalSpend, 2200, 'Total spend should be 1000 + 500 + 700 = 2200');
console.log('✓ Test 2 Passed: Rejected, Pending, and Anomaly logs correctly excluded');

// Test 3: Decimal Precision & Safe BigInt Paise Math
const decimalRecords = [
  { _id: 'd1', amount: '160320.50', approvalStatus: 'Approved' },
  { _id: 'd2', amount: 0.10, approvalStatus: 'Approved' },
  { _id: 'd3', amount: 0.20, approvalStatus: 'Approved' }
];
const decimalResult = calculateTotalFuelSpend(decimalRecords);
assert.strictEqual(decimalResult.totalSpend, 160320.80, 'Paise math should prevent floating point jitter');
assert.strictEqual(decimalResult.formattedTotal, '₹1,60,320.80', 'Formatted total matches ₹1,60,320.80');
console.log('✓ Test 3 Passed: Safe BigInt paise math prevents precision loss');

// Test 4: Formatter Tests (Exact Indian currency formatting)
assert.strictEqual(formatFuelSpend(0), '₹0.00', 'Zero amount formats as ₹0.00');
assert.strictEqual(formatFuelSpend(160320), '₹1,60,320.00', '160320 formats as ₹1,60,320.00');
assert.strictEqual(formatFuelSpend(160320.50), '₹1,60,320.50', '160320.50 formats as ₹1,60,320.50');
assert.strictEqual(formatFuelSpend("160320.00"), '₹1,60,320.00', 'String 160320.00 formats as ₹1,60,320.00');
console.log('✓ Test 4 Passed: Normal Indian currency formatted correctly');

// Test 5: Exact Sum Calculation (Arbitrary precision BigInt Indian formatting)
const hugeRecords = [
  { _id: 'h1', amount: '5745754785475754000000', approvalStatus: 'Approved' },
  { _id: 'h2', amount: 2500, approvalStatus: 'Approved' },
  { _id: 'h3', amount: 22, approvalStatus: 'Approved' }
];
const hugeResult = calculateTotalFuelSpend(hugeRecords);
assert.strictEqual(hugeResult.formattedTotal, '₹5,74,57,54,78,54,75,75,40,02,522.00', 'Exact BigInt sum is preserved without truncation');
console.log('✓ Test 5 Passed: Exact BigInt sum correctly calculated and formatted in Indian currency');

// Test 6: Status Transitions Simulation
let recordsState = [
  { _id: 'tx1', amount: 5000, approvalStatus: 'Pending', status: 'normal' }
];
assert.strictEqual(calculateTotalFuelSpend(recordsState).totalSpend, 0, 'Initial pending spend is 0');

// Manager Approves
recordsState = recordsState.map(r => r._id === 'tx1' ? { ...r, approvalStatus: 'Approved' } : r);
assert.strictEqual(calculateTotalFuelSpend(recordsState).totalSpend, 5000, 'After approve, spend is 5000');

// Manager Rejects
recordsState = recordsState.map(r => r._id === 'tx1' ? { ...r, approvalStatus: 'Rejected' } : r);
assert.strictEqual(calculateTotalFuelSpend(recordsState).totalSpend, 0, 'After reject, spend is 0 again');

console.log('✓ Test 6 Passed: Status transitions recalculate immediately and accurately');

console.log('\nAll 6 test suites passed with 100% success!');
