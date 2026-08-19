import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/10">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-extrabold text-white tracking-tight">404</div>
          <h2 className="text-lg font-bold text-slate-200">Resource Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The workspace module or record you requested could not be located or you may not have
            authorized access.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="gradient" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
