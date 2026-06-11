"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { SettingsIcon } from "@/components/icons";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

/** Read an image file and downscale it to a small square data URL. */
function fileToAvatar(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=75";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    birthDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const avatar = await fileToAvatar(file);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar }),
      });
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        gender: user.gender ?? "",
        birthDate: user.birthDate ?? "",
      });
    }
  }, [user]);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/onboarding");
  }

  if (loading || !user) return null;

  return (
    <main className="screen screen-narrow py-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={22} />
          <h1 className="font-display text-xl font-semibold">Profile</h1>
        </div>
        <button
          onClick={onLogout}
          className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
          aria-label="Settings"
          title="Log out"
        >
          <SettingsIcon />
        </button>
      </header>

      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative"
          aria-label="Change profile picture"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || DEFAULT_AVATAR}
            alt={user.name}
            className="h-28 w-28 rounded-full border-2 border-[var(--color-accent)] object-cover"
          />
          <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-accent)] text-[#231310]">
            {uploading ? <Spinner size={16} /> : <CameraIcon />}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPickAvatar}
          className="hidden"
        />
        <h2 className="mt-3 font-display text-xl font-semibold">{user.name}</h2>
        <p className="text-sm text-[var(--color-muted)]">{user.role ?? "Customer"}</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-1 text-xs text-[var(--color-accent)]"
        >
          Change profile picture
        </button>
      </div>

      <form onSubmit={save} className="mt-6 space-y-4">
        <Field label="Your Name">
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Phone Number">
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+62 85711180040"
          />
        </Field>
        <Field label="Your Address">
          <Input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Jl. Raya Jonggol-Dayeuh, Bogor 16830"
          />
        </Field>
        <Field label="Gender">
          <Input
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            placeholder="Male"
          />
        </Field>
        <Field label="Birth Of Date">
          <Input
            value={form.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
            placeholder="29/11/1998"
          />
        </Field>

        <Button type="submit" loading={saving}>
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}
