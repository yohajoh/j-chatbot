import { Dispatch, KeyboardEvent, RefObject } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type ApiStatus = {
  online: boolean;
  model: string;
  service: string;
};

export type ModelInfo = {
  id: string;
  name: string;
  description: string;
  capability: "high" | "medium" | "low";
};

export type Action =
  | { type: "input"; payload: string }
  | { type: "isDarkMode" }
  | { type: "isLoading" }
  | { type: "isStreaming"; payload: boolean }
  | { type: "error"; payload: string | null }
  | { type: "apiStatus"; payload: ApiStatus }
  | { type: "messages"; payload: Message }
  | { type: "selectedModel"; payload: string }
  | { type: "copiedId"; payload: string | null }
  | { type: "clearChat"; payload: Message[] }
  | { type: "REMOVE_EMPTY_LAST_MESSAGE" }
  | { type: "UPDATE_LAST_MESSAGE_CONTENT"; payload: string }
  | { type: "REGENERATE_PREP"; payload: Message[] };

export interface State {
  input: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  apiStatus: ApiStatus;
  isStreaming: boolean;
  selectedModel: string;
  copiedId: string | null;
  isDarkMode: boolean;
}

export interface AppContextType extends State {
  dispatch: Dispatch<Action>;
  checkApiStatus: () => void;
  sendMessage: (inputRef: RefObject<HTMLTextAreaElement | null>) => void;
  copyToClipboard: (text: string, id: string) => void;
  clearChat: () => void;
  regenerateResponse: () => void;
  handleKeyDown: (
    e: KeyboardEvent<HTMLTextAreaElement>,
    inputRef: RefObject<HTMLTextAreaElement | null>
  ) => void;
}
