import {
  Bot,
  CheckCircle,
  Copy,
  Key,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import useDefaultValueAndTheme from "../hooks/useDefaultValueAndTheme";
import { RefObject } from "react";

export default function ChatArea({
  messagesEndRef,
  inputRef,
}: {
  messagesEndRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const {
    input,
    messages,
    isDarkMode,
    isLoading,
    copyToClipboard,
    copiedId,
    isStreaming,
    selectedModel,
    error,
    dispatch,
    sendMessage,
    handleKeyDown,
    regenerateResponse,
  } = useChat();
  const { themeStyles } = useDefaultValueAndTheme();
  return (
    <div className="flex-1">
      <div
        className={`rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-180px)] border transition-colors duration-300 ${themeStyles.bgCard} ${themeStyles.border}`}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 transition-colors duration-300 ${
                  message.role === "user"
                    ? themeStyles.msgUser
                    : themeStyles.msgAssistant
                } ${themeStyles.border} ${
                  message.role === "assistant" ? "border" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      message.role === "user"
                        ? isDarkMode
                          ? "bg-blue-500"
                          : "bg-blue-400"
                        : isDarkMode
                        ? "bg-purple-500"
                        : "bg-purple-400"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      message.role === "user"
                        ? "text-white"
                        : themeStyles.textPrimary
                    }`}
                  >
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span
                    className={`text-sm transition-colors duration-300 ${themeStyles.textTertiary}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className={`ml-auto transition-colors duration-300 ${themeStyles.textTertiary} hover:${themeStyles.textPrimary}`}
                    title="Copy"
                  >
                    {copiedId === message.id ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div
                  className={`whitespace-pre-wrap break-words leading-relaxed transition-colors duration-300 ${
                    message.role === "user"
                      ? "text-white"
                      : themeStyles.textPrimary
                  }`}
                >
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line.startsWith("**") && line.endsWith("**") ? (
                        <strong
                          className={`text-lg transition-colors duration-300 ${
                            message.role === "user"
                              ? "text-white"
                              : themeStyles.textPrimary
                          }`}
                        >
                          {line.slice(2, -2)}
                        </strong>
                      ) : line.startsWith("`") && line.endsWith("`") ? (
                        <code
                          className={`px-2 py-1 rounded text-sm font-mono transition-colors duration-300 ${
                            isDarkMode
                              ? "bg-gray-800 text-gray-100"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {line.slice(1, -1)}
                        </code>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading &&
            isStreaming &&
            messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div
                  className={`rounded-2xl p-5 max-w-[75%] transition-colors duration-300 ${themeStyles.msgAssistant} ${themeStyles.border} border`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div
                        className={`h-2 w-2 rounded-full animate-bounce ${
                          isDarkMode ? "bg-blue-400" : "bg-blue-500"
                        }`}
                      ></div>
                      <div
                        className={`h-2 w-2 rounded-full animate-bounce ${
                          isDarkMode ? "bg-blue-400" : "bg-blue-500"
                        }`}
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className={`h-2 w-2 rounded-full animate-bounce ${
                          isDarkMode ? "bg-blue-400" : "bg-blue-500"
                        }`}
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span
                      className={`transition-colors duration-300 ${themeStyles.textSecondary}`}
                    >
                      Thinking with {selectedModel}...
                    </span>
                  </div>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div
            className={`mx-4 mt-4 p-4 rounded-xl transition-colors duration-300 ${themeStyles.errorBg} ${themeStyles.errorBorder} border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span
                  className={`font-medium transition-colors duration-300 ${themeStyles.errorText}`}
                >
                  Error
                </span>
              </div>
              <button
                onClick={() => dispatch!({ type: "error", payload: null })}
                className={`transition-colors duration-300 ${
                  themeStyles.errorText
                } hover:${isDarkMode ? "text-red-300" : "text-red-700"}`}
              >
                ×
              </button>
            </div>
            <p
              className={`text-sm mt-2 transition-colors duration-300 ${themeStyles.errorText}`}
            >
              {error}
            </p>
            <div className="mt-3">
              <a
                href="https://console.groq.com"
                target="_blank"
                className={`inline-flex items-center gap-2 text-sm transition-colors duration-300 ${
                  isDarkMode
                    ? "text-blue-300 hover:text-blue-200"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <Key className="h-3 w-3" />
                Get FREE API Key →
              </a>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div
          className={`border-t p-4 md:p-6 transition-colors duration-300 ${themeStyles.border}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputRef);
            }}
            className="space-y-4"
          >
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  dispatch!({ type: "input", payload: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, inputRef)}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                className={`flex-1 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 resize-none min-h-[60px] max-h-[120px] transition-colors duration-300 placeholder-gray-500 ${
                  isDarkMode
                    ? "bg-gray-900/50 border-gray-700/50 text-white focus:ring-blue-500 focus:border-transparent"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                } border`}
                disabled={isLoading}
                rows={2}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`self-end p-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.btnSend}`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={regenerateResponse}
                  disabled={isLoading || messages.length <= 1}
                  className={`flex items-center gap-2 transition-colors duration-300 disabled:opacity-50 ${themeStyles.textTertiary} hover:${themeStyles.textPrimary}`}
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isStreaming}
                      onChange={(e) =>
                        dispatch!({
                          type: "isStreaming",
                          payload: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`h-5 w-9 rounded-full transition-colors duration-300 ${
                        isStreaming
                          ? isDarkMode
                            ? "bg-blue-500"
                            : "bg-blue-400"
                          : isDarkMode
                          ? "bg-gray-700"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                          isStreaming ? "translate-x-4" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${themeStyles.textTertiary}`}
                  >
                    Streaming
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
