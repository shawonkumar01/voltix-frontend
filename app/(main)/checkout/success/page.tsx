import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SuccessContent from "./SuccessContent";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
