import { CheckCircle } from "lucide-react";
import { useChat } from "../context/ChatContext";
import useDefaultValueAndTheme from "../hooks/useDefaultValueAndTheme";

export default function ModelSelect() {
  const { selectedModel, dispatch } = useChat();
  const { models, themeStyles, getCapabilityColor, getCapabilityTextColor } =
    useDefaultValueAndTheme();
  return (
    <div
      className={`rounded-2xl p-5 transition-colors duration-300 ${themeStyles.bgCard} ${themeStyles.border} border`}
    >
      <h3
        className={`font-semibold text-lg mb-4 transition-colors duration-300 ${themeStyles.textPrimary}`}
      >
        Select Model
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() =>
              dispatch!({ type: "selectedModel", payload: model.id })
            }
            className={`w-full text-left p-3 rounded-xl transition-all duration-300 border ${
              selectedModel === model.id
                ? themeStyles.modelSelected
                : themeStyles.modelNotSelected
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`font-medium truncate transition-colors duration-300 ${themeStyles.textPrimary}`}
              >
                {model.name}
              </div>
              <div
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${getCapabilityColor(
                  model.capability
                )}`}
              ></div>
            </div>
            <div
              className={`text-sm mt-1 truncate transition-colors duration-300 ${themeStyles.textSecondary}`}
            >
              {model.description}
            </div>
            {selectedModel === model.id && (
              <div
                className={`text-xs mt-2 flex items-center gap-1 transition-colors duration-300 ${getCapabilityTextColor(
                  model.capability
                )}`}
              >
                <CheckCircle className="h-3 w-3" />
                Active
              </div>
            )}
          </button>
        ))}
      </div>

      <div
        className={`mt-4 pt-4 border-t transition-colors duration-300 ${themeStyles.border}`}
      >
        <div
          className={`flex items-center gap-2 text-sm transition-colors duration-300 ${themeStyles.textTertiary}`}
        >
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          <span>High capability</span>
          <div className="h-2 w-2 rounded-full bg-blue-500 ml-3"></div>
          <span>Medium</span>
          <div className="h-2 w-2 rounded-full bg-green-500 ml-3"></div>
          <span>Fast</span>
        </div>
      </div>
    </div>
  );
}
