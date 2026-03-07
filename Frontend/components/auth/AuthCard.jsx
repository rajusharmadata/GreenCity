"use client";

import { useState } from "react";
import AuthTabs from "./AuthTabs";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

export default function AuthCard() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="bg-[#0f2417]/80 border border-green-900/30 rounded-2xl p-8 w-full max-w-md mx-auto backdrop-blur-sm">
      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "login" ? <LoginForm /> : <SignUpForm />}
    </div>
  );
}
