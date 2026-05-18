import { Suspense } from "react";
import ResponsibleView from "@/components/responsible/ResponsibleView";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "ກຳນົດຄວາມຮັບຜິດຊອບ",
};

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand))" }} />
    </div>
  );
}

export default function ResponsiblePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResponsibleView />
    </Suspense>
  );
}
