import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function FullLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/onboarding");
  return <div className="flex min-h-dvh flex-1 flex-col">{children}</div>;
}
