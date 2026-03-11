const { PrismaClient } = require('./app/generated/prisma/client.js');

const prisma = new PrismaClient();

async function checkReplies() {
  try {
    // Get Alice's user ID
    const alice = await prisma.user.findFirst({
      where: { username: 'alice' }
    });

    if (!alice) {
      console.log('❌ Alice user not found');
      return;
    }

    console.log(`✅ Alice found: ${alice.username} (ID: ${alice.id})`);
    console.log('');

    // Get all posts by Alice
    const allPosts = await prisma.post.findMany({
      where: { authorId: alice.id },
      select: {
        id: true,
        content: true,
        parentId: true,
        authorId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total posts by Alice: ${allPosts.length}`);
    console.log('');

    // Separate replies from original posts
    const replies = allPosts.filter(p => p.parentId !== null);
    const originalPosts = allPosts.filter(p => p.parentId === null);

    console.log(`📝 Original posts: ${originalPosts.length}`);
    console.log(`💬 Replies: ${replies.length}`);
    console.log('');

    if (replies.length > 0) {
      console.log('=== REPLIES ===');
      replies.forEach((reply, index) => {
        console.log(`\n${index + 1}. Reply ID: ${reply.id}`);
        console.log(`   Author ID: ${reply.authorId}`);
        console.log(`   Parent ID: ${reply.parentId}`);
        console.log(`   Content: ${reply.content.substring(0, 50)}...`);
        console.log(`   Created: ${reply.createdAt}`);
      });
    } else {
      console.log('⚠️  No replies found for Alice');
    }

    console.log('\n');
    console.log('=== TESTING getUserReplies QUERY ===');
    
    // Test the exact query from getUserReplies
    const testReplies = await prisma.post.findMany({
      where: {
        authorId: alice.id,
        parentId: { not: null },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            verified: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    console.log(`Query result: ${testReplies.length} replies`);
    testReplies.forEach((r, i) => {
      console.log(`${i + 1}. ${r.content.substring(0, 40)} (parent: ${r.parentId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReplies();
