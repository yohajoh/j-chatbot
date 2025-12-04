import { Moon, Sun } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function ThemeToggler() {
  const { dispatch, isDarkMode } = useChat();
  return (
    <button
      onClick={() => dispatch!({ type: "isDarkMode" })}
      className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800 hover:bg-gray-700 text-yellow-300"
          : "bg-gray-200 hover:bg-gray-300 text-blue-600"
      }`}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
