"use client";

import { useState } from "react";
import { EmailInput, PasswordInput } from "../ui/InputField";
import SocialLogin from "./SocialLogin";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <EmailInput
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="w-full bg-green-400 hover:bg-green-300 text-gray-900 font-bold py-3.5 rounded-xl transition-colors duration-200 text-sm tracking-wide mt-1"
      >
        Create Account
      </button>

      <SocialLogin />
    </form>
  );
}
