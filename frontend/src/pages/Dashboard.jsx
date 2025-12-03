import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import DashboardTile from "../components/DashboardTile";
import RecentPullCard from "../components/RecentPullCard";
import StatsBar from "../components/StatsBar";

const API_BASE = "https://backend.codeoce.com";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);

      // Stats
      const statsRes = await fetch(`${API_BASE}/api/user/stats`, {
        credentials: "include",
      });
      const statsJson = await statsRes.json();
      setStats(statsJson);

      // Recent pulls
      const recRes = await fetch(`${API_BASE}/api/user/recent`, {
        credentials: "include",
      });
      const recJson = await recRes.json();
      setRecent(recJson.recent || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const packsOpenedToday = stats?.packsOpenedToday ?? 0;
  const totalCards = stats?.totalCards ?? 0;
  const uniqueCards = stats?.uniqueCards ?? 0;
  const legendary = stats?.legendary ?? 0;
  const completion = stats?.completion ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white pb-24">
      <Navbar />

      {/* Page container */}
      <div className="max-w-6xl mx-auto pt-28 px-4 md:px-6">

        {/* Greeting */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hey, <span className="text-green-400">{user.displayName}</span>
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome to your FrogTCG collector hub.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-lg">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
            <span className="text-sm text-gray-300">
              Twitch linked as{" "}
              <span className="font-semibold text-white">
                {user.displayName}
              </span>
            </span>
          </div>
        </header>

        {/* Stats bar */}
        <section className="mb-10">
          <StatsBar
            totalCards={totalCards}
            uniqueCards={uniqueCards}
            legendary={legendary}
            completion={completion}
          />
        </section>

        {/* Main tiles */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Open Packs (info tile – Twitch only) */}
          <DashboardTile
            title="Open Packs"
            subtitle="Use Twitch channel points only"
            highlight={`${packsOpenedToday} opened today`}
            variant="primary"
            comingSoon={false}
            onClick={() => {
              // Just explain usage for now
              alert(
                "Packs are opened via Twitch channel point rewards. When a viewer redeems, your OBS overlay will show the pack animation and cards are added automatically."
              );
            }}
          />

          {/* Binder */}
          <DashboardTile
            title="View Binder"
            subtitle="See your full 3×3 binder pages"
            highlight={`${uniqueCards} unique cards`}
            to="/binder"
            variant="secondary"
          />

          {/* Trade / Social – Coming Soon */}
          <DashboardTile
            title="Trade & Social"
            subtitle="Future: trading, showcases, leaderboards"
            highlight="Coming soon"
            disabled
            comingSoon
            variant="outline"
          />
        </section>

        {/* Recent pulls */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Pulls</h2>
            {/* Could add filters later */}
          </div>

          {loading && (
            <p className="text-gray-500 text-sm">Loading your pulls...</p>
          )}

          {!loading && recent.length === 0 && (
            <p className="text-gray-500 text-sm">
              No pulls yet — open your first pack on stream to see them here!
            </p>
          )}

          {!loading && recent.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
              {recent.map((entry, idx) => (
                <RecentPullCard key={idx} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
