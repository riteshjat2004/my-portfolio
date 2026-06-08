import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function AnalyticsCard() {
  return (
    <Link href="/admin/analytics">
      <div className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/10">
        
        <div className="flex items-center gap-3">
          <BarChart3
            size={30}
            className="text-cyan-400"
          />

          <h3 className="text-2xl font-semibold text-white">
            Analytics
          </h3>
        </div>

        <p className="mt-4 leading-7 text-zinc-400">
          Monitor visitors, resume downloads,
          project engagement and contact activity.
        </p>

        <div className="mt-6">
          <span className="font-medium text-cyan-400 hover:text-cyan-300">
            View Analytics →
          </span>
        </div>
      </div>
    </Link>
  );
}