import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 flex flex-col items-center gap-4">
      {/* Sustainability Icons */}
      <div className="flex items-center gap-5 text-gray-500">
        <LeafIcon />
        <BoltIcon />
        <RecycleIcon />
      </div>
      <p className="text-xs tracking-[0.2em] text-gray-500 uppercase">
        Certified Sustainable Infrastructure
      </p>
    </footer>
  );
}

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.2 3.1 21.1L4.6 22c1-1.8 1.8-3.5 2.7-5C9.5 17.7 12 17 15 16c3.3-1 6.5-2.5 7-7 .1-1-.1-2-.4-3-1.2.9-2.6 1.5-4.6 2z"/>
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.09 12.26c-.34.43-.03 1.07.5 1.07H11l-1 8.74c-.07.52.67.75.95.29L20.91 11.74c.34-.43.03-1.07-.5-1.07H14l1-8.74c.07-.52-.67-.75-.95-.29z"/>
    </svg>
  );
}

function RecycleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm-1 9V9l5 3z"/>
    </svg>
  );
}
