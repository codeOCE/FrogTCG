export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-deep via-bg-elevated-soft to-bg-deep flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="text-xs uppercase tracking-[0.35em] text-frog-green/80">
          FrogTCG
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-white">
          Amphibian Arcana
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-base text-gray-400">
          Collect, trade, and flex your frog army. Connect your Twitch to start
          tracking every pack opened live on stream.
        </p>
        <button className="inline-flex items-center gap-2 rounded-full bg-frog-purple px-6 py-3 text-sm font-semibold text-white shadow-glow-purple hover:bg-frog-purple/90 transition">
          <span className="text-lg">TTV</span>
          <span>Login with Twitch</span>
        </button>
        <p className="text-[11px] text-gray-500">
          Simulated environment – login is mocked while we build.
        </p>
      </div>
    </div>
  );
}
