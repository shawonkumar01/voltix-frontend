import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import OAuthCallback from "./OAuthCallback";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-white/40">Authenticating...</p>
        </div>
      </div>
    }>
      <OAuthCallback />
    </Suspense>
  );
}