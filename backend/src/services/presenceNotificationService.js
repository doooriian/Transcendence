import prisma from "../prismaClient.js";

// Notify all friends of a user's presence change through their Socket.IO rooms
async function notifyFriendsPresenceChanged(io, authId) {
  const user = await prisma.user.findUnique({
    where: {
      authId,
    },
    select: {
      friendships: {
        select: {
          friend: {
            select: {
              authId: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return;
  }

  for (const friendship of user.friendships) {
    io.to(`user:${friendship.friend.authId}`).emit("presence:changed");
  }
}

export { notifyFriendsPresenceChanged };
