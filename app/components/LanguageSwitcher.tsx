"use client";

import { useState } from "react";

interface LanguageSwitcherProps {
  showLanguage: "en" | "zh";
  onLanguageChange: (language: "en" | "zh") => void;
}

export default function LanguageSwitcher({ 
  showLanguage, 
  onLanguageChange 
}: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mt-4 justify-center">
      <button
        onClick={() => onLanguageChange("en")}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          showLanguage === "en"
            ? "bg-indigo-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange("zh")}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          showLanguage === "zh"
            ? "bg-indigo-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        中文
      </button>
    </div>
  );
} 