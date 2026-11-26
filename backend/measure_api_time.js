async function testTime() {
  const t0 = Date.now();
  try {
    const res = await fetch('http://localhost:5000/api/subscriptions/public/plans');
    console.log(`Public plans API returned status ${res.status} in ${Date.now() - t0}ms`);
  } catch (err) {
    console.log(`Public plans API error after ${Date.now() - t0}ms:`, err.message);
  }
}
testTime();
