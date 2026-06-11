import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex-1 pb-2">{children}</div>
      <BottomNav />
    </div>
  );
}
