"use client";

import React, {
  createContext,
  KeyboardEvent,
  RefObject,
  useContext,
  useReducer,
} from "react";
import { Action, AppContextType, Message, State } from "../types";

const ChatContext = createContext<AppContextType | undefined>(undefined);

const initialState: State = {
  input: "",
  messages: [
    {
      id: "1",
      role: "assistant",
      content: "🚀 **Welcome to J-Chatbot!**",
      timestamp: new Date(),
    },
  ],
  isLoading: false,
  error: null,
  apiStatus: {
    online: false,
    model: "Groq Cloud",
    service: "Checking...",
  },
  isStreaming: true,
  selectedModel: "llama-3.3-70b-versatile",
  copiedId: null,
  isDarkMode: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "input":
      return { ...state, input: action.payload };
    case "isDarkMode":
      return { ...state, isDarkMode: !state.isDarkMode };
    case "isLoading":
      return { ...state, isLoading: !state.isLoading };
    case "isStreaming":
      return { ...state, isStreaming: action.payload };
    case "error":
      return { ...state, error: action.payload };
    case "apiStatus":
      return { ...state, apiStatus: action.payload };
    case "messages":
      return { ...state, messages: [...state.messages, action.payload] };
    case "selectedModel":
      return { ...state, selectedModel: action.payload };
    case "copiedId":
      return { ...state, copiedId: action.payload };
    case "clearChat":
      return { ...state, messages: action.payload };
    case "UPDATE_LAST_MESSAGE_CONTENT": {
      const newMessages = [...state.messages];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === "assistant") {
          lastMsg.content = action.payload;
        }
      }
      return {
        ...state,
        messages: newMessages,
      };
    }
    case "REMOVE_EMPTY_LAST_MESSAGE": {
      const prevMessages = state.messages;
      if (prevMessages.length === 0) {
        return state;
      }
      const lastMsg = prevMessages[prevMessages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content === "") {
        return {
          ...state,
          messages: prevMessages.slice(0, -1),
        };
      }
      return state;
    }
    case "REGENERATE_PREP": {
      const messagesCome = action.payload;
      if (messagesCome.length < 2) {
        return state;
      }
      const messagesWithoutLast = messagesCome.slice(0, -1);
      const lastUserMessage =
        messagesWithoutLast[messagesWithoutLast.length - 1];
      let newInput = state.input;
      if (lastUserMessage && lastUserMessage.role === "user") {
        newInput = lastUserMessage.content;
      }
      return {
        ...state,
        messages: messagesWithoutLast,
        input: newInput,
      };
    }
    default:
      return state;
  }
}

function ChatProvider({ children }: { children: React.ReactNode }) {
  const [
    {
      input,
      messages,
      isLoading,
      error,
      apiStatus,
      isStreaming,
      selectedModel,
      copiedId,
      isDarkMode,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/chat");
      if (response.ok) {
        const data = await response.json();
        dispatch!({
          type: "apiStatus",
          payload: {
            online: data.status?.includes("Ready") || false,
            model: data.default_model || "Groq Cloud",
            service: data.service || "Groq Cloud AI",
          },
        });
        dispatch!({ type: "error", payload: null });
      } else {
        dispatch!({
          type: "apiStatus",
          payload: {
            online: false,
            model: "Error",
            service: `HTTP ${response.status}`,
          },
        });
      }
    } catch (err) {
      console.error("API Status Error:", err);
      dispatch!({
        type: "apiStatus",
        payload: {
          online: false,
          model: "Offline",
          service: "Unable to connect",
        },
      });
    }
  };

  const sendMessage = async (
    inputRef: RefObject<HTMLTextAreaElement | null>
  ) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    dispatch!({ type: "messages", payload: userMessage });
    dispatch!({ type: "error", payload: null });
    dispatch!({ type: "input", payload: "" });
    dispatch!({ type: "isLoading" });

    if (isStreaming) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      dispatch!({ type: "messages", payload: assistantMessage });
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          stream: isStreaming,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (isStreaming) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantMessage = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          dispatch!({
            type: "UPDATE_LAST_MESSAGE_CONTENT",
            payload: assistantMessage,
          });
        }
      } else {
        const data = await response.json();
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
        };
        dispatch!({ type: "messages", payload: assistantMessage });
      }

      // Update API status after successful message
      await checkApiStatus();
    } catch (err: unknown) {
      console.error("Error:", err);

      // Parse error message safely without using `any`
      let errorMsg = "Unknown error";
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === "string") {
        errorMsg = err;
      } else {
        try {
          errorMsg = JSON.stringify(err);
        } catch {
          errorMsg = String(err);
        }
      }

      try {
        const parsed = JSON.parse(String(errorMsg));
        if (parsed && typeof parsed === "object" && "error" in parsed) {
          const parsedObj = parsed as Record<string, unknown>;
          const errProp = parsedObj["error"];
          if (errProp && typeof errProp === "object") {
            const errPropObj = errProp as Record<string, unknown>;
            const msg = errPropObj["message"];
            if (typeof msg === "string") {
              errorMsg = msg;
            }
          }
        }
      } catch (e) {
        // Not JSON
      }

      dispatch!({ type: "error", payload: errorMsg });

      if (isStreaming) {
        // This is the dispatch call you would use in your component:
        dispatch!({
          type: "REMOVE_EMPTY_LAST_MESSAGE",
        });
      }

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🔧 **Setup Required**\n\nTo use this chatbot:\n\n1. **Get FREE key**: https://console.groq.com\n2. **Add to .env.local**:\n   \`GROQ_API_KEY=your_key_here\`\n3. **Restart server**: \`pnpm dev\`\n\n100% FREE, no credit card!`,
        timestamp: new Date(),
      };

      if (!isStreaming) {
        dispatch!({ type: "messages", payload: errorMessage });
      }
    } finally {
      dispatch!({ type: "isLoading" });
      inputRef.current?.focus();
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch!({ type: "copiedId", payload: id });
      setTimeout(() => dispatch!({ type: "copiedId", payload: null }), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const clearChat = () => {
    dispatch!({
      type: "clearChat",
      payload: [
        {
          id: "1",
          role: "assistant",
          content: "Chat cleared! Ready to help. 😊",
          timestamp: new Date(),
        },
      ],
    });
    dispatch!({ type: "error", payload: null });
  };

  const regenerateResponse = () => {
    if (messages.length < 2) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      dispatch!({
        type: "REGENERATE_PREP",
        payload: messages,
      });
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
    inputRef: RefObject<HTMLTextAreaElement | null>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputRef);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        input,
        messages,
        isLoading,
        error,
        apiStatus,
        isStreaming,
        selectedModel,
        copiedId,
        isDarkMode,
        checkApiStatus,
        sendMessage,
        copyToClipboard,
        clearChat,
        regenerateResponse,
        handleKeyDown,
        dispatch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

function useChat() {
  const content = useContext(ChatContext);

  if (!content)
    throw new Error("Does not allowed to use out side of the provider.");

  return content;
}

export { ChatProvider, useChat };
