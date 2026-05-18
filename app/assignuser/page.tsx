import { Suspense } from "react";
import AssignUserView from "@/components/assignuser/AssignUserView";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "ມອບໝາຍຜູ້ເຂົ້າຮ່ວມ",
};

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand))" }} />
    </div>
  );
}

export default function AssignUserPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AssignUserView />
    </Suspense>
  );
}
