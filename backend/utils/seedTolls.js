import TollTransaction from '../models/TollTransaction.js';
import Trip from '../models/Trip.js';

export const generateTollsForTrip = async (trip) => {
  const plazas = [
    { name: 'Khalapur Toll Plaza', location: 'Mumbai-Pune Expressway' },
    { name: 'Electronic City Toll Plaza', location: 'Bengaluru, KA' },
    { name: 'Lalru Toll Plaza', location: 'Ambala-Chandigarh Highway' },
    { name: 'Vasad Toll Plaza', location: 'Vadodara-Ahmedabad NH-8' },
    { name: 'Kherki Daula Toll Plaza', location: 'Gurugram, HR' },
    { name: 'Chennai Bypass Toll', location: 'Chennai, TN' },
    { name: 'NICE Road Plaza', location: 'Bengaluru, KA' }
  ];

  // 15% chance of 0 tolls for testing the empty state, otherwise 2 to 3 tolls.
  const numTolls = Math.random() < 0.15 ? 0 : (Math.floor(Math.random() * 2) + 2);
  const tripDate = new Date(trip.departureTime || Date.now());
  const transactions = [];

  for (let i = 0; i < numTolls; i++) {
    const plaza = plazas[Math.floor(Math.random() * plazas.length)];
    const amount = [120, 180, 230, 310, 485][Math.floor(Math.random() * 5)];
    // Generate chronological dates: each toll is crossed 1.5 to 3.5 hours after the previous
    const hoursOffset = 1.5 + (i * 2) + Math.random();
    const dateTime = new Date(tripDate.getTime() + hoursOffset * 3600 * 1000); 

    const txId = 'FT' + Math.floor(100000000000 + Math.random() * 900000000000);
    
    transactions.push({
      trip: trip._id,
      vehiclePlate: trip.vehiclePlate || 'MH-12-PQ-4567',
      tollPlazaName: plaza.name,
      location: plaza.location,
      dateTime: dateTime,
      amountPaid: amount,
      paymentMethod: 'FASTag',
      fastagTransactionId: txId,
      receiptStatus: 'Settled',
      receiptUrl: ''
    });
  }

  if (transactions.length > 0) {
    return await TollTransaction.insertMany(transactions);
  }
  return [];
};

export const seedTolls = async () => {
  try {
    const count = await TollTransaction.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial toll transactions...');
      const trips = await Trip.find({});
      if (trips.length === 0) {
        console.log('⚠️ No trips found. Toll transactions seeding skipped.');
        return;
      }

      let seededCount = 0;
      for (const trip of trips) {
        const created = await generateTollsForTrip(trip);
        seededCount += created.length;
      }
      console.log(`✅ ${seededCount} Toll transactions seeded successfully across ${trips.length} trips!`);
    }
  } catch (error) {
    console.error('Error seeding toll transactions:', error);
  }
};
