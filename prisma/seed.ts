import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash a common password for demo users
  const demoPassword = await bcrypt.hash('password123', 10);

  // Create users
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      displayName: 'Alice Chen',
      password: demoPassword,
      bio: 'Designer & creative thinker. Building beautiful things. 🎨',
      location: 'San Francisco, CA',
      website: 'https://alicechen.design',
      verified: true,
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      displayName: 'Bob Martinez',
      password: demoPassword,
      bio: 'Software engineer. Coffee enthusiast. Love clean code. ☕💻',
      location: 'Austin, TX',
      website: 'https://bobdev.com',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { username: 'charlie' },
    update: {},
    create: {
      username: 'charlie',
      displayName: 'Charlie Kim',
      password: demoPassword,
      bio: 'Writer. Photographer. Always curious. 📸✍️',
      location: 'New York, NY',
    },
  });

  const diana = await prisma.user.upsert({
    where: { username: 'diana' },
    update: {},
    create: {
      username: 'diana',
      displayName: 'Diana Patel',
      password: demoPassword,
      bio: 'Product manager. Helping teams ship great products. 🚀',
      location: 'Seattle, WA',
      website: 'https://dianapatel.com',
    },
  });

  console.log('✅ Created users');

  // Clear existing posts and follows to make seed idempotent
  await prisma.follows.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.post.deleteMany({});

  // Create some posts
  await prisma.post.createMany({
    data: [
      {
        content: 'Just launched my new portfolio site! Clean design, smooth animations. Super proud of how it turned out.',
        authorId: alice.id,
      },
      {
        content: 'Recently switched to using TypeScript for all my projects. The developer experience is night and day.',
        authorId: bob.id,
      },
      {
        content: 'Beautiful sunset today. Sometimes you just need to step away from the screen and appreciate the moment.',
        authorId: charlie.id,
      },
      {
        content: 'Excited to share that our team just shipped a major update. Months of work finally paying off!',
        authorId: diana.id,
      },
      {
        content: 'Working on a new color palette for my design system. Minimalism is harder than it looks.',
        authorId: alice.id,
      },
      {
        content: 'Coffee thoughts: Why is naming variables the hardest part of programming?',
        authorId: bob.id,
      },
      {
        content: 'Started reading a new book on storytelling. The best products tell great stories.',
        authorId: diana.id,
      },
      {
        content: 'Quick tip: Take breaks. Your best ideas don\'t come from staring at a screen for 8 hours straight.',
        authorId: charlie.id,
      },
    ],
  });

  console.log('✅ Created posts');

  // Create some follow relationships
  await prisma.follows.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id },
      { followerId: alice.id, followingId: charlie.id },
      { followerId: bob.id, followingId: alice.id },
      { followerId: bob.id, followingId: diana.id },
      { followerId: charlie.id, followingId: alice.id },
      { followerId: charlie.id, followingId: diana.id },
      { followerId: diana.id, followingId: bob.id },
      { followerId: diana.id, followingId: charlie.id },
    ],
  });

  console.log('✅ Created follow relationships');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
