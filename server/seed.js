// Run with: npm run seed
// WARNING: clears all users, items and claims, then adds demo data.
require('dotenv').config({ quiet: true });
const connectDB = require('./config/db');
const { disconnectDB } = connectDB;
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');

// Returns a date that is `n` days in the past
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Item.deleteMany(), Claim.deleteMany()]);
  // Make sure the indexes (unique email, text search, unique claim) exist
  await Promise.all([User.syncIndexes(), Item.syncIndexes(), Claim.syncIndexes()]);

  // User.create runs the pre-save hook, so passwords get hashed
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  });
  const student = await User.create({
    name: 'Riya Sharma',
    email: 'student@college.edu',
    password: 'student123',
  });

  const items = [
    { title: 'Black Lenovo laptop charger', description: '65W charger with a frayed cable near the plug.', category: 'Electronics', type: 'lost', location: 'Library 2nd floor', date: daysAgo(1) },
    { title: 'Student ID card - Aman Verma', description: 'B.Tech CSE 3rd year ID card found near the stairs.', category: 'ID Card', type: 'found', location: 'Block A canteen', date: daysAgo(2) },
    { title: 'Data Structures textbook', description: 'Blue cover, name written on the first page, a few pages highlighted.', category: 'Books', type: 'lost', location: 'Room 204, Block B', date: daysAgo(3) },
    { title: 'Steel water bottle', description: 'Silver Milton bottle with a sticker of a mountain on it.', category: 'Bottles', type: 'found', location: 'Basketball court', date: daysAgo(4) },
    { title: 'Bike keys with red keychain', description: 'Two keys on a red rubber keychain shaped like a car.', category: 'Keys', type: 'lost', location: 'Parking lot gate 2', date: daysAgo(5) },
    { title: 'Grey hoodie', description: 'Medium size grey hoodie left on a chair after the seminar.', category: 'Clothing', type: 'found', location: 'Auditorium', date: daysAgo(6) },
    { title: 'Black backpack', description: 'Wildcraft backpack with notebooks and a calculator inside.', category: 'Bags', type: 'lost', location: 'Bus stop near main gate', date: daysAgo(7) },
    { title: 'Wireless earbuds case', description: 'White earbuds charging case, no earbuds inside.', category: 'Electronics', type: 'found', location: 'Computer lab 3', date: daysAgo(8) },
  ];

  // Alternate the owner so both accounts have posts to test with
  await Item.insertMany(
    items.map((item, i) => ({ ...item, postedBy: i % 2 === 0 ? student._id : admin._id }))
  );

  console.log('Seed complete:');
  console.log('  Admin   -> admin@college.edu / admin123');
  console.log('  Student -> student@college.edu / student123');
  console.log(`  ${items.length} sample items added`);

  await disconnectDB();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
