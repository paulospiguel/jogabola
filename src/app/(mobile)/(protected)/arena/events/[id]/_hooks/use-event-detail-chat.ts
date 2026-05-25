import { useEffect, useRef, useState } from "react";
import {
  CURRENT_CHAT_USER,
  type EventChatMessage,
  INITIAL_CHAT_MESSAGES,
} from "../_fixtures/event-detail-mock";

interface UseEventDetailChatOptions {
  active: boolean;
  locale: string;
}

export function useEventDetailChat({
  active,
  locale,
}: UseEventDetailChatOptions) {
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (active) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [active]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: EventChatMessage = {
      id: chatMessages.length + 1,
      ...CURRENT_CHAT_USER,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      self: true,
    };

    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage("");
  };

  return {
    chatEndRef,
    chatMessages,
    handleSendMessage,
    inputMessage,
    setInputMessage,
  };
}
