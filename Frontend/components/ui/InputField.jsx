"use client";

import { useState } from "react";

export function EmailInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-300">Email Address</label>
      <div className="flex items-center gap-3 bg-[#0d1f12] border border-green-900/40 rounded-lg px-4 py-3 focus-within:border-green-500/60 transition-colors duration-200">
        <MailIcon />
        <input
          type="email"
          value={value}
          onChange={onChange}
          placeholder="name@greencity.com"
          className="flex-1 bg-transparent text-gray-300 placeholder-gray-600 text-sm outline-none"
        />
      </div>
    </div>
  );
}

export function PasswordInput({ value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">Password</label>
        <button className="text-sm text-green-400 hover:text-green-300 transition-colors">
          Forgot Password?
        </button>
      </div>
      <div className="flex items-center gap-3 bg-[#0d1f12] border border-green-900/40 rounded-lg px-4 py-3 focus-within:border-green-500/60 transition-colors duration-200">
        <LockIcon />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="flex-1 bg-transparent text-gray-300 placeholder-gray-600 text-sm outline-none"
        />
        <button
          onClick={() => setVisible(!visible)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          type="button"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  );
}
