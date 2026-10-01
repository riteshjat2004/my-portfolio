import Navbar from "@/components/navigation/Navbar";
import Footer from "@/sections/footer/Footer";
import DevVaultSkeleton from "@/components/devvault/DevVaultSkeleton";

export default function DevVaultLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-12 py-12">
        <DevVaultSkeleton />
      </main>

      <Footer />
    </div>
  );
}
