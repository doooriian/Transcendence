import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  deleteFriendRequest,
  removeFriend,
  type Friend,
  type FriendRequest,
} from "../services/friends";
import socket from "../services/socket";

function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const { theme } = useTheme();

  const [error, setError] = useState("");

  async function loadFriends() {
    try {
      const result = await getFriends();

      if (!result.ok) {
        setError("Unable to retrieve friends");
        return;
      }

      setFriends(result.friends);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to reach server");
    }
  }

  async function loadRequests() {
    try {
      const result = await getFriendRequests();

      if (!result.ok) {
        setError("Unable to retrieve requests");
        return;
      }

      setReceived(result.received);
      setSent(result.sent);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to reach server");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFriends();
    loadRequests();

    function handleFriendsChanged() {
      loadFriends();
      loadRequests();
    }

    socket.on("connect", handleFriendsChanged);
    socket.on("presence:changed", loadFriends);
    socket.on("friends:changed", handleFriendsChanged);

    return () => {
      socket.off("connect", handleFriendsChanged);
      socket.off("presence:changed", loadFriends);
      socket.off("friends:changed", handleFriendsChanged);
    };
  }, []);

  async function handleAccept(id: number) {
    const result = await acceptFriendRequest(id);

    if (!result.ok) {
      setError(result.data.message);
      return;
    }

    await loadFriends();
    await loadRequests();
  }

  async function handleReject(id: number) {
    const result = await deleteFriendRequest(id);

    if (!result.ok) {
      setError(result.data.message);
      return;
    }

    await loadRequests();
  }

  async function handleCancel(id: number) {
    const result = await deleteFriendRequest(id);

    if (!result.ok) {
      setError(result.data.message);
      return;
    }

    await loadRequests();
  }

  async function handleRemove(username: string) {
    const result = await removeFriend(username);

    if (!result.ok) {
      setError(result.data.message);
      return;
    }

    await loadFriends();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="min-h-[calc(100vh-73px)] px-4 py-10 pb-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-center">♟ Friends</h1>

          <p className="mt-3 text-center">
            Manage your friends and requests
          </p>

          {error && (
            <p className="mt-6 rounded-lg border border-red-700 bg-red-900/40 p-4 text-center text-red-300">
              {error}
            </p>
          )}

          {/* Friends */}

          <section className={`mt-10 rounded-2xl border border-slate-800 container-theme-${theme} p-6`}>
            <h2 className={`text-2xl font-bold`}>Your friends</h2>

            {friends.length === 0 ? (
              <p className="mt-4">
                You don't have any friends yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.username}
                    className="flex items-center justify-between rounded-lg bg-slate-800 p-4"
                  >
                    <div>
                      <span className="font-semibold">{friend.username}</span>

                      <span className="ml-3 text-sm">
                        {friend.isOnline ? "🟢" : "🔴"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemove(friend.username)}
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Received requests */}

          <section className={`mt-6 rounded-2xl border border-slate-800 container-theme-${theme} p-6`}>
            <h2 className={`text-2xl font-bold`}>Friend requests</h2>

            {received.length === 0 ? (
              <p className="mt-4">No pending requests.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {received.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-lg bg-slate-800 p-4"
                  >
                    <span className="font-semibold">{request.username}</span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700 transition"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => handleReject(request.id)}
                        className="rounded-lg bg-slate-700 px-4 py-2 font-semibold hover:bg-slate-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sent requests */}

          <section className={`mt-6 rounded-2xl border border-slate-800 container-theme-${theme} p-6`}>
            <h2 className={`text-2xl font-bold`}>Sent requests</h2>

            {sent.length === 0 ? (
              <p className="mt-4">No pending sent requests.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {sent.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-lg bg-slate-800 p-4"
                  >
                    <span className="font-semibold">{request.username}</span>

                    <button
                      onClick={() => handleCancel(request.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
     </div>
  );
}

export default Friends;
