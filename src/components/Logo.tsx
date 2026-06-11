type LogoProps = {
  size?: number;
  className?: string;
};

/** The concentric-rings "target" mark used throughout Jiva Space. */
export function LogoMark({ size = 28, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="24" cy="24" r="22" stroke="var(--color-accent)" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="15" stroke="var(--color-accent)" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="8" stroke="var(--color-accent)" strokeWidth="2.5" />
    </svg>
  );
}

export function LogoWord({
  size = 22,
  markSize = 24,
  className = "",
}: {
  size?: number;
  markSize?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={markSize} />
      <span
        className="font-display font-semibold tracking-wide"
        style={{ fontSize: size }}
      >
        Jiva Space
      </span>
    </span>
  );
}
