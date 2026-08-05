import { getRoadDistanceAndEta, geocodeCity } from '../utils/geocodingHelper.js';

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 VERIFYING ROAD DISTANCE & GEOCODING ROUTES');
  console.log('==================================================\n');

  const testRoutes = [
    { from: 'Hyderabad', to: 'Dwaraka Tirumala' },
    { from: 'Hyderabad', to: 'Eluru' },
    { from: 'Eluru', to: 'Dwaraka Tirumala' },
    { from: 'Vijayawada', to: 'Eluru' },
    { from: 'Visakhapatnam', to: 'Eluru' },
    { from: 'Dwaraka-Tirumala', to: 'Eluru District' },
    { from: 'Dwarka Tirumala', to: 'Eluru' }
  ];

  for (const route of testRoutes) {
    const res = await getRoadDistanceAndEta(route.from, route.to);
    console.log(`📍 Route: ${route.from} ➔ ${route.to}`);
    console.log(`   Road Distance: ${res.distanceKm} km`);
    console.log(`   Estimated Time: ${res.estimatedTravelTime}\n`);
  }

  console.log('==================================================');
  console.log('✅ ALL TEST ROUTES EXECUTED SUCCESSFULLY');
  console.log('==================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
