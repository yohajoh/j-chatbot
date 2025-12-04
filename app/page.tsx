"use client";

import { useRef, useEffect } from "react";

import { useChat } from "./context/ChatContext";
import useDefaultValueAndTheme from "./hooks/useDefaultValueAndTheme";
import Header from "./components/Header";
import ChatArea from "./components/ChatArea";
import ApiStatus from "./components/ApiStatus";
import ModelSelect from "./components/ModelSelect";

export default function ChatPage() {
  const { messages, checkApiStatus } = useChat();

  const { themeStyles } = useDefaultValueAndTheme();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    checkApiStatus();
  }, []);

  return (
    <div
      className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${themeStyles.bgPrimary}`}
    >
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="flex flex-col lg:flex-row gap-6">
          <ChatArea inputRef={inputRef} messagesEndRef={messagesEndRef} />
          <div className="lg:w-80 space-y-6">
            <ApiStatus />
            <ModelSelect />
          </div>
        </div>
      </div>
    </div>
  );
}
