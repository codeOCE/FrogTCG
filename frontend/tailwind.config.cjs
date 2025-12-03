export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        "bg-deep": "#050912",
        "bg-elevated": "#090f1d",
        "bg-elevated-soft": "#0c1221",

        "frog-green": "#42f59b",
        "frog-green-soft": "#3bd987",
        "frog-purple": "#a855f7",
        "frog-gold": "#fbbf24",

        "rarity-common": "#9ca3af",
        "rarity-uncommon": "#22c55e",
        "rarity-rare": "#3b82f6",
        "rarity-epic": "#a855f7",
        "rarity-legendary": "#f97316",
      },
      boxShadow: {
        "soft-card": "0 18px 45px rgba(0,0,0,0.55)",
        "glow-green": "0 0 25px rgba(66,245,155,0.55)",
        "glow-purple": "0 0 25px rgba(168,85,247,0.55)",
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "Segoe UI", "sans-serif"],
      },
    },
  },

  plugins: [],
};
