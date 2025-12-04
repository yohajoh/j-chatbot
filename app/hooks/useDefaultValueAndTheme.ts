import { useChat } from "../context/ChatContext";
import { ModelInfo } from "../types";

export default function useDefaultValueAndTheme() {
  const { isDarkMode } = useChat();

  const models: ModelInfo[] = [
    {
      id: "llama-3.3-70b-versatile",
      name: "Llama 3.3 70B",
      description: "Most capable model",
      capability: "high",
    },
    {
      id: "llama-3.2-90b-vision-preview",
      name: "Llama 3.2 90B",
      description: "Large with vision",
      capability: "high",
    },
    {
      id: "llama-3.2-3b-preview",
      name: "Llama 3.2 3B",
      description: "Balanced speed & quality",
      capability: "medium",
    },
    {
      id: "llama-3.2-1b-preview",
      name: "Llama 3.2 1B",
      description: "Fastest response",
      capability: "low",
    },
    {
      id: "gemma2-9b-it",
      name: "Gemma 2 9B",
      description: "Google's efficient model",
      capability: "medium",
    },
    {
      id: "mixtral-8x7b-32768",
      name: "Mixtral 8x7B",
      description: "Multilingual expert",
      capability: "high",
    },
    {
      id: "llama-guard-3-8b",
      name: "Llama Guard 3",
      description: "Safety-focused",
      capability: "medium",
    },
  ];

  // Theme-based styles
  const themeStyles = {
    // Background colors
    bgPrimary: isDarkMode
      ? "bg-gradient-to-br from-gray-900 to-black"
      : "bg-gradient-to-br from-gray-50 to-gray-100",

    bgCard: isDarkMode
      ? "bg-gray-800/50 backdrop-blur-sm"
      : "bg-white/80 backdrop-blur-sm",

    bgInput: isDarkMode ? "bg-gray-900/50" : "bg-gray-100",

    // Text colors
    textPrimary: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-300" : "text-gray-600",
    textTertiary: isDarkMode ? "text-gray-400" : "text-gray-500",

    // Border colors
    border: isDarkMode ? "border-gray-700/50" : "border-gray-300",

    // Button colors
    btnClear: isDarkMode
      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
      : "bg-gray-200 hover:bg-gray-300 text-gray-700",

    btnSend: isDarkMode
      ? "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
      : "bg-gradient-to-r from-purple-500 to-blue-400 hover:from-purple-600 hover:to-blue-500 text-white",

    btnRefresh: isDarkMode
      ? "bg-gray-900/50 hover:bg-gray-800 text-gray-300"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700",

    // Message colors
    msgUser: isDarkMode
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white",

    msgAssistant: isDarkMode
      ? "bg-gray-900/80 text-gray-100"
      : "bg-gray-50 text-gray-900",

    // Status colors
    statusOnline: isDarkMode ? "text-green-400" : "text-green-600",
    statusOffline: isDarkMode ? "text-red-400" : "text-red-600",

    // Error colors
    errorBg: isDarkMode ? "bg-red-900/20" : "bg-red-50",
    errorBorder: isDarkMode ? "border-red-700/50" : "border-red-200",
    errorText: isDarkMode ? "text-red-200" : "text-red-600",

    // Model selection
    modelSelected: isDarkMode
      ? "bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50"
      : "bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300",

    modelNotSelected: isDarkMode
      ? "bg-gray-900/30 hover:bg-gray-900/50 border-gray-700/50"
      : "bg-gray-100 hover:bg-gray-200 border-gray-300",
  };

  const getCapabilityColor = (capability: string) => {
    switch (capability) {
      case "high":
        return isDarkMode ? "bg-purple-500" : "bg-purple-400";
      case "medium":
        return isDarkMode ? "bg-blue-500" : "bg-blue-400";
      case "low":
        return isDarkMode ? "bg-green-500" : "bg-green-400";
      default:
        return isDarkMode ? "bg-gray-500" : "bg-gray-400";
    }
  };

  // Get capability text color
  const getCapabilityTextColor = (capability: string) => {
    switch (capability) {
      case "high":
        return isDarkMode ? "text-purple-400" : "text-purple-600";
      case "medium":
        return isDarkMode ? "text-blue-400" : "text-blue-600";
      case "low":
        return isDarkMode ? "text-green-400" : "text-green-600";
      default:
        return isDarkMode ? "text-gray-400" : "text-gray-600";
    }
  };

  return { models, themeStyles, getCapabilityColor, getCapabilityTextColor };
}
