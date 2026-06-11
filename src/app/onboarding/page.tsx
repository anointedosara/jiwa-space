"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoWord } from "@/components/Logo";
import { Button } from "@/components/ui";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1200&q=75",
    title: "Live Space\nFor You.",
    body: "Discover Live spaces that suits you the best. Stay with ease, live relaxed, and search with Jiva.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75",
    title: "Live Space\nFor You.",
    body: "Discover Live spaces that suits you the best. Stay with ease, live relaxed, and search with Jiva.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex justify-center py-5 lg:py-7">
        <LogoWord size={18} markSize={22} />
      </header>

      {/* Mobile: stacked. Desktop: two-column split that fills the screen. */}
      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:w-full lg:max-w-6xl lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10 lg:py-8">
        {/* Image */}
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="screen screen-narrow mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl lg:max-w-none lg:px-0"
          aria-label="Next image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt=""
            className="h-full w-full rounded-3xl object-cover transition"
          />
        </button>

        {/* Content */}
        <div className="screen screen-narrow flex flex-1 flex-col lg:max-w-none lg:px-0">
          <h1 className="mt-7 whitespace-pre-line text-center font-display text-4xl font-semibold leading-tight lg:mt-0 lg:text-left lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-center text-sm text-[var(--color-muted)] lg:mx-0 lg:mt-5 lg:max-w-md lg:text-left lg:text-lg">
            {slide.body}
          </p>

          <div className="mt-5 flex justify-center gap-2 lg:mt-7 lg:justify-start">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-[var(--color-accent)]"
                    : "w-2 bg-[var(--color-border)]"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 py-6 lg:mt-10 lg:max-w-sm lg:flex-row lg:py-0">
            <Button variant="outline" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button variant="outline" onClick={() => router.push("/signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
