import TopNav from "../ui/TopNav.jsx";
import SideNav from "../ui/SideNav.jsx";

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bg-deep via-bg-deep to-black">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <SideNav />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
