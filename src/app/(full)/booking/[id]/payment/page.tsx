"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { ChevronLeft } from "@/components/icons";
import { Button, Field, Input, ErrorText } from "@/components/ui";
import { formatPrice, type Space } from "@/lib/types";

type Booking = { spaceId: string; dates: string[]; nights: number };

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [guest, setGuest] = useState({
    name: "",
    phone: "",
    members: "",
    idCard: "",
  });
  const [card, setCard] = useState({ number: "", cvv: "" });

  useEffect(() => {
    fetch(`/api/spaces/${id}`)
      .then((r) => r.json())
      .then((d) => setSpace(d.space ?? null));
    try {
      const raw = sessionStorage.getItem("jiva_booking");
      if (raw) setBooking(JSON.parse(raw));
    } catch {}
  }, [id]);

  const nights = booking?.nights ?? 1;
  const total = space ? space.price * nights : 0;

  function next() {
    setError("");
    if (!guest.name.trim() || !guest.phone.trim()) {
      setError("Please fill in your name and phone number.");
      return;
    }
    setStep(2);
  }

  async function pay() {
    setError("");
    if (card.number.replace(/\s/g, "").length < 12 || card.cvv.length < 3) {
      setError("Enter a valid card number and CVV.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: id,
          dates: booking?.dates ?? [],
          guestInfo: guest,
          payment: { name: guest.name, cardNumber: card.number },
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      sessionStorage.removeItem("jiva_booking");
      const url =
        "/success?next=/home&title=" +
        encodeURIComponent("Successfully\nBooked a Space!") +
        "&subtitle=" +
        encodeURIComponent("Thanks for putting your trust on us, we hope you enjoyed it!");
      router.replace(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col pb-24">
      <div className="screen screen-narrow flex-1">
        <header className="flex items-center gap-3 py-3">
          <button
            onClick={() => (step === 2 ? setStep(1) : router.back())}
            aria-label="Back"
            className="text-[var(--color-accent)]"
          >
            <ChevronLeft />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2 pr-6">
            <LogoMark size={20} />
            <span className="font-display text-lg font-semibold">Payment Method</span>
          </div>
        </header>

        {step === 1 ? (
          <div className="mt-4 space-y-4">
            <Field label="Full Name">
              <Input
                placeholder="Hasbi Kinclaid"
                value={guest.name}
                onChange={(e) => setGuest({ ...guest, name: e.target.value })}
              />
            </Field>
            <Field label="Active Phone Number">
              <Input
                placeholder="+62 85711180040"
                value={guest.phone}
                onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
              />
            </Field>
            <Field label="How Much Member">
              <Input
                placeholder="2 Member"
                value={guest.members}
                onChange={(e) => setGuest({ ...guest, members: e.target.value })}
              />
            </Field>
            <Field label="ID Card Number">
              <Input
                placeholder="349812470598137"
                value={guest.idCard}
                onChange={(e) => setGuest({ ...guest, idCard: e.target.value })}
              />
            </Field>
            <ErrorText>{error}</ErrorText>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {/* Card preview */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-accent)]/50 bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)] p-5">
              <p className="font-display text-lg">{guest.name || "Hasbi Arindra"}</p>
              <div className="mt-10 flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-accent)]">
                    Master card
                  </p>
                  <p className="text-sm tracking-widest text-[var(--color-muted)]">
                    {(card.number.replace(/\s/g, "").slice(0, 3) || "465") +
                      " ••• ••• " +
                      (card.number.replace(/\s/g, "").slice(-4) || "9018")}
                  </p>
                </div>
                <div className="flex">
                  <span className="h-7 w-7 rounded-full bg-red-500/80" />
                  <span className="-ml-3 h-7 w-7 rounded-full bg-yellow-500/80" />
                </div>
              </div>
            </div>

            <Field label="Card Number">
              <Input
                inputMode="numeric"
                placeholder="465 323 123 9018"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
              />
            </Field>
            <Field label="CVV">
              <Input
                inputMode="numeric"
                placeholder="3031"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value })}
              />
            </Field>
            <ErrorText>{error}</ErrorText>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/95 backdrop-blur">
        <div className="screen screen-narrow flex items-center justify-between gap-4 py-3">
          <p className="text-sm">
            <span className="font-semibold text-[var(--color-text)]">
              {space ? formatPrice(space.currency, total) : "—"}
            </span>{" "}
            <span className="text-[var(--color-muted)]">/ total</span>
          </p>
          {step === 1 ? (
            <Button fullWidth={false} className="px-8" onClick={next}>
              Payment Method
            </Button>
          ) : (
            <Button fullWidth={false} className="px-8" loading={submitting} onClick={pay}>
              Process Payment
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
