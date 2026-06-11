"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/onboarding"), 1900);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="animate-pulse-ring">
        <LogoMark size={96} />
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-wide animate-fade-in">
        Jiva Space
      </h1>
    </main>
  );
}
