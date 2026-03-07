"use client";

export default function AuthTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex bg-[#0d1f12] rounded-full p-1 mb-6">
      <TabButton
        label="Login"
        isActive={activeTab === "login"}
        onClick={() => onTabChange("login")}
      />
      <TabButton
        label="Sign Up"
        isActive={activeTab === "signup"}
        onClick={() => onTabChange("signup")}
      />
    </div>
  );
}

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
        isActive
          ? "bg-[#1a3a22] text-green-400 shadow-inner"
          : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
