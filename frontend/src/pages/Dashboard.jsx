import { useUser } from "../useUser";

export default function Dashboard() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    window.location.href = "/";
    return null;
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Welcome, {user.displayName}</h1>

      <img 
        src={user.profileImage} 
        alt="pfp" 
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "3px solid #4ade80",
          marginTop: 10
        }}
      />

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
        <button>🎁 Open Pack</button>
        <button>📘 Binder</button>
        <button>🏆 Leaderboard</button>
      </div>
    </div>
  );
}
