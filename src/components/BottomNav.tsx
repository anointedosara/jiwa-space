"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CompassIcon, ChatIcon, UserIcon } from "./icons";

const tabs = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/discover", label: "Discover", Icon: CompassIcon },
  { href: "/chat", label: "Chat", Icon: ChatIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/95 backdrop-blur">
      <div className="screen screen-wide flex items-center justify-around py-2.5">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] transition ${
                active
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
