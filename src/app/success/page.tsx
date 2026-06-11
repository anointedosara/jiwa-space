"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";
  const title = params.get("title") || "Success";
  const subtitle = params.get("subtitle") || "";

  return (
    <main className="screen screen-narrow flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="grid h-32 w-32 place-items-center rounded-full bg-[#d8c4a8] text-[var(--color-accent-dark)] animate-fade-in">
        <CheckIcon size={64} />
      </div>
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="mt-4 w-full max-w-sm">
        <Button variant="outline" onClick={() => router.replace(next)}>
          Back
        </Button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
