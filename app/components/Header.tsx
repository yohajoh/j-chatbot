import { Cpu, Trash2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
import useDefaultValueAndTheme from "../hooks/useDefaultValueAndTheme";
import ThemeToggler from "./ThemeToggler";

export default function Header() {
  const { isDarkMode, apiStatus, selectedModel, clearChat } = useChat();

  const { themeStyles } = useDefaultValueAndTheme();

  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl transition-colors duration-300 ${
              isDarkMode
                ? "bg-gradient-to-r from-purple-600 to-blue-500"
                : "bg-gradient-to-r from-purple-500 to-blue-400"
            }`}
          >
            <Cpu className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1
              className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-r from-purple-400 to-blue-300 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
              }`}
            >
              J-chatbot
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`h-2 w-2 rounded-full ${
                  apiStatus.online ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              ></div>
              <span
                className={`text-sm transition-colors duration-300 ${themeStyles.textSecondary}`}
              >
                {apiStatus.online
                  ? `Connected • ${selectedModel}`
                  : "Setup required"}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-green-900/30 text-green-300"
                    : "bg-green-100 text-green-700"
                }`}
              >
                FREE Tier
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggler />
          <button
            onClick={clearChat}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${themeStyles.btnClear}`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="font-medium">Clear</span>
          </button>
        </div>
      </div>
    </header>
  );
}
