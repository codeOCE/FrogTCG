export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg-deep/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-frog-green to-frog-purple shadow-glow-green flex items-center justify-center text-xl">
            🐸
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.25em] text-gray-400">
              codeOCE
            </div>
            <div className="font-semibold text-gray-50 text-sm">
              FrogTCG Collection
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 transition">
            Stream Widget
          </button>
          <button className="flex items-center gap-2 rounded-full bg-frog-purple px-4 py-2 text-xs font-semibold text-white shadow-glow-purple hover:bg-frog-purple/90 transition">
            <span className="text-lg">TTV</span>
            <span>@codeOCE</span>
          </button>
        </div>
      </div>
    </header>
  );
}
