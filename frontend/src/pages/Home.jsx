import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user, login } = useAuth();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">

      <Navbar />

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/20 blur-[140px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 text-center px-6">
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-xl">
          Build Your Ultimate
          <span className="text-green-400 block mt-2">Frog TCG Collection</span>
        </h1>

        <p className="max-w-xl mx-auto text-lg text-gray-300 mt-6 leading-relaxed">
          Open packs on stream, collect cards, fill out your online binder,
          and trade with the community — all powered by Twitch integration.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          {!user && (
            <button
              onClick={login}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-black text-lg font-semibold rounded-xl shadow-lg transition"
            >
              Login with Twitch
            </button>
          )}

          {user && (
            <>
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-black text-lg font-semibold rounded-xl shadow-lg transition"
              >
                Go to Dashboard
              </Link>

              <Link
                to="/binder"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-lg font-semibold rounded-xl transition"
              >
                View Binder
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Card Showcase */}
      <section className="mt-10 pb-24 px-6">
        <h2 className="text-center text-3xl font-bold mb-10 drop-shadow">
          Featured Cards
        </h2>

        <div className="flex justify-center gap-6 flex-wrap">
          <img
            src="/placeholder-card.png"
            className="w-40 h-60 rounded-xl shadow-lg hover:scale-105 transition"
          />
          <img
            src="/placeholder-card.png"
            className="w-40 h-60 rounded-xl shadow-lg hover:scale-105 transition"
          />
          <img
            src="/placeholder-card.png"
            className="w-40 h-60 rounded-xl shadow-lg hover:scale-105 transition"
          />
        </div>
      </section>

    </div>
  );
}
