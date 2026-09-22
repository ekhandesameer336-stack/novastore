import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './src/config/db.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    description: 'Industry-leading noise cancellation with two processors and eight microphones. Exceptional sound quality with Ultra-clear hands-free calling.',
    price: 398.0,
    category: 'Audio',
    stock: 25,
    ratingAverage: 4.9,
    ratingCount: 128,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
  },
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    description: 'Full aluminum CNC machined body, double-gasket design, and hot-swappable switches for the ultimate typing and gaming experience.',
    price: 199.99,
    category: 'Electronics',
    stock: 40,
    ratingAverage: 4.8,
    ratingCount: 84,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
  },
  {
    name: 'Ergonomic Mesh High-Back Office Chair',
    description: 'Engineered for all-day comfort with dynamic lumbar support, 3D armrests, breathable mesh back, and pneumatic seat height adjustment.',
    price: 349.5,
    category: 'Furniture',
    stock: 15,
    ratingAverage: 4.7,
    ratingCount: 65,
    images: ['https://images.unsplash.com/photo-1580481077194-4c40b95b87fd?w=800&q=80'],
  },
  {
    name: 'Logitech MX Master 3S Advanced Wireless Mouse',
    description: '8K DPI any-surface tracking with quiet clicks and MagSpeed electromagnetic scrolling for remarkable precision and speed.',
    price: 99.99,
    category: 'Electronics',
    stock: 50,
    ratingAverage: 4.9,
    ratingCount: 210,
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'],
  },
  {
    name: 'Solid Walnut Minimalist Desk Shelf & Riser',
    description: 'Handcrafted solid American walnut dual-monitor stand designed to elevate your workspace and create clean storage underneath.',
    price: 145.0,
    category: 'Accessories',
    stock: 20,
    ratingAverage: 4.8,
    ratingCount: 42,
    images: ['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80'],
  },
  {
    name: 'Apple HomePod Mini Smart Speaker',
    description: 'Room-filling 360-degree audio with Siri voice assistant, intelligent smart home hub controls, and private by design.',
    price: 99.0,
    category: 'Audio',
    stock: 30,
    ratingAverage: 4.6,
    ratingCount: 94,
    images: ['https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80'],
  },
  {
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    description: 'Ultra-powerful 140W two-way fast charging with smart digital display, capable of fast-charging laptops, tablets, and phones simultaneously.',
    price: 129.99,
    category: 'Electronics',
    stock: 35,
    ratingAverage: 4.8,
    ratingCount: 115,
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'],
  },
  {
    name: 'Adjustable Electric Dual-Motor Standing Desk',
    description: 'Heavy-duty steel frame with programmable digital memory keypad, anti-collision sensor, and scratch-resistant solid wood desktop.',
    price: 499.0,
    category: 'Furniture',
    stock: 12,
    ratingAverage: 4.9,
    ratingCount: 78,
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'],
  },
];

export const seedDatabase = async () => {
  try {
    console.log('--- Seeding Database ---');
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Store Administrator',
        email: 'admin@example.com',
        password: 'admin123456',
        role: 'admin',
        address: {
          street: '100 Silicon Blvd',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
          country: 'United States',
        },
      });
      console.log('✓ Admin user created: admin@example.com / admin123456');
    }

    // Check if sample customer already exists
    const existingCustomer = await User.findOne({ email: 'customer@example.com' });
    if (!existingCustomer) {
      await User.create({
        name: 'Jane Customer',
        email: 'customer@example.com',
        password: 'customer123456',
        role: 'customer',
        address: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          zip: '97477',
          country: 'United States',
        },
      });
      console.log('✓ Sample customer created: customer@example.com / customer123456');
    }

    // Check if products exist
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`✓ Seeded ${sampleProducts.length} sample products into catalog.`);
    } else {
      console.log(`Catalog already has ${count} products.`);
    }

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error.message);
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(async () => {
    await disconnectDB();
    process.exit(0);
  });
}
