"use client";

import Link from "next/link";

const NAV_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Community", href: "/community" },
];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <GreenCityIcon />
        <span className="text-white font-semibold text-lg tracking-tight">GreenCity</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/support"
          className="text-sm font-semibold text-green-400 border border-green-500/60 rounded-full px-5 py-2 hover:bg-green-500/10 transition-colors duration-200"
        >
          Support
        </Link>
      </div>
    </nav>
  );
}

function GreenCityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L5 8.5V12C5 16.1 8.1 19.9 12 21C15.9 19.9 19 16.1 19 12V8.5L12 2Z"
        fill="#4ade80"
        opacity="0.9"
      />
    </svg>
  );
}
