import { useChat } from "../context/ChatContext";
import useDefaultValueAndTheme from "../hooks/useDefaultValueAndTheme";

export default function ApiStatus() {
  const { apiStatus, selectedModel, isDarkMode, checkApiStatus } = useChat();
  const { themeStyles } = useDefaultValueAndTheme();
  return (
    <div
      className={`rounded-2xl p-5 transition-colors duration-300 ${themeStyles.bgCard} ${themeStyles.border} border`}
    >
      <h3
        className={`font-semibold text-lg mb-4 flex items-center gap-2 transition-colors duration-300 ${themeStyles.textPrimary}`}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            apiStatus.online ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`}
        ></div>
        API Status
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span
            className={`transition-colors duration-300 ${themeStyles.textSecondary}`}
          >
            Service
          </span>
          <span className="font-medium">Groq Cloud</span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={`transition-colors duration-300 ${themeStyles.textSecondary}`}
          >
            Status
          </span>
          <span
            className={`font-medium transition-colors duration-300 ${
              apiStatus.online
                ? themeStyles.statusOnline
                : themeStyles.statusOffline
            }`}
          >
            {apiStatus.online ? "Online" : "Setup Required"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={`transition-colors duration-300 ${themeStyles.textSecondary}`}
          >
            Current Model
          </span>
          <span
            className={`font-medium truncate transition-colors duration-300 ${
              isDarkMode ? "text-blue-300" : "text-blue-600"
            }`}
          >
            {selectedModel}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={`transition-colors duration-300 ${themeStyles.textSecondary}`}
          >
            Pricing
          </span>
          <span
            className={`font-medium transition-colors duration-300 ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
          >
            FREE Tier
          </span>
        </div>

        {/* FIXED REFRESH BUTTON */}
        <button
          onClick={checkApiStatus}
          className={`w-full mt-2 py-2 rounded-lg font-medium transition-colors duration-300 ${themeStyles.btnRefresh}`}
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
