require('../env');

const { connectDb } = require('../src/db');
const { syncGoogleReviews } = require('../src/services/googlePlaces');

async function main() {
  await connectDb();
  const result = await syncGoogleReviews({ force: true });
  // eslint-disable-next-line no-console
  console.log('[google-reviews] sync result:', JSON.stringify(result, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[google-reviews] sync failed:', err?.message || err);
    process.exit(1);
  });

