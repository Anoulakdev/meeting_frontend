import { Suspense } from "react";
import RelatedAssignView from "@/components/relatedassign/RelatedAssignView";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "ມອບໝາຍເອກະສານທີ່ຕິດພັນ",
};

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand))" }} />
    </div>
  );
}

export default function RelatedAssignPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RelatedAssignView />
    </Suspense>
  );
}
