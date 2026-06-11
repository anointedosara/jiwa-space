"use client";

import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  loading,
  fullWidth = true,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const styles: Record<string, string> = {
    primary:
      "bg-[var(--color-accent)] text-[#231310] hover:bg-[var(--color-accent-dark)] font-semibold",
    outline:
      "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]",
    ghost: "text-[var(--color-muted)] hover:text-[var(--color-text)]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${
        fullWidth ? "w-full" : ""
      } ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

type FieldProps = {
  label?: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm text-[var(--color-text)]">
          {label}
        </span>
      )}
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-[var(--color-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] ${className}`}
      {...props}
    />
  );
});

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {children}
    </p>
  );
}
