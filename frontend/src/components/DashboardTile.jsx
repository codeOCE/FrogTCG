import { Link } from "react-router-dom";

export default function DashboardTile({
  title,
  subtitle,
  highlight,
  to,
  onClick,
  disabled = false,
  comingSoon = false,
  variant = "primary"
}) {
  const baseStyle =
    "relative rounded-xl p-5 border backdrop-blur-xl transition-all duration-200 shadow-lg hover:scale-[1.03]";

  const variants = {
    primary:
      "bg-green-500/20 border-green-500/40 hover:border-green-300/60 hover:bg-green-500/30",
    secondary:
      "bg-blue-500/20 border-blue-500/40 hover:border-blue-300/60 hover:bg-blue-500/30",
    outline:
      "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
  };

  const disabledStyle = disabled
    ? "opacity-40 cursor-not-allowed hover:scale-100"
    : "";

  const inner = (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-300 text-sm">{subtitle}</p>

      {highlight && (
        <p className="text-xs mt-2 text-gray-400 italic">{highlight}</p>
      )}

      {comingSoon && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-md font-semibold">
          Coming Soon
        </div>
      )}
    </div>
  );

  if (to && !disabled) {
    return (
      <Link
        to={to}
        className={`${baseStyle} ${variants[variant]} ${disabledStyle}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseStyle} ${variants[variant]} ${disabledStyle} w-full text-left`}
    >
      {inner}
    </button>
  );
}
