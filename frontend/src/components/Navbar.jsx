import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="w-full backdrop-blur-xl bg-white/10 border-b border-white/10 shadow-md py-3 px-6 flex items-center justify-between fixed top-0 z-50">
      
      {/* Left — Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <img
          src="/frog-logo.png"
          alt="FrogTCG Logo"
          className="w-10 h-10 drop-shadow-lg group-hover:scale-110 transition"
        />
        <h1 className="text-xl font-semibold text-white tracking-wide group-hover:text-green-300 transition">
          FrogTCG
        </h1>
      </Link>

      {/* Right — Auth + Links */}
      <div className="flex items-center gap-6">

        <Link to="/binder" className="text-white/90 hover:text-green-300 transition font-medium">
          Binder
        </Link>

        <Link to="/dashboard" className="text-white/90 hover:text-green-300 transition font-medium">
          Dashboard
        </Link>

        {/* Logged out */}
        {!user && (
          <button
            onClick={login}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg shadow-md transition"
          >
            Login with Twitch
          </button>
        )}

        {/* Logged in */}
        {user && (
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-white/20 shadow-md"
            />
            <span className="text-white font-medium hidden md:block">
              {user.displayName}
            </span>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg shadow transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
