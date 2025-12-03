import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Overview" },
  { to: "/binder", label: "Binder" },
  { to: "/community", label: "Community" },
  { to: "/admin", label: "Admin" },
];

export default function SideNav() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 border-r border-white/5 bg-gradient-to-b from-bg-elevated to-bg-deep/90">
      <div className="flex-1 px-4 py-6 space-y-6">
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-frog-green/10 text-frog-green border border-frog-green/40 shadow-glow-green"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5",
                ].join(" ")
              }
            >
              <span>{link.label}</span>
              {/* small dot */}
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-10 rounded-xl bg-gradient-to-tr from-frog-green/10 via-frog-purple/10 to-transparent border border-white/5 p-3 text-xs text-gray-300">
          <div className="font-semibold text-sm mb-1">Next milestone</div>
          <p>Hook EventSub to the pack widget & animate packs live on stream.</p>
        </div>
      </div>
    </aside>
  );
}
