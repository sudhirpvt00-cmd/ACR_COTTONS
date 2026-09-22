import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================================
// ACR PRINTS (ACR COTTONS) SEED DATA
// Founder: A.C. Raj Kumar | Erode, Tamil Nadu ("Textile Valley of South India")
// ============================================================================

const CATEGORIES = [
  {
    name: 'Pillowcases & Shams',
    slug: 'pillowcases-shams',
    description: 'Textured woven pillowcases, embellished standard covers, and satin European shams for restful luxury.',
    imageUrl: '/images/products/pillow_cover_1.jpeg',
  },
  {
    name: 'Accent Cushions',
    slug: 'accent-cushions',
    description: 'Embroidered branch cushions, velvet lumbar cushions, and intricate jacquard pillows.',
    imageUrl: '/images/products/pillow_cover_5.jpeg',
  },
  {
    name: 'Large Bedding',
    slug: 'large-bedding',
    description: 'Regal damask bedspreads, silk charmeuse coverlets, and detailed embroidered duvet sets.',
    imageUrl: '/images/products/pillow_cover_8.jpeg',
  },
  {
    name: 'Curated Sets & Bundles',
    slug: 'curated-sets-bundles',
    description: 'Royal Neutral Bed Set Boxes and Bold & Vibrant Sheet Sets directly from Erode weavers.',
    imageUrl: '/images/products/pillow_cover_10.jpeg',
  },
];

const PRODUCTS = [
  {
    title: 'Textured Queen Pillowcase',
    slug: 'textured-queen-pillowcase',
    description: 'Crafted with premium textured woven fabric for breathability and everyday luxury. Features fine tailored flanges and envelope closure. Designed for serene, boutique-hotel sleeping comfort.',
    price: 55,
    comparePrice: 85,
    fabric: 'Textured Woven Cotton',
    color: 'Warm Ivory / Cream',
    sizes: JSON.stringify(['Standard (20x26 in)', 'Queen (20x30 in)', 'King (20x36 in)']),
    images: JSON.stringify([
      '/images/products/pillow_cover_1.jpeg',
      '/images/products/pillow_cover_2.jpeg',
    ]),
    stock: 25,
    isFeatured: true,
    isNewArrival: true,
    categorySlug: 'pillowcases-shams',
  },
  {
    title: 'Embellished Standard Pillowcase',
    slug: 'embellished-standard-pillowcase',
    description: 'Exquisite embellished fabric finish with artisan stitched borders. Blends traditional Erode cotton craftsmanship with contemporary bedroom decor.',
    price: 65,
    comparePrice: 95,
    fabric: 'Embellished Fabric Finish',
    color: 'Floral Print / Multi',
    sizes: JSON.stringify(['Standard (20x26 in)', 'Queen (20x30 in)']),
    images: JSON.stringify([
      '/images/products/pillow_cover_2.jpeg',
      '/images/products/pillow_cover_3.jpeg',
    ]),
    stock: 20,
    isFeatured: true,
    isNewArrival: false,
    categorySlug: 'pillowcases-shams',
  },
  {
    title: 'Satin European Sham',
    slug: 'satin-european-sham',
    description: 'Lustrous satin weave with a subtle silky sheen and ultra-smooth hand feel. Reversible design with hidden zip closure.',
    price: 79,
    comparePrice: 110,
    fabric: 'Satin Weave Cotton',
    color: 'Royal Maroon & Gold',
    sizes: JSON.stringify(['Euro Sham (26x26 in)']),
    images: JSON.stringify([
      '/images/products/pillow_cover_3.jpeg',
      '/images/products/pillow_cover_4.jpeg',
    ]),
    stock: 18,
    isFeatured: false,
    isNewArrival: true,
    categorySlug: 'pillowcases-shams',
  },
  {
    title: 'Embroidered Accent Cushion',
    slug: 'embroidered-accent-cushion',
    description: 'Soft blush pink linen with metallic branch embroidery. Delivers a sophisticated designer accent for living room sofas and bedroom headboards.',
    price: 75,
    comparePrice: 115,
    fabric: 'Soft Blush Pink Linen with Metallic Branch Embroidery',
    color: 'Blush Pink / Gold',
    sizes: JSON.stringify(['16x16 in', '18x18 in']),
    images: JSON.stringify([
      '/images/products/pillow_cover_4.jpeg',
      '/images/products/pillow_cover_5.jpeg',
    ]),
    stock: 15,
    isFeatured: true,
    isNewArrival: true,
    categorySlug: 'accent-cushions',
  },
  {
    title: 'Velvet Lumbar Cushion',
    slug: 'velvet-lumbar-cushion',
    description: 'Sumptuous plush velvet finish with piped edges. Provides ergonomic lower back comfort while elevating your seating ensemble.',
    price: 89,
    comparePrice: 130,
    fabric: 'Velvet Finish',
    color: 'Emerald Velvet',
    sizes: JSON.stringify(['12x20 in Lumbar', '14x22 in Lumbar']),
    images: JSON.stringify([
      '/images/products/pillow_cover_5.jpeg',
      '/images/products/pillow_cover_6.jpeg',
    ]),
    stock: 14,
    isFeatured: true,
    isNewArrival: false,
    categorySlug: 'accent-cushions',
  },
  {
    title: 'Intricate Jacquard Pillow',
    slug: 'intricate-jacquard-pillow',
    description: 'Heavyweight Jacquard weave with raised dimensional motifs. Woven on traditional Erode jacquard looms for long-lasting structural elegance.',
    price: 99,
    comparePrice: 145,
    fabric: 'Jacquard Weave',
    color: 'Classic Brocade Multi',
    sizes: JSON.stringify(['18x18 in', '20x20 in']),
    images: JSON.stringify([
      '/images/products/pillow_cover_6.jpeg',
      '/images/products/pillow_cover_7.jpeg',
    ]),
    stock: 12,
    isFeatured: false,
    isNewArrival: true,
    categorySlug: 'accent-cushions',
  },
  {
    title: 'Embroidered Duvet Cover',
    slug: 'embroidered-duvet-cover',
    description: 'Detailed embroidered detailing across the duvet face with corner ties to keep your comforter in place. Breathable 300-thread count pure combed cotton.',
    price: 179,
    comparePrice: 249,
    fabric: 'Embroidered Combed Cotton',
    color: 'Pristine White / Charcoal',
    sizes: JSON.stringify(['Queen (90x90 in)', 'King (104x90 in)']),
    images: JSON.stringify([
      '/images/products/pillow_cover_7.jpeg',
      '/images/products/pillow_cover_8.jpeg',
    ]),
    stock: 10,
    isFeatured: true,
    isNewArrival: true,
    categorySlug: 'large-bedding',
  },
  {
    title: 'Silk Charmeuse Coverlet',
    slug: 'silk-charmeuse-coverlet',
    description: 'Sensational silk charmeuse with diamond box quilting and lightweight temperature-regulating fill. Drapes gracefully to create a serene sanctuary.',
    price: 199,
    comparePrice: 289,
    fabric: 'Silk Charmeuse',
    color: 'Champagne Gold',
    sizes: JSON.stringify(['Queen (92x96 in)', 'King (108x96 in)']),
    images: JSON.stringify([
      '/images/products/pillow_cover_8.jpeg',
      '/images/products/pillow_cover_9.jpeg',
    ]),
    stock: 8,
    isFeatured: true,
    isNewArrival: false,
    categorySlug: 'large-bedding',
  },
  {
    title: 'Regal Damask Bedspread',
    slug: 'regal-damask-bedspread',
    description: 'Opulent damask patterned weave inspired by heritage Indian palace suites. Generous drop length with matching tailored pillow covers included.',
    price: 299,
    comparePrice: 399,
    fabric: 'Damask Patterned Weave',
    color: 'Navy & Gold Damask',
    sizes: JSON.stringify(['Queen Bed Set (3 Pcs)', 'King Bed Set (3 Pcs)']),
    images: JSON.stringify([
      '/images/products/pillow_cover_9.jpeg',
      '/images/products/pillow_cover_10.jpeg',
    ]),
    stock: 7,
    isFeatured: false,
    isNewArrival: true,
    categorySlug: 'large-bedding',
  },
  {
    title: 'Royal Neutral Bed Set Box (Curated Bundle)',
    slug: 'royal-neutral-bed-set-box',
    description: 'Curated cloth subscription bundle containing 1 Regal Bedspread, 2 Jacquard Accent Pillows, and 2 Textured Queen Pillowcases. Direct from Erode artisans.',
    price: 499,
    comparePrice: 699,
    fabric: '100% Erode Combed Cotton',
    color: 'Royal Neutral Palette',
    sizes: JSON.stringify(['Complete 5-Piece Bedroom Bundle']),
    images: JSON.stringify([
      '/images/products/pillow_cover_10.jpeg',
      '/images/products/pillow_cover_1.jpeg',
    ]),
    stock: 15,
    isFeatured: true,
    isNewArrival: true,
    categorySlug: 'curated-sets-bundles',
  },
];

async function main() {
  console.log('🌱 Seeding ACR Prints database with actual products & photos...');

  // 1. Create/Verify Admin & Demo Customer
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const demoUserPassword = await bcrypt.hash('Customer@12345', 10);

  const admin = await prisma.user.upsert({
    where: { mobile: '9876543210' },
    update: {},
    create: {
      name: 'ACR Prints Admin',
      mobile: '9876543210',
      email: 'admin@acrprints.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { mobile: '9876501234' },
    update: {},
    create: {
      name: 'Priya Sharma',
      mobile: '9876501234',
      email: 'priya@example.com',
      password: demoUserPassword,
      role: 'CUSTOMER',
    },
  });

  console.log(`👤 Verified Admin: ${admin.mobile} (Pass: Admin@12345)`);
  console.log(`👤 Verified Customer: ${demoCustomer.mobile} (Pass: Customer@12345)`);

  // Clear existing products and categories to ensure clean reload with ACR Prints catalog
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Seed Categories
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log(`🏷️  Seeded ${CATEGORIES.length} Categories for ACR Prints`);

  // 3. Seed Products
  const createdProducts = [];
  for (const prod of PRODUCTS) {
    const categoryId = categoryMap[prod.categorySlug];
    const { categorySlug, ...prodData } = prod;
    const p = await prisma.product.create({
      data: {
        ...prodData,
        categoryId,
      },
    });
    createdProducts.push(p);
  }
  console.log(`📦 Seeded ${PRODUCTS.length} ACR Prints Products with Photos`);

  // 4. Seed Demo Address for Customer
  const demoAddr = await prisma.address.upsert({
    where: { id: 'demo-address-1' },
    update: {},
    create: {
      id: 'demo-address-1',
      userId: demoCustomer.id,
      fullName: 'Priya Sharma',
      mobile: '9876501234',
      street: 'Flat 402, Royal Palms Residency, Perundurai Road',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638011',
      isDefault: true,
    },
  });

  // 5. Seed Demo Placed Order with Live Tracking Timeline
  const demoOrderNumber = 'ACR-ORD-2026-8910';
  const demoTrackingNumber = 'ACR-TRK-891024';
  const trackingTimeline = [
    { step: 1, title: 'Order Confirmed', description: 'Order verified & assigned to Erode Atelier', timestamp: '2026-09-20 10:30 AM', completed: true },
    { step: 2, title: 'Artisan Weaving & Quality Inspection', description: 'Bedding inspected by Master Weaver at Surampatti Valasu', timestamp: '2026-09-20 03:45 PM', completed: true },
    { step: 3, title: 'Packed & Dispatched', description: 'Sealed in royal textile moisture-proof box', timestamp: '2026-09-21 09:15 AM', completed: true },
    { step: 4, title: 'In Transit via Express Courier', description: 'Dispatched via Erode Express Logistics · Air Consignment', timestamp: '2026-09-21 06:00 PM', completed: true },
    { step: 5, title: 'Out for Delivery', description: 'Courier partner out for delivery to destination', timestamp: 'Estimated Today by 6:00 PM', completed: false, current: true },
  ];

  await prisma.order.deleteMany({ where: { userId: demoCustomer.id } });
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: demoOrderNumber,
      trackingNumber: demoTrackingNumber,
      userId: demoCustomer.id,
      totalAmount: 354,
      shippingFee: 0,
      status: 'SHIPPED',
      carrier: 'Erode Express Logistics',
      trackingUpdates: JSON.stringify(trackingTimeline),
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      shippingAddress: JSON.stringify({
        fullName: 'Priya Sharma',
        mobile: '9876501234',
        street: 'Flat 402, Royal Palms Residency, Perundurai Road',
        city: 'Erode',
        state: 'Tamil Nadu',
        pincode: '638011',
      }),
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            title: createdProducts[0].title,
            price: createdProducts[0].price,
            quantity: 2,
            imageUrl: '/images/products/pillow_cover_1.jpeg',
            size: 'Standard (20x26 in)',
          },
          {
            productId: createdProducts[1].id,
            title: createdProducts[1].title,
            price: createdProducts[1].price,
            quantity: 1,
            imageUrl: '/images/products/pillow_cover_2.jpeg',
            size: 'Queen (20x30 in)',
          },
        ],
      },
    },
  });
  console.log(`🚚 Seeded Demo Order with Tracking ID: ${demoTrackingNumber}`);

  // 6. Seed Demo Custom T-Shirt Order (MOQ: 15 units >= 10)
  await prisma.customTshirtOrder.deleteMany({ where: { userId: demoCustomer.id } });
  const customTrackingNumber = 'ACR-TRK-TSHIRT-5521';
  const customTrackingTimeline = [
    { step: 1, title: 'Custom Artwork & Vector Verified', description: 'Logo resolution verified for high-density screen printing', timestamp: '2026-09-19 11:00 AM', completed: true },
    { step: 2, title: 'Fabric Cutting & Screen Preparation', description: '180 GSM Bio-Washed Combed Cotton prepared', timestamp: '2026-09-20 02:30 PM', completed: true },
    { step: 3, title: 'Direct-to-Garment / Screen Printing', description: 'Multi-layer pigment cure & heat press application', timestamp: '2026-09-21 04:15 PM', completed: true },
    { step: 4, title: 'Dispatched from Erode Workshop', description: 'Consignment handed over to DTDC Royal Air Cargo', timestamp: '2026-09-22 08:30 AM', completed: true },
    { step: 5, title: 'Delivered', description: 'Delivered to client location with signature confirmation', timestamp: 'Pending', completed: false, current: true },
  ];

  await prisma.customTshirtOrder.create({
    data: {
      orderNumber: 'ACR-TSHIRT-100482',
      trackingNumber: customTrackingNumber,
      userId: demoCustomer.id,
      tshirtColor: 'Royal Charcoal',
      fabricGsm: '180 GSM Bio-Washed Combed Cotton',
      printPosition: 'Front Chest & Pocket Logo',
      designPreviewUrl: '/images/products/pillow_cover_5.jpeg',
      customText: 'ACR COTTONS - ERODE ATELIER',
      textColor: '#D4AF37',
      sizeBreakdown: JSON.stringify({ S: 3, M: 5, L: 4, XL: 3 }),
      totalQuantity: 15, // >= 10
      pricePerUnit: 279,
      totalAmount: 4185,
      shippingAddress: JSON.stringify({
        fullName: 'Priya Sharma',
        mobile: '9876501234',
        street: 'Flat 402, Royal Palms Residency, Perundurai Road',
        city: 'Erode',
        state: 'Tamil Nadu',
        pincode: '638011',
      }),
      paymentMethod: 'COD',
      status: 'PRINTING',
      carrier: 'DTDC Royal Air Cargo',
      trackingUpdates: JSON.stringify(customTrackingTimeline),
      notes: 'Corporate batch order with gold metallic accents.',
    },
  });
  console.log(`👕 Seeded Demo Custom T-Shirt Order (15 units) with Tracking ID: ${customTrackingNumber}`);

  console.log('✅ ACR Cottons Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
